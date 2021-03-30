import { ObjectId } from "mongodb";

import { QueryResolvers } from "../../graphTypes";
import { stages } from "./utils";

const addFields = {
  $addFields: {
    items: stages.entryAddFields.$addFields.items,
  },
} as const;
const transmutateFields = {
  $addFields: {
    items: stages.entryTransmutations.$addFields.items,
  },
} as const;

const entryItem: QueryResolvers["entryItem"] = async (
  obj,
  args,
  context,
  info
) => {
  const { id } = args;

  const { db } = context;

  const itemId = new ObjectId(id);

  const [itemEntry] = await db
    .collection("journalEntries")
    .aggregate([
      { $match: { "items.id": itemId } },
      { $limit: 1 },
      {
        $project: {
          items: {
            $filter: {
              input: "$items",
              as: "item",
              cond: { $eq: ["$$item.id", itemId] },
            },
          },
        },
      },
      addFields,
      transmutateFields,
      { $unwind: "$items" },
      { $replaceRoot: { newRoot: "$items" } },
    ])
    .toArray();

  return itemEntry;
};

export default entryItem;
