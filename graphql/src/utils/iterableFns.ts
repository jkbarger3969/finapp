export interface IterableFns<T, TReturn = any, TNext = undefined>
  extends Iterable<T> {
  [Symbol.iterator](): Iterator<T, TReturn, TNext>;
}

export interface IterableIteratorFns<T, TReturn = any, TNext = undefined>
  extends Iterator<T, TReturn, TNext> {
  [Symbol.iterator](): IterableIteratorFns<T, TReturn, TNext>;
}

export type GeneratorFunctionFns<
  TArgs extends unknown[],
  T,
  TReturn = any,
  TNext = undefined
> = (...args: TArgs) => Generator<T, TReturn, TNext>;

export interface AsyncIterableFns<T, TReturn = any, TNext = undefined>
  extends AsyncIterable<T> {
  [Symbol.asyncIterator](): AsyncIterator<T, TReturn, TNext>;
}

export interface AsyncIterableIteratorFns<T, TReturn = any, TNext = undefined>
  extends AsyncIterator<T, TReturn, TNext> {
  [Symbol.asyncIterator](): AsyncIterableIteratorFns<T, TReturn, TNext>;
}

/**
 * Calls the generator function with the passed args, captures returned
 * Generator object and calls the next method one time then returns the
 * Generator object.
 * */
export const generatorInit = <
  TArgs extends unknown[],
  T,
  TReturn = any,
  TNext = undefined
>(
  genFn: GeneratorFunctionFns<TArgs, T, TReturn, TNext>,
  ...args: TArgs
): Generator<T, TReturn, TNext> => {
  const gen = genFn(...args);
  gen.next();
  return gen;
};

export const iterateIteratorResults = function* <
  T,
  TReturn = any,
  TNext = undefined
>(
  iterable: IterableFns<T, TReturn, TNext>
): IterableIteratorFns<IteratorResult<T, TReturn>, any, TNext> {
  const iterator = iterable[Symbol.iterator]();
  let result = iterator.next();
  while (!result.done) {
    const next = yield result;
    result = iterator.next(next);
  }
  yield result;
};

export const cbWithReturn = function* <T, TReturn = any, TNext = undefined>(
  iterable: IterableFns<T, TReturn, TNext>,
  cb: (value: TReturn, returnResult?: IteratorReturnResult<TReturn>) => void
): IterableIteratorFns<T, TReturn, TNext> {
  const iterator = iterable[Symbol.iterator]();
  let result = iterator.next();
  while (result.done === false) {
    const next = yield result.value;
    result = iterator.next(next);
  }
  cb(result.value, result);
  return result.value;
};

export const resolveWithAsyncReturn = <T, TReturn = any, TNext = undefined>(
  iterable: AsyncIterableFns<T, TReturn, TNext>
): [AsyncIterableIteratorFns<T, TReturn, TNext>, Promise<TReturn>] => {
  let resolve: (value: TReturn) => void;
  let reject: (error) => void;
  const promise = new Promise<TReturn>((_resolve, _reject) => {
    resolve = _resolve;
    reject = _reject;
  });
  return [
    (async function* () {
      try {
        const iterator = iterable[Symbol.asyncIterator]();
        let result = await iterator.next();
        while (result.done === false) {
          const next = yield result.value;
          result = await iterator.next(next);
        }

        resolve(result.value);
        return result.value;
      } catch (error) {
        reject(error);
        throw error;
      }
    })(),
    promise,
  ] as [AsyncIterableIteratorFns<T, TReturn, TNext>, Promise<TReturn>];
};

export const iterateAsyncIteratorResults = async function* <
  T,
  TReturn = any,
  TNext = undefined
>(
  iterable: AsyncIterableFns<T, TReturn, TNext>
): AsyncIterableIteratorFns<IteratorResult<T, TReturn>> {
  const iterator = iterable[Symbol.asyncIterator]();
  let result = await iterator.next();
  while (!result.done) {
    const next = yield result;
    result = await iterator.next(next);
  }
  yield result;
};

const _iterableToAsyncIterable_ = async function* <
  T,
  TReturn = any,
  TNext = undefined
