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
const mongoUtils_1 = require("../utils/mongoUtils");
const utils_1 = require("./utils");
const pubSubs_1 = require("./pubSubs");
const rational_1 = require("../../utils/rational");
const journalEntryAddItem = (obj, args, context, info) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const { db, nodeMap, user, pubSub } = context;
    const { id, fields: { department: departmentId, category: categoryId, total: totalR, units, }, } = args;
    const total = rational_1.rationalToFraction(totalR);
    const description = (_a = args.fields.description) === null || _a === void 0 ? void 0 : _a.trim();
    const collection = db.collection("journalEntries");
    const srcEntryId = new mongodb_1.ObjectId(id);
    const docHistory = new DocHistory_1.default({ node: standIns_1.userNodeType, id: user.id });
    const docBuilder = docHistory.newHistoricalDoc(true).addFields([
        ["total", total],
        ["deleted", false],
        ["units", units],
    ]);
    if (description) {
        docBuilder.addField("description", description);
    }
    if (units < 1) {
        throw new Error("Item units must be greater than 0.");
    }
    let itemId;
    const asyncOps = [
        // Ensure entry exists and ensure item totals does not exceed entry total
        (() => __awaiter(void 0, void 0, void 0, function* () {
            // Total Cannot be less than or equal to zero
            if (totalR.s === graphTypes_1.RationalSign.Neg || totalR.n === 0) {
                throw new Error("Item total must be greater than 0.");
            }
            const [srcEntryState] = (yield collection
                .aggregate([
                { $match: { _id: srcEntryId } },
                utils_1.stages.entryTotal,
                utils_1.stages.itemTotals,
                {
                    $project: {
                        entryTotal: true,
                        itemTotals: true,
                    },
                },
            ])
                .toArray());
            if (!srcEntryState) {
                throw new Error(`Journal entry "${id}" does not exist.`);
            }
            const entryTotal = new fraction_js_1.default(srcEntryState.entryTotal);
            const itemTotal = srcEntryState.itemTotals.reduce((itemTotal, total) => itemTotal.add(total), new fraction_js_1.default(0));
            // Ensure aggregate refunds do NOT exceed the original transaction amount
            if (entryTotal.compare(itemTotal.add(total)) < 0) {
                throw new Error("Items cannot total more than original transaction amount.");
            }
        }))(),
        // Check that department exists and add
        (() => __awaiter(void 0, void 0, void 0, function* () {
            if (!departmentId) {
                return;
            }
            const { collection, id: node } = nodeMap.typename.get("Department");
            const id = new mongodb_1.ObjectId(departmentId);
            if (!(yield db
                .collection(collection)
                .findOne({ _id: id }, { projection: { _id: true } }))) {
                throw new Error(`Department with id ${departmentId} does not exist.`);
            }
            docBuilder.addField("department", {
                node: new mongodb_1.ObjectId(node),
                id,
            });
        }))(),
        // Check that category exists and add
        (() => __awaiter(void 0, void 0, void 0, function* () {
            if (!categoryId) {
                return;
            }
            const { collection, id: node } = nodeMap.typename.get("JournalEntryCategory");
            const id = new mongodb_1.ObjectId(categoryId);
            if (!(yield db
                .collection(collection)
                .findOne({ _id: id }, { projection: { _id: true } }))) {
                throw new Error(`Category with id ${categoryId} does not exist.`);
            }
            docBuilder.addField("category", { node: new mongodb_1.ObjectId(node), id });
        }))(),
        // Generate item ID
        (() => __awaiter(void 0, void 0, void 0, function* () {
            itemId = yield mongoUtils_1.getUniqueId("items.id", collection);
        }))(),
    ];
    // Await async operations
    yield Promise.all(asyncOps);
    const { modifiedCount } = yield collection.updateOne({ _id: srcEntryId }, {
        $push: {
            items: Object.assign({ id: itemId }, docBuilder.doc()),
        },
    });
    if (modifiedCount === 0) {
        throw new Error(`Failed to add item entry: "${JSON.stringify(args, null, 2)}".`);
    }
    const result = yield (() => __awaiter(void 0, void 0, void 0, function* () {
        var _b, _c;
        const result = {};
        result.journalEntry = (yield journalEntry_1.default(obj, { id }, context, info));
        const itemIdStr = itemId.toHexString();
        result.journalEntryItem = ((_c = (_b = result.journalEntry) === null || _b === void 0 ? void 0 : _b.items) !== null && _c !== void 0 ? _c : []).find((item) => item.id === itemIdStr);
        return result;
    }))();
    pubSub
        .publish(pubSubs_1.JOURNAL_ENTRY_UPSERTED, {
        journalEntryUpserted: result.journalEntry,
    })
        .catch((error) => console.error(error));
    return result;
});
exports.default = journalEntryAddItem;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiam91cm5hbEVudHJ5QWRkSXRlbS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9yZXNvbHZlcnMvam91cm5hbEVudHJ5L2pvdXJuYWxFbnRyeUFkZEl0ZW0udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7QUFBQSxxQ0FBbUM7QUFDbkMsNkNBQW1DO0FBRW5DLG9EQUE2QztBQUM3QyxnREFBaUQ7QUFDakQsaURBSzBCO0FBQzFCLGlEQUEwQztBQUMxQyxvREFBa0Q7QUFDbEQsbUNBQWlDO0FBQ2pDLHVDQUFtRDtBQUNuRCxtREFBMEQ7QUFFMUQsTUFBTSxtQkFBbUIsR0FBNkMsQ0FDcEUsR0FBRyxFQUNILElBQUksRUFDSixPQUFPLEVBQ1AsSUFBSSxFQUNKLEVBQUU7O0lBQ0YsTUFBTSxFQUFFLEVBQUUsRUFBRSxPQUFPLEVBQUUsSUFBSSxFQUFFLE1BQU0sRUFBRSxHQUFHLE9BQU8sQ0FBQztJQUU5QyxNQUFNLEVBQ0osRUFBRSxFQUNGLE1BQU0sRUFBRSxFQUNOLFVBQVUsRUFBRSxZQUFZLEVBQ3hCLFFBQVEsRUFBRSxVQUFVLEVBQ3BCLEtBQUssRUFBRSxNQUFNLEVBQ2IsS0FBSyxHQUNOLEdBQ0YsR0FBRyxJQUFJLENBQUM7SUFFVCxNQUFNLEtBQUssR0FBRyw2QkFBa0IsQ0FBQyxNQUFNLENBQUMsQ0FBQztJQUV6QyxNQUFNLFdBQVcsU0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDLFdBQVcsMENBQUUsSUFBSSxFQUFFLENBQUM7SUFFcEQsTUFBTSxVQUFVLEdBQUcsRUFBRSxDQUFDLFVBQVUsQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDO0lBRW5ELE1BQU0sVUFBVSxHQUFHLElBQUksa0JBQVEsQ0FBQyxFQUFFLENBQUMsQ0FBQztJQUVwQyxNQUFNLFVBQVUsR0FBRyxJQUFJLG9CQUFVLENBQUMsRUFBRSxJQUFJLEVBQUUsdUJBQVksRUFBRSxFQUFFLEVBQUUsSUFBSSxDQUFDLEVBQUUsRUFBRSxDQUFDLENB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