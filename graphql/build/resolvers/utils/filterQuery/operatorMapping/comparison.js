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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29tcGFyaXNvbi5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3NyYy9yZXNvbHZlcnMvdXRpbHMvZmlsdGVyUXVlcnkvb3BlcmF0b3JNYXBwaW5nL2NvbXBhcmlzb24udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7QUE2QmEsUUFBQSxtQkFBbUIsR0FBRyxDQUNqQyxFQUF1QixFQUNXLEVBQUU7SUFDcEMsUUFBUSxFQUFFLEVBQUU7UUFDVixLQUFLLElBQUk7WUFDUCxPQUFPLEtBQUssQ0FBQztRQUNmLEtBQUssSUFBSTtZQUNQLE9BQU8sS0FBSyxDQUFDO1FBQ2YsS0FBSyxLQUFLO1lBQ1IsT0FBTyxNQUFNLENBQUM7UUFDaEIsS0FBSyxJQUFJO1lBQ1AsT0FBTyxLQUFLLENBQUM7UUFDZixLQUFLLElBQUk7WUFDUCxPQUFPLEtBQUssQ0FBQztRQUNmLEtBQUssS0FBSztZQUNSLE9BQU8sTUFBTSxDQUFDO1FBQ2hCLEtBQUssSUFBSTtZQUNQLE9BQU8sS0FBSyxDQUFDO1FBQ2YsS0FBSyxLQUFLO1lBQ1IsT0FBTyxNQUFNLENBQUM7S0FDakI7QUFDSCxDQUFDLENBQUM7QUFFRixNQUFNLHdCQUF3QixHQUFHLENBQy9CLHNCQUtJLENBQUMsR0FBUSxFQUFFLEVBQUUsQ0FBQyxHQUFHLEVBQ29ELEVBQUUsQ0FDM0UsUUFBUSxDQUFDLEVBQUUsUUFBUSxFQUFFLGFBQWE7SUFDaEMsTUFBTSxRQUFRLEdBQW9CLEVBQUUsQ0FBQztJQUVyQyxLQUFLLE1BQU0sQ0FBQyxFQUFFLEVBQUUsT0FBTyxDQUFDLElBQUksUUFBUSxFQUFFO1FBQ3BDLElBQUksWUFBWSxHQUFvQyxJQUFJLENBQUM7UUFDekQsSUFBSSxNQUVzQyxDQUFDO1FBRTNDLFFBQVEsRUFBRSxFQUFFO1lBQ1YsS0FBSyxJQUFJLENBQUMsQ0FBQztnQkFDVCxNQUFNLEdBQUcsbUJBQW1CLENBQUMsT0FBTyxFQUFFLEVBQUUsQ0FBQyxDQUFDO2dCQUMxQyxZQUFZLEdBQUcsS0FBSyxDQUFDO2dCQUNyQixNQUFNO2FBQ1A7WUFDRCxLQUFLLElBQUk7Z0JBQ1AsWUFBWSxHQUFHLEtBQUssQ0FBQztnQkFDckIsTUFBTSxHQUFHLG1CQUFtQixDQUFDLE9BQU8sRUFBRSxFQUFFLENBQUMsQ0FBQztnQkFDMUMsTUFBTTtZQUNSLEtBQUssS0FBSztnQkFDUixZQUFZLEdBQUcsTUFBTSxDQUFDO2dCQUN0QixNQUFNLEdBQUcsbUJBQW1CLENBQUMsT0FBTyxFQUFFLEVBQUUsQ0FBQyxDQUFDO2dCQUMxQyxNQUFNO1lBQ1IsS0FBSyxJQUFJO2dCQUNQLFlBQVksR0FBRyxLQUFLLENBQUM7Z0JBQ3JCLE1BQU0sR0FBRyxtQkFBbUIsQ0FBQyxPQUFPLEVBQUUsRUFBRSxDQUFDLENBQUM7Z0JBQzFDLE1BQU07WUFDUixLQUFLLElBQUk7Z0JBQ1AsWUFBWSxHQUFHLEtBQUssQ0FBQztnQkFDckIsTUFBTSxHQUFHLG1CQUFtQixDQUFDLE9BQU8sRUFBRSxFQUFFLENBQUMsQ0FBQztnQkFDMUMsTUFBTTtZQUNSLEtBQUssS0FBSztnQkFDUixZQUFZLEdBQUcsTUFBTSxDQUFDO2dCQUN0QixNQUFNLEdBQUcsbUJBQW1CLENBQUMsT0FBTyxFQUFFLEVBQUUsQ0FBQyxDQUFDO2dCQUMxQyxNQUFNO1lBQ1IsS0FBSyxJQUFJO2dCQUNQLFlBQVksR0FBRyxLQUFLLENBQUM7Z0JBQ3JCLE1BQU0sR0FBRyxtQkFBbUIsQ0FBQyxPQUFPLEVBQUUsRUFBRSxDQUFDLENBQUM7Z0JBQzFDLE1BQU07WUFDUixLQUFLLEtBQUs7Z0JBQ1IsWUFBWSxHQUFHLE1BQU0sQ0FBQztnQkFDdEIsTUFBTSxHQUFHLG1CQUFtQixDQUFDLE9BQU8sRUFBRSxFQUFFLENBQUMsQ0FBQztnQkFDMUMsTUFBTTtZQUNSO2dCQUNFLE1BQU0sQ0FBQyxFQUFFLEVBQUUsT0FBTyxDQUFDLENBQUM7U0FDdkI7UUFFRCxJQUFJLFlBQVksS0FBSyxJQUFJLEVBQUU7WUFDekIsU0FBUztTQUNWO2FBQU0sSUFBSSxNQUFNLFlBQVksT0FBTyxFQUFFO1lBQ3BDLFFBQVEsQ0FBQyxJQUFJLENBQ1gsQ0FBQyxHQUFTLEVBQUU7Z0JBQ1YsYUFBYSxDQUFDLFlBQVksQ0FBQyxHQUFHLENBQUMsTUFBTSxNQUFNLENBQVEsQ0FBQztZQUN0RCxDQUFDLENBQUEsQ0FBQyxFQUFFLENBQ0wsQ0FBQztTQUNIO2FBQU07WUFDTCxhQUFhLENBQUMsWUFBWSxDQUFDLEdBQUcsTUFBYSxDQUFDO1NBQzdDO0tBQ0Y7SUFFRCxJQUFJLFFBQVEsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxFQUFFO1FBQ3ZCLE9BQU8sT0FBTyxDQUFDLEdBQUcsQ0FBQyxRQUFRLENBQUMsQ0FBQyxJQUFJLENBQUMsR0FBRyxFQUFFLENBQUMsS0FBSyxTQUFTLENBQUMsQ0FBQztLQUN6RDtBQUNILENBQUMsQ0FBQztBQUVKLGtCQUFlLHdCQUF3QixDQUFDIn0=