import { ObjectId } from "mongodb";
import * as moment from "moment";

import { SortDirection } from "./shared";
import {
  MutationResolvers,
  QueryResolvers,
  JournalEntryResolvers,
  JournalEntrySourceType,
  SubscriptionResolvers,
  JournalEntryType,
} from "../graphTypes";
import { nodeFieldResolver } from "./utils/nodeResolver";
import { NodeValue } from "../types";
import { project, addFields } from "./journalEntry/utils";
import {
  JOURNAL_ENTRY_ADDED,
  JOURNAL_ENTRY_UPDATED,
  JOURNAL_ENTRY_UPSERTED,
} from "./journalEntry/pubSubs";
import journalEntry from "./journalEntry/journalEntry";

const userNodeType = new ObjectId("5dca0427bccd5c6f26b0cde2");

export const journalEntryUpdate: MutationResolvers["journalEntryUpdate"] = async (
  parent,
  args,
  context,
  info
) => {
  const { id, fields } = args;
  const { db, nodeMap, user, pubSub } = context;

  const createdBy = {
    node: userNodeType,
    id: user.id,
  };

  const createdOn = new Date();
  const lastUpdate = createdOn;

  const $push = {};

  const updateQuery = {
    $set: {
      lastUpdate,
    },
    $push,
  };

  const {
    date: dateString = null,
    source = null,
    department: departmentId = null,
    total = null,
    category: categoryId = null,
    paymentMethod: paymentMethodId = null,
    description = null,
    reconciled = null,
    type = null,
  } = fields;

  let numFieldsToUpdate = 0;
  if (dateString !== null) {
    numFieldsToUpdate++;

    const date = moment(dateString, moment.ISO_8601);

    if (!date.isValid()) {
      throw new Error(
        `Mutation "journalEntryUpdate" date argument "${dateString}" not a valid ISO 8601 date string.`
      );
    }

    $push["date"] = {
      $each: [
        {
          value: date.toDate(),
          createdBy,
          createdOn,
        },
      ],
      $position: 0,
    };
  }

  if (source !== null) {
    numFieldsToUpdate++;

    const { id: sourceId, sourceType } = source;

    const id = new ObjectId(sourceId);

    const value = { id } as NodeValue;

    let collection: string;
    switch (sourceType) {
      case JournalEntrySourceType.Business:
        if (nodeMap.typename.has("Business")) {
          const nodeInfo = nodeMap.typename.get("Business");
          collection = nodeInfo.collection;
          value.node = new ObjectId(nodeInfo.id);
        }
        break;
      case JournalEntrySourceType.Department:
        if (nodeMap.typename.has("Department")) {
          const nodeInfo = nodeMap.typename.get("Department");
          collection = nodeInfo.collection;
          value.node = new ObjectId(nodeInfo.id);
        }
        break;
      case JournalEntrySourceType.Person:
        if (nodeMap.typename.has("Person")) {
          const nodeInfo = nodeMap.typename.get("Person");
          collection = nodeInfo.collection;
          value.node = new ObjectId(nodeInfo.id);
        }
        break;
    }

    // Confirm id exists in node
    if (
      0 === (await db.collection(collection).find({ _id: id }).limit(1).count())
    ) {
      throw new Error(
        `Mutation "journalEntryUpdate" source type "${sourceType}" with id ${sourceId} does not exist.`
      );
    } else if (value.node === undefined) {
      throw new Error(
        `Mutation "journalEntryUpdate" source type "${sourceType}" not found.`
      );
    }

    $push["source"] = {
      $each: [
        {
          value,
          createdBy,
          createdOn,
        },
      ],
      $position: 0,
    };
  }

  if (departmentId !== null) {
    numFieldsToUpdate++;

    const { collection, id: node } = nodeMap.typename.get("Department");

    const id = new ObjectId(departmentId);

    if (
      0 === (await db.collection(collection).find({ _id: id }).limit(1).count())
    ) {
      throw new Error(
        `Mutation "journalEntryUpdate" type "Department" with id ${departmentId} does not exist.`
      );
    }

    $push["department"] = {
      $each: [
        {
          value: {
            node: new ObjectId(node),
            id,
          },
          createdBy,
          createdOn,
        },
      ],
      $position: 0,
    };
  }

  if (total !== null) {
    numFieldsToUpdate++;

    $push["total"] = {
      $each: [
        {
          value: total,
          createdBy,
          createdOn,
        },
      ],
      $position: 0,
    };
  }

  if (type !== null) {
    numFieldsToUpdate++;

    const value = type === JournalEntryType.Credit ? "credit" : "debit";

    $push["type"] = {
      $each: [
        {
          value,
          createdBy,
          createdOn,
        },
      ],
      $position: 0,
    };

    if (categoryId === null) {
      const cats = await db
        .collection("journalEntries")
        .aggregate([
          { $match: { _id: new ObjectId(id) } },
          {
            $addFields: { catId: { $arrayElemAt: ["$category.value.id", 0] } },
          },
          {
            $lookup: {
              from: "journalEntryCategories",
              localField: "catId",
              foreignField: "_id",
              as: "cats",
            },
          },
          { $project: { cats: true } },
        ])
        .next();

      if (value !== cats.cats[0].type) {
        throw new Error(
          `Mutation "journalEntryUpdate" "JournalEntryType" must match "JournalEntryCategory" type.`
        );
      }
    }
  }

  if (categoryId !== null) {
    numFieldsToUpdate++;

    const { collection, id: node } = nodeMap.typename.get(
      "JournalEntryCategory"
    );

    const catObjId = new ObjectId(categoryId);

    const category = await db.collection(collection).findOne(
      { _id: catObjId },
      {
        projection: { type: true },
      }
    );

    if (!category) {
      throw new Error(
        `Mutation "journalEntryUpdate" type "JournalEntryCategory" with id ${categoryId} does not exist.`
      );
    }

    $push["category"] = {
      $each: [
        {
          value: {
            node: new ObjectId(node),
            id: catObjId,
          },
          createdBy,
          createdOn,
        },
      ],
      $position: 0,
    };

    let typeValue: "credit" | "debit";
    if (type === null) {
      const entry = await db
        .collection("journalEntries")
        .aggregate([
          { $match: { _id: new ObjectId(id) } },
          { $addFields: { type: { $arrayElemAt: ["$type.value", 0] } } },
          { $project: { type: true } },
        ])
        .next();

      typeValue = entry.type;
    } else {
      typeValue = type === JournalEntryType.Credit ? "credit" : "debit";
    }

    if (category.type !== typeValue) {
      throw new Error(
        `Mutation "journalEntryUpdate" "JournalEntryType" must match "JournalEntryCategory" type.`
      );
    }
  }

  if (paymentMethodId !== null) {
    numFieldsToUpdate++;

    const { collection, id: node } = nodeMap.typename.get("PaymentMethod");

    const id = new ObjectId(paymentMethodId);

    if (
      0 === (await db.collection(collection).find({ _id: id }).limit(1).count())
    ) {
      throw new Error(
        `Mutation "journalEntryUpdate" type "PaymentMethod" with id ${paymentMethodId} does not exist.`
      );
    }

    $push["paymentMethod"] = {
      $each: [
        {
          value: {
            node: new ObjectId(node),
            id,
          },
          createdBy,
          createdOn,
        },
      ],
      $position: 0,
    };
  }

  if (description !== null) {
    numFieldsToUpdate++;

    $push["description"] = {
      $each: [
        {
          value: description,
          createdBy,
          createdOn,
        },
      ],
      $position: 0,
    };
  }

  if (reconciled !== null) {
    numFieldsToUpdate++;

    $push["reconciled"] = {
      $each: [
        {
          value: reconciled,
          createdBy,
          createdOn,
        },
      ],
      $position: 0,
    };
  }

  if (numFieldsToUpdate === 0) {
    throw new Error(
      `Mutation "journalEntryUpdate" requires at least one of the following fields: "date", "source", "category", "department", "total", "type", or "paymentMethod"`
    );
  }

  const { modifiedCount } = await db
    .collection("journalEntries")
    .updateOne({ _id: new ObjectId(id) }, updateQuery);

  if (modifiedCount === 0) {
    throw new Error(
      `Mutation "journalEntryUpdate" arguments "${JSON.stringify(
        args
      )}" failed.`
    );
  }

  const doc = await db
    .collection("journalEntries")
    .aggregate([{ $match: { _id: new ObjectId(id) } }, addFields, project])
    .toArray();

  pubSub
    .publish(JOURNAL_ENTRY_UPDATED, { journalEntryUpdated: doc[0] })
    .catch((error) => console.error(error));

  return doc[0];
};

