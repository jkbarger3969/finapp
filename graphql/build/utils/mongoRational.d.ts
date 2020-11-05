import { QuerySelector } from "mongodb";
export interface MongoRational {
    s: 1 | -1;
    n: number;
    d: number;
}
export declare type MongoDbEqualityAndRangeOps = Extract<keyof QuerySelector<unknown>, "$eq" | "$gt" | "$gte" | "$lt" | "$lte" | "$ne">;
export declare type MongoDbSetOps = Extract<keyof QuerySelector<unknown>, "$in" | "$nin">;
export declare type RationalArg = MongoRational | string | [string, number];
/**
 * @returns a mongodb [$expr](https://docs.mongodb.com/manual/reference/operator/query/expr/) value.
 *
 */
declare const compareRationalEqualityAndRanges: (lhs: RationalArg, equalityOrRangeOp: MongoDbEqualityAndRangeOps, rhs: RationalArg) => {
    readonly [x: string]: readonly [{
        readonly $subtract: readonly [{
            readonly $multiply: readonly [string | 1 | -1, string | number, string | number];
        }, {
            readonly $multiply: readonly [string | 1 | -1, string | number, string | number];
        }];
    }, 0];
} | {
    readonly $let: {
        readonly vars: Record<string, {
            $arrayElemAt: [string, number];
        }>;
        readonly in: {
            readonly [x: string]: readonly [{
                readonly $subtract: readonly [{
                    readonly $multiply: readonly [string | 1 | -1, string | number, string | number];
                }, {
                    readonly $multiply: readonly [string | 1 | -1, string | number, string | number];
                }];
            }, 0];
        };
    };
};
/**
 * @returns a mongodb [$expr](https://docs.mongodb.com/manual/reference/operator/query/expr/) value.
 *
 */
declare const compareRationalSet: (lhs: RationalArg, setOp: MongoDbSetOps, rationalSet: Iterable<RationalArg>) => {
    readonly $anyElementTrue: readonly [({
        readonly [x: string]: readonly [{
            readonly $subtract: readonly [{
                readonly $multiply: readonly [string | 1 | -1, string | number, string | number];
            }, {
                readonly $multiply: readonly [string | 1 | -1, string | number, string | number];
            }];
        }, 0];
    } | {
        readonly $let: {
            readonly vars: Record<string, {
                $arrayElemAt: [string, number];
            }>;
            readonly in: {
                readonly [x: string]: readonly [{
                    readonly $subtract: readonly [{
                        readonly $multiply: readonly [string | 1 | -1, string | number, string | number];
                    }, {
                        readonly $multiply: readonly [string | 1 | -1, string | number, string | number];
                    }];
                }, 0];
            };
        };
    })[]];
    readonly $not?: undefined;
} | {
    readonly $not: readonly [{
        readonly $anyElementTrue: readonly [({
            readonly [x: string]: readonly [{
                readonly $subtract: readonly [{
                    readonly $multiply: readonly [string | 1 | -1, string | number, string | number];
                }, {
                    readonly $multiply: readonly [string | 1 | -1, string | number, string | number];
                }];
            }, 0];
        } | {
            readonly $let: {
                readonly vars: Record<string, {
                    $arrayElemAt: [string, number];
                }>;
                readonly in: {
                    readonly [x: string]: readonly [{
                        readonly $subtract: readonly [{
                            readonly $multiply: readonly [string | 1 | -1, string | number, string | number];
                        }, {
                            readonly $multiply: readonly [string | 1 | -1, string | number, string | number];
                        }];
                    }, 0];
                };
            };
        })[]];
    }];
    readonly $anyElementTrue?: undefined;
};
/**
 * @returns a mongodb [$expr](https://docs.mongodb.com/manual/reference/operator/query/expr/) value.
 * @param lhs when field is at array element, [field, index]
 */
export declare function rationalComparison(lhs: RationalArg, equalityOrRangeOp: MongoDbEqualityAndRangeOps, rhs: RationalArg): ReturnType<typeof compareRationalEqualityAndRanges>;
export declare function rationalComparison(lhs: RationalArg, setOp: MongoDbSetOps, rationalSet: Iterable<RationalArg>): ReturnType<typeof compareRationalSet>;
export declare const addRational: (a: RationalArg, b: RationalArg) => {
    $let: {
        vars: {
            addResult: {
                readonly n: {
                    readonly [x: string]: readonly [{
                        readonly $multiply: readonly [string | number, string | number, string | 1 | -1];
                    }, {
                        readonly $multiply: readonly [string | number, string | number, string | 1 | -1];
                    }];
                };
                readonly d: {
                    readonly $multiply: readonly [string | number, string | number];
                };
            } | {
                readonly $let: {
                    readonly vars: Record<string, {
                        $arrayElemAt: [string, number];
                    }>;
                    readonly in: {
                        readonly n: {
                            readonly [x: string]: readonly [{
                                readonly $multiply: readonly [string | number, string | number, string | 1 | -1];
                            }, {
                                readonly $multiply: readonly [string | number, string | number, string | 1 | -1];
                            }];
                        };
                        readonly d: {
                            readonly $multiply: readonly [string | number, string | number];
                        };
                    };
                };
            };
        };
        in: {
            $let: {
                vars: {
                    gcd: {
                        $function: {
                            body: string;
                            args: (string | {
                                $abs: string;
                            })[];
                            lang: string;
                        };
                    };
                };
                in: {
                    s: {
                        $cond: {
                            if: {
                                $gte: (string | number)[];
                            };
                            then: number;
                            else: number;
                        };
                    };
                    n: {
                        $divide: (string | {
                            $abs: string;
                        })[];
                    };
                    d: {
                        $divide: string[];
                    };
                };
            };
        };
    };
};
export declare const subtractRational: (a: RationalArg, b: RationalArg) => {
    $let: {
        vars: {
            addResult: {
                readonly n: {
                    readonly [x: string]: readonly [{
                        readonly $multiply: readonly [string | number, string | number, string | 1 | -1];
                    }, {
                        readonly $multiply: readonly [string | number, string | number, string | 1 | -1];
                    }];
                };
                readonly d: {
                    readonly $multiply: readonly [string | number, string | number];
                };
            } | {
                readonly $let: {
                    readonly vars: Record<string, {
                        $arrayElemAt: [string, number];
                    }>;
                    readonly in: {
                        readonly n: {
                            readonly [x: string]: readonly [{
                                readonly $multiply: readonly [string | number, string | number, string | 1 | -1];
                            }, {
                                readonly $multiply: readonly [string | number, string | number, string | 1 | -1];
                            }];
                        };
                        readonly d: {
                            readonly $multiply: readonly [string | number, string | number];
                        };
                    };
                };
            };
        };
        in: {
            $let: {
                vars: {
                    gcd: {
                        $function: {
                            body: string;
                            args: (string | {
                                $abs: string;
                            })[];
                            lang: string;
                        };
                    };
                };
                in: {
                    s: {
                        $cond: {
                            if: {
                                $gte: (string | number)[];
                            };
                            then: number;
                            else: number;
                        };
                    };
                    n: {
                        $divide: (string | {
                            $abs: string;
                        })[];
                    };
                    d: {
                        $divide: string[];
                    };
                };
            };
        };
    };
};
export {};
