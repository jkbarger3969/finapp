import { Db, Filter as FilterQuery } from "mongodb";
import { QueryResolvers, AccountsWhere } from "../../graphTypes";
export declare const whereAccounts: (accountsWhere: AccountsWhere, db: Db) => FilterQuery<any> | Promise<FilterQuery<any>>;
export declare const accounts: QueryResolvers["accounts"];
