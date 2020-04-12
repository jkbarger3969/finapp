import { ObjectID, ObjectId } from "mongodb";
import * as moment from "moment";

import DocHistory from "../utils/DocHistory";
import { userNodeType } from "../utils/standIns";
import {
  MutationResolvers,
  JournalEntryUpdateRefundFields,
} from "../../graphTypes";
import journalEntry from "./journalEntry";
import { stages, getRefundTotals } from "./utils";

const NULLISH = Symbol();

const journalEntryUpdateRefund: MutationResolvers["journalEntryUpdateRefund"] = async (
  obj,
  args,
  context,
  info
) => {
  const { id, fields } = args;

  const { db, user } = context;

  const collection = db.collection("journalEntries");

  const refundId = new ObjectID(id);

  const [
    { count, entryId } = { count: 0, entryId: new ObjectID() },
  ] = (await collection
    .aggregate([
      { $match: { "refunds.id": refundId } },
      {
        $group: {
          _id: null,
          count: { $sum: 1 },
          entryId: { $first: "$_id" },
        },
      },
    ])
    .toArray()) as [{ count: number; entryId: ObjectId }];

  if (count === 0) {
    throw new Error(`Refund "${id}" does not exists.`);
  }

  const docHistory = new DocHistory({ node: userNodeType, id: user.id });

  // Date
  if (fields.date) {
    const date = moment(fields.date, moment.ISO_8601);
    if (!date.isValid()) {
      throw new Error(
        `Date "${fields.date}" not a valid ISO 8601 date string.`
      );
    }
    docHistory.updateValue("date", date.toDate());
  }

  // Description
  if (fields.description) {
    const description = fields.description.trim();
    if (description) {
      docHistory.updateValue("description", description);
    }
  }

  // Reconciled
  if ((fields.reconciled ?? NULLISH) !== NULLISH) {
    docHistory.updateValue("reconciled", fields.reconciled);
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

    docHistory.updateValue("total", fields.total);
  }

  if (!docHistory.hasUpdate) {
    const keys = (() => {
      const obj: {
        [P in keyof Omit<JournalEntryUpdateRefundFields, "__typename">]-?: null;
      } = {
        date: null,
        description: null,
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
    (() => {
      const update = docHistory.update;
      return {
        $push: Object.keys(update.$push).reduce((pushObj, field) => {
          pushObj[`refunds.$[refund].${field}`] = update.$push[field];
          return pushObj;
        }, {}),
        $set: Object.keys(update.$set).reduce((setObj, field) => {
          setObj[`refunds.$[refund].${field}`] = update.$set[field];
          return setObj;
        }, {}),
      } as const;
    })(),
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
