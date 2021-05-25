import React, { useCallback, useMemo } from "react";
import {
  Table,
  TableEditRow,
  TableFilterRow,
} from "@devexpress/dx-react-grid-material-ui";
import {
  Plugin,
  Template,
  TemplateConnector,
  TemplatePlaceholder,
  TemplateProps,
} from "@devexpress/dx-react-core";

import {
  ChangeColumnFilter,
  ColumnFilter,
  Filter,
  OnFilter,
} from "./FilterColumnsState";

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

const isEditCell = (props: Table.CellProps) => {
  const { tableRow, tableColumn } = props;

  return (
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ((tableRow as any).hasEditCell && (tableColumn as any).hasEditCell) ||
    (tableRow.type === TableEditRow.EDIT_ROW_TYPE &&
      tableColumn.type === Table.COLUMN_TYPE)
  );
};

const isAddCell = ({ tableRow, tableColumn }: Table.CellProps) =>
  tableRow.type === TableEditRow.ADDED_ROW_TYPE &&
  tableColumn.type === Table.COLUMN_TYPE;

const isFilterCell = ({ tableRow, tableColumn }: Table.CellProps) =>
  tableRow.type === TableFilterRow.ROW_TYPE &&
  tableColumn.type === Table.COLUMN_TYPE;

export const DataCellProvider = <ColumnNames extends string = string>(
  props: CellProviderProps<ColumnNames>
): JSX.Element => {
  return (
    <Plugin>
      <Template
        name="tableCell"
        predicate={isDataCell as TemplateProps["predicate"]}
      >
        {useCallback(
          (params: Table.CellProps) => {
            const columnName = (params.tableColumn.column?.name ||
              "") as ColumnNames;

            const cellProviderCellOptions = props[columnName];

            return (
              <TemplatePlaceholder
                params={{
                  ...params,
                  cellProviderCellOptions,
                }}
              />
            );
          },
          [props]
        )}
      </Template>
    </Plugin>
  );
};

export const FilterCellProvider = <ColumnNames extends string = string>(
  props: CellProviderProps<ColumnNames>
): JSX.Element => {
  return (
    <Plugin>
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
                {(_, { changeColumnFilterState }) => (
                  <TemplatePlaceholder
                    params={{
                      ...params,
                      cellProviderCellOptions,
                      changeColumnFilterState,
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

export const EditCellProvider = <ColumnNames extends string = string>(
  props: CellProviderProps<ColumnNames>
): JSX.Element => {
  return (
    <Plugin>
      <Template
        name="tableCell"
        predicate={isEditCell as TemplateProps["predicate"]}
      >
        {useCallback(
          (params: Table.CellProps) => {
            const columnName = (params.tableColumn.column?.name ||
              "") as ColumnNames;

            const cellProviderCellOptions = props[columnName];

            return (
              <TemplateConnector>
                {({ rowChanges }) => {
                  return (
                    <TemplatePlaceholder
                      params={{
                        ...params,
                        cellProviderCellOptions,
                        rowChanges,
                      }}
                    />
                  );
                }}
              </TemplateConnector>
            );
          },
          [props]
        )}
      </Template>
    </Plugin>
  );
};

export const AddCellProvider = <ColumnNames extends string = string>(
  props: CellProviderProps<ColumnNames>
): JSX.Element => {
  return (
    <Plugin>
      <Template
        name="tableCell"
        predicate={isAddCell as TemplateProps["predicate"]}
      >
        {useCallback(
          (params: Table.CellProps) => {
            const columnName = (params.tableColumn.column?.name ||
              "") as ColumnNames;

            const cellProviderCellOptions = props[columnName];

            return (
              <TemplateConnector>
                {({ rowChanges }) => {
                  return (
                    <TemplatePlaceholder
                      params={{
                        ...params,
                        cellProviderCellOptions,
                        rowChanges,
                      }}
                    />
                  );
                }}
              </TemplateConnector>
            );
          },
          [props]
        )}
      </Template>
    </Plugin>
  );
};

export const DataCell = (props: Table.DataCellProps): JSX.Element => {
  const { cellProviderCellOptions, ...rest } = props as Table.DataCellProps & {
    cellProviderCellOptions: CellProviderCellOptions;
  };

  const { cell: CellComponent = Table.Cell, props: cellProps = {} } =
    cellProviderCellOptions || {};

  return (
    <CellComponent
      {...(typeof cellProps === "function"
        ? cellProps(rest)
        : { ...rest, ...cellProps })}
    />
  );
};

export const FilterCell = (props: TableFilterRow.CellProps): JSX.Element => {
  const {
    cellProviderCellOptions,
    changeColumnFilterState,
    ...rest
  } = props as TableFilterRow.CellProps & {
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
      return (filter: Filter | ColumnFilter | null): void => {
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
};

export const EditCell = (props: TableEditRow.CellProps): JSX.Element => {
  const {
    cellProviderCellOptions,
    rowChanges,
    ...rest
  } = props as TableEditRow.CellProps & {
    cellProviderCellOptions: CellProviderCellOptions;
    rowChanges: unknown;
  };

  const { cell: CellComponent, props: cellProps = {} } =
    cellProviderCellOptions || {};

  if (CellComponent) {
    return (
      <CellComponent
        rowChanges={rowChanges}
        {...(typeof cellProps === "function"
          ? cellProps(rest)
          : { ...rest, ...cellProps })}
      />
    );
  } else {
    return (
      <TableEditRow.Cell
        {...(typeof cellProps === "function"
          ? cellProps(rest)
          : { ...rest, ...cellProps })}
      />
    );
  }
};
