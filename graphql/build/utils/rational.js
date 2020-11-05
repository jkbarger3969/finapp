"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.rationalToFraction = exports.fractionToRational = void 0;
const fraction_js_1 = require("fraction.js");
const graphTypes_1 = require("../graphTypes");
exports.fractionToRational = (fraction) => ({
    n: Math.abs(fraction.n),
    d: Math.abs(fraction.d),
    s: fraction.s === -1 ? graphTypes_1.RationalSign.Neg : graphTypes_1.RationalSign.Pos,
});
exports.rationalToFraction = (rational) => new fraction_js_1.default({
    n: rational.s === graphTypes_1.RationalSign.Neg
        ? -Math.abs(rational.n)
        : Math.abs(rational.n),
    d: Math.abs(rational.d),
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmF0aW9uYWwuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvdXRpbHMvcmF0aW9uYWwudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBQUEsNkNBQW1DO0FBRW5DLDhDQUFzRTtBQUV6RCxRQUFBLGtCQUFrQixHQUFHLENBQ2hDLFFBQXdELEVBQ1YsRUFBRSxDQUFDLENBQUM7SUFDbEQsQ0FBQyxFQUFFLElBQUksQ0FBQyxHQUFHLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQztJQUN2QixDQUFDLEVBQUUsSUFBSSxDQUFDLEdBQUcsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDO0lBQ3ZCLENBQUMsRUFBRSxRQUFRLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyx5QkFBWSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMseUJBQVksQ0FBQyxHQUFHO0NBQzNELENBQUMsQ0FBQztBQUVVLFFBQUEsa0JBQWtCLEdBQUcsQ0FBQyxRQUFrQyxFQUFFLEVBQUUsQ0FDdkUsSUFBSSxxQkFBUSxDQUFDO0lBQ1gsQ0FBQyxFQUNDLFFBQVEsQ0FBQyxDQUFDLEtBQUsseUJBQVksQ0FBQyxHQUFHO1FBQzdCLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQztRQUN2QixDQUFDLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDO0lBQzFCLENBQUMsRUFBRSxJQUFJLENBQUMsR0FBRyxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUM7Q0FDeEIsQ0FBQyxDQUFDIn0=