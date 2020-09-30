import { FilterQuery, Condition } from "mongodb";
import { iterateOwnKeyValues } from "../../../utils/iterableFns";

const NULLISH = Symbol();

export interface LogicOperators<T> {
  and?: (T & LogicOperators<T>)[];
  or?: (T & LogicOperators<T>)[];
  nor?: (T & LogicOperators<T>)[];
}

export interface FieldAndCondition {
  field: string;
  condition: Condition<any>;
}

export type FieldAndConditionCreator<T> = (
  key: keyof Omit<T, keyof LogicOperators<any>>,
  val: T[keyof Omit<T, keyof LogicOperators<any>>]
) => FieldAndCondition | Promise<FieldAndCondition>;

const filter = async <TWhere extends LogicOperators<TWhere>>(
  where: TWhere,
  fieldAndConditionCreator: FieldAndConditionCreator<TWhere>
): Promise<FilterQuery<any>> => {
  const filterQuery: FilterQuery<any> = {};

  for (const [key, value] of iterateOwnKeyValues(where)) {
    // skip null or undefined filters
    if ((value ?? NULLISH) === NULLISH) {
      continue;
    }

    // Match Logic Operators
    switch (key) {
      case "or":
        if (value) {
          filterQuery.$or = await Promise.all(
            ((value as unknown) as NonNullable<
              LogicOperators<TWhere>["or"]
            >).map((where) => filter(where, fieldAndConditionCreator))
          );
        }
        break;
      case "and":
        if (value) {
          filterQuery.$and = await Promise.all(
            ((value as unknown) as NonNullable<
              LogicOperators<TWhere>["and"]
            >).map((where) => filter(where, fieldAndConditionCreator))
          );
        }
        break;
      case "nor":
        if (value) {
          filterQuery.$nor = await Promise.all(
            ((value as unknown) as NonNullable<
              LogicOperators<TWhere>["nor"]
            >).map((where) => filter(where, fieldAndConditionCreator))
          );
        }
        break;
      default: {
        const { field, condition } = await fieldAndConditionCreator(
          key as Exclude<typeof key, keyof LogicOperators<TWhere>>,
          value as TWhere[Exclude<typeof key, keyof LogicOperators<TWhere>>]
        );

        filterQuery[field] = condition;
      }
    }
  }

  return filterQuery;
};

export default filter;
