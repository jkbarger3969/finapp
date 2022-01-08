import { Filter as FilterQuery } from "mongodb";
import { QueryResolvers, BusinessesWhere } from "../../graphTypes";
import { Returns as BusinessReturns } from "./business";
export declare type Returns = BusinessReturns[];
export declare const whereBusiness: (businessWhere: BusinessesWhere) => FilterQuery<unknown>;
export declare const businesses: QueryResolvers["businesses"];
