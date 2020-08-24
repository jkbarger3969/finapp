import { QuerySelector } from "mongodb";

import { OpsParser } from "./types";
import {
  AsyncIterableIteratorFns,
  iterateAsyncIteratorResults,
  asyncGeneratorChain,
  resolveWithAsyncReturn,
  iterableToAsyncIterable,
} from "../../../../utils/iterableFns";

// NOTE: Yields unmatched op and OpValues
export const parseOpsGenerator = async function* <
  TopValsDef extends Record<string, unknown>,
  Toptions = unknown
>(
  opValues:
    | AsyncIterable<[keyof TopValsDef, TopValsDef[keyof TopValsDef]]>
    | Iterable<[keyof TopValsDef, TopValsDef[keyof TopValsDef]]>,
  opsParsers: Iterable<OpsParser<TopValsDef, Toptions>>,
  options?: Toptions
): AsyncIterableIteratorFns<
  [keyof TopValsDef, TopValsDef[keyof TopValsDef]],
  QuerySelector<unknown>
> {
  const querySelector: QuerySelector<unknown> = {};

  const [asyncIterator, returnPromise] = resolveWithAsyncReturn(
    asyncGeneratorChain(
      iterableToAsyncIterable(opValues),
      opsParsers,
      querySelector,
      options
    )
  );

  for await (const [op, opValue] of asyncIterator) {
    yield [op, opValue];
  }

  const returnValues = await returnPromise;

  // Do NOT include 1st return elem, asyncGeneratorChain always returns
  // "srcIterable" return at index 0.

  return Object.assign(querySelector, ...returnValues.slice(1));
};

export const parseOpsIgnoreUnmatched = async <
  TopValsDef extends Record<string, unknown>,
  Toptions = unknown
>(
  opValues:
    | AsyncIterable<[keyof TopValsDef, TopValsDef[keyof TopValsDef]]>
    | Iterable<[keyof TopValsDef, TopValsDef[keyof TopValsDef]]>,
  opsParsers: Iterable<OpsParser<TopValsDef, Toptions>>,
  options?: Toptions
): Promise<QuerySelector<unknown>> => {
  for await (const result of iterateAsyncIteratorResults(
    parseOpsGenerator<TopValsDef, Toptions>(opValues, opsParsers, options)
  )) {
    if (result.done) {
      return result.value;
    }
  }
};

export default function parseOps<
  TopValsDef extends Record<string, unknown>,
  Toptions = unknown
>(
  yieldUnmatched: true,
  opValues:
    | AsyncIterable<[keyof TopValsDef, TopValsDef[keyof TopValsDef]]>
    | Iterable<[keyof TopValsDef, TopValsDef[keyof TopValsDef]]>,
  opsParsers: Iterable<OpsParser<TopValsDef, Toptions>>,
  options?: Toptions
): AsyncIterableIteratorFns<
  [keyof TopValsDef, TopValsDef[keyof TopValsDef]],
  QuerySelector<unknown>
>;
export default function parseOps<
  TopValsDef extends Record<string, unknown>,
  Toptions = unknown
>(
  yieldUnmatched: false,
  opValues:
    | AsyncIterable<[keyof TopValsDef, TopValsDef[keyof TopValsDef]]>
    | Iterable<[keyof TopValsDef, TopValsDef[keyof TopValsDef]]>,
  opsParsers: Iterable<OpsParser<TopValsDef, Toptions>>,
  options?: Toptions
): Promise<QuerySelector<unknown>>;
export default function parseOps<
  TopValsDef extends Record<string, unknown>,
  Toptions = unknown
>(
  yieldUnmatched: boolean,
  opValues:
    | AsyncIterable<[keyof TopValsDef, TopValsDef[keyof TopValsDef]]>
    | Iterable<[keyof TopValsDef, TopValsDef[keyof TopValsDef]]>,
  opsParsers: Iterable<OpsParser<TopValsDef, Toptions>>,
  options?: Toptions
):
  | AsyncIterableIteratorFns<
      [keyof TopValsDef, TopValsDef[keyof TopValsDef]],
      QuerySelector<unknown>
    >
  | Promise<QuerySelector<unknown>> {
  return yieldUnmatched
    ? parseOpsGenerator(opValues, opsParsers, options)
    : parseOpsIgnoreUnmatched(opValues, opsParsers, options);
}
