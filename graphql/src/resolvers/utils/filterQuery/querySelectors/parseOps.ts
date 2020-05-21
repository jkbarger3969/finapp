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
export const parseOpsGenerator = async function*(
  opValues: AsyncIterable<[string, unknown]> | Iterable<[string, unknown]>,
  opsParsers: Iterable<OpsParser>,
  opts?: unknown
): AsyncIterableIteratorFns<[string, unknown], QuerySelector<unknown>> {
  const querySelector: QuerySelector<unknown> = {};

  const [asyncIterator, returnPromise] = resolveWithAsyncReturn(
    asyncGeneratorChain(
      iterableToAsyncIterable(opValues),
      opsParsers,
      querySelector,
      opts
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

export const parseOpsIgnoreUnmatched = async (
  ...args: Parameters<typeof parseOpsGenerator>
) => {
  for await (const result of iterateAsyncIteratorResults(
    parseOpsGenerator(...args)
  )) {
    if (result.done) {
      return result.value;
    }
  }
};

export default function parseOps(
  yieldUnmatched: true,
  ...args: Parameters<typeof parseOpsGenerator>
): ReturnType<typeof parseOpsGenerator>;
export default function parseOps(
  yieldUnmatched: false,
  ...args: Parameters<typeof parseOpsGenerator>
): ReturnType<typeof parseOpsIgnoreUnmatched>;
export default function parseOps(
  yieldUnmatched: boolean,
  ...args: Parameters<typeof parseOpsGenerator>
):
  | ReturnType<typeof parseOpsGenerator>
  | ReturnType<typeof parseOpsIgnoreUnmatched> {
  return yieldUnmatched
    ? parseOpsGenerator(...args)
    : parseOpsIgnoreUnmatched(...args);
}
