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
const userNodeType = new mongodb_1.ObjectID("5dca0427bccd5c6f26b0cde2");
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
        if (0 ===
            (yield db
                .collection(collection)
                .find({ _id: id })
                .limit(1)
                .count())) {
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
        const id = new mongodb_1.ObjectID(departmentId);
        if (0 ===
            (yield db
                .collection(collection)
                .find({ _id: id })
                .limit(1)
                .count())) {
            throw new Error(`Mutation "journalEntryUpdate" type "Department" with id ${departmentId} does not exist.`);
        }
        $push["department"] = {
            $each: [
                {
                    value: {
                        node: new mongodb_1.ObjectID(node),
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
                { $match: { _id: new mongodb_1.ObjectID(id) } },
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
        const catObjId = new mongodb_1.ObjectID(categoryId);
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
                        node: new mongodb_1.ObjectID(node),
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
                { $match: { _id: new mongodb_1.ObjectID(id) } },
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
        const id = new mongodb_1.ObjectID(paymentMethodId);
        if (0 ===
            (yield db
                .collection(collection)
                .find({ _id: id })
                .limit(1)
                .count())) {
            throw new Error(`Mutation "journalEntryUpdate" type "PaymentMethod" with id ${paymentMethodId} does not exist.`);
        }
        $push["paymentMethod"] = {
            $each: [
                {
                    value: {
                        node: new mongodb_1.ObjectID(node),
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
        .updateOne({ _id: new mongodb_1.ObjectID(id) }, updateQuery);
    if (modifiedCount === 0) {
        throw new Error(`Mutation "journalEntryUpdate" arguments "${JSON.stringify(args)}" failed.`);
    }
    const doc = yield db
        .collection("journalEntries")
        .aggregate([{ $match: { _id: new mongodb_1.ObjectID(id) } }, utils_1.addFields, utils_1.project])
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
        const id = new mongodb_1.ObjectID(departmentId);
        if (0 ===
            (yield db
                .collection(collection)
                .find({ _id: id })
                .limit(1)
                .count())) {
            throw new Error(`Mutation "journalEntryAdd" type "Department" with id ${departmentId} does not exist.`);
        }
        insertDoc["department"] = [
            {
                value: {
                    node: new mongodb_1.ObjectID(node),
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
        const id = new mongodb_1.ObjectID(categoryId);
        if (0 ===
            (yield db
                .collection(collection)
                .find({ _id: id })
                .limit(1)
                .count())) {
            throw new Error(`Mutation "journalEntryAdd" type "JournalEntryCategory" with id ${categoryId} does not exist.`);
        }
        insertDoc["category"] = [
            {
                value: {
                    node: new mongodb_1.ObjectID(node),
                    id,
                },
                createdBy,
                createdOn,
            },
        ];
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
        if (0 ===
            (yield db
                .collection(collection)
                .find({ _id: id })
                .limit(1)
                .count())) {
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
        const id = new mongodb_1.ObjectID(paymentMethodId);
        if (0 ===
            (yield db
                .collection(collection)
                .find({ _id: id })
                .limit(1)
                .count())) {
            throw new Error(`Mutation "journalEntryAdd" type "PaymentMethod" with id ${paymentMethodId} does not exist.`);
        }
        insertDoc["paymentMethod"] = [
            {
                value: {
                    node: new mongodb_1.ObjectID(node),
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
    const _id = new mongodb_1.ObjectID(id);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiam91cm5hbEVudHJ5LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL3Jlc29sdmVycy9qb3VybmFsRW50cnkudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7QUFBQSxxQ0FBbUM7QUFDbkMsaUNBQWlDO0FBR2pDLDhDQU91QjtBQUN2Qix1REFBeUQ7QUFFekQsZ0RBQTBEO0FBRTFELG9EQUlnQztBQUNoQyw4REFBdUQ7QUFFdkQsTUFBTSxZQUFZLEdBQUcsSUFBSSxrQkFBUSxDQUFDLDBCQUEwQixDQUFDLENBQUM7QUFFakQsUUFBQSxrQkFBa0IsR0FBNEMsQ0FDekUsTUFBTSxFQUNOLElBQUksRUFDSixPQUFPLEVBQ1AsSUFBSSxFQUNKLEVBQUU7SUFDRixNQUFNLEVBQUUsRUFBRSxFQUFFLE1BQU0sRUFBRSxHQUFHLElBQUksQ0FBQztJQUM1QixNQUFNLEVBQUUsRUFBRSxFQUFFLE9BQU8sRUFBRSxJQUFJLEVBQUUsTUFBTSxFQUFFLEdBQUcsT0FBTyxDQUFDO0lBRTlDLE1BQU0sU0FBUyxHQUFHO1FBQ2hCLElBQUksRUFBRSxZQUFZO1FBQ2xCLEVBQUUsRUFBRSxJQUFJLENBQUMsRUFBRTtLQUNaLENBQUM7SUFFRixNQUFNLFNBQVMsR0FBRyxJQUFJLElBQUksRUFBRSxDQUFDO0lBQzdCLE1BQU0sVUFBVSxHQUFHLFNBQVMsQ0FBQztJQUU3QixNQUFNLEtBQUssR0FBRyxFQUFFLENBQUM7SUFFakIsTUFBTSxXQUFXLEdBQUc7UUFDbEIsSUFBSSxFQUFFO1lBQ0osVUFBVTtTQUNYO1FBQ0QsS0FBSztLQUNOLENBQUM7SUFFRixNQUFNLEVBQ0osSUFBSSxFQUFFLFVBQVUsR0FBRyxJQUFJLEVBQ3ZCLE1BQU0sR0FBRyxJQUFJLEVBQ2IsVUFBVSxFQUFFLFlBQVksR0FBRyxJQUFJLEVBQy9CLEtBQUssR0FBRyxJQUFJLEVBQ1osUUFBUSxFQUFFLFVBQVUsR0FBRyxJQUFJLEVBQzNCLGFBQWEsRUFBRSxlQUFlLEdBQUcsSUFBSSxFQUNyQyxXQUFXLEdBQUcsSUFBSSxFQUNsQixVQUFVLEdBQUcsSUFBSSxFQUNqQixJQUFJLEdBQUcsSUFBSSxHQUNaLEdBQUcsTUFBTSxDQUFDO0lBRVgsSUFBSSxpQkFBaUIsR0FBRyxDQUFDLENBQUM7SUFDMUIsSUFBSSxVQUFVLEtBQUssSUFBSSxFQUFFO1FBQ3ZCLGlCQUFpQixFQUFFLENBQUM7UUFFcEIsTUFBTSxJQUFJLEdBQUcsTUFBTSxDQUFDLFVBQVUsRUFBRSxNQUFNLENBQUMsUUFBUSxDQUFDLENBQUM7UUFFakQsSUFBSSxDQUFDLElBQUksQ0FBQyxPQUFPLEVBQUUsRUFBRTtZQUNuQixNQUFNLElBQUksS0FBSyxDQUNiLGdEQUFnRCxVQUFVLHFDQUFxQyxDQUNoRyxDQUFDO1NBQ0g7UUFFRCxLQUFLLENBQUMsTUFBTSxDQUFDLEdBQUc7WUFDZCxLQUFLLEVBQUU7Z0JBQ0w7b0JBQ0UsS0FBSyxFQUFFLElBQUksQ0FBQyxNQUFNLEVBQUU7b0JBQ3BCLFNBQVM7b0JBQ1QsU0FBUztpQkFDVjthQUNGO1lBQ0QsU0FBUyxFQUFFLENBQUM7U0FDYixDQUFDO0tBQ0g7SUFFRCxJQUFJLE1BQU0sS0FBSyxJQUFJLEVBQUU7UUFDbkIsaUJBQWlCLEVBQUUsQ0FBQztRQUVwQixNQUFNLEVBQUUsRUFBRSxFQUFFLFFBQVEsRUFBRSxVQUFVLEVBQUUsR0FBRyxNQUFNLENBQUM7UUFFNUMsTUFBTSxFQUFFLEdBQUcsSUFBSSxrQkFBUSxDQUFDLFFBQVEsQ0FBQyxDQUFDO1FBRWxDLE1BQU0sS0FBSyxHQUFHLEVBQUUsRUFBRSxFQUFlLENBQUM7UUFFbEMsSUFBSSxVQUFrQixDQUFDO1FBQ3ZCLFFBQVEsVUFBVSxFQUFFO1lBQ2xCLEtBQUssbUNBQXNCLENBQUMsUUFBUTtnQkFDbEMsSUFBSSxPQUFPLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBQyxVQUFVLENBQUMsRUFBRTtvQkFDcEMsTUFBTSxRQUFRLEdBQUcsT0FBTyxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsVUFBVSxDQUFDLENBQUM7b0JBQ2xELFVBQVUsR0FBRyxRQUFRLENBQUMsVUFBVSxDQUFDO29CQUNqQyxLQUFLLENBQUMsSUFBSSxHQUFHLElBQUksa0JBQVEsQ0FBQyxRQUFRLENBQUMsRUFBRSxDQUFDLENBQUM7aUJBQ3hDO2dCQUNELE1BQU07WUFDUixLQUFLLG1DQUFzQixDQUFDLFVBQVU7Z0JBQ3BDLElBQUksT0FBTyxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsWUFBWSxDQUFDLEVBQUU7b0JBQ3RDLE1BQU0sUUFBUSxHQUFHLE9BQU8sQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLFlBQVksQ0FBQyxDQUFDO29CQUNwRCxVQUFVLEdBQUcsUUFBUSxDQUFDLFVBQVUsQ0FBQztvQkFDakMsS0FBSyxDQUFDLElBQUksR0FBRyxJQUFJLGtCQUFRLENBQUMsUUFBUSxDQUFDLEVBQUUsQ0FBQyxDQUFDO2lCQUN4QztnQkFDRCxNQUFNO1lBQ1IsS0FBSyxtQ0FBc0IsQ0FBQyxNQUFNO2dCQUNoQyxJQUFJLE9BQU8sQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLFFBQVEsQ0FBQyxFQUFFO29CQUNsQyxNQUFNLFFBQVEsR0FBRyxPQUFPLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBQyxRQUFRLENBQUMsQ0FBQztvQkFDaEQsVUFBVSxHQUFHLFFBQVEsQ0FBQyxVQUFVLENBQUM7b0JBQ2pDLEtBQUssQ0FBQyxJQUFJLEdBQUcsSUFBSSxrQkFBUSxDQUFDLFFBQVEsQ0FBQyxFQUFFLENBQUMsQ0FBQztpQkFDeEM7Z0JBQ0QsTUFBTTtTQUNUO1FBRUQsNEJBQTRCO1FBQzVCLElBQ0UsQ0FBQztZQUNELENBQUMsTUFBTSxFQUFFO2lCQUNOLFVBQVUsQ0FBQyxVQUFVLENBQUM7aUJBQ3RCLElBQUksQ0FBQyxFQUFFLEdBQUcsRUFBRSxFQUFFLEVBQUUsQ0FBQztpQkFDakIsS0FBSyxDQUFDLENBQUMsQ0FBQztpQkFDUixLQUFLLEVBQUUsQ0FBQyxFQUNYO1lBQ0EsTUFBTSxJQUFJLEtBQUssQ0FDYiw4Q0FBOEMsVUFBVSxhQUFhLFFBQVEsa0JBQWtCLENBQ2hHLENBQUM7U0FDSDthQUFNLElBQUksS0FBSyxDQUFDLElBQUksS0FBSyxTQUFTLEVBQUU7WUFDbkMsTUFBTSxJQUFJLEtBQUssQ0FDYiw4Q0FBOEMsVUFBVSxjQUFjLENBQ3ZFLENBQUM7U0FDSDtRQUVELEtBQUssQ0FBQyxRQUFRLENBQUMsR0FBRztZQUNoQixLQUFLLEVBQUU7Z0JBQ0w7b0JBQ0UsS0FBSztvQkFDTCxTQUFTO29CQUNULFNBQVM7aUJBQ1Y7YUFDRjtZQUNELFNBQVMsRUFBRSxDQUFDO1NBQ2IsQ0FBQztLQUNIO0lBRUQsSUFBSSxZQUFZLEtBQUssSUFBSSxFQUFFO1FBQ3pCLGlCQUFpQixFQUFFLENBQUM7UUFFcEIsTUFBTSxFQUFFLFVBQVUsRUFBRSxFQUFFLEVBQUUsSUFBSSxFQUFFLEdBQUcsT0FBTyxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsWUFBWSxDQUFDLENBQUM7UUFFcEUsTUFBTSxFQUFFLEdBQUcsSUFBSSxrQkFBUSxDQUFDLFlBQVksQ0FBQyxDQUFDO1FBRXRDLElBQ0UsQ0FBQztZQUNELENBQUMsTUFBTSxFQUFFO2lCQUNOLFVBQVUsQ0FBQyxVQUFVLENBQUM7aUJBQ3RCLElBQUksQ0FBQyxFQUFFLEdBQUcsRUFBRSxFQUFFLEVBQUUsQ0FBQztpQkFDakIsS0FBSyxDQUFDLENBQUMsQ0FBQztpQkFDUixLQUFLLEVBQUUsQ0FBQyxFQUNYO1lBQ0EsTUFBTSxJQUFJLEtBQUssQ0FDYiwyREFBMkQsWUFBWSxrQkFBa0IsQ0FDMUYsQ0FBQztTQUNIO1FBRUQsS0FBSyxDQUFDLFlBQVksQ0FBQyxHQUFHO1lBQ3BCLEtBQUssRUFBRTtnQkFDTDtvQkFDRSxLQUFLLEVBQUU7d0JBQ0wsSUFBSSxFQUFFLElBQUksa0JBQVEsQ0FBQyxJQUFJLENBQUM7d0JBQ3hCLEVBQUU7cUJBQ0g7b0JBQ0QsU0FBUztvQkFDVCxTQUFTO2lCQUNWO2FBQ0Y7WUFDRCxTQUFTLEVBQUUsQ0FBQztTQUNiLENBQUM7S0FDSDtJQUVELElBQUksS0FBSyxLQUFLLElBQUksRUFBRTtRQUNsQixpQkFBaUIsRUFBRSxDQUFDO1FBRXBCLEtBQUssQ0FBQyxPQUFPLENBQUMsR0FBRztZQUNmLEtBQUssRUFBRTtnQkFDTDtvQkFDRSxLQUFLLEVBQUUsS0FBSztvQkFDWixTQUFTO29CQUNULFNBQVM7aUJBQ1Y7YUFDRjtZQUNELFNBQVMsRUFBRSxDQUFDO1NBQ2IsQ0FBQztLQUNIO0lBRUQsSUFBSSxJQUFJLEtBQUssSUFBSSxFQUFFO1FBQ2pCLGlCQUFpQixFQUFFLENBQUM7UUFFcEIsTUFBTSxLQUFLLEdBQUcsSUFBSSxLQUFLLDZCQUFnQixDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUM7UUFFcEUsS0FBSyxDQUFDLE1BQU0sQ0FBQyxHQUFHO1lBQ2QsS0FBSyxFQUFFO2dCQUNMO29CQUNFLEtBQUs7b0JBQ0wsU0FBUztvQkFDVCxTQUFTO2lCQUNWO2FBQ0Y7WUFDRCxTQUFTLEVBQUUsQ0FBQztTQUNiLENBQUM7UUFFRixJQUFJLFVBQVUsS0FBSyxJQUFJLEVBQUU7WUFDdkIsTUFBTSxJQUFJLEdBQUcsTUFBTSxFQUFFO2lCQUNsQixVQUFVLENBQUMsZ0JBQWdCLENBQUM7aUJBQzVCLFNBQVMsQ0FBQztnQkFDVCxFQUFFLE1BQU0sRUFBRSxFQUFFLEdBQUcsRUFBRSxJQUFJLGtCQUFRLENBQUMsRUFBRSxDQUFDLEVBQUUsRUFBRTtnQkFDckM7b0JBQ0UsVUFBVSxFQUFFLEVBQUUsS0FBSyxFQUFFLEVBQUUsWUFBWSxFQUFFLENBQUMsb0JBQW9CLEVBQUUsQ0FBQyxDQUFDLEVBQUUsRUFBRTtpQkFDbkU7Z0JBQ0Q7b0JBQ0UsT0FBTyxFQUFFO3dCQUNQLElBQUksRUFBRSx3QkFBd0I7d0JBQzlCLFVBQVUsRUFBRSxPQUFPO3dCQUNuQixZQUFZLEVBQUUsS0FBSzt3QkFDbkIsRUFBRSxFQUFFLE1BQU07cUJBQ1g7aUJBQ0Y7Z0JBQ0QsRUFBRSxRQUFRLEVBQUUsRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLEVBQUU7YUFDN0IsQ0FBQztpQkFDRCxJQUFJLEVBQUUsQ0FBQztZQUVWLElBQUksS0FBSyxLQUFLLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxFQUFFO2dCQUMvQixNQUFNLElBQUksS0FBSyxDQUNiLDBGQUEwRixDQUMzRixDQUFDO2FBQ0g7U0FDRjtLQUNGO0lBRUQsSUFBSSxVQUFVLEtBQUssSUFBSSxFQUFFO1FBQ3ZCLGlCQUFpQixFQUFFLENBQUM7UUFFcEIsTUFBTSxFQUFFLFVBQVUsRUFBRSxFQUFFLEVBQUUsSUFBSSxFQUFFLEdBQUcsT0FBTyxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQ25ELHNCQUFzQixDQUN2QixDQUFDO1FBRUYsTUFBTSxRQUFRLEdBQUcsSUFBSSxrQkFBUSxDQUFDLFVBQVUsQ0FBQyxDQUFDO1FBRTFDLE1BQU0sUUFBUSxHQUFHLE1BQU0sRUFBRSxDQUFDLFVBQVUsQ0FBQyxVQUFVLENBQUMsQ0FBQyxPQUFPLENBQ3RELEVBQUUsR0FBRyxFQUFFLFFBQVEsRUFBRSxFQUNqQjtZQUNFLFVBQVUsRUFBRSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUU7U0FDM0IsQ0FDRixDQUFDO1FBRUYsSUFBSSxDQUFDLFFBQVEsRUFBRTtZQUNiLE1BQU0sSUFBSSxLQUFLLENBQ2IscUVBQXFFLFVBQVUsa0JBQWtCLENBQ2xHLENBQUM7U0FDSDtRQUVELEtBQUssQ0FBQyxVQUFVLENBQUMsR0FBRztZQUNsQixLQUFLLEVBQUU7Z0JBQ0w7b0JBQ0UsS0FBSyxFQUFFO3dCQUNMLElBQUksRUFBRSxJQUFJLGtCQUFRLENBQUMsSUFBSSxDQUFDO3dCQUN4QixFQUFFLEVBQUUsUUFBUTtxQkFDYjtvQkFDRCxTQUFTO29CQUNULFNBQVM7aUJBQ1Y7YUFDRjtZQUNELFNBQVMsRUFBRSxDQUFDO1NBQ2IsQ0FBQztRQUVGLElBQUksU0FBNkIsQ0FBQztRQUNsQyxJQUFJLElBQUksS0FBSyxJQUFJLEVBQUU7WUFDakIsTUFBTSxLQUFLLEdBQUcsTUFBTSxFQUFFO2lCQUNuQixVQUFVLENBQUMsZ0JBQWdCLENBQUM7aUJBQzVCLFNBQVMsQ0FBQztnQkFDVCxFQUFFLE1BQU0sRUFBRSxFQUFFLEdBQUcsRUFBRSxJQUFJLGtCQUFRLENBQUMsRUFBRSxDQUFDLEVBQUUsRUFBRTtnQkFDckMsRUFBRSxVQUFVLEVBQUUsRUFBRSxJQUFJLEVBQUUsRUFBRSxZQUFZLEVBQUUsQ0FBQyxhQUFhLEVBQUUsQ0FBQyxDQUFDLEVBQUUsRUFBRSxFQUFFO2dCQUM5RCxFQUFFLFFBQVEsRUFBRSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsRUFBRTthQUM3QixDQUFDO2lCQUNELElBQUksRUFBRSxDQUFDO1lBRVYsU0FBUyxHQUFHLEtBQUssQ0FBQyxJQUFJLENBQUM7U0FDeEI7YUFBTTtZQUNMLFNBQVMsR0FBRyxJQUFJLEtBQUssNkJBQWdCLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQztTQUNuRTtRQUVELElBQUksUUFBUSxDQUFDLElBQUksS0FBSyxTQUFTLEVBQUU7WUFDL0IsTUFBTSxJQUFJLEtBQUssQ0FDYiwwRkFBMEYsQ0FDM0YsQ0FBQztTQUNIO0tBQ0Y7SUFFRCxJQUFJLGVBQWUsS0FBSyxJQUFJLEVBQUU7UUFDNUIsaUJBQWlCLEVBQUUsQ0FBQztRQUVwQixNQUFNLEVBQUUsVUFBVSxFQUFFLEVBQUUsRUFBRSxJQUFJLEVBQUUsR0FBRyxPQUFPLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBQyxlQUFlLENBQUMsQ0FBQztRQUV2RSxNQUFNLEVBQUUsR0FBRyxJQUFJLGtCQUFRLENBQUMsZUFBZSxDQUFDLENBQUM7UUFFekMsSUFDRSxDQUFDO1lBQ0QsQ0FBQyxNQUFNLEVBQUU7aUJBQ04sVUFBVSxDQUFDLFVBQVUsQ0FBQztpQkFDdEIsSUFBSSxDQUFDLEVBQUUsR0FBRyxFQUFFLEVBQUUsRUFBRSxDQUFDO2lCQUNqQixLQUFLLENBQUMsQ0FBQyxDQUFDO2lCQUNSLEtBQUssRUFBRSxDQUFDLEVBQ1g7WUFDQSxNQUFNLElBQUksS0FBSyxDQUNiLDhEQUE4RCxlQUFlLGtCQUFrQixDQUNoRyxDQUFDO1NBQ0g7UUFFRCxLQUFLLENBQUMsZUFBZSxDQUFDLEdBQUc7WUFDdkIsS0FBSyxFQUFFO2dCQUNMO29CQUNFLEtBQUssRUFBRTt3QkFDTCxJQUFJLEVBQUUsSUFBSSxrQkFBUSxDQUFDLElBQUksQ0FBQzt3QkFDeEIsRUFBRTtxQkFDSDtvQkFDRCxTQUFTO29CQUNULFNBQVM7aUJBQ1Y7YUFDRjtZQUNELFNBQVMsRUFBRSxDQUFDO1NBQ2IsQ0FBQztLQUNIO0lBRUQsSUFBSSxXQUFXLEtBQUssSUFBSSxFQUFFO1FBQ3hCLGlCQUFpQixFQUFFLENBQUM7UUFFcEIsS0FBSyxDQUFDLGFBQWEsQ0FBQyxHQUFHO1lBQ3JCLEtBQUssRUFBRTtnQkFDTDtvQkFDRSxLQUFLLEVBQUUsV0FBVztvQkFDbEIsU0FBUztvQkFDVCxTQUFTO2lCQUNWO2FBQ0Y7WUFDRCxTQUFTLEVBQUUsQ0FBQztTQUNiLENBQUM7S0FDSDtJQUVELElBQUksVUFBVSxLQUFLLElBQUksRUFBRTtRQUN2QixpQkFBaUIsRUFBRSxDQUFDO1FBRXBCLEtBQUssQ0FBQyxZQUFZLENBQUMsR0FBRztZQUNwQixLQUFLLEVBQUU7Z0JBQ0w7b0JBQ0UsS0FBSyxFQUFFLFVBQVU7b0JBQ2pCLFNBQVM7b0JBQ1QsU0FBUztpQkFDVjthQUNGO1lBQ0QsU0FBUyxFQUFFLENBQUM7U0FDYixDQUFDO0tBQ0g7SUFFRCxJQUFJLGlCQUFpQixLQUFLLENBQUMsRUFBRTtRQUMzQixNQUFNLElBQUksS0FBSyxDQUNiLDhKQUE4SixDQUMvSixDQUFDO0tBQ0g7SUFFRCxNQUFNLEVBQUUsYUFBYSxFQUFFLEdBQUcsTUFBTSxFQUFFO1NBQy9CLFVBQVUsQ0FBQyxnQkFBZ0IsQ0FBQztTQUM1QixTQUFTLENBQUMsRUFBRSxHQUFHLEVBQUUsSUFBSSxrQkFBUSxDQUFDLEVBQUUsQ0FBQyxFQUFFLEVBQUUsV0FBVyxDQUFDLENBQUM7SUFFckQsSUFBSSxhQUFhLEtBQUssQ0FBQyxFQUFFO1FBQ3ZCLE1BQU0sSUFBSSxLQUFLLENBQ2IsNENBQTRDLElBQUksQ0FBQyxTQUFTLENBQ3hELElBQUksQ0FDTCxXQUFXLENBQ2IsQ0FBQztLQUNIO0lBRUQsTUFBTSxHQUFHLEdBQUcsTUFBTSxFQUFFO1NBQ2pCLFVBQVUsQ0FBQyxnQkFBZ0IsQ0FBQztTQUM1QixTQUFTLENBQUMsQ0FBQyxFQUFFLE1BQU0sRUFBRSxFQUFFLEdBQUcsRUFBRSxJQUFJLGtCQUFRLENBQUMsRUFBRSxDQUFDLEVBQUUsRUFBRSxFQUFFLGlCQUFTLEVBQUUsZUFBTyxDQUFDLENBQUM7U0FDdEUsT0FBTyxFQUFFLENBQUM7SUFFYixNQUFNO1NBQ0gsT0FBTyxDQUFDLCtCQUFxQixFQUFFLEVBQUUsbUJBQW1CLEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUM7U0FDL0QsS0FBSyxDQUFDLENBQUMsS0FBSyxFQUFFLEVBQUUsQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUM7SUFFMUMsT0FBTyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDaEIsQ0FBQyxDQUFBLENBQUM7QUFFVyxRQUFBLGVBQWUsR0FBeUMsQ0FDbkUsTUFBTSxFQUNOLElBQUksRUFDSixPQUFPLEVBQ1AsSUFBSSxFQUNKLEVBQUU7O0lBQ0YsTUFBTSxFQUNKLElBQUksRUFBRSxVQUFVLEVBQ2hCLFVBQVUsRUFBRSxZQUFZLEVBQ3hCLElBQUksRUFDSixRQUFRLEVBQUUsVUFBVSxFQUNwQixNQUFNLEVBQUUsRUFBRSxFQUFFLEVBQUUsUUFBUSxFQUFFLFVBQVUsRUFBRSxFQUNwQyxXQUFXLEdBQUcsSUFBSSxFQUNsQixhQUFhLEVBQUUsZUFBZSxFQUM5QixLQUFLLEdBQ04sR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDO0lBRWhCLE1BQU0sVUFBVSxTQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsVUFBVSx1Q0FBSSxLQUFLLEVBQUEsQ0FBQztJQUVuRCxNQUFNLEVBQUUsRUFBRSxFQUFFLElBQUksRUFBRSxPQUFPLEVBQUUsTUFBTSxFQUFFLEdBQUcsT0FBTyxDQUFDO0lBRTlDLE1BQU0sU0FBUyxHQUFHLElBQUksSUFBSSxFQUFFLENBQUM7SUFDN0IsTUFBTSxVQUFVLEdBQUcsU0FBUyxDQUFDO0lBRTdCLE1BQU0sU0FBUyxHQUFHO1FBQ2hCLElBQUksRUFBRSxZQUFZO1FBQ2xCLEVBQUUsRUFBRSxJQUFJLENBQUMsRUFBRTtLQUNaLENBQUM7SUFFRixNQUFNLFNBQVMsR0FBRztRQUNoQixLQUFLLEVBQUU7WUFDTDtnQkFDRSxLQUFLLEVBQUUsS0FBSztnQkFDWixTQUFTO2dCQUNULFNBQVM7YUFDVjtTQUNGO1FBQ0QsSUFBSSxFQUFFO1lBQ0o7Z0JBQ0UsS0FBSyxFQUFFLElBQUksS0FBSyw2QkFBZ0IsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsT0FBTztnQkFDNUQsU0FBUztnQkFDVCxTQUFTO2FBQ1Y7U0FDRjtRQUNELFVBQVU7UUFDVixTQUFTO1FBQ1QsU0FBUztRQUNULE9BQU8sRUFBRTtZQUNQO2dCQUNFLEtBQUssRUFBRSxLQUFLO2dCQUNaLFNBQVM7Z0JBQ1QsU0FBUzthQUNWO1NBQ0Y7UUFDRCxVQUFVLEVBQUU7WUFDVjtnQkFDRSxLQUFLLEVBQUUsVUFBVTtnQkFDakIsU0FBUztnQkFDVCxTQUFTO2FBQ1Y7U0FDRjtLQUNLLENBQUM7SUFFVCxjQUFjO0lBQ2QsSUFBSSxXQUFXLEVBQUU7UUFDZixTQUFTLENBQUMsYUFBYSxDQUFDLEdBQUc7WUFDekI7Z0JBQ0UsS0FBSyxFQUFFLFdBQVc7Z0JBQ2xCLFNBQVM7Z0JBQ1QsU0FBUzthQUNWO1NBQ0YsQ0FBQztLQUNIO1NBQU07UUFDTCxTQUFTLENBQUMsYUFBYSxDQUFDLEdBQUcsRUFBRSxDQUFDO0tBQy9CO0lBRUQsT0FBTztJQUNQLE1BQU0sSUFBSSxHQUFHLE1BQU0sQ0FBQyxVQUFVLEVBQUUsTUFBTSxDQUFDLFFBQVEsQ0FBQyxDQUFDO0lBQ2pELElBQUksQ0FBQyxJQUFJLENBQUMsT0FBTyxFQUFFLEVBQUU7UUFDbkIsTUFBTSxJQUFJLEtBQUssQ0FDYiw2Q0FBNkMsVUFBVSxxQ0FBcUMsQ0FDN0YsQ0FBQztLQUNIO0lBRUQsU0FBUyxDQUFDLE1BQU0sQ0FBQyxHQUFHO1FBQ2xCO1lBQ0UsS0FBSyxFQUFFLElBQUksQ0FBQyxNQUFNLEVBQUU7WUFDcEIsU0FBUztZQUNULFNBQVM7U0FDVjtLQUNGLENBQUM7SUFFRixhQUFhO0lBQ2I7UUFDRSxNQUFNLEVBQUUsVUFBVSxFQUFFLEVBQUUsRUFBRSxJQUFJLEVBQUUsR0FBRyxPQUFPLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBQyxZQUFZLENBQUMsQ0FBQztRQUVwRSxNQUFNLEVBQUUsR0FBRyxJQUFJLGtCQUFRLENBQUMsWUFBWSxDQUFDLENBQUM7UUFFdEMsSUFDRSxDQUFDO1lBQ0QsQ0FBQyxNQUFNLEVBQUU7aUJBQ04sVUFBVSxDQUFDLFVBQVUsQ0FBQztpQkFDdEIsSUFBSSxDQUFDLEVBQUUsR0FBRyxFQUFFLEVBQUUsRUFBRSxDQUFDO2lCQUNqQixLQUFLLENBQUMsQ0FBQyxDQUFDO2lCQUNSLEtBQUssRUFBRSxDQUFDLEVBQ1g7WUFDQSxNQUFNLElBQUksS0FBSyxDQUNiLHdEQUF3RCxZQUFZLGtCQUFrQixDQUN2RixDQUFDO1NBQ0g7UUFFRCxTQUFTLENBQUMsWUFBWSxDQUFDLEdBQUc7WUFDeEI7Z0JBQ0UsS0FBSyxFQUFFO29CQUNMLElBQUksRUFBRSxJQUFJLGtCQUFRLENBQUMsSUFBSSxDQUFDO29CQUN4QixFQUFFO2lCQUNIO2dCQUNELFNBQVM7Z0JBQ1QsU0FBUzthQUNWO1NBQ0YsQ0FBQztLQUNIO0lBRUQsdUJBQXVCO0lBQ3ZCO1FBQ0UsTUFBTSxFQUFFLFVBQVUsRUFBRSxFQUFFLEVBQUUsSUFBSSxFQUFFLEdBQUcsT0FBTyxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQ25ELHNCQUFzQixDQUN2QixDQUFDO1FBRUYsTUFBTSxFQUFFLEdBQUcsSUFBSSxrQkFBUSxDQUFDLFVBQVUsQ0FBQyxDQUFDO1FBRXBDLElBQ0UsQ0FBQztZQUNELENBQUMsTUFBTSxFQUFFO2lCQUNOLFVBQVUsQ0FBQyxVQUFVLENBQUM7aUJBQ3RCLElBQUksQ0FBQyxFQUFFLEdBQUcsRUFBRSxFQUFFLEVBQUUsQ0FBQztpQkFDakIsS0FBSyxDQUFDLENBQUMsQ0FBQztpQkFDUixLQUFLLEVBQUUsQ0FBQyxFQUNYO1lBQ0EsTUFBTSxJQUFJLEtBQUssQ0FDYixrRUFBa0UsVUFBVSxrQkFBa0IsQ0FDL0YsQ0FBQztTQUNIO1FBRUQsU0FBUyxDQUFDLFVBQVUsQ0FBQyxHQUFHO1lBQ3RCO2dCQUNFLEtBQUssRUFBRTtvQkFDTCxJQUFJLEVBQUUsSUFBSSxrQkFBUSxDQUFDLElBQUksQ0FBQztvQkFDeEIsRUFBRTtpQkFDSDtnQkFDRCxTQUFTO2dCQUNULFNBQVM7YUFDVjtTQUNGLENBQUM7S0FDSDtJQUVELHFCQUFxQjtJQUNyQjtRQUNFLE1BQU0sRUFBRSxHQUFHLElBQUksa0JBQVEsQ0FBQyxRQUFRLENBQUMsQ0FBQztRQUVsQyxNQUFNLEtBQUssR0FBRyxFQUFFLEVBQUUsRUFBZSxDQUFDO1FBRWxDLElBQUksVUFBa0IsQ0FBQztRQUN2QixRQUFRLFVBQVUsRUFBRTtZQUNsQixLQUFLLG1DQUFzQixDQUFDLFFBQVE7Z0JBQ2xDLElBQUksT0FBTyxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsVUFBVSxDQUFDLEVBQUU7b0JBQ3BDLE1BQU0sUUFBUSxHQUFHLE9BQU8sQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLFVBQVUsQ0FBQyxDQUFDO29CQUNsRCxVQUFVLEdBQUcsUUFBUSxDQUFDLFVBQVUsQ0FBQztvQkFDakMsS0FBSyxDQUFDLElBQUksR0FBRyxJQUFJLGtCQUFRLENBQUMsUUFBUSxDQUFDLEVBQUUsQ0FBQyxDQUFDO2lCQUN4QztnQkFDRCxNQUFNO1lBQ1IsS0FBSyxtQ0FBc0IsQ0FBQyxVQUFVO2dCQUNwQyxJQUFJLE9BQU8sQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLFlBQVksQ0FBQyxFQUFFO29CQUN0QyxNQUFNLFFBQVEsR0FBRyxPQUFPLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBQyxZQUFZLENBQUMsQ0FBQztvQkFDcEQsVUFBVSxHQUFHLFFBQVEsQ0FBQyxVQUFVLENBQUM7b0JBQ2pDLEtBQUssQ0FBQyxJQUFJLEdBQUcsSUFBSSxrQkFBUSxDQUFDLFFBQVEsQ0FBQyxFQUFFLENBQUMsQ0FBQztpQkFDeEM7Z0JBQ0QsTUFBTTtZQUNSLEtBQUssbUNBQXNCLENBQUMsTUFBTTtnQkFDaEMsSUFBSSxPQUFPLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBQyxRQUFRLENBQUMsRUFBRTtvQkFDbEMsTUFBTSxRQUFRLEdBQUcsT0FBTyxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsUUFBUSxDQUFDLENBQUM7b0JBQ2hELFVBQVUsR0FBRyxRQUFRLENBQUMsVUFBVSxDQUFDO29CQUNqQyxLQUFLLENBQUMsSUFBSSxHQUFHLElBQUksa0JBQVEsQ0FBQyxRQUFRLENBQUMsRUFBRSxDQUFDLENBQUM7aUJBQ3hDO2dCQUNELE1BQU07U0FDVDtRQUVELDRCQUE0QjtRQUM1QixJQUNFLENBQUM7WUFDRCxDQUFDLE1BQU0sRUFBRTtpQkFDTixVQUFVLENBQUMsVUFBVSxDQUFDO2lCQUN0QixJQUFJLENBQUMsRUFBRSxHQUFHLEVBQUUsRUFBRSxFQUFFLENBQUM7aUJBQ2pCLEtBQUssQ0FBQyxDQUFDLENBQUM7aUJBQ1IsS0FBSyxFQUFFLENBQUMsRUFDWDtZQUNBLE1BQU0sSUFBSSxLQUFLLENBQ2IsMkNBQTJDLFVBQVUsYUFBYSxRQUFRLGtCQUFrQixDQUM3RixDQUFDO1NBQ0g7YUFBTSxJQUFJLEtBQUssQ0FBQyxJQUFJLEtBQUssU0FBUyxFQUFFO1lBQ25DLE1BQU0sSUFBSSxLQUFLLENBQ2IsMkNBQTJDLFVBQVUsY0FBYyxDQUNwRSxDQUFDO1NBQ0g7UUFFRCxTQUFTLENBQUMsUUFBUSxDQUFDLEdBQUc7WUFDcEI7Z0JBQ0UsS0FBSztnQkFDTCxTQUFTO2dCQUNULFNBQVM7YUFDVjtTQUNGLENBQUM7S0FDSDtJQUVELGdCQUFnQjtJQUNoQjtRQUNFLE1BQU0sRUFBRSxVQUFVLEVBQUUsRUFBRSxFQUFFLElBQUksRUFBRSxHQUFHLE9BQU8sQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLGVBQWUsQ0FBQyxDQUFDO1FBRXZFLE1BQU0sRUFBRSxHQUFHLElBQUksa0JBQVEsQ0FBQyxlQUFlLENBQUMsQ0FBQztRQUV6QyxJQUNFLENBQUM7WUFDRCxDQUFDLE1BQU0sRUFBRTtpQkFDTixVQUFVLENBQUMsVUFBVSxDQUFDO2lCQUN0QixJQUFJLENBQUMsRUFBRSxHQUFHLEVBQUUsRUFBRSxFQUFFLENBQUM7aUJBQ2pCLEtBQUssQ0FBQyxDQUFDLENBQUM7aUJBQ1IsS0FBSyxFQUFFLENBQUMsRUFDWDtZQUNBLE1BQU0sSUFBSSxLQUFLLENBQ2IsMkRBQTJELGVBQWUsa0JBQWtCLENBQzdGLENBQUM7U0FDSDtRQUVELFNBQVMsQ0FBQyxlQUFlLENBQUMsR0FBRztZQUMzQjtnQkFDRSxLQUFLLEVBQUU7b0JBQ0wsSUFBSSxFQUFFLElBQUksa0JBQVEsQ0FBQyxJQUFJLENBQUM7b0JBQ3hCLEVBQUU7aUJBQ0g7Z0JBQ0QsU0FBUztnQkFDVCxTQUFTO2FBQ1Y7U0FDRixDQUFDO0tBQ0g7SUFFRCxNQUFNLEVBQUUsVUFBVSxFQUFFLGFBQWEsRUFBRSxHQUFHLE1BQU0sRUFBRTtTQUMzQyxVQUFVLENBQUMsZ0JBQWdCLENBQUM7U0FDNUIsU0FBUyxDQUFDLFNBQVMsQ0FBQyxDQUFDO0lBRXhCLElBQUksYUFBYSxLQUFLLENBQUMsRUFBRTtRQUN2QixNQUFNLElBQUksS0FBSyxDQUNiLHlDQUF5QyxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxXQUFXLENBQ3pFLENBQUM7S0FDSDtJQUVELE1BQU0sUUFBUSxHQUFHLE1BQU0sRUFBRTtTQUN0QixVQUFVLENBQUMsZ0JBQWdCLENBQUM7U0FDNUIsU0FBUyxDQUFDLENBQUMsRUFBRSxNQUFNLEVBQUUsRUFBRSxHQUFHLEVBQUUsVUFBVSxFQUFFLEVBQUUsRUFBRSxpQkFBUyxFQUFFLGVBQU8sQ0FBQyxDQUFDO1NBQ2hFLE9BQU8sRUFBRSxDQUFDO0lBRWIsTUFBTTtTQUNILE9BQU8sQ0FBQyw2QkFBbUIsRUFBRSxFQUFFLGlCQUFpQixFQUFFLFFBQVEsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDO1NBQ2hFLEtBQUssQ0FBQyxDQUFDLEtBQUssRUFBRSxFQUFFLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDO0lBRTFDLE9BQU8sUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQ3JCLENBQUMsQ0FBQSxDQUFDO0FBRVcsUUFBQSxrQkFBa0IsR0FBNEMsQ0FDekUsTUFBTSxFQUNOLElBQUksRUFDSixPQUFPLEVBQ1AsSUFBSSxFQUNKLEVBQUU7SUFDRixNQUFNLEVBQUUsRUFBRSxFQUFFLEdBQUcsSUFBSSxDQUFDO0lBQ3BCLE1BQU0sRUFBRSxFQUFFLEVBQUUsSUFBSSxFQUFFLE1BQU0sRUFBRSxHQUFHLE9BQU8sQ0FBQztJQUVyQyxNQUFNLFNBQVMsR0FBRztRQUNoQixJQUFJLEVBQUUsWUFBWTtRQUNsQixFQUFFLEVBQUUsSUFBSSxDQUFDLEVBQUU7S0FDWixDQUFDO0lBRUYsTUFBTSxTQUFTLEdBQUcsSUFBSSxJQUFJLEVBQUUsQ0FBQztJQUM3QixNQUFNLFVBQVUsR0FBRyxTQUFTLENBQUM7SUFFN0IsTUFBTSxXQUFXLEdBQUc7UUFDbEIsSUFBSSxFQUFFO1lBQ0osVUFBVTtTQUNYO1FBQ0QsS0FBSyxFQUFFO1lBQ0wsT0FBTyxFQUFFO2dCQUNQLEtBQUssRUFBRTtvQkFDTDt3QkFDRSxLQUFLLEVBQUUsSUFBSTt3QkFDWCxTQUFTO3dCQUNULFNBQVM7cUJBQ1Y7aUJBQ0Y7Z0JBQ0QsU0FBUyxFQUFFLENBQUM7YUFDYjtTQUNGO0tBQ0YsQ0FBQztJQUVGLE1BQU0sR0FBRyxHQUFHLElBQUksa0JBQVEsQ0FBQyxFQUFFLENBQUMsQ0FBQztJQUU3QixNQUFNLEVBQUUsYUFBYSxFQUFFLEdBQUcsTUFBTSxFQUFFO1NBQy9CLFVBQVUsQ0FBQyxnQkFBZ0IsQ0FBQztTQUM1QixTQUFTLENBQUMsRUFBRSxHQUFHLEVBQUUsRUFBRSxXQUFXLENBQUMsQ0FBQztJQUVuQyxJQUFJLGFBQWEsS0FBSyxDQUFDLEVBQUU7UUFDdkIsTUFBTSxJQUFJLEtBQUssQ0FDYiw0Q0FBNEMsSUFBSSxDQUFDLFNBQVMsQ0FDeEQsSUFBSSxDQUNMLFdBQVcsQ0FDYixDQUFDO0tBQ0g7SUFFRCx5QkFBeUI7SUFDekIsa0NBQWtDO0lBQ2xDLDBEQUEwRDtJQUMxRCxnQkFBZ0I7SUFFaEIsTUFBTSxHQUFHLEdBQUcsTUFBTSxzQkFBWSxDQUFDLE1BQU0sRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLE9BQU8sRUFBRSxJQUFJLENBQUMsQ0FBQztJQUU5RCxNQUFNO1NBQ0gsT0FBTyxDQUFDLCtCQUFxQixFQUFFLEVBQUUsbUJBQW1CLEVBQUUsR0FBRyxFQUFFLENBQUM7U0FDNUQsS0FBSyxDQUFDLENBQUMsS0FBSyxFQUFFLEVBQUUsQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUM7SUFDMUMsTUFBTTtTQUNILE9BQU8sQ0FBQyxnQ0FBc0IsRUFBRSxFQUFFLG9CQUFvQixFQUFFLEdBQUcsRUFBRSxDQUFDO1NBQzlELEtBQUssQ0FBQyxDQUFDLEtBQUssRUFBRSxFQUFFLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDO0lBRTFDLE9BQU8sR0FBRyxDQUFDO0FBQ2IsQ0FBQyxDQUFBLENBQUM7QUFFVyxRQUFBLFlBQVksR0FBMEI7SUFDakQsSUFBSSxFQUFFLENBQUMsTUFBTSxFQUFFLEVBQUUsQ0FDZCxNQUFNLENBQUMsSUFBWSxLQUFLLFFBQVE7UUFDL0IsQ0FBQyxDQUFDLDZCQUFnQixDQUFDLE1BQU07UUFDekIsQ0FBQyxDQUFDLDZCQUFnQixDQUFDLEtBQUs7SUFDNUIsVUFBVSxFQUFFLGdDQUFpQjtJQUM3QixRQUFRLEVBQUUsZ0NBQWlCO0lBQzNCLGFBQWEsRUFBRSxnQ0FBaUI7SUFDaEMsTUFBTSxFQUFFLGdDQUFpQjtJQUN6QixJQUFJLEVBQUUsQ0FBQyxNQUFNLEVBQUUsSUFBSSxFQUFFLE9BQU8sRUFBRSxJQUFJLEVBQUUsRUFBRTtRQUNwQyxPQUFTLE1BQU0sQ0FBQyxJQUFxQixDQUFDLFdBQVcsRUFBRSxDQUFDO0lBQ3RELENBQUM7SUFDRCxVQUFVLEVBQUUsQ0FBQyxNQUFNLEVBQUUsSUFBSSxFQUFFLE9BQU8sRUFBRSxJQUFJLEVBQUUsRUFBRTtRQUMxQyxPQUFTLE1BQU0sQ0FBQyxVQUEyQixDQUFDLFdBQVcsRUFBRSxDQUFDO0lBQzVELENBQUM7Q0FDRixDQUFDO0FBRVcsUUFBQSxpQkFBaUIsR0FBK0M7SUFDM0UsU0FBUyxFQUFFLENBQUMsQ0FBQyxFQUFFLEVBQUUsRUFBRSxFQUFFLE1BQU0sRUFBRSxFQUFFLEVBQUUsQ0FBQyxNQUFNLENBQUMsYUFBYSxDQUFDLDZCQUFtQixDQUFDO0NBQzVFLENBQUM7QUFFVyxRQUFBLG1CQUFtQixHQUFpRDtJQUMvRSxTQUFTLEVBQUUsQ0FBQyxDQUFDLEVBQUUsRUFBRSxFQUFFLEVBQUUsTUFBTSxFQUFFLEVBQUUsRUFBRSxDQUFDLE1BQU0sQ0FBQyxhQUFhLENBQUMsK0JBQXFCLENBQUM7Q0FDOUUsQ0FBQyJ9