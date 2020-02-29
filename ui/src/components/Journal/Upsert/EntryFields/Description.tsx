import React, { useMemo } from "react";
import { TextField, TextFieldProps } from "@material-ui/core";
import { useField } from "formik";

const Description = (
  props: {
    autoFocus?: boolean;
    variant?: "filled" | "outlined";
  } & Omit<
    TextFieldProps,
    | "variant"
    | "label"
    | "name"
    | "InputProps"
    | "autoFocus"
    | "onChange"
    | "onBlur"
    | "onFocus"
  >
) => {
  const { autoFocus = false, variant = "filled", ...textFieldProps } = props;

  const [field] = useField<string>({
    name: "description"
  });

  const InputProps = useMemo(
    () => ({
      type: "text",
      autoFocus
    }),
    [autoFocus]
  );
  return (
    <TextField
      {...textFieldProps}
      {...field}
      variant={variant as any}
      label={"Description"}
      name={"description"}
      InputProps={InputProps}
    />
  );
};

export default Description;
