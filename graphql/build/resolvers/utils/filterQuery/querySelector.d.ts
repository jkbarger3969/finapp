import { FilterOperators as QuerySelector } from "mongodb";
export declare type ValidMongoOps = Exclude<keyof QuerySelector<unknown>, "$expr" | "$jsonSchema">;
export declare type MongoOpsMap<TMongoOps extends ValidMongoOps = ValidMongoOps, TMongoOpsMap extends {
    [op: string]: TMongoOps;
} = {
    [op: string]: TMongoOps;
}> = {
    [op in keyof TMongoOpsMap]: TMongoOpsMap[op] extends TMongoOps ? TMongoOpsMap[op] : never;
};
export declare type MongoOpValue<TOp extends keyof TMongoOpsMap, TReturn, TMongoOpsMap extends MongoOpsMap> = QuerySelector<TReturn>[TMongoOpsMap[TOp]];
export declare type OperatorValueTransmuted<TReturn, TMongoOps extends ValidMongoOps> = QuerySelector<TReturn>[TMongoOps];
export declare type OperatorValueTransmutator<TOpValue, TReturn, TMongoOpsMap extends MongoOpsMap, TOp extends string> = ((operatorValue: TOpValue, operator: TOp) => MongoOpValue<TOp, TReturn, TMongoOpsMap>) | ((operatorValue: TOpValue, operator: TOp) => Promise<MongoOpValue<TOp, TReturn, TMongoOpsMap>>) | ((operatorValue: TOpValue, operator: TOp) => MongoOpValue<TOp, TReturn, TMongoOpsMap> | Promise<MongoOpValue<TOp, TReturn, TMongoOpsMap>>);
export interface QuerySelectorIterableIterator<TOp extends string, TOpValue> extends Iterator<[TOp, TOpValue], void | Promise<void>> {
    [Symbol.iterator](): QuerySelectorIterableIterator<TOp, TOpValue>;
}
export interface QuerySelectorGenerator<TOp extends string, TOpValue, TReturn> {
    (operatorValues: Iterable<[TOp, TOpValue]>, querySelector: QuerySelector<TReturn>): QuerySelectorIterableIterator<TOp, TOpValue>;
}
export declare const querySelectorGenerator: <TCondition extends Object, TReturn = unknown>(condition: TCondition, querySelectorGenerators: QuerySelectorGenerator<Extract<keyof TCondition, string>, TCondition[Extract<keyof TCondition, string>], TReturn>[], querySelector: QuerySelector<TReturn>) => Generator<[Extract<keyof TCondition, string>, TCondition[Extract<keyof TCondition, string>]], QuerySelector<TReturn> | Promise<QuerySelector<TReturn>>, unknown>;
declare const querySelector: <TCondition extends Object, TReturn = unknown>(condition: TCondition, querySelectorGenerators: QuerySelectorGenerator<Extract<keyof TCondition, string>, TCondition[Extract<keyof TCondition, string>], TReturn>[], querySelector?: QuerySelector<TReturn>) => QuerySelector<TReturn> | Promise<QuerySelector<TReturn>>;
export default querySelector;
