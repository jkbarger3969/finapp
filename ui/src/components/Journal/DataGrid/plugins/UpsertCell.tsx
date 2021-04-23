import React, { useCallback } from "react";
import {
  Plugin,
  Template,
  TemplatePlaceholder,
  TemplateProps,
} from "@devexpress/dx-react-core";
import {
  Table,
  TableEditRow,
  TableInlineCellEditing,
} from "@devexpress/dx-react-grid-material-ui";

const isUpsertTableCell = (
  props: TableEditRow.CellProps | TableInlineCellEditing.CellProps
) => {
  const { tableRow, tableColumn } = props;

  return (
    (tableRow.type === TableEditRow.EDIT_ROW_TYPE ||
      tableRow.type === TableEditRow.ADDED_ROW_TYPE) &&
    tableColumn.type === Table.COLUMN_TYPE
  );
};

export const UpsertCell = (props: TableEditRow.CellProps): JSX.Element => {
  const {
    upsertCellComponent: FilterCellComponent = TableEditRow.Cell,
    ...rest
  } = props as TableEditRow.CellProps & {
    upsertCellComponent?: React.ComponentType<
      TableEditRow.CellProps & { isUpdate?: boolean }
    >;
    isUpdate?: boolean;
  };
  return <FilterCellComponent {...rest} />;
};

export type UpsertCellComponentProps<T = Record<string, unknown>> = T &
  (TableEditRow.CellProps | TableInlineCellEditing.CellProps) & {
    isUpdate: boolean;
  };

export type UpsertCellComponent<
  T = Record<string, unknown>
> = React.ComponentType<UpsertCellComponentProps<T>>;

export interface UpsertCellProviderProps<T extends string = string> {
  cells?: Partial<Record<T, UpsertCellComponent>>;
  cellsProps?: Partial<Record<T, Record<string, unknown>>>;
  defaultCellProps?: Record<string, unknown>;
}

export const UpsertCellProvider = (
  props: UpsertCellProviderProps
): JSX.Element => {
  const { cells = {}, cellsProps = {}, defaultCellProps = {} } = props;

  return (
    <Plugin name="UpsertCellProvider">
      <Template
        name="tableCell"
        predicate={isUpsertTableCell as TemplateProps["predicate"]}
      >
        {useCallback(
          (params) => {
            const { tableColumn, tableRow } = params as Table.CellProps;

            const isUpdate = tableRow.type === TableEditRow.EDIT_ROW_TYPE;

            const columnName = tableColumn.column?.name;

            const props =
              columnName && columnName in cellsProps
                ? cellsProps[columnName]
                : {};

            if (columnName && columnName in cells) {
              return (
                <TemplatePlaceholder
                  params={{
                    ...params,
                    ...defaultCellProps,
                    ...props,
                    upsertCellComponent: cells[columnName],
                    isUpdate,
                  }}
                />
              );
            } else {
              return (
                <TemplatePlaceholder
                  params={{
                    ...params,
                    ...defaultCellProps,
                    ...props,
                    upsertCellComponent: TableEditRow.Cell,
                  }}
                />
              );
            }
          },
          [cells, cellsProps, defaultCellProps]
        )}
      </Template>
    </Plugin>
  );
};
