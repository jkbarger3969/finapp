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

const parseComparisonOps = (
  opValueParser: OpValueParser<unknown, ComparisonOps> = (val, op) => {
    if (op === "in" || op === "nin") {
      return Array.isArray(val) ? val : [val];
    }
    return val;
  }
): OpsParser =>
  async function*(
    opValues: AsyncIterable<[ComparisonOps | string, unknown]>,
    querySelector: QuerySelector<unknown>,
    opts?: unknown
  ): AsyncIterableIteratorFns<[string, unknown], QuerySelector<unknown>> {
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
          yield [op, opVal];
      }
    }

    return querySelector;
  };

export default parseComparisonOps;
