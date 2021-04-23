import React, { useCallback, useMemo, useState } from "react";
import { Table, TableFilterRow } from "@devexpress/dx-react-grid-material-ui";

import {
  GridEntryFragment,
  GridEntrySrcPersonFragment,
} from "../../../../apollo/graphTypes";
import { OnFilter } from "../plugins/TableCell";
import {
  SrcDefaultInputOpt,
  SrcTypedInputOpt,
  getOptionLabel as getOptionLabelUtil,
  getOptionSelected as getOptionSelectedUtil,
} from "../../../Inputs/sourceInputUtils";
import TreeSelect, { BranchOption, TreeSelectProps } from "mui-tree-select";
import { LogicFilter } from "../plugins";
import { InputProps } from "@material-ui/core";

export const sourceToStr = (src: GridEntryFragment["source"]): string => {
  switch (src.__typename) {
    case "Business":
    case "Department":
      return src.name;
    case "Person":
      return `${src.personName.first} ${src.personName.last}`;
  }
};

export const SourceCell = (props: Table.DataCellProps): JSX.Element => {
  const { value, ...rest } = props;

  return (
    <Table.Cell
      {...rest}
      value={sourceToStr(value as GridEntryFragment["source"])}
    />
  );
};

// Filter Cell
export type SourceFilterProps = Omit<TableFilterRow.CellProps, "onFilter"> & {
  onFilter: OnFilter<SrcTypedInputOpt, "equal">;
  srcFilterOpts?: SrcTypedInputOpt[];
};

export type SrcFilterInputOpt =
  | SrcTypedInputOpt
  | SrcDefaultInputOpt
  | "Department";

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

const textFieldProps = {
  InputProps: {
    margin: "dense",
  } as InputProps,
};
export const SourceFilter = (props: SourceFilterProps): JSX.Element => {
  const { srcFilterOpts, ...rest } = props;

  const columnName = props.column.name;

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
      if (value.length) {
        // Other options will ONLY be BranchOption(s) and never called onChange.
        const logicFilter: LogicFilter<SrcTypedInputOpt, "equal"> = {
          operator: "or",
          filters: [],
        };

        for (const sourceOpt of value as SrcTypedInputOpt[]) {
          logicFilter.filters.push({
            operation: "equal",
            value: sourceOpt,
          });
        }

        props.onFilter({
          columnName,
          filters: [logicFilter],
        });
      } else {
        props.onFilter(null);
      }
    },
    [props.onFilter, columnName]
  );

  return (
    <TableFilterRow.Cell {...(rest as TableFilterRow.CellProps)}>
      <TreeSelect<SrcFilterInputOpt, true, false, false>
        fullWidth
        getOptionLabel={getOptionLabel}
        getOptionSelected={getOptionSelected}
        onBranchChange={onBranchChange}
        multiple
        onChange={onChange}
        options={options}
        placeholder={"Filter"}
        size="small"
        textFieldProps={textFieldProps}
      />
    </TableFilterRow.Cell>
  );
};
