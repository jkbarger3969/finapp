import React, { useCallback } from "react";
import { TextField, TextFieldProps } from "@material-ui/core";
import { TableFilterRow } from "@devexpress/dx-react-grid";
import { inputProps } from "./shared";

export const DefaultEditor = (
  props: TableFilterRow.EditorProps
): JSX.Element => {
  const {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    getMessage: _,
    value,
    onChange: onChangeProp,
    ...rest
  } = props;

  const onChange = useCallback<NonNullable<TextFieldProps["onChange"]>>(
    (event) => {
      onChangeProp(event.target.value ?? "");
    },
    [onChangeProp]
  );

  return (
    <TextField
      size="small"
      fullWidth
      InputProps={inputProps}
      onChange={onChange}
      value={value ?? ""}
      {...rest}
    />
  );
};
