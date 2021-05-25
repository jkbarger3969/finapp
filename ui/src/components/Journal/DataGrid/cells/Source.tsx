import React, { useCallback, useMemo, useState } from "react";
import {
  Table,
  TableFilterRow,
  TableEditRow,
} from "@devexpress/dx-react-grid-material-ui";
import TreeSelect, {
  BranchOption,
  defaultInput,
  TreeSelectProps,
} from "mui-tree-select";
import { IntegratedFiltering } from "@devexpress/dx-react-grid";

import {
  GridEntryFragment,
  GridEntrySrcPersonFragment,
} from "../../../../apollo/graphTypes";
import { OnFilter } from "../plugins";
import {
  EntityTreeSelectProps,
  EntityDefaultInputOpt,
  EntityInputOpt,
  getOptionLabel as getOptionLabelUtil,
  getOptionSelected as getOptionSelectedUtil,
  UseSourceTreeOptions,
  useEntryTree,
  EntityBranchInputOpt,
} from "../../../Inputs/entityInputUtils";
import { Filter, LogicFilter } from "../plugins";
import {
  inlineAutoCompleteProps,
  inlineInputProps,
  inlinePadding,
  RowChangesProp,
} from "./shared";

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
    return getOptionLabelUtil(option as EntityInputOpt);
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
  if (typeof option === "string" || typeof value === "string") {
    return option === value;
  } else {
    return getOptionSelectedUtil(option, value);
  }
};

export const SourceFilter = (props: SourceFilterProps): JSX.Element => {
  const { srcFilterOpts, ...rest } = props;

  const columnName = props.column.name;

  const [state, setState] = useState<{
    branch?: BranchOption<EntityDefaultInputOpt | "Department">;
  }>({});

  const options = useMemo<
    TreeSelectProps<
      SrcFilterInputOpt,
      SrcFilterInputOpt,
      true,
      false,
      false
    >["options"]
  >(() => {
    if (!srcFilterOpts) {
      return [];
    } else if (state.branch) {
      const typename = state.branch.option;
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
        (branchOption) => new BranchOption(branchOption)
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
        branch: branchOption as BranchOption<
          EntityDefaultInputOpt | "Department"
        >,
      }));
    },
    [setState]
  );

  const onChange = useCallback<
    NonNullable<
      TreeSelectProps<
        SrcFilterInputOpt,
        SrcFilterInputOpt,
        true,
        false,
        false
      >["onChange"]
    >
  >(
    (_, value) => {
      if (value.length) {
        // Other options will ONLY be BranchOption(s) and never called onChange.
        const logicFilter: LogicFilter<EntityInputOpt, "equal"> = {
          operator: "or",
          filters: [],
        };

        for (const sourceOpt of value as EntityInputOpt[]) {
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
      <TreeSelect<SrcFilterInputOpt, SrcFilterInputOpt, true, false, false>
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
  source: SourceEditorOnValueChangeResult | null;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type SourceEditorProps = TableEditRow.CellProps & {
  options?: Omit<UseSourceTreeOptions, "iniValue">;
  treeSelectParams?: Partial<
    Pick<EntityTreeSelectProps, "renderInput" | "disabled">
  >;
} & RowChangesProp<SourceRowChanges>;

export interface SourceEditorOnValueChangeResult {
  value: Exclude<EntityTreeSelectProps["value"], undefined>;
  branchPath: NonNullable<EntityTreeSelectProps["branchPath"]>;
}

export const SourceEditor = (props: SourceEditorProps): JSX.Element => {
  const {
    options: entryTreeHookOpts = {},
    treeSelectParams: treeSelectParamsProp = {},
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    rowChanges,
    ...rest
  } = props;

  const { onValueChange, editingEnabled } = props;

  const valueProp = (props.value || null) as
    | GridEntryFragment["source"]
    | SourceEditorOnValueChangeResult
    | null;

  const { treeSelectParams, queryResult, iniValue } = useEntryTree({
    ...entryTreeHookOpts,
    iniValue:
      valueProp && "__typename" in valueProp
        ? {
            __typename: valueProp["__typename"],
            id: valueProp["id"],
          }
        : undefined,
  });

  const onChange = useCallback<NonNullable<EntityTreeSelectProps["onChange"]>>(
    (...args) => {
      const [, value] = args;

      onValueChange({
        value,
        branchPath: treeSelectParams.branchPath,
      } as SourceEditorOnValueChangeResult);
    },
    [onValueChange, treeSelectParams.branchPath]
  );

  const renderInput = useCallback<
    NonNullable<EntityTreeSelectProps["renderInput"]>
  >(
    (params) => {
      const curBranch =
        treeSelectParams.branchPath[treeSelectParams.branchPath.length - 1]
          ?.option;

      if (queryResult.error) {
        return (treeSelectParamsProp?.renderInput || defaultInput)({
          ...params,
          error: true,
          helperText: queryResult.error?.message,
        });
      } else {
        return (treeSelectParamsProp?.renderInput || defaultInput)({
          ...params,
          placeholder: (() => {
            if (curBranch === "Business") {
              return "Business Name...";
            } else if (curBranch === "Person") {
              return "First... Last...";
            }
          })(),
        });
      }
    },
    [
      treeSelectParamsProp?.renderInput,
      queryResult.error,
      treeSelectParams.branchPath,
    ]
  );

  return (
    <TableEditRow.Cell {...rest}>
      <TreeSelect<
        EntityInputOpt,
        EntityBranchInputOpt,
        undefined,
        undefined,
        true | false
      >
        {...treeSelectParamsProp}
        {...treeSelectParams}
        getOptionLabel={getOptionLabelUtil}
        getOptionSelected={getOptionSelectedUtil}
        disabled={!editingEnabled || !!treeSelectParamsProp?.disabled}
        onChange={onChange}
        loading={queryResult.loading}
        renderInput={renderInput}
        value={
          valueProp && "__typename" in valueProp
            ? iniValue || null
            : valueProp?.value || null
        }
      />
    </TableEditRow.Cell>
  );
};
