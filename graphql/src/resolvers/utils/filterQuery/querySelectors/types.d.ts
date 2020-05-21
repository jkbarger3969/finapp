import { QuerySelector } from "mongodb";

import { AsyncIterableIteratorFns } from "../../../../utils/iterableFns";

export type ValidMongoOps = Exclude<
  keyof QuerySelector<unknown>,
  "$expr" | "$jsonSchema" //These are typed "any"
>;

export type MongoOpsMap<
  TMongoOpsMap extends { [op: string]: ValidMongoOps }
> = {
  [op in keyof TMongoOpsMap]: TMongoOpsMap[op] extends ValidMongoOps
    ? TMongoOpsMap[op]
    : never;
};

export type MongoOpValue<
  TOp extends keyof TMongoOpsMap,
  TReturn,
  TMongoOpsMap extends MongoOpsMap<{ [op: string]: ValidMongoOps }>
> = QuerySelector<TReturn>[TMongoOpsMap[TOp]];

export type OpsParser = (
  opValues: AsyncIterable<[string, unknown]>,
  querySelector: QuerySelector<unknown>,
  opts?: unknown
) => AsyncIterableIteratorFns<[string, unknown], QuerySelector<unknown>>;

export type OpValueParser<T = unknown, Top extends string = string> =
  | ((opVal: unknown, op?: Top, opts?: unknown) => T)
  | ((opVal: unknown, op?: Top, opts?: unknown) => Promise<T>)
  | ((opVal: unknown, op?: Top, opts?: unknown) => T | Promise<T>);
