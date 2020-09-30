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
const _logicOpParser_ = function (filterQuery, where, fieldAndConditionGenerator, options) {
    return __asyncGenerator(this, arguments, function* () {
        var e_1, _a;
        try {
            for (var _b = __asyncValues(where[Symbol.asyncIterator]
                ? where
                : iterableFns_1.iterableToAsyncIterable(iterableFns_1.iterateOwnKeyValues(where))), _c; _c = yield __await(_b.next()), !_c.done;) {
                const [key, value] = _c.value;
                // skip non-own prop and null or undefined filters
                if (((value !== null && value !== void 0 ? value : NULLISH)) === NULLISH || typeof key !== "string") {
                    continue;
                }
                // Match Logic Operators
                switch (key) {
                    case "or":
                        filterQuery.$or = yield __await(Promise.all(where[key].map((where) => filterQueryCreator(where, fieldAndConditionGenerator, options))));
                        break;
                    case "and":
                        filterQuery.$and = yield __await(Promise.all(where[key].map((where) => filterQueryCreator(where, fieldAndConditionGenerator, options))));
                        break;
                    case "nor":
                        filterQuery.$nor = yield __await(Promise.all(where[key].map((where) => filterQueryCreator(where, fieldAndConditionGenerator, options))));
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
    const filterQuery = {};
    try {
        for (var _b = __asyncValues(fieldAndConditionGenerator(_logicOpParser_(filterQuery, where, fieldAndConditionGenerator, options), options)), _c; _c = yield _b.next(), !_c.done;) {
            const { field, condition } = _c.value;
            // Handle multiple "$and" queries.
            if (field === "$and" && "$and" in filterQuery) {
                filterQuery.$and = [...filterQuery.$and, ...condition];
            }
            // Handle multiple "$or" queries.
            else if (field === "$or" && "$or" in filterQuery) {
                if ("$and" in filterQuery) {
                    filterQuery.$and = [
                        ...filterQuery.$and,
                        { $or: condition },
                    ];
                }
                else {
                    filterQuery.$and = [{ $or: condition }];
                }
            }
            // Handle multiple "$nor" queries.
            else if (field === "$nor" && "$nor" in filterQuery) {
                filterQuery.$nor = [...filterQuery.$nor, ...condition];
            }
            // Handle multiple "$expr" queries.
            else if (field === "$expr" && "$expr" in filterQuery) {
                filterQuery.$expr = {
                    $allElementsTrue: [[filterQuery.$expr, condition]],
                };
            }
            else {
                filterQuery[field] = condition;
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
    return filterQuery;
});
exports.default = filterQueryCreator;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZmlsdGVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vc3JjL3Jlc29sdmVycy91dGlscy9maWx0ZXJRdWVyeS9maWx0ZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBRUEsNERBS29DO0FBR3BDLE1BQU0sT0FBTyxHQUFHLE1BQU0sRUFBRSxDQUFDO0FBMEJ6QixNQUFNLGVBQWUsR0FBRyxVQUl0QixXQUFpQyxFQUNqQyxLQUFtRSxFQUNuRSwwQkFBd0UsRUFDeEUsT0FBa0I7Ozs7WUFLbEIsS0FBaUMsSUFBQSxLQUFBLGNBQUEsS0FBSyxDQUFDLE1BQU0sQ0FBQyxhQUFhLENBQUM7Z0JBQzFELENBQUMsQ0FBRSxLQUE2RDtnQkFDaEUsQ0FBQyxDQUFDLHFDQUF1QixDQUFDLGlDQUFtQixDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUEsSUFBQTtnQkFGNUMsTUFBTSxDQUFDLEdBQUcsRUFBRSxLQUFLLENBQUMsV0FBQSxDQUFBO2dCQUczQixrREFBa0Q7Z0JBQ2xELElBQUksRUFBQyxLQUFLLGFBQUwsS0FBSyxjQUFMLEtBQUssR0FBSSxPQUFPLEVBQUMsS0FBSyxPQUFPLElBQUksT0FBTyxHQUFHLEtBQUssUUFBUSxFQUFFO29CQUM3RCxTQUFTO2lCQUNWO2dCQUVELHdCQUF3QjtnQkFDeEIsUUFBUSxHQUFHLEVBQUU7b0JBQ1gsS0FBSyxJQUFJO3dCQUNQLFdBQVcsQ0FBQyxHQUFHLEdBQUcsY0FBTSxPQUFPLENBQUMsR0FBRyxDQUNqQyxLQUFLLENBQUMsR0FBVyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsS0FBSyxFQUFFLEVBQUUsQ0FDL0Isa0JBQWtCLENBQUMsS0FBSyxFQUFFLDBCQUEwQixFQUFFLE9BQU8sQ0FBQyxDQUMvRCxDQUNGLENBQUEsQ0FBQzt3QkFDRixNQUFNO29CQUNSLEtBQUssS0FBSzt3QkFDUixXQUFXLENBQUMsSUFBSSxHQUFHLGNBQU0s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