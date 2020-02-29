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
const nodeResolver_1 = require("./utils/nodeResolver");
const addId = { $addFields: { id: { $toString: "$_id" } } };
exports.departments = (parent, args, context, info) => __awaiter(void 0, void 0, void 0, function* () {
    const { db } = context;
    const fromParent = args.fromParent;
    const searchByName = args.searchByName ? args.searchByName.trim() : "";
    const searchByNameRegex = searchByName.length > 0 ? new RegExp(`(^|\\s)${searchByName}`, "i") : null;
    const deptsPromises = [];
    if (fromParent) {
        const fromMatch = { $match: { "parent.id": new mongodb_1.ObjectID(fromParent) } };
        const parentPromise = db
            .collection("departments")
            .aggregate([
            searchByNameRegex
                ? { $match: Object.assign(Object.assign({}, fromMatch.$match), { name: searchByNameRegex }) }
                : fromMatch,
            addId
        ])
            .toArray();
        deptsPromises.push(parentPromise);
        const descendentPipeline = [fromMatch];
        if (searchByNameRegex) {
            descendentPipeline.push({
                $graphLookup: {
                    from: "departments",
                    startWith: "$_id",
                    connectFromField: "_id",
                    connectToField: "parent.id",
                    as: "subDepartments",
                    restrictSearchWithMatch: { name: searchByNameRegex }
                }
            });
        }
        else {
            descendentPipeline.push({
                $graphLookup: {
                    from: "departments",
                    startWith: "$_id",
                    connectFromField: "_id",
                    connectToField: "parent.id",
                    as: "subDepartments"
                }
            });
        }
        descendentPipeline.push({
            $unwind: {
                path: "$subDepartments",
                preserveNullAndEmptyArrays: false
            }
        }, { $replaceRoot: { newRoot: "$subDepartments" } }, addId);
        const decedentPromises = db
            .collection("departments")
            .aggregate(descendentPipeline)
            .toArray();
        deptsPromises.push(decedentPromises);
        const graphResults = yield Promise.all(deptsPromises);
        const allResults = [].concat.apply([], graphResults);
        return allResults;
    }
    else if (searchByNameRegex) {
        const nameOnlyResults = yield db
            .collection("departments")
            .aggregate([{ $match: { name: searchByNameRegex } }, addId])
            .toArray();
        return nameOnlyResults;
    }
    const allDepts = yield db
        .collection("departments")
        .aggregate([addId])
        .toArray();
    return allDepts;
});
exports.department = (parent, args, context, info) => __awaiter(void 0, void 0, void 0, function* () {
    const { db } = context;
    const { id } = args;
    const _id = new mongodb_1.ObjectID(id);
    const result = db
        .collection("departments")
        .aggregate([
        { $match: { _id } },
        { $limit: 1 },
        { $addFields: { id: { $toString: "$_id" } } }
    ]);
    if (yield result.hasNext()) {
        return yield result.next();
    }
    return null;
});
const ancestors = (parent, args, context, info) => __awaiter(void 0, void 0, void 0, function* () {
    const { db, nodeMap } = context;
    const node = parent.parent.node;
    const docId = parent.parent.id;
    const { id } = parent;
    const parentNodeType = nodeMap.id.get(node.toString());
    if (parentNodeType.typename === "Department") {
        const results = yield db
            .collection("departments")
            .aggregate([
            { $match: { _id: new mongodb_1.ObjectID(id) } },
            {
                $graphLookup: {
                    from: "departments",
                    startWith: "$parent.id",
                    connectFromField: "parent.id",
                    connectToField: "_id",
                    as: "ancestors"
                }
            },
            {
                $unwind: {
                    path: "$ancestors",
                    preserveNullAndEmptyArrays: false
                }
            },
            { $replaceRoot: { newRoot: "$ancestors" } },
            { $addFields: { __typename: "Department" } },
            { $addFields: { id: { $toString: "$_id" } } }
        ])
            .toArray();
        const businessParent = yield nodeResolver_1.nodeDocResolver(results[results.length - 1].parent, context);
        results.push(businessParent);
        return results;
    }
    const businessParent = yield nodeResolver_1.nodeDocResolver({ node, id: docId }, context);
    return [businessParent];
});
exports.getDescendants = (db, id, projection = null) => __awaiter(void 0, void 0, void 0, function* () {
    const decedentIds = [id];
    const descendants = [];
    while (decedentIds.length > 0) {
        const pipeline = [
            { $match: { "parent.id": { $in: decedentIds } } },
            addId
        ];
        if (projection !== null) {
            pipeline.push({ $project: projection });
        }
        const results = yield db
            .collection("departments")
            .aggregate(pipeline)
            .toArray();
        decedentIds.splice(0);
        for (const decedent of results) {
            descendants.push(decedent);
            decedentIds.push(new mongodb_1.ObjectID(decedent.id));
        }
    }
    return descendants;
});
const descendants = (parent, args, context, info) => {
    const { db } = context;
    const { id } = parent;
    return exports.getDescendants(db, new mongodb_1.ObjectID(id));
};
const departmentNode = new mongodb_1.ObjectID("5dc4addacf96e166daaa008f");
const budget = (parent, args, context, info) => __awaiter(void 0, void 0, void 0, function* () {
    const { db } = context;
    const { id } = parent;
    const result = yield db
        .collection("budgets")
        .aggregate([
        {
            $match: {
                owner: {
                    node: departmentNode,
                    id: new mongodb_1.ObjectID(id)
                }
            }
        },
        addId
    ])
        .toArray();
    return result[0] || null;
});
exports.Department = {
    budget,
    parent: nodeResolver_1.nodeFieldResolver,
    ancestors,
    descendants
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGVwYXJ0bWVudHMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvcmVzb2x2ZXJzL2RlcGFydG1lbnRzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7O0FBQUEscUNBQXVDO0FBUXZDLHVEQUEwRTtBQUUxRSxNQUFNLEtBQUssR0FBRyxFQUFFLFVBQVUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLFNBQVMsRUFBRSxNQUFNLEVBQUUsRUFBRSxFQUFFLENBQUM7QUFFL0MsUUFBQSxXQUFXLEdBQWtDLENBQ3hELE1BQU0sRUFDTixJQUFJLEVBQ0osT0FBTyxFQUNQLElBQUksRUFDSixFQUFFO0lBQ0YsTUFBTSxFQUFFLEVBQUUsRUFBRSxHQUFHLE9BQU8sQ0FBQztJQUN2QixNQUFNLFVBQVUsR0FBRyxJQUFJLENBQUMsVUFBVSxDQUFDO0lBQ25DLE1BQU0sWUFBWSxHQUFHLElBQUksQ0FBQyxZQUFZLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsSUFBSSxFQUFFLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQztJQUV2RSxNQUFNLGlCQUFpQixHQUNyQixZQUFZLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxNQUFNLENBQUMsVUFBVSxZQUFZLEVBQUUsRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDO0lBRTdFLE1BQU0sYUFBYSxHQUE2QixFQUFFLENBQUM7SUFFbkQsSUFBSSxVQUFVLEVBQUU7UUFDZCxNQUFNLFNBQVMsR0FBRyxFQUFFLE1BQU0sRUFBRSxFQUFFLFdBQVcsRUFBRSxJQUFJLGtCQUFRLENBQUMsVUFBVSxDQUFDLEVBQUUsRUFBRSxDQUFDO1FBRXhFLE1BQU0sYUFBYSxHQUFHLEVBQUU7YUFDckIsVUFBVSxDQUFDLGFBQWEsQ0FBQzthQUN6QixTQUFTLENBQUM7WUFDVCxpQkFBaUI7Z0JBQ2YsQ0FBQyxDQUFDLEVBQUUsTUFBTSxrQ0FB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