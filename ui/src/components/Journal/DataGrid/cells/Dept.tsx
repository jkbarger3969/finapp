import React, { useCallback, useMemo } from "react";
import {
  Table,
  TableEditRow,
  TableFilterRow,
} from "@devexpress/dx-react-grid-material-ui";
import { TextField, TextFieldProps } from "@material-ui/core";
import Autocomplete, { AutocompleteProps } from "@material-ui/lab/Autocomplete";
import { IntegratedFiltering } from "@devexpress/dx-react-grid";
import TreeSelect, { defaultInput, TreeSelectProps } from "mui-tree-select";

import {
  DeptInputOptsQuery,
  GridEntrySrcDeptFragment,
} from "../../../../apollo/graphTypes";
import {
  DeptInputOpt,
  DeptTreeRoot,
  useDepartmentTree,
  getOptionLabel as getOptionLabelEditor,
  getOptionSelected as getOptionSelectedEditor,
  DeptTreeSelectProps,
} from "../../../Inputs/departmentInputUtils";
import { OnFilter } from "../plugins";
import { Filter, LogicFilter } from "../plugins";
import {
  inlineAutoCompleteProps,
  inlineInputProps,
  inlinePadding,
  RowChangesProp,
} from "./shared";
import { QueryHookOptions } from "@apollo/client";

export const DeptCell = (props: Table.DataCellProps): JSX.Element => {
  const { value, ...rest } = props;

  return (
    <Table.Cell {...rest} value={(value as GridEntrySrcDeptFragment).name} />
  );
};

// Filter Cell
export type DeptFilterProps = Omit<TableFilterRow.CellProps, "onFilter"> & {
  onFilter: OnFilter<DeptInputOpt, "equal">;
  deptFilterOpts?: DeptInputOpt[];
};

const renderInput: AutocompleteProps<
  DeptInputOpt,
  true,
  false,
  false
>["renderInput"] = (params) => {
  const props = {
    ...params,
    InputProps: {
      ...inlineInputProps,
      ...params.InputProps,
    },
  } as TextFieldProps;

  return <TextField {...props} />;
};

const getOptionLabel: NonNullable<
  AutocompleteProps<DeptInputOpt, true, false, false>["getOptionLabel"]
> = ({ name }) => name;

export const DeptFilter = (props: DeptFilterProps): JSX.Element => {
  const { deptFilterOpts, ...rest } = props;

  const columnName = props.column.name;

  const options = useMemo(() => deptFilterOpts || [], [deptFilterOpts]);

  type Props = AutocompleteProps<DeptInputOpt, true, false, false>;

  const onChange = useCallback<NonNullable<Props["onChange"]>>(
    (_, value) => {
      if (value.length) {
        const logicFilter: LogicFilter<DeptInputOpt, "equal"> = {
          operator: "or",
          filters: [],
        };

        for (const option of value) {
          logicFilter.filters.push({
            operation: "equal",
            value: option,
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
    [columnName, props.onFilter]
  );

  return (
    <TableFilterRow.Cell
      {...(rest as TableFilterRow.CellProps)}
      style={inlinePadding}
    >
      <Autocomplete
        getOptionLabel={getOptionLabel}
        multiple
        renderInput={renderInput}
        onChange={onChange}
        options={options}
        {...inlineAutoCompleteProps}
      />
    </TableFilterRow.Cell>
  );
};

export const deptFilterColumnExtension = (
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

export type DeptRowChanges = {
  department: DeptInputOpt;
};

export type DeptEditorProps = TableEditRow.CellProps & {
  root: DeptTreeRoot;
  treeSelectParams?: Partial<
    Pick<DeptTreeSelectProps, "renderInput" | "disabled">
  >;
  queryHookOptions?: Omit<QueryHookOptions<DeptInputOptsQuery>, "variables">;
} & RowChangesProp<DeptRowChanges>;

export const DeptEditor = (props: DeptEditorProps): JSX.Element => {
  const {
    treeSelectParams: treeSelectParamsProp,
    root,
    queryHookOptions,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    rowChanges,
    ...rest
  } = props;

  const { onValueChange } = props;

  const { treeSelectParams, queryResult } = useDepartmentTree({
    root,
    queryHookOptions,
    iniValue: props.value?.id,
  });

  const onChange = useCallback<
    NonNullable<
      TreeSelectProps<
        DeptInputOpt,
        DeptInputOpt,
        false,
        false,
        false
      >["onChange"]
    >
  >(
    (...[, value]) => {
      onValueChange(value);
    },
    [onValueChange]
  );

  const renderInput = useCallback<
    NonNullable<
      TreeSelectProps<
        DeptInputOpt,
        DeptInputOpt,
        false,
        false,
        false
      >["renderInput"]
    >
  >(
    (params) => {
      if (queryResult.error) {
        return (treeSelectParamsProp?.renderInput || defaultInput)({
          ...params,
          error: true,
          helperText: queryResult.error.message,
        });
      }

      return defaultInput(params);
    },
    [treeSelectParamsProp?.renderInput, queryResult.error]
  );

  return (
    <TableEditRow.Cell {...rest}>
      <TreeSelect<DeptInputOpt, DeptInputOpt, false, false, false>
        {...(treeSelectParamsProp || {})}
        {...treeSelectParams}
        disabled={!props.editingEnabled || !!treeSelectParamsProp?.disabled}
        getOptionLabel={getOptionLabelEditor}
        getOptionSelected={getOptionSelectedEditor}
        loading={queryResult.loading}
        onChange={onChange}
        renderInput={renderInput}
        value={props.value ?? null}
      />
    </TableEditRow.Cell>
  );
};
