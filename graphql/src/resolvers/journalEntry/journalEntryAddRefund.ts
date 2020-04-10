import { ObjectID } from "mongodb";
import DocHistory from "../utils/DocHistory";
import { userNodeType } from "../utils/standIns";
import { MutationResolvers } from "../../graphTypes";
import * as moment from "moment";

import journalEntry from "./journalEntry";

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

  // Total Cannot be less than or equal to zero
  const totalDecimal = total.num / total.den;
  if (totalDecimal <= 0) {
    throw new Error("Refund total must be greater than 0.");
  }

  const { db, user } = context;

  const collection = db.collection("journalEntries");

  const srcEntryId = new ObjectID(id);

  const [{ entryTotal, refundTotal }] = (await collection
    .aggregate([
      { $match: { _id: srcEntryId } },
      {
        $project: {
          entryTotal: {
            $let: {
              vars: {
                total: {
                  $ifNull: [
                    { $arrayElemAt: ["$total.value", 0] },
                    { num: 0, den: 1 },
                  ],
                },
              },
              in: { $divide: ["$$total.num", "$$total.den"] },
            },
          },
          refundTotal: {
            $reduce: {
              input: "$refunds",
              initialValue: 0,
              in: {
                $sum: [
                  "$$value",
                  {
                    $let: {
                      vars: {
                        total: {
                          $ifNull: [
                            { $arrayElemAt: ["$$this.total.value", 0] },
                            { num: 0, den: 1 },
                          ],
                        },
                      },
                      in: { $divide: ["$$total.num", "$$total.den"] },
                    },
                  },
                ],
              },
            },
          },
        },
      },
    ])
    .toArray()) as [{ entryTotal: number; refundTotal: number }];

  // Ensure aggregate refunds do NOT exceed the original transaction amount
  if (entryTotal < refundTotal + totalDecimal) {
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
    id: new ObjectID(),
    date: docHistory.addValue(date.toDate()),
    description: description ? docHistory.addValue(description) : [],
    total: docHistory.addValue(total),
    reconciled: docHistory.addValue(reconciled),
    lastUpdate: docHistory.lastUpdate,
    ...docHistory.rootHistoryObject,
  };

  const { modifiedCount } = await collection.updateOne(
    { _id: srcEntryId },
    {
      $push: {
        refunds: refundEntry,
      },
    }
  );

  if (modifiedCount === 0) {
    throw new Error(
      `Failed to add refund entry: "${JSON.stringify(args, null, 2)}".`
    );
  }

  const result = await journalEntry(doc, { id }, context, info);

  return result;
};

export default journalEntryAddRefund;
