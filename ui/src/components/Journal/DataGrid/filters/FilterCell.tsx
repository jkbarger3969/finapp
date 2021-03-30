import React from "react";
import { TableFilterRow } from "@devexpress/dx-react-grid-material-ui";
import { ReconciledFilter } from "./ReconciledFilter";
import { TypeFilter } from "./TypeFilter";
import { DeptFilter } from "./DeptFilter";
import { CategoryFilter } from "./CategoryFilter";
import { PayMethodFilter } from "./PayMethodFilter";
import { FilterCellProps } from "./FilterColumnsStateProvider";

export const FilterCell = (props: TableFilterRow.CellProps): JSX.Element => {
  const {
    deptFilterOpts,
    categoryFilterOpts,
    payMethodFilterOpts,
    changeColumnFilter,
    ...rest
  } = props as FilterCellProps;
  switch (props.column.name) {
    case "reconciled":
      return <ReconciledFilter {...rest} />;
    case "type":
      return <TypeFilter {...rest} />;
    case "department":
      return (
        <DeptFilter
          {...rest}
          changeColumnFilter={changeColumnFilter}
          deptFilterOpts={deptFilterOpts}
        />
      );
    case "category":
      return (
        <CategoryFilter
          {...rest}
          changeColumnFilter={changeColumnFilter}
          categoryFilterOpts={categoryFilterOpts}
        />
      );
    case "paymentMethod":
      return (
        <PayMethodFilter
          {...rest}
          changeColumnFilter={changeColumnFilter}
          payMethodFilterOpts={payMethodFilterOpts}
        />
      );
    default:
      return <TableFilterRow.Cell {...rest} />;
  }
};

export default FilterCell;
