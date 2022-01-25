import React, { useCallback, useMemo, useState } from "react";
import { Table, TableFilterRow } from "@devexpress/dx-react-grid-material-ui";
import TreeSelect, {
  BranchNode,
  defaultInput,
  TreeSelectProps,
  ValueNode,
} from "mui-tree-select";
import { IntegratedFiltering } from "@devexpress/dx-react-grid";

import { GridEntryFragment } from "../../../../apollo/graphTypes";
import { TableFilterCellProps } from "../plugins";
import {
  EntityDefaultInputOpt,
  EntityInputOpt,
  getOptionLabel as getOptionLabelUtil,
  getOptionSelected as getOptionSelectedUtil,
} from "../../../Inputs/Entity";
import { Filter } from "../plugins";
import {
  inlineAutoCompleteProps,
  inlineInputProps,
  inlinePadding,
} from "./shared";
import { AvailableFilterOperations } from "../filters/rangeFilterUtils";

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
export type SourceFilterProps = TableFilterCellProps<
  EntityInputOpt,
  Extract<AvailableFilterOperations, "equal">
> & {
  srcFilterOpts?: EntityInputOpt[];
};

export type SrcFilterInputOpt =
  | EntityInputOpt
  | EntityDefaultInputOpt
  | "Department";

// Grid Entry source aliases name in Person to personName.
const getOptionLabel: NonNullable<
  TreeSelectProps<
    SrcFilterInputOpt,
    SrcFilterInputOpt,
    true,
    false,
    false
  >["getOptionLabel"]
> = (option) => {
  const opt = option.valueOf();

  if (typeof opt === "string") {
    return opt;
  } else if (opt?.__typename === "Person") {
    const { first, last } = opt.personName;
    return `${first} ${last}`;
  } else {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return getOptionLabelUtil(option as any);
  }
};

const getOptionSelected: NonNullable<
  TreeSelectProps<
    SrcFilterInputOpt,
    SrcFilterInputOpt,
    true,
    false,
    false
  >["getOptionSelected"]
> = (option, value) => {
  const opt = option.valueOf();
  const val = value.valueOf();

  if (typeof opt === "string" || typeof val === "string") {
    return opt === val;
  } else {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return getOptionSelectedUtil(option as any, value as any);
  }
};

export const SourceFilter = (props: SourceFilterProps): JSX.Element => {
  type SourceFilterTreeProps = TreeSelectProps<
    EntityInputOpt,
    SrcFilterInputOpt,
    true,
    false,
    false
  >;

  const { srcFilterOpts, ...rest } = props;

  const { onFilter, filter } = props;

  const columnName = props.column.name;

  const [branch, setBranch] = useState<SourceFilterTreeProps["branch"]>(null);

  const options = useMemo<
    TreeSelectProps<
      EntityInputOpt,
      SrcFilterInputOpt,
      true,
      false,
      false
    >["options"]
  >(() => {
    if (!srcFilterOpts) {
      return [];
    } else if (branch) {
      const typename = branch.valueOf();
      return srcFilterOpts.filter((option) => option.__typename === typename);
    } else {
      const branchOptions = new Set<EntityDefaultInputOpt | "Department">();

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
        (branchOption) => new BranchNode(branchOption)
      );
    }
  }, [srcFilterOpts, branch]);

  const handleBranchChange = useCallback<
    TreeSelectProps<
      SrcFilterInputOpt,
      SrcFilterInputOpt,
      true,
      false,
      false
    >["onBranchChange"]
  >(
    (_, branchOption) => {
      setBranch(branchOption);
    },
    [setBranch]
  );

  const handleChange = useCallback<
    NonNullable<
      TreeSelectProps<
        EntityInputOpt,
        SrcFilterInputOpt,
        true,
        false,
        false
      >["onChange"]
    >
  >(
    (_, value) => {
      if (value.length) {
        // Other options will ONLY be BranchNode(s) and never called onChange.
        onFilter({
          columnName,
          operator: "or",
          filters: value.map((option) => ({
            operation: "equal",
            value: option.valueOf(),
          })),
        });
      } else {
        onFilter(null);
      }
    },
    [onFilter, columnName]
  );

  const renderInput = useCallback<
    NonNullable<
      TreeSelectProps<
        SrcFilterInputOpt,
        SrcFilterInputOpt,
        true,
        false,
        false
      >["renderInput"]
    >
  >(
    (params) =>
      defaultInput({
        ...params,
        InputProps: {
          ...(params.InputProps || {}),
          ...inlineInputProps,
        },
      }),
    []
  );

  const value = useMemo<ValueNode<EntityInputOpt, SrcFilterInputOpt>[]>(() => {
    if (!filter) {
      return [];
    } else if ("operator" in filter) {
      return filter.filters.reduce((value, filter) => {
        if ("operation" in filter && filter.value) {
          value.push(
            branch
              ? new ValueNode(filter.value, branch)
              : new ValueNode(filter.value)
          );
        }
        return value;
      }, [] as ValueNode<EntityInputOpt, SrcFilterInputOpt>[]);
    }
    return "operation" in filter && filter.value
      ? [
          branch
            ? new ValueNode(filter.value, branch)
            : new ValueNode(filter.value),
        ]
      : [];
  }, [filter, branch]);

  return (
    <TableFilterRow.Cell
      {...(rest as TableFilterRow.CellProps)}
      style={inlinePadding}
    >
      <TreeSelect<EntityInputOpt, SrcFilterInputOpt, true, false, false>
        getOptionLabel={getOptionLabel}
        getOptionSelected={getOptionSelected}
        onBranchChange={handleBranchChange}
        multiple
        onChange={handleChange}
        options={options}
        renderInput={renderInput}
        value={value}
        {...inlineAutoCompleteProps}
      />
    </TableFilterRow.Cell>
  );
};

export const sourceFilterColumnExtension = (
  columnName: string,
  toString: (value: GridEntryFragment["source"]) => string
): IntegratedFiltering.ColumnExtension => ({
  columnName,
  predicate: (value, filter, row): boolean => {
    const filterValue = (filter as unknown as Filter<EntityInputOpt>).value;

    if (filterValue == undefined) {
      return true;
    }

    switch (filter.operation) {
      case "equal":
        return (
          filterValue.__typename ===
            (value as GridEntryFragment["source"]).__typename &&
          filterValue.id === (value as GridEntryFragment["source"]).id
        );
      case "notEqual":
        return (
          filterValue.__typename !==
            (value as GridEntryFragment["source"]).__typename ||
          filterValue.id !== (value as GridEntryFragment["source"]).id
        );
      default:
        return IntegratedFiltering.defaultPredicate(
          toString(value as GridEntryFragment["source"]),
          filter,
          row
        );
    }
  },
});
