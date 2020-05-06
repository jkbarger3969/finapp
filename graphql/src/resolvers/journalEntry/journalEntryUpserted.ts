import { SubscriptionResolvers } from "../../graphTypes";
import { JOURNAL_ENTRY_UPSERTED } from "./pubSubs";

const journalEntryUpserted: SubscriptionResolvers["journalEntryUpserted"] = {
  subscribe: (_, __, { pubSub }) =>
    pubSub.asyncIterator(JOURNAL_ENTRY_UPSERTED),
};

export default journalEntryUpserted;
