import { ObjectID } from "mongodb";
import * as moment from "moment";

import { MutationResolvers, PaymentMethod } from "../../graphTypes";
import paymentMethodAddMutation from "../paymentMethod/paymentMethodAdd";
import paymentMethodUpdateMutation from "../paymentMethod/paymentMethodUpdate";
import DocHistory from "../utils/DocHistory";
import { userNodeType } from "../utils/standIns";
import {
  getSrcCollectionAndNode,
  entryAddFieldsStage,
  entryTransmutationsStage,
} from "./utils";
import { JOURNAL_ENTRY_UPDATED } from "./pubSubs";

const NULLISH = Symbol();

const journalEntryUpdate: MutationResolvers["journalEntryUpdate"] = async (
  doc,
  args,
  context,
  info
) => {
  const {
    id,
    fields: {
      date: dateString,
      department: departmentId,
      type,
      category: categoryId,
      paymentMethod: paymentMethodId,
      source,
      description,
      total,
      reconciled,
    },
    paymentMethodAdd,
    paymentMethodUpdate,
  } = args;

  const { db, nodeMap, user, pubSub } = context;

  const docHistory = new DocHistory({ node: userNodeType, id: user.id });

  // Date
  if (dateString) {
    const date = moment(dateString, moment.ISO_8601);
    if (!date.isValid()) {
      throw new Error(`Date "${dateString}" not a valid ISO 8601 date string.`);
    }
    docHistory.updateValue("date", date.toDate());
  }

  // Type
  if ((type ?? NULLISH) !== NULLISH) {
    docHistory.updateValue("type", type);
  }

  // Description
  if (description?.trim()) {
    docHistory.updateValue("description", description);
  }

  // Total
  if (total) {
    docHistory.updateValue("total", total);
  }

  // Reconciled
  if ((reconciled ?? NULLISH) !== NULLISH) {
    docHistory.updateValue("reconciled", reconciled);
  }

  // Async ref validation
  const updateChecks: Promise<void>[] = [];

  // Department
  if (departmentId) {
    updateChecks.push(
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

        docHistory.updateValue("department", {
          node: new ObjectID(node),
          id,
        });
      })()
    );
  }

  // Source
  if (source) {
    const { id: sourceId, sourceType } = source;

    updateChecks.push(
      (async () => {
        const { collection, node } = getSrcCollectionAndNode(
          db,
          sourceType,
          nodeMap
        );

        const id = new ObjectID(sourceId);

        if (
          !(await collection.findOne(
            { _id: id },
            { projection: { _id: true } }
          ))
        ) {
          throw new Error(
            `Source type "${sourceType}" with id ${sourceId} does not exist.`
          );
        }

        docHistory.updateValue("source", {
          node,
          id,
        });
      })()
    );
  }

  // Category
  if (categoryId) {
    updateChecks.push(
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

        docHistory.updateValue("category", {
          node: new ObjectID(node),
          id,
        });
      })()
    );
  }

  // Payment method
  updateChecks.push(
    (async () => {
      let id: ObjectID | undefined;
      if (paymentMethodAdd) {
        // Add payment method
        id = new ObjectID(
          await (paymentMethodAddMutation(
            doc,
            { fields: paymentMethodAdd },
            context,
            info
          ) as Promise<PaymentMethod>).then(({ id }) => id)
        );
      } else if (paymentMethodUpdate) {
        id = new ObjectID(paymentMethodUpdate.id);

        // Update payment method
        await paymentMethodUpdateMutation(
          doc,
          {
            id: paymentMethodUpdate.id,
            fields: paymentMethodUpdate.fields,
          },
          context,
          info
        );
      } else if (paymentMethodId) {
        id = new ObjectID(paymentMethodId);
      }

      if (id) {
        const { collection, id: node } = nodeMap.typename.get("PaymentMethod");

        if (
          !(await db
            .collection(collection)
            .findOne({ _id: id }, { projection: { _id: true } }))
        ) {
          throw new Error(
            `Payment method with id ${id.toHexString()} does not exist.`
          );
        }

        docHistory.updateValue("paymentMethod", {
          node: new ObjectID(node),
          id,
        });
      }
    })()
  );

  await Promise.all(updateChecks);

  if (!docHistory.hasUpdate) {
    throw new Error(
      `Mutation "journalEntryUpdate" requires at least one of the following fields: "date", "source", "category", "department", "total", "type", "reconciled", or "paymentMethod".`
    );
  }

  const _id = new ObjectID(id);

  const { modifiedCount } = await db
    .collection("journalEntries")
    .updateOne({ _id }, docHistory.update);

  if (modifiedCount === 0) {
    throw new Error(
      `Failed to update journal entry: "${JSON.stringify(args)}".`
    );
  }

  const [updatedDoc] = await db
    .collection("journalEntries")
    .aggregate([
      { $match: { _id } },
      entryAddFieldsStage,
      entryTransmutationsStage,
    ])
    .toArray();

  pubSub
    .publish(JOURNAL_ENTRY_UPDATED, { journalEntryUpdated: updatedDoc })
    .catch((error) => console.error(error));

  return updatedDoc;
};

export default journalEntryUpdate;
