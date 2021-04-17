import React, { useCallback, useMemo, useState } from "react";
import { TableCell } from "@material-ui/core";
import { IntegratedFiltering } from "@devexpress/dx-react-grid";
import TreeSelect, { BranchOption, TreeSelectProps } from "mui-tree-select";

import { treeSelectProps } from "./shared";
import {
  SrcTypedInputOpt,
  getOptionLabel as getOptionLabelUtil,
  getOptionSelected as getOptionSelectedUtil,
  SrcDefaultInputOpt,
} from "../../../Inputs/sourceInputUtils";
import { Filter, LogicFilter } from "../plugins/FilterColumnsState";
import {
  GridEntryFragment as GridEntry,
  GridEntrySrcPersonFragment,
} from "../../../../apollo/graphTypes";
import { FilterCellComponentProps } from "../plugins";

const textFieldProps: NonNullable<
  TreeSelectProps<SrcFilterInputOpt, true, false, false>["textFieldProps"]
> = {
  ...(treeSelectProps.textFieldProps || {}),
};

// Grid Entry source aliases name in Person to personName.
const getOptionLabel: NonNullable<
  TreeSelectProps<SrcFilterInputOpt, true, false, false>["getOptionLabel"]
> = (option) => {
  if (typeof option === "string") {
    return option;
  } else if (
    ((option as unknown) as GridEntrySrcPersonFragment)?.__typename === "Person"
  ) {
    const {
      first,
      last,
    } = ((option as unknown) as GridEntrySrcPersonFragment).personName;
    return `${first} ${last}`;
  } else {
    return getOptionLabelUtil(option as SrcTypedInputOpt);
  }
};

const getOptionSelected: NonNullable<
  TreeSelectProps<SrcFilterInputOpt, true, false, false>["getOptionSelected"]
> = (option, value) => {
  if (typeof option === "string" || typeof value === "string") {
    return option === value;
  } else {
    return getOptionSelectedUtil(option, value);
  }
};

export type SrcFilterInputOpt =
  | SrcTypedInputOpt
  | SrcDefaultInputOpt
  | "Department";

export const columnExtension = (
  columnName: string,
  toString: (value: GridEntry["source"]) => string
): IntegratedFiltering.ColumnExtension => ({
  columnName,
  predicate: (value, filter, row): boolean => {
    switch (filter.operation) {
      case "equal": {
        const filterValue = ((filter as unknown) as Filter<SrcTypedInputOpt>)
          .value;

        return (
          filterValue.__typename ===
            (value as GridEntry["source"]).__typename &&
          filterValue.id === (value as GridEntry["source"]).id
        );
      }
      case "notEqual": {
        const filterValue = ((filter as unknown) as Filter<SrcTypedInputOpt>)
          .value;

        return (
          filterValue.__typename !==
            (value as GridEntry["source"]).__typename ||
          filterValue.id !== (value as GridEntry["source"]).id
        );
      }
      default:
        return IntegratedFiltering.defaultPredicate(
          toString(value as GridEntry["source"]),
          filter,
          row
        );
    }
  },
});

export const SourceFilter = (
  props: FilterCellComponentProps<{
    srcFilterOpts: SrcTypedInputOpt[];
  }>
): JSX.Element => {
  const { srcFilterOpts, changeColumnFilter, column, colSpan, rowSpan } = props;

  const columnName = column.name;

  const [state, setState] = useState<{
    branch?: BranchOption<SrcDefaultInputOpt | "Department">;
  }>({});

  const options = useMemo<
    TreeSelectProps<SrcFilterInputOpt, true, false, false>["options"]
  >(() => {
    if (!srcFilterOpts) {
      return [];
    } else if (state.branch) {
      const typename = state.branch.option;
      return srcFilterOpts.filter((option) => option.__typename === typename);
    } else {
      const branchOptions = new Set<SrcDefaultInputOpt | "Department">();

      for (const { __typename } of srcFilterOpts) {
        branchOptions.add(__typename);
        if (branchOptions.size === 3) {
          break;
        }
      }

      if (branchOptions.size === 1) {
        return srcFilterOpts;
      }

      return [...branchOptions.values()].map(
        (branchOption) => new BranchOption(branchOption)
      );
    }
  }, [srcFilterOpts, state.branch]);

  const onBranchChange = useCallback<
    TreeSelectProps<SrcFilterInputOpt, true, false, false>["onBranchChange"]
  >(
    (_, branchOption) => {
      setState((state) => ({
        ...state,
        branch: branchOption as BranchOption<SrcDefaultInputOpt | "Department">,
      }));
    },
    [setState]
  );

  const onChange = useCallback<
    NonNullable<
      TreeSelectProps<SrcFilterInputOpt, true, false, false>["onChange"]
    >
  >(
    (_, value) => {
      if (value.length === 0) {
        changeColumnFilter({
          columnName,
          config: null,
        });
      } else {
        // Other options will ONLY be BranchOption(s) and never called onChange.
        const logicFilter: LogicFilter<SrcTypedInputOpt> = {
          operator: "or",
          filters: [],
        };

        for (const sourceOpt of value as SrcTypedInputOpt[]) {
          logicFilter.filters.push({
            operation: "equal",
            value: sourceOpt,
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
      <TreeSelect<SrcFilterInputOpt, true, false, false>
        {...treeSelectProps}
        textFieldProps={textFieldProps}
        getOptionLabel={getOptionLabel}
        getOptionSelected={getOptionSelected}
        onBranchChange={onBranchChange}
        multiple
        onChange={onChange}
        options={options}
        placeholder={"Filter"}
      />
    </TableCell>
  );
};

export default SourceFilter;
