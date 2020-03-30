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
const moment = require("moment");
const graphTypes_1 = require("../../graphTypes");
const paymentMethodAdd_1 = require("../paymentMethod/paymentMethodAdd");
const DocHistory_1 = require("../utils/DocHistory");
const standIns_1 = require("../utils/standIns");
const utils_1 = require("./utils");
const pubSubs_1 = require("./pubSubs");
const journalEntryAdd = (doc, args, context, info) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const { fields: { date: dateString, department: departmentId, type, category: categoryId, source: { id: sourceId, sourceType }, description, total }, paymentMethodAdd } = args;
    const date = moment(dateString, moment.ISO_8601);
    if (!date.isValid()) {
        throw new Error(`Date "${dateString}" not a valid ISO 8601 date string.`);
    }
    const reconciled = (_a = args.fields.reconciled, (_a !== null && _a !== void 0 ? _a : false));
    const { db, user, nodeMap, pubSub } = context;
    const docHistory = new DocHistory_1.default({ node: standIns_1.userNodeType, id: user.id });
    //Start building insert doc
    const insertDoc = Object.assign({ date: docHistory.addValue(date.toDate()), total: docHistory.addValue(total), type: docHistory.addValue(type === graphTypes_1.JournalEntryType.Credit ? "credit" : "debit"), description: description ? docHistory.addValue(description) : [], deleted: docHistory.addValue(false), reconciled: docHistory.addValue(reconciled) }, docHistory.rootHistoryObject);
    // Insure doc refs exist and finish insert doc
    yield Promise.all([
        // Department
        (() => __awaiter(void 0, void 0, void 0, function* () {
            const { collection, id: node } = nodeMap.typename.get("Department");
            const id = new mongodb_1.ObjectID(departmentId);
            if (!(yield db
                .collection(collection)
                .findOne({ _id: id }, { projection: { _id: true } }))) {
                throw new Error(`Department with id ${departmentId} does not exist.`);
            }
            insertDoc["department"] = docHistory.addValue({
                node: new mongodb_1.ObjectID(node),
                id
            });
        }))(),
        // Source
        (() => __awaiter(void 0, void 0, void 0, function* () {
            const { collection, node } = utils_1.getSrcCollectionAndNode(db, sourceType, nodeMap);
            const id = new mongodb_1.ObjectID(sourceId);
            if (!(yield collection.findOne({ _id: id }, { projection: { _id: true } }))) {
                throw new Error(`Source type "${sourceType}" with id ${sourceId} does not exist.`);
            }
            insertDoc["source"] = docHistory.addValue({
                node,
                id
            });
        }))(),
        // Category
        (() => __awaiter(void 0, void 0, void 0, function* () {
            const { collection, id: node } = nodeMap.typename.get("JournalEntryCategory");
            const id = new mongodb_1.ObjectID(categoryId);
            if (!(yield db
                .collection(collection)
                .findOne({ _id: id }, { projection: { _id: true } }))) {
                throw new Error(`Category with id ${categoryId} does not exist.`);
            }
            insertDoc["category"] = docHistory.addValue({
                node: new mongodb_1.ObjectID(node),
                id
            });
        }))(),
        // PaymentMethod
        (() => __awaiter(void 0, void 0, void 0, function* () {
            const { collection, id: node } = nodeMap.typename.get("PaymentMethod");
            const id = new mongodb_1.ObjectID(paymentMethodAdd
                ? yield paymentMethodAdd_1.default(doc, { fields: paymentMethodAdd }, context, info).then(({ id }) => id)
                : args.fields.paymentMethod);
            if (!(yield db
                .collection(collection)
                .findOne({ _id: id }, { projection: { _id: true } }))) {
                throw new Error(`Payment method with id ${id.toHexString()} does not exist.`);
            }
            insertDoc["paymentMethod"] = docHistory.addValue({
                node: new mongodb_1.ObjectID(node),
                id
            });
        }))()
    ]);
    const { insertedId, insertedCount } = yield db
        .collection("journalEntries")
        .insertOne(insertDoc);
    if (insertedCount === 0) {
        throw new Error(`Failed to add journal entry: "${JSON.stringify(args, null, 2)}".`);
    }
    const [newEntry] = yield db
        .collection("journalEntries")
        .aggregate([{ $match: { _id: insertedId } }, { $addFields: utils_1.$addFields }])
        .toArray();
    pubSub
        .publish(pubSubs_1.JOURNAL_ENTRY_ADDED, { journalEntryAdded: newEntry })
        .catch(error => console.error(error));
    return newEntry;
});
exports.default = journalEntryAdd;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiam91cm5hbEVudHJ5QWRkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL3Jlc29sdmVycy9qb3VybmFsRW50cnkvam91cm5hbEVudHJ5QWRkLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7O0FBQUEscUNBQW1DO0FBQ25DLGlDQUFpQztBQUVqQyxpREFLMEI7QUFDMUIsd0VBQXlFO0FBQ3pFLG9EQUc2QjtBQUM3QixnREFBaUQ7QUFDakQsbUNBQThEO0FBRTlELHVDQUFnRDtBQWNoRCxNQUFNLGVBQWUsR0FBeUMsQ0FDNUQsR0FBRyxFQUNILElBQUksRUFDSixPQUFPLEVBQ1AsSUFBSSxFQUNKLEVBQUU7O0lBQ0YsTUFBTSxFQUNKLE1BQU0sRUFBRSxFQUNOLElBQUksRUFBRSxVQUFVLEVBQ2hCLFVBQVUsRUFBRSxZQUFZLEVBQ3hCLElBQUksRUFDSixRQUFRLEVBQUUsVUFBVSxFQUNwQixNQUFNLEVBQUUsRUFBRSxFQUFFLEVBQUUsUUFBUSxFQUFFLFVBQVUsRUFBRSxFQUNwQyxXQUFXLEVBQ1gsS0FBSyxFQUNOLEVBQ0QsZ0JBQWdCLEVBQ2pCLEdBQUcsSUFBSSxDQUFDO0lBRVQsTUFBTSxJQUFJLEdBQUcsTUFBTSxDQUFDLFVBQVUsRUFBRSxNQUFNLENBQUMsUUFBUSxDQUFDLENBQUM7SUFDakQsSUFBSSxDQUFDLElBQUksQ0FBQyxPQUFPLEVBQUUsRUFBRTtRQUNuQixNQUFNLElBQUksS0FBSyxDQUFDLFNBQVMsVUFBVSxxQ0FBcUMsQ0FBQyxDQUFDO0tBQzNFO0lBRUQsTUFBTSxVQUFVLFNBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxVQUFVLHVDQUFJLEtBQUssRUFBQSxDQUFDO0lBRW5ELE1BQU0sRUFBRSxFQUFFLEVBQUUsSUFBSSxFQUFFLE9BQU8sRUFBRSxNQUFNLEVBQUUsR0FBRyxPQUFPLENBQUM7SUFFOUMsTUFBTSxVQUFVLEdBQUcsSUFBSSxvQkFBVSxDQUFDLEVBQUUsSUFBSSxFQUFFLHVC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