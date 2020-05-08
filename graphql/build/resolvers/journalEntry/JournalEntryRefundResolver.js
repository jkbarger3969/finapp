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
const paymentMethod = (doc, args, context, info) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const payMethod = (_a = doc.paymentMethod, (_a !== null && _a !== void 0 ? _a : doc));
    if ("node" in payMethod && "id" in payMethod) {
        return paymentMethod_1.default(payMethod, { id: payMethod.id }, context, info);
    }
    return payMethod;
});
const JournalEntry = {
    paymentMethod,
};
exports.default = JournalEntry;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiSm91cm5hbEVudHJ5UmVmdW5kUmVzb2x2ZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvcmVzb2x2ZXJzL2pvdXJuYWxFbnRyeS9Kb3VybmFsRW50cnlSZWZ1bmRSZXNvbHZlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7OztBQUVBLGtFQUFtRTtBQUVuRSxNQUFNLGFBQWEsR0FBaUQsQ0FDbEUsR0FBUSxFQUNSLElBQUksRUFDSixPQUFPLEVBQ1AsSUFBSSxFQUNKLEVBQUU7O0lBQ0YsTUFBTSxTQUFTLFNBQUcsR0FBRyxDQUFDLGFBQWEsdUNBQUksR0FBRyxFQUFBLENBQUM7SUFDM0MsSUFBSSxNQUFNLElBQUksU0FBUyxJQUFJLElBQUksSUFBSSxTQUFTLEVBQUU7UUFDNUMsT0FBTyx1QkFBcUIsQ0FDMUIsU0FBUyxFQUNULEVBQUUsRUFBRSxFQUFFLFNBQVMsQ0FBQyxFQUFZLEVBQUUsRUFDOUIsT0FBTyxFQUNQLElBQUksQ0FDTCxDQUFDO0tBQ0g7SUFFRCxPQUFPLFNBQVMsQ0FBQztBQUNuQixDQUFDLENBQUEsQ0FBQztBQUVGLE1BQU0sWUFBWSxHQUFnQztJQUNoRCxhQUFhO0NBQ2QsQ0FBQztBQUVGLGtCQUFlLFlBQVksQ0FBQyJ9