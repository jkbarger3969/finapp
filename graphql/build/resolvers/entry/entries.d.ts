import { Db, FilterQuery } from "mongodb";
import { QueryResolvers, EntriesWhere, EntryRefundsWhere, EntryItemsWhere } from "../../graphTypes";
export declare const whereEntryRefunds: (entryRefundsWhere: EntryRefundsWhere, db: Db, filterQuery?: FilterQuery<unknown>) => FilterQuery<unknown> | Promise<FilterQuery<unknown>>;
export declare const whereEntryItems: (itemRefundsWhere: EntryItemsWhere, db: Db, filterQuery?: FilterQuery<unknown>) => FilterQuery<unknown> | Promise<FilterQuery<unknown>>;
export declare const whereEntries: (entriesWhere: EntriesWhere, db: Db, { excludeWhereRefunds, }?: {
    excludeWhereRefunds?: boolean;
}) => FilterQuery<unknown> | Promise<FilterQuery<unknown>>;
export declare const entries: QueryResolvers["entries"];
