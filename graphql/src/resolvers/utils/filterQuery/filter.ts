import { Filter as FilterQuery, Condition } from "mongodb";

import {
  AsyncIterableIteratorFns,
  AsyncIterableFns,
  iterateOwnKeyValues,
  iterableToAsyncIterable,
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
  $and: (FilterQuery<unknown> & { $expr?: unknown })[],
  where: TWhere | AsyncIterable<[keyof TWhere, TWhere[keyof TWhere]]>,
  fieldAndConditionGenerator: FieldAndConditionGenerator<TWhere, Toptions>,
  options?: Toptions
): AsyncIterableIteratorFns<
  [
    Exclude<keyof TWhere, keyof LogicOperators<TWhere>>,
    TWhere[Exclude<keyof TWhere, keyof LogicOperators<TWhere>>]
  ]
> {
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
        $and.push({
          $or: await Promise.all(
            where[key as "or"].map((where) =>
              filterQueryCreator(where, fieldAndConditionGenerator, options)
            )
          ),
        });
        /* filterQuery.$or = await Promise.all(
          where[key as "or"].map((where) =>
            filterQueryCreator(where, fieldAndConditionGenerator, options)
          )
        ); */
        break;
      case "and":
        $and.push(
          ...(await Promise.all(
            where[key as "and"].map((where) =>
              filterQueryCreator(where, fieldAndConditionGenerator, options)
            )
          ))
        );
        /*  filterQuery.$and = await Promise.all(
          where[key as "and"].map((where) =>
            filterQueryCreator(where, fieldAndConditionGenerator, options)
          )
        ); */
        break;

      case "nor":
        $and.push({
          $nor: await Promise.all(
            where[key as "nor"].map((where) =>
              filterQueryCreator(where, fieldAndConditionGenerator, options)
            )
          ),
        });
        /* filterQuery.$nor = await Promise.all(
          where[key as "nor"].map((where) =>
            filterQueryCreator(where, fieldAndConditionGenerator, options)
          )
        ); */
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
  const $and: (FilterQuery<unknown> & { $expr?: unknown })[] = [];

  for await (const { field, condition } of fieldAndConditionGenerator(
    _logicOpParser_($and, where, fieldAndConditionGenerator, options),
    options
  )) {
    if (field === "$and") {
      if (Array.isArray(condition)) {
        $and.push(...condition);
      } else {
        $and.push(condition);
      }
    } else {
      $and.push({ [field]: condition });
    }
  }

  return { $and } as FilterQuery<unknown>;
};

export default filterQueryCreator;
