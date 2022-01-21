import React, { useCallback, useMemo, useState } from "react";
import {
  Getter,
  Plugin,
  ComputedFn,
  Action,
  ActionProps,
} from "@devexpress/dx-react-core";
import {
  FilteringState as FilteringStateDevEx,
  FilteringStateProps as FilteringStatePropsDevEx,
  FilterExpression as FilterExpressionDevEx,
  Filter as FilterDevEx,
} from "@devexpress/dx-react-grid";
import { TableFilterRow as TableFilterRowDevEx } from "@devexpress/dx-react-grid-material-ui";
import { changeColumnFilter as changeColumnFilterDevEx } from "@devexpress/dx-grid-core";
import { Merge } from "ts-essentials";

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

export interface Operation<T = unknown, U = DefaultFilterOperations> {
  operation: U;
  value?: T;
}

export interface Filter<T = unknown, U = DefaultFilterOperations>
  extends Operation<T, U> {
  columnName: string;
}

export interface LogicFilter<TFilter> {
  operator: FilterExpressionDevEx["operator"];
  filters: (LogicFilter<TFilter> | TFilter)[];
}

export interface ColumnLogicFilter<T = unknown, U = DefaultFilterOperations>
  extends LogicFilter<Operation<T, U>> {
  columnName: string;
}

export type Filters<T = unknown, U = DefaultFilterOperations> =
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  | Filter<T, U>
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  | ColumnLogicFilter<T, U>;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type FiltersDef = Filters<any, string>[];

export type ChangeColumnFilter<
  T = unknown,
  U = DefaultFilterOperations
> = (change: {
  columnName: string;
  config: Omit<Filters<T, U>, "columnName"> | null;
}) => void;

export type ClearColumnFilters = () => void;

export type AddNamedFilterPayload = {
  name: string;
  filters: FiltersDef;
};
export type ChangeNamedFilterPayload = {
  name: string;
  change: Partial<AddNamedFilterPayload>;
};
export type AddNamedFilters = (payload: AddNamedFilterPayload[]) => void;
export type CancelAddedNamedFilters = (payload: string[]) => void;
export type CommitAddedNamedFiltersPayload =
  | {
      names?: string[];
      load?: string;
    }
  | string[];
export type CommitAddedNamedFilters = (
  payload?: CommitAddedNamedFiltersPayload
) => void;
export type ChangeAddedNamedFilter = (
  payload: ChangeNamedFilterPayload
) => void;

export type DeleteNamedFilters = (payload: string[]) => void;
export type CancelDeletedNamedFilters = (payload?: string[]) => void;
export type CommitDeletedNamedFilters = (payload?: string[]) => void;

export type ChangeNamedFilter = (payload?: ChangeNamedFilterPayload) => void;
export type CancelChangedNamedFilters = (payload?: string[]) => void;
export type CommitChangedNamedFilters = (payload?: string[]) => void;

export type LoadNamedFilter = (payload: string) => void;

export interface FilterExpression {
  operator: FilterExpressionDevEx["operator"];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  filters: (
    | FilterExpression
    | Required<FilterDevEx>
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    | Filter<any, string>
  )[];
}

export type FilteringStateProps = Merge<
  Omit<FilteringStatePropsDevEx, "defaultFilters">,
  {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    filters: FiltersDef;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    onFiltersChange: (filters: FiltersDef) => void;
    namedFilters?: NamedFilters;
    onNamedFiltersChange?: (namedFilters: NamedFilters) => void;
  }
>;

export type NamedFilters = Record<string, FiltersDef>;

export type NamedFiltersChanges = Record<
  string,
  Partial<AddNamedFilterPayload>
>;

const generateLogicFilterExpressionsFilters = (
  columnName: string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  operator: ColumnLogicFilter<any, string>["operator"],
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  filters: ColumnLogicFilter<any, string>["filters"]
) =>
  filters.reduce((filters, filter) => {
    if ("operator" in filter) {
      const subFilterExpression = generateLogicFiltersExpression(
        columnName,
        filter
      );
      // Hoist like operators
      if (subFilterExpression.operator === operator) {
        filters.push(...subFilterExpression.filters);
      } else {
        filters.push(subFilterExpression);
      }
    } else {
      filters.push({ columnName, ...filter });
    }

    return filters;
  }, [] as FilterExpression["filters"]);

const generateLogicFiltersExpression = (
  columnName: string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  logicFilter: LogicFilter<Operation<any, string>>
): FilterExpression => ({
  operator: logicFilter.operator,
  filters: generateLogicFilterExpressionsFilters(
    columnName,
    logicFilter.operator,
    logicFilter.filters
  ),
});

