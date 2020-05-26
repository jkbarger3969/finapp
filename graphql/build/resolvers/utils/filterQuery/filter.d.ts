import { FilterQuery, Condition } from "mongodb";
import { AsyncIterableIteratorFns } from "../../../utils/iterableFns";
export interface LogicOperators<T> {
    and?: (T & LogicOperators<T>)[];
    or?: (T & LogicOperators<T>)[];
    nor?: (T & LogicOperators<T>)[];
}
export interface FieldAndCondition<T = unknown> {
    field: string;
    condition: Condition<T>;
}
export declare type FieldAndConditionGenerator<TWhere extends LogicOperators<TWhere>, TOpts extends object | undefined = undefined> = (key: Exclude<keyof TWhere, keyof LogicOperators<TWhere>>, val: TWhere[Exclude<keyof TWhere, keyof LogicOperators<TWhere>>], opts?: TOpts) => AsyncIterableIteratorFns<FieldAndCondition>;
declare const filterQueryCreator: <TWhere extends LogicOperators<TWhere>, TOpts extends object>(where: TWhere, fieldAndConditionGenerator: FieldAndConditionGenerator<TWhere, TOpts>, opts?: TOpts) => Promise<FilterQuery<any>>;
export default filterQueryCreator;
