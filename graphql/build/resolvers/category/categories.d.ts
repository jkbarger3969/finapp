import { FilterQuery, Db } from "mongodb";
import { QueryResolvers, CategoriesWhere } from "../../graphTypes";
export declare const whereCategories: (categoryWhere: CategoriesWhere, db: Db) => Promise<FilterQuery<unknown>> | FilterQuery<unknown>;
export declare const categories: QueryResolvers["categories"];
