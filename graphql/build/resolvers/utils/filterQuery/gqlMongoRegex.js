"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const graphTypes_1 = require("../../../graphTypes");
const parseGQLMongoRegex = (whereRegex) => {
    const condition = {
        $regex: whereRegex.pattern,
    };
    if (whereRegex.options) {
        condition.$options = Array.from(whereRegex.options.reduce((optSet, option) => {
            switch (option) {
                case graphTypes_1.RegexOptions.CaseInsensitive:
                case graphTypes_1.RegexOptions.I:
                    optSet.add("i");
                    break;
                case graphTypes_1.RegexOptions.Multiline:
                case graphTypes_1.RegexOptions.M:
                    optSet.add("m");
                    break;
                case graphTypes_1.RegexOptions.Extended:
                case graphTypes_1.RegexOptions.X:
                    optSet.add("x");
                    break;
                case graphTypes_1.RegexOptions.DotAll:
                case graphTypes_1.RegexOptions.S:
                    optSet.add("s");
                    break;
            }
            return optSet;
        }, 
        // Insure no duplicate options
        new Set())).join("");
    }
    return condition;
};
exports.default = parseGQLMongoRegex;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ3FsTW9uZ29SZWdleC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9yZXNvbHZlcnMvdXRpbHMvZmlsdGVyUXVlcnkvZ3FsTW9uZ29SZWdleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLG9EQUFvRTtBQUVwRSxNQUFNLGtCQUFrQixHQUFHLENBQ3pCLFVBQTJCLEVBQ1ksRUFBRTtJQUN6QyxNQUFNLFNBQVMsR0FBMEM7UUFDdkQsTUFBTSxFQUFFLFVBQVUsQ0FBQyxPQUFPO0tBQzNCLENBQUM7SUFFRixJQUFJLFVBQVUsQ0FBQyxPQUFPLEVBQUU7UUFDdEIsU0FBUyxDQUFDLFFBQVEsR0FBRyxLQUFLLENBQUMsSUFBSSxDQUM3QixVQUFVLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FDdkIsQ0FBQyxNQUFNLEVBQUUsTUFBTSxFQUFFLEVBQUU7WUFDakIsUUFBUSxNQUFNLEVBQUU7Z0JBQ2QsS0FBSyx5QkFBWSxDQUFDLGVBQWUsQ0FBQztnQkFDbEMsS0FBSyx5QkFBWSxDQUFDLENBQUM7b0JBQ2pCLE1BQU0sQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUM7b0JBQ2hCLE1BQU07Z0JBQ1IsS0FBSyx5QkFBWSxDQUFDLFNBQVMsQ0FBQztnQkFDNUIsS0FBSyx5QkFBWSxDQUFDLENBQUM7b0JBQ2pCLE1BQU0sQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUM7b0JBQ2hCLE1BQU07Z0JBQ1IsS0FBSyx5QkFBWSxDQUFDLFFBQVEsQ0FBQztnQkFDM0IsS0FBSyx5QkFBWSxDQUFDLENBQUM7b0JBQ2pCLE1BQU0sQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUM7b0JBQ2hCLE1BQU07Z0JBQ1IsS0FBSyx5QkFBWSxDQUFDLE1BQU0sQ0FBQztnQkFDekIsS0FBSyx5QkFBWSxDQUFDLENBQUM7b0JBQ2pCLE1BQU0sQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUM7b0JBQ2hCLE1BQU07YUFDVDtZQUNELE9BQU8sTUFBTSxDQUFDO1FBQ2hCLENBQUM7UUFDRCw4QkFBOEI7UUFDOUIsSUFBSSxHQUFHLEVBQXlCLENBQ2pDLENBQ0YsQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUM7S0FDWjtJQUVELE9BQU8sU0FBUyxDQUFDO0FBQ25CLENBQUMsQ0FBQztBQUVGLGtCQUFlLGtCQUFrQixDQUFDIn0=