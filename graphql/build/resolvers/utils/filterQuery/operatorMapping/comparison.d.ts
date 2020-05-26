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
declare const comparisonQueryGenerator: <TOpValue, TReturn>(opValueTransmutator?: OperatorValueTransmutator<TOpValue, TReturn, MongoOpsMap<"$eq" | "$gt" | "$gte" | "$in" | "$lt" | "$lte" | "$ne" | "$nin", {
    eq: "$eq";
    gt: "$gt";
    gte: "$gte";
    in: "$in";
    lt: "$lt";
    lte: "$lte";
    ne: "$ne";
    nin: "$nin";
}>, "lt" | "eq" | "gt" | "gte" | "in" | "lte" | "ne" | "nin">) => QuerySelectorGenerator<string, TOpValue, TReturn>;
export default comparisonQueryGenerator;
