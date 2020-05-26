import { ObjectID, Db, QuerySelector } from "mongodb";

import { stages } from "./utils";
import {
  QueryResolvers,
  JournalEntiresWhereInput as Where,
  JournalEntriesWhereDepartment,
  JournalEntry,
} from "../../graphTypes";
import { Context } from "../../types";

import filterQueryCreator, {
  FieldAndConditionGenerator,
} from "../utils/filterQuery/filter";
import parseOps from "../utils/filterQuery/querySelectors/parseOps";
import parseComparisonOps from "../utils/filterQuery/querySelectors/parseComparisonOps";
import { OpsParser } from "../utils/filterQuery/querySelectors/types";
import { iterateOwnKeyValues } from "../../utils/iterableFns";

// Where condition parsing
const dateOpParsers: Readonly<OpsParser[]> = [
  parseComparisonOps((dateStr: string | string[]) =>
    Array.isArray(dateStr)
      ? dateStr.map((dateStr) => new Date(dateStr))
      : new Date(dateStr)
  ),
] as const;

const idOpParsers: Readonly<OpsParser[]> = [
  parseComparisonOps((id: string | string[]) =>
    Array.isArray(id) ? id.map((id) => new ObjectID(id)) : new ObjectID(id)
  ),
] as const;

// Returns an array of all passed dept ids and their children.
const getDeptDecedentIds = async (
  db: Db,
  deptIds: string[],
  decedentsMap: Map<string, Promise<string[]>>
): Promise<string[]> => {
  const returnIds = new Set<string>();

  for (const deptId of deptIds) {
    // AddSelf
    returnIds.add(deptId);

    if (!decedentsMap.has(deptId)) {
      const decedentIds = getDeptDecedentIds(
        db,
        (
          await db
            .collection("departments")
            .aggregate<{ childId: ObjectID }>([
              { $match: { "parent.id": new ObjectID(deptId) } },
              {
                $project: {
                  childId: "$_id",
                },
              },
            ])
            .toArray()
        ).map(({ childId }) => childId.toHexString()),
        decedentsMap
      );

      decedentsMap.set(deptId, decedentIds);
    }

    for (const decedentId of await decedentsMap.get(deptId)) {
      returnIds.add(decedentId);
    }
  }

  return Array.from(returnIds.values());
};

const parseMatchDeptDecedents: OpsParser = async function*(
  opValues,
  querySelector,
  context: Context
) {
  // Used by "getDeptDecedentIds" to avoid duplicate decedent tree lookups
  const decedentsMap = new Map<string, Promise<string[]>>();

  // "eq" and "ne" must be converted to "in" and "nin"
  const yieldOpUpdates = new Map<"in" | "nin", Set<string>>();

  for await (const [op, opValue] of opValues) {
    switch (op as keyof JournalEntriesWhereDepartment) {
      case "eq":
      case "in":
        {
          const inIds = yieldOpUpdates.get("in") || new Set<string>();

          for (const id of await getDeptDecedentIds(
            context.db,
            Array.isArray(opValue) ? opValue : [opValue],
            decedentsMap
          )) {
            inIds.add(id);
          }

          yieldOpUpdates.set("in", inIds);
        }
        break;
      case "ne":
      case "nin":
        {
          const ninIds = yieldOpUpdates.get("nin") || new Set<string>();

          for (const id of await getDeptDecedentIds(
            context.db,
            Array.isArray(opValue) ? opValue : [opValue],
            decedentsMap
          )) {
            ninIds.add(id);
          }

          yieldOpUpdates.set("nin", ninIds);
        }
        break;
      default:
        yield [op, opValue];
    }
  }

  for (const [op, deptIds] of yieldOpUpdates) {
    yield [op, Array.from(deptIds)];
  }

  return querySelector;
};

const fieldAndConditionGenerator: FieldAndConditionGenerator<Where> = async function*(
  key,
  val,
  opts: Context
) {
  switch (key) {
    case "deleted":
      yield {
        field: "deleted.0.value",
        condition: { $eq: val as Where[typeof key] },
      };
      break;
    case "department": {
      const field = "department.0.value.id";

      const condition = (val as Where[typeof key]).matchDecedentTree
        ? await parseOps(
            false,
            iterateOwnKeyValues(val as Where[typeof key]),
            [parseMatchDeptDecedents, ...idOpParsers],
            opts
          )
        : await parseOps(
            false,
            iterateOwnKeyValues(val as Where[typeof key]),
            idOpParsers
          );
      yield {
        field,
        condition,
      };
      break;
    }
    case "lastUpdate": {
      const condition = await parseOps(
        false,
        iterateOwnKeyValues(val as Where[typeof key]),
        dateOpParsers
      );
      yield {
        field: "lastUpdate",
        condition,
      };
      break;
    }
    case "lastUpdateRefund": {
      const condition = await parseOps(
        false,
        iterateOwnKeyValues(val as Where[typeof key]),
        dateOpParsers
      );
      yield {
        field: "refunds.lastUpdate",
        condition,
      };
      break;
    }
    case "reconciled": {
      yield {
        field: "reconciled.0.value",
        condition: { $eq: val as Where[typeof key] },
      };
    }
  }
};

const journalEntries: QueryResolvers["journalEntries"] = async (
  parent,
  args,
  context,
  info
) => {
  const { db } = context;

  const pipeline: object[] = [];

  const { where } = args;

  if (where) {
    const $match = await filterQueryCreator(
      where,
      fieldAndConditionGenerator,
      context
    );

    pipeline.push({ $match });
  }

  pipeline.push(stages.entryAddFields, stages.entryTransmutations);

  const results = await db
    .collection<JournalEntry>("journalEntries")
    .aggregate(pipeline)
    .toArray();

  return results;
};

export default journalEntries;
