import { MutationResolvers } from "../../graphTypes";
import { ObjectID } from "mongodb";
import DocHistory from "../utils/DocHistory";
import { userNodeType } from "../utils/standIns";
import journalEntry from "./journalEntry";

const journalEntryDeleteRefund: MutationResolvers["journalEntryDeleteRefund"] = async (
  obj,
  args,
  context,
  info
) => {
  const { id } = args;
  const { db, user } = context;

  const collection = db.collection("journalEntries");

  const refundId = new ObjectID(id);

  const [entryState] = (await collection
    .aggregate([
      { $match: { "refunds.id": refundId } },
      { $project: { refunds: true } },
      { $unwind: "$refunds" },
      { $match: { "refunds.id": refundId } },
      {
        $project: {
          entryId: "$_id",
          deleted: DocHistory.getPresentValueExpression("refunds.deleted", {
            defaultValue: false,
          }),
        },
      },
    ])
    .toArray()) as [{ entryId: ObjectID; deleted: boolean }];

  if (!entryState) {
    throw new Error(`Refund "${id} does not exists.`);
  } else if (entryState.deleted) {
    throw new Error(`Refund is already deleted.`);
  }

  const entryId = entryState.entryId;

  const docHistory = new DocHistory({ node: userNodeType, id: user.id });

  docHistory.updateValue("deleted", true);

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
    throw new Error(`Failed to delete refund: "${JSON.stringify(args)}".`);
  }

  const result = await journalEntry(
    obj,
    { id: entryId.toHexString() },
    context,
    info
  );

  return result;
};

export default journalEntryDeleteRefund;
