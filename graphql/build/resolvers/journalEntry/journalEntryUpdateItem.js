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
const mongodb_1 = require("mongodb");
const DocHistory_1 = require("../utils/DocHistory");
const standIns_1 = require("../utils/standIns");
const journalEntry_1 = require("./journalEntry");
const utils_1 = require("./utils");
const pubSubs_1 = require("./pubSubs");
const journalEntryUpdateItem = (obj, args, context, info) => __awaiter(void 0, void 0, void 0, function* () {
    const { id, fields } = args;
    const { db, user, nodeMap, pubSub } = context;
    const collection = db.collection("journalEntries");
    const itemId = new mongodb_1.ObjectID(id);
    const docHistory = new DocHistory_1.default({ node: standIns_1.userNodeType, id: user.id });
    const updateBuilder = docHistory.updateHistoricalDoc("items.$[item]");
    // Description
    if (fields.description) {
        const description = fields.description.trim();
        if (description) {
            updateBuilder.updateField("description", description);
        }
    }
    let entryId;
    const asyncOps = [
        // Ensure item exists and get entry id
        (() => __awaiter(void 0, void 0, void 0, function* () {
            const [result] = (yield collection
                .aggregate([
                { $match: { "items.id": itemId } },
                { $limit: 1 },
                {
                    $project: {
                        entryId: "$_id",
                    },
                },
            ])
                .toArray());
            if (!result) {
                throw new Error(`Item "${id}" does not exists.`);
            }
            entryId = result.entryId;
        }))(),
        // department
        (() => __awaiter(void 0, void 0, void 0, function* () {
            const deptId = fields.department;
            if (!deptId) {
                return;
            }
            const { collection, id: node } = nodeMap.typename.get("Department");
            const id = new mongodb_1.ObjectID(deptId);
            if (!(yield db
                .collection(collection)
                .findOne({ _id: id }, { projection: { _id: true } }))) {
                throw new Error(`Department with id ${deptId} does not exist.`);
            }
            updateBuilder.updateField("department", {
                node: new mongodb_1.ObjectID(node),
                id,
            });
        }))(),
        // category
        (() => __awaiter(void 0, void 0, void 0, function* () {
            const catId = fields.category;
            if (!catId) {
                return;
            }
            const { collection, id: node } = nodeMap.typename.get("JournalEntryCategory");
            const id = new mongodb_1.ObjectID(catId);
            if (!(yield db
                .collection(collection)
                .findOne({ _id: id }, { projection: { _id: true } }))) {
                throw new Error(`Category with id ${catId} does not exist.`);
            }
            updateBuilder.updateField("category", {
                node: new mongodb_1.ObjectID(node),
                id,
            });
        }))(),
        // total
        (() => __awaiter(void 0, void 0, void 0, function* () {
            const total = fields.total;
            if (!total) {
                return;
            }
            const totalDecimal = total.num / total.den;
            if (totalDecimal <= 0) {
                throw new Error("Item total must be greater than 0.");
            }
            const [{ entryTotal, itemTotal }] = (yield db
                .collection("journalEntries")
                .aggregate([
                { $match: { "items.id": itemId } },
                utils_1.stages.entryTotal,
                //Excluded the current total from the refund total as it WILL change.
                utils_1.getItemTotals([itemId]),
                { $project: { entryTotal: true, itemTotal: true } },
            ])
                .toArray());
            // Ensure aggregate refunds do NOT exceed the original transaction amount
            if (entryTotal < itemTotal + totalDecimal) {
                throw new Error("Items cannot total more than original transaction amount.");
            }
            updateBuilder.updateField("total", total);
        }))(),
    ];
    yield Promise.all(asyncOps);
    if (!updateBuilder.hasUpdate) {
        const keys = (() => {
            const obj = {
                department: null,
                category: null,
                description: null,
                total: null,
            };
            return Object.keys(obj);
        })();
        throw new Error(`Item update requires at least one of the following fields: ${keys.join(", ")}".`);
    }
    const { modifiedCount } = yield collection.updateOne({ _id: entryId }, updateBuilder.update(), {
        arrayFilters: [{ "item.id": itemId }],
    });
    if (modifiedCount === 0) {
        throw new Error(`Failed to update item: "${JSON.stringify(args)}".`);
    }
    const result = yield (() => __awaiter(void 0, void 0, void 0, function* () {
        var _a, _b;
        const result = {};
        result.journalEntry = (yield journalEntry_1.default(obj, { id: entryId.toHexString() }, context, info));
        const itemIdStr = itemId.toHexString();
        result.journalEntryItem = (_b = (_a = result.journalEntry) === null || _a === void 0 ? void 0 : _a.items, (_b !== null && _b !== void 0 ? _b : [])).find((item) => item.id === itemIdStr);
        return result;
    }))();
    pubSub
        .publish(pubSubs_1.JOURNAL_ENTRY_UPSERTED, {
        journalEntryUpserted: result.journalEntry,
    })
        .catch((error) => console.error(error));
    return result;
});
exports.default = journalEntryUpdateItem;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiam91cm5hbEVudHJ5VXBkYXRlSXRlbS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9yZXNvbHZlcnMvam91cm5hbEVudHJ5L2pvdXJuYWxFbnRyeVVwZGF0ZUl0ZW0udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7QUFBQSxxQ0FBbUM7QUFFbkMsb0RBQTZDO0FBQzdDLGdEQUFpRDtBQU9qRCxpREFBMEM7QUFDMUMsbUNBQWdEO0FBQ2hELHVDQUFtRDtBQUVuRCxNQUFNLHNCQUFzQixHQUFnRCxDQUMxRSxHQUFHLEVBQ0gsSUFBSSxFQUNKLE9BQU8sRUFDUCxJQUFJLEVBQ0osRUFBRTtJQUNGLE1BQU0sRUFBRSxFQUFFLEVBQUUsTUFBTSxFQUFFLEdBQUcsSUFBSSxDQUFDO0lBRTVCLE1BQU0sRUFBRSxFQUFFLEVBQUUsSUFBSSxFQUFFLE9BQU8sRUFBRSxNQUFNLEVBQUUsR0FBRyxPQUFPLENBQUM7SUFFOUMsTUFBTSxVQUFVLEdBQUcsRUFBRSxDQUFDLFVBQVUsQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDO0lBRW5ELE1BQU0sTUFBTSxHQUFHLElBQUksa0JBQVEsQ0FBQyxFQUFFLENBQUMsQ0FBQztJQUVoQyxNQUFNLFVBQVUsR0FBRyxJQUFJLG9CQUFVLENBQUMsRUFBRSxJQUFJLEVBQUUsdUJBQVksRUFBRSxFQUFFLEVBQUUsSUFBSSxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUM7SUFFdkUsTUFBTSxhQUFhLEdBQUcsVUFBVSxDQUFDLG1CQUFtQixDQUFDLGVBQWUsQ0FBQyxDQUFDO0lBRXRFLGNBQWM7SUFDZCxJQUFJLE1BQU0sQ0FBQyxXQUFXLEVBQUU7UUFDdEIsTUFBTSxXQUFXLEdBQUcsTUFBTSxDQUFDLFdBQVcsQ0FBQyxJQUFJLEVBQUUsQ0FBQztRQUM5QyxJQUFJLFdBQVcsRUFBRTtZQUNmLGFBQWEsQ0FBQyxXQUFXLENBQUMsYUFBYSxFQUFFLFdBQVcsQ0FBQyxDQUFDO1NBQ3ZEO0tBQ0Y7SUFF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