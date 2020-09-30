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
const pubSubs_1 = require("./journalEntry/pubSubs");
const journalEntry_1 = require("./journalEntry/journalEntry");
const userNodeType = new mongodb_1.ObjectId("5dca0427bccd5c6f26b0cde2");
exports.journalEntryUpdate = (parent, args, context, info) => __awaiter(void 0, void 0, void 0, function* () {
    const { id, fields } = args;
    const { db, nodeMap, user, pubSub } = context;
    const createdBy = {
        node: userNodeType,
        id: user.id,
    };
    const createdOn = new Date();
    const lastUpdate = createdOn;
    const $push = {};
    const updateQuery = {
        $set: {
            lastUpdate,
        },
        $push,
    };
    const { date: dateString = null, source = null, department: departmentId = null, total = null, category: categoryId = null, paymentMethod: paymentMethodId = null, description = null, reconciled = null, type = null, } = fields;
    let numFieldsToUpdate = 0;
    if (dateString !== null) {
        numFieldsToUpdate++;
        const date = moment(dateString, moment.ISO_8601);
        if (!date.isValid()) {
            throw new Error(`Mutation "journalEntryUpdate" date argument "${dateString}" not a valid ISO 8601 date string.`);
        }
        $push["date"] = {
            $each: [
                {
                    value: date.toDate(),
                    createdBy,
                    createdOn,
                },
            ],
            $position: 0,
        };
    }
    if (source !== null) {
        numFieldsToUpdate++;
        const { id: sourceId, sourceType } = source;
        const id = new mongodb_1.ObjectId(sourceId);
        const value = { id };
        let collection;
        switch (sourceType) {
            case graphTypes_1.JournalEntrySourceType.Business:
                if (nodeMap.typename.has("Business")) {
                    const nodeInfo = nodeMap.typename.get("Business");
                    collection = nodeInfo.collection;
                    value.node = new mongodb_1.ObjectId(nodeInfo.id);
                }
                break;
            case graphTypes_1.JournalEntrySourceType.Department:
                if (nodeMap.typename.has("Department")) {
                    const nodeInfo = nodeMap.typename.get("Department");
                    collection = nodeInfo.collection;
                    value.node = new mongodb_1.ObjectId(nodeInfo.id);
                }
                break;
            case graphTypes_1.JournalEntrySourceType.Person:
                if (nodeMap.typename.has("Person")) {
                    const nodeInfo = nodeMap.typename.get("Person");
                    collection = nodeInfo.collection;
                    value.node = new mongodb_1.ObjectId(nodeInfo.id);
                }
                break;
        }
        // Confirm id exists in node
        if (0 === (yield db.collection(collection).find({ _id: id }).limit(1).count())) {
            throw new Error(`Mutation "journalEntryUpdate" source type "${sourceType}" with id ${sourceId} does not exist.`);
        }
        else if (value.node === undefined) {
            throw new Error(`Mutation "journalEntryUpdate" source type "${sourceType}" not found.`);
        }
        $push["source"] = {
            $each: [
                {
                    value,
                    createdBy,
                    createdOn,
                },
            ],
            $position: 0,
        };
    }
    if (departmentId !== null) {
        numFieldsToUpdate++;
        const { collection, id: node } = nodeMap.typename.get("Department");
        const id = new mongodb_1.ObjectId(departmentId);
        if (0 === (yield db.collection(collection).find({ _id: id }).limit(1).count())) {
            throw new Error(`Mutation "journalEntryUpdate" type "Department" with id ${departmentId} does not exist.`);
        }
        $push["department"] = {
            $each: [
                {
                    value: {
                        node: new mongodb_1.ObjectId(node),
                        id,
                    },
                    createdBy,
                    createdOn,
                },
            ],
            $position: 0,
        };
    }
    if (total !== null) {
        numFieldsToUpdate++;
        $push["total"] = {
            $each: [
                {
                    value: total,
                    createdBy,
                    createdOn,
                },
            ],
            $position: 0,
        };
    }
    if (type !== null) {
        numFieldsToUpdate++;
        const value = type === graphTypes_1.JournalEntryType.Credit ? "credit" : "debit";
        $push["type"] = {
            $each: [
                {
                    value,
                    createdBy,
                    createdOn,
                },
            ],
            $position: 0,
        };
        if (categoryId === null) {
            const cats = yield db
                .collection("journalEntries")
                .aggregate([
                { $match: { _id: new mongodb_1.ObjectId(id) } },
                {
                    $addFields: { catId: { $arrayElemAt: ["$category.value.id", 0] } },
                },
                {
                    $lookup: {
                        from: "journalEntryCategories",
                        localField: "catId",
                        foreignField: "_id",
                        as: "cats",
                    },
                },
                { $project: { cats: true } },
            ])
                .next();
            if (value !== cats.cats[0].type) {
                throw new Error(`Mutation "journalEntryUpdate" "JournalEntryType" must match "JournalEntryCategory" type.`);
            }
        }
    }
    if (categoryId !== null) {
        numFieldsToUpdate++;
        const { collection, id: node } = nodeMap.typename.get("JournalEntryCategory");
        const catObjId = new mongodb_1.ObjectId(categoryId);
        const category = yield db.collection(collection).findOne({ _id: catObjId }, {
            projection: { type: true },
        });
        if (!category) {
            throw new Error(`Mutation "journalEntryUpdate" type "JournalEntryCategory" with id ${categoryId} does not exist.`);
        }
        $push["category"] = {
            $each: [
                {
                    value: {
                        node: new mongodb_1.ObjectId(node),
                        id: catObjId,
                    },
                    createdBy,
                    createdOn,
                },
            ],
            $position: 0,
        };
        let typeValue;
        if (type === null) {
            const entry = yield db
                .collection("journalEntries")
                .aggregate([
                { $match: { _id: new mongodb_1.ObjectId(id) } },
                { $addFields: { type: { $arrayElemAt: ["$type.value", 0] } } },
                { $project: { type: true } },
            ])
                .next();
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
        const id = new mongodb_1.ObjectId(paymentMethodId);
        if (0 === (yield db.collection(collection).find({ _id: id }).limit(1).count())) {
            throw new Error(`Mutation "journalEntryUpdate" type "PaymentMethod" with id ${paymentMethodId} does not exist.`);
        }
        $push["paymentMethod"] = {
            $each: [
                {
                    value: {
                        node: new mongodb_1.ObjectId(node),
                        id,
                    },
                    createdBy,
                    createdOn,
                },
            ],
            $position: 0,
        };
    }
    if (description !== null) {
        numFieldsToUpdate++;
        $push["description"] = {
            $each: [
                {
                    value: description,
                    createdBy,
                    createdOn,
                },
            ],
            $position: 0,
        };
    }
    if (reconciled !== null) {
        numFieldsToUpdate++;
        $push["reconciled"] = {
            $each: [
                {
                    value: reconciled,
                    createdBy,
                    createdOn,
                },
            ],
            $position: 0,
        };
    }
    if (numFieldsToUpdate === 0) {
        throw new Error(`Mutation "journalEntryUpdate" requires at least one of the following fields: "date", "source", "category", "department", "total", "type", or "paymentMethod"`);
    }
    const { modifiedCount } = yield db
        .collection("journalEntries")
        .updateOne({ _id: new mongodb_1.ObjectId(id) }, updateQuery);
    if (modifiedCount === 0) {
        throw new Error(`Mutation "journalEntryUpdate" arguments "${JSON.stringify(args)}" failed.`);
    }
    const doc = yield db
        .collection("journalEntries")
        .aggregate([{ $match: { _id: new mongodb_1.ObjectId(id) } }, utils_1.addFields, utils_1.project])
        .toArray();
    pubSub
        .publish(pubSubs_1.JOURNAL_ENTRY_UPDATED, { journalEntryUpdated: doc[0] })
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
        id: user.id,
    };
    const insertDoc = {
        total: [
            {
                value: total,
                createdBy,
                createdOn,
            },
        ],
        type: [
            {
                value: type === graphTypes_1.JournalEntryType.Credit ? "credit" : "debit",
                createdBy,
                createdOn,
            },
        ],
        lastUpdate,
        createdOn,
        createdBy,
        deleted: [
            {
                value: false,
                createdBy,
                createdOn,
            },
        ],
        reconciled: [
            {
                value: reconciled,
                createdBy,
                createdOn,
            },
        ],
    };
    // Description
    if (description) {
        insertDoc["description"] = [
            {
                value: description,
                createdBy,
                createdOn,
            },
        ];
    }
    else {
        insertDoc["description"] = [];
    }
    // Date
    const date = moment(dateString, moment.ISO_8601);
    if (!date.isValid()) {
        throw new Error(`Mutation "journalEntryAdd" date argument "${dateString}" not a valid ISO 8601 date string.`);
    }
    insertDoc["date"] = [
        {
            value: date.toDate(),
            createdBy,
            createdOn,
        },
    ];
    // Department
    {
        const { collection, id: node } = nodeMap.typename.get("Department");
        const id = new mongodb_1.ObjectId(departmentId);
        if (0 === (yield db.collection(collection).find({ _id: id }).limit(1).count())) {
            throw new Error(`Mutation "journalEntryAdd" type "Department" with id ${departmentId} does not exist.`);
        }
        insertDoc["department"] = [
            {
                value: {
                    node: new mongodb_1.ObjectId(node),
                    id,
                },
                createdBy,
                createdOn,
            },
        ];
    }
    // JournalEntryCategory
    {
        const { collection, id: node } = nodeMap.typename.get("JournalEntryCategory");
        const id = new mongodb_1.ObjectId(categoryId);
        if (0 === (yield db.collection(collection).find({ _id: id }).limit(1).count())) {
            throw new Error(`Mutation "journalEntryAdd" type "JournalEntryCategory" with id ${categoryId} does not exist.`);
        }
        insertDoc["category"] = [
            {
                value: {
                    node: new mongodb_1.ObjectId(node),
                    id,
                },
                createdBy,
                createdOn,
            },
        ];
    }
    // JournalEntrySource
    {
        const id = new mongodb_1.ObjectId(sourceId);
        const value = { id };
        let collection;
        switch (sourceType) {
            case graphTypes_1.JournalEntrySourceType.Business:
                if (nodeMap.typename.has("Business")) {
                    const nodeInfo = nodeMap.typename.get("Business");
                    collection = nodeInfo.collection;
                    value.node = new mongodb_1.ObjectId(nodeInfo.id);
                }
                break;
            case graphTypes_1.JournalEntrySourceType.Department:
                if (nodeMap.typename.has("Department")) {
                    const nodeInfo = nodeMap.typename.get("Department");
                    collection = nodeInfo.collection;
                    value.node = new mongodb_1.ObjectId(nodeInfo.id);
                }
                break;
            case graphTypes_1.JournalEntrySourceType.Person:
                if (nodeMap.typename.has("Person")) {
                    const nodeInfo = nodeMap.typename.get("Person");
                    collection = nodeInfo.collection;
                    value.node = new mongodb_1.ObjectId(nodeInfo.id);
                }
                break;
        }
        // Confirm id exists in node
        if (0 === (yield db.collection(collection).find({ _id: id }).limit(1).count())) {
            throw new Error(`Mutation "journalEntryAdd" source type "${sourceType}" with id ${sourceId} does not exist.`);
        }
        else if (value.node === undefined) {
            throw new Error(`Mutation "journalEntryAdd" source type "${sourceType}" not found.`);
        }
        insertDoc["source"] = [
            {
                value,
                createdBy,
                createdOn,
            },
        ];
    }
    // PaymentMethod
    {
        const { collection, id: node } = nodeMap.typename.get("PaymentMethod");
        const id = new mongodb_1.ObjectId(paymentMethodId);
        if (0 === (yield db.collection(collection).find({ _id: id }).limit(1).count())) {
            throw new Error(`Mutation "journalEntryAdd" type "PaymentMethod" with id ${paymentMethodId} does not exist.`);
        }
        insertDoc["paymentMethod"] = [
            {
                value: {
                    node: new mongodb_1.ObjectId(node),
                    id,
                },
                createdBy,
                createdOn,
            },
        ];
    }
    const { insertedId, insertedCount } = yield db
        .collection("journalEntries")
        .insertOne(insertDoc);
    if (insertedCount === 0) {
        throw new Error(`Mutation "journalEntryAdd" arguments "${JSON.stringify(args)}" failed.`);
    }
    const newEntry = yield db
        .collection("journalEntries")
        .aggregate([{ $match: { _id: insertedId } }, utils_1.addFields, utils_1.project])
        .toArray();
    pubSub
        .publish(pubSubs_1.JOURNAL_ENTRY_ADDED, { journalEntryAdded: newEntry[0] })
        .catch((error) => console.error(error));
    return newEntry[0];
});
exports.journalEntryDelete = (parent, args, context, info) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = args;
    const { db, user, pubSub } = context;
    const createdBy = {
        node: userNodeType,
        id: user.id,
    };
    const createdOn = new Date();
    const lastUpdate = createdOn;
    const updateQuery = {
        $set: {
            lastUpdate,
        },
        $push: {
            deleted: {
                $each: [
                    {
                        value: true,
                        createdBy,
                        createdOn,
                    },
                ],
                $position: 0,
            },
        },
    };
    const _id = new mongodb_1.ObjectId(id);
    const { modifiedCount } = yield db
        .collection("journalEntries")
        .updateOne({ _id }, updateQuery);
    if (modifiedCount === 0) {
        throw new Error(`Mutation "journalEntryDelete" arguments "${JSON.stringify(args)}" failed.`);
    }
    // const [doc] = await db
    //   .collection("journalEntries")
    //   .aggregate([{ $match: { _id } }, addFields, project])
    //   .toArray();
    const doc = yield journalEntry_1.default(parent, { id }, context, info);
    pubSub
        .publish(pubSubs_1.JOURNAL_ENTRY_UPDATED, { journalEntryUpdated: doc })
        .catch((error) => console.error(error));
    pubSub
        .publish(pubSubs_1.JOURNAL_ENTRY_UPSERTED, { journalEntryUpserted: doc })
        .catch((error) => console.error(error));
    return doc;
});
exports.JournalEntry = {
    type: (parent) => parent.type === "credit"
        ? graphTypes_1.JournalEntryType.Credit
        : graphTypes_1.JournalEntryType.Debit,
    department: nodeResolver_1.nodeFieldResolver,
    category: nodeResolver_1.nodeFieldResolver,
    paymentMethod: nodeResolver_1.nodeFieldResolver,
    source: nodeResolver_1.nodeFieldResolver,
    date: (parent, args, context, info) => {
        return parent.date.toISOString();
    },
    lastUpdate: (parent, args, context, info) => {
        return parent.lastUpdate.toISOString();
    },
};
exports.journalEntryAdded = {
    subscribe: (_, __, { pubSub }) => pubSub.asyncIterator(pubSubs_1.JOURNAL_ENTRY_ADDED),
};
exports.journalEntryUpdated = {
    subscribe: (_, __, { pubSub }) => pubSub.asyncIterator(pubSubs_1.JOURNAL_ENTRY_UPDATED),
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiam91cm5hbEVudHJ5LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL3Jlc29sdmVycy9qb3VybmFsRW50cnkudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7QUFBQSxxQ0FBbUM7QUFDbkMsaUNBQWlDO0FBR2pDLDhDQU91QjtBQUN2Qix1REFBeUQ7QUFFekQsZ0RBQTBEO0FBQzFELG9EQUlnQztBQUNoQyw4REFBdUQ7QUFFdkQsTUFBTSxZQUFZLEdBQUcsSUFBSSxrQkFBUSxDQUFDLDBCQUEwQixDQUFDLENBQUM7QUFFakQsUUFBQSxrQkFBa0IsR0FBNEMsQ0FDekUsTUFBTSxFQUNOLElBQUksRUFDSixPQUFPLEVBQ1AsSUFBSSxFQUNKLEVBQUU7SUFDRixNQUFNLEVBQUUsRUFBRSxFQUFFLE1BQU0sRUFBRSxHQUFHLElBQUksQ0FBQztJQUM1QixNQUFNLEVBQUUsRUFBRSxFQUFFLE9BQU8sRUFBRSxJQUFJLEVBQUUsTUFBTSxFQUFFLEdBQUcsT0FBTyxDQUFDO0lBRTlDLE1BQU0sU0FBUyxHQUFHO1FBQ2hCLElBQUksRUFBRSxZQUFZO1FBQ2xCLEVBQUUsRUFBRSxJQUFJLENBQUMsRUFBRTtLQUNaLENBQUM7SUFFRixNQUFNLFNBQVMsR0FBRyxJQUFJLElBQUksRUFBRSxDQUFDO0lBQzdCLE1BQU0sVUFBVSxHQUFHLFNBQVMsQ0FBQztJQUU3QixNQUFNLEtBQUssR0FBRyxFQUFFLENBQUM7SUFFakIsTUFBTSxXQUFXLEdBQUc7UUFDbEIsSUFBSSxFQUFFO1lBQ0osVUFBVTtTQUNYO1FBQ0QsS0FBSztLQUNOLENBQUM7SUFFRixNQUFNLEVBQ0osSUFBSSxFQUFFLFVBQVUsR0FBRyxJQUFJLEVBQ3ZCLE1BQU0sR0FBRyxJQUFJLEVBQ2IsVUFBVSxFQUFFLFlBQVksR0FBRyxJQUFJLEVBQy9CLEtBQUssR0FBRyxJQUFJLEVBQ1osUUFBUSxFQUFFLFVBQVUsR0FBRyxJQUFJLEVBQzNCLGFBQWEsRUFBRSxlQUFlLEdB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