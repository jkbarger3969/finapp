import { Db, FilterQuery } from "mongodb";
import { QueryResolvers, AccountsWhere } from "../../graphTypes";
export declare const whereAccounts: (accountsWhere: AccountsWhere, db: Db) => FilterQuery<unknown> | Promise<FilterQuery<unknown>>;
export declare const accounts: QueryResolvers["accounts"];
