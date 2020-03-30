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
const NULLISH = Symbol();
const filter = (where, fieldAndConditionCreator) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const filterQuery = {};
    for (const key of Object.keys(where)) {
        // skip null or undefined filters
        if ((_a = where[key], (_a !== null && _a !== void 0 ? _a : NULLISH)) === NULLISH) {
            continue;
        }
        // Match Logic Operators
        switch (key) {
            case "or":
                filterQuery.$or = yield Promise.all(where[key].map(where => filter(where, fieldAndConditionCreator)));
                break;
            case "and":
                filterQuery.$and = yield Promise.all(where[key].map(where => filter(where, fieldAndConditionCreator)));
                break;
            case "nor":
                filterQuery.$and = yield Promise.all(where[key].map(where => filter(where, fieldAndConditionCreator)));
                break;
            default: {
                const { field, condition } = yield fieldAndConditionCreator(key, where[key]);
                filterQuery[field] = condition;
            }
        }
    }
    return filterQuery;
});
exports.default = filter;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZmlsdGVyUXVlcnkuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi9zcmMvcmVzb2x2ZXJzL3V0aWxzL2ZpbHRlclF1ZXJ5L2ZpbHRlclF1ZXJ5LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7O0FBRUEsTUFBTSxPQUFPLEdBQUcsTUFBTSxFQUFFLENBQUM7QUFrQnpCLE1BQU0sTUFBTSxHQUFHLENBQ2IsS0FBYSxFQUNiLHdCQUEwRCxFQUMvQixFQUFFOztJQUM3QixNQUFNLFdBQVcsR0FBcUIsRUFBRSxDQUFDO0lBRXpDLEtBQUssTUFBTSxHQUFHLElBQUksTUFBTSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQXFCLEVBQUU7UUFDeEQsaUNBQWlDO1FBQ2pDLElBQUksTUFBQyxLQUFLLENBQUMsR0FBRyxDQUFDLHVDQUFJLE9BQU8sRUFBQyxLQUFLLE9BQU8sRUFBRTtZQUN2QyxTQUFTO1NBQ1Y7UUFFRCx3QkFBd0I7UUFDeEIsUUFBUSxHQUFHLEVBQUU7WUFDWCxLQUFLLElBQUk7Z0JBQ1AsV0FBVyxDQUFDLEdBQUcsR0FBRyxNQUFNLE9BQU8sQ0FBQyxHQUFHLENBQ2pDLEtBQUssQ0FBQyxHQUFXLENBQUMsQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLEVBQUUsQ0FDN0IsTUFBTSxDQUFDLEtBQUssRUFBRSx3QkFBd0IsQ0FBQyxDQUN4QyxDQUNGLENBQUM7Z0JBQ0YsTUFBTTtZQUVSLEtBQUssS0FBSztnQkFDUixXQUFXLENBQUMsSUFBSSxHQUFHLE1BQU0sT0FBTyxDQUFDLEdBQUcsQ0FDbEMsS0FBSyxDQUFDLEdBQVksQ0FBQyxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsRUFBRSxDQUM5QixNQUFNLENBQUMsS0FBSyxFQUFFLHdCQUF3QixDQUFDLENBQ3hDLENBQ0YsQ0FBQztnQkFDRixNQUFNO1lBRVIsS0FBSyxLQUFLO2dCQUNSLFdBQVcsQ0FBQyxJQUFJLEdBQUcsTUFBTSxPQUFPLENBQUMsR0FBRyxDQUNsQyxLQUFLLENBQUMsR0FBWSxDQUFDLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxFQUFFLENBQzlCLE1BQU0sQ0FBQyxLQUFLLEVBQUUsd0JBQXdCLENBQUMsQ0FDeEMsQ0FDRixDQUFDO2dCQUNGLE1BQU07WUFDUixPQUFPLENBQUMsQ0FBQztnQkFDUCxNQUFNLEVBQUUsS0FBSyxFQUFFLFNBQVMsRUFBRSxHQUFHLE1BQU0sd0JBQXdCLENBQ3pELEdBQVUsRUFDVixLQUFLLENBQUMsR0FBRyxDQUFRLENBQ2xCLENBQUM7Z0JBRUYsV0FBVyxDQUFDLEtBQUssQ0FBQyxHQUFHLFNBQVMsQ0FBQzthQUNoQztTQUNGO0tBQ0Y7SUFFRCxPQUFPLFdBQVcsQ0FBQztBQUNyQixDQUFDLENBQUEsQ0FBQztBQUVGLGtCQUFlLE1BQU0sQ0FBQyJ9