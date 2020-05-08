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
const mongodb_1 = require("mongodb");
const DocHistory_1 = require("../utils/DocHistory");
const standIns_1 = require("../utils/standIns");
const journalEntry_1 = require("./journalEntry");
const pubSubs_1 = require("./pubSubs");
const journalEntryDeleteRefund = (obj, args, context, info) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = args;
    const { db, user, pubSub } = context;
    const collection = db.collection("journalEntries");
    const refundId = new mongodb_1.ObjectID(id);
    const [entryState] = (yield collection
        .aggregate([
        { $match: { "refunds.id": refundId } },
        { $project: { refunds: true } },
        { $unwind: "$refunds" },
        { $match: { "refunds.id": refundId } },
        {
            $project: {
                entryId: "$_id",
                deleted: DocHistory_1.default.getPresentValueExpression("refunds.deleted", {
                    defaultValue: false,
                }),
            },
        },
    ])
        .toArray());
    if (!entryState) {
        throw new Error(`Refund "${id} does not exists.`);
    }
    else if (entryState.deleted) {
        throw new Error(`Refund is already deleted.`);
    }
    const entryId = entryState.entryId;
    const docHistory = new DocHistory_1.default({ node: standIns_1.userNodeType, id: user.id });
    const updateBuilder = docHistory
        .updateHistoricalDoc("refunds.$[refund]")
        .updateField("deleted", true);
    const { modifiedCount } = yield collection.updateOne({ _id: entryId }, updateBuilder.update(), {
        arrayFilters: [{ "refund.id": refundId }],
    });
    if (modifiedCount === 0) {
        throw new Error(`Failed to delete refund: "${JSON.stringify(args)}".`);
    }
    const result = yield journalEntry_1.default(obj, { id: entryId.toHexString() }, context, info);
    pubSub
        .publish(pubSubs_1.JOURNAL_ENTRY_UPSERTED, { journalEntryUpserted: result })
        .catch((error) => console.error(error));
    return result;
});
exports.default = journalEntryDeleteRefund;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiam91cm5hbEVudHJ5RGVsZXRlUmVmdW5kLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL3Jlc29sdmVycy9qb3VybmFsRW50cnkvam91cm5hbEVudHJ5RGVsZXRlUmVmdW5kLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7O0FBQ0EscUNBQW1DO0FBQ25DLG9EQUE2QztBQUM3QyxnREFBaUQ7QUFDakQsaURBQTBDO0FBQzFDLHVDQUFtRDtBQUVuRCxNQUFNLHdCQUF3QixHQUFrRCxDQUM5RSxHQUFHLEVBQ0gsSUFBSSxFQUNKLE9BQU8sRUFDUCxJQUFJLEVBQ0osRUFBRTtJQUNGLE1BQU0sRUFBRSxFQUFFLEVBQUUsR0FBRyxJQUFJLENBQUM7SUFDcEIsTUFBTSxFQUFFLEVBQUUsRUFBRSxJQUFJLEVBQUUsTUFBTSxFQUFFLEdBQUcsT0FBTyxDQUFDO0lBRXJDLE1BQU0sVUFBVSxHQUFHLEVBQUUsQ0FBQyxVQUFVLENBQUMsZ0JBQWdCLENBQUMsQ0FBQztJQUVuRCxNQUFNLFFBQVEsR0FBRyxJQUFJLGtCQUFRLENBQUMsRUFBRSxDQUFDLENBQUM7SUFFbEMsTUFBTSxDQUFDLFVBQVUsQ0FBQyxHQUFHLENBQUMsTUFBTSxVQUFVO1NBQ25DLFNBQVMsQ0FBQztRQUNULEVBQUUsTUFBTSxFQUFFLEVBQUUsWUFBWSxFQUFFLFFBQVEsRUFBRSxFQUFFO1FBQ3RDLEVBQUUsUUFBUSxFQUFFLEVBQUUsT0FBTyxFQUFFLElBQUksRUFBRSxFQUFFO1FBQy9CLEVBQUUsT0FBTyxFQUFFLFVBQVUsRUFBRTtRQUN2QixFQUFFLE1BQU0sRUFBRSxFQUFFLFlBQVksRUFBRSxRQUFRLEVBQUUsRUFBRTtRQUN0QztZQUNFLFFBQVEsRUFBRTtnQkFDUixPQUFPLEVBQUUsTUFBTTtnQkFDZixPQUFPLEVBQUUsb0JBQVUsQ0FBQyx5QkFBeUIsQ0FBQyxpQkFBaUIsRUFBRTtvQkFDL0QsWUFBWSxFQUFFLEtBQUs7aUJBQ3BCLENBQUM7YUFDSDtTQUNGO0tBQ0YsQ0FBQztTQUNELE9BQU8sRUFBRSxDQUE4QyxDQUFDO0lBRTNELElBQUksQ0FBQyxVQUFVLEVBQUU7UUFDZixNQUFNLElBQUksS0FBSyxDQUFDLFdBQVcsRUFBRSxtQkFBbUIsQ0FBQyxDQUFDO0tBQ25EO1NBQU0sSUFBSSxVQUFVLENBQUMsT0FBTyxFQUFFO1FBQzdCLE1BQU0sSUFBSSxLQUFLLENBQUMsNEJBQTRCLENBQUMsQ0FBQztLQUMvQztJQUVELE1BQU0sT0FBTyxHQUFHLFVBQVUsQ0FBQyxPQUFPLENBQUM7SUFFbkMsTUFBTSxVQUFVLEdBQUcsSUFBSSxvQkFBVSxDQUFDLEVBQUUsSUFBSSxFQUFFLHVCQUFZLEVBQUUsRUFBRSxFQUFFLElBQUksQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDO0lBRXZFLE1BQU0sYUFBYSxHQUFHLFVBQVU7U0FDN0IsbUJBQW1CLENBQUMsbUJBQW1CLENBQUM7U0FDeEMsV0FBVyxDQUFDLFNBQVMsRUFBRSxJQUFJLENBQUMsQ0FBQztJQUVoQyxNQUFNLEVBQUUsYUFBYSxFQUFFLEdBQUcsTUFBTSxVQUFVLENBQUMsU0FBUyxDQUNsRCxFQUFFLEdBQUcsRUFBRSxPQUFPLEVBQUUsRUFDaEIsYUFBYSxDQUFDLE1BQU0sRUFBRSxFQUN0QjtRQUNFLFlBQVksRUFBRSxDQUFDLEVBQUUsV0FBVyxFQUFFLFFBQVEsRUFBRSxDQUFDO0tBQzFDLENBQ0YsQ0FBQztJQUVGLElBQUksYUFBYSxLQUFLLENBQUMsRUFBRTtRQUN2QixNQUFNLElBQUksS0FBSyxDQUFDLDZCQUE2QixJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztLQUN4RTtJQUVELE1BQU0sTUFBTSxHQUFHLE1BQU0sc0JBQVksQ0FDL0IsR0FBRyxFQUNILEVBQUUsRUFBRSxFQUFFLE9BQU8sQ0FBQyxXQUFXLEVBQUUsRUFBRSxFQUM3QixPQUFPLEVBQ1AsSUFBSSxDQUNMLENBQUM7SUFFRixNQUFNO1NBQ0gsT0FBTyxDQUFDLGdDQUFzQixFQUFFLEVBQUUsb0JBQW9CLEVBQUUsTUFBTSxFQUFFLENBQUM7U0FDakUsS0FBSyxDQUFDLENBQUMsS0FBSyxFQUFFLEVBQUUsQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUM7SUFFMUMsT0FBTyxNQUFNLENBQUM7QUFDaEIsQ0FBQyxDQUFBLENBQUM7QUFFRixrQkFBZSx3QkFBd0IsQ0FBQyJ9