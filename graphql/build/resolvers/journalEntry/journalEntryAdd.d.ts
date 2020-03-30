import { MutationResolvers, RationalInput } from "../../graphTypes";
import { HistoryObject, RootHistoryObject } from "../utils/DocHistory";
import { NodeValue } from "../../types";
export declare type JournalEntryAddInsertDoc = {
    date: [HistoryObject<Date>];
    department: [HistoryObject<NodeValue>];
    type: [HistoryObject<"credit" | "debit">];
    category: [HistoryObject<NodeValue>];
    source: [HistoryObject<NodeValue>];
    total: [HistoryObject<RationalInput>];
    description: [HistoryObject<string>] | [];
    deleted: [HistoryObject<false>];
    reconciled: [HistoryObject<false>];
} & RootHistoryObject;
declare const journalEntryAdd: MutationResolvers["journalEntryAdd"];
export default journalEntryAdd;
