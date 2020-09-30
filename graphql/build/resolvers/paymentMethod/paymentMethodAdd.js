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
    var _a;
    const { fields: { active, refId, name, parent: parentId }, } = args;
    const { db, user } = context;
    const docHistory = new DocHistory_1.default({ node: standIns_1.userNodeType, id: user.id }, (_a = context.ephemeral) === null || _a === void 0 ? void 0 : _a.docHistoryDate);
    const parent = new mongodb_1.ObjectId(parentId);
    const collection = db.collection("paymentMethods");
    const parentDoc = yield collection.findOne({ _id: parent }, { projection: { _id: true, allowChildren: true } });
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
    const { insertedId } = yield collection.insertOne(Object.assign({ parent, allowChildren: false }, docBuilder.doc()));
    const [result] = yield collection
        .aggregate([{ $match: { _id: insertedId } }, { $addFields: utils_1.$addFields }])
        .toArray();
    return result;
});
exports.default = paymentMethodAdd;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicGF5bWVudE1ldGhvZEFkZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9yZXNvbHZlcnMvcGF5bWVudE1ldGhvZC9wYXltZW50TWV0aG9kQWRkLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7O0FBQUEscUNBQW1DO0FBRW5DLG9EQUE2QztBQUM3QyxnREFBaUQ7QUFDakQsbUNBQXFDO0FBRXJDLE1BQU0sZ0JBQWdCLEdBQTBDLENBQzlELEdBQUcsRUFDSCxJQUFJLEVBQ0osT0FBTyxFQUNQLElBQUksRUFDSixFQUFFOztJQUNGLE1BQU0sRUFDSixNQUFNLEVBQUUsRUFBRSxNQUFNLEVBQUUsS0FBSyxFQUFFLElBQUksRUFBRSxNQUFNLEVBQUUsUUFBUSxFQUFFLEdBQ2xELEdBQUcsSUFBSSxDQUFDO0lBRVQsTUFBTSxFQUFFLEVBQUUsRUFBRSxJQUFJLEVBQUUsR0FBRyxPQUFPLENBQUM7SUFFN0IsTUFBTSxVQUFVLEdBQUcsSUFBSSxvQkFBVSxDQUMvQixFQUFFLElBQUksRUFBRSx1QkFBWSxFQUFFLEVBQUUsRUFBRSxJQUFJLENBQUMsRUFBRSxFQUFFLFFBQ25DLE9BQU8sQ0FBQyxTQUFTLDBDQUFFLGNBQWMsQ0FDbEMsQ0FBQztJQUVGLE1BQU0sTUFBTSxHQUFHLElBQUksa0JBQVEsQ0FBQyxRQUFRLENBQUMsQ0FBQztJQUV0QyxNQUFNLFVBQVUsR0FBRyxFQUFFLENBQUMsVUFBVSxDQUFDLGdCQUFnQixDQUFDLENBQUM7SUFFbkQsTUFBTSxTQUFTLEdBQUcsTUFBTSxVQUFVLENBQUMsT0FBTyxDQUN4QyxFQUFFLEdBQUcsRUFBRSxNQUFNLEVBQUUsRUFDZixFQUFFLFVBQVUsRUFBRSxFQUFFLEdBQUcsRUFBRSxJQUFJLEVBQUUsYUFBYSxFQUFFLElBQUksRUFBRSxFQUFFLENBQ25ELENBQUM7SUFFRixJQUFJLENBQUMsU0FBUyxFQUFFO1FBQ2QsTUFBTSxJQUFJLEtBQUssQ0FBQywwQkFBMEIsUUFBUSxtQkFBbUIsQ0FBQyxDQUFDO0tBQ3hFO1NBQU0sSUFBSSxDQUFDLFNBQVMsQ0FBQyxhQUFhLEVBQUU7UUFDbkMsTUFBTSxJQUFJLEtBQUssQ0FDYiwwQkFBMEIsUUFBUSw0QkFBNEIsQ0FDL0QsQ0FBQztLQUNIO0lBRUQsTUFBTSxVQUFVLEdBQUcsVUFBVSxDQUFDLGdCQUFnQixDQUFDLElBQUksQ0FBQyxDQUFDLFNBQVMsQ0FBQztRQUM3RCxDQUFDLFFBQVEsRUFBRSxNQUFNLENBQUM7UUFDbEIsQ0FBQyxNQUFNLEVBQUUsSUFBSSxDQUFDO0tBQ2YsQ0FBQyxDQUFDO0lBRUgsSUFBSSxLQUFLLEVBQUU7UUFDVCxVQUFVLENBQUMsUUFBUSxDQUFDLE9BQU8sRUFBRSxLQUFLLENBQUMsQ0FBQztLQUNyQztJQUVELE1BQU0sRUFBRSxVQUFVLEVBQUUsR0FBRyxNQUFNLFVBQVUsQ0FBQyxTQUFTLGlCQUMvQyxNQUFNLEVBQ04sYUFBYSxFQUFFLEtBQUssSUFDakIsVUFBVSxDQUFDLEdBQUcsRUFBRSxFQUNuQixDQUFDO0lBRUgsTUFBTSxDQUFDLE1BQU0sQ0FBQyxHQUFHLE1BQU0sVUFBVTtTQUM5QixTQUFTLENBQUMsQ0FBQyxFQUFFLE1BQU0sRUFBRSxFQUFFLEdBQUcsRUFBRSxVQUFVLEVBQUUsRUFBRSxFQUFFLEVBQUUsVUFBVSxFQUFWLGtCQUFVLEVBQUUsQ0FBQyxDQUFDO1NBQzVELE9BQU8sRUFBRSxDQUFDO0lBRWIsT0FBTyxNQUFNLENBQUM7QUFDaEIsQ0FBQyxDQUFBLENBQUM7QUFFRixrQkFBZSxnQkFBZ0IsQ0FBQyJ9