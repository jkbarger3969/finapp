import React, { useCallback, useMemo } from "react";
import { Done as DoneIcon } from "@material-ui/icons";
import {
  Table,
  TableEditRow,
  TableFilterRow,
  TableInlineCellEditing,
} from "@devexpress/dx-react-grid-material-ui";
import {
  Box,
  Checkbox,
  CheckboxProps,
  TextField,
  TextFieldProps,
} from "@material-ui/core";
import Autocomplete, { AutocompleteProps } from "@material-ui/lab/Autocomplete";

import {
  inlinePadding,
  inlineInputProps,
  inlineAutoCompleteProps,
  RowChangesProp,
} from "./shared";

// Data Cell

const boolCellStyle: React.CSSProperties = {
  width: "100%",
  display: "flex",
  justifyContent: "center",
};

export const BoolCell = (props: Table.DataCellProps): JSX.Element => {
  const { value, ...rest } = props;
  return (
    <Table.Cell {...(rest as Table.DataCellProps)}>
      <div style={boolCellStyle}>{value && <DoneIcon fontSize="small" />}</div>
    </Table.Cell>
  );
};

// Filter Cell
const renderInput: AutocompleteProps<
  boolean,
  false,
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

export type BoolFilterProps = TableFilterRow.CellProps & {
  boolLabels?: {
    trueLabel: string;
    falseLabel: string;
  };
};

const filterOptions = [true, false];

export const BoolFilter = (props: BoolFilterProps): JSX.Element => {
  const { boolLabels, ...rest } = props;

  const columnName = props.column.name;

  type Props = AutocompleteProps<boolean, false, false, false>;

  const onChange = useCallback<NonNullable<Props["onChange"]>>(
    (_, value) => {
      if (value === true) {
        props.onFilter({
          columnName,
          value: value.toString(),
        });
      } else if (value === false) {
        props.onFilter({
          columnName,
          value: value.toString(),
        });
      } else {
        props.onFilter(null);
      }
    },
    [columnName, props.onFilter]
  );

  const getOptionLabel = useCallback<NonNullable<Props["getOptionLabel"]>>(
    (option) => {
      if (boolLabels) {
        return option ? boolLabels.trueLabel : boolLabels.falseLabel;
      } else {
        return option ? "True" : "False";
      }
    },
    [boolLabels]
  );

  return (
    <TableFilterRow.Cell {...rest} style={inlinePadding}>
      <Autocomplete
        getOptionLabel={getOptionLabel}
        renderInput={renderInput}
        onChange={onChange}
        options={filterOptions}
        {...inlineAutoCompleteProps}
      />
    </TableFilterRow.Cell>
  );
};

const style: React.CSSProperties = {
  padding: 0,
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type BoolEditorProps = (
  | TableEditRow.CellProps
  | TableInlineCellEditing.CellProps
) & {
  checkBoxProps?: Pick<CheckboxProps, "disabled">;
} & RowChangesProp;

export const BoolEditor = (props: BoolEditorProps): JSX.Element => {
  const {
    checkBoxProps: checkBoxPropsProp,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    rowChanges,
    ...rest
  } = props;

  const { editingEnabled, value, onValueChange } = props;

  const onChange = useCallback<NonNullable<CheckboxProps["onChange"]>>(
    (event, checked) => {
      onValueChange(checked);
    },
    [onValueChange]
  );

  const checkBoxProps = useMemo<CheckboxProps>(() => {
    return {
      size: "medium",
      style,
      ...(checkBoxPropsProp || {}),
      disabled: !editingEnabled || !!checkBoxPropsProp?.disabled,
      onChange,
      checked: value as boolean,
    };
  }, [checkBoxPropsProp, editingEnabled, onChange, value]);

  // Inline editor
  if ("onFocus" in rest && "onBlur" in rest) {
    return (
      <TableInlineCellEditing.Cell {...rest}>
        <Box width="100%" display="flex" justifyContent="center">
          <Checkbox
            {...checkBoxProps}
            autoFocus={rest.autoFocus}
            onBlur={rest.onBlur}
            onFocus={rest.onFocus}
            onKeyDown={rest.onKeyDown}
            disableFocusRipple
          />
        </Box>
      </TableInlineCellEditing.Cell>
    );
  } else {
    return (
      <TableEditRow.Cell {...rest}>
        <Box width="100%" display="flex" justifyContent="center">
          <Checkbox {...checkBoxProps} />
        </Box>
      </TableEditRow.Cell>
    );
  }
};
