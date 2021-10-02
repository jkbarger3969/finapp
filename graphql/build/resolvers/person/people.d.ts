import { FilterQuery } from "mongodb";
import { QueryResolvers, PeopleWhere } from "../../graphTypes";
export declare const wherePeople: (peopleWhere: PeopleWhere) => FilterQuery<unknown>;
export declare const people: QueryResolvers["people"];
