import { ObjectID } from "mongodb";
import * as moment from "moment";

import DocHistory from "../utils/DocHistory";
import { userNodeType } from "../utils/standIns";
import {
  MutationResolvers,
  JournalEntryUpdateRefundFields,
  PaymentMethod,
} from "../../graphTypes";
import journalEntry from "./journalEntry";
import { stages, getRefundTotals } from "./utils";
import paymentMethodAddMutation from "../paymentMethod/paymentMethodAdd";
import paymentMethodUpdateMutation from "../paymentMethod/paymentMethodUpdate";

const NULLISH = Symbol();

const journalEntryUpdateRefund: MutationResolvers["journalEntryUpdateRefund"] = async (
  obj,
  args,
  context,
  info
) => {
  const { id, fields, paymentMethodAdd, paymentMethodUpdate } = args;

  const { db, user, nodeMap } = context;

  const collection = db.collection("journalEntries");

  const refundId = new ObjectID(id);

  const docHistory = new DocHistory({ node: userNodeType, id: user.id });

  const updateBuilder = docHistory.updateHistoricalDoc("refunds.$[refund]");

  // Date
  if (fields.date) {
    const date = moment(fields.date, moment.ISO_8601);
    if (!date.isValid()) {
      throw new Error(
        `Date "${fields.date}" not a valid ISO 8601 date string.`
      );
    }
    updateBuilder.updateField("date", date.toDate());
  }

  let entryId: ObjectID;
  let asyncOps = [
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
    const totalDecimal = fields.total.num / fields.total.den;
    if (totalDecimal <= 0) {
      throw new Error("Refund total must be greater than 0.");
    }

    const refundTotalEx = getRefundTotals([refundId]);

    const [{ entryTotal, refundTotal }] = (await collection
      .aggregate([
        { $match: { _id: entryId } },
        stages.entryTotal,
        //Excluded the current total from the refund total as it WILL change.
        refundTotalEx,
        // getRefundTotals([refundId]),
        { $project: { entryTotal: true, refundTotal: true } },
      ])
      .toArray()) as [{ entryTotal: number; refundTotal: number }];

    // Ensure aggregate refunds do NOT exceed the original transaction amount
    if (entryTotal < refundTotal + totalDecimal) {
      throw new Error(
        "Refunds cannot total more than original transaction amount."
      );
    }

    updateBuilder.updateField("total", fields.total);
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

  return result;
};

export default journalEntryUpdateRefund;
