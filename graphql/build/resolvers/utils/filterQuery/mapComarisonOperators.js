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
        if (((_a = comparisonOperators[op]) !== null && _a !== void 0 ? _a : NULLISH) === NULLISH) {
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWFwQ29tYXJpc29uT3BlcmF0b3JzLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vc3JjL3Jlc29sdmVycy91dGlscy9maWx0ZXJRdWVyeS9tYXBDb21hcmlzb25PcGVyYXRvcnMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7QUFFQSxNQUFNLE9BQU8sR0FBRyxNQUFNLEVBQUUsQ0FBQztBQWV6QixNQUFNLHVCQUF1QixHQUE2QixDQUFDLEdBQVEsRUFBRSxFQUFFLENBQUMsR0FBRyxDQUFDO0FBRTVFLE1BQU0sc0JBQXNCLEdBQUcsQ0FDN0IsbUJBQXdDLEVBQ3hDLDJCQUFxRCx1QkFBdUIsRUFDNUUsRUFBRTs7SUFDRixNQUFNLGtCQUFrQixHQUtwQixFQUFFLENBQUM7SUFFUCxLQUFLLE1BQU0sRUFBRSxJQUFJLE1BQU0sQ0FBQyxJQUFJLENBQzFCLG1CQUFtQixDQUNhLEVBQUU7UUFDbEMsb0NBQW9DO1FBQ3BDLElBQUksQ0FBQyxNQUFBLG1CQUFtQixDQUFDLEVBQUUsQ0FBQyxtQ0FBSSxPQUFPLENBQUMsS0FBSyxPQUFPLEVBQUU7WUFDcEQsU0FBUztTQUNWO1FBRUQsUUFBUSxFQUFFLEVBQUU7WUFDVixLQUFLLElBQUk7Z0JBQ1Asa0JBQWtCLENBQUMsR0FBRyxHQUFHLE1BQU0sd0JBQXdCLENBQ3JELG1CQUFtQixDQUFDLEVBQUUsQ0FBQyxDQUN4QixDQUFDO2dCQUNGLE1BQU07WUFDUixLQUFLLElBQUk7Z0JBQ1Asa0JBQWtCLENBQUMsR0FBRyxHQUFHLE1BQU0sd0JBQXdCLENBQ3JELG1CQUFtQixDQUFDLEVBQUUsQ0FBQyxDQUN4QixDQUFDO2dCQUNGLE1BQU07WUFDUixLQUFLLEtBQUs7Z0JBQ1Isa0JBQWtCLENBQUMsSUFBSSxHQUFHLE1BQU0sd0JBQXdCLENBQ3RELG1CQUFtQixDQUFDLEVBQUUsQ0FBQyxDQUN4QixDQUFDO2dCQUNGLE1BQU07WUFDUixLQUFLLElBQUk7Z0JBQ1Asa0JBQWtCLENBQUMsR0FBRyxHQUFHLE1BQU0sT0FBTyxDQUFDLEdBQUcsQ0FDeEMsbUJBQW1CLENBQUMsRUFBRSxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsR0FBRyxFQUFFLEVBQUUsQ0FBQyx3QkFBd0IsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUNwRSxDQUFDO2dCQUNGLE1BQU07WUFDUixLQUFLLElBQUk7Z0JBQ1Asa0JBQWtCLENBQUMsR0FBRyxHQUFHLE1BQU0sd0JBQXdCLENBQ3JELG1CQUFtQixDQUFDLEVBQUUsQ0FBQyxDQUN4QixDQUFDO2dCQUNGLE1BQU07WUFDUixLQUFLLEtBQUs7Z0JBQ1Isa0JBQWtCLENBQUMsSUFBSSxHQUFHLE1BQU0sd0JBQXdCLENBQ3RELG1CQUFtQixDQUFDLEVBQUUsQ0FBQyxDQUN4QixDQUFDO2dCQUNGLE1BQU07WUFDUixLQUFLLElBQUk7Z0JBQ1Asa0JBQWtCLENBQUMsR0FBRyxHQUFHLE1BQU0sd0JBQXdCLENBQ3JELG1CQUFtQixDQUFDLEVBQUUsQ0FBQyxDQUN4QixDQUFDO2dCQUNGLE1BQU07WUFDUixLQUFLLEtBQUs7Z0JBQ1Isa0JBQWtCLENBQUMsSUFBSSxHQUFHLE1BQU0sT0FBTyxDQUFDLEdBQUcsQ0FDekMsbUJBQW1CLENBQUMsRUFBRSxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsR0FBRyxFQUFFLEVBQUUsQ0FBQyx3QkFBd0IsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUNwRSxDQUFDO2dCQUNGLE1BQU07U0FDVDtLQUNGO0lBRUQsT0FBTyxrQkFBa0IsQ0FBQztBQUM1QixDQUFDLENBQUEsQ0FBQztBQUVGLGtCQUFlLHNCQUFzQixDQUFDIn0=