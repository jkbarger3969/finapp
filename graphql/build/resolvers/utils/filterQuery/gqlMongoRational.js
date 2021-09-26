"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoRational_1 = require("../../../utils/mongoRational");
const iterableFns_1 = require("../../../utils/iterableFns");
const comparison_1 = require("./operatorMapping/comparison");
const rationalFieldCondition = (whereRational, lhsRationalField) => {
    const expressions = [];
    for (const [key, value] of (0, iterableFns_1.iterateOwnKeyValues)(whereRational)) {
        const mongoOp = (0, comparison_1.comparisonOpsMapper)(key);
        switch (mongoOp) {
            case "$in":
            case "$nin":
                expressions.push((0, mongoRational_1.rationalComparison)(lhsRationalField, mongoOp, value));
                break;
            default:
                expressions.push((0, mongoRational_1.rationalComparison)(lhsRationalField, mongoOp, value));
        }
    }
    const numExpressions = expressions.length;
    if (numExpressions === 0) {
        return null;
    }
    return {
        field: "$expr",
        condition: numExpressions === 1
            ? expressions[0]
            : { $allElementsTrue: [expressions] },
    };
};
exports.default = rationalFieldCondition;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ3FsTW9uZ29SYXRpb25hbC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9yZXNvbHZlcnMvdXRpbHMvZmlsdGVyUXVlcnkvZ3FsTW9uZ29SYXRpb25hbC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUNBLGdFQUE0RTtBQUU1RSw0REFBaUU7QUFDakUsNkRBQW1FO0FBRW5FLE1BQU0sc0JBQXNCLEdBQUcsQ0FDN0IsYUFBNEIsRUFDNUIsZ0JBQTJDLEVBQ1IsRUFBRTtJQUNyQyxNQUFNLFdBQVcsR0FBYyxFQUFFLENBQUM7SUFDbEMsS0FBSyxNQUFNLENBQUMsR0FBRyxFQUFFLEtBQUssQ0FBQyxJQUFJLElBQUEsaUNBQW1CLEVBQUMsYUFBYSxDQUFDLEVBQUU7UUFDN0QsTUFBTSxPQUFPLEdBQUcsSUFBQSxnQ0FBbUIsRUFBQyxHQUFHLENBQUMsQ0FBQztRQUN6QyxRQUFRLE9BQU8sRUFBRTtZQUNmLEtBQUssS0FBSyxDQUFDO1lBQ1gsS0FBSyxNQUFNO2dCQUNULFdBQVcsQ0FBQyxJQUFJLENBQ2QsSUFBQSxrQ0FBa0IsRUFDaEIsZ0JBQWdCLEVBQ2hCLE9BQXlCLEVBQ3pCLEtBQW1CLENBQ3BCLENBQ0YsQ0FBQztnQkFDRixNQUFNO1lBQ1I7Z0JBQ0UsV0FBVyxDQUFDLElBQUksQ0FDZCxJQUFBLGtDQUFrQixFQUNoQixnQkFBZ0IsRUFDaEIsT0FBeUIsRUFDekIsS0FBaUIsQ0FDbEIsQ0FDRixDQUFDO1NBQ0w7S0FDRjtJQUVELE1BQU0sY0FBYyxHQUFHLFdBQVcsQ0FBQyxNQUFNLENBQUM7SUFFMUMsSUFBSSxjQUFjLEtBQUssQ0FBQyxFQUFFO1FBQ3hCLE9BQU8sSUFBSSxDQUFDO0tBQ2I7SUFFRCxPQUFPO1FBQ0wsS0FBSyxFQUFFLE9BQU87UUFDZCxTQUFTLEVBQ1AsY0FBYyxLQUFLLENBQUM7WUFDbEIsQ0FBQyxDQUFDLFdBQVcsQ0FBQyxDQUFDLENBQUM7WUFDaEIsQ0FBQyxDQUFDLEVBQUUsZ0JBQWdCLEVBQUUsQ0FBQyxXQUFXLENBQUMsRUFBRTtLQUMxQyxDQUFDO0FBQ0osQ0FBQyxDQUFDO0FBRUYsa0JBQWUsc0JBQXNCLENBQUMifQ==