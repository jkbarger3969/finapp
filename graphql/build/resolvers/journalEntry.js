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
const shared_1 = require("./shared");
const graphTypes_1 = require("../graphTypes");
const nodeResolver_1 = require("./utils/nodeResolver");
const departments_1 = require("./departments");
const JOURNAL_ENTRY_ADDED = "JOURNAL_ENTRY_ADDED";
const JOURNAL_ENTRY_UPDATED = "JOURNAL_ENTRY_UPDATED";
const userNodeType = new mongodb_1.ObjectID("5dca0427bccd5c6f26b0cde2");
const addFields = { $addFields: {
        id: { $toString: "$_id" },
        type: { $arrayElemAt: ["$type.value", 0] },
        department: { $arrayElemAt: ["$department.value", 0] },
        category: { $arrayElemAt: ["$category.value", 0] },
        paymentMethod: { $arrayElemAt: ["$paymentMethod.value", 0] },
        total: { $arrayElemAt: ["$total.value", 0] },
        source: { $arrayElemAt: ["$source.value", 0] },
        reconciled: { $arrayElemAt: ["$reconciled.value", 0] },
        description: { $ifNull: [{ $arrayElemAt: ["$description.value", 0] }, null] },
        date: { $arrayElemAt: ["$date.value", 0] }
    } };
const defaultSort = { $sort: { lastUpdate: -1 } };
const project = { $project: {
        deleted: false,
        lastUpdate: false,
        parent: false,
        createdBy: false
    } };
var SortBy;
(function (SortBy) {
    SortBy["DEPARTMENT"] = "department";
    SortBy["CATEGORY"] = "category";
    // "ROOT_TYPE" = "_rootType",
    SortBy["PAYMENT_METHOD"] = "paymentMethod";
    SortBy["TOTAL"] = "_total";
    SortBy["DATE"] = "date";
    SortBy["SOURCE"] = "source";
})(SortBy || (SortBy = {}));
const sortByTotalField = { $addFields: {
        _total: { $divide: ["$total.num", "$total.den"] }
    } };
