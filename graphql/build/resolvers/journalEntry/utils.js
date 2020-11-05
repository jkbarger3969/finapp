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
exports.getSrcCollectionAndNode = (db, sourceType, nodeMap) => {
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
exports.getRefundTotals = (exclude = []) => {
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
exports.getItemTotals = (exclude = []) => {
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXRpbHMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvcmVzb2x2ZXJzL2pvdXJuYWxFbnRyeS91dGlscy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFDQSxxQ0FBbUQ7QUFDbkQsaURBTTBCO0FBRTFCLG9EQUE2RTtBQUM3RSx5REFJaUM7QUFFcEIsUUFBQSxTQUFTLEdBQUc7SUFDdkIsVUFBVSxFQUFFO1FBQ1YsRUFBRSxFQUFFLEVBQUUsU0FBUyxFQUFFLE1BQU0sRUFBRTtRQUN6QixJQUFJLEVBQUUsRUFBRSxZQUFZLEVBQUUsQ0FBQyxhQUFhLEVBQUUsQ0FBQyxDQUFDLEVBQUU7UUFDMUMsVUFBVSxFQUFFLEVBQUUsWUFBWSxFQUFFLENBQUMsbUJBQW1CLEVBQUUsQ0FBQyxDQUFDLEVBQUU7UUFDdEQsUUFBUSxFQUFFLEVBQUUsWUFBWSxFQUFFLENBQUMsaUJBQWlCLEVBQUUsQ0FBQyxDQUFDLEVBQUU7UUFDbEQsYUFBYSxFQUFFLEVBQUUsWUFBWSxFQUFFLENBQUMsc0JBQXNCLEVBQUUsQ0FBQyxDQUFDLEVBQUU7UUFDNUQsS0FBSyxFQUFFLEVBQUUsWUFBWSxFQUFFLENBQUMsY0FBYyxFQUFFLENBQUMsQ0FBQyxFQUFFO1FBQzVDLE1BQU0sRUFBRSxFQUFFLFlBQVksRUFBRSxDQUFDLGVBQWUsRUFBRSxDQUFDLENBQUMsRUFBRTtRQUM5QyxVQUFVLEVBQUUsRUFBRSxZQUFZLEVBQUUsQ0FBQyxtQkFBbUIsRUFBRSxDQUFDLENBQUMsRUFBRTtRQUN0RCxXQUFXLEVBQUU7WUFDWCxPQUFPLEVBQUUsQ0FBQyxFQUFFLFlBQVksRUFBRSxDQUFDLG9CQUFvQixFQUFFLENBQUMsQ0FBQyxFQUFFLEVBQUUsSUFBSSxDQUFDO1NBQzdEO1FBQ0QsSUFBSSxFQUFFLEVBQUUsWUFBWSxFQUFFLENBQUMsYUFBYSxFQUFFLENBQUMsQ0FBQyxFQUFFO1FBQzFDLE9BQU8sRUFBRSxFQUFFLFlBQVksRUFBRSxDQUFDLGdCQUFn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