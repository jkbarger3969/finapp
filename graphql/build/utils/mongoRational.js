"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.rationalComparison = exports.fractionToRational = void 0;
/**
 * Utility method to convert {@link Fraction} to {@link Rational}.
 */
const fractionToRational = (fraction) => ({
    s: fraction.s,
    n: fraction.n,
    d: fraction.d,
});
exports.fractionToRational = fractionToRational;
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
];
/**
 * @returns a mongodb [$expr](https://docs.mongodb.com/manual/reference/operator/query/expr/) value.
 *
 */
const compareRationalEqualityAndRanges = (lhs, comparisonOp, rhs) => {
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
const compareRationalSet = (lhs, setOp, rationalSet) => {
    const anyElementTrueExpr = [];
    for (const rhs of rationalSet) {
        anyElementTrueExpr.push(compareRationalEqualityAndRanges(lhs, "$eq", rhs));
    }
    switch (setOp) {
        case "$in":
            return { $anyElementTrue: [anyElementTrueExpr] };
        case "$nin":
            return { $not: [{ $anyElementTrue: [anyElementTrueExpr] }] };
    }
};
function rationalComparison(lhs, op, rhs) {
    switch (op) {
        case "$in":
        case "$nin":
            return compareRationalSet(lhs, op, rhs);
        default:
            return compareRationalEqualityAndRanges(lhs, op, rhs);
    }
}
exports.rationalComparison = rationalComparison;
const gcd = function (n, d) {
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibW9uZ29SYXRpb25hbC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy91dGlscy9tb25nb1JhdGlvbmFsLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQVFBOztHQUVHO0FBQ0ksTUFBTSxrQkFBa0IsR0FBRyxDQUFDLFFBQWtCLEVBQVksRUFBRSxDQUFDLENBQUM7SUFDbkUsQ0FBQyxFQUFFLFFBQVEsQ0FBQyxDQUFXO0lBQ3ZCLENBQUMsRUFBRSxRQUFRLENBQUMsQ0FBQztJQUNiLENBQUMsRUFBRSxRQUFRLENBQUMsQ0FBQztDQUNkLENBQUMsQ0FBQztBQUpVLFFBQUEsa0JBQWtCLHNCQUk1QjtBQW9CSCxNQUFNLG9CQUFvQixHQUFHO0lBQzNCO1FBQ0UsU0FBUyxFQUFFO1lBQ1Q7Z0JBQ0UsU0FBUyxFQUFFLENBQUMsU0FBUyxFQUFFLFNBQVMsRUFBRSxTQUFTLENBQUM7YUFDN0M7WUFDRCxFQUFFLFNBQVMsRUFBRSxDQUFDLFNBQVMsRUFBRSxTQUFTLEVBQUUsU0FBUyxDQUFDLEVBQUU7U0FDakQ7S0FDRjtJQUNELENBQUM7Q0FDTyxDQUFDO0FBRVg7OztHQUdHO0FBQ0gsTUFBTSxnQ0FBZ0MsR0FBRyxDQUN2QyxHQUFrQixFQUNsQixZQUEyQixFQUMzQixHQUFrQixFQUNsQixFQUFFO0lBQ0YscURBQXFEO0lBRXJELHFEQUFxRDtJQUVyRCxPQUFPO1FBQ0wsSUFBSSxFQUFFO1lBQ0osSUFBSSxFQUFFO2dCQUNKLEdBQUcsRUFBRTtvQkFDSCxJQUFJLEVBQUU7d0JBQ0osSUFBSSxFQUFFOzRCQUNKLFFBQVEsRUFBRSxHQUFHO3lCQUNkO3dCQUNELEVBQUUsRUFBRTs0QkFDRixLQUFLLEVBQUUsQ0FBQyxFQUFFLFFBQVEsRUFBRSxZQUFZLEVBQUUsRUFBRSxZQUFZLEVBQUUsQ0FBQyxZQUFZLENBQUMsQ0FBQzt5QkFDbEU7cUJBQ0Y7aUJBQ0Y7Z0JBQ0QsR0FBRyxFQUFFO29CQUNILElBQUksRUFBRTt3QkFDSixJQUFJLEVBQUU7NEJBQ0osUUFBUSxFQUFFLEdBQUc7eUJBQ2Q7d0JBQ0QsRUFBRSxFQUFFOzRCQUNGLEtBQUssRUFBRSxDQUFDLEVBQUUsUUFBUSxFQUFFLFlBQVksRUFBRSxFQUFFLFlBQVksRUFBRSxDQUFDLFlBQVksQ0FBQyxDQUFDO3lCQUNsRTtxQkFDRjtpQkFDRjthQUNGO1lBQ0QsRUFBRSxFQUFFO2dCQUNGLE9BQU8sRUFBRTtvQkFDUCxLQUFLLEVBQUUsT0FBTztvQkFDZCxZQUFZLEVBQUUsS0FBSztvQkFDbkIsRUFBRSxFQUFFO3dCQUNGLEtBQUssRUFBRTs0QkFDTCxTQUFTOzRCQUNULElBQUk7NEJBQ0o7Z0NBQ0UsSUFBSSxFQUFFO29DQUNKLElBQUksRUFBRTt3Q0FDSixHQUFHLEVBQUUsUUFBUTtxQ0FDZDtvQ0FDRCxFQUFFLEVBQUU7d0NBQ0YsT0FBTyxFQUFFOzRDQUNQLEtBQUssRUFBRSxPQUFPOzRDQUNkLFlBQVksRUFBRSxLQUFLOzRDQUNuQixFQUFFLEVBQUU7Z0RBQ0YsS0FBSyxFQUFFO29EQUNMLFNBQVM7b0RBQ1QsSUFBSTtvREFDSjt3REFDRSxDQUFDLFlBQVksQ0FBQyxFQUFFOzREQUNkO2dFQUNFLFNBQVMsRUFBRTtvRUFDVDt3RUFDRSxTQUFTLEVBQUU7NEVBQ1QsU0FBUzs0RUFDVCxTQUFTOzRFQUNULFVBQVU7eUVBQ1g7cUVBQ0Y7b0VBQ0Q7d0VBQ0UsU0FBUyxFQUFFOzRFQUNULFVBQVU7NEVBQ1YsVUFBVTs0RUFDVixTQUFTO3lFQUNWO3FFQUNGO2lFQUNGOzZEQUNGOzREQUNELENBQUM7eURBQ0Y7cURBQ0Y7aURBQ0Y7NkNBQ0Y7eUNBQ0Y7cUNBQ0Y7aUNBQ0Y7NkJBQ0Y7eUJBQ0Y7cUJBQ0Y7aUJBQ0Y7YUFDRjtTQUNGO0tBQ0YsQ0FBQztJQUVGLHVCQUF1QjtJQUN2QiwwQ0FBMEM7SUFDMUMsY0FBYztJQUVkOzs7Ozs7Ozs7Ozs7Ozs7Ozs7UUFrQkk7QUFDTixDQUFDLENBQUM7QUFFRjs7O0dBR0c7QUFDSCxNQUFNLGtCQUFrQixHQUFHLENBQ3pCLEdBQWtCLEVBQ2xCLEtBQWEsRUFDYixXQUFvQyxFQUNwQyxFQUFFO0lBQ0YsTUFBTSxrQkFBa0IsR0FFbEIsRUFBRSxDQUFDO0lBRVQsS0FBSyxNQUFNLEdBQUcsSUFBSSxXQUFXLEVBQUU7UUFDN0Isa0JBQWtCLENBQUMsSUFBSSxDQUFDLGdDQUFnQyxDQUFDLEdBQUcsRUFBRSxLQUFLLEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQztLQUM1RTtJQUVELFFBQVEsS0FBSyxFQUFFO1FBQ2IsS0FBSyxLQUFLO1lBQ1IsT0FBTyxFQUFFLGVBQWUsRUFBRSxDQUFDLGtCQUFrQixDQUFDLEVBQVcsQ0FBQztRQUM1RCxLQUFLLE1BQU07WUFDVCxPQUFPLEVBQUUsSUFBSSxFQUFFLENBQUMsRUFBRSxlQUFlLEVBQUUsQ0FBQyxrQkFBa0IsQ0FBQyxFQUFFLENBQUMsRUFBVyxDQUFDO0tBQ3pFO0FBQ0gsQ0FBQyxDQUFDO0FBZUYsU0FBZ0Isa0JBQWtCLENBQ2hDLEdBQWtCLEVBQ2xCLEVBQWMsRUFDZCxHQUE0QztJQUk1QyxRQUFRLEVBQUUsRUFBRTtRQUNWLEtBQUssS0FBSyxDQUFDO1FBQ1gsS0FBSyxNQUFNO1lBQ1QsT0FBTyxrQkFBa0IsQ0FBQyxHQUFHLEVBQUUsRUFBRSxFQUFFLEdBQThCLENBQUMsQ0FBQztRQUNyRTtZQUNFLE9BQU8sZ0NBQWdDLENBQUMsR0FBRyxFQUFFLEVBQUUsRUFBRSxHQUFvQixDQUFDLENBQUM7S0FDMUU7QUFDSCxDQUFDO0FBZEQsZ0RBY0M7QUFFRCxNQUFNLEdBQUcsR0FBRyxVQUFVLENBQVMsRUFBRSxDQUFTO0lBQ3hDLElBQUksQ0FBQyxDQUFDLEVBQUU7UUFDTixPQUFPLENBQUMsQ0FBQztLQUNWO0lBQ0QsSUFBSSxDQUFDLENBQUMsRUFBRTtRQUNOLE9BQU8sQ0FBQyxDQUFDO0tBQ1Y7SUFFRCxPQUFPLENBQUMsRUFBRTtRQUNSLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDUCxJQUFJLENBQUMsQ0FBQyxFQUFFO1lBQ04sT0FBTyxDQUFDLENBQUM7U0FDVjtRQUNELENBQUMsSUFBSSxDQUFDLENBQUM7UUFDUCxJQUFJLENBQUMsQ0FBQyxFQUFFO1lBQ04sT0FBTyxDQUFDLENBQUM7U0FDVjtLQUNGO0FBQ0gsQ0FBQyxDQUFDO0FBRUY7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7S0ErRUsifQ==