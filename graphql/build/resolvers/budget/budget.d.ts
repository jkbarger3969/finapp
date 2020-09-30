import { QueryResolvers } from "../../graphTypes";
import { NodeValue } from "../../types";
import { MongoRational } from "../../utils/mongoRational";
export interface Returns {
    id: string;
    owner: NodeValue;
    amount: MongoRational;
    year: number;
}
declare const budget: QueryResolvers["budget"];
export default budget;
