"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.attachmentResolvers = exports.deleteAttachment = exports.uploadReceipt = void 0;
const storage_1 = require("@google-cloud/storage");
const graphql_1 = require("graphql");
const mongodb_1 = require("mongodb");
const graphql_upload_1 = require("graphql-upload");
// Initialize GCS Storage
// We'll lazy load this or check if env vars are present to avoid startup crashes if not configured
let storage = null;
let bucketName = null;
const getStorage = () => {
    if (!storage) {
        if (!process.env.GCS_PROJECT_ID || !process.env.GCS_BUCKET_NAME) {
            throw new Error("Google Cloud Storage not configured");
        }
        storage = new storage_1.Storage({
            projectId: process.env.GCS_PROJECT_ID,
            keyFilename: process.env.GCS_KEY_FILE, // Optional if using default credentials
        });
        bucketName = process.env.GCS_BUCKET_NAME;
    }
    return { storage, bucket: storage.bucket(bucketName) };
};
const uploadReceipt = (_, { entryId, file }, { dataSources: { accountingDb }, user }) => __awaiter(void 0, void 0, void 0, function* () {
    // 1. Check permissions (assuming logged in user)
    if (!user) {
        throw new graphql_1.GraphQLError("Unauthorized");
    }
    const { createReadStream, filename, mimetype, encoding } = yield file;
    const stream = createReadStream();
    // 2. Upload to GCS
    const { bucket } = getStorage();
    const uniqueFilename = `${Date.now()}-${filename}`;
    // Use a configured folder or default
    const folder = process.env.GCS_RECEIPT_FOLDER || "receipts";
    const gcsPath = `${folder}/${uniqueFilename}`;
    const gcsFile = bucket.file(gcsPath);
    let fileSize = 0;
    yield new Promise((resolve, reject) => {
        stream
            .pipe(gcsFile.createWriteStream({
            resumable: false,
            gzip: true,
            metadata: {
                contentType: mimetype,
            },
        }))
            .on("error", (err) => reject(err))
            .on("finish", () => {
            // We can get size here or from metadata
            resolve(true);
        });
    });
    // Get metadata for size
    const [metadata] = yield gcsFile.getMetadata();
    fileSize = parseInt((metadata.size || "0").toString(), 10);
    // 3. Create Attachment Record
    const attachment = {
        id: new mongodb_1.ObjectId().toHexString(),
        filename,
        gcsUrl: `https://storage.googleapis.com/${bucketName}/${gcsPath}`,
        gcsBucket: bucketName,
        gcsPath,
        uploadedAt: new Date(),
        uploadedBy: user.email || "unknown",
        fileSize,
        mimeType: mimetype,
        deleted: false,
    };
    // 4. Update Entry
    yield accountingDb.updateOne({
        collection: "entries",
        filter: { _id: new mongodb_1.ObjectId(entryId) },
        update: {
            $push: {
                "snapshot.meta.attachments": attachment,
            }, // Type assertion due to nested path
        },
    });
    return { attachment };
});
exports.uploadReceipt = uploadReceipt;
const deleteAttachment = (_, { id }, { dataSources: { accountingDb }, user }) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    if (!user) {
        throw new graphql_1.GraphQLError("Unauthorized");
    }
    // 1. Find entry with this attachment
    const entry = yield accountingDb.findOne({
        collection: "entries",
        filter: {
            "snapshot.meta.attachments.id": id,
        },
    });
    if (!entry) {
        throw new graphql_1.GraphQLError("Attachment not found");
    }
    const attachment = (_a = entry.snapshot.meta.attachments) === null || _a === void 0 ? void 0 : _a.find((a) => a.id === id);
    if (!attachment) {
        throw new graphql_1.GraphQLError("Attachment not found");
    }
    // 2. Mark as deleted in DB (Soft delete)
    // We can also remove from GCS or just soft delete
    // For now, let's just mark deleted in array
    yield accountingDb.updateOne({
        collection: "entries",
        filter: { _id: entry._id, "snapshot.meta.attachments.id": id },
        update: {
            $set: {
                "snapshot.meta.attachments.$.deleted": true,
            },
        },
    });
    // Optionally delete from GCS immediately:
    // const { bucket } = getStorage();
    // await bucket.file(attachment.gcsPath).delete().catch(() => {});
    return { deletedAttachment: Object.assign(Object.assign({}, attachment), { deleted: true }) };
});
exports.deleteAttachment = deleteAttachment;
exports.attachmentResolvers = {
    Upload: graphql_upload_1.GraphQLUpload,
    Mutation: {
        uploadReceipt: exports.uploadReceipt,
        deleteAttachment: exports.deleteAttachment,
    },
    Entry: {
        attachments: (parent) => {
            var _a, _b, _c;
            // Return non-deleted attachments
            return (((_c = (_b = (_a = parent.snapshot) === null || _a === void 0 ? void 0 : _a.meta) === null || _b === void 0 ? void 0 : _b.attachments) === null || _c === void 0 ? void 0 : _c.filter((a) => !a.deleted)) || []);
        },
    },
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXR0YWNobWVudC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9yZXNvbHZlcnMvYXR0YWNobWVudC9hdHRhY2htZW50LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7OztBQUFBLG1EQUFnRDtBQUNoRCxxQ0FBdUM7QUFDdkMscUNBQW1DO0FBQ25DLG1EQUErQztBQUkvQyx5QkFBeUI7QUFDekIsbUdBQW1HO0FBQ25HLElBQUksT0FBTyxHQUFtQixJQUFJLENBQUM7QUFDbkMsSUFBSSxVQUFVLEdBQWtCLElBQUksQ0FBQztBQUVyQyxNQUFNLFVBQVUsR0FBRyxHQUFHLEVBQUU7SUFDcEIsSUFBSSxDQUFDLE9BQU8sRUFBRTtRQUNWLElBQUksQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLGNBQWMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsZUFBZSxFQUFFO1lBQzdELE1BQU0sSUFBSSxLQUFLLENBQUMscUNBQXFDLENBQUMsQ0FBQztTQUMxRDtRQUNELE9BQU8sR0FBRyxJQUFJLGlCQUFPLENBQUM7WUFDbEIsU0FBUyxFQUFFLE9BQU8sQ0FBQyxHQUFHLENBQUMsY0FBYztZQUNyQyxXQUFXLEVBQUUsT0FBTyxDQUFDLEdBQUcsQ0FBQyxZQUFZLEVBQUUsd0NBQXdDO1NBQ2xGLENBQUMsQ0FBQztRQUNILFVBQVUsR0FBRyxPQUFPLENBQUMsR0FBRyxDQUFDLGVBQWUsQ0FBQztLQUM1QztJQUNELE9BQU8sRUFBRSxPQUFPLEVBQUUsTUFBTSxFQUFFLE9BQU8sQ0FBQyxNQUFNLENBQUMsVUFBVyxDQUFDLEVBQUUsQ0FBQztBQUM1RCxDQUFDLENBQUM7QUFFSyxNQUFNLGFBQWEsR0FHdEIsQ0FBTyxDQUFDLEVBQUUsRUFBRSxPQUFPLEVBQUUsSUFBSSxFQUFFLEVBQUUsRUFBRSxXQUFXLEVBQUUsRUFBRSxZQUFZLEVBQUUsRUFBRSxJQUFJLEVBQUUsRUFBRSxFQUFFO0lBQ3hFLGlEQUFpRDtJQUNqRCxJ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