>(
  iterable: IterableFns<T, TReturn, TNext>
): AsyncIterableIteratorFns<T, TReturn, TNext> {
  const iterator = iterable[Symbol.iterator]();
  let result = iterator.next();
  while (result.done === false) {
    const next = yield result.value;
    result = iterator.next(next);
  }

  return result.value;
};

export const iterableToAsyncIterable = function <
  T,
  TReturn = any,
  TNext = undefined
>(
  iterable: IterableFns<T, TReturn, TNext> | AsyncIterableFns<T, TReturn, TNext>
): AsyncIterableFns<T, TReturn, TNext> {
  // Already an async iterable
  if (Symbol.asyncIterator in iterable) {
    return iterable as AsyncIterableFns<T, TReturn, TNext>;
  }

  return _iterableToAsyncIterable_(iterable as IterableFns<T, TReturn, TNext>);
};

export type IterateOwnKeysValuesIterableIterator<
  TObj extends object
> = IterableIterator<[keyof TObj, TObj[keyof TObj]]>;

const hasOwnProperty = Object.prototype.hasOwnProperty;

export const iterateOwnKeys = function* <TObj extends object>(
  obj: TObj
): IterableIterator<keyof TObj> {
  for (const key in obj) {
    if (hasOwnProperty.call(obj, key)) {
      yield key;
    }
  }
};

export const iterateOwnKeyValues = function* <TObj extends object>(
  obj: TObj
): IterateOwnKeysValuesIterableIterator<TObj> {
  for (const key of iterateOwnKeys<TObj>(obj)) {
    if (hasOwnProperty.call(obj, key)) {
      yield [key, obj[key]];
    }
  }
};

export type ChainableGeneratorFunction<
  TArgs extends unknown[],
  T,
  TReturn = any
> = (
  iterable: IterableFns<T, TReturn>,
  ...args: TArgs
) => Generator<T, TReturn>;

/**
 * NOTE: First element of return type `TReturn[]` is always the return type
 * from @param srcIterable
 */
export const generatorChain = function* <
  TArgs extends unknown[],
  T,
  TReturn = any
>(
  srcIterable: IterableFns<T, TReturn>,
  generators: Iterable<ChainableGeneratorFunction<TArgs, T, TReturn>>,
  ...args: TArgs
): IterableIteratorFns<T, TReturn[]> {
  const returnResults: TReturn[] = [];
  const captureReturnCb = (returnValue: TReturn) =>
    void returnResults.push(returnValue);

  yield* (() => {
    let iterableIterator = cbWithReturn<T, TReturn>(
      srcIterable,
      captureReturnCb
    );
    for (const gen of generators) {
      iterableIterator = cbWithReturn<T, TReturn>(
        gen(iterableIterator, ...args),
        captureReturnCb
      );
    }
    return iterableIterator;
  })();

  return returnResults;
};

export type ChainableAsyncGeneratorFunction<
  TArgs extends unknown[],
  T,
  TReturn = any
> = (
  iterable: AsyncIterableFns<T, TReturn>,
  ...args: TArgs
) => AsyncIterableIteratorFns<T, TReturn>;

/**
 * NOTE: First element of return type `TReturn[]` is always the return type
 * from @param srcIterable
 */
export const asyncGeneratorChain = async function* <
  TArgs extends unknown[],
  T,
  TReturn = any
>(
  srcIterable: AsyncIterableFns<T, TReturn>,
  generators: Iterable<ChainableAsyncGeneratorFunction<TArgs, T, TReturn>>,
  ...args: TArgs
): AsyncIterableIteratorFns<T, TReturn[]> {
  const returnResults: Promise<TReturn>[] = [];

  const asyncIterableIterator = (() => {
    let [asyncIterableIterator, returnPromise] = resolveWithAsyncReturn(
      srcIterable
    );

    returnResults.push(returnPromise);

    for (const gen of generators) {
      [asyncIterableIterator, returnPromise] = resolveWithAsyncReturn(
        gen(asyncIterableIterator, ...args)
      );
      returnResults.push(returnPromise);
    }
    return asyncIterableIterator;
  })();

  for await (const result of asyncIterableIterator) {
    yield result;
  }

  return Promise.all(returnResults);
};
