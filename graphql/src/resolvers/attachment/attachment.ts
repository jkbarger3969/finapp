import { promises as fs } from "fs";
import { createWriteStream, createReadStream } from "fs";
import path from "path";
import { URL } from "url";
import { pipeline } from "stream/promises";
import { GraphQLError } from "graphql";
import { ObjectId } from "mongodb";
import { GraphQLUpload } from "graphql-upload-minimal";
import { MutationResolvers, Resolvers } from "../../graphTypes";
import { AttachmentDbRecord } from "../../dataSources/accountingDb/types";

const STORAGE_PATH = process.env.RECEIPT_STORAGE_PATH || "/tmp/receipts";
const BASE_URL = process.env.RECEIPT_BASE_URL || "http://localhost:4000/receipts";

async function ensureStorageDir(dirPath: string): Promise<void> {
    try {
        await fs.mkdir(dirPath, { recursive: true, mode: 0o775 });
    } catch (err: any) {
        if (err.code !== "EEXIST") {
            throw err;
        }
    }
}

export const uploadReceipt: Extract<
    MutationResolvers["uploadReceipt"],
    Function
> = async (_, { entryId, file }, { dataSources: { accountingDb }, user, authService, ipAddress, userAgent }) => {
    if (!user) {
        throw new GraphQLError("Unauthorized");
    }

    const { createReadStream, filename, mimetype } = await file;

    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");

    const subDir = path.join(STORAGE_PATH, String(year), month);
    await ensureStorageDir(subDir);

    const uniqueFilename = `${Date.now()}-${filename}`;
    const fullPath = path.join(subDir, uniqueFilename);
    const relativePath = path.join(String(year), month, uniqueFilename);

    const stream = createReadStream();
    await pipeline(stream, createWriteStream(fullPath, { mode: 0o664 }));

    const stats = await fs.stat(fullPath);

    const attachment: AttachmentDbRecord = {
        id: new ObjectId().toHexString(),
        filename,
        filePath: relativePath,
        fullPath,
        url: `${BASE_URL}/${relativePath}`,
        uploadedAt: now,
        uploadedBy: (user as any).email || "unknown",
        fileSize: stats.size,
        mimeType: mimetype,
        deleted: false,
    };

    await accountingDb.updateOne({
        collection: "entries",
        filter: { _id: new ObjectId(entryId) },
        update: {
            $push: {
                "snapshot.meta.attachments": attachment,
            } as any,
        },
    });

    if (authService) {
        await authService.logAudit({
            userId: (user as any).id,
            action: "RECEIPT_UPLOAD",
            resourceType: "Attachment",
            resourceId: new ObjectId(attachment.id),
            details: {
                entryId,
                filename,
                fileSize: stats.size,
                mimeType: mimetype,
            },
            ipAddress,
            userAgent,
            timestamp: new Date(),
        });
    }

    return { attachment };
};

export const deleteAttachment: Extract<
    MutationResolvers["deleteAttachment"],
    Function
> = async (_, { id }, { dataSources: { accountingDb }, user, authService, ipAddress, userAgent }) => {
    if (!user) {
        throw new GraphQLError("Unauthorized");
    }

    const entry = await accountingDb.findOne({
        collection: "entries",
        filter: {
            "snapshot.meta.attachments.id": id,
        },
    });

    if (!entry) {
        throw new GraphQLError("Attachment not found");
    }

    const attachment = (entry as any).snapshot.meta.attachments?.find(
        (a: AttachmentDbRecord) => a.id === id
    );

    if (!attachment) {
        throw new GraphQLError("Attachment not found");
    }

    await accountingDb.updateOne({
        collection: "entries",
        filter: { _id: entry._id, "snapshot.meta.attachments.id": id },
        update: {
            $set: {
                "snapshot.meta.attachments.$.deleted": true,
            } as any,
        },
    });

    if (authService) {
        await authService.logAudit({
            userId: (user as any).id,
            action: "RECEIPT_DELETE",
            resourceType: "Attachment",
            resourceId: new ObjectId(id),
            details: {
                entryId: entry._id.toHexString(),
                filename: attachment.filename,
            },
            ipAddress,
            userAgent,
            timestamp: new Date(),
        });
    }

    return { deletedAttachment: { ...attachment, deleted: true } };
};

export const attachmentResolvers: Resolvers = {
    Upload: GraphQLUpload,
    Mutation: {
        uploadReceipt,
        deleteAttachment,
    },
    Entry: {
        attachments: (parent: any) => {
            const attachments = parent.snapshot?.meta?.attachments?.filter(
                (a: AttachmentDbRecord) => !a.deleted
            ) || [];

            return attachments.map((a: AttachmentDbRecord) => {
                let url = a.url;

                // Prefer generating URL from filePath if available (Relative URL for portability)
                if (a.filePath) {
                    // URL-encode the path components to handle spaces and special characters
                    const encodedPath = a.filePath.split('/').map(part => encodeURIComponent(part)).join('/');
                    url = `/receipts/${encodedPath}`;
                } else if (a.url && a.url.includes("/receipts/")) {
                    // Legacy fallback: try to extract relative path from absolute URL
                    try {
                        // If it's a full URL, parse it
                        if (a.url.startsWith("http")) {
                            const urlObj = new URL(a.url);
                            url = urlObj.pathname;
                        }
                        // URL-encode the path if it contains spaces
                        if (url.includes(' ')) {
                            const parts = url.split('/');
                            url = parts.map(part => part.includes(' ') ? encodeURIComponent(part) : part).join('/');
                        }
                    } catch (e) {
                        // ignore parsing error
                    }
                }

                return {
                    ...a,
                    url,
                };
            });
        },
    },
};
