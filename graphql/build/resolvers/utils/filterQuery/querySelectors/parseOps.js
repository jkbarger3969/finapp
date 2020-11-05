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
exports.parseOpsIgnoreUnmatched = exports.parseOpsGenerator = void 0;
const iterableFns_1 = require("../../../../utils/iterableFns");
// NOTE: Yields unmatched op and OpValues
exports.parseOpsGenerator = function (opValues, opsParsers, options) {
    return __asyncGenerator(this, arguments, function* () {
        var e_1, _a;
        const querySelector = {};
        const [asyncIterator, returnPromise] = iterableFns_1.resolveWithAsyncReturn(iterableFns_1.asyncGeneratorChain(iterableFns_1.iterableToAsyncIterable(opValues), opsParsers, querySelector, options));
        try {
            for (var asyncIterator_1 = __asyncValues(asyncIterator), asyncIterator_1_1; asyncIterator_1_1 = yield __await(asyncIterator_1.next()), !asyncIterator_1_1.done;) {
                const [op, opValue] = asyncIterator_1_1.value;
                yield yield __await([op, opValue]);
            }
        }
        catch (e_1_1) { e_1 = { error: e_1_1 }; }
        finally {
            try {
                if (asyncIterator_1_1 && !asyncIterator_1_1.done && (_a = asyncIterator_1.return)) yield __await(_a.call(asyncIterator_1));
            }
            finally { if (e_1) throw e_1.error; }
        }
        const returnValues = yield __await(returnPromise);
        // Do NOT include 1st return elem, asyncGeneratorChain always returns
        // "srcIterable" return at index 0.
        return yield __await(Object.assign(querySelector, ...returnValues.slice(1)));
    });
};
exports.parseOpsIgnoreUnmatched = (opValues, opsParsers, options) => __awaiter(void 0, void 0, void 0, function* () {
    var e_2, _a;
    try {
        for (var _b = __asyncValues(iterableFns_1.iterateAsyncIteratorResults(exports.parseOpsGenerator(opValues, opsParsers, options))), _c; _c = yield _b.next(), !_c.done;) {
            const result = _c.value;
            if (result.done) {
                return result.value;
            }
        }
    }
    catch (e_2_1) { e_2 = { error: e_2_1 }; }
    finally {
        try {
            if (_c && !_c.done && (_a = _b.return)) yield _a.call(_b);
        }
        finally { if (e_2) throw e_2.error; }
    }
});
function parseOps(yieldUnmatched, opValues, opsParsers, options) {
    return yieldUnmatched
        ? exports.parseOpsGenerator(opValues, opsParsers, options)
        : exports.parseOpsIgnoreUnmatched(opValues, opsParsers, options);
}
exports.default = parseOps;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicGFyc2VPcHMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9zcmMvcmVzb2x2ZXJzL3V0aWxzL2ZpbHRlclF1ZXJ5L3F1ZXJ5U2VsZWN0b3JzL3BhcnNlT3BzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFHQSwrREFNdUM7QUFFdkMseUNBQXlDO0FBQzVCLFFBQUEsaUJBQWlCLEdBQUcsVUFJL0IsUUFFOEQsRUFDOUQsVUFBcUQsRUFDckQsT0FBa0I7OztRQUtsQixNQUFNLGFBQWEsR0FBMkIsRUFBRSxDQUFDO1FBRWpELE1BQU0sQ0FBQyxhQUFhLEVBQUUsYUFBYSxDQUFDLEdBQUcsb0NBQXNCLENBQzNELGlDQUFtQixDQUNqQixxQ0FBdUIsQ0FBQyxRQUFRLENBQUMsRUFDakMsVUFBVSxFQUNWLGFBQWEsRUFDYixPQUFPLENBQ1IsQ0FDRixDQUFDOztZQUVGLEtBQWtDLElBQUEsa0JBQUEsY0FBQSxhQUFhLENBQUEsbUJBQUE7Z0JBQXBDLE1BQU0sQ0FBQyxFQUFFLEVBQUUsT0FBTyxDQUFDLDBCQUFBLENBQUE7Z0JBQzVCLG9CQUFNLENBQUMsRUFBRSxFQUFFLE9BQU8sQ0FBQyxDQUFBLENBQUM7YUFDckI7Ozs7Ozs7OztRQUVELE1BQU0sWUFBWSxHQUFHLGNBQU0sYUFBYSxDQUFBLENBQUM7UUFFekMscUVBQXFFO1FBQ3JFLG1DQUFtQztRQUVuQyxxQkFBTyxNQUFNLENBQUMsTUFBTSxDQUFDLGFBQWEsRUFBRSxHQUFHLFlBQVksQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBQztJQUNoRSxDQUFDO0NBQUEsQ0FBQztBQUVXLFFBQUEsdUJBQXVCLEdBQUcsQ0FJckMsUUFFOEQsRUFDOUQsVUFBcUQsRUFDckQsT0FBa0IsRUFDZSxFQUFFOzs7UUFDbkMsS0FBMkIsSUFBQSxLQUFBLGNBQUEseUNBQTJCLENBQ3BELHlCQUFpQixDQUF1QixRQUFRLEVBQUUsVUFBVSxFQUFFLE9BQU8sQ0FBQyxDQUN2RSxDQUFBLElBQUE7WUFGVSxNQUFNLE1BQU0sV0FBQSxDQUFBO1lBR3JCLElBQUksTUFBTSxDQUFDLElBQUksRUFBRTtnQkFDZixPQUFPLE1BQU0sQ0FBQyxLQUFLLENBQUM7YUFDckI7U0FDRjs7Ozs7Ozs7O0FBQ0gsQ0FBQyxDQUFBLENBQUM7QUEyQkYsU0FBd0IsUUFBUSxDQUk5QixjQUF1QixFQUN2QixRQUU4RCxFQUM5RCxVQUFxRCxFQUNyRCxPQUFrQjtJQU9sQixPQUFPLGNBQWM7UUFDbkIsQ0FBQyxDQUFDLHlCQUFpQixDQUFDLFFBQVEsRUFBRSxVQUFVLEVBQUUsT0FBTyxDQUFDO1FBQ2xELENBQUMsQ0FBQywrQkFBdUIsQ0FBQyxRQUFRLEVBQUUsVUFBVSxFQUFFLE9BQU8sQ0FBQyxDQUFDO0FBQzdELENBQUM7QUFuQkQsMkJBbUJDIn0=