import { QuerySelector } from "mongodb";

export interface MongoRational {
  s: 1 | -1;
  n: number;
  d: number;
}

// https://docs.mongodb.com/manual/reference/operator/query-comparison/index.html
export type MongoDbEqualityAndRangeOps = Extract<
  keyof QuerySelector<unknown>,
  "$eq" | "$gt" | "$gte" | "$lt" | "$lte" | "$ne"
>;
export type MongoDbSetOps = Extract<
  keyof QuerySelector<unknown>,
  "$in" | "$nin"
>;

/**
 * @returns a mongodb [$expr](https://docs.mongodb.com/manual/reference/operator/query/expr/) value.
 *
 */
const compareRationalEqualityAndRanges = (
  lhsFractionField: string | [string, number],
  equalityOrRangeOp: MongoDbEqualityAndRangeOps,
  rhsFraction: MongoRational
) => {
  const { s, n, d } = rhsFraction;

  const isElemAtIndex = Array.isArray(lhsFractionField);

  const lhs = isElemAtIndex ? "$lhs" : (lhsFractionField as string);

  const expression = {
    [equalityOrRangeOp]: [
      {
        $subtract: [
          {
            $multiply: [`$${lhs}.s`, `$${lhs}.n`, d],
          },
          { $multiply: [s, n, `$${lhs}.d`] },
        ],
      },
      0,
    ],
  };

  // lhsFractionField at array elem
  if (isElemAtIndex) {
    return {
      $let: {
        vars: {
          lhs: {
            $arrayElemAt: [`$${lhsFractionField[0]}`, lhsFractionField[1]],
          },
        },
        in: expression,
      },
    } as const;
  }

  return expression;
};

/**
 * @returns a mongodb [$expr](https://docs.mongodb.com/manual/reference/operator/query/expr/) value.
 *
 */
const compareRationalSet = (
  fractionField: string | [string, number],
  setOp: MongoDbSetOps,
  fractionSet: Iterable<MongoRational>
) => {
  const anyElementTrueExpr: ReturnType<
    typeof compareRationalEqualityAndRanges
  >[] = [];

  for (const rhsFraction of fractionSet) {
    anyElementTrueExpr.push(
      compareRationalEqualityAndRanges(fractionField, "$eq", rhsFraction)
    );
  }

  switch (setOp) {
    case "$in":
      return { $anyElementTrue: [anyElementTrueExpr] } as const;
    case "$nin":
      return { $not: [{ $anyElementTrue: [anyElementTrueExpr] }] } as const;
  }
};

/**
 * @returns a mongodb [$expr](https://docs.mongodb.com/manual/reference/operator/query/expr/) value.
 * @param fractionField when field is at array element, [field, index]
 */
export function rationalComparison(
  lhsFractionField: string | [string, number],
  equalityOrRangeOp: MongoDbEqualityAndRangeOps,
  rhsFraction: MongoRational
): ReturnType<typeof compareRationalEqualityAndRanges>;
export function rationalComparison(
  fractionField: string | [string, number],
  setOp: MongoDbSetOps,
  fractionSet: Iterable<MongoRational>
): ReturnType<typeof compareRationalSet>;
export function rationalComparison(
  fractionField: string | [string, number],
  comparisonOp: MongoDbEqualityAndRangeOps | MongoDbSetOps,
  compareToFractions: MongoRational | Iterable<MongoRational>
):
  | ReturnType<typeof compareRationalEqualityAndRanges>
  | ReturnType<typeof compareRationalSet> {
  switch (comparisonOp) {
    case "$in":
    case "$nin":
      return compareRationalSet(
        fractionField,
        comparisonOp,
        compareToFractions as Iterable<MongoRational>
      );
    default:
      return compareRationalEqualityAndRanges(
        fractionField,
        comparisonOp,
        compareToFractions as MongoRational
      );
  }
}
