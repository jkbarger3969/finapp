import { addOperators, OperatorType, Options } from "mingo/core";
import { Callback, AnyVal } from "mingo/util";

export interface CustomOperatorHelpers {
  resolve(obj: Record<string, unknown>, selector: string): unknown;
  computeValue(
    obj: Record<string, unknown>,
    expr: unknown,
    operator: string,
    options: Options
  ): unknown;
}

addOperators(
  OperatorType.EXPRESSION,
  (helpers) =>
    (({
      $expressionCb: (
        obj: Record<string, unknown>,
        expr: (
          obj: Record<string, unknown>,
          options?: Options,
          helpers?: CustomOperatorHelpers
        ) => unknown,
        options: Options
      ) => expr(obj, options, helpers as CustomOperatorHelpers),
    } as unknown) as Record<string, Callback<AnyVal>>)
);

addOperators(
  OperatorType.QUERY,
  (helpers) =>
    (({
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
      ) => rhs(selector, lhs, options, helpers as CustomOperatorHelpers),
    } as unknown) as Record<string, Callback<AnyVal>>)
);
