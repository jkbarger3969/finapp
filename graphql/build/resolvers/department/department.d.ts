import { QueryResolvers } from "../../graphTypes";
import { NodeValue } from "../../types";
export interface Returns {
    id: string;
    name: string;
    parent: NodeValue;
}
export declare const department: QueryResolvers["department"];
