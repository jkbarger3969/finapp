import { Storage } from "@google-cloud/storage";
import { GraphQLError } from "graphql";
import { ObjectId } from "mongodb";
import { GraphQLUpload } from "graphql-upload";
import { MutationResolvers, Resolvers } from "../../graphTypes";
import { AttachmentDbRecord } from "../../dataSources/accountingDb/types";

// Initialize GCS Storage
// We'll lazy load this or check if env vars are present to avoid startup crashes if not configured
let storage: Storage | null = null;
let bucketName: string | null = null;

const getStorage = () => {
    if (!storage) {
        if (!process.env.GCS_PROJECT_ID || !process.env.GCS_BUCKET_NAME) {
            throw new Error("Google Cloud Storage not configured");
        }
        storage = new Storage({
            projectId: process.env.GCS_PROJECT_ID,
            keyFilename: process.env.GCS_KEY_FILE, // Optional if using default credentials
        });
        bucketName = process.env.GCS_BUCKET_NAME;
    }
    return { storage, bucket: storage.bucket(bucketName!) };
};

export const uploadReceipt: Extract<
    MutationResolvers["uploadReceipt"],
    Function
> = async (_, { entryId, file }, { dataSources: { accountingDb }, user }) => {
    // 1. Check permissions (assuming logged in user)
    if (!user) {
        throw new GraphQLError("Unauthorized");
    }

    const { createReadStream, filename, mimetype, encoding } = await file;
    const stream = createReadStream();

    // 2. Upload to GCS
    const { bucket } = getStorage();
    const uniqueFilename = `${Date.now()}-${filename}`;
    // Use a configured folder or default
    const folder = process.env.GCS_RECEIPT_FOLDER || "receipts";
    const gcsPath = `${folder}/${uniqueFilename}`;
    const gcsFile = bucket.file(gcsPath);

    let fileSize = 0;

    await new Promise((resolve, reject) => {
        stream
            .pipe(
                gcsFile.createWriteStream({
                    resumable: false,
                    gzip: true,
                    metadata: {
                        contentType: mimetype,
                    },
                })
            )
            .on("error", (err: any) => reject(err))
            .on("finish", () => {
                // We can get size here or from metadata
                resolve(true);
            });
    });

    // Get metadata for size
    const [metadata] = await gcsFile.getMetadata();
    fileSize = parseInt((metadata.size || "0").toString(), 10);

    // 3. Create Attachment Record
    const attachment: AttachmentDbRecord = {
        id: new ObjectId().toHexString(), // Use string ID for attachments inside entry
        filename,
        gcsUrl: `https://storage.googleapis.com/${bucketName}/${gcsPath}`,
        gcsBucket: bucketName!,
        gcsPath,
        uploadedAt: new Date(),
        uploadedBy: (user as any).email || "unknown", // Assuming user has email
        fileSize,
        mimeType: mimetype,
        deleted: false,
    };

    // 4. Update Entry
    await accountingDb.updateOne({
        collection: "entries",
        filter: { _id: new ObjectId(entryId) },
        update: {
            $push: {
                "snapshot.meta.attachments": attachment,
            } as any, // Type assertion due to nested path
        },
    });

    return { attachment };
};

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

    const attachment = (entry as any).snapshot.meta.attachments?.find((a: AttachmentDbRecord) => a.id === id);

    if (!attachment) {
        throw new GraphQLError("Attachment not found");
    }

    // 2. Mark as deleted in DB (Soft delete)
    // We can also remove from GCS or just soft delete
    // For now, let's just mark deleted in array
    await accountingDb.updateOne({
        collection: "entries",
        filter: { _id: entry._id, "snapshot.meta.attachments.id": id },
        update: {
            $set: {
                "snapshot.meta.attachments.$.deleted": true,
            } as any,
        },
    });

    // Optionally delete from GCS immediately:
    // const { bucket } = getStorage();
    // await bucket.file(attachment.gcsPath).delete().catch(() => {});

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
