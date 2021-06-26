import React, { useCallback, useMemo, useState } from "react";
import {
  Table,
  TableFilterRow,
  TableEditRow,
} from "@devexpress/dx-react-grid-material-ui";
import TreeSelect, {
  ValueNode,
  BranchNode,
  defaultInput,
  TreeSelectProps,
  FreeSoloNode,
} from "mui-tree-select";
import { IntegratedFiltering } from "@devexpress/dx-react-grid";

import {
  EntitiesWhere,
  GridEntryFragment,
} from "../../../../apollo/graphTypes";
import { OnFilter } from "../plugins";
import {
  EntityInput,
  EntityTreeSelectProps,
  EntityDefaultInputOpt,
  EntityInputOpt,
  getOptionLabel as getOptionLabelUtil,
  getOptionSelected as getOptionSelectedUtil,
  EntityInputProps,
} from "../../../Inputs/Entity";
import { Filter, LogicFilter } from "../plugins";
import {
  inlineAutoCompleteProps,
  inlineInputProps,
  inlinePadding,
  RowChangesProp,
} from "./shared";
import { GridEntry } from "../Grid";

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
  onFilter: OnFilter<EntityInputOpt, "equal">;
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
  const { srcFilterOpts, ...rest } = props;

  const columnName = props.column.name;

  const [state, setState] = useState<{
    branch?: BranchNode<EntityDefaultInputOpt | "Department">;
  }>({});

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
    } else if (state.branch) {
      const typename = state.branch.valueOf();
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
  }, [srcFilterOpts, state.branch]);

  const onBranchChange = useCallback<
    TreeSelectProps<
      SrcFilterInputOpt,
      SrcFilterInputOpt,
      true,
      false,
      false
    >["onBranchChange"]
  >(
    (_, branchOption) => {
      setState((state) => ({
        ...state,
        branch: branchOption as BranchNode<
          EntityDefaultInputOpt | "Department"
        >,
      }));
    },
    [setState]
  );

  const onChange = useCallback<
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
        const logicFilter: LogicFilter<EntityInputOpt, "equal"> = {
          operator: "or",
          filters: [],
        };

        for (const val of value) {
          logicFilter.filters.push({
            operation: "equal",
            value: val.valueOf(),
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

  return (
    <TableFilterRow.Cell
      {...(rest as TableFilterRow.CellProps)}
      style={inlinePadding}
    >
      <TreeSelect<EntityInputOpt, SrcFilterInputOpt, true, false, false>
        getOptionLabel={getOptionLabel}
        getOptionSelected={getOptionSelected}
        onBranchChange={onBranchChange}
        multiple
        onChange={onChange}
        options={options}
        renderInput={renderInput}
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
    switch (filter.operation) {
      case "equal": {
        const filterValue = ((filter as unknown) as Filter<EntityInputOpt>)
          .value;

        return (
          filterValue.__typename ===
            (value as GridEntryFragment["source"]).__typename &&
          filterValue.id === (value as GridEntryFragment["source"]).id
        );
      }
      case "notEqual": {
        const filterValue = ((filter as unknown) as Filter<EntityInputOpt>)
          .value;

        return (
          filterValue.__typename !==
            (value as GridEntryFragment["source"]).__typename ||
          filterValue.id !== (value as GridEntryFragment["source"]).id
        );
      }
      default:
        return IntegratedFiltering.defaultPredicate(
          toString(value as GridEntryFragment["source"]),
          filter,
          row
        );
    }
  },
});

// Edit Cell
export type SourceRowChanges = {
  source: Exclude<EntityTreeSelectProps["value"], undefined | EntityInputOpt>;
};

export type SourceEditorProps = TableEditRow.CellProps & {
  options?: Pick<EntityInputProps, "renderInput" | "disabled">;
} & RowChangesProp<SourceRowChanges>;

export const SourceEditor = (props: SourceEditorProps): JSX.Element => {
  const {
    options = {},
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    rowChanges,
    ...rest
  } = props;

  const { onValueChange, value: valueProp } = props;

  const value = (valueProp instanceof ValueNode ||
  valueProp instanceof FreeSoloNode
    ? valueProp
    : null) as SourceRowChanges["source"];

  const [iniValue] = useState<EntitiesWhere | undefined>(() => {
    if (valueProp) {
      const { __typename, id } = valueProp as GridEntry["source"];
      switch (__typename) {
        case "Business":
          return {
            businesses: {
              id: {
                eq: id,
              },
            },
          };
        case "Department":
          return {
            departments: {
              id: {
                eq: id,
              },
            },
          };
        case "Person":
          return {
            people: {
              id: {
                eq: id,
              },
            },
          };
      }
    }
  });

  const onChange = useCallback<NonNullable<EntityTreeSelectProps["onChange"]>>(
    (...args) => {
      const [, value] = args;

      onValueChange(value);
    },
    [onValueChange]
  );

  return (
    <TableEditRow.Cell {...rest}>
      <EntityInput
        {...options}
        iniValue={iniValue}
        disabled={!props.editingEnabled || !!props.options?.disabled}
        onChange={onChange}
        value={value}
      />
    </TableEditRow.Cell>
  );
};
