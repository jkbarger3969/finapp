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
const paymentMethodUpdate = (obj, args, context, info) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c;
    const { db, user } = context;
    const docHistory = new DocHistory_1.default({ node: standIns_1.userNodeType, id: user.id });
    const { id, fields } = args;
    const active = (_a = fields.active, (_a !== null && _a !== void 0 ? _a : null));
    const refId = (_b = fields.refId, (_b !== null && _b !== void 0 ? _b : "")).trim();
    const name = (_c = fields.name, (_c !== null && _c !== void 0 ? _c : "")).trim();
    const _id = new mongodb_1.ObjectID(id);
    if (active !== null) {
        docHistory.updateValue("active", active);
    }
    if (refId) {
        docHistory.updateValue("refId", refId);
    }
    if (name) {
        docHistory.updateValue("name", name);
    }
    const collection = db.collection("paymentMethods");
    const doc = yield collection.findOne({ _id }, { projection: { _id: true } });
    if (!doc) {
        throw new Error(`Mutation "paymentMethodUpdate" payment method "${id}" does not exist.`);
    }
    const { modifiedCount } = yield collection.updateOne({ _id }, { $push: docHistory.updatePushArg });
    if (modifiedCount === 0) {
        throw new Error(`Mutation "paymentMethodUpdate" arguments "${JSON.stringify(args)}" failed.`);
    }
    const [result] = yield collection
        .aggregate([{ $match: { _id } }, { $addFields: utils_1.$addFields }])
        .toArray();
    return result;
});
exports.default = paymentMethodUpdate;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicGF5bWVudE1ldGhvZFVwZGF0ZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9yZXNvbHZlcnMvcGF5bWVudE1ldGhvZC9wYXltZW50TWV0aG9kVXBkYXRlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7O0FBQUEscUNBQWdEO0FBRWhELG9EQUE2QztBQUM3QyxnREFBaUQ7QUFDakQsbUNBQXFDO0FBUXJDLE1BQU0sbUJBQW1CLEdBQTZDLENBQ3BFLEdBQUcsRUFDSCxJQUFJLEVBQ0osT0FBTyxFQUNQLElBQUksRUFDSixFQUFFOztJQUNGLE1BQU0sRUFBRSxFQUFFLEVBQUUsSUFBSSxFQUFFLEdBQUcsT0FBTyxDQUFDO0lBRTdCLE1BQU0sVUFBVSxHQUFHLElBQUksb0JBQVUsQ0FBQyxFQUFFLElBQUksRUFBRSx1QkFBWSxFQUFFLEVBQUUsRUFBRSxJQUFJLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQztJQUV2RSxNQUFNLEVBQUUsRUFBRSxFQUFFLE1BQU0sRUFBRSxHQUFHLElBQUksQ0FBQztJQUU1QixNQUFNLE1BQU0sU0FBRyxNQUFNLENBQUMsTUFBTSx1Q0FBSSxJQUFJLEVBQUEsQ0FBQztJQUNyQyxNQUFNLEtBQUssR0FBRyxNQUFDLE1BQU0sQ0FBQyxLQUFLLHVDQUFJLEVBQUUsRUFBQyxDQUFDLElBQUksRUFBRSxDQUFDO0lBQzFDLE1BQU0sSUFBSSxHQUFHLE1BQUMsTUFBTSxDQUFDLElBQUksdUNBQUksRUFBRSxFQUFDLENBQUMsSUFBSSxFQUFFLENBQUM7SUFFeEMsTUFBTSxHQUFHLEdBQUcsSUFBSSxrQkFBUSxDQUFDLEVBQUUsQ0FBQyxDQUFDO0lBRTdCLElBQUksTUFBTSxLQUFLLElBQUksRUFBRTtRQUNuQixVQUFVLENBQUMsV0FBVyxDQUFDLFFBQVEsRUFBRSxNQUFNLENBQUMsQ0FBQztLQUMxQztJQUVELElBQUksS0FBSyxFQUFFO1FBQ1QsVUFBVSxDQUFDLFdBQVcsQ0FBQyxPQUFPLEVBQUUsS0FBSyxDQUFDLENBQUM7S0FDeEM7SUFFRCxJQUFJLElBQUksRUFBRTtRQUNSLFVBQVUsQ0FBQyxXQUFXLENBQUMsTUFBTSxFQUFFLElBQUksQ0FBQyxDQUFDO0tBQ3RDO0lBRUQsTUFBTSxVQUFVLEdBQUcsRUFBRSxDQUFDLFVBQVUsQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDO0lBRW5ELE1BQU0sR0FBRyxHQUFHLE1BQU0sVUFBVSxDQUFDLE9BQU8sQ0FBQyxFQUFFLEdBQUcsRUFBRSxFQUFFLEVBQUUsVUFBVSxFQUFFLEVBQUUsR0FBRyxFQUFFLElBQUksRUFBRSxFQUFFLENBQUMsQ0FBQztJQUU3RSxJQUFJLENBQUMsR0FBRyxFQUFFO1FBQ1IsTUFBTSxJQUFJLEtBQUssQ0FDYixrREFBa0QsRUFBRSxtQkFBbUIsQ0FDeEUsQ0FBQztLQUNIO0lBRUQsTUFBTSxFQUFFLGFBQWEsRUFBRSxHQUFHLE1BQU0sVUFBVSxDQUFDLFNBQVMsQ0FDbEQsRUFBRSxHQUFHLEVBQUUsRUFDUCxFQUFFLEtBQUssRUFBRSxVQUFVLENBQUMsYUFBYSxFQUFFLENBQ3BDLENBQUM7SUFFRixJQUFJLGFBQWEsS0FBSyxDQUFDLEVBQUU7UUFDdkIsTUFBTSxJQUFJLEtBQUssQ0FDYiw2Q0FBNkMsSUFBSSxDQUFDLFNBQVMsQ0FDekQsSUFBSSxDQUNMLFdBQVcsQ0FDYixDQUFDO0tBQ0g7SUFFRCxNQUFNLENBQUMsTUFBTSxDQUFDLEdBQUcsTUFBTSxVQUFVO1NBQzlCLFNBQVMsQ0FBQyxDQUFDLEVBQUUsTUFBTSxFQUFFLEVBQUUsR0FBRyxFQUFFLEVBQUUsRUFBRSxFQUFFLFVBQVUsRUFBVixrQkFBVSxFQUFFLENBQUMsQ0FBQztTQUNoRCxPQUFPLEVBQUUsQ0FBQztJQUViLE9BQU8sTUFBTSxDQUFDO0FBQ2hCLENBQUMsQ0FBQSxDQUFDO0FBRUYsa0JBQWUsbUJBQW1CLENBQUMifQ==