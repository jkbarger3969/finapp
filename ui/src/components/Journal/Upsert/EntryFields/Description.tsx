import React, { useMemo, useCallback } from "react";
import { TextField, TextFieldProps } from "@material-ui/core";
import { useField, FieldInputProps } from "formik";
import { useFormikStatus, FormikStatusType } from "../../../../formik/utils";

const Description = (
  props: {
    variant?: "filled" | "outlined";
  } & Omit<
    TextFieldProps,
    | "variant"
    | "onChange"
    | "value"
    | "variant"
    | "label"
    | "name"
    | "InputProps"
    | keyof FieldInputProps<any>
  >
) => {
  const {
    autoFocus = false,
    disabled = false,
    variant = "filled",
    ...textFieldProps
  } = props;

  const [field, , { setValue }] = useField<string | null | undefined>({
    name: "description",
  });

  const onChange = useCallback<NonNullable<TextFieldProps["onChange"]>>(
    (event) => void setValue(event?.target?.value?.trimLeft() || null),
    [setValue]
  );

  const InputProps = useMemo(
    () => ({
      type: "text",
      autoFocus,
    }),
    [autoFocus]
  );

  const [formikStatus] = useFormikStatus();

  return (
    <TextField
      {...textFieldProps}
      {...field}
      disabled={disabled || formikStatus?.type === FormikStatusType.FATAL_ERROR}
      onChange={onChange}
      value={field.value ?? ""}
      variant={variant as any}
      label={"Description"}
      name={"description"}
      InputProps={InputProps}
    />
  );
};

export default Description;
