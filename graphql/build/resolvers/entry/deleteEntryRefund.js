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
const deleteEntryRefund = (_, { id }, { dataSources: { accountingDb }, reqDateTime, user }) => accountingDb.withTransaction(() => __awaiter(void 0, void 0, void 0, function* () {
    const refundId = new mongodb_1.ObjectId(id);
    yield entryValidators_1.validateEntry.refundExists({ refund: refundId, accountingDb });
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGVsZXRlRW50cnlSZWZ1bmQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvcmVzb2x2ZXJzL2VudHJ5L2RlbGV0ZUVudHJ5UmVmdW5kLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7OztBQUFBLHFDQUFtQztBQUluQyxvREFBc0U7QUFDdEUsdURBQWtEO0FBRTNDLE1BQU0saUJBQWlCLEdBQTJDLENBQ3ZFLENBQUMsRUFDRCxFQUFFLEVBQUUsRUFBRSxFQUNOLEVBQUUsV0FBVyxFQUFFLEVBQUUsWUFBWSxFQUFFLEVBQUUsV0FBVyxFQUFFLElBQUksRUFBRSxFQUNwRCxFQUFFLENBQ0YsWUFBWSxDQUFDLGVBQWUsQ0FBQyxHQUFTLEVBQUU7SUFDdEMsTUFBTSxRQUFRLEdBQUcsSUFBSSxrQkFBUSxDQUFDLEVBQUUsQ0FBQyxDQUFDO0lBRWxDLE1BQU0sK0JBQWEsQ0FBQyxZQUFZLENBQUMsRUFBRSxNQUFNLEVBQUUsUUFBUSxFQUFFLFlBQVksRUFBRSxDQUFDLENBQUM7SUFFckUsTUFBTSxVQUFVLEdBQUcsSUFBSSx1QkFBVSxDQUFDLEVBQUUsRUFBRSxFQUFFLElBQUksQ0FBQyxFQUFFLEVBQUUsSUFBSSxFQUFFLFdBQVcsRUFBRSxDQUFDLENBQUM7SUFFdEUsTUFBTSxZQUFZLENBQUMsU0FBUyxDQUFDO1FBQzNCLFVBQVUsRUFBRSxTQUFTO1FBQ3JCLE1BQU0sRUFBRTtZQUNOLFlBQVksRUFBRSxRQUFRO1NBQ3ZCO1FBQ0QsTUFBTSxFQUFFLElBQUksZ0NBQW1CLENBQW1DO1lBQ2hFLFVBQVU7WUFDVixTQUFTLEVBQUUsSUFBSTtZQUNmLFdBQVcsRUFBRSxXQUFXO1NBQ3pCLENBQUM7YUFDQyxxQkFBcUIsQ0FBQyxTQUFTLEVBQUUsSUFBSSxDQUFDO2FBQ3RDLE9BQU8sRUFBRTtLQUNiLENBQUMsQ0FBQztJQUVILE9BQU87UUFDTCxrQkFBa0IsRUFBRSxNQUFNLFlBQVk7YUFDbkMsT0FBTyxDQUFDO1lBQ1AsVUFBVSxFQUFFLFNBQVM7WUFDckIsTUFBTSxFQUFFLEVBQUUsWUFBWSxFQUFFLFFBQVEsRUFBRTtZQUNsQyxPQUFPLEVBQUU7Z0JBQ1AsVUFBVSxFQUFFO29CQUNWLE9BQU8sRUFBRSxJQUFJO2lCQUNkO2FBQ0Y7WUFDRCxTQUFTLEVBQUUsSUFBSTtTQUNoQixDQUFDO2FBQ0QsSUFBSSxDQUFDLENBQUMsRUFBRSxPQUFPLEVBQUUsRUFBRSxFQUFFLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxDQUFDLEVBQUUsQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQztLQUN4RSxDQUFDO0FBQ0osQ0FBQyxDQUFBLENBQUMsQ0FBQztBQXhDUSxRQUFBLGlCQUFpQixxQkF3Q3pCIn0=