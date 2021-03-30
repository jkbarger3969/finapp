import { ObjectId } from "mongodb";

import { QueryResolvers } from "../../graphTypes";
import { stages } from "./utils";

const addFields = {
  $addFields: {
    refunds: stages.entryAddFields.$addFields.refunds,
  },
} as const;
const transmutateFields = {
  $addFields: {
    refunds: stages.entryTransmutations.$addFields.refunds,
  },
} as const;

const entryRefund: QueryResolvers["entryRefund"] = async (
  obj,
  args,
  context,
  info
) => {
  const { id } = args;

  const { db } = context;

  const refundId = new ObjectId(id);

  const [refundEntry] = await db
    .collection("journalEntries")
    .aggregate([
      { $match: { "refunds.id": refundId } },
      { $limit: 1 },
      {
        $project: {
          refunds: {
            $filter: {
              input: "$refunds",
              as: "refund",
              cond: { $eq: ["$$refund.id", refundId] },
            },
          },
        },
      },
      addFields,
      transmutateFields,
      { $unwind: "$refunds" },
      { $replaceRoot: { newRoot: "$refunds" } },
    ])
    .toArray();

  return refundEntry;
};

export default entryRefund;
