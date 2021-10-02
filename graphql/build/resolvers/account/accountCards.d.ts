import { FilterQuery, Db } from "mongodb";
import { QueryResolvers, AccountCardsWhere } from "../../graphTypes";
export declare const whereAccountCards: (accountCardsWhere: AccountCardsWhere, db: Db) => FilterQuery<unknown> | Promise<FilterQuery<unknown>>;
export declare const accountCards: QueryResolvers["accountCards"];
