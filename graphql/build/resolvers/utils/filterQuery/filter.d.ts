import { Filter as FilterQuery, Condition } from "mongodb";
import { AsyncIterableIteratorFns, AsyncIterableFns } from "../../../utils/iterableFns";
export interface LogicOperators<T> {
    and?: (T & LogicOperators<T>)[];
    or?: (T & LogicOperators<T>)[];
    nor?: (T & LogicOperators<T>)[];
}
export interface FieldAndCondition<T = unknown> {
    field: string;
    condition: Condition<T>;
}
export declare type FieldAndConditionGenerator<TWhere extends LogicOperators<TWhere>, Toptions = unknown> = (keyValues: AsyncIterableFns<[
    Exclude<keyof TWhere, keyof LogicOperators<TWhere>>,
    TWhere[Exclude<keyof TWhere, keyof LogicOperators<TWhere>>]
]>, options?: Toptions) => AsyncIterableIteratorFns<FieldAndCondition>;
declare const filterQueryCreator: <TWhere extends LogicOperators<TWhere>, Toptions = unknown>(where: TWhere | AsyncIterable<[keyof TWhere, TWhere[keyof TWhere]]>, fieldAndConditionGenerator: FieldAndConditionGenerator<TWhere, Toptions>, options?: Toptions) => Promise<FilterQuery<unknown>>;
export default filterQueryCreator;
