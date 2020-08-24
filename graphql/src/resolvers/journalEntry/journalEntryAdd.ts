import { ObjectId } from "mongodb";
import * as moment from "moment";

import {
  MutationResolvers,
  PaymentMethod,
  JournalEntryType,
  JournalEntrySourceType,
  RationalSign,
} from "../../graphTypes";
import paymentMethodAddMutation from "../paymentMethod/paymentMethodAdd";
import DocHistory from "../utils/DocHistory";
import { userNodeType } from "../utils/standIns";
import { getSrcCollectionAndNode, stages } from "./utils";
import { JOURNAL_ENTRY_ADDED, JOURNAL_ENTRY_UPSERTED } from "./pubSubs";
import { addBusiness } from "../business";
import { addPerson } from "../person";
import { rationalToFraction } from "../../utils/rational";

const journalEntryAdd: MutationResolvers["journalEntryAdd"] = async (
  obj,
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
      source,
      total: totalR,
    },
    paymentMethodAdd,
    businessAdd,
    personAdd,
  } = args;

  const total = rationalToFraction(totalR);

  // "businessAdd" and "personAdd" are mutually exclusive, gql has
  // no concept of this.
  if (businessAdd && personAdd) {
    throw new Error(
      `"businessAdd" and "personAdd" are mutually exclusive source creation arguments.`
    );
  }

  if (totalR.s === RationalSign.Neg || total.n === 0) {
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

    // Category
    (async () => {
      const { collection, id: node } = nodeMap.typename.get(
        "JournalEntryCategory"
      );

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
  ];

  // PaymentMethod
  if (paymentMethodAdd) {
    // Do NOT create new payment method until all other checks pass
    asyncOps.push(
      Promise.all(asyncOps.splice(0)).then(async () => {
        const { id: node } = nodeMap.typename.get("PaymentMethod");

        const id = new ObjectId(
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

        docBuilder.addField("paymentMethod", {
          node: new ObjectId(node),
          id,
        });
      })
    );
  } else {
    // Ensure payment method exists.
    asyncOps.push(
      (async () => {
        const { collection, id: node } = nodeMap.typename.get("PaymentMethod");

        const id = new ObjectId(args.fields.paymentMethod);

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
          node: new ObjectId(node),
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
        const { node } = getSrcCollectionAndNode(
          db,
          JournalEntrySourceType.Business,
          nodeMap
        );

        const { id } = await addBusiness(
          obj,
          { fields: businessAdd },
          context,
          info
        );

        docBuilder.addField("source", {
          node,
          id: new ObjectId(id),
        });
      })
    );
  } else if (personAdd) {
    // Do NOT create a new person until all other checks pass
    asyncOps.push(
      Promise.all(asyncOps.splice(0)).then(async () => {
        const { node } = getSrcCollectionAndNode(
          db,
          JournalEntrySourceType.Person,
          nodeMap
        );

        const { id } = await addPerson(
          obj,
          { fields: personAdd },
          context,
          info
        );

        docBuilder.addField("source", {
          node,
          id: new ObjectId(id),
        });
      })
    );
  } else {
    asyncOps.push(
      (async () => {
        const { sourceType, id: sourceId } = source;
        const { collection, node } = getSrcCollectionAndNode(
          db,
          sourceType,
          nodeMap
        );

        const id = new ObjectId(sourceId);

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

        docBuilder.addField("source", {
          node,
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
      `Failed to add journal entry: ${JSON.stringify(args, null, 2)}`
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
  pubSub
    .publish(JOURNAL_ENTRY_UPSERTED, { journalEntryUpserted: newEntry })
    .catch((error) => console.error(error));

  return newEntry;
};

export default journalEntryAdd;
