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
const graphTypes_1 = require("../graphTypes");
const nodeResolver_1 = require("./utils/nodeResolver");
const utils_1 = require("./journalEntry/utils");
const JOURNAL_ENTRY_ADDED = "JOURNAL_ENTRY_ADDED";
const JOURNAL_ENTRY_UPDATED = "JOURNAL_ENTRY_UPDATED";
const userNodeType = new mongodb_1.ObjectID("5dca0427bccd5c6f26b0cde2");
exports.journalEntryUpdate = (parent, args, context, info) => __awaiter(void 0, void 0, void 0, function* () {
    const { id, fields } = args;
    const { db, nodeMap, user, pubSub } = context;
    const createdBy = {
        node: userNodeType,
        id: user.id
    };
    const createdOn = new Date();
    const lastUpdate = createdOn;
    const $push = {};
    const updateQuery = {
        $set: {
            lastUpdate,
        },
        $push
    };
    const { date: dateString = null, source = null, department: departmentId = null, total = null, category: categoryId = null, paymentMethod: paymentMethodId = null, description = null, reconciled = null, type = null } = fields;
    let numFieldsToUpdate = 0;
    if (dateString !== null) {
        numFieldsToUpdate++;
        const date = moment(dateString, moment.ISO_8601);
        if (!date.isValid()) {
            throw new Error(`Mutation "journalEntryUpdate" date argument "${dateString}" not a valid ISO 8601 date string.`);
        }
        $push["date"] = {
            $each: [{
                    value: date.toDate(),
                    createdBy,
                    createdOn,
                }],
            $position: 0
        };
    }
    if (source !== null) {
        numFieldsToUpdate++;
        const { id: sourceId, sourceType } = source;
        const id = new mongodb_1.ObjectID(sourceId);
        const value = { id };
        let collection;
        switch (sourceType) {
            case graphTypes_1.JournalEntrySourceType.Business:
                if (nodeMap.typename.has("Business")) {
                    const nodeInfo = nodeMap.typename.get("Business");
                    collection = nodeInfo.collection;
                    value.node = new mongodb_1.ObjectID(nodeInfo.id);
                }
                break;
            case graphTypes_1.JournalEntrySourceType.Department:
                if (nodeMap.typename.has("Department")) {
                    const nodeInfo = nodeMap.typename.get("Department");
                    collection = nodeInfo.collection;
                    value.node = new mongodb_1.ObjectID(nodeInfo.id);
                }
                break;
            case graphTypes_1.JournalEntrySourceType.Person:
                if (nodeMap.typename.has("Person")) {
                    const nodeInfo = nodeMap.typename.get("Person");
                    collection = nodeInfo.collection;
                    value.node = new mongodb_1.ObjectID(nodeInfo.id);
                }
                break;
        }
        // Confirm id exists in node
        if (0 === (yield db.collection(collection).find({ _id: id })
            .limit(1).count())) {
            throw new Error(`Mutation "journalEntryUpdate" source type "${sourceType}" with id ${sourceId} does not exist.`);
        }
        else if (value.node === undefined) {
            throw new Error(`Mutation "journalEntryUpdate" source type "${sourceType}" not found.`);
        }
        $push["source"] = {
            $each: [{
                    value,
                    createdBy,
                    createdOn,
                }],
            $position: 0
        };
    }
    if (departmentId !== null) {
        numFieldsToUpdate++;
        const { collection, id: node } = nodeMap.typename.get("Department");
        const id = new mongodb_1.ObjectID(departmentId);
        if (0 === (yield db.collection(collection)
            .find({ _id: id }).limit(1).count())) {
            throw new Error(`Mutation "journalEntryUpdate" type "Department" with id ${departmentId} does not exist.`);
        }
        $push["department"] = {
            $each: [{
                    value: {
                        node: new mongodb_1.ObjectID(node),
                        id
                    },
                    createdBy,
                    createdOn,
                }],
            $position: 0
        };
    }
    if (total !== null) {
        numFieldsToUpdate++;
        $push["total"] = {
            $each: [{
                    value: total,
                    createdBy,
                    createdOn,
                }],
            $position: 0
        };
    }
    if (type !== null) {
        numFieldsToUpdate++;
        const value = type === graphTypes_1.JournalEntryType.Credit ? "credit" : "debit";
        $push["type"] = {
            $each: [{
                    value,
                    createdBy,
                    createdOn,
                }],
            $position: 0
        };
        if (categoryId === null) {
            const cats = yield db.collection("journalEntries").aggregate([
                { $match: { _id: new mongodb_1.ObjectID(id) } },
                { $addFields: { catId: { $arrayElemAt: ["$category.value.id", 0] } } },
                { $lookup: {
                        from: "journalEntryCategories",
                        localField: "catId",
                        foreignField: "_id",
                        as: "cats"
                    }
                },
                { $project: { cats: true } }
            ]).next();
            if (value !== cats.cats[0].type) {
                throw new Error(`Mutation "journalEntryUpdate" "JournalEntryType" must match "JournalEntryCategory" type.`);
            }
        }
    }
    if (categoryId !== null) {
        numFieldsToUpdate++;
        const { collection, id: node } = nodeMap.typename.get("JournalEntryCategory");
        const id = new mongodb_1.ObjectID(categoryId);
        const category = yield db.collection(collection).findOne({ _id: id }, {
            projection: { type: true }
        });
        if (!category) {
            throw new Error(`Mutation "journalEntryUpdate" type "JournalEntryCategory" with id ${categoryId} does not exist.`);
        }
        $push["category"] = {
            $each: [{
                    value: {
                        node: new mongodb_1.ObjectID(node),
                        id
                    },
                    createdBy,
                    createdOn,
                }],
            $position: 0
        };
        let typeValue;
        if (type === null) {
            const entry = yield db.collection("journalEntries").aggregate([
                { $match: { _id: new mongodb_1.ObjectID(id) } },
                { $addFields: { type: { $arrayElemAt: ["$type.value", 0] } } },
                { $project: { type: true } }
            ]).next();
            typeValue = entry.type;
        }
        else {
            typeValue = type === graphTypes_1.JournalEntryType.Credit ? "credit" : "debit";
        }
        if (category.type !== typeValue) {
            throw new Error(`Mutation "journalEntryUpdate" "JournalEntryType" must match "JournalEntryCategory" type.`);
        }
    }
    if (paymentMethodId !== null) {
        numFieldsToUpdate++;
        const { collection, id: node } = nodeMap.typename.get("PaymentMethod");
        const id = new mongodb_1.ObjectID(paymentMethodId);
        if (0 === (yield db.collection(collection)
            .find({ _id: id }).limit(1).count())) {
            throw new Error(`Mutation "journalEntryUpdate" type "PaymentMethod" with id ${paymentMethodId} does not exist.`);
        }
        $push["paymentMethod"] = {
            $each: [{
                    value: {
                        node: new mongodb_1.ObjectID(node),
                        id
                    },
                    createdBy,
                    createdOn,
                }],
            $position: 0
        };
    }
    if (description !== null) {
        numFieldsToUpdate++;
        $push["description"] = {
            $each: [{
                    value: description,
                    createdBy,
                    createdOn,
                }],
            $position: 0
        };
    }
    if (reconciled !== null) {
        numFieldsToUpdate++;
        $push["reconciled"] = {
            $each: [{
                    value: reconciled,
                    createdBy,
                    createdOn,
                }],
            $position: 0
        };
    }
    if (numFieldsToUpdate === 0) {
        throw new Error(`Mutation "journalEntryUpdate" requires at least one of the following fields: "date", "source", "category", "department", "total", "type", or "paymentMethod"`);
    }
    const { modifiedCount } = yield db.collection("journalEntries")
        .updateOne({ _id: new mongodb_1.ObjectID(id) }, updateQuery);
    if (modifiedCount === 0) {
        throw new Error(`Mutation "journalEntryUpdate" arguments "${JSON.stringify(args)}" failed.`);
    }
    const doc = yield db.collection("journalEntries")
        .aggregate([
        { $match: { _id: new mongodb_1.ObjectID(id) } },
        utils_1.addFields,
        utils_1.project
    ]).toArray();
    pubSub.publish(JOURNAL_ENTRY_UPDATED, { journalEntryUpdated: doc[0] })
        .catch((error) => console.error(error));
    return doc[0];
});
exports.journalEntryAdd = (parent, args, context, info) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const { date: dateString, department: departmentId, type, category: categoryId, source: { id: sourceId, sourceType }, description = null, paymentMethod: paymentMethodId, total, } = args.fields;
    const reconciled = (_a = args.fields.reconciled, (_a !== null && _a !== void 0 ? _a : false));
    const { db, user, nodeMap, pubSub } = context;
    const createdOn = new Date();
    const lastUpdate = createdOn;
    const createdBy = {
        node: userNodeType,
        id: user.id
    };
    const insertDoc = {
        total: [{
                value: total,
                createdBy,
                createdOn
            }],
        type: [{
                value: type === graphTypes_1.JournalEntryType.Credit ? "credit" : "debit",
                createdBy,
                createdOn
            }],
        lastUpdate,
        createdOn,
        createdBy,
        deleted: [{
                value: false,
                createdBy,
                createdOn
            }],
        reconciled: [{
                value: reconciled,
                createdBy,
                createdOn
            }],
    };
    // Description
    if (description) {
        insertDoc["description"] = [{
                value: description,
                createdBy,
                createdOn
            }];
    }
    else {
        insertDoc["description"] = [];
    }
    // Date
    const date = moment(dateString, moment.ISO_8601);
    if (!date.isValid()) {
        throw new Error(`Mutation "journalEntryAdd" date argument "${dateString}" not a valid ISO 8601 date string.`);
    }
    insertDoc["date"] = [{
            value: date.toDate(),
            createdBy,
            createdOn,
        }];
    // Department
    {
        const { collection, id: node } = nodeMap.typename.get("Department");
        const id = new mongodb_1.ObjectID(departmentId);
        if (0 === (yield db.collection(collection).find({ _id: id })
            .limit(1).count())) {
            throw new Error(`Mutation "journalEntryAdd" type "Department" with id ${departmentId} does not exist.`);
        }
        insertDoc["department"] = [{
                value: {
                    node: new mongodb_1.ObjectID(node),
                    id
                },
                createdBy,
                createdOn,
            }];
    }
    // JournalEntryCategory
    {
        const { collection, id: node } = nodeMap.typename.get("JournalEntryCategory");
        const id = new mongodb_1.ObjectID(categoryId);
        if (0 === (yield db.collection(collection).find({ _id: id })
            .limit(1).count())) {
            throw new Error(`Mutation "journalEntryAdd" type "JournalEntryCategory" with id ${categoryId} does not exist.`);
        }
        insertDoc["category"] = [{
                value: {
                    node: new mongodb_1.ObjectID(node),
                    id
                },
                createdBy,
                createdOn,
            }];
    }
    // JournalEntrySource
    {
        const id = new mongodb_1.ObjectID(sourceId);
        const value = { id };
        let collection;
        switch (sourceType) {
            case graphTypes_1.JournalEntrySourceType.Business:
                if (nodeMap.typename.has("Business")) {
                    const nodeInfo = nodeMap.typename.get("Business");
                    collection = nodeInfo.collection;
                    value.node = new mongodb_1.ObjectID(nodeInfo.id);
                }
                break;
            case graphTypes_1.JournalEntrySourceType.Department:
                if (nodeMap.typename.has("Department")) {
                    const nodeInfo = nodeMap.typename.get("Department");
                    collection = nodeInfo.collection;
                    value.node = new mongodb_1.ObjectID(nodeInfo.id);
                }
                break;
            case graphTypes_1.JournalEntrySourceType.Person:
                if (nodeMap.typename.has("Person")) {
                    const nodeInfo = nodeMap.typename.get("Person");
                    collection = nodeInfo.collection;
                    value.node = new mongodb_1.ObjectID(nodeInfo.id);
                }
                break;
        }
        // Confirm id exists in node
        if (0 === (yield db.collection(collection).find({ _id: id })
            .limit(1).count())) {
            throw new Error(`Mutation "journalEntryAdd" source type "${sourceType}" with id ${sourceId} does not exist.`);
        }
        else if (value.node === undefined) {
            throw new Error(`Mutation "journalEntryAdd" source type "${sourceType}" not found.`);
        }
        insertDoc["source"] = [{
                value,
                createdBy,
                createdOn,
            }];
    }
    // PaymentMethod
    {
        const { collection, id: node } = nodeMap.typename.get("PaymentMethod");
        const id = new mongodb_1.ObjectID(paymentMethodId);
        if (0 === (yield db.collection(collection)
            .find({ _id: id }).limit(1).count())) {
            throw new Error(`Mutation "journalEntryAdd" type "PaymentMethod" with id ${paymentMethodId} does not exist.`);
        }
        insertDoc["paymentMethod"] = [{
                value: {
                    node: new mongodb_1.ObjectID(node),
                    id
                },
                createdBy,
                createdOn,
            }];
    }
    const { insertedId, insertedCount } = yield db.collection("journalEntries").insertOne(insertDoc);
    if (insertedCount === 0) {
        throw new Error(`Mutation "journalEntryAdd" arguments "${JSON.stringify(args)}" failed.`);
    }
    const newEntry = yield db.collection("journalEntries").aggregate([
        { $match: { _id: insertedId } },
        utils_1.addFields,
        utils_1.project
    ]).toArray();
    pubSub.publish(JOURNAL_ENTRY_ADDED, { journalEntryAdded: newEntry[0] })
        .catch((error) => console.error(error));
    return newEntry[0];
});
exports.JournalEntry = {
    type: (parent) => parent.type === "credit" ?
        graphTypes_1.JournalEntryType.Credit : graphTypes_1.JournalEntryType.Debit,
    department: nodeResolver_1.nodeFieldResolver,
    category: nodeResolver_1.nodeFieldResolver,
    paymentMethod: nodeResolver_1.nodeFieldResolver,
    source: nodeResolver_1.nodeFieldResolver,
    date: (parent, args, context, info) => {
        return parent.date.toISOString();
    },
    lastUpdate: (parent, args, context, info) => {
        return parent.lastUpdate.toISOString();
    }
};
exports.journalEntryAdded = {
    subscribe: (_, __, { pubSub }) => pubSub.asyncIterator(JOURNAL_ENTRY_ADDED)
};
exports.journalEntryUpdated = {
    subscribe: (_, __, { pubSub }) => pubSub.asyncIterator(JOURNAL_ENTRY_UPDATED)
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiam91cm5hbEVudHJ5LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL3Jlc29sdmVycy9qb3VybmFsRW50cnkudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7QUFBQSxxQ0FBaUM7QUFDakMsaUNBQWlDO0FBR2pDLDhDQUV1QjtBQUN2Qix1REFBdUQ7QUFFdkQsZ0RBQXVEO0FBR3ZELE1BQU0sbUJBQW1CLEdBQUcscUJBQXFCLENBQUM7QUFDbEQsTUFBTSxxQkFBcUIsR0FBRyx1QkFBdUIsQ0FBQztBQUV0RCxNQUFNLFlBQVksR0FBRyxJQUFJLGtCQUFRLENBQUMsMEJBQTBCLENBQUMsQ0FBQztBQUVqRCxRQUFBLGtCQUFrQixHQUU3QixDQUFPLE1BQU0sRUFBRSxJQUFJLEVBQUUsT0FBTyxFQUFFLElBQUksRUFBRSxFQUFFO0lBR3RDLE1BQU0sRUFBQyxFQUFFLEVBQUUsTUFBTSxFQUFDLEdBQUcsSUFBSSxDQUFDO0lBQzFCLE1BQU0sRUFBQyxFQUFFLEVBQUUsT0FBTyxFQUFFLElBQUksRUFBRSxNQUFNLEVBQUMsR0FBRyxPQUFPLENBQUM7SUFFNUMsTUFBTSxTQUFTLEdBQUc7UUFDaEIsSUFBSSxFQUFFLFlBQVk7UUFDbEIsRUFBRSxFQUFFLElBQUksQ0FBQyxFQUFFO0tBQ1osQ0FBQztJQUVGLE1BQU0sU0FBUyxHQUFJLElBQUksSUFBSSxFQUFFLENBQUM7SUFDOUIsTUFBTSxVQUFVLEdBQUcsU0FBUyxDQUFDO0lBRTdCLE1BQU0sS0FBSyxHQUFHLEVBQUUsQ0FBQztJQUVqQixNQUFNLFdBQVcsR0FBRztRQUNsQixJQUFJLEVBQUM7WUFDSCxVQUFVO1NBQ1g7UUFDRCxLQUFLO0tBQ04sQ0FBQztJQUVGLE1BQU0sRUFBQyxJQUFJLEVBQUMsVUFBVSxHQUFHLElBQUksRUFBRSxNQUFNLEdBQUcsSUFBSSxFQUMxQyxVQUFVLEVBQUMsWUFBWSxHQUFHLElBQUksRUFBRSxLQUFLLEdBQUcsSUFBSSxFQUFFLFFBQVEs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