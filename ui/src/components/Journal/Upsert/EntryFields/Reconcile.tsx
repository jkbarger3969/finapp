import React from "react";
import {
  Checkbox,
  FormControlLabel,
  FormControlLabelProps,
  CheckboxProps,
} from "@material-ui/core";
import { useField, FieldInputProps } from "formik";
import { useFormikStatus, FormikStatusType } from "../../../../utils/formik";

const inputProps = {
  type: "checkbox",
} as const;

const Reconcile = (
  props:
    | ({ label: true } & Partial<
        Omit<
          FormControlLabelProps,
          | "inputProps"
          | "control"
          | "checked"
          | "label"
          | keyof FieldInputProps<any>
        >
      >)
    | ({ label?: false } & Partial<
        Omit<
          CheckboxProps,
          "inputProps" | "checked" | keyof FieldInputProps<any>
        >
      >)
) => {
  const { label, disabled = false, ...customProps } = props;

  const [field] = useField<boolean | undefined>({
    name: "reconciled",
    type: "checkbox",
  });

  const value = field.value ?? false;

  const [formikStatus] = useFormikStatus();

  if (label) {
    return (
      <FormControlLabel
        {...customProps}
        {...(field as any)}
        value={value}
        disabled={
          disabled || formikStatus?.type === FormikStatusType.FATAL_ERROR
        }
        label="Reconcile"
        control={<Checkbox inputProps={inputProps} />}
      />
    );
  }

  return (
    <Checkbox
      {...(customProps as any)}
      {...field}
      value={value}
      disabled={disabled || formikStatus?.type === FormikStatusType.FATAL_ERROR}
      inputProps={inputProps}
    />
  );
};

export default Reconcile;
