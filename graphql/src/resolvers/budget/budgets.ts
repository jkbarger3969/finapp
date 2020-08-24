import { ObjectId } from "mongodb";

import {
  BudgetsWhereInput as Where,
  BudgetsWhereOwner,
  BudgetsWhereYear,
  QueryResolvers,
  BudgetOwnerType,
} from "../../graphTypes";
import { Context, NodeValue } from "../../types";
import filterQueryCreator, {
  FieldAndConditionGenerator,
} from "../utils/filterQuery/filter";
import parseOps from "../utils/filterQuery/querySelectors/parseOps";
import parseComparisonOps from "../utils/filterQuery/querySelectors/parseComparisonOps";
import { OpsParser } from "../utils/filterQuery/querySelectors/types";
import gqlMongoRational from "../utils/filterQuery/gqlMongoRational";
import {
  iterateOwnKeyValues,
  resolveWithAsyncReturn,
} from "../../utils/iterableFns";
import { addId } from "../utils/mongoUtils";
import { Returns as BudgetReturns } from "./budget";

const deptNode = new ObjectId("5dc4addacf96e166daaa008f");
const bizNode = new ObjectId("5dc476becf96e166daa9fd0b");

const parseWhereBudgetYear: Readonly<OpsParser<BudgetsWhereYear, Context>[]> = [
  parseComparisonOps((opVal) => opVal),
] as const;

export type Returns = BudgetReturns[];

const parseWhereBudgetOwner: Readonly<
  OpsParser<BudgetsWhereOwner, Context>[]
> = [
  // Convert all BudgetOwnerInput(s) to NodeValue(s)
  parseComparisonOps<BudgetsWhereOwner, Context>((opVal):
    | NodeValue
    | NodeValue[] => {
    if (opVal) {
      return Array.isArray(opVal)
        ? opVal.map((opVal) => ({
            id: new ObjectId(opVal.id),
            node: opVal.type === BudgetOwnerType.Business ? bizNode : deptNode,
          }))
        : {
            id: new ObjectId(opVal.id),
            node: opVal.type === BudgetOwnerType.Business ? bizNode : deptNode,
          };
    }
  }),
] as const;

const parseWhereBudgetId: Readonly<OpsParser<Where, Context>[]> = [
  parseComparisonOps<Where, Context>((opVal, op) => {
    switch (op) {
      case "eq":
      case "ne":
        return new ObjectId(opVal as Where[typeof op]);
      case "in":
      case "nin":
        return (opVal as Where[typeof op]).map((id) => new ObjectId(id));
      default:
        return opVal;
    }
  }),
] as const;

const fieldConditionGenerator: FieldAndConditionGenerator<
  Where,
  Context
> = async function* (keyValueIterator, opts) {
  const [asyncIterator, asyncReturn] = resolveWithAsyncReturn(
    parseOps(true, keyValueIterator, parseWhereBudgetId, opts)
  );

  for await (const [key, value] of asyncIterator) {
    switch (key) {
      case "amount":
        if (value) {
          const fieldCond = gqlMongoRational(
            value as Where[typeof key],
            "amount"
          );
          if (fieldCond) {
            yield fieldCond;
          }
        }
        break;
      case "owner": {
        const condition = await parseOps(
          false,
          iterateOwnKeyValues(value as Where[typeof key]),
          parseWhereBudgetOwner,
          opts
        );
        yield {
          field: "owner",
          condition,
        };
        break;
      }
      case "year": {
        const condition = await parseOps(
          false,
          iterateOwnKeyValues(value as Where[typeof key]),
          parseWhereBudgetYear,
          opts
        );
        yield {
          field: "year",
          condition,
        };
        break;
      }
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

const budgets: QueryResolvers["budgets"] = async (
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

      const $match = await filterQueryCreator(
        args.where,
        fieldConditionGenerator,
        context
      );

      pipeline.push({ $match });
    })(),
  ]);

  pipeline.push(addId);

  return context.db.collection("budgets").aggregate(pipeline).toArray();
};

export default budgets;
