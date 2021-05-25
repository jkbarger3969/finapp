import { ObjectId } from "mongodb";
import * as moment from "moment";

import { SortDirection } from "./shared";
import {
  MutationResolvers,
  QueryResolvers,
  EntryResolvers,
  SourceType,
  SubscriptionResolvers,
  EntryType,
} from "../graphTypes";
import { nodeFieldResolver } from "./utils/nodeResolver";
import { NodeValue } from "../types";
import { project, addFields } from "./entry/utils";
import {
  JOURNAL_ENTRY_ADDED,
  JOURNAL_ENTRY_UPDATED,
  JOURNAL_ENTRY_UPSERTED,
} from "./entry/pubSubs";
import { entry } from "./entry/entry";

const userNodeType = new ObjectId("5dca0427bccd5c6f26b0cde2");

export const entryUpdate: MutationResolvers["entryUpdate"] = async (
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
        `Mutation "entryUpdate" date argument "${dateString}" not a valid ISO 8601 date string.`
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
      case SourceType.Business:
        if (nodeMap.typename.has("Business")) {
          const nodeInfo = nodeMap.typename.get("Business");
          collection = nodeInfo.collection;
          value.node = new ObjectId(nodeInfo.id);
        }
        break;
      case SourceType.Department:
        if (nodeMap.typename.has("Department")) {
          const nodeInfo = nodeMap.typename.get("Department");
          collection = nodeInfo.collection;
          value.node = new ObjectId(nodeInfo.id);
        }
        break;
      case SourceType.Person:
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
        `Mutation "entryUpdate" source type "${sourceType}" with id ${sourceId} does not exist.`
      );
    } else if (value.node === undefined) {
      throw new Error(
        `Mutation "entryUpdate" source type "${sourceType}" not found.`
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
        `Mutation "entryUpdate" type "Department" with id ${departmentId} does not exist.`
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

    const value = type === EntryType.Credit ? "credit" : "debit";

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
              from: "categories",
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
          `Mutation "entryUpdate" "EntryType" must match "Category" type.`
        );
      }
    }
  }

  if (categoryId !== null) {
    numFieldsToUpdate++;

    const { collection, id: node } = nodeMap.typename.get("Category");

    const catObjId = new ObjectId(categoryId);

    const category = await db.collection(collection).findOne(
      { _id: catObjId },
      {
        projection: { type: true },
      }
    );

    if (!category) {
      throw new Error(
        `Mutation "entryUpdate" type "Category" with id ${categoryId} does not exist.`
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
      typeValue = type === EntryType.Credit ? "credit" : "debit";
    }

    if (category.type !== typeValue) {
      throw new Error(
        `Mutation "entryUpdate" "EntryType" must match "Category" type.`
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
        `Mutation "entryUpdate" type "PaymentMethod" with id ${paymentMethodId} does not exist.`
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
      `Mutation "entryUpdate" requires at least one of the following fields: "date", "source", "category", "department", "total", "type", or "paymentMethod"`
    );
  }

  const { modifiedCount } = await db
    .collection("journalEntries")
    .updateOne({ _id: new ObjectId(id) }, updateQuery);

  if (modifiedCount === 0) {
    throw new Error(
      `Mutation "entryUpdate" arguments "${JSON.stringify(args)}" failed.`
    );
  }

  const doc = await db
    .collection("journalEntries")
    .aggregate([{ $match: { _id: new ObjectId(id) } }, addFields, project])
    .toArray();

  pubSub
    .publish(JOURNAL_ENTRY_UPDATED, { entryUpdated: doc[0] })
    .catch((error) => console.error(error));

  return doc[0];
};

export const entryAdd: MutationResolvers["entryAdd"] = async (
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
        value: type === EntryType.Credit ? "credit" : "debit",
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
      `Mutation "entryAdd" date argument "${dateString}" not a valid ISO 8601 date string.`
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
        `Mutation "entryAdd" type "Department" with id ${departmentId} does not exist.`
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

  // Category
  {
    const { collection, id: node } = nodeMap.typename.get("Category");

    const id = new ObjectId(categoryId);

    if (
      0 === (await db.collection(collection).find({ _id: id }).limit(1).count())
    ) {
      throw new Error(
        `Mutation "entryAdd" type "Category" with id ${categoryId} does not exist.`
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

  // Source
  {
    const id = new ObjectId(sourceId);

    const value = { id } as NodeValue;

    let collection: string;
    switch (sourceType) {
      case SourceType.Business:
        if (nodeMap.typename.has("Business")) {
          const nodeInfo = nodeMap.typename.get("Business");
          collection = nodeInfo.collection;
          value.node = new ObjectId(nodeInfo.id);
        }
        break;
      case SourceType.Department:
        if (nodeMap.typename.has("Department")) {
          const nodeInfo = nodeMap.typename.get("Department");
          collection = nodeInfo.collection;
          value.node = new ObjectId(nodeInfo.id);
        }
        break;
      case SourceType.Person:
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
        `Mutation "entryAdd" source type "${sourceType}" with id ${sourceId} does not exist.`
      );
    } else if (value.node === undefined) {
      throw new Error(
        `Mutation "entryAdd" source type "${sourceType}" not found.`
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
        `Mutation "entryAdd" type "PaymentMethod" with id ${paymentMethodId} does not exist.`
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
      `Mutation "entryAdd" arguments "${JSON.stringify(args)}" failed.`
    );
  }

  const newEntry = await db
    .collection("journalEntries")
    .aggregate([{ $match: { _id: insertedId } }, addFields, project])
    .toArray();

  pubSub
    .publish(JOURNAL_ENTRY_ADDED, { entryAdded: newEntry[0] })
    .catch((error) => console.error(error));

  return newEntry[0];
};

export const entryDelete: MutationResolvers["entryDelete"] = async (
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
      `Mutation "entryDelete" arguments "${JSON.stringify(args)}" failed.`
    );
  }

  // const [doc] = await db
  //   .collection("journalEntries")
  //   .aggregate([{ $match: { _id } }, addFields, project])
  //   .toArray();

  const doc = await entry(parent, { id }, context, info);

  pubSub
    .publish(JOURNAL_ENTRY_UPDATED, { entryUpdated: doc })
    .catch((error) => console.error(error));
  pubSub
    .publish(JOURNAL_ENTRY_UPSERTED, { entryUpserted: doc })
    .catch((error) => console.error(error));

  return doc;
};

export const Entry: EntryResolvers = {
  department: nodeFieldResolver,
  category: nodeFieldResolver,
  paymentMethod: nodeFieldResolver,
  source: nodeFieldResolver,
  // date: (parent, args, context, info) => {
  //   return ((parent.date as any) as Date).toISOString();
  // },
  // lastUpdate: (parent, args, context, info) => {
  //   return ((parent.lastUpdate as any) as Date).toISOString();
  // },
};

export const entryAdded: SubscriptionResolvers["entryAdded"] = {
  subscribe: (_, __, { pubSub }) => pubSub.asyncIterator(JOURNAL_ENTRY_ADDED),
};

export const entryUpdated: SubscriptionResolvers["entryUpdated"] = {
  subscribe: (_, __, { pubSub }) => pubSub.asyncIterator(JOURNAL_ENTRY_UPDATED),
};
