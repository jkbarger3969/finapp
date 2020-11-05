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
// interface PaymentMethodsSchema {
//   active?: boolean;
//   refId?: string;
//   name?: string;
// }
const paymentMethodUpdate = (obj, args, context, info) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d, _e;
    const { db, user } = context;
    const docHistory = new DocHistory_1.default({ node: standIns_1.userNodeType, id: user.id }, (_a = context.ephemeral) === null || _a === void 0 ? void 0 : _a.docHistoryDate);
    const session = (_b = context.ephemeral) === null || _b === void 0 ? void 0 : _b.session;
    const updateBuilder = docHistory.updateHistoricalDoc();
    const { id, fields } = args;
    const active = (_c = fields.active) !== null && _c !== void 0 ? _c : null;
    const refId = ((_d = fields.refId) !== null && _d !== void 0 ? _d : "").trim();
    const name = ((_e = fields.name) !== null && _e !== void 0 ? _e : "").trim();
    const _id = new mongodb_1.ObjectId(id);
    if (active !== null) {
        updateBuilder.updateField("active", active);
    }
    if (refId) {
        updateBuilder.updateField("refId", refId);
    }
    if (name) {
        updateBuilder.updateField("name", name);
    }
    if (!updateBuilder.hasUpdate) {
        const keys = (() => {
            const obj = {
                active: null,
                refId: null,
                name: null,
            };
            return Object.keys(obj);
        })();
        throw new Error(`Payment method update requires at least one of the following fields: ${keys.join(", ")}".`);
    }
    const collection = db.collection("paymentMethods");
    const doc = yield collection.findOne({ _id }, { projection: { _id: true }, session });
    if (!doc) {
        throw new Error(`Payment method "${id}" does not exist.`);
    }
    const { modifiedCount } = yield collection.updateOne({ _id }, Object.assign({}, updateBuilder.update()), { session });
    if (modifiedCount === 0) {
        throw new Error(`Failed to update payment method: "${JSON.stringify(args)}".`);
    }
    const [result] = yield collection
        .aggregate([{ $match: { _id } }, { $addFields: utils_1.$addFields }], { session })
        .toArray();
    return result;
});
exports.default = paymentMethodUpdate;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicGF5bWVudE1ldGhvZFVwZGF0ZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9yZXNvbHZlcnMvcGF5bWVudE1ldGhvZC9wYXltZW50TWV0aG9kVXBkYXRlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7O0FBQUEscUNBQW1DO0FBRW5DLG9EQUE2QztBQUM3QyxnREFBaUQ7QUFDakQsbUNBQXFDO0FBRXJDLG1DQUFtQztBQUNuQyxzQkFBc0I7QUFDdEIsb0JBQW9CO0FBQ3BCLG1CQUFtQjtBQUNuQixJQUFJO0FBRUosTUFBTSxtQkFBbUIsR0FBNkMsQ0FDcEUsR0FBRyxFQUNILElBQUksRUFDSixPQUFPLEVBQ1AsSUFBSSxFQUNKLEVBQUU7O0lBQ0YsTUFBTSxFQUFFLEVBQUUsRUFBRSxJQUFJLEVBQUUsR0FBRyxPQUFPLENBQUM7SUFFN0IsTUFBTSxVQUFVLEdBQUcsSUFBSSxvQkFBVSxDQUMvQixFQUFFLElBQUksRUFBRSx1QkFBWSxFQUFFLEVBQUUsRUFBRSxJQUFJLENBQUMsRUFBRSxFQUFFLFFBQ25DLE9BQU8sQ0FBQyxTQUFTLDBDQUFFLGNBQWMsQ0FDbEMsQ0FBQztJQUVGLE1BQU0sT0FBTyxTQUFHLE9BQU8sQ0FBQyxTQUFTLDBDQUFFLE9BQU8sQ0FBQztJQUUzQyxNQUFNLGFBQWEsR0FBRyxVQUFVLENBQUMsbUJBQW1CLEVBQUUsQ0FBQztJQUV2RCxNQUFNLEVBQUUsRUFBRSxFQUFFLE1BQU0sRUFBRSxHQUFHLElBQUksQ0FBQztJQUU1QixNQUFNLE1BQU0sU0FBRyxNQUFNLENBQUMsTUFBTSxtQ0FBSSxJQUFJLENBQUM7SUFDckMsTUFBTSxLQUFLLEdBQUcsT0FBQyxNQUFNLENBQUMsS0FBSyxtQ0FBSSxFQUFFLENBQUMsQ0FBQyxJQUFJLEVBQUUsQ0FBQztJQUMxQyxNQUFNLElBQUksR0FBRyxPQUFDLE1BQU0sQ0FBQyxJQUFJLG1DQUFJLEVBQUUsQ0FBQyxDQUFDLElBQUksRUFBRSxDQUFDO0lBRXhDLE1BQU0sR0FBRyxHQUFHLElBQUksa0JBQVEsQ0FBQyxFQUFFLENBQUMsQ0FBQztJQUU3QixJQUFJLE1BQU0sS0FBSyxJQUFJLEVBQUU7UUFDbkIsYUFBYSxDQUFDLFdBQVcsQ0FBQyxRQUFRLEVBQUUsTUFBTSxDQUFDLENBQUM7S0FDN0M7SUFFRCxJQUFJLEtBQUssRUFBRTtRQUNULGFBQWEsQ0FBQyxXQUFXLENBQUMsT0FBTyxFQUFFLEtBQUssQ0FBQyxDQUFDO0tBQzNDO0lBRUQsSUFBSSxJQUFJLEVBQUU7UUFDUixhQUFhLENBQUMsV0FBVyxDQUFDLE1BQU0sRUFBRSxJQUFJLENBQUMsQ0FBQztLQUN6QztJQUVELElBQUksQ0FBQyxhQUFhLENBQUMsU0FBUyxFQUFFO1FBQzVCLE1BQU0sSUFBSSxHQUFHLENBQUMsR0FBRyxFQUFFO1lBQ2pCLE1BQU0sR0FBRyxHQUVMO2dCQUNGLE1BQU0sRUFBRSxJQUFJO2dCQUNaLEtBQUssRUFBRSxJQUFJO2dCQUNYLElBQUksRUFBRSxJQUFJO2FBQ1gsQ0FBQztZQUVGLE9BQU8sTUFBTSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQztRQUMxQixDQUFDLENBQUMsRUFBRSxDQUFDO1FBRUwsTUFBTSxJQUFJLEtBQUssQ0FDYix3RUFBd0UsSUFBSSxDQUFDLElBQUksQ0FDL0UsSUFBSSxDQUNMLElBQUksQ0FDTixDQUFDO0tBQ0g7SUFFRCxNQUFNLFVBQVUsR0FBRyxFQUFFLENBQUMsVUFBVSxDQUFDLGdCQUFnQixDQUFDLENBQUM7SUFFbkQsTUFBTSxHQUFHLEdBQUcsTUFBTSxVQUFVLENBQUMsT0FBTyxDQUNsQyxFQUFFLEdBQUcsRUFBRSxFQUNQLEVBQUUsVUFBVSxFQUFFLEVBQUUsR0FBRyxFQUFFLElBQUksRUFBRSxFQUFFLE9BQU8sRUFBRSxDQUN2QyxDQUFDO0lBRUYsSUFBSSxDQUFDLEdBQUcsRUFBRTtRQUNSLE1BQU0sSUFBSSxLQUFLLENBQUMsbUJBQW1CLEVBQUUsbUJBQW1CLENBQUMsQ0FBQztLQUMzRDtJQUVELE1BQU0sRUFBRSxhQUFhLEVBQUUsR0FBRyxNQUFNLFVBQVUsQ0FBQyxTQUFTLENBQ2xELEVBQUUsR0FBRyxFQUFFLG9CQUNGLGFBQWEsQ0FBQyxNQUFNLEVBQUUsR0FDM0IsRUFBRSxPQUFPLEVBQUUsQ0FDWixDQUFDO0lBRUYsSUFBSSxhQUFhLEtBQUssQ0FBQyxFQUFFO1FBQ3ZCLE1BQU0sSUFBSSxLQUFLLENBQ2IscUNBQXFDLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLElBQUksQ0FDOUQsQ0FBQztLQUNIO0lBRUQsTUFBTSxDQUFDLE1BQU0sQ0FBQyxHQUFHLE1BQU0sVUFBVTtTQUM5QixTQUFTLENBQUMsQ0FBQyxFQUFFLE1BQU0sRUFBRSxFQUFFLEdBQUcsRUFBRSxFQUFFLEVBQUUsRUFBRSxVQUFVLEVBQVYsa0JBQVUsRUFBRSxDQUFDLEVBQUUsRUFBRSxPQUFPLEVBQUUsQ0FBQztTQUM3RCxPQUFPLEVBQUUsQ0FBQztJQUViLE9BQU8sTUFBTSxDQUFDO0FBQ2hCLENBQUMsQ0FBQSxDQUFDO0FBRUYsa0JBQWUsbUJBQW1CLENBQUMifQ==