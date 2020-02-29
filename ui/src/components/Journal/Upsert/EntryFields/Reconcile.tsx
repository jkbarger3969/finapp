import React from "react";
import {
  Checkbox,
  FormControlLabel,
  FormControlLabelProps,
  CheckboxProps
} from "@material-ui/core";
import { useField, FieldInputProps } from "formik";

import { Values } from "../UpsertEntry";

const inputProps = {
  type: "checkbox"
} as const;

const Reconcile = (
  props:
    | ({ label: true } & Partial<
        Omit<
          FormControlLabelProps,
          | "control"
          | "checked"
          | "label"
          | keyof FieldInputProps<Values["reconciled"]>
        >
      >)
    | ({ label?: false } & Partial<
        Omit<
          CheckboxProps,
          "inputProps" | "checked" | keyof FieldInputProps<Values["reconciled"]>
        >
      >)
) => {
  const { label, ...customProps } = props;

  const [field] = useField<boolean>({
    name: "reconciled",
    type: "checkbox"
  });

  if (label) {
    return (
      <FormControlLabel
        {...customProps}
        {...(field as any)}
        label="Reconcile"
        control={<Checkbox inputProps={inputProps} />}
      />
    );
  }

  return (
    <Checkbox {...(customProps as any)} {...field} inputProps={inputProps} />
  );
};

export default Reconcile;
