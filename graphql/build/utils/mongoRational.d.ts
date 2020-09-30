import { QuerySelector } from "mongodb";
export interface MongoRational {
    s: 1 | -1;
    n: number;
    d: number;
}
export declare type MongoDbEqualityAndRangeOps = Extract<keyof QuerySelector<unknown>, "$eq" | "$gt" | "$gte" | "$lt" | "$lte" | "$ne">;
export declare type MongoDbSetOps = Extract<keyof QuerySelector<unknown>, "$in" | "$nin">;
/**
 * @returns a mongodb [$expr](https://docs.mongodb.com/manual/reference/operator/query/expr/) value.
 *
 */
declare const compareRationalEqualityAndRanges: (lhsFractionField: string | [string, number], equalityOrRangeOp: "$eq" | "$gt" | "$gte" | "$lt" | "$lte" | "$ne", rhsFraction: MongoRational) => {
    [x: string]: (number | {
        $subtract: {
            $multiply: (string | number)[];
        }[];
    })[];
} | {
    readonly $let: {
        readonly vars: {
            readonly lhs: {
                readonly $arrayElemAt: readonly [string, string | number];
            };
        };
        readonly in: {
            [x: string]: (number | {
                $subtract: {
                    $multiply: (string | number)[];
                }[];
            })[];
        };
    };
};
/**
 * @returns a mongodb [$expr](https://docs.mongodb.com/manual/reference/operator/query/expr/) value.
 *
 */
declare const compareRationalSet: (fractionField: string | [string, number], setOp: "$in" | "$nin", fractionSet: Iterable<MongoRational>) => {
    readonly $anyElementTrue: readonly [({
        [x: string]: (number | {
            $subtract: {
                $multiply: (string | number)[];
            }[];
        })[];
    } | {
        readonly $let: {
            readonly vars: {
                readonly lhs: {
                    readonly $arrayElemAt: readonly [string, string | number];
                };
            };
            readonly in: {
                [x: string]: (number | {
                    $subtract: {
                        $multiply: (string | number)[];
                    }[];
                })[];
            };
        };
    })[]];
    readonly $not?: undefined;
} | {
    readonly $not: readonly [{
        readonly $anyElementTrue: readonly [({
            [x: string]: (number | {
                $subtract: {
                    $multiply: (string | number)[];
                }[];
            })[];
        } | {
            readonly $let: {
                readonly vars: {
                    readonly lhs: {
                        readonly $arrayElemAt: readonly [string, string | number];
                    };
                };
                readonly in: {
                    [x: string]: (number | {
                        $subtract: {
                            $multiply: (string | number)[];
                        }[];
                    })[];
                };
            };
        })[]];
    }];
    readonly $anyElementTrue?: undefined;
};
/**
 * @returns a mongodb [$expr](https://docs.mongodb.com/manual/reference/operator/query/expr/) value.
 * @param fractionField when field is at array element, [field, index]
 */
export declare function rationalComparison(lhsFractionField: string | [string, number], equalityOrRangeOp: MongoDbEqualityAndRangeOps, rhsFraction: MongoRational): ReturnType<typeof compareRationalEqualityAndRanges>;
export declare function rationalComparison(fractionField: string | [string, number], setOp: MongoDbSetOps, fractionSet: Iterable<MongoRational>): ReturnType<typeof compareRationalSet>;
export {};
