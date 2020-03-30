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
const paymentMethodAdd = (doc, args, context, info) => __awaiter(void 0, void 0, void 0, function* () {
    const { fields: { active, refId, name, parent: parentId } } = args;
    const { db, user } = context;
    const docHistory = new DocHistory_1.default({ node: standIns_1.userNodeType, id: user.id });
    const parent = new mongodb_1.ObjectID(parentId);
    const collection = db.collection("paymentMethods");
    const parentDoc = yield collection.findOne({ _id: parent }, { projection: { _id: true, allowChildren: true } });
    if (!parentDoc) {
        throw new Error(`Payment method parent "${parentId}" does not exist.`);
    }
    else if (!parentDoc.allowChildren) {
        throw new Error(`Payment method parent "${parentId}" does not allow children.`);
    }
    const { insertedId } = yield collection.insertOne({
        parent,
        active: docHistory.addValue(active),
        refId: refId ? docHistory.addValue(refId) : [],
        name: docHistory.addValue(name),
        allowChildren: false //Not exposed to GQL api at this time
    });
    const [result] = yield collection
        .aggregate([{ $match: { _id: insertedId } }, { $addFields: utils_1.$addFields }])
        .toArray();
    return result;
});
exports.default = paymentMethodAdd;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicGF5bWVudE1ldGhvZEFkZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9yZXNvbHZlcnMvcGF5bWVudE1ldGhvZC9wYXltZW50TWV0aG9kQWRkLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7O0FBQUEscUNBQW1DO0FBRW5DLG9EQUE2QztBQUM3QyxnREFBaUQ7QUFDakQsbUNBQXFDO0FBRXJDLE1BQU0sZ0JBQWdCLEdBQTBDLENBQzlELEdBQUcsRUFDSCxJQUFJLEVBQ0osT0FBTyxFQUNQLElBQUksRUFDSixFQUFFO0lBQ0YsTUFBTSxFQUNKLE1BQU0sRUFBRSxFQUFFLE1BQU0sRUFBRSxLQUFLLEVBQUUsSUFBSSxFQUFFLE1BQU0sRUFBRSxRQUFRLEVBQUUsRUFDbEQsR0FBRyxJQUFJLENBQUM7SUFFVCxNQUFNLEVBQUUsRUFBRSxFQUFFLElBQUksRUFBRSxHQUFHLE9BQU8sQ0FBQztJQUU3QixNQUFNLFVBQVUsR0FBRyxJQUFJLG9CQUFVLENBQUMsRUFBRSxJQUFJLEVBQUUsdUJBQVksRUFBRSxFQUFFLEVBQUUsSUFBSSxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUM7SUFFdkUsTUFBTSxNQUFNLEdBQUcsSUFBSSxrQkFBUSxDQUFDLFFBQVEsQ0FBQyxDQUFDO0lBRXRDLE1BQU0sVUFBVSxHQUFHLEVBQUUsQ0FBQyxVQUFVLENBQUMsZ0JBQWdCLENBQUMsQ0FBQztJQUVuRCxNQUFNLFNBQVMsR0FBRyxNQUFNLFVBQVUsQ0FBQyxPQUFPLENBQ3hDLEVBQUUsR0FBRyxFQUFFLE1BQU0sRUFBRSxFQUNmLEVBQUUsVUFBVSxFQUFFLEVBQUUsR0FBRyxFQUFFLElBQUksRUFBRSxhQUFhLEVBQUUsSUFBSSxFQUFFLEVBQUUsQ0FDbkQsQ0FBQztJQUVGLElBQUksQ0FBQyxTQUFTLEVBQUU7UUFDZCxNQUFNLElBQUksS0FBSyxDQUFDLDBCQUEwQixRQUFRLG1CQUFtQixDQUFDLENBQUM7S0FDeEU7U0FBTSxJQUFJLENBQUMsU0FBUyxDQUFDLGFBQWEsRUFBRTtRQUNuQyxNQUFNLElBQUksS0FBSyxDQUNiLDBCQUEwQixRQUFRLDRCQUE0QixDQUMvRCxDQUFDO0tBQ0g7SUFFRCxNQUFNLEVBQUUsVUFBVSxFQUFFLEdBQUcsTUFBTSxVQUFVLENBQUMsU0FBUyxDQUFDO1FBQ2hELE1BQU07UUFDTixNQUFNLEVBQUUsVUFBVSxDQUFDLFFBQVEsQ0FBQyxNQUFNLENBQUM7UUFDbkMsS0FBSyxFQUFFLEtBQUssQ0FBQyxDQUFDLENBQUMsVUFBVSxDQUFDLFFBQVEsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRTtRQUM5QyxJQUFJLEVBQUUsVUFBVSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUM7UUFDL0IsYUFBYSxFQUFFLEtBQUssQ0FBQyxxQ0FBcUM7S0FDM0QsQ0FBQyxDQUFDO0lBRUgsTUFBTSxDQUFDLE1BQU0sQ0FBQyxHQUFHLE1BQU0sVUFBVTtTQUM5QixTQUFTLENBQUMsQ0FBQyxFQUFFLE1BQU0sRUFBRSxFQUFFLEdBQUcsRUFBRSxVQUFVLEVBQUUsRUFBRSxFQUFFLEVBQUUsVUFBVSxFQUFWLGtCQUFVLEVBQUUsQ0FBQyxDQUFDO1NBQzVELE9BQU8sRUFBRSxDQUFDO0lBRWIsT0FBTyxNQUFNLENBQUM7QUFDaEIsQ0FBQyxDQUFBLENBQUM7QUFFRixrQkFBZSxnQkFBZ0IsQ0FBQyJ9