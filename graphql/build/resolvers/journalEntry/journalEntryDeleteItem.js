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
const journalEntryDeleteItem = (obj, args, context, info) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = args;
    const { db, user, pubSub } = context;
    const collection = db.collection("journalEntries");
    const itemId = new mongodb_1.ObjectId(id);
    const [entryState] = (yield collection
        .aggregate([
        { $match: { "items.id": itemId } },
        { $project: { items: true } },
        { $unwind: "$items" },
        { $match: { "items.id": itemId } },
        {
            $project: {
                entryId: "$_id",
                deleted: DocHistory_1.default.getPresentValueExpression("items.deleted", {
                    defaultValue: false,
                }),
            },
        },
    ])
        .toArray());
    if (!entryState) {
        throw new Error(`Item "${id} does not exists.`);
    }
    else if (entryState.deleted) {
        throw new Error(`Item is already deleted.`);
    }
    const entryId = entryState.entryId;
    const docHistory = new DocHistory_1.default({ node: standIns_1.userNodeType, id: user.id });
    const updateBuilder = docHistory
        .updateHistoricalDoc("items.$[item]")
        .updateField("deleted", true);
    const { modifiedCount } = yield collection.updateOne({ _id: entryId }, updateBuilder.update(), {
        arrayFilters: [{ "item.id": itemId }],
    });
    if (modifiedCount === 0) {
        throw new Error(`Failed to delete item: "${JSON.stringify(args)}".`);
    }
    const result = yield (() => __awaiter(void 0, void 0, void 0, function* () {
        var _a, _b;
        const result = {};
        result.journalEntry = (yield journalEntry_1.default(obj, { id: entryId.toHexString() }, context, info));
        const itemIdStr = itemId.toHexString();
        result.journalEntryItem = (_b = (_a = result.journalEntry) === null || _a === void 0 ? void 0 : _a.items, (_b !== null && _b !== void 0 ? _b : [])).find((item) => item.id === itemIdStr);
        return result;
    }))();
    pubSub
        .publish(pubSubs_1.JOURNAL_ENTRY_UPSERTED, {
        journalEntryUpserted: result.journalEntry,
    })
        .catch((error) => console.error(error));
    return result;
});
exports.default = journalEntryDeleteItem;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiam91cm5hbEVudHJ5RGVsZXRlSXRlbS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9yZXNvbHZlcnMvam91cm5hbEVudHJ5L2pvdXJuYWxFbnRyeURlbGV0ZUl0ZW0udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7QUFLQSxxQ0FBbUM7QUFDbkMsb0RBQTZDO0FBQzdDLGdEQUFpRDtBQUNqRCxpREFBMEM7QUFDMUMsdUNBQW1EO0FBRW5ELE1BQU0sc0JBQXNCLEdBQWdELENBQzFFLEdBQUcsRUFDSCxJQUFJLEVBQ0osT0FBTyxFQUNQLElBQUksRUFDSixFQUFFO0lBQ0YsTUFBTSxFQUFFLEVBQUUsRUFBRSxHQUFHLElBQUksQ0FBQztJQUNwQixNQUFNLEVBQUUsRUFBRSxFQUFFLElBQUksRUFBRSxNQUFNLEVBQUUsR0FBRyxPQUFPLENBQUM7SUFFckMsTUFBTSxVQUFVLEdBQUcsRUFBRSxDQUFDLFVBQVUsQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDO0lBRW5ELE1BQU0sTUFBTSxHQUFHLElBQUksa0JBQVEsQ0FBQyxFQUFFLENBQUMsQ0FBQztJQUVoQyxNQUFNLENBQUMsVUFBVSxDQUFDLEdBQUcsQ0FBQyxNQUFNLFVBQVU7U0FDbkMsU0FBUyxDQUFDO1FBQ1QsRUFBRSxNQUFNLEVBQUUsRUFBRSxVQUFVLEVBQUUsTUFBTSxFQUFFLEVBQUU7UUFDbEMsRUFBRSxRQUFRLEVBQUUsRUFBRSxLQUFLLEVBQUUsSUFBSSxFQUFFLEVBQUU7UUFDN0IsRUFBRSxPQUFPLEVBQUUsUUFBUSxFQUFFO1FBQ3JCLEVBQUUsTUFBTSxFQUFFLEVBQUUsVUFBVSxFQUFFLE1BQU0sRUFBRSxFQUFFO1FBQ2xDO1lBQ0UsUUFBUSxFQUFFO2dCQUNSLE9BQU8sRUFBRSxNQUFNO2dCQUNmLE9BQU8sRUFBRSxvQkFBVSxDQUFDLHlCQUF5QixDQUFDLGVBQWUsRUFBRTtvQkFDN0QsWUFBWSxFQUFFLEtBQUs7aUJBQ3BCLENBQUM7YUFDSDtTQUNGO0tBQ0YsQ0FBQztTQUNELE9BQU8sRUFBRSxDQUE4QyxDQUFDO0lBRTNELElBQUksQ0FBQyxVQUFVLEVBQUU7UUFDZixNQUFNLElBQUksS0FBSyxDQUFDLFNBQVMsRUFBRSxtQkFBbUIsQ0FBQyxDQUFDO0tBQ2pEO1NBQU0sSUFBSSxVQUFVLENBQUMsT0FBTyxFQUFFO1FBQzdCLE1BQU0sSUFBSSxLQUFLLENBQUMsMEJBQTBCLENBQUMsQ0FBQztLQUM3QztJQUVELE1BQU0sT0FBTyxHQUFHLFVBQVUsQ0FBQyxPQUFPLENBQUM7SUFFbkMsTUFBTSxVQUFVLEdBQUcsSUFBSSxvQkFBVSxDQUFDLEVBQUUsSUFBSSxFQUFFLHVCQUFZLEVBQUUsRUFBRSxFQUFFLElBQUksQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDO0lBRXZFLE1BQU0sYUFBYSxHQUFHLFVBQVU7U0FDN0IsbUJBQW1CLENBQUMsZUFBZSxDQUFDO1NBQ3BDLFdBQVcsQ0FBQyxTQUFTLEVBQUUsSUFBSSxDQUFDLENBQUM7SUFFaEMsTUFBTSxFQUFFLGFBQWEsRUFBRSxHQUFHLE1BQU0sVUFBVSxDQUFDLFNBQVMsQ0FDbEQsRUFBRSxHQUFHLEVBQUUsT0FBTyxFQUFFLEVBQ2hCLGFBQWEsQ0FBQyxNQUFNLEVBQUUsRUFDdEI7UUFDRSxZQUFZLEVBQUUsQ0FBQyxFQUFFLFNBQVMsRUFBRSxNQUFNLEVBQUUsQ0FBQztLQUN0QyxDQUNGLENBQUM7SUFFRixJQUFJLGFBQWEsS0FBSyxDQUFDLEVBQUU7UUFDdkIsTUFBTSxJQUFJLEtBQUssQ0FBQywyQkFBMkIsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7S0FDdEU7SUFFRCxNQUFNLE1BQU0sR0FBRyxNQUFNLENBQUMsR0FBUyxFQUFFOztRQUMvQixNQUFNLE1BQU0sR0FBRyxFQUFrQyxDQUFDO1FBRWxELE1BQU0sQ0FBQyxZQUFZLEdBQUcsQ0FBQyxNQUFNLHNCQUFZLENBQ3ZDLEdBQUcsRUFDSCxFQUFFLEVBQUUsRUFBRSxPQUFPLENBQUMsV0FBVyxFQUFFLEVBQUUsRUFDN0IsT0FBTyxFQUNQLElBQUksQ0FDTCxDQUFpQixDQUFDO1FBRW5CLE1BQU0sU0FBUyxHQUFHLE1BQU0sQ0FBQyxXQUFXLEVBQUUsQ0FBQztRQUV2QyxNQUFNLENBQUMsZ0JBQWdCLEdBQUcsWUFBQyxNQUFNLENBQUMsWUFBWSwwQ0FBRSxLQUFLLHVDQUFJLEVBQUUsRUFBQyxDQUFDLElBQUksQ0FDL0QsQ0FBQyxJQUFJLEVBQUUsRUFBRSxDQUFDLElBQUksQ0FBQyxFQUFFLEtBQUssU0FBUyxDQUNoQyxDQUFDO1FBRUYsT0FBTyxNQUFNLENBQUM7SUFDaEIsQ0FBQyxDQUFBLENBQUMsRUFBRSxDQUFDO0lBRUwsTUFBTTtTQUNILE9BQU8sQ0FBQyxnQ0FBc0IsRUFBRTtRQUMvQixvQkFBb0IsRUFBRSxNQUFNLENBQUMsWUFBWTtLQUMxQyxDQUFDO1NBQ0QsS0FBSyxDQUFDLENBQUMsS0FBSyxFQUFFLEVBQUUsQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUM7SUFFMUMsT0FBTyxNQUFNLENBQUM7QUFDaEIsQ0FBQyxDQUFBLENBQUM7QUFFRixrQkFBZSxzQkFBc0IsQ0FBQyJ9