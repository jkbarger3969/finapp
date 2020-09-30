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
var __asyncDelegator = (this && this.__asyncDelegator) || function (o) {
    var i, p;
    return i = {}, verb("next"), verb("throw", function (e) { throw e; }), verb("return"), i[Symbol.iterator] = function () { return this; }, i;
    function verb(n, f) { i[n] = o[n] ? function (v) { return (p = !p) ? { value: __await(o[n](v)), done: n === "return" } : f ? f(v) : v; } : f; }
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongodb_1 = require("mongodb");
const graphTypes_1 = require("../../graphTypes");
const filter_1 = require("../utils/filterQuery/filter");
const parseOps_1 = require("../utils/filterQuery/querySelectors/parseOps");
const parseComparisonOps_1 = require("../utils/filterQuery/querySelectors/parseComparisonOps");
const iterableFns_1 = require("../../utils/iterableFns");
const mongoUtils_1 = require("../utils/mongoUtils");
const gqlMongoRegex_1 = require("../utils/filterQuery/gqlMongoRegex");
const comparison_1 = require("../utils/filterQuery/operatorMapping/comparison");
const deptNode = new mongodb_1.ObjectId("5dc4addacf96e166daaa008f");
const bizNode = new mongodb_1.ObjectId("5dc476becf96e166daa9fd0b");
const parseWhereParentDept = function* (whereBudgetOwnerIter) {
    for (const [op, opValue] of whereBudgetOwnerIter) {
        switch (op) {
            case "eq":
                if (opValue) {
                    const mongoOp = comparison_1.comparisonOpsMapper(op);
                    yield {
                        field: "$and",
                        condition: [
                            {
                                "parent.node": {
                                    [mongoOp]: opValue.type ===
                                        graphTypes_1.DepartmentAncestorType.Business
                                        ? bizNode
                                        : deptNode,
                                },
                            },
                            {
                                "parent.id": {
                                    [mongoOp]: new mongodb_1.ObjectId(opValue.id),
                                },
                            },
                        ],
                    };
                }
                break;
            case "ne":
                if (opValue) {
                    const mongoOp = comparison_1.comparisonOpsMapper(op);
                    yield {
                        field: "$or",
                        condition: [
                            {
                                "parent.node": {
                                    [mongoOp]: opValue.type ===
                                        graphTypes_1.DepartmentAncestorType.Business
                                        ? bizNode
                                        : deptNode,
                                },
                            },
                            {
                                "parent.id": {
                                    [mongoOp]: new mongodb_1.ObjectId(opValue.id),
                                },
                            },
                        ],
                    };
                }
                break;
            case "in":
                if (opValue) {
                    const orArr = [];
                    for (const { field, condition } of parseWhereParentDept((function* () {
                        for (const opV of opValue) {
                            yield ["eq", opV];
                        }
                    })())) {
                        orArr.push({ [field]: condition });
                    }
                    yield { field: "$or", condition: orArr };
                }
                break;
            case "nin":
                if (opValue) {
                    const andArr = [];
                    for (const { field, condition } of parseWhereParentDept((function* () {
                        for (const opV of opValue) {
                            yield ["ne", opV];
                        }
                    })())) {
                        andArr.push({ [field]: condition });
                    }
                    yield { field: "$and", condition: andArr };
                }
                break;
        }
    }
};
const parseWhereDeptId = [
    // Convert "eq" and "ne" to ObjectId and "in" and "nin" to ObjectId[]
    function (opValues, querySelector) {
        return __asyncGenerator(this, arguments, function* () {
            var e_1, _a;
            try {
                for (var opValues_1 = __asyncValues(opValues), opValues_1_1; opValues_1_1 = yield __await(opValues_1.next()), !opValues_1_1.done;) {
                    const [op, opVal] = opValues_1_1.value;
                    switch (op) {
                        case "eq":
                        case "ne":
                            if (opVal) {
                                yield yield __await([op, new mongodb_1.ObjectId(opVal)]);
                            }
                            break;
                        case "in":
                        case "nin":
                            if (opVal) {
                                yield yield __await([
                                    op,
                                    opVal.map((id) => new mongodb_1.ObjectId(id)),
                                ]);
                            }
                            break;
                        default:
                            yield yield __await([op, opVal]);
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
            return yield __await(querySelector);
        });
    },
    // Parse the comparison ops and add to querySelector
    parseComparisonOps_1.default(),
];
const fieldAndConditionGenerator = function (keyValueIterator, opts) {
    return __asyncGenerator(this, arguments, function* () {
        var e_2, _a;
        const [asyncIterator, asyncReturn] = iterableFns_1.resolveWithAsyncReturn(parseOps_1.default(true, keyValueIterator, parseWhereDeptId, opts));
        try {
            for (var asyncIterator_1 = __asyncValues(asyncIterator), asyncIterator_1_1; asyncIterator_1_1 = yield __await(asyncIterator_1.next()), !asyncIterator_1_1.done;) {
                const [key, value] = asyncIterator_1_1.value;
                switch (key) {
                    case "name":
                        if (value) {
                            yield yield __await({
                                field: "name",
                                condition: gqlMongoRegex_1.default(value),
                            });
                        }
                        break;
                    case "parent":
                        if (value) {
                            yield __await(yield* __asyncDelegator(__asyncValues(parseWhereParentDept(iterableFns_1.iterateOwnKeyValues(value)))));
                        }
                        break;
                }
            }
        }
        catch (e_2_1) { e_2 = { error: e_2_1 }; }
        finally {
            try {
                if (asyncIterator_1_1 && !asyncIterator_1_1.done && (_a = asyncIterator_1.return)) yield __await(_a.call(asyncIterator_1));
            }
            finally { if (e_2) throw e_2.error; }
        }
        const condition = yield __await(asyncReturn);
        // Check that operators have been set on condition.
        if (Object.keys(condition).length > 0) {
            yield yield __await({
                field: "_id",
                condition,
            });
        }
    });
};
const departments = (parent, args, context, info) => __awaiter(void 0, void 0, void 0, function* () {
    const pipeline = [];
    yield Promise.all([
        (() => __awaiter(void 0, void 0, void 0, function* () {
            if (!args.where) {
                return;
            }
            const $match = yield filter_1.default(args.where, fieldAndConditionGenerator, context);
            pipeline.push({ $match });
        }))(),
    ]);
    pipeline.push(mongoUtils_1.addId);
    return context.db.collection("departments").aggregate(pipeline).toArray();
});
exports.default = departments;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGVwYXJ0bWVudHMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvcmVzb2x2ZXJzL2RlcGFydG1lbnQvZGVwYXJ0bWVudHMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFBQSxxQ0FBbUM7QUFFbkMsaURBSzBCO0FBRTFCLHdEQUdxQztBQUNyQywyRUFBb0U7QUFDcEUsK0ZBQXdGO0FBRXhGLHlEQUdpQztBQUNqQyxvREFBNEM7QUFFNUMsc0VBQStEO0FBQy9ELGdGQUFzRjtBQUV0RixNQUFNLFFBQVEsR0FBRyxJQUFJLGtCQUFRLENBQUMsMEJBQTBCLENBQUMsQ0FBQztBQUMxRCxNQUFNLE9BQU8sR0FBRyxJQUFJLGtCQUFRLENBQUMsMEJBQTBCLENBQUMsQ0FBQztBQUV6RCxNQUFNLG9CQUFvQixHQUFHLFFBQVEsQ0FBQyxFQUNwQyxvQkFLQztJQUVELEtBQUssTUFBTSxDQUFDLEVBQUUsRUFBRSxPQUFPLENBQUMsSUFBSSxvQkFBb0IsRUFBRTtRQUNoRCxRQUFRLEVBQUUsRUFBRTtZQUNWLEtBQUssSUFBSTtnQkFDUCxJQUFJLE9BQU8sRUFBRTtvQkFDWCxNQUFNLE9BQU8sR0FBRyxnQ0FBbUIsQ0FBQyxFQUFFLENBQUMsQ0FBQztvQkFDeEMsTUFBTTt3QkFDSixLQUFLLEVBQUUsTUFBTTt3QkFDYixTQUFTLEVBQUU7NEJBQ1Q7Z0NBQ0UsYUFBYSxFQUFFO29DQUNiLENBQUMsT0FBTyxDQUFDLEVBQ04sT0FBK0MsQ0FBQyxJQUFJO3dDQUNyRCxtQ0FBc0IsQ0FBQyxRQUFRO3dDQUM3QixDQUFDLENBQUMsT0FBTzt3Q0FDVCxDQUFDLENBQUMsUUFBUTtpQ0FDZjs2QkFDRjs0QkFDRDtnQ0FDRSxXQUFXLEVBQUU7b0NBQ1gsQ0FBQyxPQUFPLENBQUMsRUFBRSxJQUFJLGtCQUFRLENBQ3BCLE9BQStDLENBQUMsRUFBRSxDQUNwRDtpQ0FDRjs2QkFDRjt5QkFD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