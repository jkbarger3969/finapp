import React, { useMemo } from "react";
import { TextField, TextFieldProps, InputAdornment } from "@material-ui/core";
import { useField } from "formik";

const validate = (value: string | number) => {
  if (value === "") {
    return "Total Required";
  }

  const num = typeof value === "string" ? Number.parseFloat(value) : value;

  if (Number.isNaN(num)) {
    return "Invalid Number";
  } else if (num === 0) {
    return "Cannot be 0";
  } else if (num < 0.01) {
    return "Invalid Total";
  }
};

const inputProps = {
  min: "0.00",
  step: "0.01"
} as const;

const Total = (
  props: {
    autoFocus?: boolean;
    variant?: "filled" | "outlined";
  } & Omit<
    TextFieldProps,
    | "required"
    | "variant"
    | "label"
    | "name"
    | "InputProps"
    | "autoFocus"
    | "onChange"
    | "onBlur"
    | "onFocus"
    | "placeholder"
    | "helperText"
    | "error"
  >
) => {
  const { autoFocus = false, variant = "filled", ...textFieldProps } = props;

  const [field, meta] = useField<string>({
    name: "total",
    validate
  });

  const { error, touched } = meta;

  const InputProps = useMemo(
    () => ({
      type: "number",
      autoFocus,
      startAdornment: <InputAdornment position="start">$</InputAdornment>
    }),
    [autoFocus]
  );

  return (
    <TextField
      {...textFieldProps}
      {...field}
      error={touched && !!error}
      helperText={touched ? error : ""}
      placeholder={"0.00"}
      label={"Total"}
      name={"total"}
      required
      variant={variant as any}
      inputProps={inputProps}
      InputProps={InputProps}
    />
  );
};

export default Total;
