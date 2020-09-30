import { MutationResolvers } from "../../graphTypes";
import { ObjectId } from "mongodb";
import DocHistory from "../utils/DocHistory";
import { userNodeType } from "../utils/standIns";
import journalEntry from "./journalEntry";
import { JOURNAL_ENTRY_UPSERTED } from "./pubSubs";

const journalEntryDeleteRefund: MutationResolvers["journalEntryDeleteRefund"] = async (
  obj,
  args,
  context,
  info
) => {
  const { id } = args;
  const { db, user, pubSub } = context;

  const collection = db.collection("journalEntries");

  const refundId = new ObjectId(id);

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
    .toArray()) as [{ entryId: ObjectId; deleted: boolean }];

  if (!entryState) {
    throw new Error(`Refund "${id} does not exists.`);
  } else if (entryState.deleted) {
    throw new Error(`Refund is already deleted.`);
  }

  const entryId = entryState.entryId;

  const docHistory = new DocHistory({ node: userNodeType, id: user.id });

  const updateBuilder = docHistory
    .updateHistoricalDoc("refunds.$[refund]")
    .updateField("deleted", true);

  const { modifiedCount } = await collection.updateOne(
    { _id: entryId },
    updateBuilder.update(),
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

  pubSub
    .publish(JOURNAL_ENTRY_UPSERTED, { journalEntryUpserted: result })
    .catch((error) => console.error(error));

  return result;
};

export default journalEntryDeleteRefund;