exports.journalEntries = (parent, args, context, info) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o;
    const { db } = context;
    const sortBy = (_b = (_a = args) === null || _a === void 0 ? void 0 : _a.sortBy, (_b !== null && _b !== void 0 ? _b : null));
    const filterBy = (_d = (_c = args) === null || _c === void 0 ? void 0 : _c.filterBy, (_d !== null && _d !== void 0 ? _d : null));
    const match = { "deleted.0.value": false };
    if (filterBy) {
        if ((_f = (_e = filterBy) === null || _e === void 0 ? void 0 : _e.department) === null || _f === void 0 ? void 0 : _f.eq) {
            const rootDeptId = new mongodb_1.ObjectID(filterBy.department.eq);
            const deptIds = yield departments_1.getDescendants(db, rootDeptId, { _id: true });
            match["department.0.value.id"] = { $in: [
                    rootDeptId,
                    ...deptIds.map(v => v._id)
                ] };
        }
        if (((_g = filterBy) === null || _g === void 0 ? void 0 : _g.reconciled) === graphTypes_1.JournalEntiresReconciledFilter.NotReconciled) {
            match["reconciled.0.value"] = false;
        }
        else if (((_h = filterBy) === null || _h === void 0 ? void 0 : _h.reconciled) === graphTypes_1.JournalEntiresReconciledFilter.Reconciled) {
            match["reconciled.0.value"] = true;
        }
    }
    const skipAndLimit = (_l = (_k = (_j = args) === null || _j === void 0 ? void 0 : _j.paginate) === null || _k === void 0 ? void 0 : _k.limit, (_l !== null && _l !== void 0 ? _l : null)) === null ?
        [] : [{ $skip: (_o = (_m = args) === null || _m === void 0 ? void 0 : _m.paginate.skip, (_o !== null && _o !== void 0 ? _o : 0)) }, { $limit: args.paginate.limit }];
    const pipeline = [{ $match: match }];
    if (!sortBy || sortBy.length === 0) {
        pipeline.push(defaultSort, ...skipAndLimit, addFields);
    }
    else {
        pipeline.push(addFields);
        const $sort = {};
        for (const { column, direction } of sortBy) {
            $sort[SortBy[column]] = shared_1.SortDirection[direction];
            if (column === "TOTAL") {
                pipeline.push(sortByTotalField);
            }
        }
        pipeline.push({ $sort }, ...skipAndLimit);
    }
    pipeline.push(project);
    const totalCount = yield db.collection("journalEntries")
        .countDocuments(match);
    const entries = yield db.collection("journalEntries")
        .aggregate(pipeline).toArray();
    return {
        totalCount,
        entries
    };
});
exports.updateJournalEntry = (parent, args, context, info) => __awaiter(void 0, void 0, void 0, function* () {
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
            throw new Error(`Mutation "updateJournalEntry" date argument "${dateString}" not a valid ISO 8601 date string.`);
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
            throw new Error(`Mutation "updateJournalEntry" source type "${sourceType}" with id ${sourceId} does not exist.`);
        }
        else if (value.node === undefined) {
            throw new Error(`Mutation "updateJournalEntry" source type "${sourceType}" not found.`);
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
            throw new Error(`Mutation "updateJournalEntry" type "Department" with id ${departmentId} does not exist.`);
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
                throw new Error(`Mutation "updateJournalEntry" "JournalEntryType" must match "JournalEntryCategory" type.`);
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
            throw new Error(`Mutation "updateJournalEntry" type "JournalEntryCategory" with id ${categoryId} does not exist.`);
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
            throw new Error(`Mutation "updateJournalEntry" "JournalEntryType" must match "JournalEntryCategory" type.`);
        }
    }
    if (paymentMethodId !== null) {
        numFieldsToUpdate++;
        const { collection, id: node } = nodeMap.typename.get("PaymentMethod");
        const id = new mongodb_1.ObjectID(paymentMethodId);
        if (0 === (yield db.collection(collection)
            .find({ _id: id }).limit(1).count())) {
            throw new Error(`Mutation "updateJournalEntry" type "PaymentMethod" with id ${paymentMethodId} does not exist.`);
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
        throw new Error(`Mutation "updateJournalEntry" requires at least one of the following fields: "date", "source", "category", "department", "total", "type", or "paymentMethod"`);
    }
    const { modifiedCount } = yield db.collection("journalEntries")
        .updateOne({ _id: new mongodb_1.ObjectID(id) }, updateQuery);
    if (modifiedCount === 0) {
        throw new Error(`Mutation "updateJournalEntry" arguments "${JSON.stringify(args)}" failed.`);
    }
    const doc = yield db.collection("journalEntries")
        .aggregate([
        { $match: { _id: new mongodb_1.ObjectID(id) } },
        addFields,
        project
    ]).toArray();
    pubSub.publish(JOURNAL_ENTRY_UPDATED, { journalEntryUpdated: doc[0] })
        .catch((error) => console.error(error));
    return doc[0];
});
exports.addJournalEntry = (parent, args, context, info) => __awaiter(void 0, void 0, void 0, function* () {
    var _p;
    const { date: dateString, department: departmentId, type, category: categoryId, source: { id: sourceId, sourceType }, description = null, paymentMethod: paymentMethodId, total, } = args.fields;
    const reconciled = (_p = args.fields.reconciled, (_p !== null && _p !== void 0 ? _p : false));
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
        throw new Error(`Mutation "addJournalEntry" date argument "${dateString}" not a valid ISO 8601 date string.`);
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
            throw new Error(`Mutation "addJournalEntry" type "Department" with id ${departmentId} does not exist.`);
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
            throw new Error(`Mutation "addJournalEntry" type "JournalEntryCategory" with id ${categoryId} does not exist.`);
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
            throw new Error(`Mutation "addJournalEntry" source type "${sourceType}" with id ${sourceId} does not exist.`);
        }
        else if (value.node === undefined) {
            throw new Error(`Mutation "addJournalEntry" source type "${sourceType}" not found.`);
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
            throw new Error(`Mutation "addJournalEntry" type "PaymentMethod" with id ${paymentMethodId} does not exist.`);
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
        throw new Error(`Mutation "addJournalEntry" arguments "${JSON.stringify(args)}" failed.`);
    }
    const newEntry = yield db.collection("journalEntries").aggregate([
        { $match: { _id: insertedId } },
        addFields,
        project
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
    }
};
exports.journalEntryAdded = {
    subscribe: (_, __, { pubSub }) => pubSub.asyncIterator(JOURNAL_ENTRY_ADDED)
};
exports.journalEntryUpdated = {
    subscribe: (_, __, { pubSub }) => pubSub.asyncIterator(JOURNAL_ENTRY_UPDATED)
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiam91cm5hbEVudHJ5LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL3Jlc29sdmVycy9qb3VybmFsRW50cnkudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7QUFBQSxxQ0FBaUM7QUFDakMsaUNBQWlDO0FBRWpDLHFDQUF1QztBQUN2Qyw4Q0FHdUI7QUFDdkIsdURBQXVEO0FBRXZELCtDQUFnRTtBQUVoRSxNQUFNLG1CQUFtQixHQUFHLHFCQUFxQixDQUFDO0FBQ2xELE1BQU0scUJBQXFCLEdBQUcsdUJBQXVCLENBQUM7QUFFdEQsTUFBTSxZQUFZLEdBQUcsSUFBSSxrQkFBUSxDQUFDLDBCQUEwQixDQUFDLENBQUM7QUFFOUQsTUFBTSxTQUFTLEdBQUcsRUFBQyxVQUFVLEVBQUM7UUFDNUIsRUFBRSxFQUFDLEVBQUMsU0FBUyxFQUFFLE1BQU0sRUFBQztRQUN0QixJQUFJLEVBQUMsRUFBQyxZQUFZLEVBQUUsQ0FBQyxhQUFhLEVBQUMsQ0FBQyxDQUFDLEVBQUM7UUFDdEMsVUFBVSxFQUFDLEVBQUMsWUFBWSxFQUFFLENBQUMsbUJBQW1CLEVBQUMsQ0FBQyxDQUFDLEVBQUM7UUFDbEQsUUFBUSxFQUFDLEVBQUMsWUFBWSxFQUFFLENBQUMsaUJBQWlCLEVBQUMsQ0FBQyxDQUFDLEVBQUM7UUFDOUMsYUFBYSxFQUFDLEVBQUMsWUFBWSxFQUFFLENBQUMsc0JBQXNCLEVBQUMsQ0FBQyxDQUFDLEVBQUM7UUFDeEQsS0FBSyxFQUFDLEVBQUMsWUFBWSxFQUFFLENBQUMsY0FBYyxFQUFDLENBQUMsQ0FBQyxFQUFDO1FBQ3hDLE1BQU0sRUFBQyxFQUFDLFlBQVksRUFBRSxDQUFDLGVBQWUsRUFBQyxDQUFDLENBQUMsRUFBQztRQUMxQyxVQUFVLEVBQUMsRUFBQyxZQUFZLEVBQUUsQ0FBQyxtQkFBbUIsRUFBQyxDQUFDLENBQUMsRUFBQztRQUNsRCxXQUFXLEVBQUMsRUFBQyxPQUFPLEVBQUUsQ0FBRSxFQUFDLFlBQVksRUFB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