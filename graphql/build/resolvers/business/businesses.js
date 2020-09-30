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
const gqlMongoRegex_1 = require("../utils/filterQuery/gqlMongoRegex");
const iterableFns_1 = require("../../utils/iterableFns");
const parseOps_1 = require("../utils/filterQuery/querySelectors/parseOps");
const parseComparisonOps_1 = require("../utils/filterQuery/querySelectors/parseComparisonOps");
const parseWhereBusinessId = [
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
    parseComparisonOps_1.default((opVal) => opVal),
];
const fieldAndConditionGen = function (keyValueIterator, opts) {
    return __asyncGenerator(this, arguments, function* () {
        var e_2, _a;
        const [asyncIterator, asyncReturn] = iterableFns_1.resolveWithAsyncReturn(parseOps_1.default(true, keyValueIterator, parseWhereBusinessId, opts));
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
const businesses = (parent, args, context, info) => __awaiter(void 0, void 0, void 0, function* () {
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
    pipeline.push(mongoUtils_1.addId);
    return context.db.collection("businesses").aggregate(pipeline).toArray();
});
exports.default = businesses;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYnVzaW5lc3Nlcy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9yZXNvbHZlcnMvYnVzaW5lc3MvYnVzaW5lc3Nlcy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFBQSxxQ0FBbUM7QUFNbkMsb0RBQTRDO0FBRzVDLHdEQUVxQztBQUVyQyxzRUFBK0Q7QUFDL0QseURBQWlFO0FBQ2pFLDJFQUFvRTtBQUVwRSwrRkFBd0Y7QUFJeEYsTUFBTSxvQkFBb0IsR0FBMEM7SUFDbEUsVUFBaUIsUUFBUSxFQUFFLGFBQWE7Ozs7Z0JBQ3RDLEtBQWdDLElBQUEsYUFBQSxjQUFBLFFBQVEsQ0FBQSxjQUFBO29CQUE3QixNQUFNLENBQUMsRUFBRSxFQUFFLEtBQUssQ0FBQyxxQkFBQSxDQUFBO29CQUMxQixRQUFRLEVBQUUsRUFBRTt3QkFDVixLQUFLLElBQUksQ0FBQzt3QkFDVixLQUFLLElBQUk7NEJBQ1AsSUFBSSxLQUFLLEVBQUU7Z0NBQ1Qsb0JBQU0sQ0FBQyxFQUFFLEVBQUUsSUFBSSxrQkFBUSxDQUFDLEtBQXlCLENBQUMsQ0FBQyxDQUFBLENBQUM7NkJBQ3JEOzRCQUNELE1BQU07d0JBQ1IsS0FBSyxJQUFJLENBQUM7d0JBQ1YsS0FBSyxLQUFLOzRCQUNSLElBQUksS0FBSyxFQUFFO2dDQUNULG9CQUFNO29DQUNKLEVBQUU7b0NBQ0QsS0FBMEIsQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFFLEVBQUUsRUFBRSxDQUFDLElBQUksa0JBQVEsQ0FBQyxFQUFFLENBQUMsQ0FBQztpQ0FDMUQsQ0FBQSxDQUFDOzZCQUNIOzRCQUNELE1BQU07d0JBQ1I7NEJBQ0Usb0JBQU0sQ0FBQyxFQUFFLEVBQUUsS0FBSyxDQUFDLENBQUEsQ0FBQztxQkFDckI7aUJBQ0Y7Ozs7Ozs7OztZQUNELHFCQUFPLGFBQWEsRUFBQztRQUN2QixDQUFDO0tBQTZCO0lBQzlCLDRCQUFrQixDQUFpQixDQUFDLEtBQUssRUFBRSxFQUFFLENBQUMsS0FBSyxDQUFDO0NBQzVDLENBQUM7QUFFWCxNQUFNLG9CQUFvQixHQUFzQyxVQUM5RCxnQkFBZ0IsRUFDaEIsSUFBSTs7O1FBRUosTUFBTSxDQUFDLGFBQWEsRUFBRSxXQUFXLENBQUMsR0FBRyxvQ0FBc0IsQ0FDekQsa0JBQVEsQ0FBQyxJQUFJLEVBQUUsZ0JBQWdCLEVBQUUsb0JBQW9CLEVBQUUsSUFBSSxDQUFDLENBQzdELENBQUM7O1lBRUYsS0FBaUMsSUFBQSxrQkFBQSxjQUFBLGFBQWEsQ0FBQSxtQkFBQTtnQkFBbkMsTUFBTSxDQUFDLEdBQUcsRUFBRSxLQUFLLENBQUMsMEJBQUEsQ0FBQTtnQkFDM0IsUUFBUSxHQUFHLEVBQUU7b0JBQ1gsS0FBSyxNQUFNO3dCQUNULElBQUksS0FBSyxFQUFFOzRCQUNULG9CQUFNO2dDQUNKLEtBQUssRUFBRSxNQUFNO2dDQUNiLFNBQVMsRUFBRSx1QkFBYSxDQUFDLEtBQTBCLENBQUM7NkJBQ3JELENBQUEsQ0FBQzt5QkFDSDt3QkFDRCxNQUFNO2lCQUNUO2FBQ0Y7Ozs7Ozs7OztRQUVELE1BQU0sU0FBUyxHQUFHLGNBQU0sV0FBVyxDQUFBLENBQUM7UUFFcEMsbURBQW1EO1FBQ25ELElBQUksTUFBTSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxFQUFFO1lBQ3JDLG9CQUFNO2dCQUNKLEtBQUssRUFBRSxLQUFLO2dCQUNaLFNBQVM7YUFDVixDQUFBLENBQUM7U0FDSDtJQUNILENBQUM7Q0FBQSxDQUFDO0FBRUYsTUFBTSxVQUFVLEdBQWlDLENBQy9DLE1BQU0sRUFDTixJQUFJLEVBQ0osT0FBTyxFQUNQLElBQUksRUFDSixFQUFFO0lBQ0YsTUFBTSxRQUFRLEdBQThCLEVBQUUsQ0FBQztJQUUvQyxNQUFNLE9BQU8sQ0FBQyxHQUFHLENBQUM7UUFDaEIsQ0FBQyxHQUFTLEVBQUU7WUFDVixJQUFJLENBQUMsSUFBSSxDQUFDLEtBQUssRUFBRTtnQkFDZixPQUFPO2FBQ1I7WUFFRCxNQUFNLE1BQU0sR0FBRyxNQUFNLGdCQUFrQixDQUNyQyxJQUFJLENBQUMsS0FBSyxFQUNWLG9CQUFvQixFQUNwQixPQUFPLENBQ1IsQ0FBQztZQUVGLFFBQVEsQ0FBQyxJQUFJLENBQUMsRUFBRSxNQUFNLEVBQUUsQ0FBQyxDQUFDO1FBQzVCLENBQUMsQ0FBQSxDQUFDLEVBQUU7S0FDTCxDQUFDLENBQUM7SUFFSCxRQUFRLENBQUMsSUFBSSxDQUFDLGtCQUFLLENBQUMsQ0FBQztJQUVyQixPQUFPLE9BQU8sQ0FBQyxFQUFFLENBQUMsVUFBVSxDQUFDLFlBQVksQ0FBQyxDQUFDLFNBQVMsQ0FBQyxRQUFRLENBQUMsQ0FBQyxPQUFPLEVBQUUsQ0FBQztBQUMzRSxDQUFDLENBQUEsQ0FBQztBQUVGLGtCQUFlLFVBQVUsQ0FBQyJ9