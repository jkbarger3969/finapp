"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongodb_1 = require("mongodb");
const graphTypes_1 = require("../../graphTypes");
const DocHistory_1 = require("../utils/DocHistory");
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
        node: new mongodb_1.ObjectID(id),
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
    })())), { refunds: {
            $ifNull: [
                {
                    $let: {
                        vars: {
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
exports.getRefundTotals = (exclude = []) => {
    const $eq = [
        DocHistory_1.default.getPresentValueExpression("deleted", {
            defaultValue: true,
            asVar: "this",
        }),
        false,
    ];
    const condition = exclude.length > 0
        ? {
            $and: [
                { $eq },
                {
                    $not: {
                        $in: ["$$this.id", exclude.map((id) => new mongodb_1.ObjectID(id))],
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
                                                then: DocHistory_1.default.getPresentValueExpression("total", {
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
    };
};
exports.stages = {
    entryAddFields: exports.entryAddFieldsStage,
    entryTransmutations: exports.entryTransmutationsStage,
    entryTotal: {
        $addFields: {
            entryTotal: {
                $let: {
                    vars: {
                        total: DocHistory_1.default.getPresentValueExpression("total", {
                            defaultValue: { num: 0, den: 1 },
                        }),
                    },
                    in: { $divide: ["$$total.num", "$$total.den"] },
                },
            },
        },
    },
    refundTotal: exports.getRefundTotals(),
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXRpbHMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvcmVzb2x2ZXJzL2pvdXJuYWxFbnRyeS91dGlscy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUNBLHFDQUFtRDtBQUNuRCxpREFLMEI7QUFFMUIsb0RBQTZDO0FBRWhDLFFBQUEsU0FBUyxHQUFHO0lBQ3ZCLFVBQVUsRUFBRTtRQUNWLEVBQUUsRUFBRSxFQUFFLFNBQVMsRUFBRSxNQUFNLEVBQUU7UUFDekIsSUFBSSxFQUFFLEVBQUUsWUFBWSxFQUFFLENBQUMsYUFBYSxFQUFFLENBQUMsQ0FBQyxFQUFFO1FBQzFDLFVBQVUsRUFBRSxFQUFFLFlBQVksRUFBRSxDQUFDLG1CQUFtQixFQUFFLENBQUMsQ0FBQyxFQUFFO1FBQ3RELFFBQVEsRUFBRSxFQUFFLFlBQVksRUFBRSxDQUFDLGlCQUFpQixFQUFFLENBQUMsQ0FBQyxFQUFFO1FBQ2xELGFBQWEsRUFBRSxFQUFFLFlBQVksRUFBRSxDQUFDLHNCQUFzQixFQUFFLENBQUMsQ0FBQyxFQUFFO1FBQzVELEtBQUssRUFBRSxFQUFFLFlBQVksRUFBRSxDQUFDLGNBQWMsRUFBRSxDQUFDLENBQUMsRUFBRTtRQUM1QyxNQUFNLEVBQUUsRUFBRSxZQUFZLEVBQUUsQ0FBQyxlQUFlLEVBQUUsQ0FBQyxDQUFDLEVBQUU7UUFDOUMsVUFBVSxFQUFFLEVBQUUsWUFBWSxFQUFFLENBQUMsbUJBQW1CLEVBQUUsQ0FBQyxDQUFDLEVBQUU7UUFDdEQsV0FBVyxFQUFFO1lBQ1gsT0FBTyxFQUFFLENBQUMsRUFBRSxZQUFZLEVBQUUsQ0FBQyxvQkFBb0IsRUFBRSxDQUFDLENBQUMsRUFBRSxFQUFFLElBQUksQ0FBQztTQUM3RDtRQUNELElBQUksRUFBRSxFQUFFLFlBQVksRUFBRSxDQUFDLGFBQWEsRUFBRSxDQUFDLENBQUMsRUFBRTtRQUMxQyxPQUFPLEVBQUUsRUFBRSxZQUFZLEVBQUUsQ0FBQyxnQkFBZ0IsRUFBRSxDQUFDLENB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