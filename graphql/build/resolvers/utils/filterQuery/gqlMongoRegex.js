"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const graphTypes_1 = require("../../../graphTypes");
const parseGQLMongoRegex = (whereRegex) => {
    const condition = {
        $regex: whereRegex.pattern,
    };
    if (whereRegex.flags) {
        condition.$options = Array.from(whereRegex.flags.reduce((optSet, flag) => {
            switch (flag) {
                case graphTypes_1.RegexFlags.I:
                    optSet.add("i");
                    break;
                case graphTypes_1.RegexFlags.M:
                    optSet.add("m");
                    break;
                case graphTypes_1.RegexFlags.S:
                    optSet.add("s");
                    break;
                // 'x' not supported in standard Mongo regex options via this enum usually, or mapped differently?
                // Schema only has G, I, M, S.
            }
            return optSet;
        }, new Set())).join("");
    }
    return condition;
};
exports.default = parseGQLMongoRegex;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ3FsTW9uZ29SZWdleC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9yZXNvbHZlcnMvdXRpbHMvZmlsdGVyUXVlcnkvZ3FsTW9uZ29SZWdleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLG9EQUE2RDtBQUU3RCxNQUFNLGtCQUFrQixHQUFHLENBQ3pCLFVBQXNCLEVBQ2lCLEVBQUU7SUFDekMsTUFBTSxTQUFTLEdBQTBDO1FBQ3ZELE1BQU0sRUFBRSxVQUFVLENBQUMsT0FBTztLQUMzQixDQUFDO0lBRUYsSUFBSSxVQUFVLENBQUMsS0FBSyxFQUFFO1FBQ3BCLFNBQVMsQ0FBQyxRQUFRLEdBQUcsS0FBSyxDQUFDLElBQUksQ0FDN0IsVUFBVSxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQ3JCLENBQUMsTUFBTSxFQUFFLElBQUksRUFBRSxFQUFFO1lBQ2YsUUFBUSxJQUFJLEVBQUU7Z0JBQ1osS0FBSyx1QkFBVSxDQUFDLENBQUM7b0JBQ2YsTUFBTSxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQztvQkFDaEIsTUFBTTtnQkFDUixLQUFLLHVCQUFVLENBQUMsQ0FBQztvQkFDZixNQUFNLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDO29CQUNoQixNQUFNO2dCQUNSLEtBQUssdUJBQVUsQ0FBQyxDQUFDO29CQUNmLE1BQU0sQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUM7b0JBQ2hCLE1BQU07Z0JBQ1Isa0dBQWtHO2dCQUNsRyw4QkFBOEI7YUFDL0I7WUFDRCxPQUFPLE1BQU0sQ0FBQztRQUNoQixDQUFDLEVBQ0QsSUFBSSxHQUFHLEVBQXlCLENBQ2pDLENBQ0YsQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUM7S0FDWjtJQUVELE9BQU8sU0FBUyxDQUFDO0FBQ25CLENBQUMsQ0FBQztBQUVGLGtCQUFlLGtCQUFrQixDQUFDIn0=