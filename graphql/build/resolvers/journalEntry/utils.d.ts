import { O } from "ts-toolbelt";
import { Collection, Db, ObjectId } from "mongodb";
import { JournalEntrySourceType, JournalEntryType } from "../../graphTypes";
import { Context } from "../../types";
export declare const addFields: {
    $addFields: {
        id: {
            $toString: string;
        };
        type: {
            $arrayElemAt: (string | number)[];
        };
        department: {
            $arrayElemAt: (string | number)[];
        };
        category: {
            $arrayElemAt: (string | number)[];
        };
        paymentMethod: {
            $arrayElemAt: (string | number)[];
        };
        total: {
            $arrayElemAt: (string | number)[];
        };
        source: {
            $arrayElemAt: (string | number)[];
        };
        reconciled: {
            $arrayElemAt: (string | number)[];
        };
        description: {
            $ifNull: {
                $arrayElemAt: (string | number)[];
            }[];
        };
        date: {
            $arrayElemAt: (string | number)[];
        };
        deleted: {
            $arrayElemAt: (string | number)[];
        };
    };
};
export declare type addFields = O.Readonly<typeof addFields, keyof typeof addFields, "deep">;
export declare type project = O.Readonly<typeof project, keyof typeof project, "deep">;
export declare const project: {
    $project: {
        parent: boolean;
        createdBy: boolean;
    };
};
export declare const getSrcCollectionAndNode: (db: Db, sourceType: JournalEntrySourceType, nodeMap: Context["nodeMap"]) => {
    collection: Collection;
    node: ObjectId;
};
export declare const entryAddFieldsStage: {
    readonly $addFields: {
        readonly dateOfRecord: {
            readonly $cond: {
                readonly if: {
                    readonly $ifNull: readonly [import("../utils/DocHistory").PresentValueExpression<null>, false];
                };
                readonly then: {
                    readonly [x: string]: import("../utils/DocHistory").PresentValueExpression<null>;
                };
                readonly else: any;
            };
        };
        readonly refunds: {
            readonly $ifNull: readonly [{
                readonly $let: {
                    readonly vars: {
                        readonly entryDeleted: import("../utils/DocHistory").PresentValueExpression<boolean>;
                    };
                    readonly in: {
                        readonly $map: {
                            readonly input: "$refunds";
                            readonly as: "refund";
                            readonly in: {
                                readonly $mergeObjects: readonly ["$$refund", {
                                    readonly [x: string]: import("../utils/DocHistory").PresentValueExpression<null>;
                                }, {
                                    readonly $cond: {
                                        readonly if: "$$entryDeleted";
                                        readonly then: {
                                            readonly deleted: true;
                                        };
                                        readonly else: {};
                                    };
                                }];
                            };
                        };
                    };
                };
            }, readonly []];
        };
        readonly items: {
            readonly $ifNull: readonly [{
                readonly $let: {
                    readonly vars: {
                        readonly entryDeleted: import("../utils/DocHistory").PresentValueExpression<boolean>;
                    };
                    readonly in: {
                        readonly $map: {
                            readonly input: "$items";
                            readonly as: "item";
                            readonly in: {
                                readonly $mergeObjects: readonly ["$$item", {
                                    readonly [x: string]: import("../utils/DocHistory").PresentValueExpression<null>;
                                }, {
                                    readonly $cond: {
                                        readonly if: "$$entryDeleted";
                                        readonly then: {
                                            readonly deleted: true;
                                        };
                                        readonly else: {};
                                    };
                                }];
                            };
                        };
                    };
                };
            }, readonly []];
        };
        readonly id: "$_id";
    };
};
export declare const entryTransmutationsStage: {
    $addFields: {
        id: {
            $toString: string;
        };
        type: {
            $switch: {
                branches: {
                    case: {
                        $eq: string[];
                    };
                    then: JournalEntryType;
                }[];
                default: string;
            };
        };
        date: {
            $toString: string;
        };
        dateOfRecord: {
            $cond: {
                if: {
                    $ifNull: (string | boolean)[];
                };
                then: {
                    date: {
                        $toString: string;
                    };
                    overrideFiscalYear: string;
                    deleted: string;
                };
                else: any;
            };
        };
        lastUpdate: {
            $toString: string;
        };
        refunds: {
            $map: {
                input: string;
                as: string;
                in: {
                    $mergeObjects: (string | {
                        id: {
                            $toString: string;
                        };
                        date: {
                            $toString: string;
                        };
                        lastUpdate: {
                            $toString: string;
                        };
                    })[];
                };
            };
        };
        items: {
            $map: {
                input: string;
                as: string;
                in: {
                    $mergeObjects: (string | {
                        id: {
                            $toString: string;
                        };
                        date: {
                            $toString: string;
                        };
                        lastUpdate: {
                            $toString: string;
                        };
                    })[];
                };
            };
        };
    };
};
export declare const getRefundTotals: (exclude?: (ObjectId | string)[]) => {
    readonly $addFields: {
        readonly refundTotals: {
            readonly $ifNull: readonly [{
                readonly $map: {
                    readonly input: {
                        readonly $filter: {
                            readonly input: "$refunds";
                            readonly as: "refund";
                            readonly cond: {
                                $and: ({
                                    $eq: (boolean | import("../utils/DocHistory").PresentValueExpression<boolean>)[];
                                    readonly $not?: undefined;
                                } | {
                                    $not: {
                                        $in: (string | ObjectId[])[];
                                    };
                                    $eq?: undefined;
                                })[];
                                $eq?: undefined;
                            } | {
                                $eq: (boolean | import("../utils/DocHistory").PresentValueExpression<boolean>)[];
                                $and?: undefined;
                            };
                        };
                    };
                    readonly as: "refund";
                    readonly in: import("../utils/DocHistory").PresentValueExpression<{
                        s: number;
                        n: number;
                        d: number;
                    }>;
                };
            }, readonly []];
        };
    };
};
export declare const getItemTotals: (exclude?: (ObjectId | string)[]) => {
    readonly $addFields: {
        readonly itemTotals: {
            readonly $ifNull: readonly [{
                readonly $map: {
                    readonly input: {
                        readonly $filter: {
                            readonly input: "$items";
                            readonly as: "item";
                            readonly cond: {
                                $and: ({
                                    $eq: (boolean | import("../utils/DocHistory").PresentValueExpression<boolean>)[];
                                    readonly $not?: undefined;
                                } | {
                                    $not: {
                                        $in: (string | ObjectId[])[];
                                    };
                                    $eq?: undefined;
                                })[];
                                $eq?: undefined;
                            } | {
                                $eq: (boolean | import("../utils/DocHistory").PresentValueExpression<boolean>)[];
                                $and?: undefined;
                            };
                        };
                    };
                    readonly as: "item";
                    readonly in: import("../utils/DocHistory").PresentValueExpression<{
                        s: number;
                        n: number;
                        d: number;
                    }>;
                };
            }, readonly []];
        };
    };
};
export declare const stages: {
    readonly entryAddFields: {
        readonly $addFields: {
            readonly dateOfRecord: {
                readonly $cond: {
                    readonly if: {
                        readonly $ifNull: readonly [import("../utils/DocHistory").PresentValueExpression<null>, false];
                    };
                    readonly then: {
                        readonly [x: string]: import("../utils/DocHistory").PresentValueExpression<null>;
                    };
                    readonly else: any;
                };
            };
            readonly refunds: {
                readonly $ifNull: readonly [{
                    readonly $let: {
                        readonly vars: {
                            readonly entryDeleted: import("../utils/DocHistory").PresentValueExpression<boolean>;
                        };
                        readonly in: {
                            readonly $map: {
                                readonly input: "$refunds";
                                readonly as: "refund";
                                readonly in: {
                                    readonly $mergeObjects: readonly ["$$refund", {
                                        readonly [x: string]: import("../utils/DocHistory").PresentValueExpression<null>;
                                    }, {
                                        readonly $cond: {
                                            readonly if: "$$entryDeleted";
                                            readonly then: {
                                                readonly deleted: true;
                                            };
                                            readonly else: {};
                                        };
                                    }];
                                };
                            };
                        };
                    };
                }, readonly []];
            };
            readonly items: {
                readonly $ifNull: readonly [{
                    readonly $let: {
                        readonly vars: {
                            readonly entryDeleted: import("../utils/DocHistory").PresentValueExpression<boolean>;
                        };
                        readonly in: {
                            readonly $map: {
                                readonly input: "$items";
                                readonly as: "item";
                                readonly in: {
                                    readonly $mergeObjects: readonly ["$$item", {
                                        readonly [x: string]: import("../utils/DocHistory").PresentValueExpression<null>;
                                    }, {
                                        readonly $cond: {
                                            readonly if: "$$entryDeleted";
                                            readonly then: {
                                                readonly deleted: true;
                                            };
                                            readonly else: {};
                                        };
                                    }];
                                };
                            };
                        };
                    };
                }, readonly []];
            };
            readonly id: "$_id";
        };
    };
    readonly entryTransmutations: {
        $addFields: {
            id: {
                $toString: string;
            };
            type: {
                $switch: {
                    branches: {
                        case: {
                            $eq: string[];
                        };
                        then: JournalEntryType;
                    }[];
                    default: string;
                };
            };
            date: {
                $toString: string;
            };
            dateOfRecord: {
                $cond: {
                    if: {
                        $ifNull: (string | boolean)[];
                    };
                    then: {
                        date: {
                            $toString: string;
                        };
                        overrideFiscalYear: string;
                        deleted: string;
                    };
                    else: any;
                };
            };
            lastUpdate: {
                $toString: string;
            };
            refunds: {
                $map: {
                    input: string;
                    as: string;
                    in: {
                        $mergeObjects: (string | {
                            id: {
                                $toString: string;
                            };
                            date: {
                                $toString: string;
                            };
                            lastUpdate: {
                                $toString: string;
                            };
                        })[];
                    };
                };
            };
            items: {
                $map: {
                    input: string;
                    as: string;
                    in: {
                        $mergeObjects: (string | {
                            id: {
                                $toString: string;
                            };
                            date: {
                                $toString: string;
                            };
                            lastUpdate: {
                                $toString: string;
                            };
                        })[];
                    };
                };
            };
        };
    };
    readonly entryTotal: {
        readonly $addFields: {
            readonly entryTotal: import("../utils/DocHistory").PresentValueExpression<{
                s: number;
                n: number;
                d: number;
            }>;
        };
    };
    readonly refundTotals: {
        readonly $addFields: {
            readonly refundTotals: {
                readonly $ifNull: readonly [{
                    readonly $map: {
                        readonly input: {
                            readonly $filter: {
                                readonly input: "$refunds";
                                readonly as: "refund";
                                readonly cond: {
                                    $and: ({
                                        $eq: (boolean | import("../utils/DocHistory").PresentValueExpression<boolean>)[];
                                        readonly $not?: undefined;
                                    } | {
                                        $not: {
                                            $in: (string | ObjectId[])[];
                                        };
                                        $eq?: undefined;
                                    })[];
                                    $eq?: undefined;
                                } | {
                                    $eq: (boolean | import("../utils/DocHistory").PresentValueExpression<boolean>)[];
                                    $and?: undefined;
                                };
                            };
                        };
                        readonly as: "refund";
                        readonly in: import("../utils/DocHistory").PresentValueExpression<{
                            s: number;
                            n: number;
                            d: number;
                        }>;
                    };
                }, readonly []];
            };
        };
    };
    readonly itemTotals: {
        readonly $addFields: {
            readonly itemTotals: {
                readonly $ifNull: readonly [{
                    readonly $map: {
                        readonly input: {
                            readonly $filter: {
                                readonly input: "$items";
                                readonly as: "item";
                                readonly cond: {
                                    $and: ({
                                        $eq: (boolean | import("../utils/DocHistory").PresentValueExpression<boolean>)[];
                                        readonly $not?: undefined;
                                    } | {
                                        $not: {
                                            $in: (string | ObjectId[])[];
                                        };
                                        $eq?: undefined;
                                    })[];
                                    $eq?: undefined;
                                } | {
                                    $eq: (boolean | import("../utils/DocHistory").PresentValueExpression<boolean>)[];
                                    $and?: undefined;
                                };
                            };
                        };
                        readonly as: "item";
                        readonly in: import("../utils/DocHistory").PresentValueExpression<{
                            s: number;
                            n: number;
                            d: number;
                        }>;
                    };
                }, readonly []];
            };
        };
    };
};
