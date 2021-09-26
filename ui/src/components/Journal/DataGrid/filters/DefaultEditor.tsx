import React, { useCallback } from "react";
import {
  InputProps as MUIInputProps,
  TextField,
  TextFieldProps,
} from "@material-ui/core";
import { TableFilterRow } from "@devexpress/dx-react-grid";

const style: React.CSSProperties = {
  paddingRight: "8px",
};

const InputProps: MUIInputProps = {
  margin: "dense",
};

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
      InputProps={InputProps}
      onChange={onChange}
      style={style}
      value={value ?? ""}
      {...rest}
    />
  );
};
