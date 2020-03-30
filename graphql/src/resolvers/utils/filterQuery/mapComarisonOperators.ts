import { QuerySelector } from "mongodb";

const NULLISH = Symbol();

export interface ComparisonOperators {
  eq?: any;
  gt?: any;
  gte?: any;
  in?: any[];
  lt?: any;
  lte?: any;
  ne?: any;
  nin?: any[];
}

export type OperatorValueTransformer<T = any> = (val: T) => any | Promise<any>;

const defaultOpValTransformer: OperatorValueTransformer = (val: any) => val;

const mapComparisonOperators = async (
  comparisonOperators: ComparisonOperators,
  operatorValueTransformer: OperatorValueTransformer = defaultOpValTransformer
) => {
  const comparisonSelector: Partial<Pick<
    QuerySelector<any>,
    "$eq" | "$gt" | "$gte" | "$in" | "$lt" | "$lte" | "$ne" | "$nin"
  >> = {};

  for (const op of Object.keys(
    comparisonOperators
  ) as (keyof ComparisonOperators)[]) {
    // skip null or undefined conditions
    if ((comparisonOperators[op] ?? NULLISH) === NULLISH) {
      continue;
    }

    switch (op) {
      case "eq":
        comparisonSelector.$eq = await operatorValueTransformer(
          comparisonOperators[op]
        );
        break;
      case "gt":
        comparisonSelector.$gt = await operatorValueTransformer(
          comparisonOperators[op]
        );
        break;
      case "gte":
        comparisonSelector.$gte = await operatorValueTransformer(
          comparisonOperators[op]
        );
        break;
      case "in":
        comparisonSelector.$in = await Promise.all(
          comparisonOperators[op].map(val => operatorValueTransformer(val))
        );
        break;
      case "lt":
        comparisonSelector.$lt = await operatorValueTransformer(
          comparisonOperators[op]
        );
        break;
      case "lte":
        comparisonSelector.$lte = await operatorValueTransformer(
          comparisonOperators[op]
        );
        break;
      case "ne":
        comparisonSelector.$ne = await operatorValueTransformer(
          comparisonOperators[op]
        );
        break;
      case "nin":
        comparisonSelector.$nin = await Promise.all(
          comparisonOperators[op].map(val => operatorValueTransformer(val))
        );
        break;
    }
  }

  return comparisonSelector;
};

export default mapComparisonOperators;
