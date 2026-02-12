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
            return (((_c = (_b = (_a = parent.snapshot) === null || _a === void 0 ? void 0 : _a.meta) === null || _b === void 0 ? void 0 : _b.attachments) === null || _c === void 0 ? void 0 : _c.filter((a) => !a.deleted)) || []);
        },
    },
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXR0YWNobWVudC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9yZXNvbHZlcnMvYXR0YWNobWVudC9hdHRhY2htZW50LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7OztBQUFBLDJCQUFvQztBQUNwQywyQkFBeUQ7QUFDekQsZ0RBQXdCO0FBQ3hCLDhDQUEyQztBQUMzQyxxQ0FBdUM7QUFDdkMscUNBQW1DO0FBQ25DLG1FQUF1RDtBQUl2RCxNQUFNLFlBQVksR0FBRyxPQUFPLENBQUMsR0FBRyxDQUFDLG9CQUFvQixJQUFJLGVBQWUsQ0FBQztBQUN6RSxNQUFNLFFBQVEsR0FBRyxPQUFPLENBQUMsR0FBRyxDQUFDLGdCQUFnQixJQUFJLGdDQUFnQyxDQUFDO0FBRWxGLFNBQWUsZ0JBQWdCLENBQUMsT0FBZTs7UUFDM0MsSUFBSTtZQUNBLE1BQU0sYUFBRSxDQUFDLEtBQUssQ0FBQyxPQUFPLEVBQUUsRUFBRSxTQUFTLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxLQUFLLEVBQUUsQ0FBQyxDQUFDO1NBQzdEO1FBQUMsT0FBTyxHQUFRLEVBQUU7WUFDZixJQUFJLEdBQUcsQ0FBQyxJQUFJLEtBQUssUUFBUSxFQUFFO2dCQUN2QixNQUFNLEdBQUcsQ0FBQzthQUNiO1NBQ0o7SUFDTCxDQUFDO0NBQUE7QUFFTSxNQUFNLGFBQWEsR0FHdEIsQ0FBTyxDQUFDLEVBQUUsRUFBRSxPQUFPLEVBQUUsSUFBSSxFQUFFLEVBQUUsRUFBRSxXQUFXLEVBQUUsRUFBRSxZQUFZLEVBQUUsRUFBRSxJQUFJLEVBQUUsV0FBVyxFQUFFLFNBQVMsRUFBRSxTQUFTLEVBQUUsRUFBRSxFQUFFO0lBQzNHLElBQUksQ0FBQyxJQUFJLEVBQUU7UUFDUCxNQUFNLElBQUksc0JBQVksQ0FBQyxjQUFjLENBQUMsQ0FBQztLQUMxQztJQUVELE1BQU0sRUFBRSxnQkFBZ0IsRUFBRSxRQUFRLEVBQUUsUUFBUSxFQUFFLEdBQUcsTUFBTSxJ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