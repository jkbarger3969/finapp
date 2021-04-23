import React, { useCallback } from "react";
import { TextField, TextFieldProps } from "@material-ui/core";
import Autocomplete, { AutocompleteProps } from "@material-ui/lab/Autocomplete";

import { EntryType } from "../../../../apollo/graphTypes";
import { TableFilterRow } from "@devexpress/dx-react-grid-material-ui";

// Filter Cell
export type TypeFilterProps = TableFilterRow.CellProps;

const renderInput: AutocompleteProps<
  EntryType,
  false,
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

const options: EntryType[] = [EntryType.Debit, EntryType.Credit];

export const TypeFilter = (props: TypeFilterProps): JSX.Element => {
  const columnName = props.column.name;

  type Props = AutocompleteProps<EntryType, false, false, false>;

  const onChange = useCallback<NonNullable<Props["onChange"]>>(
    (_, value) => {
      if (value) {
        props.onFilter({
          columnName,
          value,
        });
      } else {
        props.onFilter(null);
      }
    },
    [columnName, props.onFilter]
  );

  return (
    <TableFilterRow.Cell {...props}>
      <Autocomplete<EntryType, false, false, false>
        fullWidth
        renderInput={renderInput}
        size="small"
        onChange={onChange}
        options={options}
      />
    </TableFilterRow.Cell>
  );
};
