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
const DocHistory_1 = require("../utils/DocHistory");
const standIns_1 = require("../utils/standIns");
const utils_1 = require("./utils");
const paymentMethodAdd = (obj, args, context, info) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    const { fields: { active, refId, name, parent: parentId }, } = args;
    const { db, user } = context;
    const session = (_a = context.ephemeral) === null || _a === void 0 ? void 0 : _a.session;
    const docHistory = new DocHistory_1.default({ node: standIns_1.userNodeType, id: user.id }, (_b = context.ephemeral) === null || _b === void 0 ? void 0 : _b.docHistoryDate);
    const parent = new mongodb_1.ObjectId(parentId);
    const collection = db.collection("paymentMethods");
    const parentDoc = yield collection.findOne({ _id: parent }, { projection: { _id: true, allowChildren: true }, session });
    if (!parentDoc) {
        throw new Error(`Payment method parent "${parentId}" does not exist.`);
    }
    else if (!parentDoc.allowChildren) {
        throw new Error(`Payment method parent "${parentId}" does not allow children.`);
    }
    const docBuilder = docHistory.newHistoricalDoc(true).addFields([
        ["active", active],
        ["name", name],
    ]);
    if (refId) {
        docBuilder.addField("refId", refId);
    }
    const { insertedId } = yield collection.insertOne(Object.assign({ parent, allowChildren: false }, docBuilder.doc()), { session });
    const [result] = yield collection
        .aggregate([{ $match: { _id: insertedId } }, { $addFields: utils_1.$addFields }], { session })
        .toArray();
    return result;
});
exports.default = paymentMethodAdd;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicGF5bWVudE1ldGhvZEFkZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9yZXNvbHZlcnMvcGF5bWVudE1ldGhvZC9wYXltZW50TWV0aG9kQWRkLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7O0FBQUEscUNBQW1DO0FBRW5DLG9EQUE2QztBQUM3QyxnREFBaUQ7QUFDakQsbUNBQXFDO0FBRXJDLE1BQU0sZ0JBQWdCLEdBQTBDLENBQzlELEdBQUcsRUFDSCxJQUFJLEVBQ0osT0FBTyxFQUNQLElBQUksRUFDSixFQUFFOztJQUNGLE1BQU0sRUFDSixNQUFNLEVBQUUsRUFBRSxNQUFNLEVBQUUsS0FBSyxFQUFFLElBQUksRUFBRSxNQUFNLEVBQUUsUUFBUSxFQUFFLEdBQ2xELEdBQUcsSUFBSSxDQUFDO0lBRVQsTUFBTSxFQUFFLEVBQUUsRUFBRSxJQUFJLEVBQUUsR0FBRyxPQUFPLENBQUM7SUFFN0IsTUFBTSxPQUFPLFNBQUcsT0FBTyxDQUFDLFNBQVMsMENBQUUsT0FBTyxDQUFDO0lBRTNDLE1BQU0sVUFBVSxHQUFHLElBQUksb0JBQVUsQ0FDL0IsRUFBRSxJQUFJLEVBQUUsdUJBQVksRUFBRSxFQUFFLEVBQUUsSUFBSSxDQUFDLEVBQUUsRUFBRSxRQUNuQyxPQUFPLENBQUMsU0FBUywwQ0FBRSxjQUFjLENBQ2xDLENBQUM7SUFFRixNQUFNLE1BQU0sR0FBRyxJQUFJLGtCQUFRLENBQUMsUUFBUSxDQUFDLENBQUM7SUFFdEMsTUFBTSxVQUFVLEdBQUcsRUFBRSxDQUFDLFVBQVUsQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDO0lBRW5ELE1BQU0sU0FBUyxHQUFHLE1BQU0sVUFBVSxDQUFDLE9BQU8sQ0FDeEMsRUFBRSxHQUFHLEVBQUUsTUFBTSxFQUFFLEVBQ2YsRUFBRSxVQUFVLEVBQUUsRUFBRSxHQUFHLEVBQUUsSUFBSSxFQUFFLGFBQWEsRUFBRSxJQUFJLEVBQUUsRUFBRSxPQUFPLEVBQUUsQ0FDNUQsQ0FBQztJQUVGLElBQUksQ0FBQyxTQUFTLEVBQUU7UUFDZCxNQUFNLElBQUksS0FBSyxDQUFDLDBCQUEwQixRQUFRLG1CQUFtQixDQUFDLENBQUM7S0FDeEU7U0FBTSxJQUFJLENBQUMsU0FBUyxDQUFDLGFBQWEsRUFBRTtRQUNuQyxNQUFNLElBQUksS0FBSyxDQUNiLDBCQUEwQixRQUFRLDRCQUE0QixDQUMvRCxDQUFDO0tBQ0g7SUFFRCxNQUFNLFVBQVUsR0FBRyxVQUFVLENBQUMsZ0JBQWdCLENBQUMsSUFBSSxDQUFDLENBQUMsU0FBUyxDQUFDO1FBQzdELENBQUMsUUFBUSxFQUFFLE1BQU0sQ0FBQztRQUNsQixDQUFDLE1BQU0sRUFBRSxJQUFJLENBQUM7S0FDZixDQUFDLENBQUM7SUFFSCxJQUFJLEtBQUssRUFBRTtRQUNULFVBQVUsQ0FBQyxRQUFRLENBQUMsT0FBTyxFQUFFLEtBQUssQ0FBQyxDQUFDO0tBQ3JDO0lBRUQsTUFBTSxFQUFFLFVBQVUsRUFBRSxHQUFHLE1BQU0sVUFBVSxDQUFDLFNBQVMsaUJBRTdDLE1BQU0sRUFDTixhQUFhLEVBQUUsS0FBSyxJQUNqQixVQUFVLENBQUMsR0FBRyxFQUFFLEdBRXJCLEVBQUUsT0FBTyxFQUFFLENBQ1osQ0FBQztJQUVGLE1BQU0sQ0FBQyxNQUFNLENBQUMsR0FBRyxNQUFNLFVBQVU7U0FDOUIsU0FBUyxDQUFDLENBQUMsRUFBRSxNQUFNLEVBQUUsRUFBRSxHQUFHLEVBQUUsVUFBVSxFQUFFLEVBQUUsRUFBRSxFQUFFLFVBQVUsRUFBVixrQkFBVSxFQUFFLENBQUMsRUFBRSxFQUFFLE9BQU8sRUFBRSxDQUFDO1NBQ3pFLE9BQU8sRUFBRSxDQUFDO0lBRWIsT0FBTyxNQUFNLENBQUM7QUFDaEIsQ0FBQyxDQUFBLENBQUM7QUFFRixrQkFBZSxnQkFBZ0IsQ0FBQyJ9