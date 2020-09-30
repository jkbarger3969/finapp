import {
  MutationResolvers,
  JournalEntryItemUpsertResult,
  JournalEntry,
} from "../../graphTypes";
import { ObjectId } from "mongodb";
import DocHistory from "../utils/DocHistory";
import { userNodeType } from "../utils/standIns";
import journalEntry from "./journalEntry";
import { JOURNAL_ENTRY_UPSERTED } from "./pubSubs";

const journalEntryDeleteItem: MutationResolvers["journalEntryDeleteItem"] = async (
  obj,
  args,
  context,
  info
) => {
  const { id } = args;
  const { db, user, pubSub } = context;

  const collection = db.collection("journalEntries");

  const itemId = new ObjectId(id);

  const [entryState] = (await collection
    .aggregate([
      { $match: { "items.id": itemId } },
      { $project: { items: true } },
      { $unwind: "$items" },
      { $match: { "items.id": itemId } },
      {
        $project: {
          entryId: "$_id",
          deleted: DocHistory.getPresentValueExpression("items.deleted", {
            defaultValue: false,
          }),
        },
      },
    ])
    .toArray()) as [{ entryId: ObjectId; deleted: boolean }];

  if (!entryState) {
    throw new Error(`Item "${id} does not exists.`);
  } else if (entryState.deleted) {
    throw new Error(`Item is already deleted.`);
  }

  const entryId = entryState.entryId;

  const docHistory = new DocHistory({ node: userNodeType, id: user.id });

  const updateBuilder = docHistory
    .updateHistoricalDoc("items.$[item]")
    .updateField("deleted", true);

  const { modifiedCount } = await collection.updateOne(
    { _id: entryId },
    updateBuilder.update(),
    {
      arrayFilters: [{ "item.id": itemId }],
    }
  );

  if (modifiedCount === 0) {
    throw new Error(`Failed to delete item: "${JSON.stringify(args)}".`);
  }

  const result = await (async () => {
    const result = {} as JournalEntryItemUpsertResult;

    result.journalEntry = (await journalEntry(
      obj,
      { id: entryId.toHexString() },
      context,
      info
    )) as JournalEntry;

    const itemIdStr = itemId.toHexString();

    result.journalEntryItem = (result.journalEntry?.items ?? []).find(
      (item) => item.id === itemIdStr
    );

    return result;
  })();

  pubSub
    .publish(JOURNAL_ENTRY_UPSERTED, {
      journalEntryUpserted: result.journalEntry,
    })
    .catch((error) => console.error(error));

  return result;
};

export default journalEntryDeleteItem;
