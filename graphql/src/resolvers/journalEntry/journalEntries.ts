import { ObjectId } from "mongodb";

import { stages } from "./utils";
import {
  QueryResolvers,
  JournalEntiresWhereInput as Where,
  JournalEntriesWhereDepartment,
  JournalEntriesWhereCategory,
  JournalEntriesWherePaymentMethod,
  JournalEntry,
  JournalEntriesSourceInput,
  JournalEntrySourceType,
} from "../../graphTypes";
import { Context, NodeValue } from "../../types";

import filterQueryCreator, {
  FieldAndConditionGenerator,
} from "../utils/filterQuery/filter";
import parseOps from "../utils/filterQuery/querySelectors/parseOps";
import parseComparisonOps from "../utils/filterQuery/querySelectors/parseComparisonOps";
import { OpsParser } from "../utils/filterQuery/querySelectors/types";
import dateOpsParser from "../utils/filterQuery/dateOpsParser";
import {
  iterateOwnKeyValues,
  resolveWithAsyncReturn,
} from "../../utils/iterableFns";
import gqlMongoRational from "../utils/filterQuery/gqlMongoRational";

const deptNode = new ObjectId("5dc4addacf96e166daaa008f");
const bizNode = new ObjectId("5dc476becf96e166daa9fd0b");
const personNode = new ObjectId("5dc476becf96e166daa9fd0a");

// Where condition parsing
type WhereId =
  | JournalEntriesWhereDepartment
  | JournalEntriesWhereCategory
  | JournalEntriesWherePaymentMethod;

const idOpParsers: Readonly<OpsParser<WhereId>[]> = [
  parseComparisonOps<WhereId>((id: string | string[]) =>
    Array.isArray(id) ? id.map((id) => new ObjectId(id)) : new ObjectId(id)
  ),
] as const;

const parseWhereJournalEntrySource: Readonly<OpsParser<Where["source"]>[]> = [
  parseComparisonOps<Where["source"]>((opVal, op): NodeValue | NodeValue[] => {
    switch (op) {
      case "in":
      case "nin":
        return (opVal as JournalEntriesSourceInput[]).map((opVal) => ({
          id: new ObjectId((opVal as JournalEntriesSourceInput).id),
          node: (() => {
            switch ((opVal as JournalEntriesSourceInput).type) {
              case JournalEntrySourceType.Business:
                return bizNode;
              case JournalEntrySourceType.Department:
                return deptNode;
              case JournalEntrySourceType.Person:
                return personNode;
            }
          })(),
        }));
      default:
        return {
          id: new ObjectId((opVal as JournalEntriesSourceInput).id),
          node: (() => {
            switch ((opVal as JournalEntriesSourceInput).type) {
              case JournalEntrySourceType.Business:
                return bizNode;
              case JournalEntrySourceType.Department:
                return deptNode;
              case JournalEntrySourceType.Person:
                return personNode;
            }
          })(),
        };
    }
  }),
];

const parseWhereJournalEntryId: Readonly<OpsParser<Where, Context>[]> = [
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

const NULLISH = Symbol();

const fieldAndConditionGen: FieldAndConditionGenerator<
  Where,
  Context
> = async function* (keyValueIterator, opts: Context) {
  const [asyncIterator, asyncReturn] = resolveWithAsyncReturn(
    parseOps(true, keyValueIterator, parseWhereJournalEntryId, opts)
  );

  for await (const [key, value] of asyncIterator) {
    switch (key) {
      case "deleted":
        if ((value ?? NULLISH) !== NULLISH) {
          yield {
            field: "deleted.0.value",
            condition: { $eq: value as Where[typeof key] },
          };
        }
        break;
      case "department":
        if (value) {
          const field = "department.0.value.id";

          const condition = await parseOps(
            false,
            iterateOwnKeyValues(value as Where[typeof key]),
            idOpParsers,
            opts
          );
          yield {
            field,
            condition,
          };
        }
        break;
      case "category":
        if (value) {
          const field = "category.0.value.id";

          const condition = await parseOps(
            false,
            iterateOwnKeyValues(value as Where[typeof key]),
            idOpParsers,
            opts
          );
          yield {
            field,
            condition,
          };
        }
        break;
      case "paymentMethod":
        if (value) {
          const field = "paymentMethod.0.value.id";

          const condition = await parseOps(
            false,
            iterateOwnKeyValues(value as Where[typeof key]),
            idOpParsers,
            opts
          );
          yield {
            field,
            condition,
          };
        }
        break;
      case "total":
        if (value) {
          const fieldCond = gqlMongoRational(value as Where[typeof key], [
            "total.value",
            0,
          ]);
          if (fieldCond) {
            yield fieldCond;
          }
        }
        break;
      case "source":
        if (value) {
          const field = "source.0.value";

          const condition = await parseOps(
            false,
            iterateOwnKeyValues(value as Where[typeof key]),
            parseWhereJournalEntrySource
          );

          yield {
            field,
            condition,
          };
        }
        break;
      case "date":
        if (value) {
          const field = "date.0.value";
          const condition = await parseOps(
            false,
            iterateOwnKeyValues(value as Where[typeof key]),
            dateOpsParser
          );

          yield {
            field,
            condition,
          };
        }
        break;
      case "lastUpdate":
        if (value) {
          const condition = await parseOps(
            false,
            iterateOwnKeyValues(value as Where[typeof key]),
            dateOpsParser
          );
          yield {
            field: "lastUpdate",
            condition,
          };
        }
        break;
      case "lastUpdateRefund":
        if (value) {
          const condition = await parseOps(
            false,
            iterateOwnKeyValues(value as Where[typeof key]),
            dateOpsParser
          );
          yield {
            field: "refunds.lastUpdate",
            condition,
          };
        }
        break;
      case "lastUpdateItem":
        if (value) {
          const condition = await parseOps(
            false,
            iterateOwnKeyValues(value as Where[typeof key]),
            dateOpsParser
          );
          yield {
            field: "items.lastUpdate",
            condition,
          };
        }
        break;
      case "reconciled":
        if ((value ?? NULLISH) !== NULLISH) {
          yield {
            field: "reconciled.0.value",
            condition: { $eq: value as Where[typeof key] },
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

const journalEntries: QueryResolvers["journalEntries"] = async (
  parent,
  args,
  context,
  info
) => {
  const pipeline: object[] = [];

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

  pipeline.push(stages.entryAddFields, stages.entryTransmutations);

  const results = await context.db
    .collection<JournalEntry>("journalEntries")
    .aggregate(pipeline)
    .toArray();

  return results;
};

export default journalEntries;
