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
exports.deleteEntryRefund = void 0;
const mongodb_1 = require("mongodb");
const DocHistory_1 = require("../utils/DocHistory");
const entryValidators_1 = require("./entryValidators");
const deleteEntryRefund = (_, { id }, { dataSources: { accountingDb }, reqDateTime, user, authService, ipAddress, userAgent }) => accountingDb.withTransaction(() => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d, _e;
    const refundId = new mongodb_1.ObjectId(id);
    yield entryValidators_1.validateEntry.refundExists({ refund: refundId, accountingDb });
    // Get refund details before deletion for audit
    const existingEntry = yield accountingDb.findOne({
        collection: "entries",
        filter: { "refunds.id": refundId },
        options: {
            projection: {
                refunds: true,
            },
        },
    });
    const existingRefund = (_a = existingEntry === null || existingEntry === void 0 ? void 0 : existingEntry.refunds) === null || _a === void 0 ? void 0 : _a.find(r => r.id.equals(refundId));
    const docHistory = new DocHistory_1.DocHistory({ by: user.id, date: reqDateTime });
    yield accountingDb.updateOne({
        collection: "entries",
        filter: {
            "refunds.id": refundId,
        },
        update: new DocHistory_1.UpdateHistoricalDoc({
            docHistory,
            isRootDoc: true,
            fieldPrefix: "refunds.$",
        })
            .updateHistoricalField("deleted", true)
            .valueOf(),
    });
    // Log audit entry
    if (authService) {
        yield authService.logAudit({
            userId: user.id,
            action: "REFUND_DELETE",
            resourceType: "Refund",
            resourceId: refundId,
            details: {
                description: ((_c = (_b = existingRefund === null || existingRefund === void 0 ? void 0 : existingRefund.description) === null || _b === void 0 ? void 0 : _b[0]) === null || _c === void 0 ? void 0 : _c.value) || null,
                total: ((_e = (_d = existingRefund === null || existingRefund === void 0 ? void 0 : existingRefund.total) === null || _d === void 0 ? void 0 : _d[0]) === null || _e === void 0 ? void 0 : _e.value) || null,
            },
            ipAddress,
            userAgent,
            timestamp: new Date(),
        });
    }
    return {
        deletedEntryRefund: yield accountingDb
            .findOne({
            collection: "entries",
            filter: { "refunds.id": refundId },
            options: {
                projection: {
                    refunds: true,
                },
            },
            skipCache: true,
        })
            .then(({ refunds }) => refunds.find(({ id }) => id.equals(refundId))),
    };
}));
exports.deleteEntryRefund = deleteEntryRefund;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGVsZXRlRW50cnlSZWZ1bmQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvcmVzb2x2ZXJzL2VudHJ5L2RlbGV0ZUVudHJ5UmVmdW5kLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7OztBQUFBLHFDQUFtQztBQUluQyxvREFBc0U7QUFDdEUsdURBQWtEO0FBRTNDLE1BQU0saUJBQWlCLEdBQTJDLENBQ3ZFLENBQUMsRUFDRCxFQUFFLEVBQUUsRUFBRSxFQUNOLEVBQUUsV0FBVyxFQUFFLEVBQUUsWUFBWSxFQUFFLEVBQUUsV0FBVyxFQUFFLElBQUksRUFBRSxXQUFXLEVBQUUsU0FBUyxFQUFFLFNBQVMsRUFBRSxFQUN2RixFQUFFLENBQ0YsWUFBWSxDQUFDLGVBQWUsQ0FBQyxHQUFTLEVBQUU7O0lBQ3RDLE1BQU0sUUFBUSxHQUFHLElBQUksa0JBQVEsQ0FBQyxFQUFFLENBQUMsQ0FBQztJQUVsQyxNQUFNLCtCQUFhLENBQUMsWUFBWSxDQUFDLEVBQUUsTUFBTSxFQUFFLFFBQVEsRUFBRSxZQUFZLEVBQUUsQ0FBQyxDQUFDO0lBRXJFLCtDQUErQztJQUMvQyxNQUFNLGFBQWEsR0FBRyxNQUFNLFlBQVksQ0FBQyxPQUFPLENBQUM7UUFDL0MsVUFBVSxFQUFFLFNBQVM7UUFDckIsTUFBTSxFQUFFLEVBQUUsWUFBWSxFQUFFLFFBQVEsRUFBRTtRQUNsQyxPQUFPLEVBQUU7WUFDUCxVQUFVLEVBQUU7Z0JBQ1YsT0FBTyxFQUFFLElBQUk7YUFDZDtTQUNGO0tBQ0YsQ0FBQyxDQUFDO0lBQ0gsTUFBTSxjQUFjLEdBQUcsTUFBQSxhQUFhLGFBQWIsYUFBYSx1QkFBYixhQUFhLENBQUUsT0FBTywwQ0FBRSxJQUFJLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDO0lBRWhGLE1BQU0sVUFBVSxHQUFHLElBQUksdUJBQVUsQ0FBQyxFQUFFLEVBQUUsRUFBRSxJQUFJLENBQUMsRUFBRSxFQUFFLElBQUksRUFBRSxXQUFXLEVBQUUsQ0FBQyxDQUFDO0lBRXRFLE1BQU0sWUFBWSxDQUFDLFNBQVMsQ0FBQztRQUMzQixVQUFVLEVBQUUsU0FBUztRQUNyQixNQUFNLEVBQUU7WUFDTixZQUFZLEVBQUUsUUFBUTtTQUN2QjtRQUNELE1BQU0sRUFBRSxJQUFJLGdDQUFtQixDQUFtQztZQUNoRSxVQUFVO1lBQ1YsU0FBUyxFQUFFLElBQUk7WUFDZixXQUFXLEVBQUUsV0FBVztTQUN6QixDQUFDO2FBQ0MscUJBQXFCLENBQUMsU0FBUyxFQUFFLElBQUksQ0FBQzthQUN0QyxPQUFPLEVBQUU7S0FDYixDQUFDLENBQUM7SUFFSCxrQkFBa0I7SUFDbEIsSUFBSSxXQUFXLEVBQUU7UUFDZixNQUFNLFdBQVcsQ0FBQyxRQUFRLENBQUM7WUFDekIsTUFBTSxFQUFFLElBQUksQ0FBQyxFQUFFO1lBQ2YsTUFBTSxFQUFFLGVBQWU7WUFDdkIsWUFBWSxFQUFFLFFBQVE7WUFDdEIsVUFBVSxFQUFFLFFBQVE7WUFDcEIsT0FBTyxFQUFFO2dCQUNQLFdBQVcsRUFBRSxDQUFBLE1BQUEsTUFBQSxjQUFjLGFBQWQsY0FBYyx1QkFBZCxjQUFjLENBQUUsV0FBVywwQ0FBRyxDQUFDLENBQUMsMENBQUUsS0FBSyxLQUFJLElBQUk7Z0JBQzVELEtBQUssRUFBRSxDQUFBLE1BQUEsTUFBQSxjQUFjLGFBQWQsY0FBYyx1QkFBZCxjQUFjLENBQUUsS0FBSywwQ0FBRyxDQUFDLENBQUMsMENBQUUsS0FBSyxLQUFJLElBQUk7YUFDakQ7WUFDRCxTQUFTO1lBQ1QsU0FBUztZQUNULFNBQVMsRUFBRSxJQUFJLElBQUksRUFBRTtTQUN0QixDQUFDLENBQUM7S0FDSjtJQUVELE9BQU87UUFDTCxrQkFBa0IsRUFBRSxNQUFNLFlBQVk7YUFDbkMsT0FBTyxDQUFDO1lBQ1AsVUFBVSxFQUFFLFNBQVM7WUFDckIsTUFBTSxFQUFFLEVBQUUsWUFBWSxFQUFFLFFBQVEsRUFBRTtZQUNsQyxPQUFPLEVBQUU7Z0JBQ1AsVUFBVSxFQUFFO29CQUNWLE9BQU8sRUFBRSxJQUFJO2lCQUNkO2FBQ0Y7WUFDRCxTQUFTLEVBQUUsSUFBSTtTQUNoQixDQUFDO2FBQ0QsSUFBSSxDQUFDLENBQUMsRUFBRSxPQUFPLEVBQUUsRUFBRSxFQUFFLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxDQUFDLEVBQUUsQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQztLQUN4RSxDQUFDO0FBQ0osQ0FBQyxDQUFBLENBQUMsQ0FBQztBQXJFUSxRQUFBLGlCQUFpQixxQkFxRXpCIn0=