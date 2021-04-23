import React, { useCallback, useMemo } from "react";
import { Table, TableFilterRow } from "@devexpress/dx-react-grid-material-ui";
import { TextField, TextFieldProps } from "@material-ui/core";
import Autocomplete, { AutocompleteProps } from "@material-ui/lab/Autocomplete";

import { GridEntryFragment } from "../../../../apollo/graphTypes";
import { OnFilter } from "../plugins/TableCell";
import { LogicFilter } from "../plugins";
import { CategoryInputOpt } from "../../../Inputs/categoryInputUtils";

export const CategoryCell = (props: Table.DataCellProps): JSX.Element => {
  const { value, ...rest } = props;

  return (
    <Table.Cell
      {...rest}
      value={(value as GridEntryFragment["category"]).name}
    />
  );
};

// Filter Cell
export type CategoryFilterProps = Omit<TableFilterRow.CellProps, "onFilter"> & {
  onFilter: OnFilter<CategoryInputOpt, "equal">;
  categoryFilterOpts?: CategoryInputOpt[];
};

const renderInput: AutocompleteProps<
  CategoryInputOpt,
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
  AutocompleteProps<CategoryInputOpt, true, false, false>["getOptionLabel"]
> = ({ name }) => name;

export const CategoryFilter = (props: CategoryFilterProps): JSX.Element => {
  const { categoryFilterOpts, ...rest } = props;

  const columnName = props.column.name;

  const options = useMemo(() => categoryFilterOpts || [], [categoryFilterOpts]);

  type Props = AutocompleteProps<CategoryInputOpt, true, false, false>;

  const onChange = useCallback<NonNullable<Props["onChange"]>>(
    (_, value) => {
      if (value.length) {
        const logicFilter: LogicFilter<CategoryInputOpt, "equal"> = {
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
