import { ObjectId } from "mongodb";
import Fraction from "fraction.js";
import { isValid } from "date-fns";

import DocHistory from "../utils/DocHistory";
import { MutationResolvers } from "../../graphTypes";
import { entry } from "./entry";
import { getUniqueId } from "../utils/mongoUtils";
import { stages } from "./utils";
import { JOURNAL_ENTRY_UPSERTED } from "./pubSubs";

const addDate = {
  $addFields: {
    ...DocHistory.getPresentValues(["date"]),
  },
} as const;

const entryAddRefund: MutationResolvers["entryAddRefund"] = async (
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
  if (total.s < 0 || total.n === 0) {
    throw new Error("Entry total must be greater than 0.");
  }

  const date = new Date(dateStr);
  if (!isValid(date)) {
    throw new Error(`Date "${dateStr}" not a valid ISO 8601 date string.`);
  }

  const { db, user, nodeMap } = context;

  const docHistory = new DocHistory(user.id);

  const collection = db.collection("journalEntries");

  const srcEntryId = new ObjectId(id);

  const docBuilder = docHistory.newHistoricalDoc(true).addFields([
    ["date", date],
    ["total", total],
    ["reconciled", reconciled],
    ["deleted", false],
  ]);

  if (description) {
    docBuilder.addField("description", description);
  }

  let refundId: ObjectId;
  const asyncOps = [
    // Ensure source entry exists, max refund totals are not exceeded, and
    // that refund date is after entry date
    (async () => {
      const [srcEntryState] = (await collection
        .aggregate([
          { $match: { _id: srcEntryId } },
          addDate,
          stages.entryTotal,
          stages.refundTotals,
          {
            $project: {
              date: true,
              entryTotal: true,
              refundTotals: true,
            },
          },
        ])
        .toArray()) as [
        { date: Date; entryTotal: Fraction; refundTotals: Fraction[] }
      ];

      if (!srcEntryState) {
        throw new Error(`Journal entry "${id}" does not exist.`);
      }

      const entryDate = srcEntryState.date;

      const entryTotal = new Fraction(srcEntryState.entryTotal);

      const refundTotal = srcEntryState.refundTotals.reduce(
        (refundTotal, total) => refundTotal.add(total),
        new Fraction(0)
      );

      // Ensure aggregate refunds do NOT exceed the original transaction amount
      if (entryTotal.compare(refundTotal.add(total)) < 0) {
        throw new Error(
          "Refunds cannot total more than original transaction amount."
        );
      }

      if (date < entryDate) {
        throw new Error("Refund date cannot be before the entry date.");
      }
    })(),
    // Generate refund ID
    (async () => {
      refundId = await getUniqueId("refunds.id", collection);
    })(),
  ];

  await Promise.all(asyncOps);

  const { modifiedCount } = await collection.updateOne(
    { _id: srcEntryId },
    {
      $push: {
        refunds: { id: refundId, ...docBuilder.doc() },
      },
    }
  );

  if (modifiedCount === 0) {
    throw new Error(
      `Failed to add refund entry: "${JSON.stringify(args, null, 2)}".`
    );
  }

  const result = await entry(doc, { id }, context, info);

  return result;
};

export default entryAddRefund;
