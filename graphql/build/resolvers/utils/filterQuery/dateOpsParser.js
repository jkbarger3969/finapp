"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const parseComparisonOps_1 = __importDefault(require("./querySelectors/parseComparisonOps"));
const dateOpParser = [
    (0, parseComparisonOps_1.default)((dateValue) => {
        return new Date(dateValue);
    }),
];
exports.default = dateOpParser;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGF0ZU9wc1BhcnNlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9yZXNvbHZlcnMvdXRpbHMvZmlsdGVyUXVlcnkvZGF0ZU9wc1BhcnNlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7OztBQUFBLDZGQUFxRTtBQUlyRSxNQUFNLFlBQVksR0FBcUM7SUFDckQsSUFBQSw0QkFBa0IsRUFBWSxDQUFDLFNBQWMsRUFBRSxFQUFFO1FBQy9DLE9BQU8sSUFBSSxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUM7SUFDN0IsQ0FBQyxDQUFDO0NBQ00sQ0FBQztBQUVYLGtCQUFlLFlBQVksQ0FBQyJ9