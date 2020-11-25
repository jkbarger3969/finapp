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
exports.fieldAndCondGen = void 0;
const mongodb_1 = require("mongodb");
const mongoUtils_1 = require("../utils/mongoUtils");
const utils_1 = require("./utils");
const filter_1 = require("../utils/filterQuery/filter");
const parseComparisonOps_1 = require("../utils/filterQuery/querySelectors/parseComparisonOps");
const iterableFns_1 = require("../../utils/iterableFns");
const parseOps_1 = require("../utils/filterQuery/querySelectors/parseOps");
const gqlMongoRegex_1 = require("../utils/filterQuery/gqlMongoRegex");
const parseWhereFiscalYearHasDate = function* (opValueIter) {
    for (const [op, opValue] of opValueIter) {
        switch (op) {
            case "eq":
                if (opValue) {
                    yield {
                        field: "$and",
                        condition: [
                            {
                                begin: {
                                    $lte: new Date(opValue),
                                },
                                end: {
                                    $gt: new Date(opValue),
                                },
                            },
                        ],
                    };
                }
                break;
            case "ne":
                if (opValue) {
                    yield {
                        field: "$and",
                        condition: [
                            {
                                $not: {
                                    begin: {
                                        $lte: new Date(opValue),
                                    },
                                    end: {
                                        $gt: new Date(opValue),
                                    },
                                },
                            },
                        ],
                    };
                }
                break;
            case "in":
                if (opValue) {
                    const $or = [];
                    for (const { field, condition } of parseWhereFiscalYearHasDate((function* () {
                        for (const opV of opValue) {
                            yield ["eq", opV];
                        }
                    })())) {
                        $or.push({ [field]: condition });
                    }
                    yield {
                        field: "$and",
                        condition: [{ $or }],
                    };
                }
                break;
            case "nin":
                if (opValue) {
                    const $and = [];
                    for (const { field, condition } of parseWhereFiscalYearHasDate((function* () {
                        for (const opV of opValue) {
                            yield ["ne", opV];
                        }
                    })())) {
                        $and.push({ [field]: condition });
                    }
                    yield {
                        field: "$and",
                        condition: $and,
                    };
                }
                break;
        }
    }
};
const parseWhereFiscalYearId = [
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
const fieldAndCondGen = function (keyValueIter, opts) {
    return __asyncGenerator(this, arguments, function* () {
        var e_1, _a;
        const [asyncIterator, asyncReturn] = iterableFns_1.resolveWithAsyncReturn(parseOps_1.default(true, keyValueIter, parseWhereFiscalYearId, opts));
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
                    case "hasDate":
                        if (value) {
                            yield __await(yield* __asyncDelegator(__asyncValues(parseWhereFiscalYearHasDate(iterableFns_1.iterateOwnKeyValues(value)))));
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
exports.fieldAndCondGen = fieldAndCondGen;
const fiscalYears = (parent, args, context, info) => __awaiter(void 0, void 0, void 0, function* () {
    const pipeline = [];
    yield Promise.all([
        (() => __awaiter(void 0, void 0, void 0, function* () {
            if (!args.where) {
                return;
            }
            const $match = yield filter_1.default(args.where, exports.fieldAndCondGen, context);
            pipeline.push({ $match });
        }))(),
    ]);
    pipeline.push(mongoUtils_1.addId, utils_1.transmutationStage);
    return context.db.collection("fiscalYears").aggregate(pipeline).toArray();
});
exports.default = fiscalYears;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZmlzY2FsWWVhcnMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvcmVzb2x2ZXJzL2Zpc2NhbFllYXIvZmlzY2FsWWVhcnMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBQUEscUNBQW1DO0FBT25DLG9EQUE0QztBQUM1QyxtQ0FBNkM7QUFDN0Msd0RBR3FDO0FBR3JDLCtGQUF3RjtBQUN4Rix5REFHaUM7QUFDakMsMkVBQW9FO0FBQ3BFLHNFQUFvRTtBQUdwRSxNQUFNLDJCQUEyQixHQUFHLFFBQVEsQ0FBQyxFQUMzQyxXQUtDO0lBRUQsS0FBSyxNQUFNLENBQUMsRUFBRSxFQUFFLE9BQU8sQ0FBQyxJQUFJLFdBQVcsRUFBRTtRQUN2QyxRQUFRLEVBQUUsRUFBRTtZQUNWLEtBQUssSUFBSTtnQkFDUCxJQUFJLE9BQU8sRUFBRTtvQkFDWCxNQUFNO3dCQUNKLEtBQUssRUFBRSxNQUFNO3dCQUNiLFNBQVMsRUFBRTs0QkFDVDtnQ0FDRSxLQUFLLEVBQUU7b0NBQ0wsSUFBSSxFQUFFLElBQUksSUFBSSxDQUFDLE9BQTRDLENBQUM7aUNBQzdEO2dDQUNELEdBQUcsRUFBRTtvQ0FDSCxHQUFHLEVBQUUsSUFBSSxJQUFJLENBQUMsT0FBNEMsQ0FBQztpQ0FDNUQ7NkJBQ0Y7eUJBQ0Y7cUJBQ0YsQ0FBQztpQkFDSDtnQkFDRCxNQUFNO1lBQ1IsS0FBSyxJQUFJO2dCQUNQLElBQUksT0FBTyxFQUFFO29CQUNYLE1BQU07d0JBQ0osS0FBSyxFQUFFLE1BQU07d0JBQ2IsU0FBUyxFQUFFOzRCQUNUO2dDQUNFLElBQUksRUFBRTtvQ0FDSixLQUFLLEVBQUU7d0NBQ0wsSUFBSSxFQUFFLElBQUksSUFBSSxDQUNaLE9BQTRDLENBQzdDO3FDQUNGO29DQUNELEdBQUcsRUFBRTt3Q0FDSCxHQUFHLEVBQUUsSUFBSSxJQUFJLENBQUMsT0FBNEMsQ0FBQztxQ0FDNUQ7aUNBQ0Y7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