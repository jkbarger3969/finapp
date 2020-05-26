export interface IterableFns<T, TReturn = any, TNext = undefined> extends Iterable<T> {
    [Symbol.iterator](): Iterator<T, TReturn, TNext>;
}
export interface IterableIteratorFns<T, TReturn = any, TNext = undefined> extends Iterator<T, TReturn, TNext> {
    [Symbol.iterator](): IterableIteratorFns<T, TReturn, TNext>;
}
export declare type GeneratorFunctionFns<TArgs extends unknown[], T, TReturn = any, TNext = undefined> = (...args: TArgs) => Generator<T, TReturn, TNext>;
export interface AsyncIterableFns<T, TReturn = any, TNext = undefined> extends AsyncIterable<T> {
    [Symbol.asyncIterator](): AsyncIterator<T, TReturn, TNext>;
}
export interface AsyncIterableIteratorFns<T, TReturn = any, TNext = undefined> extends AsyncIterator<T, TReturn, TNext> {
    [Symbol.asyncIterator](): AsyncIterableIteratorFns<T, TReturn, TNext>;
}
export declare const iterateIteratorResults: <T, TReturn = any, TNext = undefined>(iterable: IterableFns<T, TReturn, TNext>) => IterableIteratorFns<IteratorResult<T, TReturn>, any, TNext>;
export declare const cbWithReturn: <T, TReturn = any, TNext = undefined>(iterable: IterableFns<T, TReturn, TNext>, cb: (value: TReturn, returnResult?: IteratorReturnResult<TReturn>) => void) => IterableIteratorFns<T, TReturn, TNext>;
export declare const resolveWithAsyncReturn: <T, TReturn = any, TNext = undefined>(iterable: AsyncIterableFns<T, TReturn, TNext>) => [AsyncIterableIteratorFns<T, TReturn, TNext>, Promise<TReturn>];
export declare const iterateAsyncIteratorResults: <T, TReturn = any, TNext = undefined>(iterable: AsyncIterableFns<T, TReturn, TNext>) => AsyncIterableIteratorFns<IteratorResult<T, TReturn>, any, undefined>;
export declare const iterableToAsyncIterable: <T, TReturn = any, TNext = undefined>(iterable: IterableFns<T, TReturn, TNext> | AsyncIterableFns<T, TReturn, TNext>) => AsyncIterableFns<T, TReturn, TNext>;
export declare const iterateOwnKeyValues: <TObj extends object>(obj: TObj) => IterableIterator<[keyof TObj, TObj[keyof TObj]]>;
export declare type ChainableGeneratorFunction<TArgs extends unknown[], T, TReturn = any> = (iterable: IterableFns<T, TReturn>, ...args: TArgs) => Generator<T, TReturn>;
/**
 * NOTE: First element of return type `TReturn[]` is always the return type
 * from @param srcIterable
 */
export declare const generatorChain: <TArgs extends unknown[], T, TReturn = any>(srcIterable: IterableFns<T, TReturn, undefined>, generators: Iterable<ChainableGeneratorFunction<TArgs, T, TReturn>>, ...args: TArgs) => IterableIteratorFns<T, TReturn[], undefined>;
export declare type ChainableAsyncGeneratorFunction<TArgs extends unknown[], T, TReturn = any> = (iterable: AsyncIterableFns<T, TReturn>, ...args: TArgs) => AsyncIterableIteratorFns<T, TReturn>;
/**
 * NOTE: First element of return type `TReturn[]` is always the return type
 * from @param srcIterable
 */
export declare const asyncGeneratorChain: <TArgs extends unknown[], T, TReturn = any>(srcIterable: AsyncIterableFns<T, TReturn, undefined>, generators: Iterable<ChainableAsyncGeneratorFunction<TArgs, T, TReturn>>, ...args: TArgs) => AsyncIterableIteratorFns<T, TReturn[], undefined>;
