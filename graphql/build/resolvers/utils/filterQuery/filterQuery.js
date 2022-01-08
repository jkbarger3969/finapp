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
    for (const [key, value] of (0, iterableFns_1.iterateOwnKeyValues)(where)) {
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZmlsdGVyUXVlcnkuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi9zcmMvcmVzb2x2ZXJzL3V0aWxzL2ZpbHRlclF1ZXJ5L2ZpbHRlclF1ZXJ5LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7O0FBQ0EsNERBQWlFO0FBRWpFLE1BQU0sT0FBTyxHQUFHLE1BQU0sRUFBRSxDQUFDO0FBa0J6QixNQUFNLE1BQU0sR0FBRyxDQUNiLEtBQWEsRUFDYix3QkFBMEQsRUFDL0IsRUFBRTtJQUM3QixNQUFNLFdBQVcsR0FBcUIsRUFBRSxDQUFDO0lBRXpDLEtBQUssTUFBTSxDQUFDLEdBQUcsRUFBRSxLQUFLLENBQUMsSUFBSSxJQUFBLGlDQUFtQixFQUFDLEtBQUssQ0FBQyxFQUFFO1FBQ3JELGlDQUFpQztRQUNqQyxJQUFJLENBQUMsS0FBSyxhQUFMLEtBQUssY0FBTCxLQUFLLEdBQUksT0FBTyxDQUFDLEtBQUssT0FBTyxFQUFFO1lBQ2xDLFNBQVM7U0FDVjtRQUVELHdCQUF3QjtRQUN4QixRQUFRLEdBQUcsRUFBRTtZQUNYLEtBQUssSUFBSTtnQkFDUCxJQUFJLEtBQUssRUFBRTtvQkFDVCxXQUFXLENBQUMsR0FBRyxHQUFHLE1BQU0sT0FBTyxDQUFDLEdBQUcsQ0FDaEMsS0FBOEQsQ0FBQyxHQUFHLENBQ2pFLENBQUMsS0FBSyxFQUFFLEVBQUUsQ0FBQyxNQUFNLENBQUMsS0FBSyxFQUFFLHdCQUF3QixDQUFDLENBQ25ELENBQ0YsQ0FBQztpQkFDSDtnQkFDRCxNQUFNO1lBQ1IsS0FBSyxLQUFLO2dCQUNSLElBQUksS0FBSyxFQUFFO29CQUNULFdBQVcsQ0FBQyxJQUFJLEdBQUcsTUFBTSxPQUFPLENBQUMsR0FBRyxDQUVoQyxLQUNELENBQUMsR0FBRyxDQUFDLENBQUMsS0FBSyxFQUFFLEVBQUUsQ0FBQyxNQUFNLENBQUMsS0FBSyxFQUFFLHdCQUF3QixDQUFDLENBQUMsQ0FDMUQsQ0FBQztpQkFDSDtnQkFDRCxNQUFNO1lBQ1IsS0FBSyxLQUFLO2dCQUNSLElBQUksS0FBSyxFQUFFO29CQUNULFdBQVcsQ0FBQyxJQUFJLEdBQUcsTUFBTSxPQUFPLENBQUMsR0FBRyxDQUVoQyxLQUNELENBQUMsR0FBRyxDQUFDLENBQUMsS0FBSyxFQUFFLEVBQUUsQ0FBQyxNQUFNLENBQUMsS0FBSyxFQUFFLHdCQUF3QixDQUFDLENBQUMsQ0FDMUQsQ0FBQztpQkFDSDtnQkFDRCxNQUFNO1lBQ1IsT0FBTyxDQUFDLENBQUM7Z0JBQ1AsTUFBTSxFQUFFLEtBQUssRUFBRSxTQUFTLEVBQUUsR0FBRyxNQUFNLHdCQUF3QixDQUN6RCxHQUF3RCxFQUN4RCxLQUFrRSxDQUNuRSxDQUFDO2dCQUVGLFdBQVcsQ0FBQyxLQUFLLENBQUMsR0FBRyxTQUFTLENBQUM7YUFDaEM7U0FDRjtLQUNGO0lBRUQsT0FBTyxXQUFXLENBQUM7QUFDckIsQ0FBQyxDQUFBLENBQUM7QUFFRixrQkFBZSxNQUFNLENBQUMifQ==