import React, { useMemo, useCallback } from "react";
import { TextField, TextFieldProps, InputAdornment } from "@material-ui/core";
import { useField, FieldInputProps } from "formik";
import numeral from "numeral";

import {
  createValueTransmutator,
  TransmutationValue,
  useFormikStatus,
  FormikStatusType,
} from "../../../../formik/utils";
import { RationalInput } from "../../../../apollo/graphTypes";
import { getRational } from "../../../../utils/transmutations";

export type TotalValue = TransmutationValue<string, RationalInput>;

const inputProps = {
  min: "0.00",
  step: "0.01",
} as const;

export const totalValueTransmutator = createValueTransmutator(
  (inputValue: string) => getRational(inputValue, 2)
);

const Total = (
  props: {
    variant?: "filled" | "outlined";
    minTotal?: number;
    maxTotal?: number;
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
    | keyof FieldInputProps<any>
  >
) => {
  const {
    autoFocus = false,
    disabled = false,
    variant = "filled",
    maxTotal = Number.MAX_SAFE_INTEGER,
    minTotal: minTotalProp = 0,
    ...textFieldProps
  } = props;

  const minTotal = Math.max(0.01, minTotalProp);

  const validate = useCallback(
    (value: TotalValue | undefined) => {
      const inputValue = (value?.inputValue || "").trim();

      if (inputValue === "") {
        return "Total Required";
      }

      const num =
        typeof inputValue === "string"
          ? Number.parseFloat(inputValue)
          : inputValue;
      console.log("num", num, "maxTotal", maxTotal);
      if (Number.isNaN(num)) {
        return "Invalid Number";
      } else if (num > maxTotal) {
        return `Cannot be greater than ${numeral(maxTotal).format("$0,0.00")}`;
      } else if (num === 0) {
        return "Cannot be 0";
      } else if (num < minTotal) {
        return `Cannot be less than ${numeral(minTotal).format("$0,0.00")}`;
      }
    },
    [minTotal, maxTotal]
  );

  const [field, meta, { setValue }] = useField<TotalValue | undefined>({
    name: "total",
    validate,
  });

  const inputValue = field.value?.inputValue ?? "";

  const { error, touched } = meta;

  const InputProps = useMemo(
    () => ({
      type: "number",
      autoFocus,
      startAdornment: <InputAdornment position="start">$</InputAdornment>,
    }),
    [autoFocus]
  );

  const onChange = useCallback<NonNullable<TextFieldProps["onChange"]>>(
    (event) => {
      setValue(totalValueTransmutator(event?.target?.value || ""));
    },
    [setValue]
  );

  const helperText = useMemo(() => {
    if (touched && error) {
      return error;
    } else if (maxTotal !== Number.MAX_SAFE_INTEGER && minTotal > 0.01) {
      return `Max ${numeral(maxTotal).format("$0,0.00")} & Min ${numeral(
        minTotal
      ).format("$0,0.00")}`;
    } else if (maxTotal !== Number.MAX_SAFE_INTEGER) {
      return `Max ${numeral(maxTotal).format("$0,0.00")}`;
    } else if (minTotal > 0.01) {
      return `Min ${numeral(minTotal).format("$0,0.00")}`;
    } else {
      return "";
    }
  }, [touched, error, maxTotal, minTotal]);

  const [formikStatus] = useFormikStatus();

  return (
    <TextField
      {...textFieldProps}
      {...field}
      disabled={disabled || formikStatus?.type === FormikStatusType.FATAL_ERROR}
      type="number"
      value={inputValue}
      error={touched && !!error}
      helperText={helperText}
      placeholder={"0.00"}
      label={"Total"}
      name={"total"}
      required
      variant={variant as any}
      inputProps={inputProps}
      InputProps={InputProps}
      onChange={onChange}
    />
  );
};

export default Total;
