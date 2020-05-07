import { ObjectID } from "mongodb";
import * as moment from "moment";
import { isValid } from "date-fns";

import {
  MutationResolvers,
  PaymentMethod,
  JournalEntryUpdateFields,
  JournalEntrySourceType,
} from "../../graphTypes";
import paymentMethodAddMutation from "../paymentMethod/paymentMethodAdd";
import paymentMethodUpdateMutation from "../paymentMethod/paymentMethodUpdate";
import DocHistory from "../utils/DocHistory";
import { userNodeType } from "../utils/standIns";
import { getSrcCollectionAndNode, stages } from "./utils";
import { JOURNAL_ENTRY_UPDATED, JOURNAL_ENTRY_UPSERTED } from "./pubSubs";
import { addBusiness } from "../business";
import { addPerson } from "../person";

const NULLISH = Symbol();

const addDate = {
  $addFields: {
    ...DocHistory.getPresentValues(["date"]),
  },
} as const;

const journalEntryUpdate: MutationResolvers["journalEntryUpdate"] = async (
  obj,
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
    personAdd,
    businessAdd,
  } = args;

  // "paymentMethodAdd" and "paymentMethodUpdate" are mutually exclusive, gql
  // has no concept of this.
  if (paymentMethodAdd && paymentMethodUpdate) {
    throw new Error(
      `"paymentMethodAdd" and "paymentMethodUpdate" are mutually exclusive arguments.`
    );
  }

  // "businessAdd" and "personAdd" are mutually exclusive, gql has
  // no concept of this.
  if (personAdd && businessAdd) {
    throw new Error(
      `"businessAdd" and "personAdd" are mutually exclusive source creation arguments.`
    );
  }

  const { db, nodeMap, user, pubSub } = context;

  const entryId = new ObjectID(id);

  // Async validations
  // All async validation are run at once instead of in series.
  const asyncOps: Promise<void>[] = [
    (async () => {
      const [{ count } = { count: 0 }] = (await db
        .collection("journalEntries")
        .aggregate([{ $match: { _id: entryId } }, { $count: "count" }])
        .toArray()) as [{ count: number }];

      if (count === 0) {
        throw Error(`Journal entry "${id}" does not exist.`);
      }
    })(),
  ];

  const docHistory = new DocHistory({ node: userNodeType, id: user.id });
  const updateBuilder = docHistory.updateHistoricalDoc();

  // Date
  if (dateString) {
    const date = new Date(dateString);
    if (!isValid(date)) {
      throw new Error(`Date "${dateString}" not a valid ISO 8601 date string.`);
    }

    asyncOps.push(
      (async () => {
        const [result] = (await db
          .collection("journalEntries")
          .aggregate([
            { $match: { _id: entryId } },
            { $limit: 1 },
            {
              $project: {
                refundDate: {
                  $reduce: {
                    input: "$refunds",
                    initialValue: docHistory.date,
                    in: {
                      $min: [
                        "$$value",
                        DocHistory.getPresentValueExpression("date", {
                          asVar: "this",
                          defaultValue: docHistory.date,
                        }),
                      ],
                    },
                  },
                },
              },
            },
          ])
          .toArray()) as [{ refundDate: Date }];

        if (result && date > result.refundDate) {
          throw new Error(
            "Entry date can not be greater than the earliest refund date."
          );
        }

        updateBuilder.updateField("date", date);
      })()
    );
  }

  // Type
  if ((type ?? NULLISH) !== NULLISH) {
    updateBuilder.updateField("type", type);
  }

  // Description
  if (description?.trim()) {
    updateBuilder.updateField("description", description);
  }

  // Total
  if (total) {
    const totalDecimal = total.num / total.den;

    if (totalDecimal <= 0) {
      throw new Error("Entry total must be greater than 0.");
    }

    asyncOps.push(
      (async () => {
        const [{ refundTotal }] = (await db
          .collection("journalEntries")
          .aggregate([
            { $match: { _id: new ObjectID(id) } },
            stages.refundTotal,
          ])
          .toArray()) as [{ refundTotal: number }];

        if (totalDecimal < refundTotal) {
          throw new Error(
            "Entry total cannot be less than entry's total refunds."
          );
        }

        updateBuilder.updateField("total", total);
      })()
    );
  }

  // Reconciled
  if ((reconciled ?? NULLISH) !== NULLISH) {
    updateBuilder.updateField("reconciled", reconciled);
  }

  // Department
  if (departmentId) {
    asyncOps.push(
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

        updateBuilder.updateField("department", {
          node: new ObjectID(node),
          id,
        });
      })()
    );
  }

  // Category
  if (categoryId) {
    asyncOps.push(
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

        updateBuilder.updateField("category", {
          node: new ObjectID(node),
          id,
        });
      })()
    );
  }

  // Source
  if (businessAdd) {
    // Do NOT create a new business until all other checks pass
    asyncOps.push(
      Promise.all(asyncOps.splice(0)).then(async () => {
        const { id } = await addBusiness(
          obj,
          { fields: businessAdd },
          context,
          info
        );

        const { node } = getSrcCollectionAndNode(
          db,
          JournalEntrySourceType.Business,
          nodeMap
        );

        updateBuilder.updateField("source", {
          node,
          id: new ObjectID(id),
        });
      })
    );
  } else if (personAdd) {
    // Do NOT create a new person until all other checks pass
    asyncOps.push(
      Promise.all(asyncOps.splice(0)).then(async () => {
        const { id } = await addPerson(
          obj,
          { fields: personAdd },
          context,
          info
        );

        const { node } = getSrcCollectionAndNode(
          db,
          JournalEntrySourceType.Person,
          nodeMap
        );

        updateBuilder.updateField("source", {
          node,
          id: new ObjectID(id),
        });
      })
    );
  } else if (source) {
    const { id: sourceId, sourceType } = source;

    asyncOps.push(
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

        updateBuilder.updateField("source", {
          node,
          id,
        });
      })()
    );
  }

  // Payment method
  if (paymentMethodAdd) {
    // Ensure other checks finish before creating payment method
    asyncOps.push(
      Promise.all(asyncOps.splice(0)).then(async () => {
        // Add payment method
        const id = new ObjectID(
          await (paymentMethodAddMutation(
            obj,
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

        const { id: node } = nodeMap.typename.get("PaymentMethod");

        updateBuilder.updateField("paymentMethod", {
          node: new ObjectID(node),
          id,
        });
      })
    );
  } else if (paymentMethodUpdate) {
    // Ensure other checks finish before updating payment method
    asyncOps.push(
      Promise.all(asyncOps.splice(0)).then(async () => {
        const id = new ObjectID(paymentMethodUpdate.id);

        // Update payment method
        await paymentMethodUpdateMutation(
          obj,
          {
            id: paymentMethodUpdate.id,
            fields: paymentMethodUpdate.fields,
          },
          {
            ...context,
            ephemeral: {
              ...(context.ephemeral || {}),
              docHistoryDate: docHistory.date,
            },
          },
          info
        );

        const { id: node } = nodeMap.typename.get("PaymentMethod");

        updateBuilder.updateField("paymentMethod", {
          node: new ObjectID(node),
          id,
        });
      })
    );
  } else if (paymentMethodId) {
    asyncOps.push(
      (async () => {
        const id = new ObjectID(paymentMethodId);

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

        updateBuilder.updateField("paymentMethod", {
          node: new ObjectID(node),
          id,
        });
      })()
    );
  }

  await Promise.all(asyncOps);

  if (!updateBuilder.hasUpdate) {
    const keys = (() => {
      const obj: {
        [P in keyof Omit<JournalEntryUpdateFields, "__typename">]-?: null;
      } = {
        date: null,
        department: null,
        type: null,
        category: null,
        paymentMethod: null,
        description: null,
        total: null,
        source: null,
        reconciled: null,
      };

      return Object.keys(obj);
    })();

    throw new Error(
      `Entry update requires at least one of the following fields: ${keys.join(
        ", "
      )}".`
    );
  }

  const _id = new ObjectID(id);

  const { modifiedCount } = await db
    .collection("journalEntries")
    .updateOne({ _id }, updateBuilder.update());

  if (modifiedCount === 0) {
    throw new Error(`Failed to update entry: "${JSON.stringify(args)}".`);
  }

  const [updatedDoc] = await db
    .collection("journalEntries")
    .aggregate([
      { $match: { _id } },
      stages.entryAddFields,
      stages.entryTransmutations,
    ])
    .toArray();

  pubSub
    .publish(JOURNAL_ENTRY_UPDATED, {
      journalEntryUpdated: updatedDoc,
    })
    .catch((error) => console.error(error));
  pubSub
    .publish(JOURNAL_ENTRY_UPSERTED, { journalEntryUpserted: updatedDoc })
    .catch((error) => console.error(error));

  return updatedDoc;
};

export default journalEntryUpdate;
