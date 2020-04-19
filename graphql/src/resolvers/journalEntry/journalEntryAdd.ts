import { ObjectID } from "mongodb";
import * as moment from "moment";

import {
  MutationResolvers,
  PaymentMethod,
  JournalEntryType,
} from "../../graphTypes";
import paymentMethodAddMutation from "../paymentMethod/paymentMethodAdd";
import DocHistory from "../utils/DocHistory";
import { userNodeType } from "../utils/standIns";
import { getSrcCollectionAndNode, stages } from "./utils";
import { JOURNAL_ENTRY_ADDED } from "./pubSubs";

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

  const totalDecimal = total.num / total.den;

  if (totalDecimal <= 0) {
    throw new Error("Entry total must be greater than 0.");
  }

  const date = moment(dateString, moment.ISO_8601);
  if (!date.isValid()) {
    throw new Error(`Date "${dateString}" not a valid ISO 8601 date string.`);
  }

  const reconciled = args.fields.reconciled ?? false;

  const description = (args.fields.description ?? "").trim();

  const { db, user, nodeMap, pubSub } = context;

  const docHistory = new DocHistory({ node: userNodeType, id: user.id });

  //Start building insert doc
  const docBuilder = docHistory
    .newHistoricalDoc(true)
    .addField("date", date.toDate())
    .addField("total", total)
    .addField("type", type === JournalEntryType.Credit ? "credit" : "debit")
    .addField("deleted", false)
    .addField("reconciled", reconciled);
  if (description) {
    docBuilder.addField("description", description);
  }

  // Insure doc refs exist and finish insert doc
  const asyncOps = [
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

      docBuilder.addField("department", {
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

      docBuilder.addField("source", {
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

      docBuilder.addField("category", { node: new ObjectID(node), id });
    })(),
  ];

  // PaymentMethod
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

  const { insertedId, insertedCount } = await db
    .collection("journalEntries")
    .insertOne(docBuilder.doc());

  if (insertedCount === 0) {
    throw new Error(
      `Failed to add journal entry: "${JSON.stringify(args, null, 2)}".`
    );
  }

  const [newEntry] = await db
    .collection("journalEntries")
    .aggregate([
      { $match: { _id: insertedId } },
      stages.entryAddFields,
      stages.entryTransmutations,
    ])
    .toArray();

  pubSub
    .publish(JOURNAL_ENTRY_ADDED, { journalEntryAdded: newEntry })
    .catch((error) => console.error(error));

  return newEntry;
};

export default journalEntryAdd;
