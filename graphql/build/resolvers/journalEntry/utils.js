"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.stages = exports.getItemTotals = exports.getRefundTotals = exports.entryTransmutationsStage = exports.entryAddFieldsStage = exports.getSrcCollectionAndNode = exports.project = exports.addFields = void 0;
const mongodb_1 = require("mongodb");
const graphTypes_1 = require("../../graphTypes");
const DocHistory_1 = require("../utils/DocHistory");
const iterableFns_1 = require("../../utils/iterableFns");
exports.addFields = {
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
exports.project = {
    $project: {
        parent: false,
        createdBy: false,
    },
};
const getSrcCollectionAndNode = (db, sourceType, nodeMap) => {
    let collection;
    let id;
    switch (sourceType) {
        case graphTypes_1.JournalEntrySourceType.Business:
            ({ collection, id } = nodeMap.typename.get("Business"));
            break;
        case graphTypes_1.JournalEntrySourceType.Department:
            ({ collection, id } = nodeMap.typename.get("Department"));
            break;
        case graphTypes_1.JournalEntrySourceType.Person:
            ({ collection, id } = nodeMap.typename.get("Person"));
            break;
    }
    return {
        collection: db.collection(collection),
        node: new mongodb_1.ObjectId(id),
    };
};
exports.getSrcCollectionAndNode = getSrcCollectionAndNode;
exports.entryAddFieldsStage = {
    $addFields: Object.assign(Object.assign({}, DocHistory_1.default.getPresentValues((() => {
        const obj = {
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
    })())), { dateOfRecord: {
            $cond: {
                if: {
                    $ifNull: [
                        DocHistory_1.default.getPresentValueExpression("dateOfRecord.date"),
                        false,
                    ],
                },
                then: Object.assign({}, DocHistory_1.default.getPresentValues((function* () {
                    for (const [key, value] of iterableFns_1.iterateOwnKeyValues({
                        date: "dateOfRecord.date",
                        overrideFiscalYear: "dateOfRecord.overrideFiscalYear",
                    })) {
                        yield [value, key];
                    }
                })())),
                else: null,
            },
        }, refunds: {
            $ifNull: [
                {
                    $let: {
                        vars: {
                            // Get entry delete status
                            entryDeleted: DocHistory_1.default.getPresentValueExpression("deleted", {
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
                                        Object.assign({}, DocHistory_1.default.getPresentValues((() => {
                                            const obj = {
                                                total: null,
                                                reconciled: null,
                                                date: null,
                                                paymentMethod: null,
                                                description: null,
                                                deleted: null,
                                            };
                                            return Object.keys(obj);
                                        })(), { asVar: "refund" })),
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
        }, items: {
            $ifNull: [
                {
                    $let: {
                        vars: {
                            // Get entry delete status
                            entryDeleted: DocHistory_1.default.getPresentValueExpression("deleted", {
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
                                        Object.assign({}, DocHistory_1.default.getPresentValues((function* () {
                                            const obj = {
                                                total: null,
                                                department: null,
                                                category: null,
                                                description: null,
                                                deleted: null,
                                                units: 1,
                                            };
                                            for (const [key, value] of iterableFns_1.iterateOwnKeyValues(obj)) {
                                                if (value === null) {
                                                    yield key;
                                                }
                                                else {
                                                    yield [key, { defaultValue: value }];
                                                }
                                            }
                                        })(), { asVar: "item" })),
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
        }, id: "$_id" }),
};
exports.entryTransmutationsStage = {
    $addFields: {
        id: { $toString: "$id" },
        type: {
            $switch: {
                branches: [
                    { case: { $eq: ["$type", "credit"] }, then: graphTypes_1.JournalEntryType.Credit },
                    { case: { $eq: ["$type", "debit"] }, then: graphTypes_1.JournalEntryType.Debit },
                ],
                default: "$type",
            },
        },
        date: { $toString: "$date" },
        dateOfRecord: {
            $cond: {
                if: {
                    $ifNull: ["$dateOfRecord.date", false],
                },
                then: {
                    date: { $toString: "$dateOfRecord.date" },
                    overrideFiscalYear: "$dateOfRecord.overrideFiscalYear",
                    deleted: "$dateOfRecord.deleted",
                },
                else: null,
            },
        },
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
const getRefundTotals = (exclude = []) => {
    const $eq = [
        DocHistory_1.default.getPresentValueExpression("deleted", {
            defaultValue: false,
            asVar: "refund",
        }),
        false,
    ];
    const condition = exclude.length > 0
        ? {
            $and: [
                { $eq },
                {
                    $not: {
                        $in: ["$$refund.id", exclude.map((id) => new mongodb_1.ObjectId(id))],
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
                            in: DocHistory_1.default.getPresentValueExpression("total", {
                                defaultValue: { s: 1, n: 0, d: 1 },
                                asVar: "refund",
                            }),
                        },
                    },
                    [],
                ],
            },
        },
    };
};
exports.getRefundTotals = getRefundTotals;
const getItemTotals = (exclude = []) => {
    const $eq = [
        DocHistory_1.default.getPresentValueExpression("deleted", {
            defaultValue: true,
            asVar: "item",
        }),
        false,
    ];
    const condition = exclude.length > 0
        ? {
            $and: [
                { $eq },
                {
                    $not: {
                        $in: ["$$item.id", exclude.map((id) => new mongodb_1.ObjectId(id))],
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
                            in: DocHistory_1.default.getPresentValueExpression("total", {
                                defaultValue: { s: 1, n: 0, d: 1 },
                                asVar: "item",
                            }),
                        },
                    },
                    [],
                ],
            },
        },
    };
};
exports.getItemTotals = getItemTotals;
exports.stages = {
    entryAddFields: exports.entryAddFieldsStage,
    entryTransmutations: exports.entryTransmutationsStage,
    entryTotal: {
        $addFields: {
            entryTotal: DocHistory_1.default.getPresentValueExpression("total", {
                defaultValue: { s: 1, n: 0, d: 1 },
            }),
        },
    },
    refundTotals: exports.getRefundTotals(),
    itemTotals: exports.getItemTotals(),
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXRpbHMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvcmVzb2x2ZXJzL2pvdXJuYWxFbnRyeS91dGlscy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFDQSxxQ0FBbUQ7QUFDbkQsaURBTTBCO0FBRTFCLG9EQUE2RTtBQUM3RSx5REFBOEQ7QUFFakQsUUFBQSxTQUFTLEdBQUc7SUFDdkIsVUFBVSxFQUFFO1FBQ1YsRUFBRSxFQUFFLEVBQUUsU0FBUyxFQUFFLE1BQU0sRUFBRTtRQUN6QixJQUFJLEVBQUUsRUFBRSxZQUFZLEVBQUUsQ0FBQyxhQUFhLEVBQUUsQ0FBQyxDQUFDLEVBQUU7UUFDMUMsVUFBVSxFQUFFLEVBQUUsWUFBWSxFQUFFLENBQUMsbUJBQW1CLEVBQUUsQ0FBQyxDQUFDLEVBQUU7UUFDdEQsUUFBUSxFQUFFLEVBQUUsWUFBWSxFQUFFLENBQUMsaUJBQWlCLEVBQUUsQ0FBQyxDQUFDLEVBQUU7UUFDbEQsYUFBYSxFQUFFLEVBQUUsWUFBWSxFQUFFLENBQUMsc0JBQXNCLEVBQUUsQ0FBQyxDQUFDLEVBQUU7UUFDNUQsS0FBSyxFQUFFLEVBQUUsWUFBWSxFQUFFLENBQUMsY0FBYyxFQUFFLENBQUMsQ0FBQyxFQUFFO1FBQzVDLE1BQU0sRUFBRSxFQUFFLFlBQVksRUFBRSxDQUFDLGVBQWUsRUFBRSxDQUFDLENBQUMsRUFBRTtRQUM5QyxVQUFVLEVBQUUsRUFBRSxZQUFZLEVBQUUsQ0FBQyxtQkFBbUIsRUFBRSxDQUFDLENBQUMsRUFBRTtRQUN0RCxXQUFXLEVBQUU7WUFDWCxPQUFPLEVBQUUsQ0FBQyxFQUFFLFlBQVksRUFBRSxDQUFDLG9CQUFvQixFQUFFLENBQUMsQ0FBQyxFQUFFLEVBQUUsSUFBSSxDQUFDO1NBQzdEO1FBQ0QsSUFBSSxFQUFFLEVBQUUsWUFBWSxFQUFFLENBQUMsYUFBYSxFQUFFLENBQUMsQ0FBQyxFQUFFO1FBQzFDLE9BQU8sRUFBRSxFQUFFLFlBQVksRUFBRSxDQUFDLGdCQUFn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