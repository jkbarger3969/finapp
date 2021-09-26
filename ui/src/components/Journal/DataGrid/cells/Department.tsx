import React, { useCallback, useMemo } from "react";
import { Table, TableFilterRow } from "@devexpress/dx-react-grid-material-ui";
import { TextField, TextFieldProps } from "@material-ui/core";
import Autocomplete, { AutocompleteProps } from "@material-ui/lab/Autocomplete";
import { IntegratedFiltering } from "@devexpress/dx-react-grid";
import { ValueNode } from "mui-tree-select";

import { GridEntrySrcDeptFragment } from "../../../../apollo/graphTypes";
import { DepartmentInputOpt } from "../../../Inputs/Department";
import { OnFilter } from "../plugins";
import { Filter, LogicFilter } from "../plugins";
import {
  inlineAutoCompleteProps,
  inlineInputProps,
  inlinePadding,
} from "./shared";

export const DeptCell = (props: Table.DataCellProps): JSX.Element => {
  const { value, ...rest } = props;

  return (
    <Table.Cell {...rest} value={(value as GridEntrySrcDeptFragment).name} />
  );
};

// Filter Cell
export type DeptFilterProps = Omit<TableFilterRow.CellProps, "onFilter"> & {
  onFilter: OnFilter<DepartmentInputOpt, "equal">;
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

  const columnName = props.column.name;

  const options = useMemo(() => deptFilterOpts || [], [deptFilterOpts]);

  type Props = AutocompleteProps<DepartmentInputOpt, true, false, false>;

  const { onFilter } = props;

  const onChange = useCallback<NonNullable<Props["onChange"]>>(
    (_, value) => {
      if (value.length) {
        const logicFilter: LogicFilter<DepartmentInputOpt, "equal"> = {
          operator: "or",
          filters: [],
        };

        for (const option of value) {
          logicFilter.filters.push({
            operation: "equal",
            value: option,
          });
        }

        onFilter({
          columnName,
          filters: [logicFilter],
        });
      } else {
        onFilter(null);
      }
    },
    [columnName, onFilter]
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
  toString: (value: DepartmentInputOpt) => string
): IntegratedFiltering.ColumnExtension => ({
  columnName,
  predicate: (value, filter, row): boolean => {
    switch (filter.operation) {
      case "equal":
        return (
          (filter as unknown as Filter<DepartmentInputOpt>).value.id ===
          (value as DepartmentInputOpt).id
        );
      case "notEqual":
        return (
          (filter as unknown as Filter<DepartmentInputOpt>).value.id !==
          (value as DepartmentInputOpt).id
        );
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
