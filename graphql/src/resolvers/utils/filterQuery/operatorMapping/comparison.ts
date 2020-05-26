import { QuerySelector } from "mongodb";

import {
  MongoOpsMap,
  QuerySelectorGenerator,
  OperatorValueTransmutator,
} from "../querySelector";

export type ComparisonMongoOpsMap = MongoOpsMap<
  MongoComparisonOperators,
  {
    eq: "$eq";
    gt: "$gt";
    gte: "$gte";
    in: "$in";
    lt: "$lt";
    lte: "$lte";
    ne: "$ne";
    nin: "$nin";
  }
>;

export type ComparisonOperators = keyof ComparisonMongoOpsMap;

export type MongoComparisonOperators = keyof Pick<
  QuerySelector<unknown>,
  "$eq" | "$gt" | "$gte" | "$in" | "$lt" | "$lte" | "$ne" | "$nin"
>; // Using keyof Pick ensures keys actually exists on QuerySelector

const comparisonQueryGenerator = <TOpValue, TReturn>(
  opValueTransmutator: OperatorValueTransmutator<
    TOpValue,
    TReturn,
    ComparisonMongoOpsMap,
    ComparisonOperators
  > = (arg: any) => arg
): QuerySelectorGenerator<ComparisonOperators | string, TOpValue, TReturn> =>
  function*(opValues, querySelector) {
    const promises: Promise<void>[] = [];

    for (const [op, opValue] of opValues) {
      let comparisonOp: MongoComparisonOperators | null = null;
      let result: typeof comparisonOp extends null
        ? void
        : ReturnType<typeof opValueTransmutator>;

      switch (op) {
        case "eq": {
          result = opValueTransmutator(opValue, op);
          comparisonOp = "$eq";
          break;
        }
        case "gt":
          comparisonOp = "$gt";
          result = opValueTransmutator(opValue, op);
          break;
        case "gte":
          comparisonOp = "$gte";
          result = opValueTransmutator(opValue, op);
          break;
        case "in":
          comparisonOp = "$in";
          result = opValueTransmutator(opValue, op);
          break;
        case "lt":
          comparisonOp = "$lt";
          result = opValueTransmutator(opValue, op);
          break;
        case "lte":
          comparisonOp = "$lte";
          result = opValueTransmutator(opValue, op);
          break;
        case "ne":
          comparisonOp = "$ne";
          result = opValueTransmutator(opValue, op);
          break;
        case "nin":
          comparisonOp = "$nin";
          result = opValueTransmutator(opValue, op);
          break;
        default:
          yield [op, opValue];
      }

      if (comparisonOp === null) {
        continue;
      } else if (result instanceof Promise) {
        promises.push(
          (async () => {
            querySelector[comparisonOp] = (await result) as any;
          })()
        );
      } else {
        querySelector[comparisonOp] = result as any;
      }
    }

    if (promises.length > 0) {
      return Promise.all(promises).then(() => void undefined);
    }
  };

export default comparisonQueryGenerator;
