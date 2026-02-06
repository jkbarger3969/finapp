import { Filter as FilterQuery, Db } from "mongodb";
import { QueryResolvers, AccountCardsWhere } from "../../graphTypes";
export declare const whereAccountCards: (accountCardsWhere: AccountCardsWhere, db: Db) => FilterQuery<any> | Promise<FilterQuery<any>>;
export declare const accountCards: QueryResolvers["accountCards"];
export declare const createAccountCard: any;
export declare const updateAccountCard: any;
export declare const deleteAccountCard: any;
