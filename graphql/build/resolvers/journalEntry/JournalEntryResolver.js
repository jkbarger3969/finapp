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
    const payMethod = (_a = doc.paymentMethod) !== null && _a !== void 0 ? _a : doc;
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiSm91cm5hbEVudHJ5UmVzb2x2ZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvcmVzb2x2ZXJzL2pvdXJuYWxFbnRyeS9Kb3VybmFsRW50cnlSZXNvbHZlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7OztBQUtBLHdEQUEwRDtBQUMxRCxrRUFBbUU7QUFDbkUsbURBQTBEO0FBQzFELCtDQUE2QztBQUM3QywyREFBeUQ7QUFFekQscUNBQW1DO0FBSW5DLE1BQU0sUUFBUSxHQUFHLElBQUksa0JBQVEsQ0FBQywwQkFBMEIsQ0FBQyxDQUFDO0FBQzFELE1BQU0sT0FBTyxHQUFHLElBQUksa0JBQVEsQ0FBQywwQkFBMEIsQ0FBQyxDQUFDO0FBRXpELE1BQU0sYUFBYSxHQUEyQyxDQUM1RCxHQUFRLEVBQ1IsSUFBSSxFQUNKLE9BQU8sRUFDUCxJQUFJLEVBQ0osRUFBRTs7SUFDRixNQUFNLFNBQVMsU0FBRyxHQUFHLENBQUMsYUFBYSxtQ0FBSSxHQUFHLENBQUM7SUFDM0MsSUFBSSxNQUFNLElBQUksU0FBUyxJQUFJLElBQUksSUFBSSxTQUFTLEVBQUU7UUFDNUMsT0FBTyx1QkFBcUIsQ0FDMUIsU0FBUyxFQUNULEVBQUUsRUFBRSxFQUFFLFNBQVMsQ0FBQyxFQUFZLEVBQUUsRUFDOUIsT0FBTyxFQUNQLElBQUksQ0FDTCxDQUFDO0tBQ0g7SUFFRCxPQUFPLFNBQVMsQ0FBQztBQUNuQixDQUFDLENBQUEsQ0FBQztBQUVGLE1BQU0sTUFBTSxHQUFvQyxDQUM5QyxHQUFHLEVBQ0gsSUFBSSxFQUNKLE9BQU8sRUFDUCxJQUFJLEVBQ0osRUFBRTtJQUNGLE9BQU8sQ0FDTCxDQUNFLE1BQU0saUJBQVksQ0FDaEIsR0FBRyxFQUNIO1FBQ0UsS0FBSyxFQUFFO1lBQ0wsVUFBVSxFQUFFLEVBQUUsT0FBTyxFQUFFLEVBQUUsRUFBRSxFQUFFLEdBQUcsQ0FBQyxJQUFJLEVBQUUsRUFBRTtZQUN6QyxVQUFVLEVBQUksR0FBRyxDQUFDLFVBQVU7aUJBQ3pCLEVBQTJCLENBQUMsV0FBVyxFQUFFO1NBQzdDO0tBQ0YsRUFDRCxPQUFPLEVBQ1AsSUFBSSxDQUNMLENBQ0YsQ0FBQyxDQUFDLENBQUMsSUFBSSxJQUFJLENBQ2IsQ0FBQztBQUNKLENBQUMsQ0FBQSxDQUFDO0FBRUYsTUFBTSxVQUFVLEdBQXdDLENBQ3RELEdBQUcsRUFDSCxJQUFJLEVBQ0osT0FBTyxFQUNQLElBQUksRUFDSixFQUFFO0lBQ0YsT0FBTyxDQUNMLE1BQU0scUJBQWdCLENBQ3BCLEdBQUcsRUFDSDtRQUNFLEtBQUssRUFBRTtZQUNMLE9BQU8sRUFBRTtnQkFDUCxFQUFFLEVBQUUsR0FBRyxDQUFDLElBQUk7YUFDYjtTQUNGO0tBQ0YsRUFDRCxPQUFPLEVBQ1AsSUFBSSxDQUNMLENBQ0YsQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUNQLENBQUMsQ0FBQSxDQUFDO0FBRUYsTUFBTSxZQUFZLEdBQTBCO0lBQzFDLFVBQVU7SUFDVixNQUFNO0lBQ04sVUFBVSxFQUFFLGdDQUFpQjtJQUM3QixRQUFRLEVBQUUsZ0NBQWlCO0lBQzNCLGFBQWE7SUFDYixNQUFNLEVBQUUsZ0NBQWlCO0lBQ3pCLEtBQUssRUFBRSxDQUFDLEdBQUcsRUFBRSxFQUFFLENBQUMsNkJBQWtCLENBQUUsR0FBRyxDQUFDLEtBQTZCLENBQUM7Q0FDdkUsQ0FBQztBQUVGLGtCQUFlLFlBQVksQ0FBQyJ9