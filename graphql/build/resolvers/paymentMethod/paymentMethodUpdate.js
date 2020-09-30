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
    var _a, _b, _c, _d;
    const { db, user } = context;
    const docHistory = new DocHistory_1.default({ node: standIns_1.userNodeType, id: user.id }, (_a = context.ephemeral) === null || _a === void 0 ? void 0 : _a.docHistoryDate);
    const updateBuilder = docHistory.updateHistoricalDoc();
    const { id, fields } = args;
    const active = (_b = fields.active, (_b !== null && _b !== void 0 ? _b : null));
    const refId = (_c = fields.refId, (_c !== null && _c !== void 0 ? _c : "")).trim();
    const name = (_d = fields.name, (_d !== null && _d !== void 0 ? _d : "")).trim();
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
    const doc = yield collection.findOne({ _id }, { projection: { _id: true } });
    if (!doc) {
        throw new Error(`Payment method "${id}" does not exist.`);
    }
    const { modifiedCount } = yield collection.updateOne({ _id }, updateBuilder.update());
    if (modifiedCount === 0) {
        throw new Error(`Failed to update payment method: "${JSON.stringify(args)}".`);
    }
    const [result] = yield collection
        .aggregate([{ $match: { _id } }, { $addFields: utils_1.$addFields }])
        .toArray();
    return result;
});
exports.default = paymentMethodUpdate;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicGF5bWVudE1ldGhvZFVwZGF0ZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9yZXNvbHZlcnMvcGF5bWVudE1ldGhvZC9wYXltZW50TWV0aG9kVXBkYXRlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7O0FBQUEscUNBQW1DO0FBRW5DLG9EQUE2QztBQUM3QyxnREFBaUQ7QUFDakQsbUNBQXFDO0FBRXJDLG1DQUFtQztBQUNuQyxzQkFBc0I7QUFDdEIsb0JBQW9CO0FBQ3BCLG1CQUFtQjtBQUNuQixJQUFJO0FBRUosTUFBTSxtQkFBbUIsR0FBNkMsQ0FDcEUsR0FBRyxFQUNILElBQUksRUFDSixPQUFPLEVBQ1AsSUFBSSxFQUNKLEVBQUU7O0lBQ0YsTUFBTSxFQUFFLEVBQUUsRUFBRSxJQUFJLEVBQUUsR0FBRyxPQUFPLENBQUM7SUFFN0IsTUFBTSxVQUFVLEdBQUcsSUFBSSxvQkFBVSxDQUMvQixFQUFFLElBQUksRUFBRSx1QkFBWSxFQUFFLEVBQUUsRUFBRSxJQUFJLENBQUMsRUFBRSxFQUFFLFFBQ25DLE9BQU8sQ0FBQyxTQUFTLDBDQUFFLGNBQWMsQ0FDbEMsQ0FBQztJQUVGLE1BQU0sYUFBYSxHQUFHLFVBQVUsQ0FBQyxtQkFBbUIsRUFBRSxDQUFDO0lBRXZELE1BQU0sRUFBRSxFQUFFLEVBQUUsTUFBTSxFQUFFLEdBQUcsSUFBSSxDQUFDO0lBRTVCLE1BQU0sTUFBTSxTQUFHLE1BQU0sQ0FBQyxNQUFNLHVDQUFJLElBQUksRUFBQSxDQUFDO0lBQ3JDLE1BQU0sS0FBSyxHQUFHLE1BQUMsTUFBTSxDQUFDLEtBQUssdUNBQUksRUFBRSxFQUFDLENBQUMsSUFBSSxFQUFFLENBQUM7SUFDMUMsTUFBTSxJQUFJLEdBQUcsTUFBQyxNQUFNLENBQUMsSUFBSSx1Q0FBSSxFQUFFLEVBQUMsQ0FBQyxJQUFJLEVBQUUsQ0FBQztJQUV4QyxNQUFNLEdBQUcsR0FBRyxJQUFJLGtCQUFRLENBQUMsRUFBRSxDQUFDLENBQUM7SUFFN0IsSUFBSSxNQUFNLEtBQUssSUFBSSxFQUFFO1FBQ25CLGFBQWEsQ0FBQyxXQUFXLENBQUMsUUFBUSxFQUFFLE1BQU0sQ0FBQyxDQUFDO0tBQzdDO0lBRUQsSUFBSSxLQUFLLEVBQUU7UUFDVCxhQUFhLENBQUMsV0FBVyxDQUFDLE9BQU8sRUFBRSxLQUFLLENBQUMsQ0FBQztLQUMzQztJQUVELElBQUksSUFBSSxFQUFFO1FBQ1IsYUFBYSxDQUFDLFdBQVcsQ0FBQyxNQUFNLEVBQUUsSUFBSSxDQUFDLENBQUM7S0FDekM7SUFFRCxJQUFJLENBQUMsYUFBYSxDQUFDLFNBQVMsRUFBRTtRQUM1QixNQUFNLElBQUksR0FBRyxDQUFDLEdBQUcsRUFBRTtZQUNqQixNQUFNLEdBQUcsR0FFTDtnQkFDRixNQUFNLEVBQUUsSUFBSTtnQkFDWixLQUFLLEVBQUUsSUFBSTtnQkFDWCxJQUFJLEVBQUUsSUFBSTthQUNYLENBQUM7WUFFRixPQUFPLE1BQU0sQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUM7UUFDMUIsQ0FBQyxDQUFDLEVBQUUsQ0FBQztRQUVMLE1BQU0sSUFBSSxLQUFLLENBQ2Isd0VBQXdFLElBQUksQ0FBQyxJQUFJLENBQy9FLElBQUksQ0FDTCxJQUFJLENBQ04sQ0FBQztLQUNIO0lBRUQsTUFBTSxVQUFVLEdBQUcsRUFBRSxDQUFDLFVBQVUsQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDO0lBRW5ELE1BQU0sR0FBRyxHQUFHLE1BQU0sVUFBVSxDQUFDLE9BQU8sQ0FBQyxFQUFFLEdBQUcsRUFBRSxFQUFFLEVBQUUsVUFBVSxFQUFFLEVBQUUsR0FBRyxFQUFFLElBQUksRUFBRSxFQUFFLENBQUMsQ0FBQztJQUU3RSxJQUFJLENBQUMsR0FBRyxFQUFFO1FBQ1IsTUFBTSxJQUFJLEtBQUssQ0FBQyxtQkFBbUIsRUFBRSxtQkFBbUIsQ0FBQyxDQUFDO0tBQzNEO0lBRUQsTUFBTSxFQUFFLGFBQWEsRUFBRSxHQUFHLE1BQU0sVUFBVSxDQUFDLFNBQVMsQ0FDbEQsRUFBRSxHQUFHLEVBQUUsRUFDUCxhQUFhLENBQUMsTUFBTSxFQUFFLENBQ3ZCLENBQUM7SUFFRixJQUFJLGFBQWEsS0FBSyxDQUFDLEVBQUU7UUFDdkIsTUFBTSxJQUFJLEtBQUssQ0FDYixxQ0FBcUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUM5RCxDQUFDO0tBQ0g7SUFFRCxNQUFNLENBQUMsTUFBTSxDQUFDLEdBQUcsTUFBTSxVQUFVO1NBQzlCLFNBQVMsQ0FBQyxDQUFDLEVBQUUsTUFBTSxFQUFFLEVBQUUsR0FBRyxFQUFFLEVBQUUsRUFBRSxFQUFFLFVBQVUsRUFBVixrQkFBVSxFQUFFLENBQUMsQ0FBQztTQUNoRCxPQUFPLEVBQUUsQ0FBQztJQUViLE9BQU8sTUFBTSxDQUFDO0FBQ2hCLENBQUMsQ0FBQSxDQUFDO0FBRUYsa0JBQWUsbUJBQW1CLENBQUMifQ==