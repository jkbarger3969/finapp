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
const paymentMethod_1 = require("../paymentMethod/paymentMethod");
const rational_1 = require("../../utils/rational");
const paymentMethod = (doc, args, context, info) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const payMethod = (_a = doc) === null || _a === void 0 ? void 0 : _a.paymentMethod;
    if (payMethod && "node" in payMethod && "id" in payMethod) {
        return paymentMethod_1.default(payMethod, { id: payMethod.id }, context, info);
    }
    return payMethod;
});
const JournalRefundEntry = {
    paymentMethod,
    total: (doc) => { var _a; return rational_1.fractionToRational((_a = doc.total, (_a !== null && _a !== void 0 ? _a : doc))); },
};
exports.default = JournalRefundEntry;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiSm91cm5hbEVudHJ5UmVmdW5kUmVzb2x2ZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvcmVzb2x2ZXJzL2pvdXJuYWxFbnRyeS9Kb3VybmFsRW50cnlSZWZ1bmRSZXNvbHZlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7OztBQUNBLGtFQUFpRTtBQUNqRSxtREFBMEQ7QUFFMUQsTUFBTSxhQUFhLEdBQWlELENBQ2xFLEdBQUcsRUFDSCxJQUFJLEVBQ0osT0FBTyxFQUNQLElBQUksRUFDSixFQUFFOztJQUNGLE1BQU0sU0FBUyxHQUFHLE1BQUEsR0FBRywwQ0FBRSxhQUFvQixDQUFDO0lBQzVDLElBQUksU0FBUyxJQUFJLE1BQU0sSUFBSSxTQUFTLElBQUksSUFBSSxJQUFJLFNBQVMsRUFBRTtRQUN6RCxPQUFPLHVCQUFtQixDQUN4QixTQUFTLEVBQ1QsRUFBRSxFQUFFLEVBQUUsU0FBUyxDQUFDLEVBQVksRUFBRSxFQUM5QixPQUFPLEVBQ1AsSUFBSSxDQUNMLENBQUM7S0FDSDtJQUVELE9BQU8sU0FBUyxDQUFDO0FBQ25CLENBQUMsQ0FBQSxDQUFDO0FBRUYsTUFBTSxrQkFBa0IsR0FBZ0M7SUFDdEQsYUFBYTtJQUNiLEtBQUssRUFBRSxDQUFDLEdBQUcsRUFBRSxFQUFFLFdBQUMsT0FBQSw2QkFBa0IsQ0FBQyxNQUFDLEdBQUcsQ0FBQyxLQUFLLHVDQUFJLEdBQUcsRUFBUSxDQUFDLENBQUEsRUFBQTtDQUM5RCxDQUFDO0FBRUYsa0JBQWUsa0JBQWtCLENBQUMifQ==