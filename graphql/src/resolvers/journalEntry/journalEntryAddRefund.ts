import { ObjectID } from "mongodb";
import * as moment from "moment";

import DocHistory from "../utils/DocHistory";
import { userNodeType } from "../utils/standIns";
import { MutationResolvers, PaymentMethod } from "../../graphTypes";
import journalEntry from "./journalEntry";
import { getUniqueId } from "../utils/mongoUtils";
import { stages } from "./utils";
import paymentMethodAddMutation from "../paymentMethod/paymentMethodAdd";

const journalEntryAddRefund: MutationResolvers["journalEntryAddRefund"] = async (
  doc,
  args,
  context,
  info
) => {
  const {
    id,
    fields: { date: dateStr, total },
    paymentMethodAdd,
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

  const { db, user, nodeMap } = context;

  const docHistory = new DocHistory({ node: userNodeType, id: user.id });

  const collection = db.collection("journalEntries");

  const srcEntryId = new ObjectID(id);

  const docBuilder = docHistory.newHistoricalDoc(true).addFields([
    ["date", date.toDate()],
    ["total", total],
    ["reconciled", reconciled],
    ["deleted", false],
  ]);

  if (description) {
    docBuilder.addField("description", description);
  }

  // const refundEntry = {
  //   id: undefined as ObjectID,
  //   paymentMethod: undefined as [HistoryObject<NodeValue>],
  //   date: docHistory.addValue(date.toDate()),
  //   description: description ? docHistory.addValue(description) : [],
  //   total: docHistory.addValue(total),
  //   reconciled: docHistory.addValue(reconciled),
  //   deleted: docHistory.addValue(false),
  //   lastUpdate: docHistory.lastUpdate,
  //   ...docHistory.rootHistoryObject,
  // };
  let refundId: ObjectID;
  const asyncOps = [
    // Ensure source entry exists and get entry and refund totals.
    (async () => {
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
        throw new Error(`Journal entry "${id}" does not exist.`);
      }

      const { entryTotal, refundTotal } = srcEntryState;

      // Ensure aggregate refunds do NOT exceed the original transaction amount
      if (entryTotal < refundTotal + totalDecimal) {
        throw new Error(
          "Refunds cannot total more than original transaction amount."
        );
      }
    })(),
    // Generate refund ID
    (async () => {
      refundId = await getUniqueId("refund.id", collection);
    })(),
  ];

  if (paymentMethodAdd) {
    // Do NOT create new payment method until all other checks pass
    asyncOps.push(
      Promise.all(asyncOps.splice(0)).then(async () => {
        const { id: node } = nodeMap.typename.get("PaymentMethod");

        const id = new ObjectID(
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
          node: new ObjectID(node),
          id,
        });
      })
    );
  } else {
    // Ensure payment method exists.
    asyncOps.push(
      (async () => {
        const { collection, id: node } = nodeMap.typename.get("PaymentMethod");

        const id = new ObjectID(args.fields.paymentMethod);

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
          node: new ObjectID(node),
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

  return result;
};

export default journalEntryAddRefund;
