import { Filter as FilterQuery, Condition } from "mongodb";
export interface LogicOperators<T> {
    and?: (T & LogicOperators<T>)[];
    or?: (T & LogicOperators<T>)[];
    nor?: (T & LogicOperators<T>)[];
}
export interface FieldAndCondition {
    field: string;
    condition: Condition<any>;
}
export declare type FieldAndConditionCreator<T> = (key: keyof Omit<T, keyof LogicOperators<any>>, val: T[keyof Omit<T, keyof LogicOperators<any>>]) => FieldAndCondition | Promise<FieldAndCondition>;
declare const filter: <TWhere extends LogicOperators<TWhere>>(where: TWhere, fieldAndConditionCreator: FieldAndConditionCreator<TWhere>) => Promise<FilterQuery<any>>;
export default filter;
