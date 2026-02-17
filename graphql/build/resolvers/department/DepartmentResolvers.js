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
exports.Department = exports.DepartmentAncestor = void 0;
const queryUtils_1 = require("../utils/queryUtils");
const departments_1 = require("./departments");
const budgets = ({ _id }, _, { db }) => {
    return db
        .collection("budgets")
        .find({
        "owner.type": "Department",
        "owner.id": _id,
    })
        .toArray();
};
const business = ({ parent }, _, { dataSources: { accountingDb } }) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    if (!parent || !parent.type || !parent.id) {
        console.warn("Department has invalid parent:", parent);
        return null;
    }
    if (parent.type === "Business") {
        return accountingDb.findOne({
            collection: "businesses",
            filter: { _id: parent.id },
        });
    }
    let ancestor = yield accountingDb.findOne({
        collection: "departments",
        filter: { _id: parent.id },
    });
    while (((_a = ancestor === null || ancestor === void 0 ? void 0 : ancestor.parent) === null || _a === void 0 ? void 0 : _a.type) !== "Business") {
        if (!((_b = ancestor === null || ancestor === void 0 ? void 0 : ancestor.parent) === null || _b === void 0 ? void 0 : _b.id)) {
            console.warn("Department ancestor chain broken:", ancestor);
            return null;
        }
        ancestor = yield accountingDb.findOne({
            collection: "departments",
            filter: { _id: ancestor.parent.id },
        });
    }
    return accountingDb.findOne({
        collection: "businesses",
        filter: { _id: ancestor.parent.id },
    });
});
const parent = ({ parent }, _, { dataSources: { accountingDb } }) => {
    if (!parent || !parent.type || !parent.id) {
        console.warn("Department has invalid parent reference:", parent);
        return null;
    }
    return (0, queryUtils_1.addTypename)(parent.type, accountingDb.findOne({
        collection: parent.type === "Business" ? "businesses" : "departments",
        filter: {
            _id: parent.id,
        },
    }));
};
const children = ({ _id }, _, { dataSources: { accountingDb } }) => accountingDb.find({
    collection: "departments",
    filter: {
        "parent.type": "Department",
        "parent.id": _id,
    },
});
const ancestors = (...args) => __awaiter(void 0, void 0, void 0, function* () {
    var e_1, _c;
    var _d, _e, _f;
    const [{ parent }, { root }, { dataSources: { accountingDb }, },] = args;
    // Safety check for parent
    if (!parent || !parent.type || !parent.id) {
        console.warn("Department ancestors: invalid parent:", parent);
        return [];
    }
    if (root) {
        const [rootDepartments, ancestorsArr] = yield Promise.all([
            accountingDb
                .find({
                collection: "departments",
                filter: yield (0, departments_1.whereDepartments)(root, accountingDb.db),
                options: {
                    projection: {
                        _id: true,
                    },
                },
            })
                .then((results) => new Set(results.map(({ _id }) => _id.toHexString()))),
            ancestors(args[0], {}, args[2], args[3]),
        ]);
        const results = [];
        try {
            for (var ancestorsArr_1 = __asyncValues(ancestorsArr), ancestorsArr_1_1; ancestorsArr_1_1 = yield ancestorsArr_1.next(), !ancestorsArr_1_1.done;) {
                const ancestor = ancestorsArr_1_1.value;
                results.push(ancestor);
                if (rootDepartments.has(ancestor._id.toHexString())) {
                    return results;
                }
            }
        }
        catch (e_1_1) { e_1 = { error: e_1_1 }; }
        finally {
            try {
                if (ancestorsArr_1_1 && !ancestorsArr_1_1.done && (_c = ancestorsArr_1.return)) yield _c.call(ancestorsArr_1);
            }
            finally { if (e_1) throw e_1.error; }
        }
        return [];
    }
    else if (parent.type === "Business") {
        return yield (0, queryUtils_1.addTypename)("Business", accountingDb.find({
            collection: "businesses",
            filter: { _id: parent.id },
        }));
    }
    const results = [];
    let ancestor = yield (0, queryUtils_1.addTypename)("Department", accountingDb.findOne({
        collection: "departments",
        filter: { _id: parent.id },
    }));
    if (!ancestor) {
        console.warn("Department ancestors: ancestor not found for parent.id:", parent.id);
        return results;
    }
    results.push(ancestor);
    while (((_d = ancestor === null || ancestor === void 0 ? void 0 : ancestor.parent) === null || _d === void 0 ? void 0 : _d.type) !== "Business") {
        if (!((_e = ancestor === null || ancestor === void 0 ? void 0 : ancestor.parent) === null || _e === void 0 ? void 0 : _e.id)) {
            console.warn("Department ancestors: ancestor chain broken:", ancestor);
            break;
        }
        ancestor = yield (0, queryUtils_1.addTypename)("Department", accountingDb.findOne({
            collection: "departments",
            filter: { _id: ancestor.parent.id },
        }));
        if (!ancestor)
            break;
        results.push(ancestor);
    }
    if ((_f = ancestor === null || ancestor === void 0 ? void 0 : ancestor.parent) === null || _f === void 0 ? void 0 : _f.id) {
        const biz = yield (0, queryUtils_1.addTypename)("Business", accountingDb.findOne({
            collection: "businesses",
            filter: { _id: ancestor.parent.id },
        }));
        if (biz) {
            results.push(biz);
        }
    }
    return results;
});
const descendants = ({ _id }, _, { dataSources: { accountingDb } }) => __awaiter(void 0, void 0, void 0, function* () {
    const descendants = [];
    const query = yield accountingDb.find({
        collection: "departments",
        filter: { "parent.type": "Department", "parent.id": _id },
    });
    while (query.length) {
        descendants.push(...query);
        query.push(...(yield accountingDb.find({
            collection: "departments",
            filter: {
                "parent.type": "Department",
                "parent.id": {
                    $in: query.splice(0).map(({ _id }) => _id),
                },
            },
        })));
    }
    return descendants;
});
const disable = ({ disable }, _, { dataSources: { accountingDb } }) => {
    return disable
        ? accountingDb.find({
            collection: "fiscalYears",
            filter: {
                _id: { $in: disable },
            },
        })
        : [];
};
const DepartmentAncestorResolver = {
    __resolveType: (obj) => {
        if ("parent" in obj) {
            return "Department";
        }
        return "Business";
    },
};
exports.DepartmentAncestor = DepartmentAncestorResolver;
const DepartmentResolver = {
    __isTypeOf: (obj) => "parent" in obj,
    id: ({ _id }) => _id.toString(),
    budgets,
    business,
    parent,
    disable,
    children,
    ancestors,
    descendants,
    virtualRoot: ({ virtualRoot }) => !!virtualRoot,
    // aliases: ({ _id }, _, { db }) =>
    //   getAliases("Department", _id, db) as unknown as ReturnType<
    //     DepartmentResolvers["aliases"]
    //   >,
};
exports.Department = DepartmentResolver;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiRGVwYXJ0bWVudFJlc29sdmVycy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9yZXNvbHZlcnMvZGVwYXJ0bWVudC9EZXBhcnRtZW50UmVzb2x2ZXJzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFXQSxvREFBa0Q7QUFDbEQsK0NBQWlEO0FBRWpELE1BQU0sT0FBTyxHQUFtQyxDQUFDLEVBQUUsR0FBRyxFQUFFLEVBQUUsQ0FBQyxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRTtJQUNyRSxPQUFPLEVBQUU7U0FDTixVQUFVLENBQUMsU0FBUyxDQUFDO1NBQ3JCLElBQUksQ0FBQztRQUNKLFlBQVksRUFBRSxZQUFZO1FBQzFCLFVBQVUsRUFBRSxHQUFHO0tBQ2hCLENBQUM7U0FDRCxPQUFPLEVBQVMsQ0FBQztBQUN0QixDQUFDLENBQUM7QUFFRixNQUFNLFFBQVEsR0FBb0MsQ0FDaEQsRUFBRSxNQUFNLEVBQUUsRUFDVixDQUFDLEVBQ0QsRUFBRSxXQUFXLEVBQUUsRUFBRSxZQUFZLEVBQUUsRUFBRSxFQUNqQyxFQUFFOztJQUNGLElBQUksQ0FBQyxNQUFNLElBQUksQ0FBQyxNQUFNLENBQUMsSUFBSSxJQUFJLENBQUMsTUFBTSxDQUFDLEVBQUUsRUFBRTtRQUN6QyxPQUFPLENBQUMsSUFBSSxDQUFDLGdDQUFnQyxFQUFFLE1BQU0sQ0FBQyxDQUFDO1FBQ3ZELE9BQU8sSUFBSSxDQUFDO0tBQ2I7SUFFRCxJQUFJLE1BQU0sQ0FBQyxJQUFJLEtBQUssVUFBVSxFQUFFO1FBQzlCLE9BQU8sWUFBWSxDQUFDLE9BQU8sQ0FBQztZQUMxQixVQUFVLEVBQUUsWUFBWTtZQUN4QixNQUFNLEVBQUUsRUFBRSxHQUFHLEVBQUUsTUFBTSxDQUFDLEVBQUUsRUFBRTtTQUMzQixDQUFDLENBQUM7S0FDSjtJQUVELElBQUksUUFBUSxHQUFHLE1BQU0sWUFBWSxDQUFDLE9BQU8sQ0FBQztRQUN4QyxV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