"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const pubSubs_1 = require("./pubSubs");
const journalEntryUpserted = {
    subscribe: (_, __, { pubSub }) => pubSub.asyncIterator(pubSubs_1.JOURNAL_ENTRY_UPSERTED),
};
exports.default = journalEntryUpserted;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiam91cm5hbEVudHJ5VXBzZXJ0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvcmVzb2x2ZXJzL2pvdXJuYWxFbnRyeS9qb3VybmFsRW50cnlVcHNlcnRlZC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUNBLHVDQUFtRDtBQUVuRCxNQUFNLG9CQUFvQixHQUFrRDtJQUMxRSxTQUFTLEVBQUUsQ0FBQyxDQUFDLEVBQUUsRUFBRSxFQUFFLEVBQUUsTUFBTSxFQUFFLEVBQUUsRUFBRSxDQUMvQixNQUFNLENBQUMsYUFBYSxDQUFDLGdDQUFzQixDQUFDO0NBQy9DLENBQUM7QUFFRixrQkFBZSxvQkFBb0IsQ0FBQyJ9