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
const generatorInit = (genFn, ...args) => {
    const gen = genFn(...args);
    gen.next();
    return gen;
};
exports.generatorInit = generatorInit;
const iterateIteratorResults = function* (iterable) {
    const iterator = iterable[Symbol.iterator]();
    let result = iterator.next();
    while (!result.done) {
        const next = yield result;
        result = iterator.next(next);
    }
    yield result;
};
exports.iterateIteratorResults = iterateIteratorResults;
const cbWithReturn = function* (iterable, cb) {
    const iterator = iterable[Symbol.iterator]();
    let result = iterator.next();
    while (result.done === false) {
        const next = yield result.value;
        result = iterator.next(next);
    }
    cb(result.value, result);
    return result.value;
};
exports.cbWithReturn = cbWithReturn;
const resolveWithAsyncReturn = (iterable) => {
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
exports.resolveWithAsyncReturn = resolveWithAsyncReturn;
const iterateAsyncIteratorResults = function (iterable) {
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
exports.iterateAsyncIteratorResults = iterateAsyncIteratorResults;
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
const iterableToAsyncIterable = function (iterable) {
    // Already an async iterable
    if (Symbol.asyncIterator in iterable) {
        return iterable;
    }
    return _iterableToAsyncIterable_(iterable);
};
exports.iterableToAsyncIterable = iterableToAsyncIterable;
const hasOwnProperty = Object.prototype.hasOwnProperty;
const iterateOwnKeys = function* (obj) {
    for (const key in obj) {
        if (hasOwnProperty.call(obj, key)) {
            yield key;
        }
    }
};
exports.iterateOwnKeys = iterateOwnKeys;
const iterateOwnKeyValues = function* (obj) {
    for (const key of (0, exports.iterateOwnKeys)(obj)) {
        if (hasOwnProperty.call(obj, key)) {
            yield [key, obj[key]];
        }
    }
};
exports.iterateOwnKeyValues = iterateOwnKeyValues;
/**
 * NOTE: First element of return type `TReturn[]` is always the return type
 * from @param srcIterable
 */
const generatorChain = function* (srcIterable, generators, ...args) {
    const returnResults = [];
    const captureReturnCb = (returnValue) => void returnResults.push(returnValue);
    yield* (() => {
        let iterableIterator = (0, exports.cbWithReturn)(srcIterable, captureReturnCb);
        for (const gen of generators) {
            iterableIterator = (0, exports.cbWithReturn)(gen(iterableIterator, ...args), captureReturnCb);
        }
        return iterableIterator;
    })();
    return returnResults;
};
exports.generatorChain = generatorChain;
/**
 * NOTE: First element of return type `TReturn[]` is always the return type
 * from @param srcIterable
 */
const asyncGeneratorChain = function (srcIterable, generators, ...args) {
    return __asyncGenerator(this, arguments, function* () {
        var e_1, _a;
        const returnResults = [];
        const asyncIterableIterator = (() => {
            let [asyncIterableIterator, returnPromise] = (0, exports.resolveWithAsyncReturn)(srcIterable);
            returnResults.push(returnPromise);
            for (const gen of generators) {
                [asyncIterableIterator, returnPromise] = (0, exports.resolveWithAsyncReturn)(gen(asyncIterableIterator, ...args));
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
exports.asyncGeneratorChain = asyncGeneratorChain;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaXRlcmFibGVGbnMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvdXRpbHMvaXRlcmFibGVGbnMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQTJCQTs7OztLQUlLO0FBQ0UsTUFBTSxhQUFhLEdBQUcsQ0FNM0IsS0FBcUQsRUFDckQsR0FBRyxJQUFXLEVBQ2dCLEVBQUU7SUFDaEMsTUFBTSxHQUFHLEdBQUcsS0FBSyxDQUFDLEdBQUcsSUFBSSxDQUFDLENBQUM7SUFDM0IsR0FBRyxDQUFDLElBQUksRUFBRSxDQUFDO0lBQ1gsT0FBTyxHQUFHLENBQUM7QUFDYixDQUFDLENBQUM7QUFaVyxRQUFBLGFBQWEsaUJBWXhCO0FBRUssTUFBTSxzQkFBc0IsR0FBRyxRQUFRLENBQUMsRUFLN0MsUUFBd0M7SUFFeEMsTUFBTSxRQUFRLEdBQUcsUUFBUSxDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUMsRUFBRSxDQUFDO0lBQzdDLElBQUksTUFBTSxHQUFHLFFBQVEsQ0FBQyxJQUFJLEVBQUUsQ0FBQztJQUM3QixPQUFPLENBQUMsTUFBTSxDQUFDLElBQUksRUFBRTtRQUNuQixNQUFNLElBQUksR0FBRyxNQUFNLE1BQU0sQ0FBQztRQUMxQixNQUFNLEdBQUcsUUFBUSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztLQUM5QjtJQUNELE1BQU0sTUFBTSxDQUFDO0FBQ2YsQ0FBQyxDQUFDO0FBZFcsUUFBQSxzQkFBc0IsMEJBY2pDO0FBRUssTUFBTSxZQUFZLEdBQUcsUUFBUSxDQUFDLEVBQ25DLFFBQXdDLEVBQ3hDLEVBQTBFO0lBRTFFLE1BQU0sUUFBUSxHQUFHLFFBQVEsQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDLEVBQUUsQ0FBQztJQUM3QyxJQUFJLE1BQU0sR0FBRyxRQUFRLENBQUMsSUFBSSxFQUFFLENBQUM7SUFDN0IsT0FBTyxNQUFNLENBQUMsSUFBSSxLQUFLLEtBQUssRUFBRTtRQUM1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