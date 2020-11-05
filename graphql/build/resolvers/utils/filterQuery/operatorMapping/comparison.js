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
exports.comparisonOpsMapper = void 0;
exports.comparisonOpsMapper = (op) => {
    switch (op) {
        case "eq":
            return "$eq";
        case "gt":
            return "$gt";
        case "gte":
            return "$gte";
        case "in":
            return "$in";
        case "lt":
            return "$lt";
        case "lte":
            return "$lte";
        case "ne":
            return "$ne";
        case "nin":
            return "$nin";
    }
};
const comparisonQueryGenerator = (opValueTransmutator = (arg) => arg) => function* (opValues, querySelector) {
    const promises = [];
    for (const [op, opValue] of opValues) {
        let comparisonOp = null;
        let result;
        switch (op) {
            case "eq": {
                result = opValueTransmutator(opValue, op);
                comparisonOp = "$eq";
                break;
            }
            case "gt":
                comparisonOp = "$gt";
                result = opValueTransmutator(opValue, op);
                break;
            case "gte":
                comparisonOp = "$gte";
                result = opValueTransmutator(opValue, op);
                break;
            case "in":
                comparisonOp = "$in";
                result = opValueTransmutator(opValue, op);
                break;
            case "lt":
                comparisonOp = "$lt";
                result = opValueTransmutator(opValue, op);
                break;
            case "lte":
                comparisonOp = "$lte";
                result = opValueTransmutator(opValue, op);
                break;
            case "ne":
                comparisonOp = "$ne";
                result = opValueTransmutator(opValue, op);
                break;
            case "nin":
                comparisonOp = "$nin";
                result = opValueTransmutator(opValue, op);
                break;
            default:
                yield [op, opValue];
        }
        if (comparisonOp === null) {
            continue;
        }
        else if (result instanceof Promise) {
            promises.push((() => __awaiter(this, void 0, void 0, function* () {
                querySelector[comparisonOp] = (yield result);
            }))());
        }
        else {
            querySelector[comparisonOp] = result;
        }
    }
    if (promises.length > 0) {
        return Promise.all(promises).then(() => void undefined);
    }
};
exports.default = comparisonQueryGenerator;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29tcGFyaXNvbi5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3NyYy9yZXNvbHZlcnMvdXRpbHMvZmlsdGVyUXVlcnkvb3BlcmF0b3JNYXBwaW5nL2NvbXBhcmlzb24udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7O0FBNkJhLFFBQUEsbUJBQW1CLEdBQUcsQ0FDakMsRUFBdUIsRUFDVyxFQUFFO0lBQ3BDLFFBQVEsRUFBRSxFQUFFO1FBQ1YsS0FBSyxJQUFJO1lBQ1AsT0FBTyxLQUFLLENBQUM7UUFDZixLQUFLLElBQUk7WUFDUCxPQUFPLEtBQUssQ0FBQztRQUNmLEtBQUssS0FBSztZQUNSLE9BQU8sTUFBTSxDQUFDO1FBQ2hCLEtBQUssSUFBSTtZQUNQLE9BQU8sS0FBSyxDQUFDO1FBQ2YsS0FBSyxJQUFJO1lBQ1AsT0FBTyxLQUFLLENBQUM7UUFDZixLQUFLLEtBQUs7WUFDUixPQUFPLE1BQU0sQ0FBQztRQUNoQixLQUFLLElBQUk7WUFDUCxPQUFPLEtBQUssQ0FBQztRQUNmLEtBQUssS0FBSztZQUNSLE9BQU8sTUFBTSxDQUFDO0tBQ2pCO0FBQ0gsQ0FBQyxDQUFDO0FBRUYsTUFBTSx3QkFBd0IsR0FBRyxDQUMvQixzQkFLSSxDQUFDLEdBQVEsRUFBRSxFQUFFLENBQUMsR0FBRyxFQUNvRCxFQUFFLENBQzNFLFFBQVEsQ0FBQyxFQUFFLFFBQVEsRUFBRSxhQUFhO0lBQ2hDLE1BQU0sUUFBUSxHQUFvQixFQUFFLENBQUM7SUFFckMsS0FBSyxNQUFNLENBQUMsRUFBRSxFQUFFLE9BQU8sQ0FBQyxJQUFJLFFBQVEsRUFBRTtRQUNwQyxJQUFJLFlBQVksR0FBb0MsSUFBSSxDQUFDO1FBQ3pELElBQUksTUFFc0MsQ0FBQztRQUUzQyxRQUFRLEVBQUUsRUFBRTtZQUNWLEtBQUssSUFBSSxDQUFDLENBQUM7Z0JBQ1QsTUFBTSxHQUFHLG1CQUFtQixDQUFDLE9BQU8sRUFBRSxFQUFFLENBQUMsQ0FBQztnQkFDMUMsWUFBWSxHQUFHLEtBQUssQ0FBQztnQkFDckIsTUFBTTthQUNQO1lBQ0QsS0FBSyxJQUFJO2dCQUNQLFlBQVksR0FBRyxLQUFLLENBQUM7Z0JBQ3JCLE1BQU0sR0FBRyxtQkFBbUIsQ0FBQyxPQUFPLEVBQUUsRUFBRSxDQUFDLENBQUM7Z0JBQzFDLE1BQU07WUFDUixLQUFLLEtBQUs7Z0JBQ1IsWUFBWSxHQUFHLE1BQU0sQ0FBQztnQkFDdEIsTUFBTSxHQUFHLG1CQUFtQixDQUFDLE9BQU8sRUFBRSxFQUFFLENBQUMsQ0FBQztnQkFDMUMsTUFBTTtZQUNSLEtBQUssSUFBSTtnQkFDUCxZQUFZLEdBQUcsS0FBSyxDQUFDO2dCQUNyQixNQUFNLEdBQUcsbUJBQW1CLENBQUMsT0FBTyxFQUFFLEVBQUUsQ0FBQyxDQUFDO2dCQUMxQyxNQUFNO1lBQ1IsS0FBSyxJQUFJO2dCQUNQLFlBQVksR0FBRyxLQUFLLENBQUM7Z0JBQ3JCLE1BQU0sR0FBRyxtQkFBbUIsQ0FBQyxPQUFPLEVBQUUsRUFBRSxDQUFDLENBQUM7Z0JBQzFDLE1BQU07WUFDUixLQUFLLEtBQUs7Z0JBQ1IsWUFBWSxHQUFHLE1BQU0sQ0FBQztnQkFDdEIsTUFBTSxHQUFHLG1CQUFtQixDQUFDLE9BQU8sRUFBRSxFQUFFLENBQUMsQ0FBQztnQkFDMUMsTUFBTTtZQUNSLEtBQUssSUFBSTtnQkFDUCxZQUFZLEdBQUcsS0FBSyxDQUFDO2dCQUNyQixNQUFNLEdBQUcsbUJBQW1CLENBQUMsT0FBTyxFQUFFLEVBQUUsQ0FBQyxDQUFDO2dCQUMxQyxNQUFNO1lBQ1IsS0FBSyxLQUFLO2dCQUNSLFlBQVksR0FBRyxNQUFNLENBQUM7Z0JBQ3RCLE1BQU0sR0FBRyxtQkFBbUIsQ0FBQyxPQUFPLEVBQUUsRUFBRSxDQUFDLENBQUM7Z0JBQzFDLE1BQU07WUFDUjtnQkFDRSxNQUFNLENBQUMsRUFBRSxFQUFFLE9BQU8sQ0FBQyxDQUFDO1NBQ3ZCO1FBRUQsSUFBSSxZQUFZLEtBQUssSUFBSSxFQUFFO1lBQ3pCLFNBQVM7U0FDVjthQUFNLElBQUksTUFBTSxZQUFZLE9BQU8sRUFBRTtZQUNwQyxRQUFRLENBQUMsSUFBSSxDQUNYLENBQUMsR0FBUyxFQUFFO2dCQUNWLGFBQWEsQ0FBQyxZQUFZLENBQUMsR0FBRyxDQUFDLE1BQU0sTUFBTSxDQUFRLENBQUM7WUFDdEQsQ0FBQyxDQUFBLENBQUMsRUFBRSxDQUNMLENBQUM7U0FDSDthQUFNO1lBQ0wsYUFBYSxDQUFDLFlBQVksQ0FBQyxHQUFHLE1BQWEsQ0FBQztTQUM3QztLQUNGO0lBRUQsSUFBSSxRQUFRLENBQUMsTUFBTSxHQUFHLENBQUMsRUFBRTtRQUN2QixPQUFPLE9BQU8sQ0FBQyxHQUFHLENBQUMsUUFBUSxDQUFDLENBQUMsSUFBSSxDQUFDLEdBQUcsRUFBRSxDQUFDLEtBQUssU0FBUyxDQUFDLENBQUM7S0FDekQ7QUFDSCxDQUFDLENBQUM7QUFFSixrQkFBZSx3QkFBd0IsQ0FBQyJ9