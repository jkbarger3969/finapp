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
exports.fieldAndCondGen = function (keyValueIter, opts) {
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZmlzY2FsWWVhcnMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvcmVzb2x2ZXJzL2Zpc2NhbFllYXIvZmlzY2FsWWVhcnMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFBQSxxQ0FBbUM7QUFPbkMsb0RBQTRDO0FBQzVDLG1DQUE2QztBQUM3Qyx3REFHcUM7QUFHckMsK0ZBQXdGO0FBQ3hGLHlEQUdpQztBQUNqQywyRUFBb0U7QUFDcEUsc0VBQW9FO0FBR3BFLE1BQU0sMkJBQTJCLEdBQUcsUUFBUSxDQUFDLEVBQzNDLFdBS0M7SUFFRCxLQUFLLE1BQU0sQ0FBQyxFQUFFLEVBQUUsT0FBTyxDQUFDLElBQUksV0FBVyxFQUFFO1FBQ3ZDLFFBQVEsRUFBRSxFQUFFO1lBQ1YsS0FBSyxJQUFJO2dCQUNQLElBQUksT0FBTyxFQUFFO29CQUNYLE1BQU07d0JBQ0osS0FBSyxFQUFFLE1BQU07d0JBQ2IsU0FBUyxFQUFFOzRCQUNUO2dDQUNFLEtBQUssRUFBRTtvQ0FDTCxJQUFJLEVBQUUsSUFBSSxJQUFJLENBQUMsT0FBNEMsQ0FBQztpQ0FDN0Q7Z0NBQ0QsR0FBRyxFQUFFO29DQUNILEdBQUcsRUFBRSxJQUFJLElBQUksQ0FBQyxPQUE0QyxDQUFDO2lDQUM1RDs2QkFDRjt5QkFDRjtxQkFDRixDQUFDO2lCQUNIO2dCQUNELE1BQU07WUFDUixLQUFLLElBQUk7Z0JBQ1AsSUFBSSxPQUFPLEVBQUU7b0JBQ1gsTUFBTTt3QkFDSixLQUFLLEVBQUUsTUFBTTt3QkFDYixTQUFTLEVBQUU7NEJBQ1Q7Z0NBQ0UsSUFBSSxFQUFFO29DQUNKLEtBQUssRUFBRTt3Q0FDTCxJQUFJLEVBQUUsSUFBSSxJQUFJLENBQ1osT0FBNEMsQ0FDN0M7cUNBQ0Y7b0NBQ0QsR0FBRyxFQUFFO3dDQUNILEdBQUcsRUFBRSxJQUFJLElBQUksQ0FBQyxPQUE0QyxDQUFDO3FDQUM1RDtpQ0FDRjs2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