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
const mongoUtils_1 = require("../utils/mongoUtils");
const utils_1 = require("./utils");
const pubSubs_1 = require("./pubSubs");
const journalEntryAddItem = (obj, args, context, info) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const { db, nodeMap, user, pubSub } = context;
    const { id, fields: { department: departmentId, category: categoryId, total }, } = args;
    const description = (_a = args.fields.description, (_a !== null && _a !== void 0 ? _a : "")).trim();
    const collection = db.collection("journalEntries");
    const srcEntryId = new mongodb_1.ObjectID(id);
    const docHistory = new DocHistory_1.default({ node: standIns_1.userNodeType, id: user.id });
    const docBuilder = docHistory.newHistoricalDoc(true).addFields([
        ["total", total],
        ["deleted", false],
    ]);
    if (description) {
        docBuilder.addField("description", description);
    }
    let itemId;
    const asyncOps = [
        // Ensure entry exists and ensure item totals does not exceed entry total
        (() => __awaiter(void 0, void 0, void 0, function* () {
            // Total Cannot be less than or equal to zero
            const totalDecimal = total.num / total.den;
            if (totalDecimal <= 0) {
                throw new Error("Item total must be greater than 0.");
            }
            const [srcEntryState] = (yield collection
                .aggregate([
                { $match: { _id: srcEntryId } },
                utils_1.stages.entryTotal,
                utils_1.stages.itemTotal,
                {
                    $project: {
                        entryTotal: true,
                        itemTotal: true,
                    },
                },
            ])
                .toArray());
            if (!srcEntryState) {
                throw new Error(`Journal entry "${id}" does not exist.`);
            }
            const { entryTotal, itemTotal } = srcEntryState;
            // Ensure aggregate refunds do NOT exceed the original transaction amount
            if (entryTotal < itemTotal + totalDecimal) {
                throw new Error("Items cannot total more than original transaction amount.");
            }
        }))(),
        // Check that department exists and add
        (() => __awaiter(void 0, void 0, void 0, function* () {
            if (!departmentId) {
                return;
            }
            const { collection, id: node } = nodeMap.typename.get("Department");
            const id = new mongodb_1.ObjectID(departmentId);
            if (!(yield db
                .collection(collection)
                .findOne({ _id: id }, { projection: { _id: true } }))) {
                throw new Error(`Department with id ${departmentId} does not exist.`);
            }
            docBuilder.addField("department", {
                node: new mongodb_1.ObjectID(node),
                id,
            });
        }))(),
        // Check that category exists and add
        (() => __awaiter(void 0, void 0, void 0, function* () {
            if (!categoryId) {
                return;
            }
            const { collection, id: node } = nodeMap.typename.get("JournalEntryCategory");
            const id = new mongodb_1.ObjectID(categoryId);
            if (!(yield db
                .collection(collection)
                .findOne({ _id: id }, { projection: { _id: true } }))) {
                throw new Error(`Category with id ${categoryId} does not exist.`);
            }
            docBuilder.addField("category", { node: new mongodb_1.ObjectID(node), id });
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
        result.journalEntryItem = (_c = (_b = result.journalEntry) === null || _b === void 0 ? void 0 : _b.items, (_c !== null && _c !== void 0 ? _c : [])).find((item) => item.id === itemIdStr);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiam91cm5hbEVudHJ5QWRkSXRlbS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9yZXNvbHZlcnMvam91cm5hbEVudHJ5L2pvdXJuYWxFbnRyeUFkZEl0ZW0udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7QUFBQSxxQ0FBbUM7QUFFbkMsb0RBQTZDO0FBQzdDLGdEQUFpRDtBQU1qRCxpREFBMEM7QUFDMUMsb0RBQWtEO0FBQ2xELG1DQUFpQztBQUNqQyx1Q0FBbUQ7QUFFbkQsTUFBTSxtQkFBbUIsR0FBNkMsQ0FDcEUsR0FBRyxFQUNILElBQUksRUFDSixPQUFPLEVBQ1AsSUFBSSxFQUNKLEVBQUU7O0lBQ0YsTUFBTSxFQUFFLEVBQUUsRUFBRSxPQUFPLEVBQUUsSUFBSSxFQUFFLE1BQU0sRUFBRSxHQUFHLE9BQU8sQ0FBQztJQUU5QyxNQUFNLEVBQ0osRUFBRSxFQUNGLE1BQU0sRUFBRSxFQUFFLFVBQVUsRUFBRSxZQUFZLEVBQUUsUUFBUSxFQUFFLFVBQVUsRUFBRSxLQUFLLEVBQUUsR0FDbEUsR0FBRyxJQUFJLENBQUM7SUFFVCxNQUFNLFdBQVcsR0FBRyxNQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsV0FBVyx1Q0FBSSxFQUFFLEVBQUMsQ0FBQyxJQUFJLEVBQUUsQ0FBQztJQUUzRCxNQUFNLFVBQVUsR0FBRyxFQUFFLENBQUMsVUFBVSxDQUFDLGdCQUFnQixDQUFDLENBQUM7SUFFbkQsTUFBTSxVQUFVLEdBQUcsSUFBSSxrQkFBUSxDQUFDLEVBQUUsQ0FBQyxDQUFDO0lBRXBDLE1BQU0sVUFBVSxHQUFHLElBQUksb0JBQVUsQ0FBQyxFQUFFLElBQUksRUFBRSx1QkFBWSxFQUFFLEVBQUUsRUFBRSxJQUFJLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQztJQUV2RSxNQUFNLFVBQVUsR0FBRyxVQUFVLENBQUMsZ0JBQWdCLENBQUMsSUFBSSxDQUFDLENBQUMsU0FBUyxDQUFDO1FBQzdELENBQUMsT0FBTyxF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