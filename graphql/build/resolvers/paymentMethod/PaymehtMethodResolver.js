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
const utils_1 = require("./utils");
const ancestors = (doc, args, context, info) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const ancestors = [];
    const { db } = context;
    const collect = db.collection("paymentMethods");
    while (doc.parent) {
        const _id = new mongodb_1.ObjectID(((_a = doc.parent) === null || _a === void 0 ? void 0 : _a.__typename) === "PaymentMethod"
            ? doc.parent.id
            : doc.parent);
        [doc] = yield collect
            .aggregate([{ $match: { _id } }, { $addFields: utils_1.$addFields }])
            .toArray();
        ancestors.push(doc);
    }
    return ancestors;
});
const children = (doc, args, context, info) => {
    const { db } = context;
    const parent = new mongodb_1.ObjectID(doc.id ? doc.id : doc._id);
    return db
        .collection("paymentMethods")
        .aggregate([{ $match: { parent } }, { $addFields: utils_1.$addFields }])
        .toArray();
};
const parent = (parent, args, context, info) => __awaiter(void 0, void 0, void 0, function* () {
    var _b;
    if (!parent.parent) {
        return null;
    }
    else if (((_b = parent.parent) === null || _b === void 0 ? void 0 : _b.__typename) === "PaymentMethod") {
        return parent.parent;
    }
    const _id = new mongodb_1.ObjectID(parent.parent);
    const { db } = context;
    const [result] = yield db
        .collection("paymentMethods")
        .aggregate([{ $match: { _id } }, { $addFields: utils_1.$addFields }])
        .toArray();
    return result;
});
const PaymentMethod = {
    // id: doc => (doc.id ? doc.id : ((doc as any)._id as ObjectID).toHexString()),
    parent,
    ancestors,
    children,
    authorization: doc => (doc.authorization ? doc.authorization : [])
};
exports.default = PaymentMethod;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUGF5bWVodE1ldGhvZFJlc29sdmVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL3Jlc29sdmVycy9wYXltZW50TWV0aG9kL1BheW1laHRNZXRob2RSZXNvbHZlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7OztBQUFBLHFDQUFtQztBQUVuQyxtQ0FBcUM7QUFFckMsTUFBTSxTQUFTLEdBQXdDLENBQ3JELEdBQUcsRUFDSCxJQUFJLEVBQ0osT0FBTyxFQUNQLElBQUksRUFDSixFQUFFOztJQUNGLE1BQU0sU0FBUyxHQUFvQixFQUFFLENBQUM7SUFFdEMsTUFBTSxFQUFFLEVBQUUsRUFBRSxHQUFHLE9BQU8sQ0FBQztJQUN2QixNQUFNLE9BQU8sR0FBRyxFQUFFLENBQUMsVUFBVSxDQUFDLGdCQUFnQixDQUFDLENBQUM7SUFFaEQsT0FBTyxHQUFHLENBQUMsTUFBTSxFQUFFO1FBQ2pCLE1BQU0sR0FBRyxHQUFHLElBQUksa0JBQVEsQ0FDdEIsT0FBQSxHQUFHLENBQUMsTUFBTSwwQ0FBRSxVQUFVLE1BQUssZUFBZTtZQUN4QyxDQUFDLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxFQUFFO1lBQ2YsQ0FBQyxDQUFHLEdBQUcsQ0FBQyxNQUFvQyxDQUMvQyxDQUFDO1FBQ0YsQ0FBQyxHQUFHLENBQUMsR0FBRyxNQUFNLE9BQU87YUFDbEIsU0FBUyxDQUFnQixDQUFDLEVBQUUsTUFBTSxFQUFFLEVBQUUsR0FBRyxFQUFFLEVBQUUsRUFBRSxFQUFFLFVBQVUsRUFBVixrQkFBVSxFQUFFLENBQUMsQ0FBQzthQUMvRCxPQUFPLEVBQUUsQ0FBQztRQUNiLFNBQVMsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUM7S0FDckI7SUFFRCxPQUFPLFNBQVMsQ0FBQztBQUNuQixDQUFDLENBQUEsQ0FBQztBQUVGLE1BQU0sUUFBUSxHQUF1QyxDQUNuRCxHQUFHLEVBQ0gsSUFBSSxFQUNKLE9BQU8sRUFDUCxJQUFJLEVBQ0osRUFBRTtJQUNGLE1BQU0sRUFBRSxFQUFFLEVBQUUsR0FBRyxPQUFPLENBQUM7SUFFdkIsTUFBTSxNQUFNLEdBQUcsSUFBSSxrQkFBUSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFFLEdBQVcsQ0FBQyxHQUFHLENBQVEsQ0FBQztJQUV2RSxPQUFPLEVBQUU7U0FDTixVQUFVLENBQUMsZ0JBQWdCLENBQUM7U0FDNUIsU0FBUyxDQUFDLENBQUMsRUFBRSxNQUFNLEVBQUUsRUFBRSxNQUFNLEVBQUUsRUFBRSxFQUFFLEVBQUUsVUFBVSxFQUFWLGtCQUFVLEVBQUUsQ0FBQyxDQUFDO1NBQ25ELE9BQU8sRUFBRSxDQUFDO0FBQ2YsQ0FBQyxDQUFDO0FBRUYsTUFBTSxNQUFNLEdBQXFDLENBQy9DLE1BQU0sRUFDTixJQUFJLEVBQ0osT0FBTyxFQUNQLElBQUksRUFDSixFQUFFOztJQUNGLElBQUksQ0FBQyxNQUFNLENBQUMsTUFBTSxFQUFFO1FBQ2xCLE9BQU8sSUFBSSxDQUFDO0tBQ2I7U0FBTSxJQUFJLE9BQUEsTUFBTSxDQUFDLE1BQU0sMENBQUUsVUFBVSxNQUFLLGVBQWUsRUFBRTtRQUN4RCxPQUFPLE1BQU0sQ0FBQyxNQUFNLENBQUM7S0FDdEI7SUFFRCxNQUFNLEdBQUcsR0FBRyxJQUFJLGtCQUFRLENBQUUsTUFBTSxDQUFDLE1BQW1DLENBQUMsQ0FBQztJQUV0RSxNQUFNLEVBQUUsRUFBRSxFQUFFLEdBQUcsT0FBTyxDQUFDO0lBRXZCLE1BQU0sQ0FBQyxNQUFNLENBQUMsR0FBRyxNQUFNLEVBQUU7U0FDdEIsVUFBVSxDQUFDLGdCQUFnQixDQUFDO1NBQzVCLFNBQVMsQ0FBQyxDQUFDLEVBQUUsTUFBTSxFQUFFLEVBQUUsR0FBRyxFQUFFLEVBQUUsRUFBRSxFQUFFLFVBQVUsRUFBVixrQkFBVSxFQUFFLENBQUMsQ0FBQztTQUNoRCxPQUFPLEVBQUUsQ0FBQztJQUViLE9BQU8sTUFBTSxDQUFDO0FBQ2hCLENBQUMsQ0FBQSxDQUFDO0FBRUYsTUFBTSxhQUFhLEdBQTJCO0lBQzVDLCtFQUErRTtJQUMvRSxNQUFNO0lBQ04sU0FBUztJQUNULFFBQVE7SUFDUixhQUFhLEVBQUUsR0FBRyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxhQUFhLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxhQUFhLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQztDQUNuRSxDQUFDO0FBRUYsa0JBQWUsYUFBYSxDQUFDIn0=