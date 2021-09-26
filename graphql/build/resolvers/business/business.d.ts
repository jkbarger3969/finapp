import { QueryResolvers } from "../../graphTypes";
import { NodeValue } from "../../types";
export interface Returns {
    id: string;
    name: string;
    budget?: NodeValue;
    vendor?: {
        approved: boolean;
        vendorId: string;
    };
}
export declare const business: QueryResolvers["business"];
