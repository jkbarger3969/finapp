import { ObjectId } from "mongodb";

import {
  BudgetsWhereInput as Where,
  BudgetsWhereOwner,
  FiscalYearWhereInput,
  QueryResolvers,
  BudgetOwnerType,
} from "../../graphTypes";
import { Context, NodeValue } from "../../types";
import filterQueryCreator, {
  FieldAndConditionGenerator,
  FieldAndCondition,
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
import { comparisonOpsMapper } from "../utils/filterQuery/operatorMapping/comparison";
import { fieldAndCondGen as fiscalYearFieldAndCondGen } from "../fiscalYear/fiscalYears";
import { GraphQLResolveInfo } from "graphql";

const deptNode = new ObjectId("5dc4addacf96e166daaa008f");
const bizNode = new ObjectId("5dc476becf96e166daa9fd0b");

const parseWhereFiscalYear = async (
  whereFiscalYear: FiscalYearWhereInput,
  context: Context
): Promise<FieldAndCondition> => {
  const $match = await filterQueryCreator(
    whereFiscalYear,
    fiscalYearFieldAndCondGen,
    context
  );

  const fiscalYearIds: ObjectId[] = (
    await context.db
      .collection("fiscalYears")
      .aggregate<{ _id: ObjectId }>([{ $match }, { $project: { _id: true } }])
      .toArray()
  ).map(({ _id }) => _id);

  return {
    field: "fiscalYear",
    condition: { $in: fiscalYearIds },
  };
};

export type Returns = BudgetReturns[];

const parseWhereBudgetOwner = function* (
  whereBudgetOwnerIter: Iterable<
    [keyof BudgetsWhereOwner, BudgetsWhereOwner[keyof BudgetsWhereOwner]]
  >
): IterableIterator<FieldAndCondition<unknown>> {
  for (const [op, opValue] of whereBudgetOwnerIter) {
    switch (op) {
      case "eq":
        if (opValue) {
          const mongoOp = comparisonOpsMapper(op);
          yield {
            field: "$and",
            condition: [
              {
                "owner.node": {
                  [mongoOp]:
                    (opValue as BudgetsWhereOwner[typeof op]).type ===
                    BudgetOwnerType.Business
                      ? bizNode
                      : deptNode,
                },
              },
              {
                "owner.id": {
                  [mongoOp]: new ObjectId(
                    (opValue as BudgetsWhereOwner[typeof op]).id
                  ),
                },
              },
            ],
          };
        }
        break;
      case "ne":
        if (opValue) {
          const mongoOp = comparisonOpsMapper(op);
          yield {
            field: "$or",
            condition: [
              {
                "owner.node": {
                  [mongoOp]:
                    (opValue as BudgetsWhereOwner[typeof op]).type ===
                    BudgetOwnerType.Business
                      ? bizNode
                      : deptNode,
                },
              },
              {
                "owner.id": {
                  [mongoOp]: new ObjectId(
                    (opValue as BudgetsWhereOwner[typeof op]).id
                  ),
                },
              },
            ],
          };
        }
        break;
      case "in":
        if (opValue) {
          const orArr: unknown[] = [];

          for (const { field, condition } of parseWhereBudgetOwner(
            (function* () {
              for (const opV of opValue as BudgetsWhereOwner[typeof op]) {
                yield ["eq", opV] as [
                  keyof BudgetsWhereOwner,
                  BudgetsWhereOwner[keyof BudgetsWhereOwner]
                ];
              }
            })()
          )) {
            orArr.push({ [field]: condition });
          }

          yield { field: "$or", condition: orArr };
        }
        break;
      case "nin":
        if (opValue) {
          const andArr: unknown[] = [];

          for (const { field, condition } of parseWhereBudgetOwner(
            (function* () {
              for (const opV of opValue as BudgetsWhereOwner[typeof op]) {
                yield ["ne", opV] as [
                  keyof BudgetsWhereOwner,
                  BudgetsWhereOwner[keyof BudgetsWhereOwner]
                ];
              }
            })()
          )) {
            andArr.push({ [field]: condition });
          }

          yield { field: "$and", condition: andArr };
        }
        break;
    }
  }
};

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

const parseWhereDepartment = async (
  deptId: Where["department"],
  context: Context
): Promise<FieldAndCondition> => {
  const fiscalYears = (
    await context.db
      .collection("fiscalYears")
      .find<{ _id: ObjectId }>({}, { projection: { _id: true } })
      .toArray()
  ).reduce(
    (fiscalYears, { _id }) => fiscalYears.add(_id.toHexString()),
    new Set<string>()
  );

  const deptBudgets: ObjectId[] = [];

  let node = deptNode;
  let id = new ObjectId(deptId);

  await context.db
    .collection("budgets")
    .find<{
      _id: ObjectId;
      fiscalYear: ObjectId;
    }>(
      {
        $and: [
          { "owner.node": { $eq: node } },
          { "owner.id": { $eq: id } },
          {
            fiscalYear: {
              $in: Array.from(fiscalYears).map((id) => new ObjectId(id)),
            },
          },
        ],
      },
      { projection: { _id: true, fiscalYear: true } }
    )
    .forEach(({ _id, fiscalYear }) => {
      fiscalYears.delete(fiscalYear.toHexString());
      deptBudgets.push(_id);
    });

  while (fiscalYears.size > 0 && node.equals(deptId)) {
    const result = (
      await context.db
        .collection("departments")
        .find<{ parent: NodeValue }>(
          { _id: id },
          { projection: { parent: true } }
        )
        .toArray()
    )[0];

    if (!result) {
      break;
    }

    ({
      parent: { id, node },
    } = result);

    await context.db
      .collection("budgets")
      .find<{
        _id: ObjectId;
        fiscalYear: ObjectId;
      }>(
        {
          $and: [
            { "owner.node": { $eq: node } },
            { "owner.id": { $eq: id } },
            {
              fiscalYear: {
                $in: Array.from(fiscalYears).map((id) => new ObjectId(id)),
              },
            },
          ],
        },
        { projection: { _id: true, fiscalYear: true } }
      )
      .forEach(({ _id, fiscalYear }) => {
        fiscalYears.delete(fiscalYear.toHexString());
        deptBudgets.push(_id);
      });
  }

  return {
    field: "$and",
    condition: [{ _id: { $in: deptBudgets } }],
  } as const;
};

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
      case "owner":
        if (value) {
          yield* parseWhereBudgetOwner(
            iterateOwnKeyValues(value as Where[typeof key])
          );
        }
        break;
      case "fiscalYear":
        if (value) {
          yield parseWhereFiscalYear(value as Where[typeof key], opts);
        }
        break;
      case "department":
        if (value) {
          yield parseWhereDepartment(value as Where[typeof key], opts);
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
