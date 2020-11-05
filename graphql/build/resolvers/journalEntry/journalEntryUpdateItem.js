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
const fraction_js_1 = require("fraction.js");
const DocHistory_1 = require("../utils/DocHistory");
const standIns_1 = require("../utils/standIns");
const graphTypes_1 = require("../../graphTypes");
const journalEntry_1 = require("./journalEntry");
const utils_1 = require("./utils");
const pubSubs_1 = require("./pubSubs");
const rational_1 = require("../../utils/rational");
const NULLISH = Symbol();
const journalEntryUpdateItem = (obj, args, context, info) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    const { id, fields } = args;
    const { db, user, nodeMap, pubSub } = context;
    const collection = db.collection("journalEntries");
    const itemId = new mongodb_1.ObjectId(id);
    const docHistory = new DocHistory_1.default({ node: standIns_1.userNodeType, id: user.id });
    const updateBuilder = docHistory.updateHistoricalDoc("items.$[item]");
    // Description
    if ((_a = fields.description) === null || _a === void 0 ? void 0 : _a.trim()) {
        updateBuilder.updateField("description", fields.description.trim());
    }
    // Units
    if (((_b = fields.units) !== null && _b !== void 0 ? _b : NULLISH) !== NULLISH) {
        if (fields.units < 1) {
            throw new Error("Item units must be greater than 0.");
        }
        updateBuilder.updateField("units", fields.units);
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
            const id = new mongodb_1.ObjectId(deptId);
            if (!(yield db
                .collection(collection)
                .findOne({ _id: id }, { projection: { _id: true } }))) {
                throw new Error(`Department with id ${deptId} does not exist.`);
            }
            updateBuilder.updateField("department", {
                node: new mongodb_1.ObjectId(node),
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
            const id = new mongodb_1.ObjectId(catId);
            if (!(yield db
                .collection(collection)
                .findOne({ _id: id }, { projection: { _id: true } }))) {
                throw new Error(`Category with id ${catId} does not exist.`);
            }
            updateBuilder.updateField("category", {
                node: new mongodb_1.ObjectId(node),
                id,
            });
        }))(),
        // total
        (() => __awaiter(void 0, void 0, void 0, function* () {
            const totalR = fields.total;
            if (!totalR) {
                return;
            }
            if (totalR.s === graphTypes_1.RationalSign.Neg || totalR.n === 0) {
                throw new Error("Item total must be greater than 0.");
            }
            const total = rational_1.rationalToFraction(totalR);
            const [result] = (yield db
                .collection("journalEntries")
                .aggregate([
                { $match: { "items.id": itemId } },
                utils_1.stages.entryTotal,
                //Excluded the current total from the refund total as it WILL change.
                utils_1.getItemTotals([itemId]),
                { $project: { entryTotal: true, itemTotals: true } },
            ])
                .toArray());
            if (!result) {
                return;
            }
            const entryTotal = new fraction_js_1.default(result.entryTotal);
            const itemTotal = result.itemTotals.reduce((itemTotal, total) => itemTotal.add(total), new fraction_js_1.default(0));
            // Ensure aggregate refunds do NOT exceed the original transaction amount
            if (entryTotal.compare(itemTotal.add(total)) < 0) {
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
                units: null,
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
        var _c, _d;
        const result = {};
        result.journalEntry = (yield journalEntry_1.default(obj, { id: entryId.toHexString() }, context, info));
        const itemIdStr = itemId.toHexString();
        result.journalEntryItem = ((_d = (_c = result.journalEntry) === null || _c === void 0 ? void 0 : _c.items) !== null && _d !== void 0 ? _d : []).find((item) => item.id === itemIdStr);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiam91cm5hbEVudHJ5VXBkYXRlSXRlbS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9yZXNvbHZlcnMvam91cm5hbEVudHJ5L2pvdXJuYWxFbnRyeVVwZGF0ZUl0ZW0udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7QUFBQSxxQ0FBbUM7QUFDbkMsNkNBQW1DO0FBRW5DLG9EQUE2QztBQUM3QyxnREFBaUQ7QUFDakQsaURBTTBCO0FBQzFCLGlEQUEwQztBQUMxQyxtQ0FBZ0Q7QUFDaEQsdUNBQW1EO0FBQ25ELG1EQUEwRDtBQUUxRCxNQUFNLE9BQU8sR0FBRyxNQUFNLEVBQUUsQ0FBQztBQUV6QixNQUFNLHNCQUFzQixHQUFnRCxDQUMxRSxHQUFHLEVBQ0gsSUFBSSxFQUNKLE9BQU8sRUFDUCxJQUFJLEVBQ0osRUFBRTs7SUFDRixNQUFNLEVBQUUsRUFBRSxFQUFFLE1BQU0sRUFBRSxHQUFHLElBQUksQ0FBQztJQUU1QixNQUFNLEVBQUUsRUFBRSxFQUFFLElBQUksRUFBRSxPQUFPLEVBQUUsTUFBTSxFQUFFLEdBQUcsT0FBTyxDQUFDO0lBRTlDLE1BQU0sVUFBVSxHQUFHLEVBQUUsQ0FBQyxVQUFVLENBQUMsZ0JBQWdCLENBQUMsQ0FBQztJQUVuRCxNQUFNLE1BQU0sR0FBRyxJQUFJLGtCQUFRLENBQUMsRUFBRSxDQUFDLENBQUM7SUFFaEMsTUFBTSxVQUFVLEdBQUcsSUFBSSxvQkFBVSxDQUFDLEVBQUUsSUFBSSxFQUFFLHVCQUFZLEVBQUUsRUFBRSxFQUFFLElBQUksQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDO0lBRXZFLE1BQU0sYUFBYSxHQUFHLFVBQVUsQ0FBQyxtQkFBbUIsQ0FBQyxlQUFlLENBQUMsQ0FBQztJQUV0RSxjQUFjO0lBQ2QsVUFBSSxNQUFNLENBQUMsV0FBVywwQ0FBRSxJQUFJLElBQUk7UUFDOUIsYUFBYSxDQUFDLFdBQVcsQ0FBQyxhQUFhLEVBQUUsTUFBTSxDQUFDLFdBQVcsQ0FB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