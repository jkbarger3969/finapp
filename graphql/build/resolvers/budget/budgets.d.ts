import { Db, Filter as FilterQuery } from "mongodb";
import { QueryResolvers, BudgetsWhere } from "../../graphTypes";
export declare const whereBudgets: (budgetWhere: BudgetsWhere, db: Db) => FilterQuery<unknown> | Promise<FilterQuery<unknown>>;
export declare const budgets: QueryResolvers["budgets"];
