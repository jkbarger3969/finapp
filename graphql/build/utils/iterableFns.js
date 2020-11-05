"use strict";
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
var __asyncValues = (this && this.__asyncValues) || function (o) {
    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
    var m = o[Symbol.asyncIterator], i;
    return m ? m.call(o) : (o = typeof __values === "function" ? __values(o) : o[Symbol.iterator](), i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i);
    function verb(n) { i[n] = o[n] && function (v) { return new Promise(function (resolve, reject) { v = o[n](v), settle(resolve, reject, v.done, v.value); }); }; }
    function settle(resolve, reject, d, v) { Promise.resolve(v).then(function(v) { resolve({ value: v, done: d }); }, reject); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.asyncGeneratorChain = exports.generatorChain = exports.iterateOwnKeyValues = exports.iterateOwnKeys = exports.iterableToAsyncIterable = exports.iterateAsyncIteratorResults = exports.resolveWithAsyncReturn = exports.cbWithReturn = exports.iterateIteratorResults = exports.generatorInit = void 0;
/**
 * Calls the Generator function with the passed args, captures returned
 * Generator object and calls the next method one time then returns the
 * Generator object.
 * */
exports.generatorInit = (genFn, ...args) => {
    const gen = genFn(...args);
    gen.next();
    return gen;
};
exports.iterateIteratorResults = function* (iterable) {
    const iterator = iterable[Symbol.iterator]();
    let result = iterator.next();
    while (!result.done) {
        const next = yield result;
        result = iterator.next(next);
    }
    yield result;
};
exports.cbWithReturn = function* (iterable, cb) {
    const iterator = iterable[Symbol.iterator]();
    let result = iterator.next();
    while (result.done === false) {
        const next = yield result.value;
        result = iterator.next(next);
    }
    cb(result.value, result);
    return result.value;
};
exports.resolveWithAsyncReturn = (iterable) => {
    let resolve;
    let reject;
    const promise = new Promise((_resolve, _reject) => {
        resolve = _resolve;
        reject = _reject;
    });
    return [
        (function () {
            return __asyncGenerator(this, arguments, function* () {
                try {
                    const iterator = iterable[Symbol.asyncIterator]();
                    let result = yield __await(iterator.next());
                    while (result.done === false) {
                        const next = yield yield __await(result.value);
                        result = yield __await(iterator.next(next));
                    }
                    resolve(result.value);
                    return yield __await(result.value);
                }
                catch (error) {
                    reject(error);
                    throw error;
                }
            });
        })(),
        promise,
    ];
};
exports.iterateAsyncIteratorResults = function (iterable) {
    return __asyncGenerator(this, arguments, function* () {
        const iterator = iterable[Symbol.asyncIterator]();
        let result = yield __await(iterator.next());
        while (!result.done) {
            const next = yield yield __await(result);
            result = yield __await(iterator.next(next));
        }
        yield yield __await(result);
    });
};
const _iterableToAsyncIterable_ = function (iterable) {
    return __asyncGenerator(this, arguments, function* () {
        const iterator = iterable[Symbol.iterator]();
        let result = iterator.next();
        while (result.done === false) {
            const next = yield yield __await(result.value);
            result = iterator.next(next);
        }
        return yield __await(result.value);
    });
};
exports.iterableToAsyncIterable = function (iterable) {
    // Already an async iterable
    if (Symbol.asyncIterator in iterable) {
        return iterable;
    }
    return _iterableToAsyncIterable_(iterable);
};
const hasOwnProperty = Object.prototype.hasOwnProperty;
exports.iterateOwnKeys = function* (obj) {
    for (const key in obj) {
        if (hasOwnProperty.call(obj, key)) {
            yield key;
        }
    }
};
exports.iterateOwnKeyValues = function* (obj) {
    for (const key of exports.iterateOwnKeys(obj)) {
        if (hasOwnProperty.call(obj, key)) {
            yield [key, obj[key]];
        }
    }
};
/**
 * NOTE: First element of return type `TReturn[]` is always the return type
 * from @param srcIterable
 */
exports.generatorChain = function* (srcIterable, generators, ...args) {
    const returnResults = [];
    const captureReturnCb = (returnValue) => void returnResults.push(returnValue);
    yield* (() => {
        let iterableIterator = exports.cbWithReturn(srcIterable, captureReturnCb);
        for (const gen of generators) {
            iterableIterator = exports.cbWithReturn(gen(iterableIterator, ...args), captureReturnCb);
        }
        return iterableIterator;
    })();
    return returnResults;
};
/**
 * NOTE: First element of return type `TReturn[]` is always the return type
 * from @param srcIterable
 */
exports.asyncGeneratorChain = function (srcIterable, generators, ...args) {
    return __asyncGenerator(this, arguments, function* () {
        var e_1, _a;
        const returnResults = [];
        const asyncIterableIterator = (() => {
            let [asyncIterableIterator, returnPromise] = exports.resolveWithAsyncReturn(srcIterable);
            returnResults.push(returnPromise);
            for (const gen of generators) {
                [asyncIterableIterator, returnPromise] = exports.resolveWithAsyncReturn(gen(asyncIterableIterator, ...args));
                returnResults.push(returnPromise);
            }
            return asyncIterableIterator;
        })();
        try {
            for (var asyncIterableIterator_1 = __asyncValues(asyncIterableIterator), asyncIterableIterator_1_1; asyncIterableIterator_1_1 = yield __await(asyncIterableIterator_1.next()), !asyncIterableIterator_1_1.done;) {
                const result = asyncIterableIterator_1_1.value;
                yield yield __await(result);
            }
        }
        catch (e_1_1) { e_1 = { error: e_1_1 }; }
        finally {
            try {
                if (asyncIterableIterator_1_1 && !asyncIterableIterator_1_1.done && (_a = asyncIterableIterator_1.return)) yield __await(_a.call(asyncIterableIterator_1));
            }
            finally { if (e_1) throw e_1.error; }
        }
        return yield __await(Promise.all(returnResults));
    });
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaXRlcmFibGVGbnMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvdXRpbHMvaXRlcmFibGVGbnMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQTJCQTs7OztLQUlLO0FBQ1EsUUFBQSxhQUFhLEdBQUcsQ0FNM0IsS0FBcUQsRUFDckQsR0FBRyxJQUFXLEVBQ2dCLEVBQUU7SUFDaEMsTUFBTSxHQUFHLEdBQUcsS0FBSyxDQUFDLEdBQUcsSUFBSSxDQUFDLENBQUM7SUFDM0IsR0FBRyxDQUFDLElBQUksRUFBRSxDQUFDO0lBQ1gsT0FBTyxHQUFHLENBQUM7QUFDYixDQUFDLENBQUM7QUFFVyxRQUFBLHNCQUFzQixHQUFHLFFBQVEsQ0FBQyxFQUs3QyxRQUF3QztJQUV4QyxNQUFNLFFBQVEsR0FBRyxRQUFRLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxFQUFFLENBQUM7SUFDN0MsSUFBSSxNQUFNLEdBQUcsUUFBUSxDQUFDLElBQUksRUFBRSxDQUFDO0lBQzdCLE9BQU8sQ0FBQyxNQUFNLENBQUMsSUFBSSxFQUFFO1FBQ25CLE1BQU0sSUFBSSxHQUFHLE1BQU0sTUFBTSxDQUFDO1FBQzFCLE1BQU0sR0FBRyxRQUFRLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO0tBQzlCO0lBQ0QsTUFBTSxNQUFNLENBQUM7QUFDZixDQUFDLENBQUM7QUFFVyxRQUFBLFlBQVksR0FBRyxRQUFRLENBQUMsRUFDbkMsUUFBd0MsRUFDeEMsRUFBMEU7SUFFMUUsTUFBTSxRQUFRLEdBQUcsUUFBUSxDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUMsRUFBRSxDQUFDO0lBQzdDLElBQUksTUFBTSxHQUFHLFFBQVEsQ0FBQyxJQUFJLEVBQUUsQ0FBQztJQUM3QixPQUFPLE1BQU0sQ0FBQyxJQUFJLEtBQUssS0FBSyxFQUFFO1FBQzVCLE1BQU0sSUFBSSxHQUFHLE1BQU0sTUFBTSxDQUFDLEtBQUssQ0FBQztRQUNoQyxNQUFNLEdBQUcsUUFBUSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztLQUM5QjtJQUNELEVBQUUsQ0FBQyxNQUFNLENBQUMsS0FBSyxFQUFFLE1BQU0sQ0FBQyxDQUFDO0lBQ3pCLE9BQU8sTUFBTSxDQUFDLEtBQUssQ0FBQztBQUN0QixDQUFDLENBQUM7QUFFVyxRQUFBLHNCQUFzQixHQUFHLENBQ3BDLFFBQTZDLEVBQ29CLEVBQUU7SUFDbkUsSUFBSSxPQUFpQyxDQUFDO0lBQ3RDLElBQUksTUFBdUIsQ0FBQztJQUM1QixNQUFNLE9BQU8sR0FBRyxJQUFJLE9BQU8sQ0FBVSxDQUFDLFFBQVEsRUFBRSxPQUFPLEVBQUUsRUFBRTtRQUN6RCxPQUFPLEdBQUcsUUFBUSxDQUFDO1FBQ25CLE1BQU0sR0FBRyxPQUFPLENBQUM7SUFDbkIsQ0FBQyxDQUFDLENBQUM7SUFDSCxPQUFPO1FBQ0wsQ0FBQzs7Z0JBQ0MsSUFBSTtvQkFDRixNQUFNLFFBQVEsR0FBRyxRQUFRLENBQUMsTUFBTSxDQUFDLGFBQWEsQ0FBQyxFQUFFLENBQUM7b0JBQ2xELElBQUksTUFBTSxHQUFHLGNBQU0sUUFBUSxDQUFDLElBQUksRUFBRSxDQUFBLENBQUM7b0JBQ25DLE9BQU8sTUFBTSxDQUFDLElBQUksS0FBSyxLQUFLLEVBQUU7d0JBQzVCLE1BQU0sSUFBSSxHQUFHLG9CQUFNLE1BQU0sQ0FBQyxLQUFLLENBQUEsQ0FBQzt3QkFDaEMsTUFBTSxHQUFHLGNBQU0sUUFBUSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQSxDQUFDO3FCQUNwQztvQkFFRCxPQUFPLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxDQUFDO29CQUN0QixxQkFBTyxNQUFNLENBQUMsS0FBSyxFQUFDO2lCQUNyQjtnQkFBQyxPQUFPLEtBQUssRUFBRTtvQkFDZCxNQUFNLENBQUMsS0FBSyxDQUFDLENBQUM7b0JBQ2QsTUFBTSxLQUFLLENBQUM7aUJBQ2I7WUFDSCxDQUFDO1NBQUEsQ0FBQyxFQUFFO1FBQ0osT0FBTztLQUMyRCxDQUFDO0FBQ3ZFLENBQUMsQ0FBQztBQUVXLFFBQUEsMkJBQTJCLEdBQUcsVUFLekMsUUFBNkM7O1FBRTdDLE1BQU0sUUFBUSxHQUFHLFFBQVEsQ0FBQyxNQUFNLENBQUMsYUFBYSxDQUFDLEVBQUUsQ0FBQztRQUNsRCxJQUFJLE1BQU0sR0FBRyxjQUFNLFFBQVEsQ0FBQyxJQUFJLEVBQUUsQ0FBQSxDQUFDO1FBQ25DLE9BQU8sQ0FBQyxNQUFNLENBQUMsSUFBSSxFQUFFO1lBQ25CLE1BQU0sSUFBSSxHQUFHLG9CQUFNLE1BQU0sQ0FBQSxDQUFDO1lBQzFCLE1BQU0sR0FBRyxjQUFNLFFBQVEsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUEsQ0FBQztTQUNwQztRQUNELG9CQUFNLE1BQU0sQ0FBQSxDQUFDO0lBQ2YsQ0FBQztDQUFBLENBQUM7QUFFRixNQUFNLHlCQUF5QixHQUFHLFVBS2hDLFFBQXdDOztRQUV4QyxNQUFNLFFBQVEsR0FBRyxRQUFRLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxFQUFFLENBQUM7UUFDN0MsSUFBSSxNQUFNLEdBQUcsUUFBUSxDQUFDLElBQUksRUFBRSxDQUFDO1FBQzdCLE9BQU8sTUFBTSxDQUFDLElBQUksS0FBSyxLQUFLLEVBQUU7WUFDNUIsTUFBTSxJQUFJLEdBQUcsb0JBQU0sTUFBTSxDQUFDLEtBQUssQ0FBQSxDQUFDO1lBQ2hDLE1BQU0sR0FBRyxRQUFRLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO1NBQzlCO1FBRUQscUJBQU8sTUFBTSxDQUFDLEtBQUssRUFBQztJQUN0QixDQUFDO0NBQUEsQ0FBQztBQUVXLFFBQUEsdUJBQXVCLEdBQUcsVUFLckMsUUFBOEU7SUFFOUUsNEJBQTRCO0lBQzVCLElBQUksTUFBTSxDQUFDLGFBQWEsSUFBSSxRQUFRLEVBQUU7UUFDcEMsT0FBTyxRQUErQyxDQUFDO0tBQ3hEO0lBRUQsT0FBTyx5QkFBeUIsQ0FBQyxRQUEwQyxDQUFDLENBQUM7QUFDL0UsQ0FBQyxDQUFDO0FBTUYsTUFBTSxjQUFjLEdBQUcsTUFBTSxDQUFDLFNBQVMsQ0FBQyxjQUFjLENBQUM7QUFFMUMsUUFBQSxjQUFjLEdBQUcsUUFBUSxDQUFDLEVBQ3JDLEdBQVM7SUFFVCxLQUFLLE1BQU0sR0FBRyxJQUFJLEdBQUcsRUFBRTtRQUNyQixJQUFJLGNBQWMsQ0FBQyxJQUFJLENBQUMsR0FBRyxFQUFFLEdBQUcsQ0FBQyxFQUFFO1lBQ2pDLE1BQU0sR0FBRyxDQUFDO1NBQ1g7S0FDRjtBQUNILENBQUMsQ0FBQztBQUVXLFFBQUEsbUJBQW1CLEdBQUcsUUFBUSxDQUFDLEVBQzFDLEdBQVM7SUFFVCxLQUFLLE1BQU0sR0FBRyxJQUFJLHNCQUFjLENBQU8sR0FBRyxDQUFDLEVBQUU7UUFDM0MsSUFBSSxjQUFjLENBQUMsSUFBSSxDQUFDLEdBQUcsRUFBRSxHQUFHLENBQUMsRUFBRTtZQUNqQyxNQUFNLENBQUMsR0FBRyxFQUFFLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDO1NBQ3ZCO0tBQ0Y7QUFDSCxDQUFDLENBQUM7QUFXRjs7O0dBR0c7QUFDVSxRQUFBLGNBQWMsR0FBRyxRQUFRLENBQUMsRUFLckMsV0FBb0MsRUFDcEMsVUFBbUUsRUFDbkUsR0FBRyxJQUFXO0lBRWQsTUFBTSxhQUFhLEdBQWMsRUFBRSxDQUFDO0lBQ3BDLE1BQU0sZUFBZSxHQUFHLENBQUMsV0FBb0IsRUFBRSxFQUFFLENBQy9DLEtBQUssYUFBYSxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsQ0FBQztJQUV2QyxLQUFLLENBQUMsQ0FBQyxDQUFDLEdBQUcsRUFBRTtRQUNYLElBQUksZ0JBQWdCLEdBQUcsb0JBQVksQ0FDakMsV0FBVyxFQUNYLGVBQWUsQ0FDaEIsQ0FBQztRQUNGLEtBQUssTUFBTSxHQUFHLElBQUksVUFBVSxFQUFFO1lBQzVCLGdCQUFnQixHQUFHLG9CQUFZLENBQzdCLEdBQUcsQ0FBQyxnQkFBZ0IsRUFBRSxHQUFHLElBQUksQ0FBQyxFQUM5QixlQUFlLENBQ2hCLENBQUM7U0FDSDtRQUNELE9BQU8sZ0JBQWdCLENBQUM7SUFDMUIsQ0FBQyxDQUFDLEVBQUUsQ0FBQztJQUVMLE9BQU8sYUFBYSxDQUFDO0FBQ3ZCLENBQUMsQ0FBQztBQVdGOzs7R0FHRztBQUNVLFFBQUEsbUJBQW1CLEdBQUcsVUFLakMsV0FBeUMsRUFDekMsVUFBd0UsRUFDeEUsR0FBRyxJQUFXOzs7UUFFZCxNQUFNLGFBQWEsR0FBdUIsRUFBRSxDQUFDO1FBRTdDLE1BQU0scUJBQXFCLEdBQUcsQ0FBQyxHQUFHLEVBQUU7WUFDbEMsSUFBSSxDQUFDLHFCQUFxQixFQUFFLGFBQWEsQ0FBQyxHQUFHLDhCQUFzQixDQUNqRSxXQUFXLENBQ1osQ0FBQztZQUVGLGFBQWEsQ0FBQyxJQUFJLENBQUMsYUFBYSxDQUFDLENBQUM7WUFFbEMsS0FBSyxNQUFNLEdBQUcsSUFBSSxVQUFVLEVBQUU7Z0JBQzVCLENBQUMscUJBQXFCLEVBQUUsYUFBYSxDQUFDLEdBQUcsOEJBQXNCLENBQzdELEdBQUcsQ0FBQyxxQkFBcUIsRUFBRSxHQUFHLElBQUksQ0FBQyxDQUNwQyxDQUFDO2dCQUNGLGFBQWEsQ0FBQyxJQUFJLENBQUMsYUFBYSxDQUFDLENBQUM7YUFDbkM7WUFDRCxPQUFPLHFCQUFxQixDQUFDO1FBQy9CLENBQUMsQ0FBQyxFQUFFLENBQUM7O1lBRUwsS0FBMkIsSUFBQSwwQkFBQSxjQUFBLHFCQUFxQixDQUFBLDJCQUFBO2dCQUFyQyxNQUFNLE1BQU0sa0NBQUEsQ0FBQTtnQkFDckIsb0JBQU0sTUFBTSxDQUFBLENBQUM7YUFDZDs7Ozs7Ozs7O1FBRUQscUJBQU8sT0FBTyxDQUFDLEdBQUcsQ0FBQyxhQUFhLENBQUMsRUFBQztJQUNwQyxDQUFDO0NBQUEsQ0FBQyJ9