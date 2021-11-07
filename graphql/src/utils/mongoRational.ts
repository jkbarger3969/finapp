import Fraction from "fraction.js";

export interface Rational {
  s: 1 | -1;
  n: number;
  d: number;
}

/**
 * Utility method to convert {@link Fraction} to {@link Rational}.
 */
export const fractionToRational = (fraction: Fraction): Rational => ({
  s: fraction.s as 1 | -1,
  n: fraction.n,
  d: fraction.d,
});

// https://docs.mongodb.com/manual/reference/operator/query-comparison/index.html
export type ComparisonOps = "$eq" | "$gt" | "$gte" | "$lt" | "$lte" | "$ne";
export type SetOps = "$in" | "$nin";
export type RationalOp = ComparisonOps | SetOps;

// export interface RationalField {
//   /**
//    * Any [$let]{@link https://docs.mongodb.com/manual/reference/operator/aggregation/let/} vars expression that returns a Rational or array of Rationals.
//    */
//   rational: object;
// }

/**
 * - Rational number object.
 * - Any [$let]{@link https://docs.mongodb.com/manual/reference/operator/aggregation/let/} vars expression that returns a Rational or array of Rationals.
 * */
export type RationalValue = Rational | object | string;

const comparisonExpression = [
  {
    $subtract: [
      {
        $multiply: ["$$lhs.s", "$$lhs.n", "$$rhs.d"],
      },
      { $multiply: ["$$rhs.s", "$$rhs.n", "$$lhs.d"] },
    ],
  },
  0,
] as const;

/**
 * @returns a mongodb [$expr](https://docs.mongodb.com/manual/reference/operator/query/expr/) value.
 *
 */
const compareRationalEqualityAndRanges = (
  lhs: RationalValue,
  comparisonOp: ComparisonOps,
  rhs: RationalValue
) => {
  // const lhsArgs = parseRationalValueArg(lhs, "lhs");

  // const rhsArgs = parseRationalValueArg(rhs, "rhs");

  return {
    $let: {
      vars: {
        lhs: {
          $let: {
            vars: {
              rational: lhs,
            },
            in: {
              $cond: [{ $isArray: "$$rational" }, "$$rational", ["$$rational"]],
            },
          },
        },
        rhs: {
          $let: {
            vars: {
              rational: rhs,
            },
            in: {
              $cond: [{ $isArray: "$$rational" }, "$$rational", ["$$rational"]],
            },
          },
        },
      },
      in: {
        $reduce: {
          input: "$$lhs",
          initialValue: false,
          in: {
            $cond: [
              "$$value",
              true,
              {
                $let: {
                  vars: {
                    lhs: "$$this",
                  },
                  in: {
                    $reduce: {
                      input: "$$rhs",
                      initialValue: false,
                      in: {
                        $cond: [
                          "$$value",
                          true,
                          {
                            [comparisonOp]: [
                              {
                                $subtract: [
                                  {
                                    $multiply: [
                                      "$$lhs.s",
                                      "$$lhs.n",
                                      "$$this.d",
                                    ],
                                  },
                                  {
                                    $multiply: [
                                      "$$this.s",
                                      "$$this.n",
                                      "$$lhs.d",
                                    ],
                                  },
                                ],
                              },
                              0,
                            ],
                          },
                        ],
                      },
                    },
                  },
                },
              },
            ],
          },
        },
      },
    },
  };

  // const expression = {
  //   [comparisonOp]: comparisonExpression,
  // } as const;

  /* let lhsIsField: boolean;
  let rhsIsField: boolean;
  if ((lhsIsField = "field" in lhsArgs) || (rhsIsField = "field" in rhsArgs)) {
    return createLetVarsExpr(
      (function* () {
        if (lhsIsField) {
          rhsIsField = "field" in rhsArgs;
          yield [lhsArgs, "lhs"] as CreateLetVarsArgs;
        }

        if (rhsIsField) {
          yield [rhsArgs, "rhs"] as CreateLetVarsArgs;
        }
      })(),
      expression
    );
  } else {
    return expression;
  } */
};

/**
 * @returns a mongodb [$expr](https://docs.mongodb.com/manual/reference/operator/query/expr/) value.
 *
 */
const compareRationalSet = (
  lhs: RationalValue,
  setOp: SetOps,
  rationalSet: Iterable<RationalValue>
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
 */
export function rationalComparison(
  lhs: RationalValue,
  op: ComparisonOps,
  rhs: RationalValue
): ReturnType<typeof compareRationalEqualityAndRanges>;
export function rationalComparison(
  lhs: RationalValue,
  op: SetOps,
  rhs: Iterable<RationalValue>
): ReturnType<typeof compareRationalSet>;
export function rationalComparison(
  lhs: RationalValue,
  op: RationalOp,
  rhs: RationalValue | Iterable<RationalValue>
):
  | ReturnType<typeof compareRationalEqualityAndRanges>
  | ReturnType<typeof compareRationalSet> {
  switch (op) {
    case "$in":
    case "$nin":
      return compareRationalSet(lhs, op, rhs as Iterable<RationalValue>);
    default:
      return compareRationalEqualityAndRanges(lhs, op, rhs as RationalValue);
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

/* const addOrSubtractRational = (
  a: RationalValue,
  b: RationalValue,
  type: "ADD" | "SUBTRACT"
) => {
  const aArgs = parseRationalValueArg(a, "rA");
  const bArgs = parseRationalValueArg(b, "rB");

  const op = type === "ADD" ? "$add" : "$subtract";

  const expression = {
    n: {
      [op]: [
        { $multiply: [bArgs.d, aArgs.n, aArgs.s] },
        { $multiply: [aArgs.d, bArgs.n, bArgs.s] },
      ],
    },
    d: { $multiply: [aArgs.d, bArgs.d] },
  } as const;

  let lhsIsField: boolean;
  let rhsIsField: boolean;
  const expr =
    (lhsIsField = "field" in aArgs) || (rhsIsField = "field" in bArgs)
      ? createLetVarsExpr(
          (function* () {
            if (lhsIsField) {
              rhsIsField = "field" in bArgs;
              yield [aArgs, "rA"] as CreateLetVarsArgs;
            }

            if (rhsIsField) {
              yield [bArgs, "rB"] as CreateLetVarsArgs;
            }
          })(),
          expression
        )
      : expression;

  return {
    $let: {
      vars: { arithmeticResult: expr },
      in: {
        $let: {
          vars: {
            gcd: {
              $function: {
                body: gcd.toString(),
                args: [
                  { $abs: "$$arithmeticResult.n" },
                  "$$arithmeticResult.d",
                ],
                lang: "js",
              },
            },
          },
          in: {
            s: {
              $cond: {
                if: { $gte: ["$$arithmeticResult.n", 0] },
                then: 1,
                else: -1,
              },
            },
            n: { $divide: [{ $abs: "$$arithmeticResult.n" }, "$$gcd"] },
            d: { $divide: ["$$arithmeticResult.d", "$$gcd"] },
          },
        },
      },
    },
  };
};

export const addRational = (a: RationalValue, b: RationalValue) => {
  return addOrSubtractRational(a, b, "ADD");
};

export const subtractRational = (a: RationalValue, b: RationalValue) => {
  return addOrSubtractRational(a, b, "SUBTRACT");
}; */
