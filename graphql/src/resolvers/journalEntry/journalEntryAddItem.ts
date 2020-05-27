import { ObjectID } from "mongodb";

import DocHistory from "../utils/DocHistory";
import { userNodeType } from "../utils/standIns";
import {
  MutationResolvers,
  JournalEntryItemUpsertResult,
  JournalEntry,
} from "../../graphTypes";
import journalEntry from "./journalEntry";
import { getUniqueId } from "../utils/mongoUtils";
import { stages } from "./utils";
import { JOURNAL_ENTRY_UPSERTED } from "./pubSubs";

const NULLISH = Symbol();

const journalEntryAddItem: MutationResolvers["journalEntryAddItem"] = async (
  obj,
  args,
  context,
  info
) => {
  const { db, nodeMap, user, pubSub } = context;

  const {
    id,
    fields: { department: departmentId, category: categoryId, total, units },
  } = args;

  const description = args.fields.description?.trim();

  const collection = db.collection("journalEntries");

  const srcEntryId = new ObjectID(id);

  const docHistory = new DocHistory({ node: userNodeType, id: user.id });

  const docBuilder = docHistory.newHistoricalDoc(true).addFields([
    ["total", total],
    ["deleted", false],
    ["units", units],
  ]);

  if (description) {
    docBuilder.addField("description", description);
  }

  if (units < 1) {
    throw new Error("Item units must be greater than 0.");
  }

  let itemId: ObjectID;

  const asyncOps: Promise<void>[] = [
    // Ensure entry exists and ensure item totals does not exceed entry total
    (async () => {
      // Total Cannot be less than or equal to zero
      const totalDecimal = total.num / total.den;
      if (totalDecimal <= 0) {
        throw new Error("Item total must be greater than 0.");
      }

      const [srcEntryState] = (await collection
        .aggregate([
          { $match: { _id: srcEntryId } },
          stages.entryTotal,
          stages.itemTotal,
          {
            $project: {
              entryTotal: true,
              itemTotal: true,
            },
          },
        ])
        .toArray()) as [{ entryTotal: number; itemTotal: number }];

      if (!srcEntryState) {
        throw new Error(`Journal entry "${id}" does not exist.`);
      }

      const { entryTotal, itemTotal } = srcEntryState;

      // Ensure aggregate refunds do NOT exceed the original transaction amount
      if (entryTotal < itemTotal + totalDecimal) {
        throw new Error(
          "Items cannot total more than original transaction amount."
        );
      }
    })(),

    // Check that department exists and add
    (async () => {
      if (!departmentId) {
        return;
      }

      const { collection, id: node } = nodeMap.typename.get("Department");
      const id = new ObjectID(departmentId);

      if (
        !(await db
          .collection(collection)
          .findOne({ _id: id }, { projection: { _id: true } }))
      ) {
        throw new Error(`Department with id ${departmentId} does not exist.`);
      }

      docBuilder.addField("department", {
        node: new ObjectID(node),
        id,
      });
    })(),

    // Check that category exists and add
    (async () => {
      if (!categoryId) {
        return;
      }

      const { collection, id: node } = nodeMap.typename.get(
        "JournalEntryCategory"
      );

      const id = new ObjectID(categoryId);

      if (
        !(await db
          .collection(collection)
          .findOne({ _id: id }, { projection: { _id: true } }))
      ) {
        throw new Error(`Category with id ${categoryId} does not exist.`);
      }

      docBuilder.addField("category", { node: new ObjectID(node), id });
    })(),

    // Generate item ID
    (async () => {
      itemId = await getUniqueId("items.id", collection);
    })(),
  ];

  // Await async operations
  await Promise.all(asyncOps);

  const { modifiedCount } = await collection.updateOne(
    { _id: srcEntryId },
    {
      $push: {
        items: { id: itemId, ...docBuilder.doc() },
      },
    }
  );

  if (modifiedCount === 0) {
    throw new Error(
      `Failed to add item entry: "${JSON.stringify(args, null, 2)}".`
    );
  }

  const result = await (async () => {
    const result = {} as JournalEntryItemUpsertResult;

    result.journalEntry = (await journalEntry(
      obj,
      { id },
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

export default journalEntryAddItem;
