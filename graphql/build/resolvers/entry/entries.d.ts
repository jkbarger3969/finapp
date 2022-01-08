import { Db, Filter as FilterQuery } from "mongodb";
import { QueryResolvers, EntriesWhere, EntryRefundsWhere, EntryItemsWhere } from "../../graphTypes";
export declare const whereEntryRefunds: (entryRefundsWhere: EntryRefundsWhere, db: Db, filterQuery?: FilterQuery<any>) => FilterQuery<any> | Promise<FilterQuery<any>>;
export declare const whereEntryItems: (itemRefundsWhere: EntryItemsWhere, db: Db, filterQuery?: FilterQuery<any>) => FilterQuery<any> | Promise<FilterQuery<any>>;
export declare const whereEntries: (entriesWhere: EntriesWhere, db: Db, { excludeWhereRefunds, }?: {
    excludeWhereRefunds?: boolean;
}) => FilterQuery<any> | Promise<FilterQuery<any>>;
export declare const entries: QueryResolvers["entries"];
