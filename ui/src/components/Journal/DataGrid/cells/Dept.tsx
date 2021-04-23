import React, { useCallback, useMemo } from "react";
import { Table, TableFilterRow } from "@devexpress/dx-react-grid-material-ui";
import { TextField, TextFieldProps } from "@material-ui/core";
import Autocomplete, { AutocompleteProps } from "@material-ui/lab/Autocomplete";

import { GridEntrySrcDeptFragment } from "../../../../apollo/graphTypes";
import { DeptInputOpt } from "../../../Inputs/departmentInputUtils";
import { OnFilter } from "../plugins/TableCell";
import { LogicFilter } from "../plugins";

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
      ...params.InputProps,
      margin: "dense",
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
    <TableFilterRow.Cell {...(rest as TableFilterRow.CellProps)}>
      <Autocomplete
        fullWidth
        getOptionLabel={getOptionLabel}
        multiple
        renderInput={renderInput}
        size="small"
        onChange={onChange}
        options={options}
      />
    </TableFilterRow.Cell>
  );
};
