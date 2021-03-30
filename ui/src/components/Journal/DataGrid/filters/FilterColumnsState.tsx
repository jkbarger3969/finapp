import React, { useCallback, useMemo, useState } from "react";
import { Getter, Action, Plugin, ComputedFn } from "@devexpress/dx-react-core";
import {
  FilteringState as FilteringStateDevEx,
  FilteringStateProps as FilteringStatePropsDevEx,
  FilterExpression as FilterExpressionDevEx,
  Filter as FilterDevEx,
} from "@devexpress/dx-react-grid";

// Update native Dev Express types.
export type DefaultFilterOperations =
  | "contains"
  | "notContains"
  | "startsWith"
  | "endsWith"
  | "equal"
  | "notEqual"
  | "greaterThan"
  | "greaterThanOrEqual"
  | "lessThan"
  | "lessThanOrEqual";

export type Filter<T = unknown, U = DefaultFilterOperations> = Omit<
  FilterDevEx,
  "operation" | "value"
> & {
  operation: U;
  value: T;
};

export type FilterExpression<T = unknown, U = DefaultFilterOperations> = Omit<
  FilterExpressionDevEx,
  "filters"
> & {
  filters: Array<FilterExpression<T, U> | Filter<T, U>>;
};

export type ColumnFilterOperation<
  T = unknown,
  U = DefaultFilterOperations
> = Omit<Filter<T, U>, "columnName">;

export type LogicFilter<T = unknown, U = DefaultFilterOperations> = Omit<
  FilterExpressionDevEx,
  "filters"
> & {
  filters: Array<ColumnFilterOperation<T, U> | LogicFilter<T, U>>;
};

export type ColumnFilter<T = unknown, U = DefaultFilterOperations> = {
  columnName: string;
  filters: Array<ColumnFilterOperation<T, U> | LogicFilter<T, U>>;
};

export type ChangeColumnFilter<
  T = unknown,
  U = DefaultFilterOperations
> = (arg: {
  columnName: string;
  config:
    | Omit<Filter<T, U>, "columnName">
    | Omit<ColumnFilter<T, U>, "columnName">
    | null;
}) => void;

export type IsColumnFilteringEnabled = (columnName: string) => boolean;

export type Filters<T = unknown, U = DefaultFilterOperations> = (
  | Filter<T, U>
  | ColumnFilter<T, U>
)[];

export type FilterColumnStateProps = Omit<
  FilteringStatePropsDevEx,
  "filters" | "defaultFilters" | "onFiltersChange"
> & {
  filters?: Filters;
  defaultFilters?: Filters;
  onFiltersChange?: (filters: Filters) => void;
};

const parseColumnFilters = (
  columnName: string,
  filters: Array<ColumnFilterOperation | LogicFilter>,
  expressionFilters: FilterExpressionDevEx["filters"]
): void => {
  for (const filter of filters) {
    // Logical filter
    if ("operator" in filter) {
      const expression: FilterExpressionDevEx = {
        operator: filter.operator,
        filters: [],
      };

      parseColumnFilters(columnName, filter.filters, expression.filters);

      expressionFilters.push(expression);

      // ColumnFilterOperation
    } else {
      expressionFilters.push({
        columnName,
        ...filter,
      } as FilterDevEx);
    }
  }
};

const filterExpressionComputed = ({
  columnFilters,
  filterExpression,
  isColumnFilteringEnabled,
}: {
  columnFilters: ColumnFilter[];
  filterExpression?: FilterExpressionDevEx;
  isColumnFilteringEnabled?: IsColumnFilteringEnabled;
}): FilterExpressionDevEx | undefined => {
  const expression: FilterExpressionDevEx = {
    operator: "and",
    filters: [],
  };

  for (const columnFilter of columnFilters) {
    if (
      !isColumnFilteringEnabled ||
      isColumnFilteringEnabled(columnFilter.columnName)
    ) {
      parseColumnFilters(
        columnFilter.columnName,
        columnFilter.filters,
        expression.filters
      );
    }
  }

  if (filterExpression) {
    return {
      operator: "and",
      filters: [filterExpression, expression],
    };
  } else {
    return expression;
  }
};

export const FilterColumnsState = (
  props: FilterColumnStateProps
): JSX.Element => {
  const {
    filters: controlledFilters,
    defaultFilters: uncontrolledFilters,
    onFiltersChange,
    ...rest
  } = props;

  const [defaultFilters, setDefaultFilters] = useState(
    uncontrolledFilters || []
  );

  const rawFilters = controlledFilters || defaultFilters;

  const [filters, columnFilters] = useMemo<[Filter[], ColumnFilter[]]>(
    () =>
      rawFilters.reduce(
        (parsedFilters, filter) => {
          if ("filters" in filter) {
            // Column Filter
            parsedFilters[1].push(filter);
          } else {
            // Native Filter
            parsedFilters[0].push(filter);
          }

          return parsedFilters;
        },
        [[], []] as [Filter[], ColumnFilter[]]
      ),

    [rawFilters]
  );

  const changeColumnFilter = useCallback<ChangeColumnFilter>(
    ({ columnName, config }) => {
      // https://github.com/DevExpress/devextreme-reactive/blob/3f35212e362c37d95c794bebee5004653a2bc645/packages/dx-grid-core/src/plugins/filtering-state/reducers.ts#L7-L19
      const filterIndex = rawFilters.findIndex(
        (f) => f.columnName === columnName
      );
      const nextState = [...rawFilters];

      if (config) {
        const filter = { columnName, ...config };
        if (filterIndex > -1) {
          nextState.splice(filterIndex, 1, filter);
        } else {
          nextState.push(filter);
        }
      } else if (filterIndex > -1) {
        nextState.splice(filterIndex, 1);
      }

      if (onFiltersChange) {
        onFiltersChange(nextState);
      }

      if (rawFilters === defaultFilters) {
        setDefaultFilters(nextState);
      }
    },
    [rawFilters, rawFilters, onFiltersChange, setDefaultFilters]
  );

  return (
    <Plugin>
      <FilteringStateDevEx filters={filters as FilterDevEx[]} {...rest} />
      <Plugin name="FilterColumnsState">
        <Getter name="columnFilters" value={columnFilters} />
        <Getter
          name="filterExpression"
          computed={(filterExpressionComputed as unknown) as ComputedFn}
        />
        <Action name="changeColumnFilter" action={changeColumnFilter} />
      </Plugin>
    </Plugin>
  );
};

export default FilterColumnsState;
