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
var __asyncValues = (this && this.__asyncValues) || function (o) {
    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
    var m = o[Symbol.asyncIterator], i;
    return m ? m.call(o) : (o = typeof __values === "function" ? __values(o) : o[Symbol.iterator](), i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i);
    function verb(n) { i[n] = o[n] && function (v) { return new Promise(function (resolve, reject) { v = o[n](v), settle(resolve, reject, v.done, v.value); }); }; }
    function settle(resolve, reject, d, v) { Promise.resolve(v).then(function(v) { resolve({ value: v, done: d }); }, reject); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Category = exports.categoryType = exports.categoryAncestorPath = void 0;
const change_case_1 = require("change-case");
const NULLISH = Symbol("NULLISH");
/**
 * Lookup Category ancestors by passing parent.
 */
const categoryAncestorPath = function ({ accountingDb, fromCategory, options, }) {
    return __asyncGenerator(this, arguments, function* () {
        while ((fromCategory !== null && fromCategory !== void 0 ? fromCategory : NULLISH) !== NULLISH) {
            const ancestor = yield __await(accountingDb.findOne({
                collection: "categories",
                filter: {
                    _id: fromCategory,
                },
                options,
            }));
            yield yield __await(ancestor);
            fromCategory = ancestor.parent;
        }
    });
};
exports.categoryAncestorPath = categoryAncestorPath;
/**
 * Look up category type
 */ const categoryType = ({ accountingDb, category, }) => __awaiter(void 0, void 0, void 0, function* () {
    var e_1, _a;
    try {
        for (var _b = __asyncValues((0, exports.categoryAncestorPath)({
            accountingDb,
            fromCategory: category,
        })), _c; _c = yield _b.next(), !_c.done;) {
            const { type, parent } = _c.value;
            if (!parent) {
                return type;
            }
        }
    }
    catch (e_1_1) { e_1 = { error: e_1_1 }; }
    finally {
        try {
            if (_c && !_c.done && (_a = _b.return)) yield _a.call(_b);
        }
        finally { if (e_1) throw e_1.error; }
    }
});
exports.categoryType = categoryType;
exports.Category = {
    id: ({ _id }) => _id.toString(),
    parent: ({ parent }, _, { db }) => __awaiter(void 0, void 0, void 0, function* () { return (yield db.collection("categories").findOne({ _id: parent })) || null; }),
    type: ({ _id }, _, { dataSources: { accountingDb } }) => __awaiter(void 0, void 0, void 0, function* () {
        const type = yield (0, exports.categoryType)({
            accountingDb,
            category: _id,
        });
        return (0, change_case_1.snakeCase)(type).toUpperCase();
    }),
    children: ({ _id }, _, { db }) => db.collection("categories").find({ parent: _id }).toArray(),
    ancestors: ({ parent }, _, { dataSources: { accountingDb } }) => __awaiter(void 0, void 0, void 0, function* () {
        var e_2, _d;
        const ancestors = [];
        try {
            for (var _e = __asyncValues((0, exports.categoryAncestorPath)({
                accountingDb,
                fromCategory: parent,
            })), _f; _f = yield _e.next(), !_f.done;) {
                const ancestor = _f.value;
                ancestors.push(ancestor);
            }
        }
        catch (e_2_1) { e_2 = { error: e_2_1 }; }
        finally {
            try {
                if (_f && !_f.done && (_d = _e.return)) yield _d.call(_e);
            }
            finally { if (e_2) throw e_2.error; }
        }
        return ancestors;
    }),
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2F0ZWdvcnlSZXNvbHZlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9yZXNvbHZlcnMvY2F0ZWdvcnkvY2F0ZWdvcnlSZXNvbHZlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBQUEsNkNBQXdDO0FBVXhDLE1BQU0sT0FBTyxHQUFHLE1BQU0sQ0FBQyxTQUFTLENBQUMsQ0FBQztBQUVsQzs7R0FFRztBQUNJLE1BQU0sb0JBQW9CLEdBQUcsVUFBaUIsRUFDbkQsWUFBWSxFQUNaLFlBQVksRUFDWixPQUFPLEdBS1I7O1FBQ0MsT0FBTyxDQUFDLFlBQVksYUFBWixZQUFZLGNBQVosWUFBWSxHQUFJLE9BQU8sQ0FBQyxLQUFLLE9BQU8sRUFBRTtZQUM1QyxNQUFNLFFBQVEsR0FBRyxjQUFNLFlBQVksQ0FBQyxPQUFPLENBQUM7Z0JBQzFDLFVBQVUsRUFBRSxZQUFZO2dCQUN4QixNQUFNLEVBQUU7b0JBQ04sR0FBRyxFQUFFLFlBQVk7aUJBQ2xCO2dCQUNELE9BQU87YUFDUixDQUFDLENBQUEsQ0FBQztZQUVILG9CQUFNLFFBQVEsQ0FBQSxDQUFDO1lBRWYsWUFBWSxHQUFHLFFBQVEsQ0FBQyxNQUFNLENBQUM7U0FDaEM7SUFDSCxDQUFDO0NBQUEsQ0FBQztBQXRCVyxRQUFBLG9CQUFvQix3QkFzQi9CO0FBRUY7O0dBRUcsQ0FBUSxNQUFNLFlBQVksR0FBRyxDQUFPLEVBQ3JDLFlBQVksRUFDWixRQUFRLEdBSVQsRUFBOEIsRUFBRTs7O1FBQy9CLEtBQXFDLElBQUEsS0FBQSxjQUFBLElBQUEsNEJBQW9CLEVBQUM7WUFDeEQsWUFBWTtZQUNaLFlBQVksRUFBRSxRQUFRO1NBQ3ZCLENBQUMsQ0FBQSxJQUFBO1lBSFMsTUFBTSxFQUFFLElBQUksRUFBRSxNQUFNLEVBQUUsV0FBQSxDQUFBO1lBSS9CLElBQUksQ0FBQyxNQUFNLEVBQUU7Z0JBQ1gsT0FBTyxJQUFJLENBQUM7YUFDYjtTQUNGOzs7Ozs7Ozs7QUFDSCxDQUFDLENBQUEsQ0FBQztBQWZlLFFBQUEsWUFBWSxnQkFlM0I7QUFFVyxRQUFBLFFBQVEsR0FBc0I7SUFDekMsRUFBRSxFQUFFLENBQUMsRUFBRSxHQUFHLEVBQUUsRUFBRSxFQUFFLENBQUMsR0FBRyxDQUFDLFFBQVEsRUFBRTtJQUMvQixNQUFNLEVBQUUsQ0FBTyxFQUFFLE1BQU0sRUFBRSxFQUFFLENBQUMsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsa0RBQ3RDLE9BQUEsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxVQUFVLENBQUMsWUFBWSxDQUFDLENBQUMsT0FBTyxDQUFDLEVBQUUsR0FBRyxFQUFFLE1BQU0sRUFBRSxDQUFDLENBQUMsSUFBSSxJQUFJLENBQUEsR0FBQTtJQUN0RSxJQUFJLEVBQUUsQ0FBTyxFQUFFLEdBQUcsRUFBRSxFQUFFLENBQUMsRUFBRSxFQUFFLFdBQVcsRUFBRSxFQUFFLFlBQVksRUFBRSxFQUFFLEVBQUUsRUFBRTtRQUM1RCxNQUFNLElBQUksR0FBRyxNQUFNLElBQUEsb0JBQVksRUFBQztZQUM5QixZQUFZO1lBQ1osUUFBUSxFQUFFLEdBQUc7U0FDZCxDQUFDLENBQUM7UUFFSCxPQUFPLElBQUEsdUJBQVMsRUFBQyxJQUFJLENBQUMsQ0FBQyxXQUFXLEVBQWUsQ0FBQztJQUNwRCxDQUFDLENBQUE7SUFDRCxRQUFRLEVBQUUsQ0FBQyxFQUFFLEdBQUcsRUFBRSxFQUFFLENBQUMsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsQ0FDL0IsRUFBRSxDQUFDLFVBQVUsQ0FBQyxZQUFZLENBQUMsQ0FBQyxJQUFJLENBQUMsRUFBRSxNQUFNLEVBQUUsR0FBRyxFQUFFLENBQUMsQ0FBQyxPQUFPLEVBQUU7SUFDN0QsU0FBUyxFQUFFLENBQU8sRUFBRSxNQUFNLEVBQUUsRUFBRSxDQUFDLEVBQUUsRUFBRSxXQUFXLEVBQUUsRUFBRSxZQUFZLEVBQUUsRUFBRSxFQUFFLEVBQUU7O1FBQ3BFLE1BQU0sU0FBUyxHQUF1QixFQUFFLENBQUM7O1lBRXpDLEtBQTZCLElBQUEsS0FBQSxjQUFBLElBQUEsNEJBQW9CLEVBQUM7Z0JBQ2hELFlBQVk7Z0JBQ1osWUFBWSxFQUFFLE1BQU07YUFDckIsQ0FBQyxDQUFBLElBQUE7Z0JBSFMsTUFBTSxRQUFRLFdBQUEsQ0FBQTtnQkFJdkIsU0FBUyxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQzthQUMxQjs7Ozs7Ozs7O1FBRUQsT0FBTyxTQUFTLENBQUM7SUFDbkIsQ0FBQyxDQUFBO0NBQ0YsQ0FBQyJ9