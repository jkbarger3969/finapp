import { FilterQuery } from "mongodb";

import { QueryResolvers } from "../../graphTypes";
import { whereEntryRefunds } from "./entries";

const getPipeline = (filterQuery: FilterQuery<unknown>): object[] => [
  { $match: filterQuery },
  { $unwind: "$refunds" },
  { $match: filterQuery },
  {
    $project: {
      refunds: true,
    },
  },
];

export const entryRefunds: QueryResolvers["entryRefunds"] = (
  _,
  { where },
  { db }
) => {
  const query = where ? whereEntryRefunds(where, db) : {};

  if (query instanceof Promise) {
    return query
      .then((query) =>
        db.collection("entries").aggregate(getPipeline(query)).toArray()
      )
      .then((entries) => entries.map(({ refunds }) => refunds));
  } else {
    return db
      .collection("entries")
      .aggregate(getPipeline(query))
      .toArray()
      .then((entries) => entries.map(({ refunds }) => refunds));
  }
};
