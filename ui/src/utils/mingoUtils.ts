import { addOperators, OperatorType, Options } from "mingo/core";

export interface CustomOperatorHelpers {
  resolve(obj: Record<string, unknown>, selector: string): any;
  computeValue(
    obj: Record<string, unknown>,
    expr: any,
    operator: string,
    options: Options
  ): any;
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
