import { ObjectId } from "mongodb";

import {
  QueryResolvers,
  FiscalYearWhereInput as Where,
  FiscalYearWhereHasDate,
} from "../../graphTypes";
import { addId } from "../utils/mongoUtils";
import { transmutationStage } from "./utils";
import filterQueryCreator, {
  FieldAndConditionGenerator,
  FieldAndCondition,
} from "../utils/filterQuery/filter";
import { Context } from "vm";
import { OpsParser } from "../utils/filterQuery/querySelectors/types";
import parseComparisonOps from "../utils/filterQuery/querySelectors/parseComparisonOps";
import {
  resolveWithAsyncReturn,
  iterateOwnKeyValues,
} from "../../utils/iterableFns";
import parseOps from "../utils/filterQuery/querySelectors/parseOps";
import parseGQLMongoRegex from "../utils/filterQuery/gqlMongoRegex";
import { json } from "express";

const parseWhereFiscalYearHasDate = function* (
  opValueIter: Iterable<
    [
      keyof FiscalYearWhereHasDate,
      FiscalYearWhereHasDate[keyof FiscalYearWhereHasDate]
    ]
  >
): IterableIterator<FieldAndCondition> {
  for (const [op, opValue] of opValueIter) {
    switch (op) {
      case "eq":
        if (opValue) {
          yield {
            field: "$and",
            condition: [
              {
                begin: {
                  $lte: new Date(opValue as FiscalYearWhereHasDate[typeof op]),
                },
                end: {
                  $gt: new Date(opValue as FiscalYearWhereHasDate[typeof op]),
                },
              },
            ],
          };
        }
        break;
      case "ne":
        if (opValue) {
          yield {
            field: "$and",
            condition: [
              {
                $not: {
                  begin: {
                    $lte: new Date(
                      opValue as FiscalYearWhereHasDate[typeof op]
                    ),
                  },
                  end: {
                    $gt: new Date(opValue as FiscalYearWhereHasDate[typeof op]),
                  },
                },
              },
            ],
          };
        }
        break;
      case "in":
        if (opValue) {
          const $or: unknown[] = [];
          for (const { field, condition } of parseWhereFiscalYearHasDate(
            (function* () {
              for (const opV of opValue as FiscalYearWhereHasDate[typeof op]) {
                yield ["eq", opV] as [
                  keyof FiscalYearWhereHasDate,
                  FiscalYearWhereHasDate[keyof FiscalYearWhereHasDate]
                ];
              }
            })()
          )) {
            $or.push({ [field]: condition });
          }

          yield {
            field: "$and",
            condition: [{ $or }],
          };
        }
        break;
      case "nin":
        if (opValue) {
          const $and: unknown[] = [];
          for (const { field, condition } of parseWhereFiscalYearHasDate(
            (function* () {
              for (const opV of opValue as FiscalYearWhereHasDate[typeof op]) {
                yield ["ne", opV] as [
                  keyof FiscalYearWhereHasDate,
                  FiscalYearWhereHasDate[keyof FiscalYearWhereHasDate]
                ];
              }
            })()
          )) {
            $and.push({ [field]: condition });
          }

          yield {
            field: "$and",
            condition: $and,
          };
        }
        break;
    }
  }
};

const parseWhereFiscalYearId: Readonly<OpsParser<Where, Context>[]> = [
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

export const fieldAndCondGen: FieldAndConditionGenerator<
  Where,
  Context
> = async function* (keyValueIter, opts) {
  const [asyncIterator, asyncReturn] = resolveWithAsyncReturn(
    parseOps(true, keyValueIter, parseWhereFiscalYearId, opts)
  );

  for await (const [key, value] of asyncIterator) {
    switch (key) {
      case "name":
        if (value) {
          yield {
            field: "name",
            condition: parseGQLMongoRegex(value as Where[typeof key]),
          };
        }
        break;
      case "hasDate":
        if (value) {
          yield* parseWhereFiscalYearHasDate(
            iterateOwnKeyValues(value as Where[typeof key])
          );
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

const fiscalYears: QueryResolvers["fiscalYears"] = async (
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
        fieldAndCondGen,
        context
      );
      pipeline.push({ $match });
    })(),
  ]);

  pipeline.push(addId, transmutationStage);

  return context.db.collection("fiscalYears").aggregate(pipeline).toArray();
};

export default fiscalYears;
