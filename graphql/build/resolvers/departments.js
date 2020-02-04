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
    const searchByNameRegex = searchByName.length > 0 ?
        new RegExp(`(^|\\s)${searchByName}`, "i") : null;
    const deptsPromises = [];
    if (fromParent) {
        const fromMatch = { $match: { "parent.id": new mongodb_1.ObjectID(fromParent) } };
        const parentPromise = db.collection("departments").aggregate([
            searchByNameRegex ? { $match: Object.assign(Object.assign({}, fromMatch.$match), { name: searchByNameRegex }) }
                : fromMatch,
            addId
        ]).toArray();
        deptsPromises.push(parentPromise);
        const descendentPipeline = [fromMatch];
        if (searchByNameRegex) {
            descendentPipeline.push({ $graphLookup: {
                    from: "departments",
                    startWith: "$_id",
                    connectFromField: "_id",
                    connectToField: "parent.id",
                    as: "subDepartments",
                    restrictSearchWithMatch: { name: searchByNameRegex }
                } });
        }
        else {
            descendentPipeline.push({ $graphLookup: {
                    from: "departments",
                    startWith: "$_id",
                    connectFromField: "_id",
                    connectToField: "parent.id",
                    as: "subDepartments"
                } });
        }
        descendentPipeline.push({ $unwind: {
                path: "$subDepartments",
                preserveNullAndEmptyArrays: false
            } }, { $replaceRoot: { newRoot: "$subDepartments" } }, addId);
        const decedentPromises = db.collection("departments")
            .aggregate(descendentPipeline).toArray();
        deptsPromises.push(decedentPromises);
        const graphResults = yield Promise.all(deptsPromises);
        const allResults = [].concat.apply([], graphResults);
        return allResults.length === 0 ? null : allResults;
    }
    else if (searchByNameRegex) {
        const nameOnlyResults = yield db.collection("departments")
            .aggregate([
            { $match: { name: searchByNameRegex } },
            addId
        ]).toArray();
        return nameOnlyResults.length === 0 ? null : nameOnlyResults;
    }
    const allDepts = yield db.collection("departments")
        .aggregate([addId]).toArray();
    return allDepts;
});
exports.department = (parent, args, context, info) => __awaiter(void 0, void 0, void 0, function* () {
    const { db } = context;
    const { id } = args;
    const _id = new mongodb_1.ObjectID(id);
    const result = db.collection("departments").aggregate([
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
    const node = (parent.parent).node;
    const docId = (parent.parent).id;
    const { id } = parent;
    const parentNodeType = nodeMap.id.get(node.toString());
    if (parentNodeType.typename === "Department") {
        const results = yield db.collection("departments").aggregate([
            { $match: { _id: new mongodb_1.ObjectID(id) } },
            { $graphLookup: {
                    from: "departments",
                    startWith: "$parent.id",
                    connectFromField: "parent.id",
                    connectToField: "_id",
                    as: "ancestors"
                } },
            { $unwind: {
                    path: "$ancestors",
                    preserveNullAndEmptyArrays: false
                } },
            { $replaceRoot: { newRoot: "$ancestors" } },
            { $addFields: { __typename: "Department" } },
            { $addFields: { id: { $toString: "$_id" } } }
        ]).toArray();
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
        const results = yield db.collection("departments").aggregate(pipeline).toArray();
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
    const result = yield db.collection("budgets").aggregate([
        { $match: {
                owner: {
                    node: departmentNode,
                    id: new mongodb_1.ObjectID(id)
                }
            } },
        addId
    ]).toArray();
    return result[0] || null;
});
exports.Department = {
    budget,
    parent: nodeResolver_1.nodeFieldResolver,
    ancestors,
    descendants
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGVwYXJ0bWVudHMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvcmVzb2x2ZXJzL2RlcGFydG1lbnRzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7O0FBQUEscUNBQXFDO0FBS3JDLHVEQUF3RTtBQUV4RSxNQUFNLEtBQUssR0FBRyxFQUFDLFVBQVUsRUFBRSxFQUFDLEVBQUUsRUFBQyxFQUFDLFNBQVMsRUFBRSxNQUFNLEVBQUMsRUFBQyxFQUFDLENBQUM7QUFFeEMsUUFBQSxXQUFXLEdBQ3RCLENBQU8sTUFBTSxFQUFFLElBQUksRUFBRSxPQUFPLEVBQUUsSUFBSSxFQUFFLEVBQUU7SUFHdEMsTUFBTSxFQUFDLEVBQUUsRUFBQyxHQUFHLE9BQU8sQ0FBQztJQUNyQixNQUFNLFVBQVUsR0FBRyxJQUFJLENBQUMsVUFBVSxDQUFDO0lBQ25DLE1BQU0sWUFBWSxHQUFHLElBQUksQ0FBQyxZQUFZLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsSUFBSSxFQUFFLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQztJQUV2RSxNQUFNLGlCQUFpQixHQUFHLFlBQVksQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDLENBQUM7UUFDakQsSUFBSSxNQUFNLENBQUMsVUFBVSxZQUFZLEVBQUUsRUFBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDO0lBRWxELE1BQU0sYUFBYSxHQUE0QixFQUFFLENBQUM7SUFFbEQsSUFBRyxVQUFVLEVBQUU7UUFFYixNQUFNLFNBQVMsR0FBRyxFQUFDLE1BQU0sRUFBQyxFQUFDLFdBQVcsRUFBQyxJQUFJLGtCQUFRLENBQUMsVUFBVSxDQUFDLEVBQUMsRUFBQyxDQUFDO1FBRWxFLE1BQU0sYUFBYSxHQUFHLEVBQUUsQ0FBQyxVQUFVLENBQUMsYUFBYSxDQUFDLENBQUMsU0FBUyxDQUFDO1lBQzNELGlCQUFpQixDQUFDLENBQUMsQ0FBQyxFQUFDLE1BQU0sa0NBQUss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