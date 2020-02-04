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
const nodeResolver_1 = require("./utils/nodeResolver");
exports.paymentMethods = (parent, args, context, info) => __awaiter(void 0, void 0, void 0, function* () {
    const { db } = context;
    const payMethodResults = yield db.collection("paymentMethods")
        .aggregate([
        { $addFields: { id: { $toString: "$_id" } } }
    ]).toArray();
    return payMethodResults;
});
// TODO: implement ancestors
exports.PaymentMethod = {
    parent: nodeResolver_1.nodeFieldResolver
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicGF5bWVudE1ldGhvZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9yZXNvbHZlcnMvcGF5bWVudE1ldGhvZC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7OztBQUNBLHVEQUF3RTtBQUUzRCxRQUFBLGNBQWMsR0FDekIsQ0FBTyxNQUFNLEVBQUUsSUFBSSxFQUFFLE9BQU8sRUFBRSxJQUFJLEVBQUUsRUFBRTtJQUd0QyxNQUFNLEVBQUMsRUFBRSxFQUFDLEdBQUcsT0FBTyxDQUFDO0lBRXJCLE1BQU0sZ0JBQWdCLEdBQUcsTUFBTSxFQUFFLENBQUMsVUFBVSxDQUFDLGdCQUFnQixDQUFDO1NBQzNELFNBQVMsQ0FBQztRQUNULEVBQUMsVUFBVSxFQUFDLEVBQUMsRUFBRSxFQUFDLEVBQUMsU0FBUyxFQUFDLE1BQU0sRUFBQyxFQUFDLEVBQUM7S0FDckMsQ0FBQyxDQUFDLE9BQU8sRUFBRSxDQUFDO0lBRWYsT0FBTyxnQkFBZ0IsQ0FBQztBQUUxQixDQUFDLENBQUEsQ0FBQTtBQUVELDRCQUE0QjtBQUVmLFFBQUEsYUFBYSxHQUEwQjtJQUNsRCxNQUFNLEVBQUMsZ0NBQWlCO0NBQ3pCLENBQUMifQ==