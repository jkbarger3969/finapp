import { ObjectId } from "mongodb";
import { EntryRefundDbRecord } from "../../dataSources/accountingDb/types";

import { QueryResolvers } from "../../graphTypes";
import { whereEntryRefunds, whereEntries } from "./entries";

export const entryRefunds: QueryResolvers["entryRefunds"] = async (
  _,
  { where, entriesWhere },
  { dataSources: { accountingDb } }
) => {
  const pipeline: object[] = [];

  const entriesCollect = accountingDb.getCollection("entries");

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

  if (where) {
    pipeline.push({ $match: await whereEntryRefunds(where, accountingDb.db) });
  }

  pipeline.push({
    $replaceRoot: { newRoot: "$refunds" },
  });

  return entriesCollect.aggregate(pipeline).toArray() as unknown as Promise<
    EntryRefundDbRecord[]
  >;
};
