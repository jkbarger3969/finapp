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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.attachmentResolvers = exports.deleteAttachment = exports.uploadReceipt = void 0;
const fs_1 = require("fs");
const fs_2 = require("fs");
const path_1 = __importDefault(require("path"));
const promises_1 = require("stream/promises");
const graphql_1 = require("graphql");
const mongodb_1 = require("mongodb");
const graphql_upload_minimal_1 = require("graphql-upload-minimal");
// Filesystem storage configuration
const STORAGE_PATH = process.env.RECEIPT_STORAGE_PATH || "/tmp/receipts";
const BASE_URL = process.env.RECEIPT_BASE_URL || "http://localhost:4000/receipts";
/**
 * Ensure directory exists, create recursively if needed
 */
function ensureStorageDir(dirPath) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            yield fs_1.promises.mkdir(dirPath, { recursive: true, mode: 0o775 });
        }
        catch (err) {
            if (err.code !== "EEXIST") {
                throw err;
            }
        }
    });
}
/**
 * Upload a receipt file to the filesystem (NAS mount)
 */
const uploadReceipt = (_, { entryId, file }, { dataSources: { accountingDb }, user }) => __awaiter(void 0, void 0, void 0, function* () {
    // 1. Check permissions
    if (!user) {
        throw new graphql_1.GraphQLError("Unauthorized");
    }
    const { createReadStream, filename, mimetype } = yield file;
    // 2. Organize by year/month
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    // Create subdirectories: /STORAGE_PATH/2024/02/
    const subDir = path_1.default.join(STORAGE_PATH, String(year), month);
    yield ensureStorageDir(subDir);
    // 3. Generate unique filename with timestamp
    const uniqueFilename = `${Date.now()}-${filename}`;
    const fullPath = path_1.default.join(subDir, uniqueFilename);
    const relativePath = path_1.default.join(String(year), month, uniqueFilename);
    // 4. Write file to storage
    const stream = createReadStream();
    yield (0, promises_1.pipeline)(stream, (0, fs_2.createWriteStream)(fullPath, { mode: 0o664 }));
    // 5. Get file stats for size
    const stats = yield fs_1.promises.stat(fullPath);
    // 6. Create Attachment Record
    const attachment = {
        id: new mongodb_1.ObjectId().toHexString(),
        filename,
        filePath: relativePath,
        fullPath,
        url: `${BASE_URL}/${relativePath}`,
        uploadedAt: now,
        uploadedBy: user.email || "unknown",
        fileSize: stats.size,
        mimeType: mimetype,
        deleted: false,
    };
    // 7. Update Entry in database
    yield accountingDb.updateOne({
        collection: "entries",
        filter: { _id: new mongodb_1.ObjectId(entryId) },
        update: {
            $push: {
                "snapshot.meta.attachments": attachment,
            },
        },
    });
    return { attachment };
});
exports.uploadReceipt = uploadReceipt;
/**
 * Delete an attachment (soft delete in database)
 */
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
    yield accountingDb.updateOne({
        collection: "entries",
        filter: { _id: entry._id, "snapshot.meta.attachments.id": id },
        update: {
            $set: {
                "snapshot.meta.attachments.$.deleted": true,
            },
        },
    });
    // 3. Optionally delete physical file (currently soft delete only)
    // Uncomment to enable hard delete:
    // try {
    //     await fs.unlink(attachment.fullPath);
    // } catch (err) {
    //     console.error('Failed to delete file:', err);
    // }
    return { deletedAttachment: Object.assign(Object.assign({}, attachment), { deleted: true }) };
});
exports.deleteAttachment = deleteAttachment;
exports.attachmentResolvers = {
    Upload: graphql_upload_minimal_1.GraphQLUpload,
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXR0YWNobWVudC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9yZXNvbHZlcnMvYXR0YWNobWVudC9hdHRhY2htZW50LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7OztBQUFBLDJCQUFvQztBQUNwQywyQkFBeUQ7QUFDekQsZ0RBQXdCO0FBQ3hCLDhDQUEyQztBQUMzQyxxQ0FBdUM7QUFDdkMscUNBQW1DO0FBQ25DLG1FQUF1RDtBQUl2RCxtQ0FBbUM7QUFDbkMsTUFBTSxZQUFZLEdBQUcsT0FBTyxDQUFDLEdBQUcsQ0FBQyxvQkFBb0IsSUFBSSxlQUFlLENBQUM7QUFDekUsTUFBTSxRQUFRLEdBQUcsT0FBTyxDQUFDLEdBQUcsQ0FBQyxnQkFBZ0IsSUFBSSxnQ0FBZ0MsQ0FBQztBQUVsRjs7R0FFRztBQUNILFNBQWUsZ0JBQWdCLENBQUMsT0FBZTs7UUFDM0MsSUFBSTtZQUNBLE1BQU0sYUFBRSxDQUFDLEtBQUssQ0FBQyxPQUFPLEVBQUUsRUFBRSxTQUFTLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxLQUFLLEVBQUUsQ0FBQyxDQUFDO1NBQzdEO1FBQUMsT0FBTyxHQUFRLEVBQUU7WUFDZixJQUFJLEdBQUcsQ0FBQyxJQUFJLEtBQUssUUFBUSxFQUFFO2dCQUN2QixNQUFNLEdBQUcsQ0FBQzthQUNiO1NBQ0o7SUFDTCxDQUFDO0NBQUE7QUFFRDs7R0FFRztBQUNJLE1BQU0sYUFBYSxHQUd0QixDQUFPLENBQUMsRUFBRSxFQUFFLE9BQU8sRUFBRSxJQUFJLEVBQUUsRUFBRSxFQUFFLFdBQVcsRUFBRSxFQUFFLFlBQVksRUFBRSxFQUFFLElBQUksRUFBRSxFQUFFLEVBQUU7SUFDeEUsdUJBQXVCO0lBQ3ZCLElBQUksQ0FBQyxJQUFJLEVBQUU7UUFDUCxNQUFNLElBQUksc0JBQVksQ0FBQyxjQUFjLENBQUMsQ0FBQztLQUMxQztJQUVELE1BQU0sRUFBRSxnQkFBZ0IsRUFBRSxRQUFRLEVBQUUsUUFB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