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

export type RationalArg = MongoRational | string | [string, number];

const parseRationalArg = (
  rationalArg: RationalArg,
  asVar: string
): Readonly<
  [string | 1 | -1, string | number, string | number, string, number]
> => {
  if (typeof rationalArg === "string") {
    return [
      `$${rationalArg}.s`,
      `$${rationalArg}.n`,
      `$${rationalArg}.d`,
      "",
      -1,
    ] as const;
  } else if (Array.isArray(rationalArg)) {
    return [`$${asVar}.s`, `$${asVar}.n`, `$${asVar}.d`, ...rationalArg];
  } else {
    return [rationalArg.s, rationalArg.n, rationalArg.d, "", -1] as const;
  }
};

const createVarsAtIndexExpr = <T>(
  addVars: Iterable<{ path: string; index: number; asVar: string }>,
  expression: T
) => {
  const vars = {} as Record<
    string,
    {
      $arrayElemAt: [string, number];
    }
  >;

  for (const { asVar, path, index } of addVars) {
    vars[asVar] = {
      $arrayElemAt: [`$${path}`, index],
    };
  }

  return {
    $let: {
      vars,
      in: expression,
    },
  } as const;
};

/**
 * @returns a mongodb [$expr](https://docs.mongodb.com/manual/reference/operator/query/expr/) value.
 *
 */
const compareRationalEqualityAndRanges = (
  lhs: RationalArg,
  equalityOrRangeOp: MongoDbEqualityAndRangeOps,
  rhs: RationalArg
) => {
  const [sLhs, nLhs, dLhs, pathLhs, indexLhs] = parseRationalArg(lhs, "lhs");

  const [sRhs, nRhs, dRhs, pathRhs, indexRhs] = parseRationalArg(rhs, "rhs");

  const expression = {
    [equalityOrRangeOp]: [
      {
        $subtract: [
          {
            $multiply: [sLhs, nLhs, dRhs],
          },
          { $multiply: [sRhs, nRhs, dLhs] },
        ],
      },
      0,
    ],
  } as const;

  if (indexLhs > -1 || indexRhs > -1) {
    return createVarsAtIndexExpr(
      (function* () {
        if (indexLhs > -1) {
          yield {
            path: pathLhs,
            index: indexLhs,
            asVar: "lhs",
          };
        }

        if (indexRhs > -1) {
          yield {
            path: pathRhs,
            index: indexRhs,
            asVar: "rhs",
          };
        }
      })(),
      expression
    );
  } else {
    return expression;
  }
};

/**
 * @returns a mongodb [$expr](https://docs.mongodb.com/manual/reference/operator/query/expr/) value.
 *
 */
const compareRationalSet = (
  lhs: RationalArg,
  setOp: MongoDbSetOps,
  rationalSet: Iterable<RationalArg>
) => {
  const anyElementTrueExpr: ReturnType<
    typeof compareRationalEqualityAndRanges
  >[] = [];

  for (const rhs of rationalSet) {
    anyElementTrueExpr.push(compareRationalEqualityAndRanges(lhs, "$eq", rhs));
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
 * @param lhs when field is at array element, [field, index]
 */
export function rationalComparison(
  lhs: RationalArg,
  equalityOrRangeOp: MongoDbEqualityAndRangeOps,
  rhs: RationalArg
): ReturnType<typeof compareRationalEqualityAndRanges>;
export function rationalComparison(
  lhs: RationalArg,
  setOp: MongoDbSetOps,
  rationalSet: Iterable<RationalArg>
): ReturnType<typeof compareRationalSet>;
export function rationalComparison(
  lhs: RationalArg,
  comparisonOp: MongoDbEqualityAndRangeOps | MongoDbSetOps,
  compareToFractions: RationalArg | Iterable<RationalArg>
):
  | ReturnType<typeof compareRationalEqualityAndRanges>
  | ReturnType<typeof compareRationalSet> {
  switch (comparisonOp) {
    case "$in":
    case "$nin":
      return compareRationalSet(
        lhs,
        comparisonOp,
        compareToFractions as Iterable<RationalArg>
      );
    default:
      return compareRationalEqualityAndRanges(
        lhs,
        comparisonOp,
        compareToFractions as RationalArg
      );
  }
}

const gcd = function (n: number, d: number) {
  if (!n) {
    return d;
  }
  if (!d) {
    return n;
  }

  while (1) {
    n %= d;
    if (!n) {
      return d;
    }
    d %= n;
    if (!d) {
      return n;
    }
  }
};

const addOrSubtractRational = (
  a: RationalArg,
  b: RationalArg,
  type: "ADD" | "SUBTRACT"
) => {
  const [sA, nA, dA, pathA, indexA] = parseRationalArg(a, "rA");
  const [sB, nB, dB, pathB, indexB] = parseRationalArg(b, "rB");

  const op = type === "ADD" ? "$add" : "$subtract";

  const expression = {
    n: {
      [op]: [{ $multiply: [dB, nA, sA] }, { $multiply: [dA, nB, sB] }],
    },
    d: { $multiply: [dA, dB] },
  } as const;

  const resultExpr =
    indexA > -1 || indexB > -1
      ? createVarsAtIndexExpr(
          (function* () {
            if (indexA > -1) {
              yield {
                path: pathA,
                index: indexA,
                asVar: "rA",
              };
            }

            if (indexB > -1) {
              yield {
                path: pathB,
                index: indexB,
                asVar: "rB",
              };
            }
          })(),
          expression
        )
      : expression;

  return {
    $let: {
      vars: { addResult: resultExpr },
      in: {
        $let: {
          vars: {
            gcd: {
              $function: {
                body: gcd.toString(),
                args: [{ $abs: "$$addResult.n" }, "$$addResult.d"],
                lang: "js",
              },
            },
          },
          in: {
            s: {
              $cond: {
                if: { $gte: ["$$addResult.n", 0] },
                then: 1,
                else: -1,
              },
            },
            n: { $divide: [{ $abs: "$$addResult.n" }, "$$gcd"] },
            d: { $divide: ["$$addResult.d", "$$gcd"] },
          },
        },
      },
    },
  };
};

export const addRational = (a: RationalArg, b: RationalArg) => {
  return addOrSubtractRational(a, b, "ADD");
};

export const subtractRational = (a: RationalArg, b: RationalArg) => {
  return addOrSubtractRational(a, b, "SUBTRACT");
};
