"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.subtractRational = exports.addRational = exports.rationalComparison = exports.fractionToRational = void 0;
/**
 * Utility method to convert {@link Fraction} to {@link Rational}.
 */
const fractionToRational = (fraction) => ({
    s: fraction.s,
    n: fraction.n,
    d: fraction.d,
});
exports.fractionToRational = fractionToRational;
const parseRationalValue = (rationalValue, letVar) => {
    if (typeof rationalValue === "string") {
        return [
            `$${rationalValue}.s`,
            `$${rationalValue}.n`,
            `$${rationalValue}.d`,
            "",
            -1,
        ];
    }
    else if (Array.isArray(rationalValue)) {
        return [`$${letVar}.s`, `$${letVar}.n`, `$${letVar}.d`, ...rationalValue];
    }
    else {
        return [rationalValue.s, rationalValue.n, rationalValue.d, "", -1];
    }
};
const createLetVarsAtIndexExpr = (addVars, expression) => {
    const vars = {};
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
    };
};
/**
 * @returns a mongodb [$expr](https://docs.mongodb.com/manual/reference/operator/query/expr/) value.
 *
 */
const compareRationalEqualityAndRanges = (lhs, comparisonOp, rhs) => {
    const [sLhs, nLhs, dLhs, pathLhs, elemIndexLhs] = parseRationalValue(lhs, "lhs");
    const [sRhs, nRhs, dRhs, pathRhs, elemIndexRhs] = parseRationalValue(rhs, "rhs");
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
    };
    if (elemIndexLhs > -1 || elemIndexRhs > -1) {
        return createLetVarsAtIndexExpr((function* () {
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
        })(), expression);
    }
    else {
        return expression;
    }
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
const addOrSubtractRational = (a, b, type) => {
    const [sA, nA, dA, pathA, indexA] = parseRationalValue(a, "rA");
    const [sB, nB, dB, pathB, indexB] = parseRationalValue(b, "rB");
    const op = type === "ADD" ? "$add" : "$subtract";
    const expression = {
        n: {
            [op]: [{ $multiply: [dB, nA, sA] }, { $multiply: [dA, nB, sB] }],
        },
        d: { $multiply: [dA, dB] },
    };
    const expr = indexA > -1 || indexB > -1
        ? createLetVarsAtIndexExpr((function* () {
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
        })(), expression)
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
const addRational = (a, b) => {
    return addOrSubtractRational(a, b, "ADD");
};
exports.addRational = addRational;
const subtractRational = (a, b) => {
    return addOrSubtractRational(a, b, "SUBTRACT");
};
exports.subtractRational = subtractRational;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibW9uZ29SYXRpb25hbC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy91dGlscy9tb25nb1JhdGlvbmFsLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQVFBOztHQUVHO0FBQ0ksTUFBTSxrQkFBa0IsR0FBRyxDQUFDLFFBQWtCLEVBQVksRUFBRSxDQUFDLENBQUM7SUFDbkUsQ0FBQyxFQUFFLFFBQVEsQ0FBQyxDQUFXO0lBQ3ZCLENBQUMsRUFBRSxRQUFRLENBQUMsQ0FBQztJQUNiLENBQUMsRUFBRSxRQUFRLENBQUMsQ0FBQztDQUNkLENBQUMsQ0FBQztBQUpVLFFBQUEsa0JBQWtCLHNCQUk1QjtBQWNILE1BQU0sa0JBQWtCLEdBQUcsQ0FDekIsYUFBNEIsRUFDNUIsTUFBYyxFQVNkLEVBQUU7SUFDRixJQUFJLE9BQU8sYUFBYSxLQUFLLFFBQVEsRUFBRTtRQUNyQyxPQUFPO1lBQ0wsSUFBSSxhQUFhLElBQUk7WUFDckIsSUFBSSxhQUFhLElBQUk7WUFDckIsSUFBSSxhQUFhLElBQUk7WUFDckIsRUFBRTtZQUNGLENBQUMsQ0FBQztTQUNNLENBQUM7S0FDWjtTQUFNLElBQUksS0FBSyxDQUFDLE9BQU8sQ0FBQyxhQUFhLENBQUMsRUFBRTtRQUN2QyxPQUFPLENBQUMsSUFBSSxNQUFNLElBQUksRUFBRSxJQUFJLE1BQU0sSUFBSSxFQUFFLElBQUksTUFBTSxJQUFJLEVBQUUsR0FBRyxhQUFhLENBQUMsQ0FBQztLQUMzRTtTQUFNO1FBQ0wsT0FBTyxDQUFDLGFBQWEsQ0FBQyxDQUFDLEVBQUUsYUFBYSxDQUFDLENBQUMsRUFBRSxhQUFhLENBQUMsQ0FBQyxFQUFFLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBVSxDQUFDO0tBQzdFO0FBQ0gsQ0FBQyxDQUFDO0FBRUYsTUFBTSx3QkFBd0IsR0FBRyxDQUMvQixPQUFrRSxFQUNsRSxVQUFhLEVBQ2IsRUFBRTtJQUNGLE1BQU0sSUFBSSxHQUFHLEVBS1osQ0FBQztJQUVGLEtBQUss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