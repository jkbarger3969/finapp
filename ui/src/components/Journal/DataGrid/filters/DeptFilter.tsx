import React, { useCallback, useMemo } from "react";
import { TableCell } from "@material-ui/core";
import { IntegratedFiltering } from "@devexpress/dx-react-grid";
import TreeSelect, { TreeSelectProps } from "mui-tree-select";

import { treeSelectProps } from "./shared";
import {
  DeptInputOpt,
  getOptionLabel,
  getOptionSelected,
} from "../../../Inputs/departmentInputUtils";
import { Filter, LogicFilter } from "../plugins/FilterColumnsState";
import { FilterCellComponentProps } from "../plugins/FilterCell";

export const columnExtension = (
  columnName: string,
  toString: (value: DeptInputOpt) => string
): IntegratedFiltering.ColumnExtension => ({
  columnName,
  predicate: (value, filter, row): boolean => {
    switch (filter.operation) {
      case "equal":
        return (
          ((filter as unknown) as Filter<DeptInputOpt>).value.id ===
          (value as DeptInputOpt).id
        );
      case "notEqual":
        return (
          ((filter as unknown) as Filter<DeptInputOpt>).value.id !==
          (value as DeptInputOpt).id
        );
      default:
        return IntegratedFiltering.defaultPredicate(
          toString(value as DeptInputOpt),
          filter,
          row
        );
    }
  },
});

const onBranchChange = () => void undefined;

export const DeptFilter = (
  props: FilterCellComponentProps<{
    deptFilterOpts: DeptInputOpt[];
  }>
): JSX.Element => {
  const {
    deptFilterOpts,
    changeColumnFilter,
    column,
    colSpan,
    rowSpan,
  } = props;

  const columnName = column.name;

  const options = useMemo<DeptInputOpt[]>(() => deptFilterOpts || [], [
    deptFilterOpts,
  ]);

  const onChange = useCallback<
    NonNullable<TreeSelectProps<DeptInputOpt, true, false, false>["onChange"]>
  >(
    (_, value) => {
      if (value.length === 0) {
        changeColumnFilter({
          columnName,
          config: null,
        });
      } else {
        const logicFilter: LogicFilter<DeptInputOpt> = {
          operator: "or",
          filters: [],
        };

        for (const departmentOpt of value) {
          logicFilter.filters.push({
            operation: "equal",
            value: departmentOpt,
          });
        }

        changeColumnFilter({
          columnName,
          config: {
            filters: [logicFilter],
          },
        });
      }
    },
    [changeColumnFilter, columnName]
  );

  return (
    <TableCell
      colSpan={colSpan}
      padding="checkbox"
      rowSpan={rowSpan}
      size="small"
      variant="head"
    >
      <TreeSelect<DeptInputOpt, true, false, false>
        {...treeSelectProps}
        getOptionLabel={getOptionLabel}
        getOptionSelected={getOptionSelected}
        multiple
        onBranchChange={onBranchChange}
        onChange={onChange}
        options={options}
      />
    </TableCell>
  );
};

export default DeptFilter;
