import { ObjectID } from "mongodb";
import * as moment from "moment";

import {
  MutationResolvers,
  PaymentMethod,
  JournalEntryType,
  RationalInput,
} from "../../graphTypes";
import paymentMethodAddMutation from "../paymentMethod/paymentMethodAdd";
import DocHistory, {
  HistoryObject,
  RootHistoryObject,
} from "../utils/DocHistory";
import { userNodeType } from "../utils/standIns";
import {
  getSrcCollectionAndNode,
  entryAddFieldsStage,
  entryTransmutationsStage,
} from "./utils";
import { NodeValue } from "../../types";
import { JOURNAL_ENTRY_ADDED } from "./pubSubs";

export type JournalEntryAddInsertDoc = {
  date: [HistoryObject<Date>];
  department: [HistoryObject<NodeValue>];
  type: [HistoryObject<"credit" | "debit">];
  category: [HistoryObject<NodeValue>];
  source: [HistoryObject<NodeValue>];
  total: [HistoryObject<RationalInput>];
  description: [HistoryObject<string>] | [];
  deleted: [HistoryObject<false>];
  reconciled: [HistoryObject<false>];
} & RootHistoryObject;

const journalEntryAdd: MutationResolvers["journalEntryAdd"] = async (
  doc,
  args,
  context,
  info
) => {
  const {
    fields: {
      date: dateString,
      department: departmentId,
      type,
      category: categoryId,
      source: { id: sourceId, sourceType },
      total,
    },
    paymentMethodAdd,
  } = args;

  const date = moment(dateString, moment.ISO_8601);
  if (!date.isValid()) {
    throw new Error(`Date "${dateString}" not a valid ISO 8601 date string.`);
  }

  const reconciled = args.fields.reconciled ?? false;

  const description = (args.fields.description ?? "").trim();

  const { db, user, nodeMap, pubSub } = context;

  const docHistory = new DocHistory({ node: userNodeType, id: user.id });

  //Start building insert doc
  const insertDoc = {
    date: docHistory.addValue(date.toDate()),
    total: docHistory.addValue(total),
    type: docHistory.addValue(
      type === JournalEntryType.Credit ? "credit" : "debit"
    ),
    description: description ? docHistory.addValue(description) : [],
    deleted: docHistory.addValue(false),
    reconciled: docHistory.addValue(reconciled),
    ...docHistory.rootHistoryObject,
  } as JournalEntryAddInsertDoc;

  // Insure doc refs exist and finish insert doc
  await Promise.all([
    // Department
    (async () => {
      const { collection, id: node } = nodeMap.typename.get("Department");
      const id = new ObjectID(departmentId);

      if (
        !(await db
          .collection(collection)
          .findOne({ _id: id }, { projection: { _id: true } }))
      ) {
        throw new Error(`Department with id ${departmentId} does not exist.`);
      }

      insertDoc["department"] = docHistory.addValue({
        node: new ObjectID(node),
        id,
      });
    })(),

    // Source
    (async () => {
      const { collection, node } = getSrcCollectionAndNode(
        db,
        sourceType,
        nodeMap
      );

      const id = new ObjectID(sourceId);

      if (
        !(await collection.findOne({ _id: id }, { projection: { _id: true } }))
      ) {
        throw new Error(
          `Source type "${sourceType}" with id ${sourceId} does not exist.`
        );
      }

      insertDoc["source"] = docHistory.addValue({
        node,
        id,
      });
    })(),

    // Category
    (async () => {
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

      insertDoc["category"] = docHistory.addValue({
        node: new ObjectID(node),
        id,
      });
    })(),

    // PaymentMethod
    (async () => {
      const { collection, id: node } = nodeMap.typename.get("PaymentMethod");

      const id = new ObjectID(
        paymentMethodAdd
          ? await (paymentMethodAddMutation(
              doc,
              { fields: paymentMethodAdd },
              context,
              info
            ) as Promise<PaymentMethod>).then(({ id }) => id)
          : args.fields.paymentMethod
      );

      if (
        !(await db
          .collection(collection)
          .findOne({ _id: id }, { projection: { _id: true } }))
      ) {
        throw new Error(
          `Payment method with id ${id.toHexString()} does not exist.`
        );
      }

      insertDoc["paymentMethod"] = docHistory.addValue({
        node: new ObjectID(node),
        id,
      });
    })(),
  ]);

  const { insertedId, insertedCount } = await db
    .collection("journalEntries")
    .insertOne(insertDoc);

  if (insertedCount === 0) {
    throw new Error(
      `Failed to add journal entry: "${JSON.stringify(args, null, 2)}".`
    );
  }

  const [newEntry] = await db
    .collection("journalEntries")
    .aggregate([
      { $match: { _id: insertedId } },
      entryAddFieldsStage,
      entryTransmutationsStage,
    ])
    .toArray();

  pubSub
    .publish(JOURNAL_ENTRY_ADDED, { journalEntryAdded: newEntry })
    .catch((error) => console.error(error));

  return newEntry;
};

export default journalEntryAdd;
