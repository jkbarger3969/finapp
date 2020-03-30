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
const paymentMethodAdd_1 = require("../paymentMethod/paymentMethodAdd");
const paymentMethodUpdate_1 = require("../paymentMethod/paymentMethodUpdate");
const DocHistory_1 = require("../utils/DocHistory");
const standIns_1 = require("../utils/standIns");
const utils_1 = require("./utils");
const pubSubs_1 = require("./pubSubs");
const NULLISH = Symbol();
const journalEntryUpdate = (doc, args, context, info) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const { id, fields: { date: dateString, department: departmentId, type, category: categoryId, paymentMethod: paymentMethodId, source, description, total, reconciled }, paymentMethodAdd, paymentMethodUpdate } = args;
    const { db, nodeMap, user, pubSub } = context;
    const docHistory = new DocHistory_1.default({ node: standIns_1.userNodeType, id: user.id });
    // Date
    if (dateString) {
        const date = moment(dateString, moment.ISO_8601);
        if (!date.isValid()) {
            throw new Error(`Date "${dateString}" not a valid ISO 8601 date string.`);
        }
        docHistory.updateValue("date", date.toDate());
    }
    // Type
    if (((type !== null && type !== void 0 ? type : NULLISH)) !== NULLISH) {
        docHistory.updateValue("type", type);
    }
    // Description
    if ((_a = description) === null || _a === void 0 ? void 0 : _a.trim()) {
        docHistory.updateValue("description", description);
    }
    // Total
    if (total) {
        docHistory.updateValue("total", total);
    }
    // Reconciled
    if (((reconciled !== null && reconciled !== void 0 ? reconciled : NULLISH)) !== NULLISH) {
        docHistory.updateValue("reconciled", reconciled);
    }
    // Async ref validation
    const updateChecks = [];
    // Department
    if (departmentId) {
        updateChecks.push((() => __awaiter(void 0, void 0, void 0, function* () {
            const { collection, id: node } = nodeMap.typename.get("Department");
            const id = new mongodb_1.ObjectID(departmentId);
            if (!(yield db
                .collection(collection)
                .findOne({ _id: id }, { projection: { _id: true } }))) {
                throw new Error(`Department with id ${departmentId} does not exist.`);
            }
            docHistory.updateValue("department", {
                node: new mongodb_1.ObjectID(node),
                id
            });
        }))());
    }
    // Source
    if (source) {
        const { id: sourceId, sourceType } = source;
        updateChecks.push((() => __awaiter(void 0, void 0, void 0, function* () {
            const { collection, node } = utils_1.getSrcCollectionAndNode(db, sourceType, nodeMap);
            const id = new mongodb_1.ObjectID(sourceId);
            if (!(yield collection.findOne({ _id: id }, { projection: { _id: true } }))) {
                throw new Error(`Source type "${sourceType}" with id ${sourceId} does not exist.`);
            }
            docHistory.updateValue("source", {
                node,
                id
            });
        }))());
    }
    // Category
    if (categoryId) {
        updateChecks.push((() => __awaiter(void 0, void 0, void 0, function* () {
            const { collection, id: node } = nodeMap.typename.get("JournalEntryCategory");
            const id = new mongodb_1.ObjectID(categoryId);
            if (!(yield db
                .collection(collection)
                .findOne({ _id: id }, { projection: { _id: true } }))) {
                throw new Error(`Category with id ${categoryId} does not exist.`);
            }
            docHistory.updateValue("category", {
                node: new mongodb_1.ObjectID(node),
                id
            });
        }))());
    }
    // Payment method
    updateChecks.push((() => __awaiter(void 0, void 0, void 0, function* () {
        let id;
        if (paymentMethodAdd) {
            // Add payment method
            id = new mongodb_1.ObjectID(yield paymentMethodAdd_1.default(doc, { fields: paymentMethodAdd }, context, info).then(({ id }) => id));
        }
        else if (paymentMethodUpdate) {
            id = new mongodb_1.ObjectID(paymentMethodUpdate.id);
            // Update payment method
            yield paymentMethodUpdate_1.default(doc, {
                id: paymentMethodUpdate.id,
                fields: paymentMethodUpdate.fields
            }, context, info);
        }
        else if (paymentMethodId) {
            id = new mongodb_1.ObjectID(paymentMethodId);
        }
        if (id) {
            const { collection, id: node } = nodeMap.typename.get("PaymentMethod");
            if (!(yield db
                .collection(collection)
                .findOne({ _id: id }, { projection: { _id: true } }))) {
                throw new Error(`Payment method with id ${id.toHexString()} does not exist.`);
            }
            docHistory.updateValue("paymentMethod", {
                node: new mongodb_1.ObjectID(node),
                id
            });
        }
    }))());
    yield Promise.all(updateChecks);
    if (!docHistory.hasUpdate) {
        throw new Error(`Mutation "journalEntryUpdate" requires at least one of the following fields: "date", "source", "category", "department", "total", "type", "reconciled", or "paymentMethod".`);
    }
    const $push = docHistory.updatePushArg;
    const _id = new mongodb_1.ObjectID(id);
    const { modifiedCount } = yield db
        .collection("journalEntries")
        .updateOne({ _id }, { $push });
    if (modifiedCount === 0) {
        throw new Error(`Failed to update journal entry: "${JSON.stringify(args)}".`);
    }
    const [updatedDoc] = yield db
        .collection("journalEntries")
        .aggregate([{ $match: { _id } }, { $addFields: utils_1.$addFields }])
        .toArray();
    pubSub
        .publish(pubSubs_1.JOURNAL_ENTRY_UPDATED, { journalEntryUpdated: updatedDoc })
        .catch(error => console.error(error));
    return updatedDoc;
});
exports.default = journalEntryUpdate;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiam91cm5hbEVudHJ5VXBkYXRlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL3Jlc29sdmVycy9qb3VybmFsRW50cnkvam91cm5hbEVudHJ5VXBkYXRlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7O0FBQUEscUNBQW1DO0FBQ25DLGlDQUFpQztBQUdqQyx3RUFBeUU7QUFDekUsOEVBQStFO0FBQy9FLG9EQUE2QztBQUM3QyxnREFBaUQ7QUFDakQsbUNBQThEO0FBQzlELHVDQUFrRDtBQUVsRCxNQUFNLE9BQU8sR0FBRyxNQUFNLEVBQUUsQ0FBQztBQUV6QixNQUFNLGtCQUFrQixHQUE0QyxDQUNsRSxHQUFHLEVBQ0gsSUFBSSxFQUNKLE9BQU8sRUFDUCxJQUFJLEVBQ0osRUFBRTs7SUFDRixNQUFNLEVBQ0osRUFBRSxFQUNGLE1BQU0sRUFBRSxFQUNOLElBQUksRUFBRSxVQUFVLEVBQ2hCLFVBQVUsRUFBRSxZQUFZLEVBQ3hCLElBQUksRUFDSixRQUFRLEVBQUUsVUFBVSxFQUNwQixhQUFhLEVBQUUsZUFBZSxFQUM5QixNQUFNLEVBQ04sV0FBVyxFQUNYLEtBQUssRUFDTCxVQUFVLEVBQ1gsRUFDRCxnQkFBZ0IsRUFDaEIsbUJBQW1CLEVBQ3BCLEdBQUcsSUFBSSxDQUFDO0lBRVQsTUFBTSxFQUFFLEVBQUUsRUFBRSxPQUFPLEVBQUUsSUFBSSxFQUFFLE1BQU0sRUFBRSxHQUFHLE9BQU8sQ0FBQztJQUU5QyxNQUFNLFVBQVUsR0FBRyxJQUFJLG9CQUFVLENBQUMsRUFBRSxJQUFJLEVBQUUsdUJBQVksRUFBRSxFQUFFLEVBQUUsSUFBSSxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUM7SUFFdkUsT0FBTztJQUNQLElBQUksVUFBVSxFQUFFO1FBQ2QsTUFBTSxJQUFJLEdBQUcsTUFBTSxDQUFDLFVBQVUsRUFBRSxNQUFNLENBQUMsUUFBUSxDQUFDLENBQUM7UUFDakQsSUFBSSxDQUFDLElBQUksQ0FBQyxPQUFP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