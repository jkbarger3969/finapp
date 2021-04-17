import React from "react";
import {
  Plugin,
  Template,
  TemplatePlaceholder,
  TemplateConnector,
} from "@devexpress/dx-react-core";
import { Table, TableFilterRow } from "@devexpress/dx-react-grid-material-ui";
import { ChangeColumnFilter } from "./FilterColumnsState";

const isFilterTableCell = ({
  tableRow,
  tableColumn,
}: TableFilterRow.CellProps) =>
  tableRow.type === TableFilterRow.ROW_TYPE &&
  tableColumn.type === Table.COLUMN_TYPE;

export const FilterCell = (props: TableFilterRow.CellProps): JSX.Element => {
  const {
    filterCellComponent: FilterCellComponent = TableFilterRow.Cell,
    ...rest
  } = props as TableFilterRow.CellProps & {
    filterCellComponent?: React.ComponentType<
      TableFilterRow.CellProps & { changeColumnFilter?: ChangeColumnFilter }
    >;
    changeColumnFilter?: ChangeColumnFilter;
  };

  return <FilterCellComponent {...rest} />;
};

export type FilterCellComponentProps<T = Record<string, unknown>> = T &
  TableFilterRow.CellProps & { changeColumnFilter: ChangeColumnFilter };

export type FilterCellComponent<
  T = Record<string, unknown>
> = React.ComponentType<FilterCellComponentProps<T>>;

export interface FilterCellProviderProps<T extends string = string> {
  filterCell?: Partial<Record<T, FilterCellComponent>>;
  filterCellProps?: Partial<Record<T, Record<string, unknown>>>;
  defaultCellProps?: Record<string, unknown>;
}

export const FilterCellProvider = (
  props: FilterCellProviderProps
): JSX.Element => {
  const {
    filterCell = {},
    filterCellProps = {},
    defaultCellProps = {},
  } = props;

  return (
    <Plugin name="FilterCellProvider">
      <Template
        name="tableCell"
        predicate={(params) =>
          isFilterTableCell(params as TableFilterRow.CellProps)
        }
      >
        {(params) => (
          <TemplateConnector>
            {(_, actions) => {
              const columnName = (params as Table.CellProps).tableColumn.column
                ?.name;

              const props =
                columnName && columnName in filterCellProps
                  ? filterCellProps[columnName]
                  : {};

              if (columnName && columnName in filterCell) {
                return (
                  <TemplatePlaceholder
                    params={{
                      ...params,
                      ...defaultCellProps,
                      ...props,
                      filterCellComponent: filterCell[columnName],
                      changeColumnFilter: actions.changeColumnFilter,
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
                      filterCellComponent: TableFilterRow.Cell,
                    }}
                  />
                );
              }
            }}
          </TemplateConnector>
        )}
      </Template>
    </Plugin>
  );
};
