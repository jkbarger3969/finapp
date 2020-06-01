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
var __asyncValues = (this && this.__asyncValues) || function (o) {
    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
    var m = o[Symbol.asyncIterator], i;
    return m ? m.call(o) : (o = typeof __values === "function" ? __values(o) : o[Symbol.iterator](), i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i);
    function verb(n) { i[n] = o[n] && function (v) { return new Promise(function (resolve, reject) { v = o[n](v), settle(resolve, reject, v.done, v.value); }); }; }
    function settle(resolve, reject, d, v) { Promise.resolve(v).then(function(v) { resolve({ value: v, done: d }); }, reject); }
};
var __await = (this && this.__await) || function (v) { return this instanceof __await ? (this.v = v, this) : new __await(v); }
var __asyncGenerator = (this && this.__asyncGenerator) || function (thisArg, _arguments, generator) {
    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
    var g = generator.apply(thisArg, _arguments || []), i, q = [];
    return i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i;
    function verb(n) { if (g[n]) i[n] = function (v) { return new Promise(function (a, b) { q.push([n, v, a, b]) > 1 || resume(n, v); }); }; }
    function resume(n, v) { try { step(g[n](v)); } catch (e) { settle(q[0][3], e); } }
    function step(r) { r.value instanceof __await ? Promise.resolve(r.value.v).then(fulfill, reject) : settle(q[0][2], r); }
    function fulfill(value) { resume("next", value); }
    function reject(value) { resume("throw", value); }
    function settle(f, v) { if (f(v), q.shift(), q.length) resume(q[0][0], q[0][1]); }
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongodb_1 = require("mongodb");
const utils_1 = require("./utils");
const filter_1 = require("../utils/filterQuery/filter");
const parseOps_1 = require("../utils/filterQuery/querySelectors/parseOps");
const parseComparisonOps_1 = require("../utils/filterQuery/querySelectors/parseComparisonOps");
const iterableFns_1 = require("../../utils/iterableFns");
// Where condition parsing
const dateOpParsers = [
    parseComparisonOps_1.default((dateStr) => Array.isArray(dateStr)
        ? dateStr.map((dateStr) => new Date(dateStr))
        : new Date(dateStr)),
];
const idOpParsers = [
    parseComparisonOps_1.default((id) => Array.isArray(id) ? id.map((id) => new mongodb_1.ObjectID(id)) : new mongodb_1.ObjectID(id)),
];
// Returns an array of all passed dept ids and their children.
const getDeptDecedentIds = (db, deptIds, decedentsMap) => __awaiter(void 0, void 0, void 0, function* () {
    const returnIds = new Set();
    for (const deptId of deptIds) {
        // AddSelf
        returnIds.add(deptId);
        if (!decedentsMap.has(deptId)) {
            const decedentIds = getDeptDecedentIds(db, (yield db
                .collection("departments")
                .aggregate([
                { $match: { "parent.id": new mongodb_1.ObjectID(deptId) } },
                {
                    $project: {
                        childId: "$_id",
                    },
                },
            ])
                .toArray()).map(({ childId }) => childId.toHexString()), decedentsMap);
            decedentsMap.set(deptId, decedentIds);
        }
        for (const decedentId of yield decedentsMap.get(deptId)) {
            returnIds.add(decedentId);
        }
    }
    return Array.from(returnIds.values());
});
const parseMatchDeptDecedents = function (opValues, querySelector, context) {
    return __asyncGenerator(this, arguments, function* () {
        var e_1, _a;
        // Used by "getDeptDecedentIds" to avoid duplicate decedent tree lookups
        const decedentsMap = new Map();
        // "eq" and "ne" must be converted to "in" and "nin"
        const yieldOpUpdates = new Map();
        try {
            for (var opValues_1 = __asyncValues(opValues), opValues_1_1; opValues_1_1 = yield __await(opValues_1.next()), !opValues_1_1.done;) {
                const [op, opValue] = opValues_1_1.value;
                switch (op) {
                    case "eq":
                    case "in":
                        {
                            const inIds = yieldOpUpdates.get("in") || new Set();
                            for (const id of yield __await(getDeptDecedentIds(context.db, Array.isArray(opValue) ? opValue : [opValue], decedentsMap))) {
                                inIds.add(id);
                            }
                            yieldOpUpdates.set("in", inIds);
                        }
                        break;
                    case "ne":
                    case "nin":
                        {
                            const ninIds = yieldOpUpdates.get("nin") || new Set();
                            for (const id of yield __await(getDeptDecedentIds(context.db, Array.isArray(opValue) ? opValue : [opValue], decedentsMap))) {
                                ninIds.add(id);
                            }
                            yieldOpUpdates.set("nin", ninIds);
                        }
                        break;
                    default:
                        yield yield __await([op, opValue]);
                }
            }
        }
        catch (e_1_1) { e_1 = { error: e_1_1 }; }
        finally {
            try {
                if (opValues_1_1 && !opValues_1_1.done && (_a = opValues_1.return)) yield __await(_a.call(opValues_1));
            }
            finally { if (e_1) throw e_1.error; }
        }
        for (const [op, deptIds] of yieldOpUpdates) {
            yield yield __await([op, Array.from(deptIds)]);
        }
        return yield __await(querySelector);
    });
};
const fieldAndConditionGenerator = function (key, val, opts) {
    return __asyncGenerator(this, arguments, function* () {
        switch (key) {
            case "deleted":
                yield yield __await({
                    field: "deleted.0.value",
                    condition: { $eq: val },
                });
                break;
            case "department": {
                const field = "department.0.value.id";
                const condition = val.matchDecedentTree
                    ? yield __await(parseOps_1.default(false, iterableFns_1.iterateOwnKeyValues(val), [parseMatchDeptDecedents, ...idOpParsers], opts))
                    : yield __await(parseOps_1.default(false, iterableFns_1.iterateOwnKeyValues(val), idOpParsers));
                yield yield __await({
                    field,
                    condition,
                });
                break;
            }
            case "lastUpdate": {
                const condition = yield __await(parseOps_1.default(false, iterableFns_1.iterateOwnKeyValues(val), dateOpParsers));
                yield yield __await({
                    field: "lastUpdate",
                    condition,
                });
                break;
            }
            case "lastUpdateRefund": {
                const condition = yield __await(parseOps_1.default(false, iterableFns_1.iterateOwnKeyValues(val), dateOpParsers));
                yield yield __await({
                    field: "refunds.lastUpdate",
                    condition,
                });
                break;
            }
            case "reconciled": {
                yield yield __await({
                    field: "reconciled.0.value",
                    condition: { $eq: val },
                });
            }
        }
    });
};
const journalEntries = (parent, args, context, info) => __awaiter(void 0, void 0, void 0, function* () {
    const { db } = context;
    const pipeline = [];
    const { where } = args;
    if (where) {
        const $match = yield filter_1.default(where, fieldAndConditionGenerator, context);
        pipeline.push({ $match });
    }
    pipeline.push(utils_1.stages.entryAddFields, utils_1.stages.entryTransmutations);
    const results = yield db
        .collection("journalEntries")
        .aggregate(pipeline)
        .toArray();
    return results;
});
exports.default = journalEntries;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiam91cm5hbEVudHJpZXMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvcmVzb2x2ZXJzL2pvdXJuYWxFbnRyeS9qb3VybmFsRW50cmllcy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFBQSxxQ0FBdUM7QUFFdkMsbUNBQWlDO0FBU2pDLHdEQUVxQztBQUNyQywyRUFBb0U7QUFDcEUsK0ZBQXdGO0FBRXhGLHlEQUE4RDtBQUU5RCwwQkFBMEI7QUFDMUIsTUFBTSxhQUFhLEdBQTBCO0lBQzNDLDRCQUFrQixDQUFDLENBQUMsT0FBMEIsRUFBRSxFQUFFLENBQ2hELEtBQUssQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDO1FBQ3BCLENBQUMsQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLENBQUMsT0FBTyxFQUFFLEVBQUUsQ0FBQyxJQUFJLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQztRQUM3QyxDQUFDLENBQUMsSUFBSSxJQUFJLENBQUMsT0FBTyxDQUFDLENBQ3RCO0NBQ08sQ0FBQztBQUVYLE1BQU0sV0FBVyxHQUEwQjtJQUN6Qyw0QkFBa0IsQ0FBQyxDQUFDLEVBQXFCLEVBQUUsRUFBRSxDQUMzQyxLQUFLLENBQUMsT0FBTyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRSxFQUFFLEVBQUUsQ0FBQyxJQUFJLGtCQUFRLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxrQkFBUSxDQUFDLEVBQUUsQ0FBQyxDQUN4RTtDQUNPLENBQUM7QUFFWCw4REFBOEQ7QUFDOUQsTUFBTSxrQkFBa0IsR0FBRyxDQUN6QixFQUFNLEVBQ04sT0FBaUIsRUFDakIsWUFBNEMsRUFDekIsRUFBRTtJQUNyQixNQUFNLFNBQVMsR0FBRyxJQUFJLEdBQUcsRUFBVSxDQUFDO0lBRXBDLEtBQUssTUFBTSxNQUFNLElB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