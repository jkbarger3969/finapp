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

/**
 * - Rational number object.
 * - Path to a rational number object.
 * - Tuple of path to a rational number object and an $arrayElemAt idx.
 * */
export type RationalValue = Rational | string | [path: string, index: number];

const parseRationalValue = (
  rationalValue: RationalValue,
  letVar: string
): Readonly<
  [
    s: string | 1 | -1,
    n: string | number,
    d: string | number,
    path: string,
    elemIndex: number
  ]
> => {
  if (typeof rationalValue === "string") {
    return [
      `$${rationalValue}.s`,
      `$${rationalValue}.n`,
      `$${rationalValue}.d`,
      "",
      -1,
    ] as const;
  } else if (Array.isArray(rationalValue)) {
    return [`$${letVar}.s`, `$${letVar}.n`, `$${letVar}.d`, ...rationalValue];
  } else {
    return [rationalValue.s, rationalValue.n, rationalValue.d, "", -1] as const;
  }
};

const createLetVarsAtIndexExpr = <T>(
  addVars: Iterable<{ path: string; index: number; letVar: string }>,
  expression: T
) => {
  const vars = {} as Record<
    string,
    {
      $arrayElemAt: [string, number];
    }
  >;

  for (const { path, index, letVar } of addVars) {
    vars[letVar] = {
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
  lhs: RationalValue,
  comparisonOp: ComparisonOps,
  rhs: RationalValue
) => {
  const [sLhs, nLhs, dLhs, pathLhs, elemIndexLhs] = parseRationalValue(
    lhs,
    "lhs"
  );

  const [sRhs, nRhs, dRhs, pathRhs, elemIndexRhs] = parseRationalValue(
    rhs,
    "rhs"
  );

  const expression = {
    [comparisonOp]: [
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

  if (elemIndexLhs > -1 || elemIndexRhs > -1) {
    return createLetVarsAtIndexExpr(
      (function* () {
        if (elemIndexLhs > -1) {
          yield {
            path: pathLhs,
            index: elemIndexLhs,
            letVar: "lhs",
          };
        }

        if (elemIndexRhs > -1) {
          yield {
            path: pathRhs,
            index: elemIndexRhs,
            letVar: "rhs",
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
  op: RationalOp,
  rhs: RationalValue
): ReturnType<typeof compareRationalEqualityAndRanges>;
export function rationalComparison(
  lhs: RationalValue,
  op: RationalOp,
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

const addOrSubtractRational = (
  a: RationalValue,
  b: RationalValue,
  type: "ADD" | "SUBTRACT"
) => {
  const [sA, nA, dA, pathA, indexA] = parseRationalValue(a, "rA");
  const [sB, nB, dB, pathB, indexB] = parseRationalValue(b, "rB");

  const op = type === "ADD" ? "$add" : "$subtract";

  const expression = {
    n: {
      [op]: [{ $multiply: [dB, nA, sA] }, { $multiply: [dA, nB, sB] }],
    },
    d: { $multiply: [dA, dB] },
  } as const;

  const expr =
    indexA > -1 || indexB > -1
      ? createLetVarsAtIndexExpr(
          (function* () {
            if (indexA > -1) {
              yield {
                path: pathA,
                index: indexA,
                letVar: "rA",
              };
            }

            if (indexB > -1) {
              yield {
                path: pathB,
                index: indexB,
                letVar: "rB",
              };
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
};
