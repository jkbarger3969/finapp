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
const defaultOpValTransformer = (val) => val;
const mapComparisonOperators = (comparisonOperators, operatorValueTransformer = defaultOpValTransformer) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const comparisonSelector = {};
    for (const op of Object.keys(comparisonOperators)) {
        // skip null or undefined conditions
        if ((_a = comparisonOperators[op], (_a !== null && _a !== void 0 ? _a : NULLISH)) === NULLISH) {
            continue;
        }
        switch (op) {
            case "eq":
                comparisonSelector.$eq = yield operatorValueTransformer(comparisonOperators[op]);
                break;
            case "gt":
                comparisonSelector.$gt = yield operatorValueTransformer(comparisonOperators[op]);
                break;
            case "gte":
                comparisonSelector.$gte = yield operatorValueTransformer(comparisonOperators[op]);
                break;
            case "in":
                comparisonSelector.$in = yield Promise.all(comparisonOperators[op].map((val) => operatorValueTransformer(val)));
                break;
            case "lt":
                comparisonSelector.$lt = yield operatorValueTransformer(comparisonOperators[op]);
                break;
            case "lte":
                comparisonSelector.$lte = yield operatorValueTransformer(comparisonOperators[op]);
                break;
            case "ne":
                comparisonSelector.$ne = yield operatorValueTransformer(comparisonOperators[op]);
                break;
            case "nin":
                comparisonSelector.$nin = yield Promise.all(comparisonOperators[op].map((val) => operatorValueTransformer(val)));
                break;
        }
    }
    return comparisonSelector;
});
exports.default = mapComparisonOperators;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWFwQ29tYXJpc29uT3BlcmF0b3JzLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vc3JjL3Jlc29sdmVycy91dGlscy9maWx0ZXJRdWVyeS9tYXBDb21hcmlzb25PcGVyYXRvcnMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7QUFFQSxNQUFNLE9BQU8sR0FBRyxNQUFNLEVBQUUsQ0FBQztBQWV6QixNQUFNLHVCQUF1QixHQUE2QixDQUFDLEdBQVEsRUFBRSxFQUFFLENBQUMsR0FBRyxDQUFDO0FBRTVFLE1BQU0sc0JBQXNCLEdBQUcsQ0FDN0IsbUJBQXdDLEVBQ3hDLDJCQUFxRCx1QkFBdUIsRUFDNUUsRUFBRTs7SUFDRixNQUFNLGtCQUFrQixHQUduQixFQUFFLENBQUM7SUFFUixLQUFLLE1BQU0sRUFBRSxJQUFJLE1BQU0sQ0FBQyxJQUFJLENBQzFCLG1CQUFtQixDQUNhLEVBQUU7UUFDbEMsb0NBQW9DO1FBQ3BDLElBQUksTUFBQyxtQkFBbUIsQ0FBQyxFQUFFLENBQUMsdUNBQUksT0FBTyxFQUFDLEtBQUssT0FBTyxFQUFFO1lBQ3BELFNBQVM7U0FDVjtRQUVELFFBQVEsRUFBRSxFQUFFO1lBQ1YsS0FBSyxJQUFJO2dCQUNQLGtCQUFrQixDQUFDLEdBQUcsR0FBRyxNQUFNLHdCQUF3QixDQUNyRCxtQkFBbUIsQ0FBQyxFQUFFLENBQUMsQ0FDeEIsQ0FBQztnQkFDRixNQUFNO1lBQ1IsS0FBSyxJQUFJO2dCQUNQLGtCQUFrQixDQUFDLEdBQUcsR0FBRyxNQUFNLHdCQUF3QixDQUNyRCxtQkFBbUIsQ0FBQyxFQUFFLENBQUMsQ0FDeEIsQ0FBQztnQkFDRixNQUFNO1lBQ1IsS0FBSyxLQUFLO2dCQUNSLGtCQUFrQixDQUFDLElBQUksR0FBRyxNQUFNLHdCQUF3QixDQUN0RCxtQkFBbUIsQ0FBQyxFQUFFLENBQUMsQ0FDeEIsQ0FBQztnQkFDRixNQUFNO1lBQ1IsS0FBSyxJQUFJO2dCQUNQLGtCQUFrQixDQUFDLEdBQUcsR0FBRyxNQUFNLE9BQU8sQ0FBQyxHQUFHLENBQ3hDLG1CQUFtQixDQUFDLEVBQUUsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEdBQUcsRUFBRSxFQUFFLENBQUMsd0JBQXdCLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FDcEUsQ0FBQztnQkFDRixNQUFNO1lBQ1IsS0FBSyxJQUFJO2dCQUNQLGtCQUFrQixDQUFDLEdBQUcsR0FBRyxNQUFNLHdCQUF3QixDQUNyRCxtQkFBbUIsQ0FBQyxFQUFFLENBQUMsQ0FDeEIsQ0FBQztnQkFDRixNQUFNO1lBQ1IsS0FBSyxLQUFLO2dCQUNSLGtCQUFrQixDQUFDLElBQUksR0FBRyxNQUFNLHdCQUF3QixDQUN0RCxtQkFBbUIsQ0FBQyxFQUFFLENBQUMsQ0FDeEIsQ0FBQztnQkFDRixNQUFNO1lBQ1IsS0FBSyxJQUFJO2dCQUNQLGtCQUFrQixDQUFDLEdBQUcsR0FBRyxNQUFNLHdCQUF3QixDQUNyRCxtQkFBbUIsQ0FBQyxFQUFFLENBQUMsQ0FDeEIsQ0FBQztnQkFDRixNQUFNO1lBQ1IsS0FBSyxLQUFLO2dCQUNSLGtCQUFrQixDQUFDLElBQUksR0FBRyxNQUFNLE9BQU8sQ0FBQyxHQUFHLENBQ3pDLG1CQUFtQixDQUFDLEVBQUUsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEdBQUcsRUFBRSxFQUFFLENBQUMsd0JBQXdCLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FDcEUsQ0FBQztnQkFDRixNQUFNO1NBQ1Q7S0FDRjtJQUVELE9BQU8sa0JBQWtCLENBQUM7QUFDNUIsQ0FBQyxDQUFBLENBQUM7QUFFRixrQkFBZSxzQkFBc0IsQ0FBQyJ9