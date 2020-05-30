import { O } from "ts-toolbelt";
import { Collection, Db, ObjectID } from "mongodb";
import {
  JournalEntrySourceType,
  JournalEntry,
  JournalEntryRefund,
  JournalEntryItem,
  JournalEntryType,
} from "../../graphTypes";
import { Context } from "../../types";
import DocHistory, { PresentValueExpressionOpts } from "../utils/DocHistory";
import { iterateOwnKeyValues } from "../../utils/iterableFns";

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

export const entryAddFieldsStage = {
  $addFields: {
    ...DocHistory.getPresentValues(
      (() => {
        const obj: {
          [P in keyof Omit<
            JournalEntry,
            "__typename" | "id" | "refunds" | "items" | "lastUpdate"
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
      $ifNull: [
        {
          $let: {
            vars: {
              // Get entry delete status
              entryDeleted: DocHistory.getPresentValueExpression("deleted", {
                defaultValue: false,
              }),
            },
            in: {
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
                            paymentMethod: null,
                            description: null,
                            deleted: null,
                          };
                          return Object.keys(obj);
                        })(),
                        { asVar: "refund" }
                      ),
                    },
                    // Override item delete status if entry is deleted
                    {
                      $cond: {
                        if: "$$entryDeleted",
                        then: { deleted: true },
                        else: {},
                      },
                    },
                  ],
                },
              },
            },
          },
        },
        [],
      ],
    },
    items: {
      $ifNull: [
        {
          $let: {
            vars: {
              // Get entry delete status
              entryDeleted: DocHistory.getPresentValueExpression("deleted", {
                defaultValue: false,
              }),
            },
            in: {
              $map: {
                input: "$items",
                as: "item",
                in: {
                  $mergeObjects: [
                    "$$item",
                    {
                      ...DocHistory.getPresentValues(
                        (function*() {
                          const obj: {
                            [P in keyof Omit<
                              JournalEntryItem,
                              "__typename" | "id" | "lastUpdate"
                            >]-?: unknown;
                          } = {
                            total: null,
                            department: null,
                            category: null,
                            description: null,
                            deleted: null,
                            units: 1,
                          };

                          for (const [key, value] of iterateOwnKeyValues(obj)) {
                            if (value === null) {
                              yield key;
                            } else {
                              yield [key, { defaultValue: value }] as [
                                string,
                                PresentValueExpressionOpts
                              ];
                            }
                          }
                        })(),
                        { asVar: "item" }
                      ),
                    },
                    // Override item delete status if entry is deleted
                    {
                      $cond: {
                        if: "$$entryDeleted",
                        then: { deleted: true },
                        else: {},
                      },
                    },
                  ],
                },
              },
            },
          },
        },
        [],
      ],
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
    items: {
      $map: {
        input: "$items",
        as: "item",
        in: {
          $mergeObjects: [
            "$$item",
            {
              id: { $toString: "$$item.id" },
              date: { $toString: "$$item.date" },
              lastUpdate: { $toString: "$$item.lastUpdate" },
            },
          ],
        },
      },
    },
  },
};

export const getRefundTotals = (exclude: (ObjectID | string)[] = []) => {
  const $eq = [
    DocHistory.getPresentValueExpression("deleted", {
      defaultValue: false,
      asVar: "refund",
    }),
    false,
  ];

  const condition =
    exclude.length > 0
      ? {
          $and: [
            { $eq },
            {
              $not: {
                $in: ["$$refund.id", exclude.map((id) => new ObjectID(id))],
              },
            },
          ],
        }
      : { $eq };

  return {
    $addFields: {
      refundTotals: {
        $ifNull: [
          {
            $map: {
              input: {
                $filter: {
                  input: "$refunds",
                  as: "refund",
                  cond: condition,
                },
              },
              as: "refund",
              in: DocHistory.getPresentValueExpression("total", {
                defaultValue: { s: 1, n: 0, d: 1 },
                asVar: "refund",
              }),
            },
          },
          [],
        ],
      },
    },
  } as const;
};

export const getItemTotals = (exclude: (ObjectID | string)[] = []) => {
  const $eq = [
    DocHistory.getPresentValueExpression("deleted", {
      defaultValue: true,
      asVar: "item",
    }),
    false,
  ];

  const condition =
    exclude.length > 0
      ? {
          $and: [
            { $eq },
            {
              $not: {
                $in: ["$$item.id", exclude.map((id) => new ObjectID(id))],
              },
            },
          ],
        }
      : { $eq };

  return {
    $addFields: {
      itemTotals: {
        $ifNull: [
          {
            $map: {
              input: {
                $filter: {
                  input: "$items",
                  as: "item",
                  cond: condition,
                },
              },
              as: "item",
              in: DocHistory.getPresentValueExpression("total", {
                defaultValue: { s: 1, n: 0, d: 1 },
                asVar: "item",
              }),
            },
          },
          [],
        ],
      },
    },
  } as const;
};

export const stages = {
  entryAddFields: entryAddFieldsStage,
  entryTransmutations: entryTransmutationsStage,
  entryTotal: {
    $addFields: {
      entryTotal: DocHistory.getPresentValueExpression("total", {
        defaultValue: { s: 1, n: 0, d: 1 },
      }),
    },
  },
  refundTotals: getRefundTotals(),
  itemTotals: getItemTotals(),
} as const;
