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
            if (!ancestor) {
                // Category not found, stop iteration
                break;
            }
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
            const ancestor = _c.value;
            if (!ancestor) {
                continue;
            }
            const { type, parent } = ancestor;
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
    // Default fallback if no type found
    return "Debit";
});
exports.categoryType = categoryType;
exports.Category = {
    id: ({ _id }) => _id.toString(),
    displayName: (cat) => {
        if (cat.groupName && cat.name) {
            return `${cat.groupName}: ${cat.name}`;
        }
        return cat.name;
    },
    parent: ({ parent }, _, { dataSources: { accountingDb } }) => __awaiter(void 0, void 0, void 0, function* () {
        return parent ? accountingDb.findOne({
            collection: "categories",
            filter: { _id: parent },
        }) : null;
    }),
    type: ({ _id }, _, { dataSources: { accountingDb } }) => __awaiter(void 0, void 0, void 0, function* () {
        const type = yield (0, exports.categoryType)({
            accountingDb,
            category: _id,
        });
        return (0, change_case_1.snakeCase)(type).toUpperCase();
    }),
    children: ({ _id }, _, { dataSources: { accountingDb } }) => accountingDb.find({
        collection: "categories",
        filter: { parent: _id },
    }),
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
    accountNumber: (cat) => cat.accountNumber || null,
    groupName: (cat) => cat.groupName || null,
    sortOrder: (cat) => { var _a; return (_a = cat.sortOrder) !== null && _a !== void 0 ? _a : 0; },
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2F0ZWdvcnlSZXNvbHZlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9yZXNvbHZlcnMvY2F0ZWdvcnkvY2F0ZWdvcnlSZXNvbHZlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBQUEsNkNBQXdDO0FBV3hDLE1BQU0sT0FBTyxHQUFHLE1BQU0sQ0FBQyxTQUFTLENBQUMsQ0FBQztBQUVsQzs7R0FFRztBQUNJLE1BQU0sb0JBQW9CLEdBQUcsVUFBaUIsRUFDbkQsWUFBWSxFQUNaLFlBQVksRUFDWixPQUFPLEdBS1I7O1FBQ0MsT0FBTyxDQUFDLFlBQVksYUFBWixZQUFZLGNBQVosWUFBWSxHQUFJLE9BQU8sQ0FBQyxLQUFLLE9BQU8sRUFBRTtZQUM1QyxNQUFNLFFBQVEsR0FBRyxjQUFNLFlBQVksQ0FBQyxPQUFPLENBQUM7Z0JBQzFDLFVBQVUsRUFBRSxZQUFZO2dCQUN4QixNQUFNLEVBQUU7b0JBQ04sR0FBRyxFQUFFLFlBQVk7aUJBQ2xCO2dCQUNELE9BQU87YUFDUixDQUFDLENBQUEsQ0FBQztZQUVILElBQUksQ0FBQyxRQUFRLEVBQUU7Z0JBQ2IscUNBQXFDO2dCQUNyQyxNQUFNO2FBQ1A7WUFFRCxvQkFBTSxRQUFRLENBQUEsQ0FBQztZQUVmLFlBQVksR0FBRyxRQUFRLENBQUMsTUFBTSxDQUFDO1NBQ2hDO0lBQ0gsQ0FBQztDQUFBLENBQUM7QUEzQlcsUUFBQSxvQkFBb0Isd0JBMkIvQjtBQUVGOztHQUVHLENBQVEsTUFBTSxZQUFZLEdBQUcsQ0FBTyxFQUNyQyxZQUFZLEVBQ1osUUFBUSxHQUlULEVBQThCLEVBQUU7OztRQUMvQixLQUE2QixJQUFBLEtBQUEsY0FBQSxJQUFBLDRCQUFvQixFQUFDO1lBQ2hELFlBQVk7WUFDWixZQUFZLEVBQUUsUUFBUTtTQUN2QixDQUFDLENBQUEsSUFBQTtZQUhTLE1BQU0sUUFBUSxXQUFBLENBQUE7WUFJdkIsSUFB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