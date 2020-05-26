import { FilterQuery, Condition } from "mongodb";

import { AsyncIterableIteratorFns } from "../../../utils/iterableFns";

const NULLISH = Symbol();

export interface LogicOperators<T> {
  and?: (T & LogicOperators<T>)[];
  or?: (T & LogicOperators<T>)[];
  nor?: (T & LogicOperators<T>)[];
}

export interface FieldAndCondition<T = unknown> {
  field: string;
  condition: Condition<T>;
}

export type FieldAndConditionGenerator<
  TWhere extends LogicOperators<TWhere>,
  TOpts extends object | undefined = undefined
> = (
  key: Exclude<keyof TWhere, keyof LogicOperators<TWhere>>,
  val: TWhere[Exclude<keyof TWhere, keyof LogicOperators<TWhere>>],
  opts?: TOpts
) => AsyncIterableIteratorFns<FieldAndCondition>;

const filterQueryCreator = async <
  TWhere extends LogicOperators<TWhere>,
  TOpts extends object | undefined
>(
  where: TWhere,
  fieldAndConditionGenerator: FieldAndConditionGenerator<TWhere, TOpts>,
  opts?: TOpts
): Promise<FilterQuery<any>> => {
  const filterQuery: FilterQuery<any> = {};
  const promises: Promise<void>[] = [];

  for (const key in where) {
    // skip non-own prop and null or undefined filters
    if (
      !Object.prototype.hasOwnProperty.call(where, key) ||
      (where[key] ?? NULLISH) === NULLISH
    ) {
      continue;
    }

    // Match Logic Operators
    switch (key) {
      case "or":
        filterQuery.$or = await Promise.all(
          where[key as "or"].map((where) =>
            filterQueryCreator(where, fieldAndConditionGenerator, opts)
          )
        );
        break;
      case "and":
        filterQuery.$and = await Promise.all(
          where[key as "and"].map((where) =>
            filterQueryCreator(where, fieldAndConditionGenerator, opts)
          )
        );
        break;

      case "nor":
        filterQuery.$nor = await Promise.all(
          where[key as "nor"].map((where) =>
            filterQueryCreator(where, fieldAndConditionGenerator, opts)
          )
        );
        break;
      default: {
        for await (const result of fieldAndConditionGenerator(
          (key as unknown) as Exclude<
            Extract<keyof TWhere, string>,
            keyof LogicOperators<TWhere>
          >,
          (where[key] as unknown) as TWhere[Exclude<
            Extract<keyof TWhere, string>,
            keyof LogicOperators<TWhere>
          >],
          opts
        )) {
          const { field, condition } = result;
          filterQuery[field] = condition;
        }
      }
    }
  }

  return filterQuery;
};

export default filterQueryCreator;
