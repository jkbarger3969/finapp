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
var __await = (this && this.__await) || function (v) { return this instanceof __await ? (this.v = v, this) : new __await(v); }
var __asyncGenerator = (this && this.__asyncGenerator) || function (thisArg, _arguments, generator) {
    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
    var g = generator.apply(thisArg, _arguments || []), i, q = [];
    return i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i;
    function verb(n) { if (g[n]) i[n] = function (v) { return new Promise(function (a, b) { q.push([n, v, a, b]) > 1 || resume(n, v); }); }; }
    function resume(n, v) { try { step(g[n](v)); } catch (e) { settle(q[0][3], e); } }
    function step(r) { r.value instanceof __await ? Promise.resolve(r.value.v).then(fulfill, reject) : settle(q[0][2], r); }
    function fulfill(value) { resume("next", value); }
    function reject(value) { resume("throw", value); }
    function settle(f, v) { if (f(v), q.shift(), q.length) resume(q[0][0], q[0][1]); }
};
Object.defineProperty(exports, "__esModule", { value: true });
const iterableFns_1 = require("../../../utils/iterableFns");
const NULLISH = Symbol();
const _logicOpParser_ = function ($and, where, fieldAndConditionGenerator, options) {
    return __asyncGenerator(this, arguments, function* () {
        var e_1, _a;
        try {
            for (var _b = __asyncValues(where[Symbol.asyncIterator]
                ? where
                : (0, iterableFns_1.iterableToAsyncIterable)((0, iterableFns_1.iterateOwnKeyValues)(where))), _c; _c = yield __await(_b.next()), !_c.done;) {
                const [key, value] = _c.value;
                // skip non-own prop and null or undefined filters
                if ((value !== null && value !== void 0 ? value : NULLISH) === NULLISH || typeof key !== "string") {
                    continue;
                }
                // Match Logic Operators
                switch (key) {
                    case "or":
                        $and.push({
                            $or: yield __await(Promise.all(where[key].map((where) => filterQueryCreator(where, fieldAndConditionGenerator, options)))),
                        });
                        /* filterQuery.$or = await Promise.all(
                          where[key as "or"].map((where) =>
                            filterQueryCreator(where, fieldAndConditionGenerator, options)
                          )
                        ); */
                        break;
                    case "and":
                        $and.push(...(yield __await(Promise.all(where[key].map((where) => filterQueryCreator(where, fieldAndConditionGenerator, options))))));
                        /*  filterQuery.$and = await Promise.all(
                          where[key as "and"].map((where) =>
                            filterQueryCreator(where, fieldAndConditionGenerator, options)
                          )
                        ); */
                        break;
                    case "nor":
                        $and.push({
                            $nor: yield __await(Promise.all(where[key].map((where) => filterQueryCreator(where, fieldAndConditionGenerator, options)))),
                        });
                        /* filterQuery.$nor = await Promise.all(
                          where[key as "nor"].map((where) =>
                            filterQueryCreator(where, fieldAndConditionGenerator, options)
                          )
                        ); */
                        break;
                    default: {
                        yield yield __await([
                            key,
                            value,
                        ]);
                    }
                }
            }
        }
        catch (e_1_1) { e_1 = { error: e_1_1 }; }
        finally {
            try {
                if (_c && !_c.done && (_a = _b.return)) yield __await(_a.call(_b));
            }
            finally { if (e_1) throw e_1.error; }
        }
    });
};
const filterQueryCreator = (where, fieldAndConditionGenerator, options) => __awaiter(void 0, void 0, void 0, function* () {
    var e_2, _a;
    const $and = [];
    try {
        for (var _b = __asyncValues(fieldAndConditionGenerator(_logicOpParser_($and, where, fieldAndConditionGenerator, options), options)), _c; _c = yield _b.next(), !_c.done;) {
            const { field, condition } = _c.value;
            if (field === "$and") {
                if (Array.isArray(condition)) {
                    $and.push(...condition);
                }
                else {
                    $and.push(condition);
                }
            }
            else {
                $and.push({ [field]: condition });
            }
        }
    }
    catch (e_2_1) { e_2 = { error: e_2_1 }; }
    finally {
        try {
            if (_c && !_c.done && (_a = _b.return)) yield _a.call(_b);
        }
        finally { if (e_2) throw e_2.error; }
    }
    return { $and };
});
exports.default = filterQueryCreator;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZmlsdGVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vc3JjL3Jlc29sdmVycy91dGlscy9maWx0ZXJRdWVyeS9maWx0ZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBRUEsNERBS29DO0FBR3BDLE1BQU0sT0FBTyxHQUFHLE1BQU0sRUFBRSxDQUFDO0FBMEJ6QixNQUFNLGVBQWUsR0FBRyxVQUl0QixJQUFvRCxFQUNwRCxLQUFtRSxFQUNuRSwwQkFBd0UsRUFDeEUsT0FBa0I7Ozs7WUFLbEIsS0FBaUMsSUFBQSxLQUFBLGNBQUEsS0FBSyxDQUFDLE1BQU0sQ0FBQyxhQUFhLENBQUM7Z0JBQzFELENBQUMsQ0FBRSxLQUE2RDtnQkFDaEUsQ0FBQyxDQUFDLElBQUEscUNBQXVCLEVBQUMsSUFBQSxpQ0FBbUIsRUFBQyxLQUFLLENBQUMsQ0FBQyxDQUFBLElBQUE7Z0JBRjVDLE1BQU0sQ0FBQyxHQUFHLEVBQUUsS0FBSyxDQUFDLFdBQUEsQ0FBQTtnQkFHM0Isa0RBQWtEO2dCQUNsRCxJQUFJLENBQUMsS0FBSyxhQUFMLEtBQUssY0FBTCxLQUFLLEdBQUksT0FBTyxDQUFDLEtBQUssT0FBTyxJQUFJLE9BQU8sR0FBRyxLQUFLLFFBQVEsRUFBRTtvQkFDN0QsU0FBUztpQkFDVjtnQkFFRCx3QkFBd0I7Z0JBQ3hCLFFBQVEsR0FBRyxFQUFFO29CQUNYLEtBQUssSUFBSTt3QkFDUCxJQUFJLENBQUMsSUFBSSxDQUFDOzRCQUNSLEdBQUcsRUFBRSxjQUFNLE9BQU8sQ0FBQyxHQUFHLENBQ3BCLEtBQUssQ0FBQyxHQUFXLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxLQUFLLEVBQUUsRUFBRSxDQUMvQixrQkFBa0IsQ0FBQyxLQUFLLEVBQUUsMEJBQTBCLEVBQUUsT0FBTyxDQUFDLENBQy9ELENBQ0YsQ0FBQTt5QkFDRixDQUFDLENBQUM7d0JBQ0g7Ozs7NkJBSUs7d0JBQ0wsTUFBTTtvQkFDUixLQUFLLEtBQUs7d0JBQ1IsSUFBSSxDQUFDLElBQUksQ0FDUCxHQUFHLENBQUMsY0FBTSxPQUFPLENBQUMsR0FBRyxDQUNuQixLQUFLLENBQUMsR0FBWSxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsS0FBSyxFQUFFLEVBQUUsQ0FDaEMsa0JBQWtCLENBQUMsS0FBSyxFQUFFLDBCQUEwQixFQUFFLE9BQU8sQ0FBQyxDQUMvRCxDQUNGLENBQUEsQ0FBQyxDQUNILENBQUM7d0JBQ0Y7Ozs7NkJBSUs7d0JBQ0wsTUFBTTtvQkFFUixLQUFLLEtBQUs7d0JBQ1IsSUFBSSxDQUFDLElBQUksQ0FBQzs0QkFDUixJQUFJLEVBQUUsY0FBTSxPQUFPLENBQUMsR0FBRyxDQUNyQixLQUFLLENBQUMsR0FBWSxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsS0FBSyxFQUFFLEVBQUUsQ0FDaEMsa0JBQWtCLENBQUMsS0FBSyxFQUFFLDBCQUEwQixFQUFFLE9BQU8sQ0FBQyxDQUMvRCxDQUNGLENBQUE7eUJBQ0YsQ0FBQyxDQUFDO3dCQUNIOzs7OzZCQUlLO3dCQUNMLE1BQU07b0JBQ1IsT0FBTyxDQUFDLENBQUM7d0JBQ1Asb0JBQU07NEJBQ0osR0FBMEQ7NEJBQzFELEtBQW9FO3lCQUNyRSxDQUFBLENBQUM7cUJBQ0g7aUJBQ0Y7YUFDRjs7Ozs7Ozs7O0lBQ0gsQ0FBQztDQUFBLENBQUM7QUFFRixNQUFNLGtCQUFrQixHQUFHLENBSXpCLEtBQW1FLEVBQ25FLDBCQUF3RSxFQUN4RSxPQUFrQixFQUNhLEVBQUU7O0lBQ2pDLE1BQU0sSUFBSSxHQUFtRCxFQUFFLENBQUM7O1FBRWhFLEtBQXlDLElBQUEsS0FBQSxjQUFBLDBCQUEwQixDQUNqRSxlQUFlLENBQUMsSUFBSSxFQUFFLEtBQUssRUFBRSwwQkFBMEIsRUFBRSxPQUFPLENBQUMsRUFDakUsT0FBTyxDQUNSLENBQUEsSUFBQTtZQUhVLE1BQU0sRUFBRSxLQUFLLEVBQUUsU0FBUyxFQUFFLFdBQUEsQ0FBQTtZQUluQyxJQUFJLEtBQUssS0FBSyxNQUFNLEVBQUU7Z0JBQ3BCLElBQUksS0FBSyxDQUFDLE9BQU8sQ0FBQyxTQUFTLENBQUMsRUFBRTtvQkFDNUIsSUFBSSxDQUFDLElBQUksQ0FBQyxHQUFHLFNBQVMsQ0FBQyxDQUFDO2lCQUN6QjtxQkFBTTtvQkFDTCxJQUFJLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDO2lCQUN0QjthQUNGO2lCQUFNO2dCQUNMLElBQUksQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLEtBQUssQ0FBQyxFQUFFLFNBQVMsRUFBRSxDQUFDLENBQUM7YUFDbkM7U0FDRjs7Ozs7Ozs7O0lBRUQsT0FBTyxFQUFFLElBQUksRUFBMEIsQ0FBQztBQUMxQyxDQUFDLENBQUEsQ0FBQztBQUVGLGtCQUFlLGtCQUFrQixDQUFDIn0=