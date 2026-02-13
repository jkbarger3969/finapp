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
const url_1 = require("url");
const promises_1 = require("stream/promises");
const graphql_1 = require("graphql");
const mongodb_1 = require("mongodb");
const graphql_upload_minimal_1 = require("graphql-upload-minimal");
const STORAGE_PATH = process.env.RECEIPT_STORAGE_PATH || "/tmp/receipts";
const BASE_URL = process.env.RECEIPT_BASE_URL || "http://localhost:4000/receipts";
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
const uploadReceipt = (_, { entryId, file }, { dataSources: { accountingDb }, user, authService, ipAddress, userAgent }) => __awaiter(void 0, void 0, void 0, function* () {
    if (!user) {
        throw new graphql_1.GraphQLError("Unauthorized");
    }
    const { createReadStream, filename, mimetype } = yield file;
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const subDir = path_1.default.join(STORAGE_PATH, String(year), month);
    yield ensureStorageDir(subDir);
    const uniqueFilename = `${Date.now()}-${filename}`;
    const fullPath = path_1.default.join(subDir, uniqueFilename);
    const relativePath = path_1.default.join(String(year), month, uniqueFilename);
    const stream = createReadStream();
    yield (0, promises_1.pipeline)(stream, (0, fs_2.createWriteStream)(fullPath, { mode: 0o664 }));
    const stats = yield fs_1.promises.stat(fullPath);
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
    yield accountingDb.updateOne({
        collection: "entries",
        filter: { _id: new mongodb_1.ObjectId(entryId) },
        update: {
            $push: {
                "snapshot.meta.attachments": attachment,
            },
        },
    });
    if (authService) {
        yield authService.logAudit({
            userId: user.id,
            action: "RECEIPT_UPLOAD",
            resourceType: "Attachment",
            resourceId: new mongodb_1.ObjectId(attachment.id),
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
});
exports.uploadReceipt = uploadReceipt;
const deleteAttachment = (_, { id }, { dataSources: { accountingDb }, user, authService, ipAddress, userAgent }) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    if (!user) {
        throw new graphql_1.GraphQLError("Unauthorized");
    }
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
    yield accountingDb.updateOne({
        collection: "entries",
        filter: { _id: entry._id, "snapshot.meta.attachments.id": id },
        update: {
            $set: {
                "snapshot.meta.attachments.$.deleted": true,
            },
        },
    });
    if (authService) {
        yield authService.logAudit({
            userId: user.id,
            action: "RECEIPT_DELETE",
            resourceType: "Attachment",
            resourceId: new mongodb_1.ObjectId(id),
            details: {
                entryId: entry._id.toHexString(),
                filename: attachment.filename,
            },
            ipAddress,
            userAgent,
            timestamp: new Date(),
        });
    }
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
            const attachments = ((_c = (_b = (_a = parent.snapshot) === null || _a === void 0 ? void 0 : _a.meta) === null || _b === void 0 ? void 0 : _b.attachments) === null || _c === void 0 ? void 0 : _c.filter((a) => !a.deleted)) || [];
            return attachments.map((a) => {
                let url = a.url;
                // Prefer generating URL from filePath if available (Relative URL for portability)
                if (a.filePath) {
                    // URL-encode the path components to handle spaces and special characters
                    const encodedPath = a.filePath.split('/').map(part => encodeURIComponent(part)).join('/');
                    url = `/receipts/${encodedPath}`;
                }
                else if (a.url && a.url.includes("/receipts/")) {
                    // Legacy fallback: try to extract relative path from absolute URL
                    try {
                        // If it's a full URL, parse it
                        if (a.url.startsWith("http")) {
                            const urlObj = new url_1.URL(a.url);
                            url = urlObj.pathname;
                        }
                        // URL-encode the path if it contains spaces
                        if (url.includes(' ')) {
                            const parts = url.split('/');
                            url = parts.map(part => part.includes(' ') ? encodeURIComponent(part) : part).join('/');
                        }
                    }
                    catch (e) {
                        // ignore parsing error
                    }
                }
                return Object.assign(Object.assign({}, a), { url });
            });
        },
    },
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXR0YWNobWVudC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9yZXNvbHZlcnMvYXR0YWNobWVudC9hdHRhY2htZW50LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7OztBQUFBLDJCQUFvQztBQUNwQywyQkFBeUQ7QUFDekQsZ0RBQXdCO0FBQ3hCLDZCQUEwQjtBQUMxQiw4Q0FBMkM7QUFDM0MscUNBQXVDO0FBQ3ZDLHFDQUFtQztBQUNuQyxtRUFBdUQ7QUFJdkQsTUFBTSxZQUFZLEdBQUcsT0FBTyxDQUFDLEdBQUcsQ0FBQyxvQkFBb0IsSUFBSSxlQUFlLENBQUM7QUFDekUsTUFBTSxRQUFRLEdBQUcsT0FBTyxDQUFDLEdBQUcsQ0FBQyxnQkFBZ0IsSUFBSSxnQ0FBZ0MsQ0FBQztBQUVsRixTQUFlLGdCQUFnQixDQUFDLE9BQWU7O1FBQzNDLElBQUk7WUFDQSxNQUFNLGFBQUUsQ0FBQyxLQUFLLENBQUMsT0FBTyxFQUFFLEVBQUUsU0FBUyxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsS0FBSyxFQUFFLENBQUMsQ0FBQztTQUM3RDtRQUFDLE9BQU8sR0FBUSxFQUFFO1lBQ2YsSUFBSSxHQUFHLENBQUMsSUFBSSxLQUFLLFFBQVEsRUFBRTtnQkFDdkIsTUFBTSxHQUFHLENBQUM7YUFDYjtTQUNKO0lBQ0wsQ0FBQztDQUFBO0FBRU0sTUFBTSxhQUFhLEdBR3RCLENBQU8sQ0FBQyxFQUFFLEVBQUUsT0FBTyxFQUFFLElBQUksRUFBRSxFQUFFLEVBQUUsV0FBVyxFQUFFLEVBQUUsWUFBWSxFQUFFLEVBQUUsSUFBSSxFQUFFLFdBQVcsRUFBRSxTQUFTLEVBQUUsU0FBUyxFQUFFLEVBQUUsRUFBRTtJQUMzRyxJQUFJLENBQUMsSUFBSSxFQUFFO1FBQ1AsTUFBTSxJQUFJLHNCQUFZLENBQUMsY0FBYyxDQUFDLENBQUM7S0FDMUM7SUFFRCxNQUFNLEVBQUUsZ0JBQWdCLEVBQUUsUUFBUSxFQUFFLFFBQVEsRUFB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