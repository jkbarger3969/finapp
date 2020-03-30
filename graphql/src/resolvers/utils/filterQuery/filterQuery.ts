import { FilterQuery, Condition } from "mongodb";

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

  for (const key of Object.keys(where) as (keyof TWhere)[]) {
    // skip null or undefined filters
    if ((where[key] ?? NULLISH) === NULLISH) {
      continue;
    }

    // Match Logic Operators
    switch (key) {
      case "or":
        filterQuery.$or = await Promise.all(
          where[key as "or"].map(where =>
            filter(where, fieldAndConditionCreator)
          )
        );
        break;

      case "and":
        filterQuery.$and = await Promise.all(
          where[key as "and"].map(where =>
            filter(where, fieldAndConditionCreator)
          )
        );
        break;

      case "nor":
        filterQuery.$and = await Promise.all(
          where[key as "nor"].map(where =>
            filter(where, fieldAndConditionCreator)
          )
        );
        break;
      default: {
        const { field, condition } = await fieldAndConditionCreator(
          key as any,
          where[key] as any
        );

        filterQuery[field] = condition;
      }
    }
  }

  return filterQuery;
};

export default filter;
