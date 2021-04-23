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
  DefaultFilterOperations,
  Filter,
} from "./FilterColumnsState";

export type TableCellProviderCellDef<
  T extends string = string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  CellProps = any,
  UseProps extends Table.CellProps = Table.CellProps
> = Partial<
  Record<
    T,
    {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      cell?: React.ComponentType<CellProps>;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      props?: Record<string, any>;
      useProps?: (props: UseProps) => UseProps;
    }
  >
>;

export interface TableCellProviderProps<T extends string = string> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  dataCells?: TableCellProviderCellDef<T, any, Table.DataCellProps>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  editCells?: TableCellProviderCellDef<T, any, TableEditRow.CellProps>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  addCells?: TableCellProviderCellDef<T, any, TableEditRow.CellProps>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  filterCells?: TableCellProviderCellDef<T, any, TableFilterRow.CellProps>;
}

const isDataCell = ({ tableRow, tableColumn }: Table.CellProps) =>
  tableRow.type === Table.ROW_TYPE && tableColumn.type === Table.COLUMN_TYPE;

const isEditCell = ({ tableRow, tableColumn }: Table.CellProps) =>
  tableRow.type === TableEditRow.EDIT_ROW_TYPE &&
  tableColumn.type === Table.COLUMN_TYPE;

const isAddCell = ({ tableRow, tableColumn }: Table.CellProps) =>
  tableRow.type === TableEditRow.ADDED_ROW_TYPE &&
  tableColumn.type === Table.COLUMN_TYPE;

const isFilterCell = ({ tableRow, tableColumn }: Table.CellProps) =>
  tableRow.type === TableFilterRow.ROW_TYPE &&
  tableColumn.type === Table.COLUMN_TYPE;

export const TableCellProvider = (
  props: TableCellProviderProps
): JSX.Element => {
  const { dataCells, editCells, addCells, filterCells } = props;

  return (
    <Plugin name="TableCellProvider">
      {/* Data Cell */}
      <Template
        name="tableCell"
        predicate={isDataCell as TemplateProps["predicate"]}
      >
        {useCallback(
          (params: Table.CellProps) => {
            const [tableCellComponent, props, useProps] = (() => {
              const name = params.tableColumn.column?.name;

              if (dataCells && name && name in dataCells) {
                const { props = {}, useProps, cell = Table.Cell } = dataCells[
                  name
                ] as TableCellProviderCellDef;

                return [cell, props, useProps];
              } else {
                return [Table.Cell, {}];
              }
            })();

            return (
              <TemplatePlaceholder
                params={{
                  ...params,
                  ...props,
                  useProps,
                  tableCellComponent,
                }}
              />
            );
          },
          [dataCells]
        )}
      </Template>
      {/* Edit Cell */}
      <Template
        name="tableCell"
        predicate={isEditCell as TemplateProps["predicate"]}
      >
        {useCallback(
          (params: Table.CellProps) => {
            const [tableCellComponent, props, useProps] = (() => {
              const name = params.tableColumn.column?.name;

              if (editCells && name && name in editCells) {
                const {
                  props = {},
                  useProps,
                  cell = TableEditRow.Cell,
                } = editCells[name] as TableCellProviderCellDef;

                return [cell, props, useProps];
              } else {
                return [TableEditRow.Cell, {}];
              }
            })();

            return (
              <TemplatePlaceholder
                params={{
                  ...params,
                  ...props,
                  useProps,
                  tableCellComponent,
                }}
              />
            );
          },
          [editCells]
        )}
      </Template>
      {/* Add Cell */}
      <Template
        name="tableCell"
        predicate={isAddCell as TemplateProps["predicate"]}
      >
        {useCallback(
          (params: Table.CellProps) => {
            const [tableCellComponent, props, useProps] = (() => {
              const name = params.tableColumn.column?.name;

              if (addCells && name && name in addCells) {
                const {
                  props = {},
                  useProps,
                  cell = TableEditRow.Cell,
                } = addCells[name] as TableCellProviderCellDef;

                return [cell, props, useProps];
              } else {
                return [TableEditRow.Cell, {}];
              }
            })();

            return (
              <TemplatePlaceholder
                params={{
                  ...params,
                  ...props,
                  useProps,
                  tableCellComponent,
                }}
              />
            );
          },
          [addCells]
        )}
      </Template>
      {/* Filter Cell */}
      <Template
        name="tableCell"
        predicate={isFilterCell as TemplateProps["predicate"]}
      >
        {useCallback(
          (params: Table.CellProps) => {
            const [tableCellComponent, props, useProps] = (() => {
              const name = params.tableColumn.column?.name;

              if (filterCells && name && name in filterCells) {
                const {
                  props = {},
                  useProps,
                  cell = TableFilterRow.Cell,
                } = filterCells[name] as TableCellProviderCellDef;

                return [cell, props, useProps];
              } else {
                return [TableFilterRow.Cell, {}];
              }
            })();

            return (
              <TemplateConnector>
                {(_, actions) => (
                  <TemplatePlaceholder
                    params={{
                      ...params,
                      ...props,
                      useProps,
                      tableCellComponent,
                      changeColumnFilterState: actions.changeColumnFilterState,
                    }}
                  />
                )}
              </TemplateConnector>
            );
          },
          [filterCells]
        )}
      </Template>
    </Plugin>
  );
};

export type OnFilter<T = unknown, U = DefaultFilterOperations> = (
  filter: Filter<T, U> | ColumnFilter<T, U> | null
) => void;

export const TableCell = (props: Table.CellProps): JSX.Element => {
  const {
    changeColumnFilterState,
    onFilter: onFilterProp,
    tableCellComponent: TableCellComponent,
    useProps,
    ...rest
  } = props as Table.CellProps & {
    changeColumnFilterState?: ChangeColumnFilter;
    onFilter?: TableFilterRow.CellProps["onFilter"];
    useProps?: (props: Table.CellProps) => Table.CellProps;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    tableCellComponent: React.ComponentType<any>;
  };

  const onFilter = useMemo<
    OnFilter | TableFilterRow.CellProps["onFilter"] | undefined
  >(() => {
    if (onFilterProp && changeColumnFilterState) {
      return (filter: Filter | ColumnFilter | null): void => {
        if (!filter) {
          changeColumnFilterState({
            columnName: props.tableColumn.column?.name || "",
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
      return onFilterProp;
    }
  }, [onFilterProp, changeColumnFilterState, props.tableColumn.column?.name]);

  if (onFilter) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if ((rest as any).boolLabels) {
      console.log(rest, TableCellComponent);
    }
    return (
      <TableCellComponent
        {...(useProps ? useProps(rest) : rest)}
        onFilter={onFilter}
      />
    );
  } else {
    return <TableCellComponent {...(useProps ? useProps(rest) : rest)} />;
  }
};
