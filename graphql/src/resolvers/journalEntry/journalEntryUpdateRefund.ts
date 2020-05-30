import { ObjectID } from "mongodb";
import Fraction from "fraction.js";
import { isValid } from "date-fns";

import DocHistory from "../utils/DocHistory";
import { userNodeType } from "../utils/standIns";
import {
  MutationResolvers,
  JournalEntryUpdateRefundFields,
  PaymentMethod,
  RationalSign,
} from "../../graphTypes";
import journalEntry from "./journalEntry";
import { stages, getRefundTotals } from "./utils";
import paymentMethodAddMutation from "../paymentMethod/paymentMethodAdd";
import paymentMethodUpdateMutation from "../paymentMethod/paymentMethodUpdate";
import { JOURNAL_ENTRY_UPSERTED } from "./pubSubs";
import { rationalToFraction } from "../../utils/rational";

const NULLISH = Symbol();

const addDate = {
  $addFields: {
    ...DocHistory.getPresentValues(["date"]),
  },
} as const;

const journalEntryUpdateRefund: MutationResolvers["journalEntryUpdateRefund"] = async (
  obj,
  args,
  context,
  info
) => {
  const { id, fields, paymentMethodAdd, paymentMethodUpdate } = args;

  const { db, user, nodeMap, pubSub } = context;

  const collection = db.collection("journalEntries");

  const refundId = new ObjectID(id);

  const docHistory = new DocHistory({ node: userNodeType, id: user.id });

  const updateBuilder = docHistory.updateHistoricalDoc("refunds.$[refund]");

  let entryId: ObjectID;
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
        .toArray()) as [{ entryId: ObjectID } | undefined];

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
    const totalR = fields.total;
    if (totalR.s === RationalSign.Neg || totalR.n === 0) {
      throw new Error("Refund total must be greater than 0.");
    }

    const total = rationalToFraction(totalR);

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

  // Payment method
  if (paymentMethodAdd) {
    // Ensure other checks finish before creating payment method
    asyncOps.push(
      Promise.all(asyncOps.splice(0)).then(async () => {
        const { id: node } = nodeMap.typename.get("PaymentMethod");

        const id = new ObjectID(
          await (paymentMethodAddMutation(
            obj,
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

        updateBuilder.updateField("paymentMethod", {
          node: new ObjectID(node),
          id,
        });
      })
    );
  } else if (paymentMethodUpdate) {
    // Ensure other checks finish before creating updating method
    asyncOps.push(
      Promise.all(asyncOps.splice(0)).then(async () => {
        const id = new ObjectID(paymentMethodUpdate.id);

        // Update payment method
        await paymentMethodUpdateMutation(
          obj,
          {
            id: paymentMethodUpdate.id,
            fields: paymentMethodUpdate.fields,
          },
          {
            ...context,
            ephemeral: {
              ...(context.ephemeral || {}),
              docHistoryDate: docHistory.date,
            },
          },
          info
        );

        const { id: node } = nodeMap.typename.get("PaymentMethod");

        updateBuilder.updateField("paymentMethod", {
          node: new ObjectID(node),
          id,
        });
      })
    );
  } else if (fields.paymentMethod) {
    asyncOps.push(
      (async () => {
        const id = new ObjectID(fields.paymentMethod);

        const { collection, id: node } = nodeMap.typename.get("PaymentMethod");

        if (
          !(await db
            .collection(collection)
            .findOne({ _id: id }, { projection: { _id: true } }))
        ) {
          throw new Error(
            `Payment method with id ${id.toHexString()} does not exist.`
          );
        }

        updateBuilder.updateField("paymentMethod", {
          node: new ObjectID(node),
          id,
        });
      })()
    );
  }

  await Promise.all(asyncOps);

  if (!updateBuilder.hasUpdate) {
    const keys = (() => {
      const obj: {
        [P in keyof Omit<JournalEntryUpdateRefundFields, "__typename">]-?: null;
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

  const result = await journalEntry(
    obj,
    { id: entryId.toHexString() },
    context,
    info
  );

  pubSub
    .publish(JOURNAL_ENTRY_UPSERTED, { journalEntryUpserted: result })
    .catch((error) => console.error(error));

  return result;
};

export default journalEntryUpdateRefund;
