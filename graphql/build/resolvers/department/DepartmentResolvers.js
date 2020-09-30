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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiRGVwYXJ0bWVudFJlc29sdmVycy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9yZXNvbHZlcnMvZGVwYXJ0bWVudC9EZXBhcnRtZW50UmVzb2x2ZXJzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7O0FBQUEscUNBQXVDO0FBRXZDLGlEQVEwQjtBQUMxQix3REFBd0Q7QUFJeEQsK0NBQTZDO0FBQzdDLCtDQUE2QztBQUc3QyxNQUFNLE9BQU8sR0FBRyxJQUFJLGtCQUFRLENBQUMsMEJBQTBCLENBQUMsQ0FBQztBQUV6RCxNQUFNLE9BQU8sR0FBb0MsQ0FBQyxHQUFHLEVBQUUsSUFBSSxFQUFFLE9BQU8sRUFBRSxJQUFJLEVBQUUsRUFBRTtJQUM1RSxPQUFPLGlCQUFZLENBQ2pCLEdBQUcsRUFDSDtRQUNFLEtBQUssRUFBRTtZQUNMLFVBQVUsRUFBRSxHQUFHLENBQUMsRUFBRTtTQUNuQjtLQUNGLEVBQ0QsT0FBTyxFQUNQLElBQUksQ0FDTCxDQUFDO0FBQ0osQ0FBQyxDQUFDO0FBRUYsTUFBTSxTQUFTLEdBQXNDLENBQ25ELEdBQUcsRUFDSCxJQUFJLEVBQ0osT0FBTyxFQUNQLElBQUksRUFDSixFQUFFO0lBQ0YsTUFBTSxTQUFTLEdBQWMsRUFBRSxDQUFDO0lBRWhDLElBQUksTUFBTSxHQUFHLE1BQU0sOEJBQWU7SUFDaEMsMERBQTBEO0lBQ3hELEdBQStCLENBQUMsTUFBTSxFQUN4QyxPQUFPLENBQ1IsQ0FBQztJQUNGLFNBQVMsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUM7SUFDdkIsT0FBTyxNQUFNLENBQUMsVUFBVSxLQUFLLFVBQVUsRUFBRTtRQUN2QyxNQUFNLEdBQUcsTUFBTSw4QkFBZSxDQUMzQixNQUFzQixDQUFDLE1BQU0sRUFDOUIsT0FBTyxDQUNSLENBQUM7UUFDRixTQUFTLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDO0tBQ3hCO0lBRUQsT0FBTyxTQUFpQyxDQUFDO0FB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