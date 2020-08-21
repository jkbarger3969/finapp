import { FilterQuery, Condition } from "mongodb";

import {
  AsyncIterableIteratorFns,
  IterableFns,
  AsyncIterableFns,
  generatorChain,
  IterableIteratorFns,
  iterateOwnKeyValues,
} from "../../../utils/iterableFns";

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

// export type FieldAndConditionGenerator<
//   TWhere extends LogicOperators<TWhere>,
//   Toptions extends object | undefined = undefined
// > = (
//   key: Exclude<keyof TWhere, keyof LogicOperators<TWhere>>,
//   val: TWhere[Exclude<keyof TWhere, keyof LogicOperators<TWhere>>],
//   options?: Toptions
// ) => AsyncIterableIteratorFns<FieldAndCondition>;
export type FieldAndConditionGenerator<
  TWhere extends LogicOperators<TWhere>,
  Toptions = unknown
> = (
  keyValues: AsyncIterableFns<
    [
      Exclude<keyof TWhere, keyof LogicOperators<TWhere>>,
      TWhere[Exclude<keyof TWhere, keyof LogicOperators<TWhere>>]
    ]
  >,
  options?: Toptions
) => AsyncIterableIteratorFns<FieldAndCondition>;

const _logicOpParser_ = async function* <
  TWhere extends LogicOperators<TWhere>,
  Toptions = unknown
>(
  filterQuery: FilterQuery<any>,
  where: TWhere,
  fieldAndConditionGenerator: FieldAndConditionGenerator<TWhere, Toptions>,
  options?: Toptions
): AsyncIterableIteratorFns<[
  Exclude<keyof TWhere, keyof LogicOperators<TWhere>>,
  TWhere[Exclude<keyof TWhere, keyof LogicOperators<TWhere>>]
]> {
  for (const [key, value] of iterateOwnKeyValues(where)) {
    // skip non-own prop and null or undefined filters
    if ((value ?? NULLISH) === NULLISH || typeof key !== "string") {
      continue;
    }

    // Match Logic Operators
    switch (key) {
      case "or":
        filterQuery.$or = await Promise.all(
          where[key as "or"].map((where) =>
            filterQueryCreator(where, fieldAndConditionGenerator, options)
          )
        );
        break;
      case "and":
        filterQuery.$and = await Promise.all(
          where[key as "and"].map((where) =>
            filterQueryCreator(where, fieldAndConditionGenerator, options)
          )
        );
        break;

      case "nor":
        filterQuery.$nor = await Promise.all(
          where[key as "nor"].map((where) =>
            filterQueryCreator(where, fieldAndConditionGenerator, options)
          )
        );
        break;
      default: {
        yield [
          key as Exclude<keyof TWhere, keyof LogicOperators<TWhere>>,
          value as TWhere[Exclude<keyof TWhere, keyof LogicOperators<TWhere>>],
        ];
      }
    }
  }
};

const filterQueryCreator = async <
  TWhere extends LogicOperators<TWhere>,
  Toptions = unknown
>(
  where: TWhere,
  fieldAndConditionGenerator: FieldAndConditionGenerator<TWhere, Toptions>,
  options?: Toptions
): Promise<FilterQuery<any>> => {
  const filterQuery: FilterQuery<any> = {};

  for await (const { field, condition } of fieldAndConditionGenerator(
    _logicOpParser_(filterQuery, where, fieldAndConditionGenerator, options),
    options
  )) {
    filterQuery[field] = condition;
  }

  return filterQuery;
};

export default filterQueryCreator;
