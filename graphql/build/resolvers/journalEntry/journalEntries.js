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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __asyncValues = (this && this.__asyncValues) || function (o) {
    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
    var m = o[Symbol.asyncIterator], i;
    return m ? m.call(o) : (o = typeof __values === "function" ? __values(o) : o[Symbol.iterator](), i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i);
    function verb(n) { i[n] = o[n] && function (v) { return new Promise(function (resolve, reject) { v = o[n](v), settle(resolve, reject, v.done, v.value); }); }; }
    function settle(resolve, reject, d, v) { Promise.resolve(v).then(function(v) { resolve({ value: v, done: d }); }, reject); }
};
var __asyncDelegator = (this && this.__asyncDelegator) || function (o) {
    var i, p;
    return i = {}, verb("next"), verb("throw", function (e) { throw e; }), verb("return"), i[Symbol.iterator] = function () { return this; }, i;
    function verb(n, f) { i[n] = o[n] ? function (v) { return (p = !p) ? { value: __await(o[n](v)), done: n === "return" } : f ? f(v) : v; } : f; }
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongodb_1 = require("mongodb");
const utils_1 = require("./utils");
const graphTypes_1 = require("../../graphTypes");
const filter_1 = require("../utils/filterQuery/filter");
const parseOps_1 = require("../utils/filterQuery/querySelectors/parseOps");
const parseComparisonOps_1 = require("../utils/filterQuery/querySelectors/parseComparisonOps");
const dateOpsParser_1 = require("../utils/filterQuery/dateOpsParser");
const iterableFns_1 = require("../../utils/iterableFns");
const gqlMongoRational_1 = require("../utils/filterQuery/gqlMongoRational");
const comparison_1 = require("../utils/filterQuery/operatorMapping/comparison");
const deptNode = new mongodb_1.ObjectId("5dc4addacf96e166daaa008f");
const bizNode = new mongodb_1.ObjectId("5dc476becf96e166daa9fd0b");
const personNode = new mongodb_1.ObjectId("5dc476becf96e166daa9fd0a");
const categoryNode = new mongodb_1.ObjectId("5e288fb9aa938a2bcfcdf9f9");
// Where condition parsing
// Where Department
const getDeptDescendentIds = (id, context) => __awaiter(void 0, void 0, void 0, function* () {
    const descendants = [];
    yield Promise.all([
        ...(yield context.db
            .collection("departments")
            .find({
            parent: {
                $eq: {
                    id,
                    node: deptNode,
                },
            },
        }, { projection: { _id: true } })
            .toArray()).map(({ _id }) => __awaiter(void 0, void 0, void 0, function* () {
            descendants.push(_id, ...(yield getDeptDescendentIds(_id, context)));
        })),
    ]);
    return descendants;
});
const parseWhereJournalEntryDept = function (opValues, context) {
    return __asyncGenerator(this, arguments, function* () {
        for (const [op, opVal] of opValues) {
            switch (op) {
                case "eq":
                case "in":
                    if (opVal) {
                        const $in = [];
                        yield __await(Promise.all((Array.isArray(opVal) ? opVal : [opVal]).map((opVal) => __awaiter(this, void 0, void 0, function* () {
                            const id = new mongodb_1.ObjectId(opVal.id);
                            $in.push(id);
                            if (opVal.matchDescendants) {
                                $in.push(...(yield getDeptDescendentIds(id, context)));
                            }
                        }))));
                        yield yield __await({
                            field: "$and",
                            condition: [
                                {
                                    "department.0.value.id": { $in },
                                },
                            ],
                        });
                    }
                    break;
                case "ne":
                case "nin":
                    if (opVal) {
                        const $nin = [];
                        yield __await(Promise.all((Array.isArray(opVal) ? opVal : [opVal]).map((opVal) => __awaiter(this, void 0, void 0, function* () {
                            const id = new mongodb_1.ObjectId(opVal.id);
                            $nin.push(id);
                            if (opVal.matchDescendants) {
                                $nin.push(...(yield getDeptDescendentIds(id, context)));
                            }
                        }))));
                        yield yield __await({
                            field: "$and",
                            condition: [
                                {
                                    "department.0.value.id": { $nin },
                                },
                            ],
                        });
                    }
                    break;
            }
        }
    });
};
// Where Category
const getCategoryDescendentIds = (id, context) => __awaiter(void 0, void 0, void 0, function* () {
    const descendants = [];
    yield Promise.all([
        ...(yield context.db
            .collection("journalEntryCategories")
            .find({
            parent: {
                $eq: {
                    id,
                    node: categoryNode,
                },
            },
        }, { projection: { _id: true } })
            .toArray()).map(({ _id }) => __awaiter(void 0, void 0, void 0, function* () {
            descendants.push(_id, ...(yield getCategoryDescendentIds(_id, context)));
        })),
    ]);
    return descendants;
});
const parseWhereJournalEntryCategory = function (opValues, context) {
    return __asyncGenerator(this, arguments, function* () {
        for (const [op, opVal] of opValues) {
            switch (op) {
                case "eq":
                case "in":
                    if (opVal) {
                        const $in = [];
                        yield __await(Promise.all((Array.isArray(opVal) ? opVal : [opVal]).map((opVal) => __awaiter(this, void 0, void 0, function* () {
                            const id = new mongodb_1.ObjectId(opVal.id);
                            $in.push(id);
                            if (opVal.matchDescendants) {
                                $in.push(...(yield getCategoryDescendentIds(id, context)));
                            }
                        }))));
                        yield yield __await({
                            field: "$and",
                            condition: [
                                {
                                    "category.0.value.id": { $in },
                                },
                            ],
                        });
                    }
                    break;
                case "ne":
                case "nin":
                    if (opVal) {
                        const $nin = [];
                        yield __await(Promise.all((Array.isArray(opVal) ? opVal : [opVal]).map((opVal) => __awaiter(this, void 0, void 0, function* () {
                            const id = new mongodb_1.ObjectId(opVal.id);
                            $nin.push(id);
                            if (opVal.matchDescendants) {
                                $nin.push(...(yield getCategoryDescendentIds(id, context)));
                            }
                        }))));
                        yield yield __await({
                            field: "$and",
                            condition: [
                                {
                                    "category.0.value.id": { $nin },
                                },
                            ],
                        });
                    }
                    break;
            }
        }
    });
};
// Where Payment Method
const getPayMethodDescendentIds = (id, context) => __awaiter(void 0, void 0, void 0, function* () {
    const descendants = [];
    yield Promise.all([
        ...(yield context.db
            .collection("paymentMethods")
            .find({
            parent: {
                $eq: id,
            },
        }, { projection: { _id: true } })
            .toArray()).map(({ _id }) => __awaiter(void 0, void 0, void 0, function* () {
            descendants.push(_id, ...(yield getPayMethodDescendentIds(_id, context)));
        })),
    ]);
    return descendants;
});
const parseWhereJournalEntryPayMethod = function (opValues, context) {
    return __asyncGenerator(this, arguments, function* () {
        for (const [op, opVal] of opValues) {
            switch (op) {
                case "eq":
                case "in":
                    if (opVal) {
                        const $in = [];
                        yield __await(Promise.all((Array.isArray(opVal) ? opVal : [opVal]).map((opVal) => __awaiter(this, void 0, void 0, function* () {
                            const id = new mongodb_1.ObjectId(opVal.id);
                            $in.push(id);
                            if (opVal.matchDescendants) {
                                $in.push(...(yield getPayMethodDescendentIds(id, context)));
                            }
                        }))));
                        yield yield __await({
                            field: "$and",
                            condition: [
                                {
                                    "paymentMethod.0.value.id": { $in },
                                },
                            ],
                        });
                    }
                    break;
                case "ne":
                case "nin":
                    if (opVal) {
                        const $nin = [];
                        yield __await(Promise.all((Array.isArray(opVal) ? opVal : [opVal]).map((opVal) => __awaiter(this, void 0, void 0, function* () {
                            const id = new mongodb_1.ObjectId(opVal.id);
                            $nin.push(id);
                            if (opVal.matchDescendants) {
                                $nin.push(...(yield getPayMethodDescendentIds(id, context)));
                            }
                        }))));
                        yield yield __await({
                            field: "$and",
                            condition: [
                                {
                                    "paymentMethod.0.value.id": { $nin },
                                },
                            ],
                        });
                    }
                    break;
            }
        }
    });
};
const getJournalEntrySourceNode = (srcType) => {
    switch (srcType) {
        case graphTypes_1.JournalEntrySourceType.Business:
            return bizNode;
        case graphTypes_1.JournalEntrySourceType.Department:
            return deptNode;
        case graphTypes_1.JournalEntrySourceType.Person:
            return personNode;
    }
};
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
                                "source.0.value.node": {
                                    [mongoOp]: getJournalEntrySourceNode(opValue.type),
                                },
                            },
                            {
                                "source.0.value.id": {
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
                                "source.0.value.node": {
                                    [mongoOp]: getJournalEntrySourceNode(opValue.type),
                                },
                            },
                            {
                                "source.0.value.id": {
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
const parseWhereFiscalYear = function (whereFiscalYearIter, context) {
    return __asyncGenerator(this, arguments, function* () {
        const fiscalYears = (yield __await(context.db
            .collection("fiscalYears")
            .find({}, { projection: { _id: true, begin: true, end: true } })
            .toArray())).reduce((fiscalYears, _a) => {
            var { _id } = _a, rest = __rest(_a, ["_id"]);
            fiscalYears.set(_id.toHexString(), rest);
            return fiscalYears;
        }, new Map());
        for (const [op, opValue] of whereFiscalYearIter) {
            switch (op) {
                case "eq":
                    if (opValue) {
                        const { begin, end } = fiscalYears.get(opValue);
                        yield yield __await({
                            field: "$and",
                            condition: [
                                {
                                    "date.0.value": {
                                        $gte: begin,
                                        $lt: end,
                                    },
                                },
                            ],
                        });
                    }
                    break;
                case "ne":
                    if (opValue) {
                        const { begin, end } = fiscalYears.get(opValue);
                        yield yield __await({
                            field: "$and",
                            condition: [
                                {
                                    "date.0.value": {
                                        $not: {
                                            $gte: begin,
                                            $lt: end,
                                        },
                                    },
                                },
                            ],
                        });
                    }
                    break;
                case "in":
                    if (opValue) {
                        const condition = opValue.map((opValue) => {
                            const { begin, end } = fiscalYears.get(opValue);
                            return {
                                "date.0.value": {
                                    $gte: begin,
                                    $lt: end,
                                },
                            };
                        });
                        yield yield __await({
                            field: "$or",
                            condition,
                        });
                    }
                    break;
                case "nin":
                    if (opValue) {
                        const condition = opValue.map((opValue) => {
                            const { begin, end } = fiscalYears.get(opValue);
                            return {
                                "date.0.value": {
                                    $not: {
                                        $gte: begin,
                                        $lt: end,
                                    },
                                },
                            };
                        });
                        yield yield __await({
                            field: "$and",
                            condition,
                        });
                    }
                    break;
            }
        }
    });
};
const parseWhereJournalEntryId = [
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
const NULLISH = Symbol();
const fieldAndConditionGen = function (keyValueIterator, opts) {
    return __asyncGenerator(this, arguments, function* () {
        var e_1, _a;
        const [asyncIterator, asyncReturn] = iterableFns_1.resolveWithAsyncReturn(parseOps_1.default(true, keyValueIterator, parseWhereJournalEntryId, opts));
        try {
            for (var asyncIterator_1 = __asyncValues(asyncIterator), asyncIterator_1_1; asyncIterator_1_1 = yield __await(asyncIterator_1.next()), !asyncIterator_1_1.done;) {
                const [key, value] = asyncIterator_1_1.value;
                switch (key) {
                    case "deleted":
                        if (((value !== null && value !== void 0 ? value : NULLISH)) !== NULLISH) {
                            yield yield __await({
                                field: "deleted.0.value",
                                condition: { $eq: value },
                            });
                        }
                        break;
                    case "department":
                        if (value) {
                            yield __await(yield* __asyncDelegator(__asyncValues(parseWhereJournalEntryDept(iterableFns_1.iterateOwnKeyValues(value), opts))));
                        }
                        break;
                    case "category":
                        if (value) {
                            yield __await(yield* __asyncDelegator(__asyncValues(parseWhereJournalEntryCategory(iterableFns_1.iterateOwnKeyValues(value), opts))));
                        }
                        break;
                    case "paymentMethod":
                        if (value) {
                            yield __await(yield* __asyncDelegator(__asyncValues(parseWhereJournalEntryPayMethod(iterableFns_1.iterateOwnKeyValues(value), opts))));
                        }
                        break;
                    case "total":
                        if (value) {
                            const fieldCond = gqlMongoRational_1.default(value, [
                                "total.value",
                                0,
                            ]);
                            if (fieldCond) {
                                yield yield __await(fieldCond);
                            }
                        }
                        break;
                    case "source":
                        if (value) {
                            yield __await(yield* __asyncDelegator(__asyncValues(parseWhereParentDept(iterableFns_1.iterateOwnKeyValues(value)))));
                        }
                        break;
                    case "date":
                        if (value) {
                            const field = "date.0.value";
                            const condition = yield __await(parseOps_1.default(false, iterableFns_1.iterateOwnKeyValues(value), dateOpsParser_1.default));
                            yield yield __await({
                                field,
                                condition,
                            });
                        }
                        break;
                    case "fiscalYear":
                        if (value) {
                            yield __await(yield* __asyncDelegator(__asyncValues(parseWhereFiscalYear(iterableFns_1.iterateOwnKeyValues(value), opts))));
                        }
                        break;
                    case "lastUpdate":
                        if (value) {
                            const condition = yield __await(parseOps_1.default(false, iterableFns_1.iterateOwnKeyValues(value), dateOpsParser_1.default));
                            yield yield __await({
                                field: "lastUpdate",
                                condition,
                            });
                        }
                        break;
                    case "lastUpdateRefund":
                        if (value) {
                            const condition = yield __await(parseOps_1.default(false, iterableFns_1.iterateOwnKeyValues(value), dateOpsParser_1.default));
                            yield yield __await({
                                field: "refunds.lastUpdate",
                                condition,
                            });
                        }
                        break;
                    case "lastUpdateItem":
                        if (value) {
                            const condition = yield __await(parseOps_1.default(false, iterableFns_1.iterateOwnKeyValues(value), dateOpsParser_1.default));
                            yield yield __await({
                                field: "items.lastUpdate",
                                condition,
                            });
                        }
                        break;
                    case "reconciled":
                        if (((value !== null && value !== void 0 ? value : NULLISH)) !== NULLISH) {
                            yield yield __await({
                                field: "reconciled.0.value",
                                condition: { $eq: value },
                            });
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
const journalEntries = (parent, args, context, info) => __awaiter(void 0, void 0, void 0, function* () {
    const pipeline = [];
    yield Promise.all([
        (() => __awaiter(void 0, void 0, void 0, function* () {
            if (!args.where) {
                return;
            }
            const $match = yield filter_1.default(args.where, fieldAndConditionGen, context);
            pipeline.push({ $match });
        }))(),
    ]);
    pipeline.push(utils_1.stages.entryAddFields, utils_1.stages.entryTransmutations);
    const results = yield context.db
        .collection("journalEntries")
        .aggregate(pipeline)
        .toArray();
    return results;
});
exports.default = journalEntries;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiam91cm5hbEVudHJpZXMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvcmVzb2x2ZXJzL2pvdXJuYWxFbnRyeS9qb3VybmFsRW50cmllcy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBQUEscUNBQW1DO0FBRW5DLG1DQUFpQztBQUNqQyxpREFVMEI7QUFHMUIsd0RBR3FDO0FBQ3JDLDJFQUFvRTtBQUNwRSwrRkFBd0Y7QUFFeEYsc0VBQStEO0FBQy9ELHlEQUdpQztBQUNqQyw0RUFBcUU7QUFDckUsZ0ZBQXNGO0FBR3RGLE1BQU0sUUFBUSxHQUFHLElBQUksa0JBQVEsQ0FBQywwQkFBMEIsQ0FBQyxDQUFDO0FBQzFELE1BQU0sT0FBTyxHQUFHLElBQUksa0JBQVEsQ0FBQywwQkFBMEIsQ0FBQyxDQUFDO0FBQ3pELE1BQU0sVUFBVSxHQUFHLElBQUksa0JBQVEsQ0FBQywwQkFBMEIsQ0FBQyxDQUFDO0FBQzVELE1BQU0sWUFBWSxHQUFHLElBQUksa0JBQVEsQ0FBQywwQkFBMEIsQ0FBQyxDQUFDO0FBRTlELDBCQUEwQjtBQUMxQixtQkFBbUI7QUFDbkIsTUFBTSxvQkFBb0IsR0FBRyxDQUMzQixFQUFZLEVBQ1osT0FBZ0IsRUFDSyxFQUFFO0lBQ3ZCLE1BQU0sV0FBVyxHQUFlLEVBQUUsQ0FBQztJQUVuQyxNQUFNLE9BQU8sQ0FBQyxHQUFHLENBQUM7UUFDaEIsR0FBRyxDQUNELE1BQU0sT0FBTyxDQUFDLEVBQUU7YUFDYixVQUFVLENBQUMsYUFBYSxDQUFDO2FBQ3pCLElBQUksQ0FDSDtZQUNFLE1BQU0sRUFBRTtnQkFDTixHQUFHLEVBQUU7b0JBQ0gsRUFBRTtvQkFDRixJQUFJLEVBQUUsUUFBUTtpQkFDZjthQUNGO1NBQ0YsRUFDRCxFQUFFLFVBQVUsRUFBRSxFQUFFLEdBQUcsRUFBRSxJQUFJLEVBQUUsRUFBRSxDQUM5QjthQUNBLE9B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