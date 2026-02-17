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
const deleteEntryRefund = (_, { id }, context) => context.dataSources.accountingDb.withTransaction(() => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d, _e;
    const { dataSources: { accountingDb }, reqDateTime, user, authService, ipAddress, userAgent } = context;
    if (!(user === null || user === void 0 ? void 0 : user.id)) {
        throw new Error("Unauthorized: Please log in");
    }
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGVsZXRlRW50cnlSZWZ1bmQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvcmVzb2x2ZXJzL2VudHJ5L2RlbGV0ZUVudHJ5UmVmdW5kLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7OztBQUFBLHFDQUFtQztBQUluQyxvREFBc0U7QUFDdEUsdURBQWtEO0FBRTNDLE1BQU0saUJBQWlCLEdBQTJDLENBQ3ZFLENBQUMsRUFDRCxFQUFFLEVBQUUsRUFBRSxFQUNOLE9BQU8sRUFDUCxFQUFFLENBQ0YsT0FBTyxDQUFDLFdBQVcsQ0FBQyxZQUFZLENBQUMsZUFBZSxDQUFDLEdBQVMsRUFBRTs7SUFDMUQsTUFBTSxFQUFFLFdBQVcsRUFBRSxFQUFFLFlBQVksRUFBRSxFQUFFLFdBQVcsRUFBRSxJQUFJLEVBQUUsV0FBVyxFQUFFLFNBQVMsRUFBRSxTQUFTLEVBQUUsR0FBRyxPQUFPLENBQUM7SUFFeEcsSUFBSSxDQUFDLENBQUEsSUFBSSxhQUFKLElBQUksdUJBQUosSUFBSSxDQUFFLEVBQUUsQ0FBQSxFQUFFO1FBQ2IsTUFBTSxJQUFJLEtBQUssQ0FBQyw2QkFBNkIsQ0FBQyxDQUFDO0tBQ2hEO0lBRUQsTUFBTSxRQUFRLEdBQUcsSUFBSSxrQkFBUSxDQUFDLEVBQUUsQ0FBQyxDQUFDO0lBRWxDLE1BQU0sK0JBQWEsQ0FBQyxZQUFZLENBQUMsRUFBRSxNQUFNLEVBQUUsUUFBUSxFQUFFLFlBQVksRUFBRSxDQUFDLENBQUM7SUFFckUsK0NBQStDO0lBQy9DLE1BQU0sYUFBYSxHQUFHLE1BQU0sWUFBWSxDQUFDLE9BQU8sQ0FBQztRQUMvQyxVQUFVLEVBQUUsU0FBUztRQUNyQixNQUFNLEVBQUUsRUFBRSxZQUFZLEVBQUUsUUFBUSxFQUFFO1FBQ2xDLE9BQU8sRUFBRTtZQUNQLFVBQVUsRUFBRTtnQkFDVixPQUFPLEVBQUUsSUFBSTthQUNkO1NBQ0Y7S0FDRixDQUFDLENBQUM7SUFDSCxNQUFNLGNBQWMsR0FBRyxNQUFBLGFBQWEsYUFBYixhQUFhLHVCQUFiLGFBQWEsQ0FBRSxPQUFPLDBDQUFFLElBQUksQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUM7SUFFaEYsTUFBTSxVQUFVLEdBQUcsSUFBSSx1QkFBVSxDQUFDLEVBQUUsRUFBRSxFQUFFLElBQUksQ0FBQyxFQUFFLEVBQUUsSUFBSSxFQUFFLFdBQVcsRUFBRSxDQUFDLENBQUM7SUFFdEUsTUFBTSxZQUFZLENBQUMsU0FBUyxDQUFDO1FBQzNCLFVBQVUsRUFBRSxTQUFTO1FBQ3JCLE1BQU0sRUFBRTtZQUNOLFlBQVksRUFBRSxRQUFRO1NBQ3ZCO1FBQ0QsTUFBTSxFQUFFLElBQUksZ0NBQW1CLENBQW1DO1lBQ2hFLFVBQVU7WUFDVixTQUFTLEVBQUUsSUFBSTtZQUNmLFdBQVcsRUFBRSxXQUFXO1NBQ3pCLENBQUM7YUFDQyxxQkFBcUIsQ0FBQyxTQUFTLEVBQUUsSUFBSSxDQUFDO2FBQ3RDLE9BQU8sRUFBRTtLQUNiLENBQUMsQ0FBQztJQUVILGtCQUFrQjtJQUNsQixJQUFJLFdBQVcsRUFBRTtRQUNmLE1BQU0sV0FBVyxDQUFDLFFBQVEsQ0FBQztZQUN6QixNQUFNLEVBQUUsSUFBSSxDQUFDLEVBQUU7WUFDZixNQUFNLEVBQUUsZUFBZTtZQUN2QixZQUFZLEVBQUUsUUFBUTtZQUN0QixVQUFVLEVBQUUsUUFBUTtZQUNwQixPQUFPLEVBQUU7Z0JBQ1AsV0FBVyxFQUFFLENBQUEsTUFBQSxNQUFBLGNBQWMsYUFBZCxjQUFjLHVCQUFkLGNBQWMsQ0FBRSxXQUFXLDBDQUFHLENBQUMsQ0FBQywwQ0FBRSxLQUFLLEtBQUksSUFBSTtnQkFDNUQsS0FBSyxFQUFFLENBQUEsTUFBQSxNQUFBLGNBQWMsYUFBZCxjQUFjLHVCQUFkLGNBQWMsQ0FBRSxLQUFLLDBDQUFHLENBQUMsQ0FBQywwQ0FBRSxLQUFLLEtBQUksSUFBSTthQUNqRDtZQUNELFNBQVM7WUFDVCxTQUFTO1lBQ1QsU0FBUyxFQUFFLElBQUksSUFBSSxFQUFFO1NBQ3RCLENBQUMsQ0FBQztLQUNKO0lBRUQsT0FBTztRQUNMLGtCQUFrQixFQUFFLE1BQU0sWUFBWTthQUNuQyxPQUFPLENBQUM7WUFDUCxVQUFVLEVBQUUsU0FBUztZQUNyQixNQUFNLEVBQUUsRUFBRSxZQUFZLEVBQUUsUUFBUSxFQUFFO1lBQ2xDLE9BQU8sRUFBRTtnQkFDUCxVQUFVLEVBQUU7b0JBQ1YsT0FBTyxFQUFFLElBQUk7aUJBQ2Q7YUFDRjtZQUNELFNBQVMsRUFBRSxJQUFJO1NBQ2hCLENBQUM7YUFDRCxJQUFJLENBQUMsQ0FBQyxFQUFFLE9BQU8sRUFBRSxFQUFFLEVBQUUsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUMsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLENBQUMsRUFBRSxDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDO0tBQ3hFLENBQUM7QUFDSixDQUFDLENBQUEsQ0FBQyxDQUFDO0FBM0VRLFFBQUEsaUJBQWlCLHFCQTJFekIifQ==