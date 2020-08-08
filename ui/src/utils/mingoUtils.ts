import { addOperators, OperatorType, Options } from "mingo/core";

export interface CustomOperatorHelpers {
  resolve(obj: Record<string, unknown>, selector: string): unknown;
  computeValue(
    obj: Record<string, unknown>,
    expr: unknown,
    operator: string,
    options: Options
  ): unknown;
}

addOperators(OperatorType.EXPRESSION, (helpers: CustomOperatorHelpers) => ({
  $expressionCb: (
    obj: Record<string, unknown>,
    expr: (
      obj: Record<string, unknown>,
      options?: Options,
      helpers?: CustomOperatorHelpers
    ) => unknown,
    options: Options
  ) => expr(obj, options, helpers),
}));

addOperators(OperatorType.QUERY, (helpers: CustomOperatorHelpers) => ({
  $queryCb: (
    selector: string,
    lhs: unknown,
    rhs: (
      selector: string,
      lhs: unknown,
      options?: Options,
      helpers?: CustomOperatorHelpers
    ) => boolean,
    options: Options
  ) => rhs(selector, lhs, options, helpers),
}));
