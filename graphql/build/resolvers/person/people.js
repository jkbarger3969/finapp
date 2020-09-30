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
const mongoUtils_1 = require("../utils/mongoUtils");
const filter_1 = require("../utils/filterQuery/filter");
const parseOps_1 = require("../utils/filterQuery/querySelectors/parseOps");
const iterableFns_1 = require("../../utils/iterableFns");
const parseComparisonOps_1 = require("../utils/filterQuery/querySelectors/parseComparisonOps");
const gqlMongoRegex_1 = require("../utils/filterQuery/gqlMongoRegex");
const parseWherePeopleId = [
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
const fieldAndCondGen = function (keyValueIterator, opts) {
    return __asyncGenerator(this, arguments, function* () {
        var e_2, _a;
        const [asyncIterator, asyncReturn] = iterableFns_1.resolveWithAsyncReturn(parseOps_1.default(true, keyValueIterator, parseWherePeopleId, opts));
        try {
            for (var asyncIterator_1 = __asyncValues(asyncIterator), asyncIterator_1_1; asyncIterator_1_1 = yield __await(asyncIterator_1.next()), !asyncIterator_1_1.done;) {
                const [key, value] = asyncIterator_1_1.value;
                switch (key) {
                    case "firstName":
                        if (value) {
                            yield yield __await({
                                field: "name.first",
                                condition: gqlMongoRegex_1.default(value),
                            });
                        }
                        break;
                    case "lastName":
                        if (value) {
                            yield yield __await({
                                field: "name.last",
                                condition: gqlMongoRegex_1.default(value),
                            });
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
const people = (parent, args, context, info) => __awaiter(void 0, void 0, void 0, function* () {
    const pipeline = [];
    yield Promise.all([
        (() => __awaiter(void 0, void 0, void 0, function* () {
            if (!args.where) {
                return;
            }
            const $match = yield filter_1.default(args.where, fieldAndCondGen, context);
            pipeline.push({ $match });
        }))(),
    ]);
    pipeline.push(mongoUtils_1.addId);
    return context.db.collection("people").aggregate(pipeline).toArray();
});
exports.default = people;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicGVvcGxlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL3Jlc29sdmVycy9wZXJzb24vcGVvcGxlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUFBLHFDQUFtQztBQUVuQyxvREFBNEM7QUFDNUMsd0RBRXFDO0FBRXJDLDJFQUFvRTtBQUNwRSx5REFBaUU7QUFFakUsK0ZBQXdGO0FBQ3hGLHNFQUErRDtBQUUvRCxNQUFNLGtCQUFrQixHQUFpQztJQUN2RCxxRUFBcUU7SUFDckUsVUFBaUIsUUFBUSxFQUFFLGFBQWE7Ozs7Z0JBQ3RDLEtBQWdDLElBQUEsYUFBQSxjQUFBLFFBQVEsQ0FBQSxjQUFBO29CQUE3QixNQUFNLENBQUMsRUFBRSxFQUFFLEtBQUssQ0FBQyxxQkFBQSxDQUFBO29CQUMxQixRQUFRLEVBQUUsRUFBRTt3QkFDVixLQUFLLElBQUksQ0FBQzt3QkFDVixLQUFLLElBQUk7NEJBQ1AsSUFBSSxLQUFLLEVBQUU7Z0NBQ1Qsb0JBQU0sQ0FBQyxFQUFFLEVBQUUsSUFBSSxrQkFBUSxDQUFDLEtBQXNDLENBQUMsQ0FBQyxDQUFBLENBQUM7NkJBQ2xFOzRCQUNELE1BQU07d0JBQ1IsS0FBSyxJQUFJLENBQUM7d0JBQ1YsS0FBSyxLQUFLOzRCQUNSLElBQUksS0FBSyxFQUFFO2dDQUNULG9CQUFNO29DQUNKLEVBQUU7b0NBQ0QsS0FBdUMsQ0FBQyxHQUFHLENBQzFDLENBQUMsRUFBRSxFQUFFLEVBQUUsQ0FBQyxJQUFJLGtCQUFRLENBQUMsRUFBRSxDQUFDLENBQ3pCO2lDQUNGLENBQUEsQ0FBQzs2QkFDSDs0QkFDRCxNQUFNO3dCQUNSOzRCQUNFLG9CQUFNLENBQUMsRUFBRSxFQUFFLEtBQUssQ0FBQyxDQUFBLENBQUM7cUJBQ3JCO2lCQUNGOzs7Ozs7Ozs7WUFFRCxxQkFBTyxhQUFhLEVBQUM7UUFDdkIsQ0FBQztLQUFvQjtJQUNyQixvREFBb0Q7SUFDcEQsNEJBQWtCLEVBQVM7Q0FDbkIsQ0FBQztBQUVYLE1BQU0sZUFBZSxHQUdqQixVQUFpQixnQkFBZ0IsRUFBRSxJQUFJOzs7UUFDekMsTUFBTSxDQUFDLGFBQWEsRUFBRSxXQUFXLENBQUMsR0FBRyxvQ0FBc0IsQ0FDekQsa0JBQVEsQ0FBQyxJQUFJLEVBQUUsZ0JBQWdCLEVBQUUsa0JBQWtCLEVBQUUsSUFBSSxDQUFDLENBQzNELENBQUM7O1lBRUYsS0FBaUMsSUFBQSxrQkFBQSxjQUFBLGFBQWEsQ0FBQSxtQkFBQTtnQkFBbkMsTUFBTSxDQUFDLEdBQUcsRUFBRSxLQUFLLENBQUMsMEJBQUEsQ0FBQTtnQkFDM0IsUUFBUSxHQUFHLEVBQUU7b0JBQ1gsS0FBSyxXQUFXO3dCQUNkLElBQUksS0FBSyxFQUFFOzRCQUNULG9CQUFNO2dDQUNKLEtBQUssRUFBRSxZQUFZO2dDQUNuQixTQUFTLEVBQUUsdUJBQWEsQ0FBQyxLQUEwQixDQUFDOzZCQUNyRCxDQUFBLENBQUM7eUJBQ0g7d0JBQ0QsTUFBTTtvQkFDUixLQUFLLFVBQVU7d0JBQ2IsSUFBSSxLQUFLLEVBQUU7NEJBQ1Qsb0JBQU07Z0NBQ0osS0FBSyxFQUFFLFdBQVc7Z0NBQ2xCLFNBQVMsRUFBRSx1QkFBYSxDQUFDLEtBQTBCLENBQUM7NkJBQ3JELENBQUEsQ0FBQzt5QkFDSDt3QkFDRCxNQUFNO2lCQUNUO2FBQ0Y7Ozs7Ozs7OztRQUVELE1BQU0sU0FBUyxHQUFHLGNBQU0sV0FBVyxDQUFBLENBQUM7UUFFcEMsbURBQW1EO1FBQ25ELElBQUksTUFBTSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxFQUFFO1lBQ3JDLG9CQUFNO2dCQUNKLEtBQUssRUFBRSxLQUFLO2dCQUNaLFNBQVM7YUFDVixDQUFBLENBQUM7U0FDSDtJQUNILENBQUM7Q0FBQSxDQUFDO0FBRUYsTUFBTSxNQUFNLEdBQTZCLENBQ3ZDLE1BQU0sRUFDTixJQUFJLEVBQ0osT0FBTyxFQUNQLElBQUksRUFDSixFQUFFO0lBQ0YsTUFBTSxRQUFRLEdBQThCLEVBQUUsQ0FBQztJQUUvQyxNQUFNLE9BQU8sQ0FBQyxHQUFHLENBQUM7UUFDaEIsQ0FBQyxHQUFTLEVBQUU7WUFDVixJQUFJLENBQUMsSUFBSSxDQUFDLEtBQUssRUFBRTtnQkFDZixPQUFPO2FBQ1I7WUFFRCxNQUFNLE1BQU0sR0FBRyxNQUFNLGdCQUFrQixDQUNyQyxJQUFJLENBQUMsS0FBSyxFQUNWLGVBQWUsRUFDZixPQUFPLENBQ1IsQ0FBQztZQUVGLFFBQVEsQ0FBQyxJQUFJLENBQUMsRUFBRSxNQUFNLEVBQUUsQ0FBQyxDQUFDO1FBQzVCLENBQUMsQ0FBQSxDQUFDLEVBQUU7S0FDTCxDQUFDLENBQUM7SUFFSCxRQUFRLENBQUMsSUFBSSxDQUFDLGtCQUFLLENBQUMsQ0FBQztJQUVyQixPQUFPLE9BQU8sQ0FBQyxFQUFFLENBQUMsVUFBVSxDQUFDLFFBQVEsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxRQUFRLENBQUMsQ0FBQyxPQUFPLEVBQUUsQ0FBQztBQUN2RSxDQUFDLENBQUEsQ0FBQztBQUVGLGtCQUFlLE1BQU0sQ0FBQyJ9