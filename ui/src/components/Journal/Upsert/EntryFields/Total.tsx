import React, { useMemo, useCallback } from "react";
import { TextField, TextFieldProps, InputAdornment } from "@material-ui/core";
import { useField, FieldInputProps } from "formik";
import numeral from "numeral";

import {
  createValueTransmutator,
  TransmutationValue,
  useFormikStatus,
  FormikStatusType,
} from "../../../../utils/formik";
import { Rational } from "../../../../apollo/scalars";

export type TotalValue = TransmutationValue<string, Rational>;

const inputProps = {
  min: "0.00",
  step: "0.01",
} as const;

export const totalValueTransmutator = createValueTransmutator(
  (inputValue: string) => {
    if (typeof inputValue === "string" && !inputValue.trim()) {
      return new Rational(0);
    }
    return new Rational(inputValue as string | number).round(2);
  }
);

const Total = (
  props: {
    variant?: "filled" | "outlined";
    minTotal?: Rational;
    maxTotal?: Rational;
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
    maxTotal = new Rational(Number.MAX_SAFE_INTEGER),
    minTotal: minTotalProp = new Rational(0),
    ...textFieldProps
  } = props;

  const minTotal =
    new Rational(1, 100).compare(minTotalProp) > 0
      ? new Rational(1, 100)
      : minTotalProp;

  // Math.max(0.01, minTotalProp);

  const validate = useCallback(
    (value: TotalValue | undefined | null) => {
      if (!value || !(value.inputValue?.trim() ?? "")) {
        return "Total Required";
      }

      const num = value.value;

      if (Number.isNaN(Number.parseInt(value.inputValue))) {
        return "Invalid Number";
      } else if (num.compare(maxTotal) > 0) {
        return `Cannot be greater than ${numeral(maxTotal.valueOf()).format(
          "$0,0.00"
        )}`;
      } else if (num.compare(new Rational(0)) === 0) {
        return "Cannot be 0";
      } else if (num.compare(minTotal) < 0) {
        return `Cannot be less than ${numeral(minTotal.valueOf()).format(
          "$0,0.00"
        )}`;
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
      setValue(totalValueTransmutator(event?.target?.value?.toString() || ""));
    },
    [setValue]
  );

  const helperText = useMemo(() => {
    const maxSafe = new Rational(Number.MAX_SAFE_INTEGER);
    const minValid = new Rational(1, 100);
    if (touched && error) {
      return error;
    } else if (
      maxTotal.compare(maxSafe) !== 0 &&
      minTotal.compare(minValid) > 0
    ) {
      return `Max ${numeral(maxTotal.valueOf()).format(
        "$0,0.00"
      )} & Min ${numeral(minTotal.valueOf()).format("$0,0.00")}`;
    } else if (maxTotal.compare(maxSafe) !== 0) {
      return `Max ${numeral(maxTotal.valueOf()).format("$0,0.00")}`;
    } else if (minTotal.compare(minValid) > 0) {
      return `Min ${numeral(minTotal.valueOf()).format("$0,0.00")}`;
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
      variant={variant as TextFieldProps["variant"]}
      inputProps={inputProps}
      InputProps={InputProps}
      onChange={onChange}
    />
  );
};

export default Total;