export const journalEntryAdd: MutationResolvers["journalEntryAdd"] = async (
  parent,
  args,
  context,
  info
) => {
  const {
    date: dateString,
    department: departmentId,
    type,
    category: categoryId,
    source: { id: sourceId, sourceType },
    description = null,
    paymentMethod: paymentMethodId,
    total,
  } = args.fields;

  const reconciled = args.fields.reconciled ?? false;

  const { db, user, nodeMap, pubSub } = context;

  const createdOn = new Date();
  const lastUpdate = createdOn;

  const createdBy = {
    node: userNodeType,
    id: user.id,
  };

  const insertDoc = {
    total: [
      {
        value: total,
        createdBy,
        createdOn,
      },
    ],
    type: [
      {
        value: type === JournalEntryType.Credit ? "credit" : "debit",
        createdBy,
        createdOn,
      },
    ],
    lastUpdate,
    createdOn,
    createdBy,
    deleted: [
      {
        value: false,
        createdBy,
        createdOn,
      },
    ],
    reconciled: [
      {
        value: reconciled,
        createdBy,
        createdOn,
      },
    ],
  } as any;

  // Description
  if (description) {
    insertDoc["description"] = [
      {
        value: description,
        createdBy,
        createdOn,
      },
    ];
  } else {
    insertDoc["description"] = [];
  }

  // Date
  const date = moment(dateString, moment.ISO_8601);
  if (!date.isValid()) {
    throw new Error(
      `Mutation "journalEntryAdd" date argument "${dateString}" not a valid ISO 8601 date string.`
    );
  }

  insertDoc["date"] = [
    {
      value: date.toDate(),
      createdBy,
      createdOn,
    },
  ];

  // Department
  {
    const { collection, id: node } = nodeMap.typename.get("Department");

    const id = new ObjectId(departmentId);

    if (
      0 === (await db.collection(collection).find({ _id: id }).limit(1).count())
    ) {
      throw new Error(
        `Mutation "journalEntryAdd" type "Department" with id ${departmentId} does not exist.`
      );
    }

    insertDoc["department"] = [
      {
        value: {
          node: new ObjectId(node),
          id,
        },
        createdBy,
        createdOn,
      },
    ];
  }

  // JournalEntryCategory
  {
    const { collection, id: node } = nodeMap.typename.get(
      "JournalEntryCategory"
    );

    const id = new ObjectId(categoryId);

    if (
      0 === (await db.collection(collection).find({ _id: id }).limit(1).count())
    ) {
      throw new Error(
        `Mutation "journalEntryAdd" type "JournalEntryCategory" with id ${categoryId} does not exist.`
      );
    }

    insertDoc["category"] = [
      {
        value: {
          node: new ObjectId(node),
          id,
        },
        createdBy,
        createdOn,
      },
    ];
  }

  // JournalEntrySource
  {
    const id = new ObjectId(sourceId);

    const value = { id } as NodeValue;

    let collection: string;
    switch (sourceType) {
      case JournalEntrySourceType.Business:
        if (nodeMap.typename.has("Business")) {
          const nodeInfo = nodeMap.typename.get("Business");
          collection = nodeInfo.collection;
          value.node = new ObjectId(nodeInfo.id);
        }
        break;
      case JournalEntrySourceType.Department:
        if (nodeMap.typename.has("Department")) {
          const nodeInfo = nodeMap.typename.get("Department");
          collection = nodeInfo.collection;
          value.node = new ObjectId(nodeInfo.id);
        }
        break;
      case JournalEntrySourceType.Person:
        if (nodeMap.typename.has("Person")) {
          const nodeInfo = nodeMap.typename.get("Person");
          collection = nodeInfo.collection;
          value.node = new ObjectId(nodeInfo.id);
        }
        break;
    }

    // Confirm id exists in node
    if (
      0 === (await db.collection(collection).find({ _id: id }).limit(1).count())
    ) {
      throw new Error(
        `Mutation "journalEntryAdd" source type "${sourceType}" with id ${sourceId} does not exist.`
      );
    } else if (value.node === undefined) {
      throw new Error(
        `Mutation "journalEntryAdd" source type "${sourceType}" not found.`
      );
    }

    insertDoc["source"] = [
      {
        value,
        createdBy,
        createdOn,
      },
    ];
  }

  // PaymentMethod
  {
    const { collection, id: node } = nodeMap.typename.get("PaymentMethod");

    const id = new ObjectId(paymentMethodId);

    if (
      0 === (await db.collection(collection).find({ _id: id }).limit(1).count())
    ) {
      throw new Error(
        `Mutation "journalEntryAdd" type "PaymentMethod" with id ${paymentMethodId} does not exist.`
      );
    }

    insertDoc["paymentMethod"] = [
      {
        value: {
          node: new ObjectId(node),
          id,
        },
        createdBy,
        createdOn,
      },
    ];
  }

  const { insertedId, insertedCount } = await db
    .collection("journalEntries")
    .insertOne(insertDoc);

  if (insertedCount === 0) {
    throw new Error(
      `Mutation "journalEntryAdd" arguments "${JSON.stringify(args)}" failed.`
    );
  }

  const newEntry = await db
    .collection("journalEntries")
    .aggregate([{ $match: { _id: insertedId } }, addFields, project])
    .toArray();

  pubSub
    .publish(JOURNAL_ENTRY_ADDED, { journalEntryAdded: newEntry[0] })
    .catch((error) => console.error(error));

  return newEntry[0];
};

