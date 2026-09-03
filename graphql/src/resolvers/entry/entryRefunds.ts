import { ObjectId } from "mongodb";
import { EntryRefundDbRecord } from "../../dataSources/accountingDb/types";

import { EntryRefundsWhere, QueryResolvers } from "../../graphTypes";
import { Context } from "../../types";
import { getAccessibleDeptIdsWithDescendants } from "../utils/departmentAccess";
import { whereEntryRefunds, whereEntries } from "./entries";

export const entryRefunds: QueryResolvers["entryRefunds"] = async (
  _,
  { where, entriesWhere },
  context
) => {
  const { dataSources: { accountingDb }, authService, user } = context as Context;

  const pipeline: object[] = [];

  const entriesCollect = accountingDb.getCollection("entries");

  const permittedDeptIds = await getAccessibleDeptIdsWithDescendants({
    authService,
    userId: user?.id,
    db: accountingDb.db,
  });

  if (permittedDeptIds) {
    if (permittedDeptIds.length === 0) {
      return [];
    }

    pipeline.push({
      $match: {
        "department.0.value": { $in: permittedDeptIds },
      },
    });
  }

  if (entriesWhere) {
    const entryIds = (
      await entriesCollect
        .find(await whereEntries(entriesWhere, accountingDb.db), {
          projection: { _id: true },
        })
        .toArray()
    ).map(({ _id }) => _id);

    pipeline.push({
      $match: {
        _id: {
          $in: entryIds,
        },
      },
    });
  }

  pipeline.push({ $unwind: "$refunds" });

  // Default to excluding soft-deleted refunds unless the caller explicitly
  // asks for them (e.g. an audit view) - matches Entry.refunds, which
  // always excludes them. Without this, a caller that forgets to filter
  // `deleted` gets every refund ever created for a matching entry back,
  // deleted or not.
  const effectiveWhere: EntryRefundsWhere = { deleted: false, ...(where ?? {}) };
  pipeline.push({ $match: await whereEntryRefunds(effectiveWhere, accountingDb.db) });

  pipeline.push({
    $replaceRoot: { newRoot: "$refunds" },
  });

  return entriesCollect.aggregate(pipeline).toArray() as unknown as Promise<
    EntryRefundDbRecord[]
  >;
};
