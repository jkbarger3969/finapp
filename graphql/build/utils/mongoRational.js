"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * @returns a mongodb [$expr](https://docs.mongodb.com/manual/reference/operator/query/expr/) value.
 *
 */
const compareRationalEqualityAndRanges = (lhsFractionField, equalityOrRangeOp, rhsFraction) => {
    const { s, n, d } = rhsFraction;
    const isElemAtIndex = Array.isArray(lhsFractionField);
    const lhs = isElemAtIndex ? "$lhs" : lhsFractionField;
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
        };
    }
    return expression;
};
/**
 * @returns a mongodb [$expr](https://docs.mongodb.com/manual/reference/operator/query/expr/) value.
 *
 */
const compareRationalSet = (fractionField, setOp, fractionSet) => {
    const anyElementTrueExpr = [];
    for (const rhsFraction of fractionSet) {
        anyElementTrueExpr.push(compareRationalEqualityAndRanges(fractionField, "$eq", rhsFraction));
    }
    switch (setOp) {
        case "$in":
            return { $anyElementTrue: [anyElementTrueExpr] };
        case "$nin":
            return { $not: [{ $anyElementTrue: [anyElementTrueExpr] }] };
    }
};
function rationalComparison(fractionField, comparisonOp, compareToFractions) {
    switch (comparisonOp) {
        case "$in":
        case "$nin":
            return compareRationalSet(fractionField, comparisonOp, compareToFractions);
        default:
            return compareRationalEqualityAndRanges(fractionField, comparisonOp, compareToFractions);
    }
}
exports.rationalComparison = rationalComparison;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibW9uZ29SYXRpb25hbC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy91dGlscy9tb25nb1JhdGlvbmFsLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBa0JBOzs7R0FHRztBQUNILE1BQU0sZ0NBQWdDLEdBQUcsQ0FDdkMsZ0JBQTJDLEVBQzNDLGlCQUE2QyxFQUM3QyxXQUEwQixFQUMxQixFQUFFO0lBQ0YsTUFBTSxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLEdBQUcsV0FBVyxDQUFDO0lBRWhDLE1BQU0sYUFBYSxHQUFHLEtBQUssQ0FBQyxPQUFPLENBQUMsZ0JBQWdCLENBQUMsQ0FBQztJQUV0RCxNQUFNLEdBQUcsR0FBRyxhQUFhLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUUsZ0JBQTJCLENBQUM7SUFFbEUsTUFBTSxVQUFVLEdBQUc7UUFDakIsQ0FBQyxpQkFBaUIsQ0FBQyxFQUFFO1lBQ25CO2dCQUNFLFNBQVMsRUFBRTtvQkFDVDt3QkFDRSxTQUFTLEVBQUUsQ0FBQyxJQUFJLEdBQUcsSUFBSSxFQUFFLElBQUksR0FBRyxJQUFJLEVBQUUsQ0FBQyxDQUFDO3FCQUN6QztvQkFDRCxFQUFFLFNBQVMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsSUFBSSxHQUFHLElBQUksQ0FBQyxFQUFFO2lCQUNuQzthQUNGO1lBQ0QsQ0FBQztTQUNGO0tBQ0YsQ0FBQztJQUVGLGlDQUFpQztJQUNqQyxJQUFJLGFBQWEsRUFBRTtRQUNqQixPQUFPO1lBQ0wsSUFBSSxFQUFFO2dCQUNKLElBQUksRUFBRTtvQkFDSixHQUFHLEVBQUU7d0JBQ0gsWUFBWSxFQUFFLENBQUMsSUFBSSxnQkFBZ0IsQ0FBQyxDQUFDLENBQUMsRUFBRSxFQUFFLGdCQUFnQixDQUFDLENBQUMsQ0FBQyxDQUFDO3FCQUMvRDtpQkFDRjtnQkFDRCxFQUFFLEVBQUUsVUFBVTthQUNmO1NBQ08sQ0FBQztLQUNaO0lBRUQsT0FBTyxVQUFVLENBQUM7QUFDcEIsQ0FBQyxDQUFDO0FBRUY7OztHQUdHO0FBQ0gsTUFBTSxrQkFBa0IsR0FBRyxDQUN6QixhQUF3QyxFQUN4QyxLQUFvQixFQUNwQixXQUFvQyxFQUNwQyxFQUFFO0lBQ0YsTUFBTSxrQkFBa0IsR0FFbEIsRUFBRSxDQUFDO0lBRVQsS0FBSyxNQUFNLFdBQVcsSUFBSSxXQUFXLEVBQUU7UUFDckMsa0JBQWtCLENBQUMsSUFBSSxDQUNyQixnQ0FBZ0MsQ0FBQyxhQUFhLEVBQUUsS0FBSyxFQUFFLFdBQVcsQ0FBQyxDQUNwRSxDQUFDO0tBQ0g7SUFFRCxRQUFRLEtBQUssRUFBRTtRQUNiLEtBQUssS0FBSztZQUNSLE9BQU8sRUFBRSxlQUFlLEVBQUUsQ0FBQyxrQkFBa0IsQ0FBQyxFQUFXLENBQUM7UUFDNUQsS0FBSyxNQUFNO1lBQ1QsT0FBTyxFQUFFLElBQUksRUFBRSxDQUFDLEVBQUUsZUFBZSxFQUFFLENBQUMsa0JBQWtCLENBQUMsRUFBRSxDQUFDLEVBQVcsQ0FBQztLQUN6RTtBQUNILENBQUMsQ0FBQztBQWdCRixTQUFnQixrQkFBa0IsQ0FDaEMsYUFBd0MsRUFDeEMsWUFBd0QsRUFDeEQsa0JBQTJEO0lBSTNELFFBQVEsWUFBWSxFQUFFO1FBQ3BCLEtBQUssS0FBSyxDQUFDO1FBQ1gsS0FBSyxNQUFNO1lBQ1QsT0FBTyxrQkFBa0IsQ0FDdkIsYUFBYSxFQUNiLFlBQVksRUFDWixrQkFBNkMsQ0FDOUMsQ0FBQztRQUNKO1lBQ0UsT0FBTyxnQ0FBZ0MsQ0FDckMsYUFBYSxFQUNiLFlBQVksRUFDWixrQkFBbUMsQ0FDcEMsQ0FBQztLQUNMO0FBQ0gsQ0FBQztBQXRCRCxnREFzQkMifQ==