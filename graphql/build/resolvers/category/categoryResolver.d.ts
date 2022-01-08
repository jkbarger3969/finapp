import { CategoryResolvers } from "../../graphTypes";
import { CategoryDbRecord, EntryTypeDbRecord, FindOneOptions } from "../../dataSources/accountingDb/types";
import { AccountingDb } from "../../dataSources/accountingDb/accountingDb";
/**
 * Lookup Category ancestors by passing parent.
 */
export declare const categoryAncestorPath: ({ accountingDb, fromCategory, options, }: {
    accountingDb: AccountingDb;
    fromCategory?: CategoryDbRecord["parent"];
    options?: FindOneOptions<"categories">;
}) => AsyncGenerator<import("mongodb").WithId<CategoryDbRecord>, void, unknown>;
/**
 * Look up category type
 */ export declare const categoryType: ({ accountingDb, category, }: {
    accountingDb: AccountingDb;
    category: CategoryDbRecord["_id"];
}) => Promise<EntryTypeDbRecord>;
export declare const Category: CategoryResolvers;
