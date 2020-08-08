import React, { useCallback, useMemo } from "react";
import { TextField, TextFieldProps } from "@material-ui/core";
import { useField, FieldInputProps } from "formik";

import { useFormikStatus, FormikStatusType } from "../../../../../utils/formik";

const inputProps = {
  min: "1",
  step: "1",
  type: "number",
} as const;

const NULLISH = Symbol();

const Units = (
  props: {
    variant?: "filled" | "outlined";
  } & Omit<
    TextFieldProps,
    | "variant"
    | "type"
    | "value"
    | "error"
    | "helperText"
    | "placeholder"
    | "label"
    | "name"
    | "required"
    | "variant"
    | "inputProps"
    | "InputProps"
    | "onChange"
    | keyof FieldInputProps<unknown>
  >
): JSX.Element => {
  const {
    autoFocus = false,
    disabled = false,
    variant = "filled",
    ...textFieldProps
  } = props;

  const validate = useCallback((value: number | string | undefined | null) => {
    value = value || null;

    if ((value ?? NULLISH) === NULLISH) {
      return "Units Required";
    } else if (value === 0) {
      return "Cannot be 0";
    } else if ((value as number) < 0) {
      return "Units must be 1 or greater";
    }
  }, []);

  const [field, meta, { setValue }] = useField<number | undefined>({
    name: "units",
    validate,
  });

  const value = field.value ?? "";

  const { error, touched } = meta;

  const [formikStatus] = useFormikStatus();

  const InputProps = useMemo(
    () => ({
      type: "number",
      autoFocus,
    }),
    [autoFocus]
  );

  const onChange = useCallback<NonNullable<TextFieldProps["onChange"]>>(
    (event) => {
      const value = event?.target?.value || 0;
      setValue(
        Math.max(typeof value === "number" ? value : Number.parseInt(value), 0)
      );
    },
    [setValue]
  );

  return (
    <TextField
      {...textFieldProps}
      {...field}
      disabled={disabled || formikStatus?.type === FormikStatusType.FATAL_ERROR}
      type="number"
      value={value}
      error={touched && !!error}
      helperText={touched && error ? error : undefined}
      placeholder={"1"}
      label={"Units"}
      name={"units"}
      required
      variant={variant as TextFieldProps["variant"]}
      inputProps={inputProps}
      InputProps={InputProps}
      onChange={onChange}
    />
  );
};

export default Units;
