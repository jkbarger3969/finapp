import React, { useCallback, useMemo } from "react";
import { TableCell } from "@material-ui/core";
import { IntegratedFiltering } from "@devexpress/dx-react-grid";
import TreeSelect, { TreeSelectProps } from "mui-tree-select";

import { treeSelectProps } from "./shared";
import {
  CategoryInputOpt,
  getOptionLabel,
  getOptionSelected,
} from "../../../Inputs/categoryInputUtils";
import { Filter, LogicFilter } from "../plugins/FilterColumnsState";
import { GridEntryFragment as GridEntry } from "../../../../apollo/graphTypes";
import { FilterCellComponentProps } from "../plugins";

export const columnExtension = (
  columnName: string,
  toString: (value: GridEntry["category"]) => string
): IntegratedFiltering.ColumnExtension => ({
  columnName,
  predicate: (value, filter, row): boolean => {
    switch (filter.operation) {
      case "equal":
        return (
          ((filter as unknown) as Filter<CategoryInputOpt>).value.id ===
          (value as GridEntry["category"]).id
        );
      case "notEqual":
        return (
          ((filter as unknown) as Filter<CategoryInputOpt>).value.id !==
          (value as GridEntry["category"]).id
        );
      default:
        return IntegratedFiltering.defaultPredicate(
          toString(value as GridEntry["category"]),
          filter,
          row
        );
    }
  },
});

const onBranchChange = () => void undefined;

export const CategoryFilter = (
  props: FilterCellComponentProps<{
    categoryFilterOpts: CategoryInputOpt[];
  }>
): JSX.Element => {
  const {
    categoryFilterOpts,
    changeColumnFilter,
    column,
    colSpan,
    rowSpan,
  } = props;

  const columnName = column.name;

  const options = useMemo<CategoryInputOpt[]>(() => categoryFilterOpts || [], [
    categoryFilterOpts,
  ]);

  const onChange = useCallback<
    NonNullable<
      TreeSelectProps<CategoryInputOpt, true, false, false>["onChange"]
    >
  >(
    (_, value) => {
      if (value.length === 0) {
        changeColumnFilter({
          columnName,
          config: null,
        });
      } else {
        const logicFilter: LogicFilter<CategoryInputOpt> = {
          operator: "or",
          filters: [],
        };

        for (const categoryOpt of value) {
          logicFilter.filters.push({
            operation: "equal",
            value: categoryOpt,
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
      <TreeSelect<CategoryInputOpt, true, false, false>
        {...treeSelectProps}
        getOptionLabel={getOptionLabel}
        getOptionSelected={getOptionSelected}
        onBranchChange={onBranchChange}
        multiple
        onChange={onChange}
        options={options}
      />
    </TableCell>
  );
};

export default CategoryFilter;
