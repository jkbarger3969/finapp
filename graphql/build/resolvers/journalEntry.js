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
        [] : [{ $limit: args.paginate.limit }, { $skip: (_o = (_m = args) === null || _m === void 0 ? void 0 : _m.paginate.skip, (_o !== null && _o !== void 0 ? _o : 0)) }];
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
    // console.log(pipeline, entries, filterBy?.department?.eq);
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