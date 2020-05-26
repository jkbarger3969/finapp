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
var __asyncValues = (this && this.__asyncValues) || function (o) {
    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
    var m = o[Symbol.asyncIterator], i;
    return m ? m.call(o) : (o = typeof __values === "function" ? __values(o) : o[Symbol.iterator](), i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i);
    function verb(n) { i[n] = o[n] && function (v) { return new Promise(function (resolve, reject) { v = o[n](v), settle(resolve, reject, v.done, v.value); }); }; }
    function settle(resolve, reject, d, v) { Promise.resolve(v).then(function(v) { resolve({ value: v, done: d }); }, reject); }
};
Object.defineProperty(exports, "__esModule", { value: true });
const NULLISH = Symbol();
const filterQueryCreator = (where, fieldAndConditionGenerator, opts) => __awaiter(void 0, void 0, void 0, function* () {
    var e_1, _a;
    var _b;
    const filterQuery = {};
    const promises = [];
    for (const key in where) {
        // skip non-own prop and null or undefined filters
        if (!Object.prototype.hasOwnProperty.call(where, key) ||
            (_b = where[key], (_b !== null && _b !== void 0 ? _b : NULLISH)) === NULLISH) {
            continue;
        }
        // Match Logic Operators
        switch (key) {
            case "or":
                filterQuery.$or = yield Promise.all(where[key].map((where) => filterQueryCreator(where, fieldAndConditionGenerator, opts)));
                break;
            case "and":
                filterQuery.$and = yield Promise.all(where[key].map((where) => filterQueryCreator(where, fieldAndConditionGenerator, opts)));
                break;
            case "nor":
                filterQuery.$nor = yield Promise.all(where[key].map((where) => filterQueryCreator(where, fieldAndConditionGenerator, opts)));
                break;
            default: {
                try {
                    for (var _c = __asyncValues(fieldAndConditionGenerator(key, where[key], opts)), _d; _d = yield _c.next(), !_d.done;) {
                        const result = _d.value;
                        const { field, condition } = result;
                        filterQuery[field] = condition;
                    }
                }
                catch (e_1_1) { e_1 = { error: e_1_1 }; }
                finally {
                    try {
                        if (_d && !_d.done && (_a = _c.return)) yield _a.call(_c);
                    }
                    finally { if (e_1) throw e_1.error; }
                }
            }
        }
    }
    return filterQuery;
});
exports.default = filterQueryCreator;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZmlsdGVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vc3JjL3Jlc29sdmVycy91dGlscy9maWx0ZXJRdWVyeS9maWx0ZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBSUEsTUFBTSxPQUFPLEdBQUcsTUFBTSxFQUFFLENBQUM7QUFzQnpCLE1BQU0sa0JBQWtCLEdBQUcsQ0FJekIsS0FBYSxFQUNiLDBCQUFxRSxFQUNyRSxJQUFZLEVBQ2UsRUFBRTs7O0lBQzdCLE1BQU0sV0FBVyxHQUFxQixFQUFFLENBQUM7SUFDekMsTUFBTSxRQUFRLEdBQW9CLEVBQUUsQ0FBQztJQUVyQyxLQUFLLE1BQU0sR0FBRyxJQUFJLEtBQUssRUFBRTtRQUN2QixrREFBa0Q7UUFDbEQsSUFDRSxDQUFDLE1BQU0sQ0FBQyxTQUFTLENBQUMsY0FBYyxDQUFDLElBQUksQ0FBQyxLQUFLLEVBQUUsR0FBRyxDQUFDO1lBQ2pELE1BQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyx1Q0FBSSxPQUFPLEVBQUMsS0FBSyxPQUFPLEVBQ25DO1lBQ0EsU0FBUztTQUNWO1FBRUQsd0JBQXdCO1FBQ3hCLFFBQVEsR0FBRyxFQUFFO1lBQ1gsS0FBSyxJQUFJO2dCQUNQLFdBQVcsQ0FBQyxHQUFHLEdBQUcsTUFBTSxPQUFPLENBQUMsR0FBRyxDQUNqQyxLQUFLLENBQUMsR0FBVyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsS0FBSyxFQUFFLEVBQUUsQ0FDL0Isa0JBQWtCLENBQUMsS0FBSyxFQUFFLDBCQUEwQixFQUFFLElBQUksQ0FBQyxDQUM1RCxDQUNGLENBQUM7Z0JBQ0YsTUFBTTtZQUNSLEtBQUssS0FBSztnQkFDUixXQUFXLENBQUMsSUFBSSxHQUFHLE1BQU0sT0FBTyxDQUFDLEdBQUcsQ0FDbEMsS0FBSyxDQUFDLEdBQVksQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEtBQUssRUFBRSxFQUFFLENBQ2hDLGtCQUFrQixDQUFDLEtBQUssRUFBRSwwQkFBMEIsRUFBRSxJQUFJLENBQUMsQ0FDNUQsQ0FDRixDQUFDO2dCQUNGLE1BQU07WUFFUixLQUFLLEtBQUs7Z0JBQ1IsV0FBVyxDQUFDLElBQUksR0FBRyxNQUFNLE9BQU8sQ0FBQyxHQUFHLENBQ2xDLEtBQUssQ0FBQyxHQUFZLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxLQUFLLEVBQUUsRUFBRSxDQUNoQyxrQkFBa0IsQ0FBQyxLQUFLLEVBQUUsMEJBQTBCLEVBQUUsSUFBSSxDQUFDLENBQzVELENBQ0YsQ0FBQztnQkFDRixNQUFNO1lBQ1IsT0FBTyxDQUFDLENBQUM7O29CQUNQLEtBQTJCLElBQUEsS0FBQSxjQUFBLDBCQUEwQixDQUNsRCxHQUdBLEVBQ0EsS0FBSyxDQUFDLEdBQUcsQ0FHUixFQUNGLElBQUksQ0FDTCxDQUFBLElBQUE7d0JBVlUsTUFBTSxNQUFNLFdBQUEsQ0FBQTt3QkFXckIsTUFBTSxFQUFFLEtBQUssRUFBRSxTQUFTLEVBQUUsR0FBRyxNQUFNLENBQUM7d0JBQ3BDLFdBQVcsQ0FBQyxLQUFLLENBQUMsR0FBRyxTQUFTLENBQUM7cUJBQ2hDOzs7Ozs7Ozs7YUFDRjtTQUNGO0tBQ0Y7SUFFRCxPQUFPLFdBQVcsQ0FBQztBQUNyQixDQUFDLENBQUEsQ0FBQztBQUVGLGtCQUFlLGtCQUFrQixDQUFDIn0=