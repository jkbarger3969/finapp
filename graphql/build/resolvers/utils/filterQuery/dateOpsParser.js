"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const parseComparisonOps_1 = require("./querySelectors/parseComparisonOps");
const dateOpParser = [
    (0, parseComparisonOps_1.default)((whereDateTime) => {
        const date = new Date(whereDateTime.date);
        return whereDateTime.ignoreTime ? new Date(date.toDateString()) : date;
    }),
];
exports.default = dateOpParser;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGF0ZU9wc1BhcnNlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9yZXNvbHZlcnMvdXRpbHMvZmlsdGVyUXVlcnkvZGF0ZU9wc1BhcnNlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLDRFQUFxRTtBQUlyRSxNQUFNLFlBQVksR0FBcUM7SUFDckQsSUFBQSw0QkFBa0IsRUFBWSxDQUFDLGFBQTRCLEVBQUUsRUFBRTtRQUM3RCxNQUFNLElBQUksR0FBRyxJQUFJLElBQUksQ0FBQyxhQUFhLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDMUMsT0FBTyxhQUFhLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQyxJQUFJLElBQUksQ0FBQyxJQUFJLENBQUMsWUFBWSxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDO0lBQ3pFLENBQUMsQ0FBQztDQUNNLENBQUM7QUFFWCxrQkFBZSxZQUFZLENBQUMifQ==