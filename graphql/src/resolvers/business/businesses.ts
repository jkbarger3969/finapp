import { ObjectId } from "mongodb";

import {
  QueryResolvers,
  BusinessesWhereInput as Where,
} from "../../graphTypes";
import { addId } from "../utils/mongoUtils";

import { Returns as BusinessReturns } from "./business";
import filterQueryCreator, {
  FieldAndConditionGenerator,
} from "../utils/filterQuery/filter";
import { Context } from "../../types";
import gqlMongoRegex from "../utils/filterQuery/gqlMongoRegex";
import { resolveWithAsyncReturn } from "../../utils/iterableFns";
import parseOps from "../utils/filterQuery/querySelectors/parseOps";
import { OpsParser } from "../utils/filterQuery/querySelectors/types";
import parseComparisonOps from "../utils/filterQuery/querySelectors/parseComparisonOps";

export type Returns = BusinessReturns[];

const parseWhereBusinessId: Readonly<OpsParser<Where, Context>[]> = [
  async function* (opValues, querySelector) {
    for await (const [op, opVal] of opValues) {
      switch (op) {
        case "eq":
        case "ne":
          if (opVal) {
            yield [op, new ObjectId(opVal as Where[typeof op])];
          }
          break;
        case "in":
        case "nin":
          if (opVal) {
            yield [
              op,
              (opVal as Where[typeof op]).map((id) => new ObjectId(id)),
            ];
          }
          break;
        default:
          yield [op, opVal];
      }
    }
    return querySelector;
  } as OpsParser<Where, Context>,
  parseComparisonOps<Where, Context>((opVal) => opVal),
] as const;

const fieldAndConditionGen: FieldAndConditionGenerator<Where> = async function* (
  keyValueIterator,
  opts
) {
  const [asyncIterator, asyncReturn] = resolveWithAsyncReturn(
    parseOps(true, keyValueIterator, parseWhereBusinessId, opts)
  );

  for await (const [key, value] of asyncIterator) {
    switch (key) {
      case "name":
        if (value) {
          yield {
            field: "name",
            condition: gqlMongoRegex(value as Where[typeof key]),
          };
        }
        break;
    }
  }

  const condition = await asyncReturn;

  // Check that operators have been set on condition.
  if (Object.keys(condition).length > 0) {
    yield {
      field: "_id",
      condition,
    };
  }
};

const businesses: QueryResolvers["businesses"] = async (
  parent,
  args,
  context,
  info
) => {
  const pipeline: Record<string, unknown>[] = [];

  await Promise.all([
    (async () => {
      if (!args.where) {
        return;
      }

      const $match = await filterQueryCreator<Where, Context>(
        args.where,
        fieldAndConditionGen,
        context
      );

      pipeline.push({ $match });
    })(),
  ]);

  pipeline.push(addId);

  return context.db.collection("businesses").aggregate(pipeline).toArray();
};

export default businesses;
