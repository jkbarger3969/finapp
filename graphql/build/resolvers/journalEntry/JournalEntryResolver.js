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
const rational_1 = require("../../utils/rational");
const budgets_1 = require("../budget/budgets");
const fiscalYears_1 = require("../fiscalYear/fiscalYears");
const mongodb_1 = require("mongodb");
const deptNode = new mongodb_1.ObjectId("5dc4addacf96e166daaa008f");
const bizNode = new mongodb_1.ObjectId("5dc476becf96e166daa9fd0b");
const paymentMethod = (doc, args, context, info) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const payMethod = (_a = doc.paymentMethod, (_a !== null && _a !== void 0 ? _a : doc));
    if ("node" in payMethod && "id" in payMethod) {
        return paymentMethod_1.default(payMethod, { id: payMethod.id }, context, info);
    }
    return payMethod;
});
const budget = (doc, args, context, info) => __awaiter(void 0, void 0, void 0, function* () {
    return ((yield budgets_1.default(doc, {
        where: {
            fiscalYear: { hasDate: { eq: doc.date } },
            department: doc.department
                .id.toHexString(),
        },
    }, context, info))[0] || null);
});
const fiscalYear = (doc, args, context, info) => __awaiter(void 0, void 0, void 0, function* () {
    return (yield fiscalYears_1.default(doc, {
        where: {
            hasDate: {
                eq: doc.date,
            },
        },
    }, context, info))[0];
});
const JournalEntry = {
    fiscalYear,
    budget,
    department: nodeResolver_1.nodeFieldResolver,
    category: nodeResolver_1.nodeFieldResolver,
    paymentMethod,
    source: nodeResolver_1.nodeFieldResolver,
    total: (doc) => rational_1.fractionToRational(doc.total),
};
exports.default = JournalEntry;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiSm91cm5hbEVudHJ5UmVzb2x2ZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvcmVzb2x2ZXJzL2pvdXJuYWxFbnRyeS9Kb3VybmFsRW50cnlSZXNvbHZlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7OztBQUtBLHdEQUEwRDtBQUMxRCxrRUFBbUU7QUFDbkUsbURBQTBEO0FBQzFELCtDQUE2QztBQUM3QywyREFBeUQ7QUFFekQscUNBQW1DO0FBSW5DLE1BQU0sUUFBUSxHQUFHLElBQUksa0JBQVEsQ0FBQywwQkFBMEIsQ0FBQyxDQUFDO0FBQzFELE1BQU0sT0FBTyxHQUFHLElBQUksa0JBQVEsQ0FBQywwQkFBMEIsQ0FBQyxDQUFDO0FBRXpELE1BQU0sYUFBYSxHQUEyQyxDQUM1RCxHQUFRLEVBQ1IsSUFBSSxFQUNKLE9BQU8sRUFDUCxJQUFJLEVBQ0osRUFBRTs7SUFDRixNQUFNLFNBQVMsU0FBRyxHQUFHLENBQUMsYUFBYSx1Q0FBSSxHQUFHLEVBQUEsQ0FBQztJQUMzQyxJQUFJLE1BQU0sSUFBSSxTQUFTLElBQUksSUFBSSxJQUFJLFNBQVMsRUFBRTtRQUM1QyxPQUFPLHVCQUFxQixDQUMxQixTQUFTLEVBQ1QsRUFBRSxFQUFFLEVBQUUsU0FBUyxDQUFDLEVBQVksRUFBRSxFQUM5QixPQUFPLEVBQ1AsSUFBSSxDQUNMLENBQUM7S0FDSDtJQUVELE9BQU8sU0FBUyxDQUFDO0FBQ25CLENBQUMsQ0FBQSxDQUFDO0FBRUYsTUFBTSxNQUFNLEdBQW9DLENBQzlDLEdBQUcsRUFDSCxJQUFJLEVBQ0osT0FBTyxFQUNQLElBQUksRUFDSixFQUFFO0lBQ0YsT0FBTyxDQUNMLENBQ0UsTUFBTSxpQkFBWSxDQUNoQixHQUFHLEVBQ0g7UUFDRSxLQUFLLEVBQUU7WUFDTCxVQUFVLEVBQUUsRUFBRSxPQUFPLEVBQUUsRUFBRSxFQUFFLEVBQUUsR0FBRyxDQUFDLElBQUksRUFBRSxFQUFFO1lBQ3pDLFVBQVUsRUFBSSxHQUFHLENBQUMsVUFBVTtpQkFDekIsRUFBMkIsQ0FBQyxXQUFXLEVBQUU7U0FDN0M7S0FDRixFQUNELE9BQU8sRUFDUCxJQUFJLENBQ0wsQ0FDRixDQUFDLENBQUMsQ0FBQyxJQUFJLElBQUksQ0FDYixDQUFDO0FBQ0osQ0FBQyxDQUFBLENBQUM7QUFFRixNQUFNLFVBQVUsR0FBd0MsQ0FDdEQsR0FBRyxFQUNILElBQUksRUFDSixPQUFPLEVBQ1AsSUFBSSxFQUNKLEVBQUU7SUFDRixPQUFPLENBQ0wsTUFBTSxxQkFBZ0IsQ0FDcEIsR0FBRyxFQUNIO1FBQ0UsS0FBSyxFQUFFO1lBQ0wsT0FBTyxFQUFFO2dCQUNQLEVBQUUsRUFBRSxHQUFHLENBQUMsSUFBSTthQUNiO1NBQ0Y7S0FDRixFQUNELE9BQU8sRUFDUCxJQUFJLENBQ0wsQ0FDRixDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQ1AsQ0FBQyxDQUFBLENBQUM7QUFFRixNQUFNLFlBQVksR0FBMEI7SUFDMUMsVUFBVTtJQUNWLE1BQU07SUFDTixVQUFVLEVBQUUsZ0NBQWlCO0lBQzdCLFFBQVEsRUFBRSxnQ0FBaUI7SUFDM0IsYUFBYTtJQUNiLE1BQU0sRUFBRSxnQ0FBaUI7SUFDekIsS0FBSyxFQUFFLENBQUMsR0FBRyxFQUFFLEVBQUUsQ0FBQyw2QkFBa0IsQ0FBRSxHQUFHLENBQUMsS0FBNkIsQ0FBQztDQUN2RSxDQUFDO0FBRUYsa0JBQWUsWUFBWSxDQUFDIn0=