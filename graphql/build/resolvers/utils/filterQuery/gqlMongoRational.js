"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoRational_1 = require("../../../utils/mongoRational");
const rational_1 = require("../../../utils/rational");
const iterableFns_1 = require("../../../utils/iterableFns");
const comparison_1 = require("./operatorMapping/comparison");
const rationalFieldCondition = (whereRational, lhsRationalField) => {
    const expressions = [];
    for (const [key, value] of iterableFns_1.iterateOwnKeyValues(whereRational)) {
        const mongoOp = comparison_1.comparisonOpsMapper(key);
        switch (mongoOp) {
            case "$in":
            case "$nin":
                expressions.push(mongoRational_1.rationalComparison(lhsRationalField, mongoOp, value.map((r) => rational_1.rationalToFraction(r))));
                break;
            default:
                expressions.push(mongoRational_1.rationalComparison(lhsRationalField, mongoOp, rational_1.rationalToFraction(value)));
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ3FsTW9uZ29SYXRpb25hbC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9yZXNvbHZlcnMvdXRpbHMvZmlsdGVyUXVlcnkvZ3FsTW9uZ29SYXRpb25hbC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUNBLGdFQUdzQztBQUN0QyxzREFBNkQ7QUFFN0QsNERBQWlFO0FBQ2pFLDZEQUFtRTtBQUVuRSxNQUFNLHNCQUFzQixHQUFHLENBQzdCLGFBQTRCLEVBQzVCLGdCQUEyQyxFQUNSLEVBQUU7SUFDckMsTUFBTSxXQUFXLEdBQWMsRUFBRSxDQUFDO0lBQ2xDLEtBQUssTUFBTSxDQUFDLEdBQUcsRUFBRSxLQUFLLENBQUMsSUFBSSxpQ0FBbUIsQ0FBQyxhQUFhLENBQUMsRUFBRTtRQUM3RCxNQUFNLE9BQU8sR0FBRyxnQ0FBbUIsQ0FBQyxHQUFHLENBQUMsQ0FBQztRQUN6QyxRQUFRLE9BQU8sRUFBRTtZQUNmLEtBQUssS0FBSyxDQUFDO1lBQ1gsS0FBSyxNQUFNO2dCQUNULFdBQVcsQ0FBQyxJQUFJLENBQ2Qsa0NBQWtCLENBQ2hCLGdCQUFnQixFQUNoQixPQUF5QixFQUN4QixLQUF5QixDQUFDLEdBQUcsQ0FDNUIsQ0FBQyxDQUFDLEVBQUUsRUFBRSxDQUFDLDZCQUFrQixDQUFDLENBQUMsQ0FBa0IsQ0FDOUMsQ0FDRixDQUNGLENBQUM7Z0JBQ0YsTUFBTTtZQUNSO2dCQUNFLFdBQVcsQ0FBQyxJQUFJLENBQ2Qsa0NBQWtCLENBQ2hCLGdCQUFnQixFQUNoQixPQUF5QixFQUN6Qiw2QkFBa0IsQ0FBQyxLQUFzQixDQUFrQixDQUM1RCxDQUNGLENBQUM7U0FDTDtLQUNGO0lBRUQsTUFBTSxjQUFjLEdBQUcsV0FBVyxDQUFDLE1BQU0sQ0FBQztJQUUxQyxJQUFJLGNBQWMsS0FBSyxDQUFDLEVBQUU7UUFDeEIsT0FBTyxJQUFJLENBQUM7S0FDYjtJQUVELE9BQU87UUFDTCxLQUFLLEVBQUUsT0FBTztRQUNkLFNBQVMsRUFDUCxjQUFjLEtBQUssQ0FBQztZQUNsQixDQUFDLENBQUMsV0FBVyxDQUFDLENBQUMsQ0FBQztZQUNoQixDQUFDLENBQUMsRUFBRSxnQkFBZ0IsRUFBRSxDQUFDLFdBQVcsQ0FBQyxFQUFFO0tBQzFDLENBQUM7QUFDSixDQUFDLENBQUM7QUFFRixrQkFBZSxzQkFBc0IsQ0FBQyJ9