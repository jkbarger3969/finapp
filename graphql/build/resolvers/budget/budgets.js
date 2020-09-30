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
var __asyncDelegator = (this && this.__asyncDelegator) || function (o) {
    var i, p;
    return i = {}, verb("next"), verb("throw", function (e) { throw e; }), verb("return"), i[Symbol.iterator] = function () { return this; }, i;
    function verb(n, f) { i[n] = o[n] ? function (v) { return (p = !p) ? { value: __await(o[n](v)), done: n === "return" } : f ? f(v) : v; } : f; }
};
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
const graphTypes_1 = require("../../graphTypes");
const filter_1 = require("../utils/filterQuery/filter");
const parseOps_1 = require("../utils/filterQuery/querySelectors/parseOps");
const parseComparisonOps_1 = require("../utils/filterQuery/querySelectors/parseComparisonOps");
const gqlMongoRational_1 = require("../utils/filterQuery/gqlMongoRational");
const iterableFns_1 = require("../../utils/iterableFns");
const mongoUtils_1 = require("../utils/mongoUtils");
const comparison_1 = require("../utils/filterQuery/operatorMapping/comparison");
const fiscalYears_1 = require("../fiscalYear/fiscalYears");
const deptNode = new mongodb_1.ObjectId("5dc4addacf96e166daaa008f");
const bizNode = new mongodb_1.ObjectId("5dc476becf96e166daa9fd0b");
const parseWhereFiscalYear = (whereFiscalYear, context) => __awaiter(void 0, void 0, void 0, function* () {
    const $match = yield filter_1.default(whereFiscalYear, fiscalYears_1.fieldAndCondGen, context);
    const fiscalYearIds = (yield context.db
        .collection("fiscalYears")
        .aggregate([{ $match }, { $project: { _id: true } }])
        .toArray()).map(({ _id }) => _id);
    return {
        field: "fiscalYear",
        condition: { $in: fiscalYearIds },
    };
});
const parseWhereBudgetOwner = function* (whereBudgetOwnerIter) {
    for (const [op, opValue] of whereBudgetOwnerIter) {
        switch (op) {
            case "eq":
                if (opValue) {
                    const mongoOp = comparison_1.comparisonOpsMapper(op);
                    yield {
                        field: "$and",
                        condition: [
                            {
                                "owner.node": {
                                    [mongoOp]: opValue.type ===
                                        graphTypes_1.BudgetOwnerType.Business
                                        ? bizNode
                                        : deptNode,
                                },
                            },
                            {
                                "owner.id": {
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
                                "owner.node": {
                                    [mongoOp]: opValue.type ===
                                        graphTypes_1.BudgetOwnerType.Business
                                        ? bizNode
                                        : deptNode,
                                },
                            },
                            {
                                "owner.id": {
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
                    for (const { field, condition } of parseWhereBudgetOwner((function* () {
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
                    for (const { field, condition } of parseWhereBudgetOwner((function* () {
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
const parseWhereBudgetId = [
    parseComparisonOps_1.default((opVal, op) => {
        switch (op) {
            case "eq":
            case "ne":
                return new mongodb_1.ObjectId(opVal);
            case "in":
            case "nin":
                return opVal.map((id) => new mongodb_1.ObjectId(id));
            default:
                return opVal;
        }
    }),
];
const parseWhereDepartment = (deptId, context) => __awaiter(void 0, void 0, void 0, function* () {
    const fiscalYears = (yield context.db
        .collection("fiscalYears")
        .find({}, { projection: { _id: true } })
        .toArray()).reduce((fiscalYears, { _id }) => fiscalYears.add(_id.toHexString()), new Set());
    const deptBudgets = [];
    let node = deptNode;
    let id = new mongodb_1.ObjectId(deptId);
    while (fiscalYears.size > 0 && node.equals(deptNode)) {
        yield context.db
            .collection("budgets")
            .find({
            $and: [
                { "owner.node": { $eq: node } },
                { "owner.id": { $eq: id } },
                {
                    fiscalYear: {
                        $in: Array.from(fiscalYears).map((id) => new mongodb_1.ObjectId(id)),
                    },
                },
            ],
        }, { projection: { _id: true, fiscalYear: true } })
            .forEach(({ _id, fiscalYear }) => {
            fiscalYears.delete(fiscalYear.toHexString());
            deptBudgets.push(_id);
        });
        const result = (yield context.db
            .collection("departments")
            .find({ _id: id }, { projection: { parent: true } })
            .toArray())[0];
        if (!result) {
            break;
        }
        ({
            parent: { id, node },
        } = result);
    }
    return {
        field: "$and",
        condition: [{ _id: { $in: deptBudgets } }],
    };
});
const fieldConditionGenerator = function (keyValueIterator, opts) {
    return __asyncGenerator(this, arguments, function* () {
        var e_1, _a;
        const [asyncIterator, asyncReturn] = iterableFns_1.resolveWithAsyncReturn(parseOps_1.default(true, keyValueIterator, parseWhereBudgetId, opts));
        try {
            for (var asyncIterator_1 = __asyncValues(asyncIterator), asyncIterator_1_1; asyncIterator_1_1 = yield __await(asyncIterator_1.next()), !asyncIterator_1_1.done;) {
                const [key, value] = asyncIterator_1_1.value;
                switch (key) {
                    case "amount":
                        if (value) {
                            const fieldCond = gqlMongoRational_1.default(value, "amount");
                            if (fieldCond) {
                                yield yield __await(fieldCond);
                            }
                        }
                        break;
                    case "owner":
                        if (value) {
                            yield __await(yield* __asyncDelegator(__asyncValues(parseWhereBudgetOwner(iterableFns_1.iterateOwnKeyValues(value)))));
                        }
                        break;
                    case "fiscalYear":
                        if (value) {
                            yield yield __await(parseWhereFiscalYear(value, opts));
                        }
                        break;
                    case "department":
                        if (value) {
                            const result = yield __await(parseWhereDepartment(value, opts));
                            yield yield __await(result);
                        }
                        break;
                }
            }
        }
        catch (e_1_1) { e_1 = { error: e_1_1 }; }
        finally {
            try {
                if (asyncIterator_1_1 && !asyncIterator_1_1.done && (_a = asyncIterator_1.return)) yield __await(_a.call(asyncIterator_1));
            }
            finally { if (e_1) throw e_1.error; }
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
const budgets = (parent, args, context, info) => __awaiter(void 0, void 0, void 0, function* () {
    const pipeline = [];
    yield Promise.all([
        (() => __awaiter(void 0, void 0, void 0, function* () {
            if (!args.where) {
                return;
            }
            const $match = yield filter_1.default(args.where, fieldConditionGenerator, context);
            pipeline.push({ $match });
        }))(),
    ]);
    pipeline.push(mongoUtils_1.addId);
    return context.db.collection("budgets").aggregate(pipeline).toArray();
});
exports.default = budgets;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYnVkZ2V0cy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9yZXNvbHZlcnMvYnVkZ2V0L2J1ZGdldHMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFBQSxxQ0FBbUM7QUFFbkMsaURBTTBCO0FBRTFCLHdEQUdxQztBQUNyQywyRUFBb0U7QUFDcEUsK0ZBQXdGO0FBRXhGLDRFQUFxRTtBQUNyRSx5REFHaUM7QUFDakMsb0RBQTRDO0FBRTVDLGdGQUFzRjtBQUN0RiwyREFBeUY7QUFHekYsTUFBTSxRQUFRLEdBQUcsSUFBSSxrQkFBUSxDQUFDLDBCQUEwQixDQUFDLENBQUM7QUFDMUQsTUFBTSxPQUFPLEdBQUcsSUFBSSxrQkFBUSxDQUFDLDBCQUEwQixDQUFDLENBQUM7QUFFekQsTUFBTSxvQkFBb0IsR0FBRyxDQUMzQixlQUFxQyxFQUNyQyxPQUFnQixFQUNZLEVBQUU7SUFDOUIsTUFBTSxNQUFNLEdBQUcsTUFBTSxnQkFBa0IsQ0FDckMsZUFBZSxFQUNmLDZCQUF5QixFQUN6QixPQUFPLENBQ1IsQ0FBQztJQUVGLE1BQU0sYUFBYSxHQUFlLENBQ2hDLE1BQU0sT0FBTyxDQUFDLEVBQUU7U0FDYixVQUFVLENBQUMsYUFBYSxDQUFDO1NBQ3pCLFNBQVMsQ0FBb0IsQ0FBQyxFQUFFLE1BQU0sRUFBRSxFQUFFLEVBQUUsUUFBUSxFQUFFLEVBQUUsR0FBRyxFQUFFLElBQUksRUFBRSxFQUFFLENBQUMsQ0FBQztTQUN2RSxPQUFPLEVBQUUsQ0FDYixDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQUUsR0FBRyxFQUFFLEVBQUUsRUFBRSxDQUFDLEdBQUcsQ0FBQyxDQUFDO0lBRXhCLE9BQU87UUFDTCxLQUFLLEVBQUUsWUFBWTtRQUNuQixTQUFTLEVBQUUsRUFBRSxHQUFHLEVBQUUsYUFBYSxFQUFFO0tBQ2xDLENBQUM7QUFDSixDQUFDLENBQUEsQ0FBQztBQUlGLE1BQU0s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