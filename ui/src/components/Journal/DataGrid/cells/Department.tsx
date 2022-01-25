import React, { useCallback, useMemo } from "react";
import { Table, TableFilterRow } from "@devexpress/dx-react-grid-material-ui";
import { TextField, TextFieldProps } from "@material-ui/core";
import Autocomplete, { AutocompleteProps } from "@material-ui/lab/Autocomplete";
import { IntegratedFiltering } from "@devexpress/dx-react-grid";
import { ValueNode } from "mui-tree-select";

import { GridEntrySrcDeptFragment } from "../../../../apollo/graphTypes";
import { DepartmentInputOpt } from "../../../Inputs/Department";
import { Filter, TableFilterCellProps } from "../plugins";
import {
  inlineAutoCompleteProps,
  inlineInputProps,
  inlinePadding,
} from "./shared";
import { AvailableFilterOperations } from "../filters/rangeFilterUtils";

export const DeptCell = (props: Table.DataCellProps): JSX.Element => {
  const { value, ...rest } = props;

  return (
    <Table.Cell {...rest} value={(value as GridEntrySrcDeptFragment).name} />
  );
};

// Filter Cell
export type DeptFilterProps = TableFilterCellProps<
  DepartmentInputOpt,
  Extract<AvailableFilterOperations, "equal">
> & {
  deptFilterOpts?: DepartmentInputOpt[];
};

const renderInput: AutocompleteProps<
  DepartmentInputOpt,
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
  AutocompleteProps<DepartmentInputOpt, true, false, false>["getOptionLabel"]
> = ({ name }) => name;

export const DeptFilter = (props: DeptFilterProps): JSX.Element => {
  const { deptFilterOpts, ...rest } = props;

  const { filter, onFilter } = props;

  const columnName = props.column.name;

  const options = useMemo(() => deptFilterOpts || [], [deptFilterOpts]);

  type Props = AutocompleteProps<DepartmentInputOpt, true, false, false>;

  const handleChange = useCallback<NonNullable<Props["onChange"]>>(
    (_, value) => {
      if (value.length) {
        onFilter({
          columnName,
          operator: "or",
          filters: value.map((option) => ({
            operation: "equal",
            value: option,
          })),
        });
      } else {
        onFilter(null);
      }
    },
    [columnName, onFilter]
  );

  const value = useMemo<DepartmentInputOpt[]>(() => {
    if (!filter) {
      return [];
    } else if ("operator" in filter) {
      return filter.filters.reduce((value, filter) => {
        if ("operation" in filter && filter.value) {
          value.push(filter.value);
        }
        return value;
      }, [] as DepartmentInputOpt[]);
    }
    return "operation" in filter && filter.value ? [filter.value] : [];
  }, [filter]);

  return (
    <TableFilterRow.Cell
      {...(rest as TableFilterRow.CellProps)}
      style={inlinePadding}
    >
      <Autocomplete
        getOptionLabel={getOptionLabel}
        multiple
        renderInput={renderInput}
        onChange={handleChange}
        options={options}
        value={value}
        {...inlineAutoCompleteProps}
      />
    </TableFilterRow.Cell>
  );
};

export const deptFilterColumnExtension = (
  columnName: string,
  toString: (value: DepartmentInputOpt) => string
): IntegratedFiltering.ColumnExtension => ({
  columnName,
  predicate: (value, filter, row): boolean => {
    const filterValue = (filter as unknown as Filter<DepartmentInputOpt>).value;

    if (filterValue === undefined) {
      return IntegratedFiltering.defaultPredicate(
        toString(value as DepartmentInputOpt),
        filter,
        row
      );
    }

    switch (filter.operation) {
      case "equal":
        return filterValue.id === (value as DepartmentInputOpt).id;
      case "notEqual":
        return filterValue.id !== (value as DepartmentInputOpt).id;
      default:
        return IntegratedFiltering.defaultPredicate(
          toString(value as DepartmentInputOpt),
          filter,
          row
        );
    }
  },
});

export type DeptRowChanges = {
  department: ValueNode<DepartmentInputOpt, DepartmentInputOpt> | null;
};
