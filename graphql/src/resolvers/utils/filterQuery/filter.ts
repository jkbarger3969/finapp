import { FilterQuery, Condition } from "mongodb";

import {
  AsyncIterableIteratorFns,
  AsyncIterableFns,
  iterateOwnKeyValues,
  iterableToAsyncIterable,
} from "../../../utils/iterableFns";
import { cond } from "lodash";

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
  filterQuery: FilterQuery<unknown>,
  where: TWhere | AsyncIterable<[keyof TWhere, TWhere[keyof TWhere]]>,
  fieldAndConditionGenerator: FieldAndConditionGenerator<TWhere, Toptions>,
  options?: Toptions
): AsyncIterableIteratorFns<[
  Exclude<keyof TWhere, keyof LogicOperators<TWhere>>,
  TWhere[Exclude<keyof TWhere, keyof LogicOperators<TWhere>>]
]> {
  for await (const [key, value] of where[Symbol.asyncIterator]
    ? (where as AsyncIterable<[keyof TWhere, TWhere[keyof TWhere]]>)
    : iterableToAsyncIterable(iterateOwnKeyValues(where))) {
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
  where: TWhere | AsyncIterable<[keyof TWhere, TWhere[keyof TWhere]]>,
  fieldAndConditionGenerator: FieldAndConditionGenerator<TWhere, Toptions>,
  options?: Toptions
): Promise<FilterQuery<unknown>> => {
  const filterQuery: FilterQuery<unknown> & { $expr?: unknown } = {};

  for await (const { field, condition } of fieldAndConditionGenerator(
    _logicOpParser_(filterQuery, where, fieldAndConditionGenerator, options),
    options
  )) {
    // Handle multiple "$and" queries.
    if (field === "$and" && "$and" in filterQuery) {
      filterQuery.$and = [...filterQuery.$and, ...(condition as unknown[])];
    }

    // Handle multiple "$or" queries.
    else if (field === "$or" && "$or" in filterQuery) {
      if ("$and" in filterQuery) {
        filterQuery.$and = [
          ...filterQuery.$and,
          { $or: condition as unknown[] },
        ];
      } else {
        filterQuery.$and = [{ $or: condition as unknown[] }];
      }
    }

    // Handle multiple "$nor" queries.
    else if (field === "$nor" && "$nor" in filterQuery) {
      filterQuery.$nor = [...filterQuery.$nor, ...(condition as unknown[])];
    }

    // Handle multiple "$expr" queries.
    else if (field === "$expr" && "$expr" in filterQuery) {
      filterQuery.$expr = {
        $allElementsTrue: [[filterQuery.$expr, condition]],
      };
    } else {
      filterQuery[field] = condition;
    }
  }

  return filterQuery as FilterQuery<unknown>;
};

export default filterQueryCreator;
