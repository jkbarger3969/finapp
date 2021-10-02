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
declare const parseComparisonOps: <TopValsDef extends Record<string, unknown>, Toptions = unknown>(opValueParser?: OpValueParser<unknown, TopValsDef, Toptions>) => OpsParser<TopValsDef, Toptions>;
export default parseComparisonOps;
