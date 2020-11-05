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
exports.getDeptDescendants = void 0;
const mongodb_1 = require("mongodb");
const graphTypes_1 = require("../../graphTypes");
const nodeResolver_1 = require("../utils/nodeResolver");
const budgets_1 = require("../budget/budgets");
const departments_1 = require("./departments");
const bizNode = new mongodb_1.ObjectId("5dc476becf96e166daa9fd0b");
const budgets = (doc, args, context, info) => {
    return budgets_1.default(doc, {
        where: {
            department: doc.id,
        },
    }, context, info);
};
const ancestors = (doc, args, context, info) => __awaiter(void 0, void 0, void 0, function* () {
    const ancestors = [];
    let parent = yield nodeResolver_1.nodeDocResolver(
    //Actual doc is NOT the fully resolved DepartmentAncestor.
    doc.parent, context);
    ancestors.push(parent);
    while (parent.__typename !== "Business") {
        parent = yield nodeResolver_1.nodeDocResolver(parent.parent, context);
        ancestors.push(parent);
    }
    return ancestors;
});
const business = (doc, args, context, info) => __awaiter(void 0, void 0, void 0, function* () {
    let { parent } = doc;
    while (!bizNode.equals(parent.node)) {
        ({ parent } = yield context.db
            .collection("department")
            .find({
            _id: parent.id,
        }, { projection: { parent: 1 } })
            .next());
    }
    return nodeResolver_1.nodeDocResolver(parent, context);
});
const parent = (doc, args, context, info) => nodeResolver_1.nodeDocResolver(doc.parent, context);
exports.getDeptDescendants = (fromParent, context, info) => __awaiter(void 0, void 0, void 0, function* () {
    const descendantsArr = [];
    const promises = (yield departments_1.default({}, {
        where: {
            parent: {
                eq: fromParent,
            },
        },
    }, context, info)).map((descendant) => __awaiter(void 0, void 0, void 0, function* () {
        descendant = yield descendant;
        descendantsArr.push(descendant, ...(yield exports.getDeptDescendants({ id: descendant.id, type: graphTypes_1.DepartmentAncestorType.Department }, context, info)));
    }));
    yield Promise.all(promises);
    return descendantsArr;
});
const descendants = (doc, args, context, info) => {
    return exports.getDeptDescendants({
        id: doc.id,
        type: graphTypes_1.DepartmentAncestorType.Department,
    }, context, info);
};
const DepartmentResolvers = {
    budgets,
    business,
    ancestors,
    parent,
    descendants,
};
exports.default = DepartmentResolvers;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiRGVwYXJ0bWVudFJlc29sdmVycy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9yZXNvbHZlcnMvZGVwYXJ0bWVudC9EZXBhcnRtZW50UmVzb2x2ZXJzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7OztBQUFBLHFDQUF1QztBQUV2QyxpREFRMEI7QUFDMUIsd0RBQXdEO0FBSXhELCtDQUE2QztBQUM3QywrQ0FBNkM7QUFHN0MsTUFBTSxPQUFPLEdBQUcsSUFBSSxrQkFBUSxDQUFDLDBCQUEwQixDQUFDLENBQUM7QUFFekQsTUFBTSxPQUFPLEdBQW9DLENBQUMsR0FBRyxFQUFFLElBQUksRUFBRSxPQUFPLEVBQUUsSUFBSSxFQUFFLEVBQUU7SUFDNUUsT0FBTyxpQkFBWSxDQUNqQixHQUFHLEVBQ0g7UUFDRSxLQUFLLEVBQUU7WUFDTCxVQUFVLEVBQUUsR0FBRyxDQUFDLEVBQUU7U0FDbkI7S0FDRixFQUNELE9BQU8sRUFDUCxJQUFJLENBQ0wsQ0FBQztBQUNKLENBQUMsQ0FBQztBQUVGLE1BQU0sU0FBUyxHQUFzQyxDQUNuRCxHQUFHLEVBQ0gsSUFBSSxFQUNKLE9BQU8sRUFDUCxJQUFJLEVBQ0osRUFBRTtJQUNGLE1BQU0sU0FBUyxHQUFjLEVBQUUsQ0FBQztJQUVoQyxJQUFJLE1BQU0sR0FBRyxNQUFNLDhCQUFlO0lBQ2hDLDBEQUEwRDtJQUN4RCxHQUErQixDQUFDLE1BQU0sRUFDeEMsT0FBTyxDQUNSLENBQUM7SUFDRixTQUFTLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDO0lBQ3ZCLE9BQU8sTUFBTSxDQUFDLFVBQVUsS0FBSyxVQUFVLEVBQUU7UUFDdkMsTUFBTSxHQUFHLE1BQU0sOEJBQWUsQ0FDM0IsTUFBc0IsQ0FBQyxNQUFNLEVBQzlCLE9BQU8sQ0FDUixDQUFDO1FBQ0YsU0FBUyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQztLQUN4QjtJQUVELE9BQU8sU0FBaUMsQ0FBQztB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