import { O } from "ts-toolbelt";
import { Collection, Db, ObjectID } from "mongodb";
import { JournalEntrySourceType, JournalEntry } from "../../graphTypes";
import { Context } from "../../types";
import DocHistory from "../utils/DocHistory";
import { mergeObjects } from "../utils/mongoUtils";

export const addFields = {
  $addFields: {
    id: { $toString: "$_id" },
    type: { $arrayElemAt: ["$type.value", 0] },
    department: { $arrayElemAt: ["$department.value", 0] },
    category: { $arrayElemAt: ["$category.value", 0] },
    paymentMethod: { $arrayElemAt: ["$paymentMethod.value", 0] },
    total: { $arrayElemAt: ["$total.value", 0] },
    source: { $arrayElemAt: ["$source.value", 0] },
    reconciled: { $arrayElemAt: ["$reconciled.value", 0] },
    description: {
      $ifNull: [{ $arrayElemAt: ["$description.value", 0] }, null],
    },
    date: { $arrayElemAt: ["$date.value", 0] },
    deleted: { $arrayElemAt: ["$deleted.value", 0] },
  },
};
export type addFields = O.Readonly<
  typeof addFields,
  keyof typeof addFields,
  "deep"
>;

export type project = O.Readonly<typeof project, keyof typeof project, "deep">;
export const project = {
  $project: {
    parent: false,
    createdBy: false,
  },
};

export const getSrcCollectionAndNode = (
  db: Db,
  sourceType: JournalEntrySourceType,
  nodeMap: Context["nodeMap"]
): { collection: Collection; node: ObjectID } => {
  let collection: string;
  let id: string;
  switch (sourceType) {
    case JournalEntrySourceType.Business:
      ({ collection, id } = nodeMap.typename.get("Business"));
      break;
    case JournalEntrySourceType.Department:
      ({ collection, id } = nodeMap.typename.get("Department"));
      break;
    case JournalEntrySourceType.Person:
      ({ collection, id } = nodeMap.typename.get("Person"));
      break;
  }

  return {
    collection: db.collection(collection),
    node: new ObjectID(id),
  };
};

// Merge MUST include ALL keys in JournalEntry.  This anonymous function
// allows type checking. This can be replaced if/when TS allows for keyof enums.
export const merge = (() => {
  const obj: { [P in keyof Omit<JournalEntry, "__typename">]-?: null } = {
    date: null,
    id: null,
    refund: null,
    type: null,
    department: null,
    category: null,
    paymentMethod: null,
    description: null,
    total: null,
    source: null,
    reconciled: null,
    lastUpdate: null,
    deleted: null,
  };

  return mergeObjects(Object.keys(obj));
})();

export const $addFields = {
  ...DocHistory.getPresentValues([
    "type",
    "department",
    "category",
    "paymentMethod",
    "total",
    "source",
    "reconciled",
    "description",
    "date",
    "deleted",
  ]),
  id: { $toString: "$_id" },
} as const;
