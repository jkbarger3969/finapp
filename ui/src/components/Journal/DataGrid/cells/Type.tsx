import React, { useCallback } from "react";
import { TextField, TextFieldProps } from "@material-ui/core";
import Autocomplete, { AutocompleteProps } from "@material-ui/lab/Autocomplete";

import { EntryType } from "../../../../apollo/graphTypes";
import {
  TableEditRow,
  TableFilterRow,
} from "@devexpress/dx-react-grid-material-ui";
import {
  inlineAutoCompleteProps,
  inlineInputProps,
  inlinePadding,
} from "./shared";

// Filter Cell
export type TypeFilterProps = TableFilterRow.CellProps;

type TypeFilterAutoCompleteProps = AutocompleteProps<
  EntryType,
  false,
  false,
  false
>;

const renderInput: TypeFilterAutoCompleteProps["renderInput"] = (params) => {
  const props = {
    ...params,
    InputProps: {
      ...inlineInputProps,
      ...params.InputProps,
    },
  } as TextFieldProps;

  return <TextField {...props} />;
};

const options: EntryType[] = [EntryType.Debit, EntryType.Credit];

export const TypeFilter = (props: TypeFilterProps): JSX.Element => {
  const columnName = props.column.name;

  const onChange = useCallback<
    NonNullable<TypeFilterAutoCompleteProps["onChange"]>
  >(
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
    <TableFilterRow.Cell {...props} style={inlinePadding}>
      <Autocomplete<EntryType, false, false, false>
        {...inlineAutoCompleteProps}
        disabled={!props.filteringEnabled}
        onChange={onChange}
        options={options}
        renderInput={renderInput}
      />
    </TableFilterRow.Cell>
  );
};

// Cell Editor

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type TypeEditorProps<Row = any> = TableEditRow.CellProps & {
  onChange?: (
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    event: React.ChangeEvent<any>,
    value: EntryType | null,
    row: Row
  ) => void;
};

export const TypeEditor = (props: TypeEditorProps): JSX.Element => {
  const { onChange: onChangeProp, ...rest } = props;
  const { onValueChange, row } = props;

  const onChange = useCallback<
    NonNullable<AutocompleteProps<EntryType, false, true, false>["onChange"]>
  >(
    (event, value) => {
      onValueChange(value);

      if (onChangeProp) {
        onChangeProp(event, value, row);
      }
    },
    [onChangeProp, onValueChange, row]
  );

  return (
    <TableEditRow.Cell {...rest}>
      <Autocomplete<EntryType, false, true, false>
        {...inlineAutoCompleteProps}
        disabled={!props.editingEnabled}
        disableClearable
        onChange={onChange}
        options={options}
        renderInput={renderInput}
        value={props.value}
      />
    </TableEditRow.Cell>
  );
};
