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
      $ifNull: [
        {
          $let: {
            vars: {
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
  },
};

export const getRefundTotals = (exclude: (ObjectID | string)[] = []) => {
  const $eq = [
    DocHistory.getPresentValueExpression("deleted", {
      defaultValue: true,
      asVar: "this",
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
                $in: ["$$this.id", exclude.map((id) => new ObjectID(id))],
              },
            },
          ],
        }
      : { $eq };

  return {
    $addFields: {
      refundTotal: {
        $reduce: {
          input: "$refunds",
          initialValue: 0,
          in: {
            $sum: [
              "$$value",
              {
                $let: {
                  vars: {
                    total: {
                      $cond: {
                        if: condition,
                        then: DocHistory.getPresentValueExpression("total", {
                          defaultValue: { num: 0, den: 1 },
                          asVar: "this",
                        }),
                        else: {
                          num: 0,
                          den: 1,
                        },
                      },
                    },
                  },
                  in: { $divide: ["$$total.num", "$$total.den"] },
                },
              },
            ],
          },
        },
      },
    },
  } as const;
};

export const stages = {
  entryAddFields: entryAddFieldsStage,
  entryTransmutations: entryTransmutationsStage,
  entryTotal: {
    $addFields: {
      entryTotal: {
        $let: {
          vars: {
            total: DocHistory.getPresentValueExpression("total", {
              defaultValue: { num: 0, den: 1 },
            }),
          },
          in: { $divide: ["$$total.num", "$$total.den"] },
        },
      },
    },
  },
  refundTotal: getRefundTotals(),
} as const;
