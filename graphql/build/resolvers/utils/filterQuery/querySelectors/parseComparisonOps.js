"use strict";
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
const parseComparisonOps = (opValueParser = (val, op) => {
    if (op === "in" || op === "nin") {
        return Array.isArray(val) ? val : [val];
    }
    return val;
}) => function (opValues, querySelector, opts) {
    return __asyncGenerator(this, arguments, function* () {
        var e_1, _a;
        try {
            for (var opValues_1 = __asyncValues(opValues), opValues_1_1; opValues_1_1 = yield __await(opValues_1.next()), !opValues_1_1.done;) {
                const [op, opVal] = opValues_1_1.value;
                switch (op) {
                    case "eq":
                        querySelector.$eq = yield __await(opValueParser(opVal, op, opts));
                        break;
                    case "gt":
                        querySelector.$gt = yield __await(opValueParser(opVal, op, opts));
                        break;
                    case "gte":
                        querySelector.$gte = yield __await(opValueParser(opVal, op, opts));
                        break;
                    case "in":
                        querySelector.$in = (yield __await(opValueParser(opVal, op, opts)));
                        break;
                    case "lt":
                        querySelector.$lt = yield __await(opValueParser(opVal, op, opts));
                        break;
                    case "lte":
                        querySelector.$lte = yield __await(opValueParser(opVal, op, opts));
                        break;
                    case "ne":
                        querySelector.$ne = yield __await(opValueParser(opVal, op, opts));
                        break;
                    case "nin":
                        querySelector.$nin = (yield __await(opValueParser(opVal, op, opts)));
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
};
exports.default = parseComparisonOps;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicGFyc2VDb21wYXJpc29uT3BzLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vc3JjL3Jlc29sdmVycy91dGlscy9maWx0ZXJRdWVyeS9xdWVyeVNlbGVjdG9ycy9wYXJzZUNvbXBhcmlzb25PcHMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBa0JBLE1BQU0sa0JBQWtCLEdBQUcsQ0FDekIsZ0JBQXVELENBQUMsR0FBRyxFQUFFLEVBQUUsRUFBRSxFQUFFO0lBQ2pFLElBQUksRUFBRSxLQUFLLElBQUksSUFBSSxFQUFFLEtBQUssS0FBSyxFQUFFO1FBQy9CLE9BQU8sS0FBSyxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDO0tBQ3pDO0lBQ0QsT0FBTyxHQUFHLENBQUM7QUFDYixDQUFDLEVBQ1UsRUFBRSxDQUNiLFVBQ0UsUUFBMEQsRUFDMUQsYUFBcUMsRUFDckMsSUFBYzs7OztZQUVkLEtBQWdDLElBQUEsYUFBQSxjQUFBLFFBQVEsQ0FBQSxjQUFBO2dCQUE3QixNQUFNLENBQUMsRUFBRSxFQUFFLEtBQUssQ0FBQyxxQkFBQSxDQUFBO2dCQUMxQixRQUFRLEVBQW1CLEVBQUU7b0JBQzNCLEtBQUssSUFBSTt3QkFDUCxhQUFhLENBQUMsR0FBRyxHQUFHLGNBQU0sYUFBYSxDQUNyQyxLQUFLLEVBQ0wsRUFBbUIsRUFDbkIsSUFBSSxDQUNMLENBQUEsQ0FBQzt3QkFDRixNQUFNO29CQUVSLEtBQUssSUFBSTt3QkFDUCxhQUFhLENBQUMsR0FBRyxHQUFHLGNBQU0sYUFBYSxDQUNyQyxLQUFLLEVBQ0wsRUFBbUIsRUFDbkIsSUFBSSxDQUNMLENBQUEsQ0FBQzt3QkFDRixNQUFNO29CQUVSLEtBQUssS0FBSzt3QkFDUixhQUFhLENBQUMsSUFBSSxHQUFHLGNBQU0sYUFBYSxDQUN0QyxLQUFLLEVBQ0wsRUFBbUIsRUFDbkIsSUFBSSxDQUNMLENBQUEsQ0FBQzt3QkFDRixNQUFNO29CQUVSLEtBQUssSUFBSTt3QkFDUCxhQUFhLENBQUMsR0FBRyxHQUFHLENBQUMsY0FBTSxhQUFhLENBQ3RDLEtBQUssRUFDTCxFQUFtQixFQUNuQixJQUFJLENBQ0wsQ0FBQSxDQUFjLENBQUM7d0JBQ2hCLE1BQU07b0JBRVIsS0FBSyxJQUFJO3dCQUNQLGFBQWEsQ0FBQyxHQUFHLEdBQUcsY0FBTSxhQUFhLENBQ3JDLEtBQUssRUFDTCxFQUFtQixFQUNuQixJQUFJLENBQ0wsQ0FBQSxDQUFDO3dCQUNGLE1BQU07b0JBRVIsS0FBSyxLQUFLO3dCQUNSLGFBQWEsQ0FBQyxJQUFJLEdBQUcsY0FBTSxhQUFhLENBQ3RDLEtBQUssRUFDTCxFQUFtQixFQUNuQixJQUFJLENBQ0wsQ0FBQSxDQUFDO3dCQUNGLE1BQU07b0JBRVIsS0FBSyxJQUFJO3dCQUNQLGFBQWEsQ0FBQyxHQUFHLEdBQUcsY0FBTSxhQUFhLENBQ3JDLEtBQUssRUFDTCxFQUFtQixFQUNuQixJQUFJLENBQ0wsQ0FBQSxDQUFDO3dCQUNGLE1BQU07b0JBRVIsS0FBSyxLQUFLO3dCQUNSLGFBQWEsQ0FBQyxJQUFJLEdBQUcsQ0FBQyxjQUFNLGFBQWEsQ0FDdkMsS0FBSyxFQUNMLEVBQW1CLEVBQ25CLElBQUksQ0FDTCxDQUFBLENBQWMsQ0FBQzt3QkFDaEIsTUFBTTtvQkFFUjt3QkFDRSxvQkFBTSxDQUFDLEVBQUUsRUFBRSxLQUFLLENBQUMsQ0FBQSxDQUFDO2lCQUNyQjthQUNGOzs7Ozs7Ozs7UUFFRCxxQkFBTyxhQUFhLEVBQUM7SUFDdkIsQ0FBQztDQUFBLENBQUM7QUFFSixrQkFBZSxrQkFBa0IsQ0FBQyJ9