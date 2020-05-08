import { O } from "ts-toolbelt";
import { Collection, Db, ObjectID } from "mongodb";
import { JournalEntrySourceType, JournalEntryType } from "../../graphTypes";
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
export declare const getSrcCollectionAndNode: (db: Db, sourceType: JournalEntrySourceType, nodeMap: {
    id: Map<string, import("../../types").NodeInfo>;
    typename: Map<string, import("../../types").NodeInfo>;
}) => {
    collection: Collection<any>;
    node: ObjectID;
};
export declare const entryAddFieldsStage: {
    readonly $addFields: {
        readonly refunds: {
            readonly $ifNull: readonly [{
                readonly $let: {
                    readonly vars: {
                        readonly entryDeleted: import("../utils/DocHistory").PresentValueExpression;
                    };
                    readonly in: {
                        readonly $map: {
                            readonly input: "$refunds";
                            readonly as: "refund";
                            readonly in: {
                                readonly $mergeObjects: readonly ["$$refund", {
                                    readonly [x: string]: import("../utils/DocHistory").PresentValueExpression;
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
    };
};
export declare const getRefundTotals: (exclude?: (string | ObjectID)[]) => {
    readonly $addFields: {
        readonly refundTotal: {
            readonly $reduce: {
                readonly input: "$refunds";
                readonly initialValue: 0;
                readonly in: {
                    readonly $sum: readonly ["$$value", {
                        readonly $let: {
                            readonly vars: {
                                readonly total: {
                                    readonly $cond: {
                                        readonly if: {
                                            $and: ({
                                                $eq: (boolean | import("../utils/DocHistory").PresentValueExpression)[];
                                                $not?: undefined;
                                            } | {
                                                $not: {
                                                    $in: (string | ObjectID[])[];
                                                };
                                                $eq?: undefined;
                                            })[];
                                            $eq?: undefined;
                                        } | {
                                            $eq: (boolean | import("../utils/DocHistory").PresentValueExpression)[];
                                            $and?: undefined;
                                        };
                                        readonly then: import("../utils/DocHistory").PresentValueExpression;
                                        readonly else: {
                                            readonly num: 0;
                                            readonly den: 1;
                                        };
                                    };
                                };
                            };
                            readonly in: {
                                readonly $divide: readonly ["$$total.num", "$$total.den"];
                            };
                        };
                    }];
                };
            };
        };
    };
};
export declare const stages: {
    readonly entryAddFields: {
        readonly $addFields: {
            readonly refunds: {
                readonly $ifNull: readonly [{
                    readonly $let: {
                        readonly vars: {
                            readonly entryDeleted: import("../utils/DocHistory").PresentValueExpression;
                        };
                        readonly in: {
                            readonly $map: {
                                readonly input: "$refunds";
                                readonly as: "refund";
                                readonly in: {
                                    readonly $mergeObjects: readonly ["$$refund", {
                                        readonly [x: string]: import("../utils/DocHistory").PresentValueExpression;
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
        };
    };
    readonly entryTotal: {
        readonly $addFields: {
            readonly entryTotal: {
                readonly $let: {
                    readonly vars: {
                        readonly total: import("../utils/DocHistory").PresentValueExpression;
                    };
                    readonly in: {
                        readonly $divide: readonly ["$$total.num", "$$total.den"];
                    };
                };
            };
        };
    };
    readonly refundTotal: {
        readonly $addFields: {
            readonly refundTotal: {
                readonly $reduce: {
                    readonly input: "$refunds";
                    readonly initialValue: 0;
                    readonly in: {
                        readonly $sum: readonly ["$$value", {
                            readonly $let: {
                                readonly vars: {
                                    readonly total: {
                                        readonly $cond: {
                                            readonly if: {
                                                $and: ({
                                                    $eq: (boolean | import("../utils/DocHistory").PresentValueExpression)[];
                                                    $not?: undefined;
                                                } | {
                                                    $not: {
                                                        $in: (string | ObjectID[])[];
                                                    };
                                                    $eq?: undefined;
                                                })[];
                                                $eq?: undefined;
                                            } | {
                                                $eq: (boolean | import("../utils/DocHistory").PresentValueExpression)[];
                                                $and?: undefined;
                                            };
                                            readonly then: import("../utils/DocHistory").PresentValueExpression;
                                            readonly else: {
                                                readonly num: 0;
                                                readonly den: 1;
                                            };
                                        };
                                    };
                                };
                                readonly in: {
                                    readonly $divide: readonly ["$$total.num", "$$total.den"];
                                };
                            };
                        }];
                    };
                };
            };
        };
    };
};
