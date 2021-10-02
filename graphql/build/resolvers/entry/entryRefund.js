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
exports.entryRefund = void 0;
const mongodb_1 = require("mongodb");
const entryRefund = (_, { id }, { dataSources: { accountingDb } }) => __awaiter(void 0, void 0, void 0, function* () {
    const refundId = new mongodb_1.ObjectId(id);
    const results = yield accountingDb.findOne({
        collection: "entries",
        filter: {
            "refunds.id": refundId,
        },
        options: {
            projection: {
                refunds: true,
            },
        },
    });
    return ((results === null || results === void 0 ? void 0 : results.refunds) || []).find(({ id }) => refundId.equals(id)) || null;
});
exports.entryRefund = entryRefund;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZW50cnlSZWZ1bmQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvcmVzb2x2ZXJzL2VudHJ5L2VudHJ5UmVmdW5kLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7OztBQUFBLHFDQUFtQztBQUk1QixNQUFNLFdBQVcsR0FBa0MsQ0FDeEQsQ0FBQyxFQUNELEVBQUUsRUFBRSxFQUFFLEVBQ04sRUFBRSxXQUFXLEVBQUUsRUFBRSxZQUFZLEVBQUUsRUFBRSxFQUNqQyxFQUFFO0lBQ0YsTUFBTSxRQUFRLEdBQUcsSUFBSSxrQkFBUSxDQUFDLEVBQUUsQ0FBQyxDQUFDO0lBRWxDLE1BQU0sT0FBTyxHQUFHLE1BQU0sWUFBWSxDQUFDLE9BQU8sQ0FBQztRQUN6QyxVQUFVLEVBQUUsU0FBUztRQUNyQixNQUFNLEVBQUU7WUFDTixZQUFZLEVBQUUsUUFBUTtTQUN2QjtRQUNELE9BQU8sRUFBRTtZQUNQLFVBQVUsRUFBRTtnQkFDVixPQUFPLEVBQUUsSUFBSTthQUNkO1NBQ0Y7S0FDRixDQUFDLENBQUM7SUFFSCxPQUFPLENBQUMsQ0FBQSxPQUFPLGFBQVAsT0FBTyx1QkFBUCxPQUFPLENBQUUsT0FBTyxLQUFJLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxDQUFDLFFBQVEsQ0FBQyxNQUFNLENBQUMsRUFBRSxDQUFDLENBQUMsSUFBSSxJQUFJLENBQUM7QUFDaEYsQ0FBQyxDQUFBLENBQUM7QUFwQlcsUUFBQSxXQUFXLGVBb0J0QiJ9