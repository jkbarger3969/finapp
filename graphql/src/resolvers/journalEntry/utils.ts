import { O } from "ts-toolbelt";
import { Collection, Db, ObjectID } from "mongodb";
import {
  JournalEntrySourceType,
  JournalEntry,
  JournalEntryRefund,
  JournalEntryType,
} from "../../graphTypes";
import { Context } from "../../types";
import DocHistory from "../utils/DocHistory";

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

// $ prefix is to indicate mongo
export const entryAddFieldsStage = {
  $addFields: {
    ...DocHistory.getPresentValues(
      (() => {
        const obj: {
          [P in keyof Omit<
            JournalEntry,
            "__typename" | "id" | "refunds" | "lastUpdate"
          >]-?: null;
        } = {
          type: null,
          department: null,
          category: null,
          paymentMethod: null,
          total: null,
          source: null,
          reconciled: null,
          description: null,
          date: null,
          deleted: null,
        };

        return Object.keys(obj);
      })()
    ),
    refunds: {
      $map: {
        input: "$refunds",
        as: "refund",
        in: {
          $mergeObjects: [
            "$$refund",
            {
              ...DocHistory.getPresentValues(
                (() => {
                  const obj: {
                    [P in keyof Omit<
                      JournalEntryRefund,
                      "__typename" | "id" | "lastUpdate"
                    >]-?: null;
                  } = {
                    total: null,
                    reconciled: null,
                    date: null,
                    description: null,
                    deleted: null,
                  };
                  return Object.keys(obj);
                })(),
                { asVar: "refund" }
              ),
            },
          ],
        },
      },
    },
    id: "$_id",
  },
} as const;

export const entryTransmutationsStage = {
  $addFields: {
    id: { $toString: "$id" },
    type: {
      $switch: {
        branches: [
          { case: { $eq: ["$type", "credit"] }, then: JournalEntryType.Credit },
          { case: { $eq: ["$type", "debit"] }, then: JournalEntryType.Debit },
        ],
        default: "$type",
      },
    },
    date: { $toString: "$date" },
    lastUpdate: { $toString: "$lastUpdate" },
    refunds: {
      $map: {
        input: "$refunds",
        as: "refund",
        in: {
          $mergeObjects: [
            "$$refund",
            {
              id: { $toString: "$$refund.id" },
              date: { $toString: "$$refund.date" },
              lastUpdate: { $toString: "$$refund.lastUpdate" },
            },
          ],
        },
      },
    },
  },
};
