import { MutationResolvers, QueryResolvers, JournalEntryResolvers, SubscriptionResolvers } from "../graphTypes";
export declare const journalEntries: QueryResolvers["journalEntries"];
export declare const updateJournalEntry: MutationResolvers["updateJournalEntry"];
export declare const addJournalEntry: MutationResolvers["addJournalEntry"];
export declare const JournalEntry: JournalEntryResolvers;
export declare const journalEntryAdded: SubscriptionResolvers["journalEntryAdded"];
export declare const journalEntryUpdated: SubscriptionResolvers["journalEntryUpdated"];
