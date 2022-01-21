import React, { useCallback, useMemo } from "react";
import { Table, TableFilterRow } from "@devexpress/dx-react-grid-material-ui";
import {
  Plugin,
  Template,
  TemplateConnector,
  TemplatePlaceholder,
  TemplateProps,
} from "@devexpress/dx-react-core";

import { ChangeColumnFilter, Filters, OnFilter } from "./Filtering";

export type CellProviderCellOptions = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  cell?: React.ComponentType<any>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  props?: Record<string, any> | ((props: any) => Record<string, any>);
};

export type CellProviderProps<ColumnNames extends string = string> = Partial<
  Record<ColumnNames, CellProviderCellOptions>
>;

export const mergeTableCellProps = (
  ...props: NonNullable<CellProviderCellOptions["props"]>[]
): NonNullable<CellProviderCellOptions["props"]> =>
  props.reduce((prevProps, nextProps) => {
    if (typeof prevProps === "function") {
      if (typeof nextProps === "function") {
        return (props) => nextProps(prevProps(props));
      } else {
        return (props) => ({
          ...prevProps(props),
          ...nextProps,
        });
      }
    } else if (typeof nextProps === "function") {
      return (props) =>
        nextProps({
          ...props,
          ...prevProps,
        });
    } else {
      return {
        ...prevProps,
        ...nextProps,
      };
    }
  });

const isDataCell = ({ tableRow, tableColumn }: Table.CellProps) =>
  tableRow.type === Table.ROW_TYPE && tableColumn.type === Table.COLUMN_TYPE;

const isFilterCell = ({ tableRow, tableColumn }: Table.CellProps) =>
  tableRow.type === TableFilterRow.ROW_TYPE &&
  tableColumn.type === Table.COLUMN_TYPE;

export const DataCellProvider = React.memo(function DataCellProvider<
  ColumnNames extends string = string
>(props: CellProviderProps<ColumnNames>): JSX.Element {
  return (
    <Plugin name="DataCellProvider">
      <Template
        name="tableCell"
        predicate={isDataCell as TemplateProps["predicate"]}
      >
        {useCallback(
          (params: Table.CellProps) => {
            const columnName = (params.tableColumn.column?.name ||
              "") as ColumnNames;

            const dataCellProviderCellOptions = props[columnName];

            return (
              <TemplatePlaceholder
                params={{
                  ...params,
                  dataCellProviderCellOptions,
                }}
              />
            );
          },
          [props]
        )}
      </Template>
    </Plugin>
  );
});

export const FilterCellProvider = <ColumnNames extends string = string>(
  props: CellProviderProps<ColumnNames>
): JSX.Element => {
  return (
    <Plugin name="FilterCellProvider">
      <Template
        name="tableCell"
        predicate={isFilterCell as TemplateProps["predicate"]}
      >
        {useCallback(
          (params: Table.CellProps) => {
            const columnName = (params.tableColumn.column?.name ||
              "") as ColumnNames;

            const cellProviderCellOptions = props[columnName];

            return (
              <TemplateConnector>
                {() => (
                  <TemplatePlaceholder
                    params={{
                      ...params,
                      cellProviderCellOptions,
                    }}
                  />
                )}
              </TemplateConnector>
            );
          },
          [props]
        )}
      </Template>
    </Plugin>
  );
};

export const DataCell = React.memo(function DataCell(
  props: Table.DataCellProps
): JSX.Element {
  const { dataCellProviderCellOptions, ...rest } =
    props as Table.DataCellProps & {
      dataCellProviderCellOptions?: CellProviderCellOptions;
    };

  const CellComponent = dataCellProviderCellOptions?.cell || Table.Cell;
  const cellProps = dataCellProviderCellOptions?.props;
  return (
    <CellComponent
      {...(typeof cellProps === "function"
        ? cellProps(rest)
        : { ...rest, ...cellProps })}
    />
  );
});

export const FilterCell = React.memo(function FilterCell(
  props: TableFilterRow.CellProps
): JSX.Element {
  const { cellProviderCellOptions, changeColumnFilterState, ...rest } =
    props as TableFilterRow.CellProps & {
      changeColumnFilterState?: ChangeColumnFilter;
      cellProviderCellOptions: CellProviderCellOptions;
    };

  const { cell: CellComponent = TableFilterRow.Cell, props: cellProps = {} } =
    cellProviderCellOptions || {};

  const filterCellProps =
    typeof cellProps === "function"
      ? cellProps(rest)
      : {
          ...rest,
          ...cellProps,
        };

  const onFilter = useMemo<
    OnFilter | TableFilterRow.CellProps["onFilter"] | undefined
  >(() => {
    if (changeColumnFilterState) {
      return (filter: Filters | null): void => {
        if (!filter) {
          changeColumnFilterState({
            columnName: filterCellProps.tableColumn.column?.name || "",
            config: null,
          });
        } else {
          const { columnName, ...config } = filter;
          changeColumnFilterState({
            columnName,
            config,
          });
        }
      };
    } else {
      return filterCellProps.onFilter;
    }
  }, [
    filterCellProps.onFilter,
    changeColumnFilterState,
    filterCellProps.tableColumn.column?.name,
  ]);

  return (
    <CellComponent
      {...filterCellProps}
      onFilter={onFilter as TableFilterRow.CellProps["onFilter"]}
    />
  );
});
