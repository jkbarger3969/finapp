import { ObjectId } from "mongodb";
import Fraction from "fraction.js";
import { isValid } from "date-fns";

import DocHistory from "../utils/DocHistory";
import { userNodeType } from "../utils/standIns";
import {
  MutationResolvers,
  PaymentMethod,
  RationalSign,
} from "../../graphTypes";
import journalEntry from "./journalEntry";
import { getUniqueId } from "../utils/mongoUtils";
import { stages } from "./utils";
import paymentMethodAddMutation from "../paymentMethod/paymentMethodAdd";
import { JOURNAL_ENTRY_UPSERTED } from "./pubSubs";
import { rationalToFraction } from "../../utils/rational";

const addDate = {
  $addFields: {
    ...DocHistory.getPresentValues(["date"]),
  },
} as const;

const journalEntryAddRefund: MutationResolvers["journalEntryAddRefund"] = async (
  doc,
  args,
  context,
  info
) => {
  const {
    id,
    fields: { date: dateStr, total: totalR },
    paymentMethodAdd,
  } = args;

  const total = rationalToFraction(totalR);

  const reconciled = args.fields.reconciled ?? false;

  const description = (args.fields.description ?? "").trim();

  // Total Cannot be less than or equal to zero
  if (totalR.s === RationalSign.Neg || totalR.n === 0) {
    throw new Error("Entry total must be greater than 0.");
  }

  const date = new Date(dateStr);
  if (!isValid(date)) {
    throw new Error(`Date "${dateStr}" not a valid ISO 8601 date string.`);
  }

  const { db, user, nodeMap, pubSub } = context;

  const docHistory = new DocHistory({ node: userNodeType, id: user.id });

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

  if (paymentMethodAdd) {
    // Do NOT create new payment method until all other checks pass
    asyncOps.push(
      Promise.all(asyncOps.splice(0)).then(async () => {
        const { id: node } = nodeMap.typename.get("PaymentMethod");

        const id = new ObjectId(
          await (paymentMethodAddMutation(
            doc,
            { fields: paymentMethodAdd },
            {
              ...context,
              ephemeral: {
                ...(context.ephemeral || {}),
                docHistoryDate: docHistory.date,
              },
            },
            info
          ) as Promise<PaymentMethod>).then(({ id }) => id)
        );

        docBuilder.addField("paymentMethod", {
          node: new ObjectId(node),
          id,
        });
      })
    );
  } else {
    // Ensure payment method exists.
    asyncOps.push(
      (async () => {
        const { collection, id: node } = nodeMap.typename.get("PaymentMethod");

        const id = new ObjectId(args.fields.paymentMethod);

        if (
          !(await db
            .collection(collection)
            .findOne({ _id: id }, { projection: { _id: true } }))
        ) {
          throw new Error(
            `Payment method with id ${id.toHexString()} does not exist.`
          );
        }

        docBuilder.addField("paymentMethod", {
          node: new ObjectId(node),
          id,
        });
      })()
    );
  }

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

  const result = await journalEntry(doc, { id }, context, info);

  pubSub
    .publish(JOURNAL_ENTRY_UPSERTED, { journalEntryUpserted: result })
    .catch((error) => console.error(error));

  return result;
};

export default journalEntryAddRefund;
