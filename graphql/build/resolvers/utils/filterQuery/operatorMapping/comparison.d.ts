import { QuerySelector } from "mongodb";
import { MongoOpsMap, QuerySelectorGenerator, OperatorValueTransmutator } from "../querySelector";
export declare type ComparisonMongoOpsMap = MongoOpsMap<MongoComparisonOperators, {
    eq: "$eq";
    gt: "$gt";
    gte: "$gte";
    in: "$in";
    lt: "$lt";
    lte: "$lte";
    ne: "$ne";
    nin: "$nin";
}>;
export declare type ComparisonOperators = keyof ComparisonMongoOpsMap;
export declare type MongoComparisonOperators = keyof Pick<QuerySelector<unknown>, "$eq" | "$gt" | "$gte" | "$in" | "$lt" | "$lte" | "$ne" | "$nin">;
export declare const comparisonOpsMapper: (op: ComparisonOperators) => "$eq" | "$gt" | "$gte" | "$lt" | "$lte" | "$ne" | "$in" | "$nin";
declare const comparisonQueryGenerator: <TOpValue, TReturn>(opValueTransmutator?: OperatorValueTransmutator<TOpValue, TReturn, MongoOpsMap<"$eq" | "$gt" | "$gte" | "$lt" | "$lte" | "$ne" | "$in" | "$nin", {
    eq: "$eq";
    gt: "$gt";
    gte: "$gte";
    in: "$in";
    lt: "$lt";
    lte: "$lte";
    ne: "$ne";
    nin: "$nin";
}>, "eq" | "gt" | "gte" | "in" | "lt" | "lte" | "ne" | "nin">) => QuerySelectorGenerator<string, TOpValue, TReturn>;
export default comparisonQueryGenerator;
