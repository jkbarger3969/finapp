import React, { useCallback, useState } from "react";
import { Action, Getter, Plugin, ComputedFn } from "@devexpress/dx-react-core";
import { Column, GetCellValueFn } from "@devexpress/dx-react-grid";
import Fuse from "fuse.js";

/**
 * Overrides SearchState
 * */
export type FuzzySearchProps<T> = {
  value?: string;
  defaultValue?: string;
  excludedHiddenColumns?: boolean; //Default true
  excludeColumns?: string[];
  onValueChange?: (value: string) => void;
  options?: Omit<Fuse.IFuseOptions<T>, "keys" | "getFn"> & {
    getFn?: Fuse.FuseGetFunction<T> extends (...args: infer U) => infer R
      ? (cellValue: unknown, ...args: U) => R
      : never;
  };
};

export const FuzzySearch = <T,>(props: FuzzySearchProps<T>): JSX.Element => {
  const [uncontrolledSearchValue, setUncontrolledSearchValue] = useState(
    props.defaultValue?.trim() ?? ""
  );

  const searchValue = props.value?.trim() ?? uncontrolledSearchValue.trim();

  const rowsFilter = useCallback<ComputedFn>(
    (getters) => {
      if (!searchValue) {
        return getters.rows;
      } else {
        const {
          rows,
          hiddenColumnNames = [],
          columns,
        } = (getters as unknown) as {
          rows: T[];
          hiddenColumnNames?: string[];
          columns: ReadonlyArray<Column>;
        };

        const excludeColumns = props.excludeColumns || [];
        if (props.excludedHiddenColumns ?? true) {
          excludeColumns.push(...hiddenColumnNames);
        }

        const [keys, getCellValueMap] = columns.reduce(
          (results, { name, getCellValue }) => {
            if (!excludeColumns.includes(name)) {
              results[0].push(name);
              if (getCellValue) {
                results[1].set(name, getCellValue);
              }
            }
            return results;
          },
          [[], new Map()] as [string[], Map<string, GetCellValueFn>]
        );

        const { getFn: userGetFn, ...options } = props.options || {};

        const defaultGetFn = (
          ...args: Parameters<Fuse.FuseGetFunction<T>>
        ): unknown[] => {
          return (Array.isArray(args[1]) ? args[1] : [args[1]]).reduce(
            (values, columnName) => {
              if (getCellValueMap.has(columnName)) {
                values.push(
                  (getCellValueMap.get(columnName) as GetCellValueFn)(
                    args[0],
                    columnName
                  )
                );
              } else {
                const result = ((Fuse as unknown) as {
                  config: Required<Fuse.IFuseOptions<T>>;
                }).config.getFn(...args);

                if (Array.isArray(result)) {
                  values.push(...result);
                } else {
                  values.push(result);
                }
              }

              return values;
            },
            [] as unknown[]
          );
        };

        const getFn = userGetFn
          ? (...args: Parameters<Fuse.FuseGetFunction<T>>) =>
              defaultGetFn(...args).reduce((values: string[], cellValue) => {
                const result = userGetFn(cellValue, ...args);

                if (Array.isArray(result)) {
                  values.push(...(result as string[]));
                } else {
                  values.push(result as string);
                }

                return values;
              }, [] as string[])
          : (defaultGetFn as Fuse.FuseGetFunction<T>);

        return new Fuse(rows, { ...options, keys, getFn })
          .search(searchValue)
          .map(({ item }) => item);
      }
    },
    [
      searchValue,
      props.options,
      props.excludedHiddenColumns,
      props.excludeColumns,
    ]
  );

  return (
    <Plugin name="SearchState">
      <Getter name="searchValue" value={searchValue} />
      <Getter name="rows" computed={rowsFilter} />
      <Action
        name="changeSearchValue"
        action={props.onValueChange || setUncontrolledSearchValue}
      />
    </Plugin>
  );
};

export default FuzzySearch;
