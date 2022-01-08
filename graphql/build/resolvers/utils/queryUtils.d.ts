import { FilterOperators as QuerySelector, ObjectId, Filter as FilterQuery } from "mongodb";
import { WhereRegex, Resolvers, WhereDate, WhereRational, WhereId, WhereTreeId, WhereNode, WhereInt } from "../../graphTypes";
import { RationalValue } from "../../utils/mongoRational";
export interface NodeDbRecord<T extends string = string> {
    type: T;
    id: ObjectId;
}
export declare const whereId: (whereId: WhereId) => QuerySelector<unknown>;
export declare const whereTreeId: (whereTreeId: WhereTreeId, getRangeIds: (rangeOp: "gt" | "gte" | "lt" | "lte", id: ObjectId) => Promise<ObjectId[]> | ObjectId[]) => Promise<QuerySelector<unknown>> | QuerySelector<unknown>;
/**
 * @returns Mongodb "$and" logic operator expression.
 * https://docs.mongodb.com/manual/reference/operator/query/and/#op._S_and
 * */
export declare const whereNode: (whereNode: WhereNode, nodeFieldPath: string | ((nodeType: string) => string)) => FilterQuery<unknown>[];
export declare const whereRegex: ({ pattern, flags, }: WhereRegex) => QuerySelector<unknown>;
export declare const addTypename: <T extends keyof Resolvers<{
    dataSources: import("../../types").DataSources;
} & import("../../types").ContextBase>, U>(typename: T, query: Promise<U>) => Promise<U extends (infer V)[] ? (V & {
    __typename: T;
})[] : U & {
    __typename: T;
}>;
export declare const whereDate: (dateWhere: WhereDate) => QuerySelector<unknown>;
/**
 * @returns Mongodb "$and" logic operator expression.
 * https://docs.mongodb.com/manual/reference/operator/query/and/#op._S_and
 * */
export declare const whereRational: (lhs: RationalValue, whereRational: WhereRational) => QuerySelector<unknown>[];
export declare const whereInt: (intWhere: WhereInt) => QuerySelector<unknown>;
