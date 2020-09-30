import { QueryResolvers } from "../../graphTypes";
import { NodeValue } from "../../types";
export interface Returns {
    id: string;
    name: string;
    parent: NodeValue;
}
declare const department: QueryResolvers["department"];
export default department;
