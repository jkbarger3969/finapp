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

export type OpsParser<
  TopValsDef extends Record<string, unknown>,
  Toption = unknown
> = (
  opValues: AsyncIterable<[keyof TopValsDef, TopValsDef[keyof TopValsDef]]>,
  querySelector: QuerySelector<unknown>,
  opts?: Toption
) => AsyncIterableIteratorFns<
  [keyof TopValsDef, TopValsDef[keyof TopValsDef]],
  QuerySelector<unknown>
>;

export type OpValueParser<
  T = unknown,
  TopValsDef extends Record<string, unknown> = Record<string, unknown>,
  Toptions = unknown
> =
  | ((
      opVal: TopValsDef[keyof TopValsDef],
      op?: keyof TopValsDef,
      options?: Toptions
    ) => T)
  | ((
      opVal: TopValsDef[keyof TopValsDef],
      op?: keyof TopValsDef,
      options?: Toptions
    ) => Promise<T>)
  | ((
      opVal: TopValsDef[keyof TopValsDef],
      op?: keyof TopValsDef,
      options?: Toptions
    ) => T | Promise<T>);
