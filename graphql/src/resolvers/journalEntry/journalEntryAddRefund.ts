import { ObjectID, InsertOneWriteOpResult } from "mongodb";
import DocHistory from "../utils/DocHistory";
import { userNodeType } from "../utils/standIns";
import { MutationResolvers } from "../../graphTypes";
import { $addFields, merge } from "./utils";
import * as moment from "moment";

const getTotal = {
  $addFields: DocHistory.getPresentValues(["total"]),
} as const;

const totalToDec = {
  $project: { total: { $divide: ["$total.num", "$total.den"] } },
} as const;

const sumRefunds = {
  $group: { _id: null, total: { $sum: "$total" } },
} as const;

const journalEntryAddRefund: MutationResolvers["journalEntryAddRefund"] = async (
  doc,
  args,
  context,
  info
) => {
  const {
    id,
    fields: { date: dateStr, total },
  } = args;

  const reconciled = args.fields.reconciled ?? false;

  const description = (args.fields.description ?? "").trim();

  const { db, user } = context;

  const collection = db.collection("journalEntries");

  const srcEntryId = new ObjectID(id);

  const [{ entryTotal, refundTotal }] = (await collection
    .aggregate([
      {
        $facet: {
          entryTotal: [
            { $match: { _id: srcEntryId } },
            getTotal,
            totalToDec,
            sumRefunds,
          ],
          refundTotal: [
            { $match: { refund: srcEntryId } },
            getTotal,
            totalToDec,
            sumRefunds,
          ],
        },
      },
      {
        $project: {
          entryTotal: {
            $ifNull: [{ $arrayElemAt: ["$entryTotal.total", 0] }, 0],
          },
          refundTotal: {
            $ifNull: [{ $arrayElemAt: ["$refundTotal.total", 0] }, 0],
          },
        },
      },
    ])
    .toArray()) as [{ entryTotal: number; refundTotal: number }];

  // Ensure aggregate refunds do NOT exceed the original transaction amount
  if (entryTotal < refundTotal + total.num / total.den) {
    throw new Error(
      "Refunds cannot total more than original transaction amount."
    );
  }

  const date = moment(dateStr, moment.ISO_8601);
  if (!date.isValid()) {
    throw new Error(`Date "${dateStr}" not a valid ISO 8601 date string.`);
  }

  const docHistory = new DocHistory({ node: userNodeType, id: user.id });

  const refundEntry = {
    refund: srcEntryId,
    date: docHistory.addValue(date.toDate()),
    description: description ? docHistory.addValue(description) : [],
    total: docHistory.addValue(total),
    reconciled: docHistory.addValue(reconciled),
  };

  const { insertedId, insertedCount } = await collection.insertOne(refundEntry);

  if (insertedCount === 0) {
    throw new Error(
      `Failed to add refund entry: "${JSON.stringify(args, null, 2)}".`
    );
  }

  const [result] = await collection
    .aggregate([
      { $match: { _id: { $in: [srcEntryId, insertedId] } } },
      { $addFields },
      { $sort: { refund: -1 } },
      ...merge,
      {
        $addFields: {
          type: {
            $cond: {
              if: { $eq: ["$type", "credit"] },
              then: "debit",
              else: "credit",
            },
          },
        },
      },
    ])
    .toArray();

  return result;
};

export default journalEntryAddRefund;
