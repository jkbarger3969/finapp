"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const iterableFns_1 = require("../../../utils/iterableFns");
const NULLISH = Symbol();
const filter = (where, fieldAndConditionCreator) => __awaiter(void 0, void 0, void 0, function* () {
    const filterQuery = {};
    for (const [key, value] of iterableFns_1.iterateOwnKeyValues(where)) {
        // skip null or undefined filters
        if ((value !== null && value !== void 0 ? value : NULLISH) === NULLISH) {
            continue;
        }
        // Match Logic Operators
        switch (key) {
            case "or":
                if (value) {
                    filterQuery.$or = yield Promise.all(value.map((where) => filter(where, fieldAndConditionCreator)));
                }
                break;
            case "and":
                if (value) {
                    filterQuery.$and = yield Promise.all(value.map((where) => filter(where, fieldAndConditionCreator)));
                }
                break;
            case "nor":
                if (value) {
                    filterQuery.$nor = yield Promise.all(value.map((where) => filter(where, fieldAndConditionCreator)));
                }
                break;
            default: {
                const { field, condition } = yield fieldAndConditionCreator(key, value);
                filterQuery[field] = condition;
            }
        }
    }
    return filterQuery;
});
exports.default = filter;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZmlsdGVyUXVlcnkuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi9zcmMvcmVzb2x2ZXJzL3V0aWxzL2ZpbHRlclF1ZXJ5L2ZpbHRlclF1ZXJ5LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7O0FBQ0EsNERBQWlFO0FBRWpFLE1BQU0sT0FBTyxHQUFHLE1BQU0sRUFBRSxDQUFDO0FBa0J6QixNQUFNLE1BQU0sR0FBRyxDQUNiLEtBQWEsRUFDYix3QkFBMEQsRUFDL0IsRUFBRTtJQUM3QixNQUFNLFdBQVcsR0FBcUIsRUFBRSxDQUFDO0lBRXpDLEtBQUssTUFBTSxDQUFDLEdBQUcsRUFBRSxLQUFLLENBQUMsSUFBSSxpQ0FBbUIsQ0FBQyxLQUFLLENBQUMsRUFBRTtRQUNyRCxpQ0FBaUM7UUFDakMsSUFBSSxDQUFDLEtBQUssYUFBTCxLQUFLLGNBQUwsS0FBSyxHQUFJLE9BQU8sQ0FBQyxLQUFLLE9BQU8sRUFBRTtZQUNsQyxTQUFTO1NBQ1Y7UUFFRCx3QkFBd0I7UUFDeEIsUUFBUSxHQUFHLEVBQUU7WUFDWCxLQUFLLElBQUk7Z0JBQ1AsSUFBSSxLQUFLLEVBQUU7b0JBQ1QsV0FBVyxDQUFDLEdBQUcsR0FBRyxNQUFNLE9BQU8sQ0FBQyxHQUFHLENBQy9CLEtBRUEsQ0FBQyxHQUFHLENBQUMsQ0FBQyxLQUFLLEVBQUUsRUFBRSxDQUFDLE1BQU0sQ0FBQyxLQUFLLEVBQUUsd0JBQXdCLENBQUMsQ0FBQyxDQUMzRCxDQUFDO2lCQUNIO2dCQUNELE1BQU07WUFDUixLQUFLLEtBQUs7Z0JBQ1IsSUFBSSxLQUFLLEVBQUU7b0JBQ1QsV0FBVyxDQUFDLElBQUksR0FBRyxNQUFNLE9BQU8sQ0FBQyxHQUFHLENBQ2hDLEtBRUEsQ0FBQyxHQUFHLENBQUMsQ0FBQyxLQUFLLEVBQUUsRUFBRSxDQUFDLE1BQU0sQ0FBQyxLQUFLLEVBQUUsd0JBQXdCLENBQUMsQ0FBQyxDQUMzRCxDQUFDO2lCQUNIO2dCQUNELE1BQU07WUFDUixLQUFLLEtBQUs7Z0JBQ1IsSUFBSSxLQUFLLEVBQUU7b0JBQ1QsV0FBVyxDQUFDLElBQUksR0FBRyxNQUFNLE9BQU8sQ0FBQyxHQUFHLENBQ2hDLEtBRUEsQ0FBQyxHQUFHLENBQUMsQ0FBQyxLQUFLLEVBQUUsRUFBRSxDQUFDLE1BQU0sQ0FBQyxLQUFLLEVBQUUsd0JBQXdCLENBQUMsQ0FBQyxDQUMzRCxDQUFDO2lCQUNIO2dCQUNELE1BQU07WUFDUixPQUFPLENBQUMsQ0FBQztnQkFDUCxNQUFNLEVBQUUsS0FBSyxFQUFFLFNBQVMsRUFBRSxHQUFHLE1BQU0sd0JBQXdCLENBQ3pELEdBQXdELEVBQ3hELEtBQWtFLENBQ25FLENBQUM7Z0JBRUYsV0FBVyxDQUFDLEtBQUssQ0FBQyxHQUFHLFNBQVMsQ0FBQzthQUNoQztTQUNGO0tBQ0Y7SUFFRCxPQUFPLFdBQVcsQ0FBQztBQUNyQixDQUFDLENBQUEsQ0FBQztBQUVGLGtCQUFlLE1BQU0sQ0FBQyJ9