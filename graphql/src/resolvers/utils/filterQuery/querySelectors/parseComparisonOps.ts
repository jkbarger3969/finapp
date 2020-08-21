import { QuerySelector } from "mongodb";

import { MongoOpsMap, OpValueParser, OpsParser } from "./types";
import { AsyncIterableIteratorFns } from "../../../../utils/iterableFns";

export type ComparisonOpsMap = MongoOpsMap<{
  eq: "$eq";
  gt: "$gt";
  gte: "$gte";
  in: "$in";
  lt: "$lt";
  lte: "$lte";
  ne: "$ne";
  nin: "$nin";
}>;

export type ComparisonOps = keyof ComparisonOpsMap;

const parseComparisonOps = <
  TopValsDef extends Record<string, unknown>,
  Toptions = unknown
>(
  opValueParser: OpValueParser<unknown, TopValsDef, Toptions> = (val, op) => {
    if (op === "in" || op === "nin") {
      return Array.isArray(val) ? val : [val];
    }
    return val;
  }
): OpsParser<TopValsDef, Toptions> =>
  async function* (
    opValues: AsyncIterable<
      [ComparisonOps | keyof TopValsDef, TopValsDef[keyof TopValsDef]]
    >,
    querySelector: QuerySelector<unknown>,
    opts?: Toptions
  ): AsyncIterableIteratorFns<
    [keyof TopValsDef, TopValsDef[keyof TopValsDef]],
    QuerySelector<unknown>
  > {
    for await (const [op, opVal] of opValues) {
      switch (op as ComparisonOps) {
        case "eq":
          querySelector.$eq = await opValueParser(
            opVal,
            op as ComparisonOps,
            opts
          );
          break;

        case "gt":
          querySelector.$gt = await opValueParser(
            opVal,
            op as ComparisonOps,
            opts
          );
          break;

        case "gte":
          querySelector.$gte = await opValueParser(
            opVal,
            op as ComparisonOps,
            opts
          );
          break;

        case "in":
          querySelector.$in = (await opValueParser(
            opVal,
            op as ComparisonOps,
            opts
          )) as unknown[];
          break;

        case "lt":
          querySelector.$lt = await opValueParser(
            opVal,
            op as ComparisonOps,
            opts
          );
          break;

        case "lte":
          querySelector.$lte = await opValueParser(
            opVal,
            op as ComparisonOps,
            opts
          );
          break;

        case "ne":
          querySelector.$ne = await opValueParser(
            opVal,
            op as ComparisonOps,
            opts
          );
          break;

        case "nin":
          querySelector.$nin = (await opValueParser(
            opVal,
            op as ComparisonOps,
            opts
          )) as unknown[];
          break;

        default:
          yield [op as keyof TopValsDef, opVal];
      }
    }

    return querySelector;
  };

export default parseComparisonOps;
