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
 * - Any [$let]{@link https://docs.mongodb.com/manual/reference/operator/aggregation/let/} vars expression that returns a Rational or array of Rationals.
 * */
export declare type RationalValue = Rational | object | string;
/**
 * @returns a mongodb [$expr](https://docs.mongodb.com/manual/reference/operator/query/expr/) value.
 *
 */
declare const compareRationalEqualityAndRanges: (lhs: RationalValue, comparisonOp: ComparisonOps, rhs: RationalValue) => {
    $let: {
        vars: {
            lhs: {
                $let: {
                    vars: {
                        rational: RationalValue;
                    };
                    in: {
                        $cond: (string | string[] | {
                            $isArray: string;
                        })[];
                    };
                };
            };
            rhs: {
                $let: {
                    vars: {
                        rational: RationalValue;
                    };
                    in: {
                        $cond: (string | string[] | {
                            $isArray: string;
                        })[];
                    };
                };
            };
        };
        in: {
            $reduce: {
                input: string;
                initialValue: boolean;
                in: {
                    $cond: (string | boolean | {
                        $let: {
                            vars: {
                                lhs: string;
                            };
                            in: {
                                $reduce: {
                                    input: string;
                                    initialValue: boolean;
                                    in: {
                                        $cond: (string | boolean | {
                                            [x: string]: (number | {
                                                $subtract: {
                                                    $multiply: string[];
                                                }[];
                                            })[];
                                        })[];
                                    };
                                };
                            };
                        };
                    })[];
                };
            };
        };
    };
};
/**
 * @returns a mongodb [$expr](https://docs.mongodb.com/manual/reference/operator/query/expr/) value.
 *
 */
declare const compareRationalSet: (lhs: RationalValue, setOp: SetOps, rationalSet: Iterable<RationalValue>) => {
    readonly $anyElementTrue: readonly [{
        $let: {
            vars: {
                lhs: {
                    $let: {
                        vars: {
                            rational: RationalValue;
                        };
                        in: {
                            $cond: (string | string[] | {
                                $isArray: string;
                            })[];
                        };
                    };
                };
                rhs: {
                    $let: {
                        vars: {
                            rational: RationalValue;
                        };
                        in: {
                            $cond: (string | string[] | {
                                $isArray: string;
                            })[];
                        };
                    };
                };
            };
            in: {
                $reduce: {
                    input: string;
                    initialValue: boolean;
                    in: {
                        $cond: (string | boolean | {
                            $let: {
                                vars: {
                                    lhs: string;
                                };
                                in: {
                                    $reduce: {
                                        input: string;
                                        initialValue: boolean;
                                        in: {
                                            $cond: (string | boolean | {
                                                [x: string]: (number | {
                                                    $subtract: {
                                                        $multiply: string[];
                                                    }[];
                                                })[];
                                            })[];
                                        };
                                    };
                                };
                            };
                        })[];
                    };
                };
            };
        };
    }[]];
    readonly $not?: undefined;
} | {
    readonly $not: readonly [{
        readonly $anyElementTrue: readonly [{
            $let: {
                vars: {
                    lhs: {
                        $let: {
                            vars: {
                                rational: RationalValue;
                            };
                            in: {
                                $cond: (string | string[] | {
                                    $isArray: string;
                                })[];
                            };
                        };
                    };
                    rhs: {
                        $let: {
                            vars: {
                                rational: RationalValue;
                            };
                            in: {
                                $cond: (string | string[] | {
                                    $isArray: string;
                                })[];
                            };
                        };
                    };
                };
                in: {
                    $reduce: {
                        input: string;
                        initialValue: boolean;
                        in: {
                            $cond: (string | boolean | {
                                $let: {
                                    vars: {
                                        lhs: string;
                                    };
                                    in: {
                                        $reduce: {
                                            input: string;
                                            initialValue: boolean;
                                            in: {
                                                $cond: (string | boolean | {
                                                    [x: string]: (number | {
                                                        $subtract: {
                                                            $multiply: string[];
                                                        }[];
                                                    })[];
                                                })[];
                                            };
                                        };
                                    };
                                };
                            })[];
                        };
                    };
                };
            };
        }[]];
    }];
    readonly $anyElementTrue?: undefined;
};
/**
 * @returns a mongodb [$expr](https://docs.mongodb.com/manual/reference/operator/query/expr/) value.
 */
export declare function rationalComparison(lhs: RationalValue, op: ComparisonOps, rhs: RationalValue): ReturnType<typeof compareRationalEqualityAndRanges>;
export declare function rationalComparison(lhs: RationalValue, op: SetOps, rhs: Iterable<RationalValue>): ReturnType<typeof compareRationalSet>;
export {};
