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
const nodeResolver_1 = require("../utils/nodeResolver");
const paymentMethod_1 = require("../paymentMethod/paymentMethod");
const paymentMethod = (doc, args, context, info) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const payMethod = (_a = doc.paymentMethod, (_a !== null && _a !== void 0 ? _a : doc));
    if ("node" in payMethod && "id" in payMethod) {
        return paymentMethod_1.default(payMethod, { id: payMethod.id }, context, info);
    }
    return payMethod;
});
const JournalEntry = {
    department: nodeResolver_1.nodeFieldResolver,
    category: nodeResolver_1.nodeFieldResolver,
    paymentMethod,
    source: nodeResolver_1.nodeFieldResolver,
};
exports.default = JournalEntry;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiSm91cm5hbEVudHJ5UmVzb2x2ZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvcmVzb2x2ZXJzL2pvdXJuYWxFbnRyeS9Kb3VybmFsRW50cnlSZXNvbHZlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7OztBQUNBLHdEQUEwRDtBQUMxRCxrRUFBbUU7QUFFbkUsTUFBTSxhQUFhLEdBQTJDLENBQzVELEdBQVEsRUFDUixJQUFJLEVBQ0osT0FBTyxFQUNQLElBQUksRUFDSixFQUFFOztJQUNGLE1BQU0sU0FBUyxTQUFHLEdBQUcsQ0FBQyxhQUFhLHVDQUFJLEdBQUcsRUFBQSxDQUFDO0lBQzNDLElBQUksTUFBTSxJQUFJLFNBQVMsSUFBSSxJQUFJLElBQUksU0FBUyxFQUFFO1FBQzVDLE9BQU8sdUJBQXFCLENBQzFCLFNBQVMsRUFDVCxFQUFFLEVBQUUsRUFBRSxTQUFTLENBQUMsRUFBWSxFQUFFLEVBQzlCLE9BQU8sRUFDUCxJQUFJLENBQ0wsQ0FBQztLQUNIO0lBRUQsT0FBTyxTQUFTLENBQUM7QUFDbkIsQ0FBQyxDQUFBLENBQUM7QUFFRixNQUFNLFlBQVksR0FBMEI7SUFDMUMsVUFBVSxFQUFFLGdDQUFpQjtJQUM3QixRQUFRLEVBQUUsZ0NBQWlCO0lBQzNCLGFBQWE7SUFDYixNQUFNLEVBQUUsZ0NBQWlCO0NBQzFCLENBQUM7QUFFRixrQkFBZSxZQUFZLENBQUMifQ==