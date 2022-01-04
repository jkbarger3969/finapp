import { FilterOperators as QuerySelector } from "mongodb";

import {
  iterateIteratorResults,
  IterableIteratorFns,
} from "../../../utils/iterableFns";

export type ValidMongoOps = Exclude<
  keyof QuerySelector<unknown>,
  "$expr" | "$jsonSchema" //These are typed "any"
>;

export type MongoOpsMap<
  TMongoOps extends ValidMongoOps = ValidMongoOps,
  TMongoOpsMap extends { [op: string]: TMongoOps } = { [op: string]: TMongoOps }
> = {
  [op in keyof TMongoOpsMap]: TMongoOpsMap[op] extends TMongoOps
    ? TMongoOpsMap[op]
    : never;
};

export type MongoOpValue<
  TOp extends keyof TMongoOpsMap,
  TReturn,
  TMongoOpsMap extends MongoOpsMap
> = QuerySelector<TReturn>[TMongoOpsMap[TOp]];

export type OperatorValueTransmuted<
  TReturn,
  TMongoOps extends ValidMongoOps
> = QuerySelector<TReturn>[TMongoOps];

export type OperatorValueTransmutator<
  TOpValue,
  TReturn,
  TMongoOpsMap extends MongoOpsMap,
  TOp extends string
> =
  | ((
      operatorValue: TOpValue,
      operator: TOp
    ) => MongoOpValue<TOp, TReturn, TMongoOpsMap>)
  | ((
      operatorValue: TOpValue,
      operator: TOp
    ) => Promise<MongoOpValue<TOp, TReturn, TMongoOpsMap>>)
  | ((
      operatorValue: TOpValue,
      operator: TOp
    ) =>
      | MongoOpValue<TOp, TReturn, TMongoOpsMap>
      | Promise<MongoOpValue<TOp, TReturn, TMongoOpsMap>>);

export interface QuerySelectorIterableIterator<TOp extends string, TOpValue>
  extends Iterator<[TOp, TOpValue], void | Promise<void>> {
  [Symbol.iterator](): QuerySelectorIterableIterator<TOp, TOpValue>;
}

export interface QuerySelectorGenerator<TOp extends string, TOpValue, TReturn> {
  (
    operatorValues: Iterable<[TOp, TOpValue]>,
    querySelector: QuerySelector<TReturn>
  ): QuerySelectorIterableIterator<TOp, TOpValue>;
}

// Wraps QuerySelectorIterableIterators, yields results, and captures return
// promises from async OperatorValueTransmutator(s) into passed promises array.
const querySelectorIterableIteratorWrapper = function* <
  TOp extends string,
  TOpValue
>(
  querySelectorIterableIterator:
    | QuerySelectorIterableIterator<TOp, TOpValue>
    | IterableIteratorFns<[TOp, TOpValue], void>,
  promises: Promise<void>[]
) {
  for (const result of iterateIteratorResults(querySelectorIterableIterator)) {
    if (result.done === true) {
      if (result.value) {
        promises.push(result.value);
      }
    } else {
      yield result.value;
    }
  }
};

// Generator version of "querySelector" that yields any operator/operator
// values unmatched by the QuerySelectorGenerator(s) and returns the
// QuerySelector or a promise that resolves with the QuerySelector.
// Allows for custom handling of unmatched operators.
export const querySelectorGenerator = function* <
  TCondition extends Object,
  TReturn = unknown
>(
  condition: TCondition,
  querySelectorGenerators: QuerySelectorGenerator<
    Extract<keyof TCondition, string>,
    TCondition[Extract<keyof TCondition, string>],
    TReturn
  >[],
  querySelector: QuerySelector<TReturn>
) {
  const promises: Promise<void>[] = [];

  let querySelectorIterableIterator = querySelectorIterableIteratorWrapper(
    (function* () {
      for (const op in condition) {
        if (!Object.prototype.hasOwnProperty.call(condition, op)) {
          continue;
        }
        yield [op, condition[op]] as [
          Extract<keyof TCondition, string>,
          TCondition[Extract<keyof TCondition, string>]
        ];
      }
    })(),
    promises
  );

  for (const querySelectorGenerator of querySelectorGenerators) {
    querySelectorIterableIterator = querySelectorIterableIteratorWrapper(
      querySelectorGenerator(querySelectorIterableIterator, querySelector),
      promises
    );
  }

  // Yield unmatched operator/operator values
  yield* querySelectorIterableIterator;

  // Wait for async OperatorValueTransmutator(s)
  if (promises.length > 0) {
    return Promise.all(promises).then(() => querySelector);
  }

  return querySelector;
};

const querySelector = <TCondition extends Object, TReturn = unknown>(
  condition: TCondition,
  querySelectorGenerators: QuerySelectorGenerator<
    Extract<keyof TCondition, string>,
    TCondition[Extract<keyof TCondition, string>],
    TReturn
  >[],
  querySelector: QuerySelector<TReturn> = {}
) => {
  const querySelectorIterableIterator = querySelectorGenerator(
    condition,
    querySelectorGenerators,
    querySelector
  );

  let result: ReturnType<typeof querySelectorIterableIterator["next"]>;
  while (!(result = querySelectorIterableIterator.next()).done);

  return result.value as
    | QuerySelector<TReturn>
    | Promise<QuerySelector<TReturn>>;
};

export default querySelector;
