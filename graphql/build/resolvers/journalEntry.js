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
exports.journalEntryUpdated = exports.journalEntryAdded = exports.JournalEntry = exports.journalEntryDelete = exports.journalEntryAdd = exports.journalEntryUpdate = void 0;
const mongodb_1 = require("mongodb");
const moment = require("moment");
const graphTypes_1 = require("../graphTypes");
const nodeResolver_1 = require("./utils/nodeResolver");
const utils_1 = require("./journalEntry/utils");
const pubSubs_1 = require("./journalEntry/pubSubs");
const journalEntry_1 = require("./journalEntry/journalEntry");
const userNodeType = new mongodb_1.ObjectId("5dca0427bccd5c6f26b0cde2");
const journalEntryUpdate = (parent, args, context, info) => __awaiter(void 0, void 0, void 0, function* () {
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
exports.journalEntryUpdate = journalEntryUpdate;
const journalEntryAdd = (parent, args, context, info) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const { date: dateString, department: departmentId, type, category: categoryId, source: { id: sourceId, sourceType }, description = null, paymentMethod: paymentMethodId, total, } = args.fields;
    const reconciled = (_a = args.fields.reconciled) !== null && _a !== void 0 ? _a : false;
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
exports.journalEntryAdd = journalEntryAdd;
const journalEntryDelete = (parent, args, context, info) => __awaiter(void 0, void 0, void 0, function* () {
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
exports.journalEntryDelete = journalEntryDelete;
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiam91cm5hbEVudHJ5LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL3Jlc29sdmVycy9qb3VybmFsRW50cnkudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7O0FBQUEscUNBQW1DO0FBQ25DLGlDQUFpQztBQUdqQyw4Q0FPdUI7QUFDdkIsdURBQXlEO0FBRXpELGdEQUEwRDtBQUMxRCxvREFJZ0M7QUFDaEMsOERBQXVEO0FBRXZELE1BQU0sWUFBWSxHQUFHLElBQUksa0JBQVEsQ0FBQywwQkFBMEIsQ0FBQyxDQUFDO0FBRXZELE1BQU0sa0JBQWtCLEdBQTRDLENBQ3pFLE1BQU0sRUFDTixJQUFJLEVBQ0osT0FBTyxFQUNQLElBQUksRUFDSixFQUFFO0lBQ0YsTUFBTSxFQUFFLEVBQUUsRUFBRSxNQUFNLEVBQUUsR0FBRyxJQUFJLENBQUM7SUFDNUIsTUFBTSxFQUFFLEVBQUUsRUFBRSxPQUFPLEVBQUUsSUFBSSxFQUFFLE1BQU0sRUFBRSxHQUFHLE9BQU8sQ0FBQztJQUU5QyxNQUFNLFNBQVMsR0FBRztRQUNoQixJQUFJLEVBQUUsWUFBWTtRQUNsQixFQUFFLEVBQUUsSUFBSSxDQUFDLEVBQUU7S0FDWixDQUFDO0lBRUYsTUFBTSxTQUFTLEdBQUcsSUFBSSxJQUFJLEVBQUUsQ0FBQztJQUM3QixNQUFNLFVBQVUsR0FBRyxTQUFTLENBQUM7SUFFN0IsTUFBTSxLQUFLLEdBQUcsRUFBRSxDQUFDO0lBRWpCLE1BQU0sV0FBVyxHQUFHO1FBQ2xCLElBQUksRUFBRTtZQUNKLFVBQVU7U0FDWDtRQUNELEtBQUs7S0FDTixDQUFDO0lBRUYsTUFBTSxFQUNKLElBQUksRUFBRSxVQUFVLEdBQUcsSUFBSSxFQUN2QixNQUFNLEdBQUcsSUFBSSxFQUNiLFVBQVUsRUFBRSxZQUFZLEdBQUcsSUFBSSxFQUMvQixLQUFLLEdBQUcsSUFBSSxFQUNaLFFBQVEsRUFBRSxVQUFVLEdBQUcsSUFBSSxFQUMzQixhQUFhLEVBQUUsZUFBZSxHQUFHLElBQUksRUFDckMsV0FBVyxHQUFHLElBQUksRUFDbEIsVUFBVSxHQUFHLElBQUksRUFDakIsSUFBSSxHQUFHLElBQUksR0FDWixHQUFHLE1BQU0sQ0FBQztJQUVYLElBQUksaUJBQWlCLEdBQUcsQ0FBQyxDQUFDO0lBQzFCLElBQUksVUFBVSxLQUFLLElBQUksRUFBRTtRQUN2QixpQkFBaUIsRUFBRSxDQUFDO1FBRXBCLE1BQU0sSUFBSSxHQUFHLE1BQU0sQ0FBQyxVQUFVLEVBQUUsTUFBTSxDQUFDLFFBQVEsQ0FBQyxDQUFDO1FBRWpELElBQUksQ0FBQyxJQUFJLENBQUMsT0FBTyxFQUFFLEVBQUU7WUFDbkIsTUFBTSxJQUFJLEtBQUssQ0FDYixnREFBZ0QsVUFBVSxxQ0FBcUMsQ0FDaEcsQ0FBQztTQUNIO1FBRUQsS0FBSyxDQUFDLE1BQU0sQ0FBQyxHQUFHO1lBQ2QsS0FBSyxFQUFFO2dCQUNMO29CQUNFLEtBQUssRUFBRSxJQUFJLENBQUMsTUFBTSxFQUFFO29CQUNwQixTQUFTO29CQUNULFNBQVM7aUJBQ1Y7YUFDRjtZQUNELFNBQVMsRUFBRSxDQUFDO1NBQ2IsQ0FBQztLQUNIO0lBRUQsSUFBSSxNQUFNLEtBQUssSUFBSSxFQUFFO1FBQ25CLGlCQUFpQixFQUFFLENBQUM7UUFFcEIsTUFBTSxFQUFFLEVBQUUsRUFBRSxRQUFRLEVBQUUsVUFBVSxFQUFFLEdBQUcsTUFBTSxDQUFDO1FBRTVDLE1BQU0sRUFBRSxHQUFHLElBQUksa0JBQVEsQ0FBQyxRQUFRLENBQUMsQ0FBQztRQUVsQyxNQUFNLEtBQUssR0FBRyxFQUFFLEVBQUUsRUFBZSxDQUFDO1FBRWxDLElBQUksVUFBa0IsQ0FBQztRQUN2QixRQUFRLFVBQVUsRUFBRTtZQUNsQixLQUFLLG1DQUFzQixDQUFDLFFBQVE7Z0JBQ2xDLElBQUksT0FBTyxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsVUFBVSxDQUFDLEVBQUU7b0JBQ3BDLE1BQU0sUUFBUSxHQUFHLE9BQU8sQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLFVBQVUsQ0FBQyxDQUFDO29CQUNsRCxVQUFVLEdBQUcsUUFBUSxDQUFDLFVBQVUsQ0FBQztvQkFDakMsS0FBSyxDQUFDLElBQUksR0FBRyxJQUFJLGtCQUFRLENBQUMsUUFBUSxDQUFDLEVBQUUsQ0FBQyxDQUFDO2lCQUN4QztnQkFDRCxNQUFNO1lBQ1IsS0FBSyxtQ0FBc0IsQ0FBQyxVQUFVO2dCQUNwQyxJQUFJLE9BQU8sQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLFlBQVksQ0FBQyxFQUFFO29CQUN0QyxNQUFNLFFBQVEsR0FBRyxPQUFPLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBQyxZQUFZLENBQUMsQ0FBQztvQkFDcEQsVUFBVSxHQUFHLFFBQVEsQ0FBQyxVQUFVLENBQUM7b0JBQ2pDLEtBQUssQ0FBQyxJQUFJLEdBQUcsSUFBSSxrQkFBUSxDQUFDLFFBQVEsQ0FBQyxFQUFFLENBQUMsQ0FBQztpQkFDeEM7Z0JBQ0QsTUFBTTtZQUNSLEtBQUssbUNBQXNCLENBQUMsTUFBTTtnQkFDaEMsSUFBSSxPQUFPLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBQyxRQUFRLENBQUMsRUFBRTtvQkFDbEMsTUFBTSxRQUFRLEdBQUcsT0FBTyxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsUUFBUSxDQUFDLENBQUM7b0JBQ2hELFVBQVUsR0FBRyxRQUFRLENBQUMsVUFBVSxDQUFDO29CQUNqQyxLQUFLLENBQUMsSUFBSSxHQUFHLElBQUksa0JBQVEsQ0FBQyxRQUFRLENBQUMsRUFBRSxDQUFDLENBQUM7aUJBQ3hDO2dCQUNELE1BQU07U0FDVDtRQUVELDRCQUE0QjtRQUM1QixJQUNFLENBQUMsS0FBSyxDQUFDLE1BQU0sRUFBRSxDQUFDLFVBQVUsQ0FBQyxVQUFVLENBQUMsQ0FBQyxJQUFJLENBQUMsRUFBRSxHQUFHLEVBQUUsRUFBRSxFQUFFLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxFQUFFLENBQUMsRUFDMUU7WUFDQSxNQUFNLElBQUksS0FBSyxDQUNiLDhDQUE4QyxVQUFVLGFBQWEsUUFBUSxrQkFBa0IsQ0FDaEcsQ0FBQztTQUNIO2FBQU0sSUFBSSxLQUFLLENBQUMsSUFBSSxLQUFLLFNBQVMsRUFBRTtZQUNuQyxNQUFNLElBQUksS0FBSyxDQUNiLDhDQUE4QyxVQUFVLGNBQWMsQ0FDdkUsQ0FBQztTQUNIO1FBRUQsS0FBSyxDQUFDLFFBQVEsQ0FBQyxHQUFHO1lBQ2hCLEtBQUssRUFBRTtnQkFDTDtvQkFDRSxLQUFLO29CQUNMLFNBQVM7b0JBQ1QsU0FBUztpQkFDVjthQUNGO1lBQ0QsU0FBUyxFQUFFLENBQUM7U0FDYixDQUFDO0tBQ0g7SUFFRCxJQUFJLFlBQVksS0FBSyxJQUFJLEVBQUU7UUFDekIsaUJBQWlCLEVBQUUsQ0FBQztRQUVwQixNQUFNLEVBQUUsVUFBVSxFQUFFLEVBQUUsRUFBRSxJQUFJLEVBQUUsR0FBRyxPQUFPLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBQyxZQUFZLENBQUMsQ0FBQztRQUVwRSxNQUFNLEVBQUUsR0FBRyxJQUFJLGtCQUFRLENBQUMsWUFBWSxDQUFDLENBQUM7UUFFdEMsSUFDRSxDQUFDLEtBQUssQ0FBQyxNQUFNLEVBQUUsQ0FBQyxVQUFVLENBQUMsVUFBVSxDQUFDLENBQUMsSUFBSSxDQUFDLEVBQUUsR0FBRyxFQUFFLEVBQUUsRUFBRSxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssRUFBRSxDQUFDLEVBQzFFO1lBQ0EsTUFBTSxJQUFJLEtBQUssQ0FDYiwyREFBMkQsWUFBWSxrQkFBa0IsQ0FDMUYsQ0FBQztTQUNIO1FBRUQsS0FBSyxDQUFDLFlBQVksQ0FBQyxHQUFHO1lBQ3BCLEtBQUssRUFBRTtnQkFDTDtvQkFDRSxLQUFLLEVBQUU7d0JBQ0wsSUFBSSxFQUFFLElBQUksa0JBQVEsQ0FBQyxJQUFJLENBQUM7d0JBQ3hCLEVBQUU7cUJBQ0g7b0JBQ0QsU0FBUztvQkFDVCxTQUFTO2lCQUNWO2FBQ0Y7WUFDRCxTQUFTLEVBQUUsQ0FBQztTQUNiLENBQUM7S0FDSDtJQUVELElBQUksS0FBSyxLQUFLLElBQUksRUFBRTtRQUNsQixpQkFBaUIsRUFBRSxDQUFDO1FBRXBCLEtBQUssQ0FBQyxPQUFPLENBQUMsR0FBRztZQUNmLEtBQUssRUFBRTtnQkFDTDtvQkFDRSxLQUFLLEVBQUUsS0FBSztvQkFDWixTQUFTO29CQUNULFNBQVM7aUJBQ1Y7YUFDRjtZQUNELFNBQVMsRUFBRSxDQUFDO1NBQ2IsQ0FBQztLQUNIO0lBRUQsSUFBSSxJQUFJLEtBQUssSUFBSSxFQUFFO1FBQ2pCLGlCQUFpQixFQUFFLENBQUM7UUFFcEIsTUFBTSxLQUFLLEdBQUcsSUFBSSxLQUFLLDZCQUFnQixDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUM7UUFFcEUsS0FBSyxDQUFDLE1BQU0sQ0FBQyxHQUFHO1lBQ2QsS0FBSyxFQUFFO2dCQUNMO29CQUNFLEtBQUs7b0JBQ0wsU0FBUztvQkFDVCxTQUFTO2lCQUNWO2FBQ0Y7WUFDRCxTQUFTLEVBQUUsQ0FBQztTQUNiLENBQUM7UUFFRixJQUFJLFVBQVUsS0FBSyxJQUFJLEVBQUU7WUFDdkIsTUFBTSxJQUFJLEdBQUcsTUFBTSxFQUFFO2lCQUNsQixVQUFVLENBQUMsZ0JBQWdCLENBQUM7aUJBQzVCLFNBQVMsQ0FBQztnQkFDVCxFQUFFLE1BQU0sRUFBRSxFQUFFLEdBQUcsRUFBRSxJQUFJLGtCQUFRLENBQUMsRUFBRSxDQUFDLEVBQUUsRUFBRTtnQkFDckM7b0JBQ0UsVUFBVSxFQUFFLEVBQUUsS0FBSyxFQUFFLEVBQUUsWUFBWSxFQUFFLENBQUMsb0JBQW9CLEVBQUUsQ0FBQyxDQUFDLEVBQUUsRUFBRTtpQkFDbkU7Z0JBQ0Q7b0JBQ0UsT0FBTyxFQUFFO3dCQUNQLElBQUksRUFBRSx3QkFBd0I7d0JBQzlCLFVBQVUsRUFBRSxPQUFPO3dCQUNuQixZQUFZLEVBQUUsS0FBSzt3QkFDbkIsRUFBRSxFQUFFLE1BQU07cUJBQ1g7aUJBQ0Y7Z0JBQ0QsRUFBRSxRQUFRLEVBQUUsRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLEVBQUU7YUFDN0IsQ0FBQztpQkFDRCxJQUFJLEVBQUUsQ0FBQztZQUVWLElBQUksS0FBSyxLQUFLLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxFQUFFO2dCQUMvQixNQUFNLElBQUksS0FBSyxDQUNiLDBGQUEwRixDQUMzRixDQUFDO2FBQ0g7U0FDRjtLQUNGO0lBRUQsSUFBSSxVQUFVLEtBQUssSUFBSSxFQUFFO1FBQ3ZCLGlCQUFpQixFQUFFLENBQUM7UUFFcEIsTUFBTSxFQUFFLFVBQVUsRUFBRSxFQUFFLEVBQUUsSUFBSSxFQUFFLEdBQUcsT0FBTyxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQ25ELHNCQUFzQixDQUN2QixDQUFDO1FBRUYsTUFBTSxRQUFRLEdBQUcsSUFBSSxrQkFBUSxDQUFDLFVBQVUsQ0FBQyxDQUFDO1FBRTFDLE1BQU0sUUFBUSxHQUFHLE1BQU0sRUFBRSxDQUFDLFVBQVUsQ0FBQyxVQUFVLENBQUMsQ0FBQyxPQUFPLENBQ3RELEVBQUUsR0FBRyxFQUFFLFFBQVEsRUFBRSxFQUNqQjtZQUNFLFVBQVUsRUFBRSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUU7U0FDM0IsQ0FDRixDQUFDO1FBRUYsSUFBSSxDQUFDLFFBQVEsRUFBRTtZQUNiLE1BQU0sSUFBSSxLQUFLLENBQ2IscUVBQXFFLFVBQVUsa0JBQWtCLENBQ2xHLENBQUM7U0FDSDtRQUVELEtBQUssQ0FBQyxVQUFVLENBQUMsR0FBRztZQUNsQixLQUFLLEVBQUU7Z0JBQ0w7b0JBQ0UsS0FBSyxFQUFFO3dCQUNMLElBQUksRUFBRSxJQUFJLGtCQUFRLENBQUMsSUFBSSxDQUFDO3dCQUN4QixFQUFFLEVBQUUsUUFBUTtxQkFDYjtvQkFDRCxTQUFTO29CQUNULFNBQVM7aUJBQ1Y7YUFDRjtZQUNELFNBQVMsRUFBRSxDQUFDO1NBQ2IsQ0FBQztRQUVGLElBQUksU0FBNkIsQ0FBQztRQUNsQyxJQUFJLElBQUksS0FBSyxJQUFJLEVBQUU7WUFDakIsTUFBTSxLQUFLLEdBQUcsTUFBTSxFQUFFO2lCQUNuQixVQUFVLENBQUMsZ0JBQWdCLENBQUM7aUJBQzVCLFNBQVMsQ0FBQztnQkFDVCxFQUFFLE1BQU0sRUFBRSxFQUFFLEdBQUcsRUFBRSxJQUFJLGtCQUFRLENBQUMsRUFBRSxDQUFDLEVBQUUsRUFBRTtnQkFDckMsRUFBRSxVQUFVLEVBQUUsRUFBRSxJQUFJLEVBQUUsRUFBRSxZQUFZLEVBQUUsQ0FBQyxhQUFhLEVBQUUsQ0FBQyxDQUFDLEVBQUUsRUFBRSxFQUFFO2dCQUM5RCxFQUFFLFFBQVEsRUFBRSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsRUFBRTthQUM3QixDQUFDO2lCQUNELElBQUksRUFBRSxDQUFDO1lBRVYsU0FBUyxHQUFHLEtBQUssQ0FBQyxJQUFJLENBQUM7U0FDeEI7YUFBTTtZQUNMLFNBQVMsR0FBRyxJQUFJLEtBQUssNkJBQWdCLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQztTQUNuRTtRQUVELElBQUksUUFBUSxDQUFDLElBQUksS0FBSyxTQUFTLEVBQUU7WUFDL0IsTUFBTSxJQUFJLEtBQUssQ0FDYiwwRkFBMEYsQ0FDM0YsQ0FBQztTQUNIO0tBQ0Y7SUFFRCxJQUFJLGVBQWUsS0FBSyxJQUFJLEVBQUU7UUFDNUIsaUJBQWlCLEVBQUUsQ0FBQztRQUVwQixNQUFNLEVBQUUsVUFBVSxFQUFFLEVBQUUsRUFBRSxJQUFJLEVBQUUsR0FBRyxPQUFPLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBQyxlQUFlLENBQUMsQ0FBQztRQUV2RSxNQUFNLEVBQUUsR0FBRyxJQUFJLGtCQUFRLENBQUMsZUFBZSxDQUFDLENBQUM7UUFFekMsSUFDRSxDQUFDLEtBQUssQ0FBQyxNQUFNLEVBQUUsQ0FBQyxVQUFVLENBQUMsVUFBVSxDQUFDLENBQUMsSUFBSSxDQUFDLEVBQUUsR0FBRyxFQUFFLEVBQUUsRUFBRSxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssRUFBRSxDQUFDLEVBQzFFO1lBQ0EsTUFBTSxJQUFJLEtBQUssQ0FDYiw4REFBOEQsZUFBZSxrQkFBa0IsQ0FDaEcsQ0FBQztTQUNIO1FBRUQsS0FBSyxDQUFDLGVBQWUsQ0FBQyxHQUFHO1lBQ3ZCLEtBQUssRUFBRTtnQkFDTDtvQkFDRSxLQUFLLEVBQUU7d0JBQ0wsSUFBSSxFQUFFLElBQUksa0JBQVEsQ0FBQyxJQUFJLENBQUM7d0JBQ3hCLEVBQUU7cUJBQ0g7b0JBQ0QsU0FBUztvQkFDVCxTQUFTO2lCQUNWO2FBQ0Y7WUFDRCxTQUFTLEVBQUUsQ0FBQztTQUNiLENBQUM7S0FDSDtJQUVELElBQUksV0FBVyxLQUFLLElBQUksRUFBRTtRQUN4QixpQkFBaUIsRUFBRSxDQUFDO1FBRXBCLEtBQUssQ0FBQyxhQUFhLENBQUMsR0FBRztZQUNyQixLQUFLLEVBQUU7Z0JBQ0w7b0JBQ0UsS0FBSyxFQUFFLFdBQVc7b0JBQ2xCLFNBQVM7b0JBQ1QsU0FBUztpQkFDVjthQUNGO1lBQ0QsU0FBUyxFQUFFLENBQUM7U0FDYixDQUFDO0tBQ0g7SUFFRCxJQUFJLFVBQVUsS0FBSyxJQUFJLEVBQUU7UUFDdkIsaUJBQWlCLEVBQUUsQ0FBQztRQUVwQixLQUFLLENBQUMsWUFBWSxDQUFDLEdBQUc7WUFDcEIsS0FBSyxFQUFFO2dCQUNMO29CQUNFLEtBQUssRUFBRSxVQUFVO29CQUNqQixTQUFTO29CQUNULFNBQVM7aUJBQ1Y7YUFDRjtZQUNELFNBQVMsRUFBRSxDQUFDO1NBQ2IsQ0FBQztLQUNIO0lBRUQsSUFBSSxpQkFBaUIsS0FBSyxDQUFDLEVBQUU7UUFDM0IsTUFBTSxJQUFJLEtBQUssQ0FDYiw4SkFBOEosQ0FDL0osQ0FBQztLQUNIO0lBRUQsTUFBTSxFQUFFLGFBQWEsRUFBRSxHQUFHLE1BQU0sRUFBRTtTQUMvQixVQUFVLENBQUMsZ0JBQWdCLENBQUM7U0FDNUIsU0FBUyxDQUFDLEVBQUUsR0FBRyxFQUFFLElBQUksa0JBQVEsQ0FBQyxFQUFFLENBQUMsRUFBRSxFQUFFLFdBQVcsQ0FBQyxDQUFDO0lBRXJELElBQUksYUFBYSxLQUFLLENBQUMsRUFBRTtRQUN2QixNQUFNLElBQUksS0FBSyxDQUNiLDRDQUE0QyxJQUFJLENBQUMsU0FBUyxDQUN4RCxJQUFJLENBQ0wsV0FBVyxDQUNiLENBQUM7S0FDSDtJQUVELE1BQU0sR0FBRyxHQUFHLE1BQU0sRUFBRTtTQUNqQixVQUFVLENBQUMsZ0JBQWdCLENBQUM7U0FDNUIsU0FBUyxDQUFDLENBQUMsRUFBRSxNQUFNLEVBQUUsRUFBRSxHQUFHLEVBQUUsSUFBSSxrQkFBUSxDQUFDLEVBQUUsQ0FBQyxFQUFFLEVBQUUsRUFBRSxpQkFBUyxFQUFFLGVBQU8sQ0FBQyxDQUFDO1NBQ3RFLE9BQU8sRUFBRSxDQUFDO0lBRWIsTUFBTTtTQUNILE9BQU8sQ0FBQywrQkFBcUIsRUFBRSxFQUFFLG1CQUFtQixFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDO1NBQy9ELEtBQUssQ0FBQyxDQUFDLEtBQUssRUFBRSxFQUFFLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDO0lBRTFDLE9BQU8sR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQ2hCLENBQUMsQ0FBQSxDQUFDO0FBcldXLFFBQUEsa0JBQWtCLHNCQXFXN0I7QUFFSyxNQUFNLGVBQWUsR0FBeUMsQ0FDbkUsTUFBTSxFQUNOLElBQUksRUFDSixPQUFPLEVBQ1AsSUFBSSxFQUNKLEVBQUU7O0lBQ0YsTUFBTSxFQUNKLElBQUksRUFBRSxVQUFVLEVBQ2hCLFVBQVUsRUFBRSxZQUFZLEVBQ3hCLElBQUksRUFDSixRQUFRLEVBQUUsVUFBVSxFQUNwQixNQUFNLEVBQUUsRUFBRSxFQUFFLEVBQUUsUUFBUSxFQUFFLFVBQVUsRUFBRSxFQUNwQyxXQUFXLEdBQUcsSUFBSSxFQUNsQixhQUFhLEVBQUUsZUFBZSxFQUM5QixLQUFLLEdBQ04sR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDO0lBRWhCLE1BQU0sVUFBVSxTQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsVUFBVSxtQ0FBSSxLQUFLLENBQUM7SUFFbkQsTUFBTSxFQUFFLEVBQUUsRUFBRSxJQUFJLEVBQUUsT0FBTyxFQUFFLE1BQU0sRUFBRSxHQUFHLE9BQU8sQ0FBQztJQUU5QyxNQUFNLFNBQVMsR0FBRyxJQUFJLElBQUksRUFBRSxDQUFDO0lBQzdCLE1BQU0sVUFBVSxHQUFHLFNBQVMsQ0FBQztJQUU3QixNQUFNLFNBQVMsR0FBRztRQUNoQixJQUFJLEVBQUUsWUFBWTtRQUNsQixFQUFFLEVBQUUsSUFBSSxDQUFDLEVBQUU7S0FDWixDQUFDO0lBRUYsTUFBTSxTQUFTLEdBQUc7UUFDaEIsS0FBSyxFQUFFO1lBQ0w7Z0JBQ0UsS0FBSyxFQUFFLEtBQUs7Z0JBQ1osU0FBUztnQkFDVCxTQUFTO2FBQ1Y7U0FDRjtRQUNELElBQUksRUFBRTtZQUNKO2dCQUNFLEtBQUssRUFBRSxJQUFJLEtBQUssNkJBQWdCLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLE9BQU87Z0JBQzVELFNBQVM7Z0JBQ1QsU0FBUzthQUNWO1NBQ0Y7UUFDRCxVQUFVO1FBQ1YsU0FBUztRQUNULFNBQVM7UUFDVCxPQUFPLEVBQUU7WUFDUDtnQkFDRSxLQUFLLEVBQUUsS0FBSztnQkFDWixTQUFTO2dCQUNULFNBQVM7YUFDVjtTQUNGO1FBQ0QsVUFBVSxFQUFFO1lBQ1Y7Z0JBQ0UsS0FBSyxFQUFFLFVBQVU7Z0JBQ2pCLFNBQVM7Z0JBQ1QsU0FBUzthQUNWO1NBQ0Y7S0FDSyxDQUFDO0lBRVQsY0FBYztJQUNkLElBQUksV0FBVyxFQUFFO1FBQ2YsU0FBUyxDQUFDLGFBQWEsQ0FBQyxHQUFHO1lBQ3pCO2dCQUNFLEtBQUssRUFBRSxXQUFXO2dCQUNsQixTQUFTO2dCQUNULFNBQVM7YUFDVjtTQUNGLENBQUM7S0FDSDtTQUFNO1FBQ0wsU0FBUyxDQUFDLGFBQWEsQ0FBQyxHQUFHLEVBQUUsQ0FBQztLQUMvQjtJQUVELE9BQU87SUFDUCxNQUFNLElBQUksR0FBRyxNQUFNLENBQUMsVUFBVSxFQUFFLE1BQU0sQ0FBQyxRQUFRLENBQUMsQ0FBQztJQUNqRCxJQUFJLENBQUMsSUFBSSxDQUFDLE9BQU8sRUFBRSxFQUFFO1FBQ25CLE1BQU0sSUFBSSxLQUFLLENBQ2IsNkNBQTZDLFVBQVUscUNBQXFDLENBQzdGLENBQUM7S0FDSDtJQUVELFNBQVMsQ0FBQyxNQUFNLENBQUMsR0FBRztRQUNsQjtZQUNFLEtBQUssRUFBRSxJQUFJLENBQUMsTUFBTSxFQUFFO1lBQ3BCLFNBQVM7WUFDVCxTQUFTO1NBQ1Y7S0FDRixDQUFDO0lBRUYsYUFBYTtJQUNiO1FBQ0UsTUFBTSxFQUFFLFVBQVUsRUFBRSxFQUFFLEVBQUUsSUFBSSxFQUFFLEdBQUcsT0FBTyxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsWUFBWSxDQUFDLENBQUM7UUFFcEUsTUFBTSxFQUFFLEdBQUcsSUFBSSxrQkFBUSxDQUFDLFlBQVksQ0FBQyxDQUFDO1FBRXRDLElBQ0UsQ0FBQyxLQUFLLENBQUMsTUFBTSxFQUFFLENBQUMsVUFBVSxDQUFDLFVBQVUsQ0FBQyxDQUFDLElBQUksQ0FBQyxFQUFFLEdBQUcsRUFBRSxFQUFFLEVBQUUsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLEVBQUUsQ0FBQyxFQUMxRTtZQUNBLE1BQU0sSUFBSSxLQUFLLENBQ2Isd0RBQXdELFlBQVksa0JBQWtCLENBQ3ZGLENBQUM7U0FDSDtRQUVELFNBQVMsQ0FBQyxZQUFZLENBQUMsR0FBRztZQUN4QjtnQkFDRSxLQUFLLEVBQUU7b0JBQ0wsSUFBSSxFQUFFLElBQUksa0JBQVEsQ0FBQyxJQUFJLENBQUM7b0JBQ3hCLEVBQUU7aUJBQ0g7Z0JBQ0QsU0FBUztnQkFDVCxTQUFTO2FBQ1Y7U0FDRixDQUFDO0tBQ0g7SUFFRCx1QkFBdUI7SUFDdkI7UUFDRSxNQUFNLEVBQUUsVUFBVSxFQUFFLEVBQUUsRUFBRSxJQUFJLEVBQUUsR0FBRyxPQUFPLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FDbkQsc0JBQXNCLENBQ3ZCLENBQUM7UUFFRixNQUFNLEVBQUUsR0FBRyxJQUFJLGtCQUFRLENBQUMsVUFBVSxDQUFDLENBQUM7UUFFcEMsSUFDRSxDQUFDLEtBQUssQ0FBQyxNQUFNLEVBQUUsQ0FBQyxVQUFVLENBQUMsVUFBVSxDQUFDLENBQUMsSUFBSSxDQUFDLEVBQUUsR0FBRyxFQUFFLEVBQUUsRUFBRSxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssRUFBRSxDQUFDLEVBQzFFO1lBQ0EsTUFBTSxJQUFJLEtBQUssQ0FDYixrRUFBa0UsVUFBVSxrQkFBa0IsQ0FDL0YsQ0FBQztTQUNIO1FBRUQsU0FBUyxDQUFDLFVBQVUsQ0FBQyxHQUFHO1lBQ3RCO2dCQUNFLEtBQUssRUFBRTtvQkFDTCxJQUFJLEVBQUUsSUFBSSxrQkFBUSxDQUFDLElBQUksQ0FBQztvQkFDeEIsRUFBRTtpQkFDSDtnQkFDRCxTQUFTO2dCQUNULFNBQVM7YUFDVjtTQUNGLENBQUM7S0FDSDtJQUVELHFCQUFxQjtJQUNyQjtRQUNFLE1BQU0sRUFBRSxHQUFHLElBQUksa0JBQVEsQ0FBQyxRQUFRLENBQUMsQ0FBQztRQUVsQyxNQUFNLEtBQUssR0FBRyxFQUFFLEVBQUUsRUFBZSxDQUFDO1FBRWxDLElBQUksVUFBa0IsQ0FBQztRQUN2QixRQUFRLFVBQVUsRUFBRTtZQUNsQixLQUFLLG1DQUFzQixDQUFDLFFBQVE7Z0JBQ2xDLElBQUksT0FBTyxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsVUFBVSxDQUFDLEVBQUU7b0JBQ3BDLE1BQU0sUUFBUSxHQUFHLE9BQU8sQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLFVBQVUsQ0FBQyxDQUFDO29CQUNsRCxVQUFVLEdBQUcsUUFBUSxDQUFDLFVBQVUsQ0FBQztvQkFDakMsS0FBSyxDQUFDLElBQUksR0FBRyxJQUFJLGtCQUFRLENBQUMsUUFBUSxDQUFDLEVBQUUsQ0FBQyxDQUFDO2lCQUN4QztnQkFDRCxNQUFNO1lBQ1IsS0FBSyxtQ0FBc0IsQ0FBQyxVQUFVO2dCQUNwQyxJQUFJLE9BQU8sQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLFlBQVksQ0FBQyxFQUFFO29CQUN0QyxNQUFNLFFBQVEsR0FBRyxPQUFPLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBQyxZQUFZLENBQUMsQ0FBQztvQkFDcEQsVUFBVSxHQUFHLFFBQVEsQ0FBQyxVQUFVLENBQUM7b0JBQ2pDLEtBQUssQ0FBQyxJQUFJLEdBQUcsSUFBSSxrQkFBUSxDQUFDLFFBQVEsQ0FBQyxFQUFFLENBQUMsQ0FBQztpQkFDeEM7Z0JBQ0QsTUFBTTtZQUNSLEtBQUssbUNBQXNCLENBQUMsTUFBTTtnQkFDaEMsSUFBSSxPQUFPLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBQyxRQUFRLENBQUMsRUFBRTtvQkFDbEMsTUFBTSxRQUFRLEdBQUcsT0FBTyxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsUUFBUSxDQUFDLENBQUM7b0JBQ2hELFVBQVUsR0FBRyxRQUFRLENBQUMsVUFBVSxDQUFDO29CQUNqQyxLQUFLLENBQUMsSUFBSSxHQUFHLElBQUksa0JBQVEsQ0FBQyxRQUFRLENBQUMsRUFBRSxDQUFDLENBQUM7aUJBQ3hDO2dCQUNELE1BQU07U0FDVDtRQUVELDRCQUE0QjtRQUM1QixJQUNFLENBQUMsS0FBSyxDQUFDLE1BQU0sRUFBRSxDQUFDLFVBQVUsQ0FBQyxVQUFVLENBQUMsQ0FBQyxJQUFJLENBQUMsRUFBRSxHQUFHLEVBQUUsRUFBRSxFQUFFLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxFQUFFLENBQUMsRUFDMUU7WUFDQSxNQUFNLElBQUksS0FBSyxDQUNiLDJDQUEyQyxVQUFVLGFBQWEsUUFBUSxrQkFBa0IsQ0FDN0YsQ0FBQztTQUNIO2FBQU0sSUFBSSxLQUFLLENBQUMsSUFBSSxLQUFLLFNBQVMsRUFBRTtZQUNuQyxNQUFNLElBQUksS0FBSyxDQUNiLDJDQUEyQyxVQUFVLGNBQWMsQ0FDcEUsQ0FBQztTQUNIO1FBRUQsU0FBUyxDQUFDLFFBQVEsQ0FBQyxHQUFHO1lBQ3BCO2dCQUNFLEtBQUs7Z0JBQ0wsU0FBUztnQkFDVCxTQUFTO2FBQ1Y7U0FDRixDQUFDO0tBQ0g7SUFFRCxnQkFBZ0I7SUFDaEI7UUFDRSxNQUFNLEVBQUUsVUFBVSxFQUFFLEVBQUUsRUFBRSxJQUFJLEVBQUUsR0FBRyxPQUFPLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBQyxlQUFlLENBQUMsQ0FBQztRQUV2RSxNQUFNLEVBQUUsR0FBRyxJQUFJLGtCQUFRLENBQUMsZUFBZSxDQUFDLENBQUM7UUFFekMsSUFDRSxDQUFDLEtBQUssQ0FBQyxNQUFNLEVBQUUsQ0FBQyxVQUFVLENBQUMsVUFBVSxDQUFDLENBQUMsSUFBSSxDQUFDLEVBQUUsR0FBRyxFQUFFLEVBQUUsRUFBRSxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssRUFBRSxDQUFDLEVBQzFFO1lBQ0EsTUFBTSxJQUFJLEtBQUssQ0FDYiwyREFBMkQsZUFBZSxrQkFBa0IsQ0FDN0YsQ0FBQztTQUNIO1FBRUQsU0FBUyxDQUFDLGVBQWUsQ0FBQyxHQUFHO1lBQzNCO2dCQUNFLEtBQUssRUFBRTtvQkFDTCxJQUFJLEVBQUUsSUFBSSxrQkFBUSxDQUFDLElBQUksQ0FBQztvQkFDeEIsRUFBRTtpQkFDSDtnQkFDRCxTQUFTO2dCQUNULFNBQVM7YUFDVjtTQUNGLENBQUM7S0FDSDtJQUVELE1BQU0sRUFBRSxVQUFVLEVBQUUsYUFBYSxFQUFFLEdBQUcsTUFBTSxFQUFFO1NBQzNDLFVBQVUsQ0FBQyxnQkFBZ0IsQ0FBQztTQUM1QixTQUFTLENBQUMsU0FBUyxDQUFDLENBQUM7SUFFeEIsSUFBSSxhQUFhLEtBQUssQ0FBQyxFQUFFO1FBQ3ZCLE1BQU0sSUFBSSxLQUFLLENBQ2IseUNBQXlDLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FDekUsQ0FBQztLQUNIO0lBRUQsTUFBTSxRQUFRLEdBQUcsTUFBTSxFQUFFO1NBQ3RCLFVBQVUsQ0FBQyxnQkFBZ0IsQ0FBQztTQUM1QixTQUFTLENBQUMsQ0FBQyxFQUFFLE1BQU0sRUFBRSxFQUFFLEdBQUcsRUFBRSxVQUFVLEVBQUUsRUFBRSxFQUFFLGlCQUFTLEVBQUUsZUFBTyxDQUFDLENBQUM7U0FDaEUsT0FBTyxFQUFFLENBQUM7SUFFYixNQUFNO1NBQ0gsT0FBTyxDQUFDLDZCQUFtQixFQUFFLEVBQUUsaUJBQWlCLEVBQUUsUUFBUSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUM7U0FDaEUsS0FBSyxDQUFDLENBQUMsS0FBSyxFQUFFLEVBQUUsQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUM7SUFFMUMsT0FBTyxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDckIsQ0FBQyxDQUFBLENBQUM7QUFyUFcsUUFBQSxlQUFlLG1CQXFQMUI7QUFFSyxNQUFNLGtCQUFrQixHQUE0QyxDQUN6RSxNQUFNLEVBQ04sSUFBSSxFQUNKLE9BQU8sRUFDUCxJQUFJLEVBQ0osRUFBRTtJQUNGLE1BQU0sRUFBRSxFQUFFLEVBQUUsR0FBRyxJQUFJLENBQUM7SUFDcEIsTUFBTSxFQUFFLEVBQUUsRUFBRSxJQUFJLEVBQUUsTUFBTSxFQUFFLEdBQUcsT0FBTyxDQUFDO0lBRXJDLE1BQU0sU0FBUyxHQUFHO1FBQ2hCLElBQUksRUFBRSxZQUFZO1FBQ2xCLEVBQUUsRUFBRSxJQUFJLENBQUMsRUFBRTtLQUNaLENBQUM7SUFFRixNQUFNLFNBQVMsR0FBRyxJQUFJLElBQUksRUFBRSxDQUFDO0lBQzdCLE1BQU0sVUFBVSxHQUFHLFNBQVMsQ0FBQztJQUU3QixNQUFNLFdBQVcsR0FBRztRQUNsQixJQUFJLEVBQUU7WUFDSixVQUFVO1NBQ1g7UUFDRCxLQUFLLEVBQUU7WUFDTCxPQUFPLEVBQUU7Z0JBQ1AsS0FBSyxFQUFFO29CQUNMO3dCQUNFLEtBQUssRUFBRSxJQUFJO3dCQUNYLFNBQVM7d0JBQ1QsU0FBUztxQkFDVjtpQkFDRjtnQkFDRCxTQUFTLEVBQUUsQ0FBQzthQUNiO1NBQ0Y7S0FDRixDQUFDO0lBRUYsTUFBTSxHQUFHLEdBQUcsSUFBSSxrQkFBUSxDQUFDLEVBQUUsQ0FBQyxDQUFDO0lBRTdCLE1BQU0sRUFBRSxhQUFhLEVBQUUsR0FBRyxNQUFNLEVBQUU7U0FDL0IsVUFBVSxDQUFDLGdCQUFnQixDQUFDO1NBQzVCLFNBQVMsQ0FBQyxFQUFFLEdBQUcsRUFBRSxFQUFFLFdBQVcsQ0FBQyxDQUFDO0lBRW5DLElBQUksYUFBYSxLQUFLLENBQUMsRUFBRTtRQUN2QixNQUFNLElBQUksS0FBSyxDQUNiLDRDQUE0QyxJQUFJLENBQUMsU0FBUyxDQUN4RCxJQUFJLENBQ0wsV0FBVyxDQUNiLENBQUM7S0FDSDtJQUVELHlCQUF5QjtJQUN6QixrQ0FBa0M7SUFDbEMsMERBQTBEO0lBQzFELGdCQUFnQjtJQUVoQixNQUFNLEdBQUcsR0FBRyxNQUFNLHNCQUFZLENBQUMsTUFBTSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsT0FBTyxFQUFFLElBQUksQ0FBQyxDQUFDO0lBRTlELE1BQU07U0FDSCxPQUFPLENBQUMsK0JBQXFCLEVBQUUsRUFBRSxtQkFBbUIsRUFBRSxHQUFHLEVBQUUsQ0FBQztTQUM1RCxLQUFLLENBQUMsQ0FBQyxLQUFLLEVBQUUsRUFBRSxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQztJQUMxQyxNQUFNO1NBQ0gsT0FBTyxDQUFDLGdDQUFzQixFQUFFLEVBQUUsb0JBQW9CLEVBQUUsR0FBRyxFQUFFLENBQUM7U0FDOUQsS0FBSyxDQUFDLENBQUMsS0FBSyxFQUFFLEVBQUUsQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUM7SUFFMUMsT0FBTyxHQUFHLENBQUM7QUFDYixDQUFDLENBQUEsQ0FBQztBQWhFVyxRQUFBLGtCQUFrQixzQkFnRTdCO0FBRVcsUUFBQSxZQUFZLEdBQTBCO0lBQ2pELElBQUksRUFBRSxDQUFDLE1BQU0sRUFBRSxFQUFFLENBQ2QsTUFBTSxDQUFDLElBQVksS0FBSyxRQUFRO1FBQy9CLENBQUMsQ0FBQyw2QkFBZ0IsQ0FBQyxNQUFNO1FBQ3pCLENBQUMsQ0FBQyw2QkFBZ0IsQ0FBQyxLQUFLO0lBQzVCLFVBQVUsRUFBRSxnQ0FBaUI7SUFDN0IsUUFBUSxFQUFFLGdDQUFpQjtJQUMzQixhQUFhLEVBQUUsZ0NBQWlCO0lBQ2hDLE1BQU0sRUFBRSxnQ0FBaUI7SUFDekIsSUFBSSxFQUFFLENBQUMsTUFBTSxFQUFFLElBQUksRUFBRSxPQUFPLEVBQUUsSUFBSSxFQUFFLEVBQUU7UUFDcEMsT0FBUyxNQUFNLENBQUMsSUFBcUIsQ0FBQyxXQUFXLEVBQUUsQ0FBQztJQUN0RCxDQUFDO0lBQ0QsVUFBVSxFQUFFLENBQUMsTUFBTSxFQUFFLElBQUksRUFBRSxPQUFPLEVBQUUsSUFBSSxFQUFFLEVBQUU7UUFDMUMsT0FBUyxNQUFNLENBQUMsVUFBMkIsQ0FBQyxXQUFXLEVBQUUsQ0FBQztJQUM1RCxDQUFDO0NBQ0YsQ0FBQztBQUVXLFFBQUEsaUJBQWlCLEdBQStDO0lBQzNFLFNBQVMsRUFBRSxDQUFDLENBQUMsRUFBRSxFQUFFLEVBQUUsRUFBRSxNQUFNLEVBQUUsRUFBRSxFQUFFLENBQUMsTUFBTSxDQUFDLGFBQWEsQ0FBQyw2QkFBbUIsQ0FBQztDQUM1RSxDQUFDO0FBRVcsUUFBQSxtQkFBbUIsR0FBaUQ7SUFDL0UsU0FBUyxFQUFFLENBQUMsQ0FBQyxFQUFFLEVBQUUsRUFBRSxFQUFFLE1BQU0sRUFBRSxFQUFFLEVBQUUsQ0FBQyxNQUFNLENBQUMsYUFBYSxDQUFDLCtCQUFxQixDQUFDO0NBQzlFLENBQUMifQ==