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
exports.createLoaders = void 0;
const dataloader_1 = __importDefault(require("dataloader"));
const mongodb_1 = require("mongodb");
const createLoaders = (db) => {
    return {
        department: new dataloader_1.default((ids) => __awaiter(void 0, void 0, void 0, function* () {
            const objectIds = ids.map((id) => new mongodb_1.ObjectId(id));
            const results = yield db
                .collection("departments")
                .find({ _id: { $in: objectIds } })
                .toArray();
            const map = new Map(results.map((r) => [r._id.toString(), r]));
            return ids.map((id) => map.get(id) || null);
        })),
        category: new dataloader_1.default((ids) => __awaiter(void 0, void 0, void 0, function* () {
            const objectIds = ids.map((id) => new mongodb_1.ObjectId(id));
            const results = yield db
                .collection("categories")
                .find({ _id: { $in: objectIds } })
                .toArray();
            const map = new Map(results.map((r) => [r._id.toString(), r]));
            return ids.map((id) => map.get(id) || null);
        })),
        fiscalYear: new dataloader_1.default((ids) => __awaiter(void 0, void 0, void 0, function* () {
            // Fiscal Year lookup by ID is rare in entries (usually by date), 
            // but useful if we resolve by ID.
            // For date-based lookup, DataLoader is harder (range queries).
            // Let's at least implement ID lookup.
            const objectIds = ids.map((id) => new mongodb_1.ObjectId(id));
            const results = yield db
                .collection("fiscalYears")
                .find({ _id: { $in: objectIds } })
                .toArray();
            const map = new Map(results.map((r) => [r._id.toString(), r]));
            return ids.map((id) => map.get(id) || null);
        })),
        business: new dataloader_1.default((ids) => __awaiter(void 0, void 0, void 0, function* () {
            const objectIds = ids.map((id) => new mongodb_1.ObjectId(id));
            const results = yield db
                .collection("businesses")
                .find({ _id: { $in: objectIds } })
                .toArray();
            const map = new Map(results.map((r) => [r._id.toString(), r]));
            return ids.map((id) => map.get(id) || null);
        })),
        person: new dataloader_1.default((ids) => __awaiter(void 0, void 0, void 0, function* () {
            const objectIds = ids.map((id) => new mongodb_1.ObjectId(id));
            const results = yield db
                .collection("people")
                .find({ _id: { $in: objectIds } })
                .toArray();
            const map = new Map(results.map((r) => [r._id.toString(), r]));
            return ids.map((id) => map.get(id) || null);
        })),
        allFiscalYears: new dataloader_1.default((keys) => __awaiter(void 0, void 0, void 0, function* () {
            const years = yield db
                .collection("fiscalYears")
                .find({})
                .sort({ begin: 1 })
                .toArray();
            return keys.map(() => years);
        })),
    };
};
exports.createLoaders = createLoaders;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibG9hZGVycy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uL3NyYy9sb2FkZXJzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7OztBQUFBLDREQUFvQztBQUNwQyxxQ0FBdUM7QUFrQmhDLE1BQU0sYUFBYSxHQUFHLENBQUMsRUFBTSxFQUFXLEVBQUU7SUFDN0MsT0FBTztRQUNILFVBQVUsRUFBRSxJQUFJLG9CQUFVLENBQUMsQ0FBTyxHQUFHLEVBQUUsRUFBRTtZQUNyQyxNQUFNLFNBQVMsR0FBRyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRSxFQUFFLEVBQUUsQ0FBQyxJQUFJLGtCQUFRLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztZQUNwRCxNQUFNLE9BQU8sR0FBRyxNQUFNLEVBQUU7aUJBQ25CLFVBQVUsQ0FBcUIsYUFBYSxDQUFDO2lCQUM3QyxJQUFJLENBQUMsRUFBRSxHQUFHLEVBQUUsRUFBRSxHQUFHLEVBQUUsU0FBUyxFQUFFLEVBQUUsQ0FBQztpQkFDakMsT0FBTyxFQUFFLENBQUM7WUFDZixNQUFNLEdBQUcsR0FBRyxJQUFJLEdBQUcsQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsUUFBUSxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQy9ELE9BQU8sR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQUUsRUFBRSxFQUFFLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsSUFBSSxJQUFJLENBQUMsQ0FBQztRQUNoRCxDQUFDLENBQUEsQ0FBQztRQUNGLFFBQVEsRUFBRSxJQUFJLG9CQUFVLENBQUMsQ0FBTyxHQUFHLEVBQUUsRUFBRTtZQUNuQyxNQUFNLFNBQVMsR0FBRyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRSxFQUFFLEVBQUUsQ0FBQyxJQUFJLGtCQUFRLENB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