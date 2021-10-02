import { QuerySelector } from "mongodb";
export interface ComparisonOperators {
    eq?: any;
    gt?: any;
    gte?: any;
    in?: any[];
    lt?: any;
    lte?: any;
    ne?: any;
    nin?: any[];
}
export declare type OperatorValueTransformer<T = any> = (val: T) => any | Promise<any>;
declare const mapComparisonOperators: (comparisonOperators: ComparisonOperators, operatorValueTransformer?: OperatorValueTransformer) => Promise<Partial<Pick<QuerySelector<any>, "$eq" | "$gt" | "$gte" | "$lt" | "$lte" | "$ne" | "$in" | "$nin">>>;
export default mapComparisonOperators;
