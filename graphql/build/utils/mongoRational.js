"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.subtractRational = exports.addRational = exports.rationalComparison = void 0;
const parseRationalArg = (rationalArg, asVar) => {
    if (typeof rationalArg === "string") {
        return [
            `$${rationalArg}.s`,
            `$${rationalArg}.n`,
            `$${rationalArg}.d`,
            "",
            -1,
        ];
    }
    else if (Array.isArray(rationalArg)) {
        return [`$${asVar}.s`, `$${asVar}.n`, `$${asVar}.d`, ...rationalArg];
    }
    else {
        return [rationalArg.s, rationalArg.n, rationalArg.d, "", -1];
    }
};
const createVarsAtIndexExpr = (addVars, expression) => {
    const vars = {};
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
    };
};
/**
 * @returns a mongodb [$expr](https://docs.mongodb.com/manual/reference/operator/query/expr/) value.
 *
 */
const compareRationalEqualityAndRanges = (lhs, equalityOrRangeOp, rhs) => {
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
    };
    if (indexLhs > -1 || indexRhs > -1) {
        return createVarsAtIndexExpr((function* () {
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
function rationalComparison(lhs, comparisonOp, compareToFractions) {
    switch (comparisonOp) {
        case "$in":
        case "$nin":
            return compareRationalSet(lhs, comparisonOp, compareToFractions);
        default:
            return compareRationalEqualityAndRanges(lhs, comparisonOp, compareToFractions);
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
    const [sA, nA, dA, pathA, indexA] = parseRationalArg(a, "rA");
    const [sB, nB, dB, pathB, indexB] = parseRationalArg(b, "rB");
    const op = type === "ADD" ? "$add" : "$subtract";
    const expression = {
        n: {
            [op]: [{ $multiply: [dB, nA, sA] }, { $multiply: [dA, nB, sB] }],
        },
        d: { $multiply: [dA, dB] },
    };
    const resultExpr = indexA > -1 || indexB > -1
        ? createVarsAtIndexExpr((function* () {
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
        })(), expression)
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
exports.addRational = (a, b) => {
    return addOrSubtractRational(a, b, "ADD");
};
exports.subtractRational = (a, b) => {
    return addOrSubtractRational(a, b, "SUBTRACT");
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibW9uZ29SYXRpb25hbC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy91dGlscy9tb25nb1JhdGlvbmFsLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQW9CQSxNQUFNLGdCQUFnQixHQUFHLENBQ3ZCLFdBQXdCLEVBQ3hCLEtBQWEsRUFHYixFQUFFO0lBQ0YsSUFBSSxPQUFPLFdBQVcsS0FBSyxRQUFRLEVBQUU7UUFDbkMsT0FBTztZQUNMLElBQUksV0FBVyxJQUFJO1lBQ25CLElBQUksV0FBVyxJQUFJO1lBQ25CLElBQUksV0FBVyxJQUFJO1lBQ25CLEVBQUU7WUFDRixDQUFDLENBQUM7U0FDTSxDQUFDO0tBQ1o7U0FBTSxJQUFJLEtBQUssQ0FBQyxPQUFPLENBQUMsV0FBVyxDQUFDLEVBQUU7UUFDckMsT0FBTyxDQUFDLElBQUksS0FBSyxJQUFJLEVBQUUsSUFBSSxLQUFLLElBQUksRUFBRSxJQUFJLEtBQUssSUFBSSxFQUFFLEdBQUcsV0FBVyxDQUFDLENBQUM7S0FDdEU7U0FBTTtRQUNMLE9BQU8sQ0FBQyxXQUFXLENBQUMsQ0FBQyxFQUFFLFdBQVcsQ0FBQyxDQUFDLEVBQUUsV0FBVyxDQUFDLENBQUMsRUFBRSxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQVUsQ0FBQztLQUN2RTtBQUNILENBQUMsQ0FBQztBQUVGLE1BQU0scUJBQXFCLEdBQUcsQ0FDNUIsT0FBaUUsRUFDakUsVUFBYSxFQUNiLEVBQUU7SUFDRixNQUFNLElBQUksR0FBRyxFQUtaLENBQUM7SUFFRixLQUFLLE1BQU0sRUFBRSxLQUFLLEVBQUUsSUFBSSxFQUFFLEtBQUssRUFBRSxJQUFJLE9BQU8sRUFBRTtRQUM1QyxJQUFJLENBQUMsS0FBSyxDQUFDLEdBQUc7WUFDWixZQUFZLEVBQUUsQ0FBQyxJQUFJLElBQUksRUFBRSxFQUFFLEtBQUssQ0FBQztTQUNsQyxDQUFDO0tBQ0g7SUFFRCxPQUFPO1FBQ0wsSUFBSSxFQUFFO1lBQ0osSUFBSTtZQUNKLEVB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