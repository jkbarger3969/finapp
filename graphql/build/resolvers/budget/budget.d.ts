import { QueryResolvers } from "../../graphTypes";
import { NodeValue } from "../../types";
import { Rational } from "../../utils/mongoRational";
export interface Returns {
    id: string;
    owner: NodeValue;
    amount: Rational;
    year: number;
}
export declare const budget: QueryResolvers["budget"];
