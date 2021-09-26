import Fraction from "fraction.js";
export interface Rational {
    s: 1 | -1;
    n: number;
    d: number;
}
/**
 * Utility method to convert {@link Fraction} to {@link Rational}.
 */
export declare const fractionToRational: (fraction: Fraction) => Rational;
export declare type ComparisonOps = "$eq" | "$gt" | "$gte" | "$lt" | "$lte" | "$ne";
export declare type SetOps = "$in" | "$nin";
export declare type RationalOp = ComparisonOps | SetOps;
/**
 * - Rational number object.
 * - Path to a rational number object.
 * - Tuple of path to a rational number object and an $arrayElemAt idx.
 * */
export declare type RationalValue = Rational | string | [path: string, index: number];
/**
 * @returns a mongodb [$expr](https://docs.mongodb.com/manual/reference/operator/query/expr/) value.
 *
 */
declare const compareRationalEqualityAndRanges: (lhs: RationalValue, comparisonOp: ComparisonOps, rhs: RationalValue) => {
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
declare const compareRationalSet: (lhs: RationalValue, setOp: SetOps, rationalSet: Iterable<RationalValue>) => {
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
 */
export declare function rationalComparison(lhs: RationalValue, op: RationalOp, rhs: RationalValue): ReturnType<typeof compareRationalEqualityAndRanges>;
export declare function rationalComparison(lhs: RationalValue, op: RationalOp, rhs: Iterable<RationalValue>): ReturnType<typeof compareRationalSet>;
export declare const addRational: (a: RationalValue, b: RationalValue) => {
    $let: {
        vars: {
            arithmeticResult: {
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
export declare const subtractRational: (a: RationalValue, b: RationalValue) => {
    $let: {
        vars: {
            arithmeticResult: {
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
