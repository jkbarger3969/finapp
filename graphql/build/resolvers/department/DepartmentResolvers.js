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
    while (ancestor.parent.type !== "Business") {
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
const parent = ({ parent }, _, { dataSources: { accountingDb } }) => (0, queryUtils_1.addTypename)(parent.type, accountingDb.findOne({
    collection: parent.type === "Business" ? "businesses" : "departments",
    filter: {
        _id: parent.id,
    },
}));
const children = ({ _id }, _, { dataSources: { accountingDb } }) => accountingDb.find({
    collection: "departments",
    filter: {
        "parent.type": "Department",
        "parent.id": _id,
    },
});
const ancestors = (...args) => __awaiter(void 0, void 0, void 0, function* () {
    var e_1, _a;
    const [{ parent }, { root }, { dataSources: { accountingDb }, },] = args;
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
                if (ancestorsArr_1_1 && !ancestorsArr_1_1.done && (_a = ancestorsArr_1.return)) yield _a.call(ancestorsArr_1);
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
    results.push(ancestor);
    while (ancestor.parent.type !== "Business") {
        ancestor = yield (0, queryUtils_1.addTypename)("Department", accountingDb.findOne({
            collection: "departments",
            filter: { _id: ancestor.parent.id },
        }));
        results.push(ancestor);
    }
    const biz = yield (0, queryUtils_1.addTypename)("Business", accountingDb.findOne({
        collection: "businesses",
        filter: { _id: ancestor.parent.id },
    }));
    results.push(biz);
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
const DepartmentAncestorResolver = {
    // Using addTypename on all resolvers returning DepartmentAncestor
    __resolveType: ({ __typename }) => __typename,
};
exports.DepartmentAncestor = DepartmentAncestorResolver;
const DepartmentResolver = {
    id: ({ _id }) => _id.toString(),
    budgets,
    business,
    parent,
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiRGVwYXJ0bWVudFJlc29sdmVycy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9yZXNvbHZlcnMvZGVwYXJ0bWVudC9EZXBhcnRtZW50UmVzb2x2ZXJzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFXQSxvREFBa0Q7QUFDbEQsK0NBQWlEO0FBRWpELE1BQU0sT0FBTyxHQUFtQyxDQUFDLEVBQUUsR0FBRyxFQUFFLEVBQUUsQ0FBQyxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRTtJQUNyRSxPQUFPLEVBQUU7U0FDTixVQUFVLENBQUMsU0FBUyxDQUFDO1NBQ3JCLElBQUksQ0FBQztRQUNKLFlBQVksRUFBRSxZQUFZO1FBQzFCLFVBQVUsRUFBRSxHQUFHO0tBQ2hCLENBQUM7U0FDRCxPQUFPLEVBQVMsQ0FBQztBQUN0QixDQUFDLENBQUM7QUFFRixNQUFNLFFBQVEsR0FBb0MsQ0FDaEQsRUFBRSxNQUFNLEVBQUUsRUFDVixDQUFDLEVBQ0QsRUFBRSxXQUFXLEVBQUUsRUFBRSxZQUFZLEVBQUUsRUFBRSxFQUNqQyxFQUFFO0lBQ0YsSUFBSSxNQUFNLENBQUMsSUFBSSxLQUFLLFVBQVUsRUFBRTtRQUM5QixPQUFPLFlBQVksQ0FBQyxPQUFPLENBQUM7WUFDMUIsVUFBVSxFQUFFLFlBQVk7WUFDeEIsTUFBTSxFQUFFLEVBQUUsR0FBRyxFQUFFLE1BQU0sQ0FBQyxFQUFFLEVBQUU7U0FDM0IsQ0FBQyxDQUFDO0tBQ0o7SUFFRCxJQUFJLFFBQVEsR0FBRyxNQUFNLFlBQVksQ0FBQyxPQUFPLENBQUM7UUFDeEMsVUFBVSxFQUFFLGFBQWE7UUFDekIsTUFBTSxFQUFFLEVBQUUsR0FBRyxFQUFFLE1BQU0sQ0FBQyxFQUFFLEVBQUU7S0FDM0IsQ0FBQyxDQUFDO0lBRUgsT0FBTyxRQUFRLENBQUMsTUFBTSxDQUFDLElBQUksS0FBSyxVQUFVLEVBQUU7UUFDMUMsUUFBUSxHQUFHLE1BQU0sWUFB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