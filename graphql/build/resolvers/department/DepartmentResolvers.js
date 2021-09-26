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
const business = ({ parent }, _, { db }) => __awaiter(void 0, void 0, void 0, function* () {
    if (parent.type === "Business") {
        return db.collection("businesses").findOne({ _id: parent.id });
    }
    let ancestor = yield db
        .collection("departments")
        .findOne({ _id: parent.id });
    while (ancestor.parent.type !== "Business") {
        ancestor = yield db
            .collection("departments")
            .findOne({ _id: ancestor.parent.id });
    }
    return db.collection("businesses").findOne({ _id: ancestor.parent.id });
});
const parent = ({ parent }, _, { db }) => (0, queryUtils_1.addTypename)(parent.type, db
    .collection(parent.type === "Business" ? "businesses" : "departments")
    .findOne({ _id: parent.id }));
const children = ({ _id }, _, { db }) => db
    .collection("departments")
    .find({
    "parent.type": "Department",
    "parent.id": _id,
})
    .toArray();
const ancestors = (...args) => __awaiter(void 0, void 0, void 0, function* () {
    const [{ parent }, { root }, { db }] = args;
    if (root) {
        const [rootDepartments, ancestorsArr] = yield Promise.all([
            db
                .collection("departments")
                .find(yield (0, departments_1.whereDepartments)(root, db), {
                projection: {
                    _id: true,
                },
            })
                .toArray()
                .then((results) => new Set(results.map(({ _id }) => _id.toHexString()))),
            ancestors(args[0], {}, args[2], args[3]),
        ]);
        const results = [];
        for (const ancestor of ancestorsArr) {
            results.push(ancestor);
            if (rootDepartments.has(ancestor._id.toHexString())) {
                return results;
            }
        }
        return [];
    }
    else if (parent.type === "Business") {
        return yield (0, queryUtils_1.addTypename)("Business", db.collection("businesses").find({ _id: parent.id }).toArray());
    }
    const results = [];
    let ancestor = yield (0, queryUtils_1.addTypename)("Department", db.collection("departments").findOne({ _id: parent.id }));
    results.push(ancestor);
    while (ancestor.parent.type !== "Business") {
        ancestor = yield (0, queryUtils_1.addTypename)("Department", db
            .collection("departments")
            .findOne({ _id: ancestor.parent.id }));
        results.push(ancestor);
    }
    const biz = yield (0, queryUtils_1.addTypename)("Business", db.collection("businesses").findOne({ _id: ancestor.parent.id }));
    results.push(biz);
    return results;
});
const descendants = ({ _id }, _, { db }) => __awaiter(void 0, void 0, void 0, function* () {
    const descendants = [];
    const query = yield db
        .collection("departments")
        .find({ "parent.type": "Department", "parent.id": _id })
        .toArray();
    while (query.length) {
        descendants.push(...query);
        query.push(...(yield db
            .collection("departments")
            .find({
            "parent.type": "Department",
            "parent.id": {
                $in: query.splice(0).map(({ _id }) => _id),
            },
        })
            .toArray()));
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGVwYXJ0bWVudFJlc29sdmVycy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9yZXNvbHZlcnMvZGVwYXJ0bWVudC9kZXBhcnRtZW50UmVzb2x2ZXJzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7OztBQVlBLG9EQUFrRDtBQUNsRCwrQ0FBaUQ7QUFFakQsTUFBTSxPQUFPLEdBQW1DLENBQUMsRUFBRSxHQUFHLEVBQUUsRUFBRSxDQUFDLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFO0lBQ3JFLE9BQU8sRUFBRTtTQUNOLFVBQVUsQ0FBQyxTQUFTLENBQUM7U0FDckIsSUFBSSxDQUFDO1FBQ0osWUFBWSxFQUFFLFlBQVk7UUFDMUIsVUFBVSxFQUFFLEdBQUc7S0FDaEIsQ0FBQztTQUNELE9BQU8sRUFBRSxDQUFDO0FBQ2YsQ0FBQyxDQUFDO0FBRUYsTUFBTSxRQUFRLEdBQW9DLENBQ2hELEVBQUUsTUFBTSxFQUFFLEVBQ1YsQ0FBQyxFQUNELEVBQUUsRUFBRSxFQUFFLEVBQ04sRUFBRTtJQUNGLElBQUksTUFBTSxDQUFDLElBQUksS0FBSyxVQUFVLEVBQUU7UUFDOUIsT0FBTyxFQUFFLENBQUMsVUFBVSxDQUFDLFlBQVksQ0FBQyxDQUFDLE9BQU8sQ0FBQyxFQUFFLEdBQUcsRUFBRSxNQUFNLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQztLQUNoRTtJQUVELElBQUksUUFBUSxHQUFHLE1BQU0sRUFBRTtTQUNwQixVQUFVLENBQXFCLGFBQWEsQ0FBQztTQUM3QyxPQUFPLENBQUMsRUFBRSxHQUFHLEVBQUUsTUFBTSxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUM7SUFFL0IsT0FBTyxRQUFRLENBQUMsTUFBTSxDQUFDLElBQUksS0FBSyxVQUFVLEVBQUU7UUFDMUMsUUFBUSxHQUFHLE1BQU0sRUFBRTthQUNoQixVQUFVLENBQXFCLGFBQWEsQ0FBQzthQUM3QyxPQUFPLENBQUMsRUFBRSxHQUFHLEVBQUUs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