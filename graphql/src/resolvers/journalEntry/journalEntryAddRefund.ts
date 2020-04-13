import { ObjectID } from "mongodb";
import * as moment from "moment";

import DocHistory from "../utils/DocHistory";
import { userNodeType } from "../utils/standIns";
import { MutationResolvers } from "../../graphTypes";
import journalEntry from "./journalEntry";
import { getUniqueId } from "../utils/mongoUtils";
import { stages } from "./utils";

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

  const date = moment(dateStr, moment.ISO_8601);
  if (!date.isValid()) {
    throw new Error(`Date "${dateStr}" not a valid ISO 8601 date string.`);
  }

  const { db, user } = context;

  const docHistory = new DocHistory({ node: userNodeType, id: user.id });

  const collection = db.collection("journalEntries");

  const srcEntryId = new ObjectID(id);

  let refundEntryId: ObjectID;

  await Promise.all([
    (async () => {
      // Ensure source entry exists and get entry and refund totals.
      const [srcEntryState] = (await collection
        .aggregate([
          { $match: { _id: srcEntryId } },
          stages.entryTotal,
          stages.refundTotal,
          {
            $project: {
              entryTotal: true,
              refundTotal: true,
            },
          },
        ])
        .toArray()) as [{ entryTotal: number; refundTotal: number }];

      if (!srcEntryState) {
        throw new Error(`Journal Entry "${id}" does not exist.`);
      }

      const { entryTotal, refundTotal } = srcEntryState;

      // Ensure aggregate refunds do NOT exceed the original transaction amount
      if (entryTotal < refundTotal + totalDecimal) {
        throw new Error(
          "Refunds cannot total more than original transaction amount."
        );
      }
    })(),
    (async () => {
      refundEntryId = await getUniqueId("refund.id", collection);
    })(),
  ]);

  const refundEntry = {
    id: refundEntryId,
    date: docHistory.addValue(date.toDate()),
    description: description ? docHistory.addValue(description) : [],
    total: docHistory.addValue(total),
    reconciled: docHistory.addValue(reconciled),
    deleted: docHistory.addValue(false),
    lastUpdate: docHistory.lastUpdate,
    ...docHistory.rootHistoryObject,
  } as const;

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
