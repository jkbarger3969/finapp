import { ObjectId } from "mongodb";
import Fraction from "fraction.js";

import DocHistory from "../utils/DocHistory";
import { userNodeType } from "../utils/standIns";
import {
  MutationResolvers,
  JournalEntryUpdateItemFields,
  JournalEntryItemUpsertResult,
  JournalEntry,
  RationalSign,
} from "../../graphTypes";
import journalEntry from "./journalEntry";
import { stages, getItemTotals } from "./utils";
import { JOURNAL_ENTRY_UPSERTED } from "./pubSubs";
import { rationalToFraction } from "../../utils/rational";

const NULLISH = Symbol();

const journalEntryUpdateItem: MutationResolvers["journalEntryUpdateItem"] = async (
  obj,
  args,
  context,
  info
) => {
  const { id, fields } = args;

  const { db, user, nodeMap, pubSub } = context;

  const collection = db.collection("journalEntries");

  const itemId = new ObjectId(id);

  const docHistory = new DocHistory({ node: userNodeType, id: user.id });

  const updateBuilder = docHistory.updateHistoricalDoc("items.$[item]");

  // Description
  if (fields.description?.trim()) {
    updateBuilder.updateField("description", fields.description.trim());
  }

  // Units
  if ((fields.units ?? NULLISH) !== NULLISH) {
    if (fields.units < 1) {
      throw new Error("Item units must be greater than 0.");
    }
    updateBuilder.updateField("units", fields.units);
  }

  let entryId: ObjectId;
  const asyncOps = [
    // Ensure item exists and get entry id
    (async () => {
      const [result] = (await collection
        .aggregate([
          { $match: { "items.id": itemId } },
          { $limit: 1 },
          {
            $project: {
              entryId: "$_id",
            },
          },
        ])
        .toArray()) as [{ entryId: ObjectId } | undefined];

      if (!result) {
        throw new Error(`Item "${id}" does not exists.`);
      }

      entryId = result.entryId;
    })(),
    // department
    (async () => {
      const deptId = fields.department;

      if (!deptId) {
        return;
      }

      const { collection, id: node } = nodeMap.typename.get("Department");
      const id = new ObjectId(deptId);

      if (
        !(await db
          .collection(collection)
          .findOne({ _id: id }, { projection: { _id: true } }))
      ) {
        throw new Error(`Department with id ${deptId} does not exist.`);
      }

      updateBuilder.updateField("department", {
        node: new ObjectId(node),
        id,
      });
    })(),
    // category
    (async () => {
      const catId = fields.category;

      if (!catId) {
        return;
      }

      const { collection, id: node } = nodeMap.typename.get(
        "JournalEntryCategory"
      );

      const id = new ObjectId(catId);

      if (
        !(await db
          .collection(collection)
          .findOne({ _id: id }, { projection: { _id: true } }))
      ) {
        throw new Error(`Category with id ${catId} does not exist.`);
      }

      updateBuilder.updateField("category", {
        node: new ObjectId(node),
        id,
      });
    })(),
    // total
    (async () => {
      const totalR = fields.total;

      if (!totalR) {
        return;
      }

      if (totalR.s === RationalSign.Neg || totalR.n === 0) {
        throw new Error("Item total must be greater than 0.");
      }

      const total = rationalToFraction(totalR);

      const [result] = (await db
        .collection("journalEntries")
        .aggregate([
          { $match: { "items.id": itemId } },
          stages.entryTotal,
          //Excluded the current total from the refund total as it WILL change.
          getItemTotals([itemId]),
          { $project: { entryTotal: true, itemTotals: true } },
        ])
        .toArray()) as [{ entryTotal: Fraction; itemTotals: Fraction[] }];

      if (!result) {
        return;
      }

      const entryTotal = new Fraction(result.entryTotal);

      const itemTotal = result.itemTotals.reduce(
        (itemTotal, total) => itemTotal.add(total),
        new Fraction(0)
      );

      // Ensure aggregate refunds do NOT exceed the original transaction amount
      if (entryTotal.compare(itemTotal.add(total)) < 0) {
        throw new Error(
          "Items cannot total more than original transaction amount."
        );
      }

      updateBuilder.updateField("total", total);
    })(),
  ];

  await Promise.all(asyncOps);

  if (!updateBuilder.hasUpdate) {
    const keys = (() => {
      const obj: {
        [P in keyof Omit<JournalEntryUpdateItemFields, "__typename">]-?: null;
      } = {
        department: null,
        category: null,
        description: null,
        total: null,
        units: null,
      };

      return Object.keys(obj);
    })();

    throw new Error(
      `Item update requires at least one of the following fields: ${keys.join(
        ", "
      )}".`
    );
  }

  const { modifiedCount } = await collection.updateOne(
    { _id: entryId },
    updateBuilder.update(),
    {
      arrayFilters: [{ "item.id": itemId }],
    }
  );

  if (modifiedCount === 0) {
    throw new Error(`Failed to update item: "${JSON.stringify(args)}".`);
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

export default journalEntryUpdateItem;