export const journalEntryDelete: MutationResolvers["journalEntryDelete"] = async (
  parent,
  args,
  context,
  info
) => {
  const { id } = args;
  const { db, user, pubSub } = context;

  const createdBy = {
    node: userNodeType,
    id: user.id,
  };

  const createdOn = new Date();
  const lastUpdate = createdOn;

  const updateQuery = {
    $set: {
      lastUpdate,
    },
    $push: {
      deleted: {
        $each: [
          {
            value: true,
            createdBy,
            createdOn,
          },
        ],
        $position: 0,
      },
    },
  };

  const _id = new ObjectId(id);

  const { modifiedCount } = await db
    .collection("journalEntries")
    .updateOne({ _id }, updateQuery);

  if (modifiedCount === 0) {
    throw new Error(
      `Mutation "journalEntryDelete" arguments "${JSON.stringify(
        args
      )}" failed.`
    );
  }

  // const [doc] = await db
  //   .collection("journalEntries")
  //   .aggregate([{ $match: { _id } }, addFields, project])
  //   .toArray();

  const doc = await journalEntry(parent, { id }, context, info);

  pubSub
    .publish(JOURNAL_ENTRY_UPDATED, { journalEntryUpdated: doc })
    .catch((error) => console.error(error));
  pubSub
    .publish(JOURNAL_ENTRY_UPSERTED, { journalEntryUpserted: doc })
    .catch((error) => console.error(error));

  return doc;
};

export const JournalEntry: JournalEntryResolvers = {
  type: (parent) =>
    (parent.type as any) === "credit"
      ? JournalEntryType.Credit
      : JournalEntryType.Debit,
  department: nodeFieldResolver,
  category: nodeFieldResolver,
  paymentMethod: nodeFieldResolver,
  source: nodeFieldResolver,
  date: (parent, args, context, info) => {
    return ((parent.date as any) as Date).toISOString();
  },
  lastUpdate: (parent, args, context, info) => {
    return ((parent.lastUpdate as any) as Date).toISOString();
  },
};

export const journalEntryAdded: SubscriptionResolvers["journalEntryAdded"] = {
  subscribe: (_, __, { pubSub }) => pubSub.asyncIterator(JOURNAL_ENTRY_ADDED),
};

export const journalEntryUpdated: SubscriptionResolvers["journalEntryUpdated"] = {
  subscribe: (_, __, { pubSub }) => pubSub.asyncIterator(JOURNAL_ENTRY_UPDATED),
};
