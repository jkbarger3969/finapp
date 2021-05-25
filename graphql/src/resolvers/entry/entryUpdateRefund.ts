import { ObjectId } from "mongodb";
import Fraction from "fraction.js";
import { isValid } from "date-fns";

import DocHistory from "../utils/DocHistory";
import { userNodeType } from "../utils/standIns";
import { MutationResolvers, EntryUpdateRefundFields } from "../../graphTypes";
import { entry } from "./entry";
import { stages, getRefundTotals } from "./utils";
import { JOURNAL_ENTRY_UPSERTED } from "./pubSubs";

const NULLISH = Symbol();

const addDate = {
  $addFields: {
    ...DocHistory.getPresentValues(["date"]),
  },
} as const;

const entryUpdateRefund: MutationResolvers["entryUpdateRefund"] = async (
  obj,
  args,
  context,
  info
) => {
  const { id, fields, paymentMethodUpdate } = args;

  const { db, user, nodeMap, pubSub } = context;

  const collection = db.collection("journalEntries");

  const refundId = new ObjectId(id);

  const docHistory = new DocHistory(user.id);

  const updateBuilder = docHistory.updateHistoricalDoc("refunds.$[refund]");

  let entryId: ObjectId;
  const asyncOps = [
    (async () => {
      const [result] = (await collection
        .aggregate([
          { $match: { "refunds.id": refundId } },
          { $limit: 1 },
          {
            $project: {
              entryId: "$_id",
            },
          },
        ])
        .toArray()) as [{ entryId: ObjectId } | undefined];

      if (!result) {
        throw new Error(`Refund "${id}" does not exists.`);
      }

      entryId = result.entryId;
    })(),
  ];

  // Date
  if (fields.date) {
    const date = new Date(fields.date);
    if (!isValid(date)) {
      throw new Error(
        `Date "${fields.date}" not a valid ISO 8601 date string.`
      );
    }

    asyncOps.push(
      (async () => {
        const [result] = (await collection
          .aggregate([
            { $match: { "refunds.id": refundId } },
            { $limit: 1 },
            addDate,
            {
              $project: {
                date: true,
              },
            },
          ])
          .toArray()) as [{ date: Date }];

        if (result && date < result.date) {
          throw new Error("Refund date cannot be before the entry date.");
        }

        updateBuilder.updateField("date", date);
      })()
    );
  }

  // Description
  if (fields.description) {
    const description = fields.description.trim();
    if (description) {
      updateBuilder.updateField("description", description);
    }
  }

  // Reconciled
  if ((fields.reconciled ?? NULLISH) !== NULLISH) {
    updateBuilder.updateField("reconciled", fields.reconciled);
  }

  // Total
  if ((fields.total ?? NULLISH) !== NULLISH) {
    // Total Cannot be less than or equal to zero
    const total = fields.total;
    if (total.s < 0 || total.n === 0) {
      throw new Error("Refund total must be greater than 0.");
    }

    const [result] = (await collection
      .aggregate([
        { $match: { "refunds.id": refundId } },
        stages.entryTotal,
        //Excluded the current total from the refund total as it WILL change.
        getRefundTotals([refundId]),
        { $project: { entryTotal: true, refundTotals: true } },
      ])
      .toArray()) as [{ entryTotal: Fraction; refundTotals: Fraction[] }];

    if (!result) {
      throw new Error(`Refund "${id}" does not exists.`);
    }

    const entryTotal = new Fraction(result.entryTotal);

    const refundTotal = result.refundTotals.reduce(
      (refundTotal, total) => refundTotal.add(total),
      new Fraction(0)
    );

    // Ensure aggregate refunds do NOT exceed the original transaction amount
    if (entryTotal.compare(refundTotal.add(total)) < 0) {
      throw new Error(
        "Refunds cannot total more than original transaction amount."
      );
    }

    updateBuilder.updateField("total", total);
  }

  await Promise.all(asyncOps);

  if (!updateBuilder.hasUpdate) {
    const keys = (() => {
      const obj: {
        [P in keyof Omit<EntryUpdateRefundFields, "__typename">]-?: null;
      } = {
        date: null,
        description: null,
        paymentMethod: null,
        total: null,
        reconciled: null,
      };

      return Object.keys(obj);
    })();

    throw new Error(
      `Refund update requires at least one of the following fields: ${keys.join(
        ", "
      )}".`
    );
  }

  const { modifiedCount } = await collection.updateOne(
    { _id: entryId },
    updateBuilder.update(),
    {
      arrayFilters: [{ "refund.id": refundId }],
    }
  );

  if (modifiedCount === 0) {
    throw new Error(`Failed to update refund: "${JSON.stringify(args)}".`);
  }

  const result = await entry(obj, { id: entryId.toHexString() }, context, info);

  pubSub
    .publish(JOURNAL_ENTRY_UPSERTED, { entryUpserted: result })
    .catch((error) => console.error(error));

  return result;
};

export default entryUpdateRefund;
