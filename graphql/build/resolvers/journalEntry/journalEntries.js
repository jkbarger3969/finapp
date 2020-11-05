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
const DocHistory_1 = require("../utils/DocHistory");
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
                            field: "$expr",
                            condition: {
                                $let: {
                                    vars: {
                                        fiscalYearDate: {
                                            $cond: {
                                                if: {
                                                    $and: [
                                                        {
                                                            $eq: [
                                                                DocHistory_1.default.getPresentValueExpression("dateOfRecord.overrideFiscalYear"),
                                                                true,
                                                            ],
                                                        },
                                                    ],
                                                },
                                                then: DocHistory_1.default.getPresentValueExpression("dateOfRecord.date"),
                                                else: DocHistory_1.default.getPresentValueExpression("date"),
                                            },
                                        },
                                    },
                                    in: {
                                        $and: [
                                            { $gte: ["$$fiscalYearDate", begin] },
                                            { $lt: ["$$fiscalYearDate", end] },
                                        ],
                                    },
                                },
                            },
                        });
                    }
                    break;
                case "ne":
                    if (opValue) {
                        const { begin, end } = fiscalYears.get(opValue);
                        yield yield __await({
                            field: "$expr",
                            condition: {
                                $let: {
                                    vars: {
                                        fiscalYearDate: {
                                            $cond: {
                                                if: {
                                                    $and: [
                                                        {
                                                            $eq: [
                                                                DocHistory_1.default.getPresentValueExpression("dateOfRecord.deleted"),
                                                                false,
                                                            ],
                                                        },
                                                        {
                                                            $eq: [
                                                                DocHistory_1.default.getPresentValueExpression("dateOfRecord.overrideFiscalYear"),
                                                                true,
                                                            ],
                                                        },
                                                    ],
                                                },
                                                then: DocHistory_1.default.getPresentValueExpression("dateOfRecord.date"),
                                                else: DocHistory_1.default.getPresentValueExpression("date"),
                                            },
                                        },
                                    },
                                    in: {
                                        $not: {
                                            $and: [
                                                { $gte: ["$$fiscalYearDate", begin] },
                                                { $lt: ["$$fiscalYearDate", end] },
                                            ],
                                        },
                                    },
                                },
                            },
                        });
                    }
                    break;
                case "in":
                    if (opValue) {
                        yield yield __await({
                            field: "$expr",
                            condition: {
                                $let: {
                                    vars: {
                                        fiscalYearDate: {
                                            $cond: {
                                                if: {
                                                    $and: [
                                                        {
                                                            $eq: [
                                                                DocHistory_1.default.getPresentValueExpression("dateOfRecord.deleted"),
                                                                false,
                                                            ],
                                                        },
                                                        {
                                                            $eq: [
                                                                DocHistory_1.default.getPresentValueExpression("dateOfRecord.overrideFiscalYear"),
                                                                true,
                                                            ],
                                                        },
                                                    ],
                                                },
                                                then: DocHistory_1.default.getPresentValueExpression("dateOfRecord.date"),
                                                else: DocHistory_1.default.getPresentValueExpression("date"),
                                            },
                                        },
                                    },
                                    in: {
                                        $or: opValue.map((opValue) => {
                                            const { begin, end } = fiscalYears.get(opValue);
                                            return {
                                                $and: [
                                                    { $gte: ["$$fiscalYearDate", begin] },
                                                    { $lt: ["$$fiscalYearDate", end] },
                                                ],
                                            };
                                        }),
                                    },
                                },
                            },
                        });
                    }
                    break;
                case "nin":
                    if (opValue) {
                        yield yield __await({
                            field: "$expr",
                            condition: {
                                $let: {
                                    vars: {
                                        fiscalYearDate: {
                                            $cond: {
                                                if: {
                                                    $and: [
                                                        {
                                                            $eq: [
                                                                DocHistory_1.default.getPresentValueExpression("dateOfRecord.deleted"),
                                                                false,
                                                            ],
                                                        },
                                                        {
                                                            $eq: [
                                                                DocHistory_1.default.getPresentValueExpression("dateOfRecord.overrideFiscalYear"),
                                                                true,
                                                            ],
                                                        },
                                                    ],
                                                },
                                                then: DocHistory_1.default.getPresentValueExpression("dateOfRecord.date"),
                                                else: DocHistory_1.default.getPresentValueExpression("date"),
                                            },
                                        },
                                    },
                                    in: {
                                        $not: {
                                            $or: opValue.map((opValue) => {
                                                const { begin, end } = fiscalYears.get(opValue);
                                                return {
                                                    $and: [
                                                        { $gte: ["$$fiscalYearDate", begin] },
                                                        { $lt: ["$$fiscalYearDate", end] },
                                                    ],
                                                };
                                            }),
                                        },
                                    },
                                },
                            },
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
                        if ((value !== null && value !== void 0 ? value : NULLISH) !== NULLISH) {
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
                        if ((value !== null && value !== void 0 ? value : NULLISH) !== NULLISH) {
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiam91cm5hbEVudHJpZXMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvcmVzb2x2ZXJzL2pvdXJuYWxFbnRyeS9qb3VybmFsRW50cmllcy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBQUEscUNBQW1DO0FBRW5DLG1DQUFpQztBQUNqQyxpREFVMEI7QUFHMUIsd0RBR3FDO0FBQ3JDLDJFQUFvRTtBQUNwRSwrRkFBd0Y7QUFFeEYsc0VBQStEO0FBQy9ELHlEQUdpQztBQUNqQyw0RUFBcUU7QUFDckUsZ0ZBQXNGO0FBRXRGLG9EQUE2QztBQUU3QyxNQUFNLFFBQVEsR0FBRyxJQUFJLGtCQUFRLENBQUMsMEJBQTBCLENBQUMsQ0FBQztBQUMxRCxNQUFNLE9BQU8sR0FBRyxJQUFJLGtCQUFRLENBQUMsMEJBQTBCLENBQUMsQ0FBQztBQUN6RCxNQUFNLFVBQVUsR0FBRyxJQUFJLGtCQUFRLENBQUMsMEJBQTBCLENBQUMsQ0FBQztBQUM1RCxNQUFNLFlBQVksR0FBRyxJQUFJLGtCQUFRLENBQUMsMEJBQTBCLENBQUMsQ0FBQztBQUU5RCwwQkFBMEI7QUFDMUIsbUJBQW1CO0FBQ25CLE1BQU0sb0JBQW9CLEdBQUcsQ0FDM0IsRUFBWSxFQUNaLE9BQWdCLEVBQ0ssRUFBRTtJQUN2QixNQUFNLFdBQVcsR0FBZSxFQUFFLENBQUM7SUFFbkMsTUFBTSxPQUFPLENBQUMsR0FBRyxDQUFDO1FBQ2hCLEdBQUcsQ0FDRCxNQUFNLE9BQU8sQ0FBQyxFQUFFO2FBQ2IsVUFBVSxDQUFDLGFBQWEsQ0FBQzthQUN6QixJQUFJLENBQ0g7WUFDRSxNQUFNLEVBQUU7Z0JBQ04sR0FBRyxFQUFFO29CQUNILEVBQUU7b0JBQ0YsSUFBSSxFQUFFLFFBQVE7aUJBQ2Y7YUFDRjtTQUNGLEVBQ0QsRUFBRSxVQUFVLEVBQUUsRUFBRSxHQUFHLEVBQUUsSUFBSSxFQUFFLEVBQUUs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