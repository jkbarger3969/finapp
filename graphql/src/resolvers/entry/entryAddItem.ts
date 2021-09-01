import { ObjectId } from "mongodb";
import Fraction from "fraction.js";

import DocHistory from "../utils/DocHistory";
import { userNodeType } from "../utils/standIns";
import {
  MutationResolvers,
  EntryItemUpsertResult,
  Entry,
} from "../../graphTypes";
import { entry } from "./entry";
import { getUniqueId } from "../utils/mongoUtils";
import { stages } from "./utils";
import { JOURNAL_ENTRY_UPSERTED } from "./pubSubs";

const entryAddItem: MutationResolvers["entryAddItem"] = async (
  obj,
  args,
  context,
  info
) => {
  const { db, nodeMap, user } = context;

  const {
    id,
    fields: { department: departmentId, category: categoryId, total, units },
  } = args;

  const description = args.fields.description?.trim();

  const collection = db.collection("journalEntries");

  const srcEntryId = new ObjectId(id);

  const docHistory = new DocHistory(user.id);

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

  let itemId: ObjectId;

  const asyncOps: Promise<void>[] = [
    // Ensure entry exists and ensure item totals does not exceed entry total
    (async () => {
      // Total Cannot be less than or equal to zero
      if (total.s < 0 || total.n === 0) {
        throw new Error("Item total must be greater than 0.");
      }

      const [srcEntryState] = (await collection
        .aggregate([
          { $match: { _id: srcEntryId } },
          stages.entryTotal,
          stages.itemTotals,
          {
            $project: {
              entryTotal: true,
              itemTotals: true,
            },
          },
        ])
        .toArray()) as [{ entryTotal: Fraction; itemTotals: Fraction[] }];

      if (!srcEntryState) {
        throw new Error(`Journal entry "${id}" does not exist.`);
      }

      const entryTotal = new Fraction(srcEntryState.entryTotal);

      const itemTotal = srcEntryState.itemTotals.reduce(
        (itemTotal, total) => itemTotal.add(total),
        new Fraction(0)
      );

      // Ensure aggregate refunds do NOT exceed the original transaction amount
      if (entryTotal.compare(itemTotal.add(total)) < 0) {
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
      const id = new ObjectId(departmentId);

      if (
        !(await db
          .collection(collection)
          .findOne({ _id: id }, { projection: { _id: true } }))
      ) {
        throw new Error(`Department with id ${departmentId} does not exist.`);
      }

      docBuilder.addField("department", {
        node: new ObjectId(node),
        id,
      });
    })(),

    // Check that category exists and add
    (async () => {
      if (!categoryId) {
        return;
      }

      const { collection, id: node } = nodeMap.typename.get("Category");

      const id = new ObjectId(categoryId);

      if (
        !(await db
          .collection(collection)
          .findOne({ _id: id }, { projection: { _id: true } }))
      ) {
        throw new Error(`Category with id ${categoryId} does not exist.`);
      }

      docBuilder.addField("category", { node: new ObjectId(node), id });
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
    const result = {} as EntryItemUpsertResult;

    result.entry = (await entry(obj, { id }, context, info)) as Entry;

    const itemIdStr = itemId.toHexString();

    result.entryItem = (result.entry?.items ?? []).find(
      (item) => item.id === itemIdStr
    );

    return result;
  })();

  return result;
};

export default entryAddItem;
