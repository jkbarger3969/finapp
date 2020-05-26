import { MongoOpsMap, OpValueParser, OpsParser } from "./types";
export declare type ComparisonOpsMap = MongoOpsMap<{
    eq: "$eq";
    gt: "$gt";
    gte: "$gte";
    in: "$in";
    lt: "$lt";
    lte: "$lte";
    ne: "$ne";
    nin: "$nin";
}>;
export declare type ComparisonOps = keyof ComparisonOpsMap;
declare const parseComparisonOps: (opValueParser?: OpValueParser<unknown, "lt" | "eq" | "gt" | "gte" | "in" | "lte" | "ne" | "nin">) => OpsParser;
export default parseComparisonOps;