const _hasColumnFilters = (
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  filters: FiltersDef | ColumnLogicFilter<any, string>["filters"]
): boolean =>
  filters.some((filter) =>
    "operator" in filter
      ? _hasColumnFilters(filter.filters)
      : filter.value !== undefined
  );

export const FilteringState = ({
  filters: filtersProp,
  onFiltersChange: onFiltersChangeProp,
  namedFilters: namedFiltersProp,
  onNamedFiltersChange: onNamedFiltersChangeProp,
  ...rest
}: FilteringStateProps): JSX.Element => {
  // Named Filters
  const [loadedNamedFilter, setLoadedNamedFilter] = useState<string | null>(
    null
  );

  const loadNamedFilter = useCallback<ActionProps["action"]>(
    (payload) => {
      const name = payload as Parameters<LoadNamedFilter>[0];

      if (
        namedFiltersProp &&
        name in namedFiltersProp &&
        name !== loadedNamedFilter
      ) {
        setLoadedNamedFilter(name);
        onFiltersChangeProp(namedFiltersProp[name]);
      }
    },
    [loadedNamedFilter, namedFiltersProp, onFiltersChangeProp]
  );

  // Add new named filters
  const [addedNamedFilters, setAddedNamedFilters] = useState<
    AddNamedFilterPayload[]
  >([]);

  const addNamedFilters = useCallback<ActionProps["action"]>((payload) => {
    setAddedNamedFilters(payload as AddNamedFilterPayload[]);
  }, []);

  const commitAddedNamedFilters = useCallback<ActionProps["action"]>(
    (payload) => {
      if (!addedNamedFilters.length) {
        return;
      }

      const newNamedFilters = { ...namedFiltersProp };

      const [filtersToCommit, newAddedNamedFilters, namedFilterToLoad] = ((
        payload: CommitAddedNamedFiltersPayload | undefined
      ) => {
        if (payload) {
          const [filtersToCommit, namedFilterToLoad] = Array.isArray(payload)
            ? [payload, null]
            : [
                payload.names || addedNamedFilters.map(({ name }) => name),
                payload.load || null,
              ];

          return [
            ...addedNamedFilters.reduce(
              (returnFilters, addedNamedFilter) => {
                if (filtersToCommit.includes(addedNamedFilter.name)) {
                  returnFilters[0].push(addedNamedFilter);
                } else {
                  returnFilters[1].push(addedNamedFilter);
                }

                return returnFilters;
              },
              [[], []] as [AddNamedFilterPayload[], AddNamedFilterPayload[]]
            ),
            namedFilterToLoad,
          ];
        } else {
          return [[...addedNamedFilters], [], null];
        }
      })(payload);

      for (const { name, filters } of filtersToCommit) {
        newNamedFilters[name] = filters;
      }
      if (onNamedFiltersChangeProp) {
        onNamedFiltersChangeProp(newNamedFilters);
      }

      setAddedNamedFilters(newAddedNamedFilters);

      if (namedFilterToLoad) {
        setLoadedNamedFilter(namedFilterToLoad);
      }
    },
    [addedNamedFilters, namedFiltersProp, onNamedFiltersChangeProp]
  );

  const changeAddedNamedFilter = useCallback<ActionProps["action"]>(
    (payload) => {
      const { name, change } = payload as ChangeNamedFilterPayload;
      for (let i = 0; i < addedNamedFilters.length; i++) {
        if (addedNamedFilters[i].name === name) {
          const newAddedNamedFilters = [...addedNamedFilters];
          newAddedNamedFilters.splice(i, 1, {
            ...addedNamedFilters[i],
            ...change,
          });
          setAddedNamedFilters(newAddedNamedFilters);
        }
      }
    },
    [addedNamedFilters]
  );

  const cancelAddedNamedFilters = useCallback<ActionProps["action"]>(
    (payload) =>
      void setAddedNamedFilters(
        addedNamedFilters.filter(
          ({ name }) => !(payload as string[]).includes(name)
        )
      ),
    [addedNamedFilters]
  );

  // Modify named filters
  const [namedFilterChanges, setNamedFilterChanges] =
    useState<NamedFiltersChanges | null>(null);

  const changeNamedFilter = useCallback<ActionProps["action"]>(
    (payload) => {
      if (payload) {
        const { name, change } = payload as ChangeNamedFilterPayload;
        setNamedFilterChanges(
          namedFilterChanges
            ? { ...namedFilterChanges, [name]: change }
            : { [name]: change }
        );
      } else if (!namedFilterChanges) {
        setNamedFilterChanges({});
      }
    },
    [namedFilterChanges]
  );

  const cancelChangedNamedFilters = useCallback<ActionProps["action"]>(
    (payload) => {
      if (!namedFilterChanges) {
        return;
      } else if (!payload) {
        setNamedFilterChanges(null);
        return;
      }

      const newNamedFilterChanges = { ...namedFilterChanges };

      for (const name of payload as string[]) {
        Reflect.deleteProperty(newNamedFilterChanges, name);
      }

      setNamedFilterChanges(
        Object.keys(newNamedFilterChanges).length ? newNamedFilterChanges : null
      );
    },
    [namedFilterChanges]
  );

  const commitChangedNamedFilters = useCallback<ActionProps["action"]>(
    (payload) => {
      if (!namedFilterChanges) {
        return;
      }

      const namedFiltersToCommit =
        (payload as string[]) || Object.keys(namedFilterChanges);

      if (!namedFiltersToCommit.length) {
        if (!Object.keys(namedFilterChanges).length) {
          setNamedFilterChanges(null);
        }
        return;
      }

      const newNamedFilterChanges = { ...namedFilterChanges };
      const newNamedFilters = { ...namedFiltersProp };

      for (const namedFilter of namedFiltersToCommit) {
        if (!(namedFilter in namedFilterChanges)) {
          continue; // Invalid change
        }

        const { name, filters: newFilters } = namedFilterChanges[namedFilter];

        const filters = newFilters || (namedFiltersProp || {})[namedFilter];

        if (!filters) {
          continue; // No filters is an invalid change

          // Name change
        } else if (name && name !== namedFilter) {
          newNamedFilters[name] = filters;
          Reflect.deleteProperty(newNamedFilters, namedFilter);
        } else {
          newNamedFilters[namedFilter] = filters;
        }

        // Remove change from newNamedFilterChanges
        Reflect.deleteProperty(newNamedFilterChanges, namedFilter);
      }

      if (onNamedFiltersChangeProp) {
        onNamedFiltersChangeProp(newNamedFilters);
      }

      setNamedFilterChanges(
        Object.keys(newNamedFilterChanges).length ? newNamedFilterChanges : null
      );
    },
    [namedFilterChanges, namedFiltersProp, onNamedFiltersChangeProp]
  );

  // Delete named filters
  const [deletedNamedFilters, setDeletedNamedFilters] = useState<string[]>([]);

  const deleteNamedFilters = useCallback<ActionProps["action"]>(
    (payload) =>
      void setDeletedNamedFilters((state) => [
        ...new Set([...state, ...(payload as string[])]),
      ]),
    []
  );

  const cancelDeletedNamedFilters = useCallback<ActionProps["action"]>(
    (payload) => {
      setDeletedNamedFilters((deletedNamedFilters) =>
        payload
          ? deletedNamedFilters.filter(
              (name) => !(payload as string[]).includes(name)
            )
          : []
      );
    },
    []
  );

  const commitDeletedNamedFilters = useCallback<ActionProps["action"]>(
    (payload) => {
      if (deletedNamedFilters.length) {
        const newNamedFilters = { ...namedFiltersProp };

        const newDeletedNamedFilters = new Set([...deletedNamedFilters]);

        for (const name of deletedNamedFilters) {
          if (!payload || (payload as string[]).includes(name)) {
            Reflect.deleteProperty(newNamedFilters, name);
            // Remove committed delete
            newDeletedNamedFilters.delete(name);
          }
        }

        if (
          loadedNamedFilter &&
          deletedNamedFilters.includes(loadedNamedFilter)
        ) {
          onFiltersChangeProp([]);
          setLoadedNamedFilter(null);
        }

        if (onNamedFiltersChangeProp) {
          onNamedFiltersChangeProp(newNamedFilters);
        }

        setDeletedNamedFilters([...newDeletedNamedFilters]);
      }
    },
    [
      deletedNamedFilters,
      loadedNamedFilter,
      namedFiltersProp,
      onFiltersChangeProp,
      onNamedFiltersChangeProp,
    ]
  );

  // Filters
  const [filters, columnLogicFilters] = useMemo(
    () =>
      filtersProp.reduce(
        (filters, filter) => {
          if ("operator" in filter) {
            filters[1].push(filter);
          } else {
            filters[0].push(filter);
          }
          return filters;
        },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        [[], []] as [FilterDevEx[], ColumnLogicFilter<any, string>[]]
      ),
    [filtersProp]
  );

  const filtersComputed = useCallback<ComputedFn>(
    ({ filters }) => {
      const f = [
        ...new Set(
          filters
            ? [...filters, ...columnLogicFilters]
            : [...columnLogicFilters]
        ),
      ];

      return f;
    },
    [columnLogicFilters]
  );

  const filterExpressionComputed = useCallback<ComputedFn>(
    ({ filterExpression }) => {
      const andFilters = [] as FilterExpression["filters"];

      if (filterExpression) {
        if ((filterExpression as FilterExpression).operator === "and") {
          andFilters.push(...(filterExpression as FilterExpression).filters);
        } else {
          andFilters.push(filterExpression as FilterExpression);
        }
      }

      if (columnLogicFilters.length) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        for (const filter of columnLogicFilters) {
          const filters = generateLogicFilterExpressionsFilters(
            filter.columnName,
            filter.operator,
            filter.filters
          );

          // Hoist like operators
          if (filter.operator === "and") {
            andFilters.push(...filters);
          } else {
            andFilters.push({
              operator: filter.operator,
              filters,
            });
          }
        }
      }

      return {
        operator: "and",
        filters: andFilters,
      };
    },
    [columnLogicFilters]
  );

  const changeColumnFilter = useCallback<ActionProps["action"]>(
    (payload, { filters }) => {
      const newFilters = changeColumnFilterDevEx(filters || [], payload);
      setLoadedNamedFilter(null);
      onFiltersChangeProp(newFilters as FiltersDef);
    },
    [onFiltersChangeProp]
  );

  const clearColumnFilters = useCallback<ActionProps["action"]>(() => {
    onFiltersChangeProp([] as FiltersDef);
    setLoadedNamedFilter(null);
  }, [onFiltersChangeProp]);

  const hasColumnFilters = useMemo(
    () => _hasColumnFilters(filtersProp),
    [filtersProp]
  );

  const hasNamedFilters = useMemo(
    () => (namedFiltersProp ? !!Object.keys(namedFiltersProp).length : false),
    [namedFiltersProp]
  );

  return (
    <Plugin name="FilteringState">
      <FilteringStateDevEx
        filters={filters}
        {...(rest as FilteringStatePropsDevEx)}
      />
      <Getter name="filters" computed={filtersComputed} />
      <Getter name="filterExpression" computed={filterExpressionComputed} />
      <Getter name="hasColumnFilters" value={hasColumnFilters} />
      <Getter name="hasNamedFilters" value={hasNamedFilters} />
      <Action name="changeColumnFilter" action={changeColumnFilter} />
      <Action name="clearColumnFilters" action={clearColumnFilters} />
      {/* Named Filters */}
      <Getter
        name="namedFilters"
        value={hasNamedFilters ? namedFiltersProp : null}
      />
      <Getter name="loadedNamedFilter" value={loadedNamedFilter} />
      <Getter name="addedNamedFilters" value={addedNamedFilters} />
      <Getter name="deletedNamedFilters" value={deletedNamedFilters} />
      <Getter name="namedFilterChanges" value={namedFilterChanges} />
      <Action name="addNamedFilters" action={addNamedFilters} />
      <Action name="changeAddedNamedFilter" action={changeAddedNamedFilter} />
      <Action name="cancelAddedNamedFilters" action={cancelAddedNamedFilters} />
      <Action name="commitAddedNamedFilters" action={commitAddedNamedFilters} />
      <Action name="changeNamedFilter" action={changeNamedFilter} />
      <Action
        name="cancelChangedNamedFilters"
        action={cancelChangedNamedFilters}
      />
      <Action
        name="commitChangedNamedFilters"
        action={commitChangedNamedFilters}
      />
      <Action name="loadNamedFilter" action={loadNamedFilter} />
      <Action name="deleteNamedFilters" action={deleteNamedFilters} />
      <Action
        name="cancelDeletedNamedFilters"
        action={cancelDeletedNamedFilters}
      />
      <Action
        name="commitDeletedNamedFilters"
        action={commitDeletedNamedFilters}
      />
    </Plugin>
  );
};

export type OnFilter<T = unknown, U = DefaultFilterOperations> = (
  filter: Filters<T, U> | null
) => void;

export type TableFilterCellProps<
  T = unknown,
  U = DefaultFilterOperations
> = Merge<
  TableFilterRowDevEx.CellProps,
  {
    filter: Filters<T, U> | null;
    onFilter: OnFilter<T, U>;
  }
>;
