import { promises as fs } from "fs";
import { createWriteStream, createReadStream } from "fs";
import path from "path";
import { pipeline } from "stream/promises";
import { GraphQLError } from "graphql";
import { ObjectId } from "mongodb";
import { GraphQLUpload } from "graphql-upload-minimal";
import { MutationResolvers, Resolvers } from "../../graphTypes";
import { AttachmentDbRecord } from "../../dataSources/accountingDb/types";

// Filesystem storage configuration
const STORAGE_PATH = process.env.RECEIPT_STORAGE_PATH || "/tmp/receipts";
const BASE_URL = process.env.RECEIPT_BASE_URL || "http://localhost:4000/receipts";

/**
 * Ensure directory exists, create recursively if needed
 */
async function ensureStorageDir(dirPath: string): Promise<void> {
    try {
        await fs.mkdir(dirPath, { recursive: true, mode: 0o775 });
    } catch (err: any) {
        if (err.code !== "EEXIST") {
            throw err;
        }
    }
}

/**
 * Upload a receipt file to the filesystem (NAS mount)
 */
export const uploadReceipt: Extract<
    MutationResolvers["uploadReceipt"],
    Function
> = async (_, { entryId, file }, { dataSources: { accountingDb }, user }) => {
    // 1. Check permissions
    if (!user) {
        throw new GraphQLError("Unauthorized");
    }

    const { createReadStream, filename, mimetype } = await file;

    // 2. Organize by year/month
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");

    // Create subdirectories: /STORAGE_PATH/2024/02/
    const subDir = path.join(STORAGE_PATH, String(year), month);
    await ensureStorageDir(subDir);

    // 3. Generate unique filename with timestamp
    const uniqueFilename = `${Date.now()}-${filename}`;
    const fullPath = path.join(subDir, uniqueFilename);
    const relativePath = path.join(String(year), month, uniqueFilename);

    // 4. Write file to storage
    const stream = createReadStream();
    await pipeline(stream, createWriteStream(fullPath, { mode: 0o664 }));

    // 5. Get file stats for size
    const stats = await fs.stat(fullPath);

    // 6. Create Attachment Record
    const attachment: AttachmentDbRecord = {
        id: new ObjectId().toHexString(),
        filename,
        filePath: relativePath, // "2024/02/timestamp-file.pdf"
        fullPath, // "/mnt/qnap/receipts/2024/02/timestamp-file.pdf"
        url: `${BASE_URL}/${relativePath}`, // "https://domain.com/receipts/2024/02/..."
        uploadedAt: now,
        uploadedBy: (user as any).email || "unknown",
        fileSize: stats.size,
        mimeType: mimetype,
        deleted: false,
    };

    // 7. Update Entry in database
    await accountingDb.updateOne({
        collection: "entries",
        filter: { _id: new ObjectId(entryId) },
        update: {
            $push: {
                "snapshot.meta.attachments": attachment,
            } as any,
        },
    });

    return { attachment };
};

/**
 * Delete an attachment (soft delete in database)
 */
export const deleteAttachment: Extract<
    MutationResolvers["deleteAttachment"],
    Function
> = async (_, { id }, { dataSources: { accountingDb }, user }) => {
    if (!user) {
        throw new GraphQLError("Unauthorized");
    }

    // 1. Find entry with this attachment
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

    // 2. Mark as deleted in DB (Soft delete)
    await accountingDb.updateOne({
        collection: "entries",
        filter: { _id: entry._id, "snapshot.meta.attachments.id": id },
        update: {
            $set: {
                "snapshot.meta.attachments.$.deleted": true,
            } as any,
        },
    });

    // 3. Optionally delete physical file (currently soft delete only)
    // Uncomment to enable hard delete:
    // try {
    //     await fs.unlink(attachment.fullPath);
    // } catch (err) {
    //     console.error('Failed to delete file:', err);
    // }

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
            // Return non-deleted attachments
            return (
                parent.snapshot?.meta?.attachments?.filter(
                    (a: AttachmentDbRecord) => !a.deleted
                ) || []
            );
        },
    },
};
