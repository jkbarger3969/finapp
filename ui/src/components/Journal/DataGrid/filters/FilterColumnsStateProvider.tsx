import React, { PropsWithChildren } from "react";
import {
  Plugin,
  Template,
  TemplatePlaceholder,
  TemplateConnector,
} from "@devexpress/dx-react-core";
import { Table, TableFilterRow } from "@devexpress/dx-react-grid-material-ui";
import { Option } from "mui-tree-select";

import { DeptInputOpt } from "../../../Inputs/DepartmentInput";
import { CategoryInputOpt } from "../../../Inputs/CategoryInput";
import { ChangeColumnFilter } from "./FilterColumnsState";
import { PayMethodInputOpt } from "../../../Inputs/PaymentMethodInput";

const isFilterTableCell = ({
  tableRow,
  tableColumn,
}: TableFilterRow.CellProps) =>
  tableRow.type === TableFilterRow.ROW_TYPE &&
  tableColumn.type === Table.COLUMN_TYPE;

export type FilterColumnsStateProviderProps = {
  deptFilterOpts?: Option<DeptInputOpt>[];
  categoryFilterOpts?: Option<CategoryInputOpt>[];
  payMethodFilterOpts?: Option<PayMethodInputOpt>[];
};

export type FilterCellProps = PropsWithChildren<TableFilterRow.CellProps> &
  FilterColumnsStateProviderProps & {
    changeColumnFilter: ChangeColumnFilter;
  };

export const FilterColumnsStateProvider = (
  props: FilterColumnsStateProviderProps
): JSX.Element => (
  <Plugin name="FilterColumnsStateProvider">
    <Template
      name="tableCell"
      predicate={(params) =>
        isFilterTableCell(params as TableFilterRow.CellProps)
      }
    >
      {(params) => (
        <TemplateConnector>
          {(_, actions) => (
            <TemplatePlaceholder
              params={{
                ...params,
                ...props,
                changeColumnFilter: actions.changeColumnFilter,
              }}
            />
          )}
        </TemplateConnector>
      )}
    </Template>
  </Plugin>
);

export default FilterColumnsStateProvider;
