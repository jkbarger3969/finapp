import React, { useMemo, useCallback, useRef } from "react";
import {
  KeyboardDatePicker,
  KeyboardDatePickerProps,
  MuiPickersUtilsProvider,
} from "@material-ui/pickers";
import DateFnsUtils from "@date-io/date-fns";
import { useField, useFormikContext, FieldInputProps } from "formik";
import { TextFieldProps } from "@material-ui/core";
import { parseISO, min, isValid, formatISO, format } from "date-fns";

import {
  TransmutationValue,
  createValueTransmutator,
  useFormikStatus,
  FormikStatusType,
} from "../../../../formik/utils";

const inputProps = {
  inputMode: "numeric",
} as const;

const keyboardButtonProps = {
  tabIndex: -1,
} as const;

const dateValueTransmutator = createValueTransmutator(
  (...args: Parameters<KeyboardDatePickerProps["onChange"]>) => {
    const [date, value] = args;
    if (date && isValid(date)) {
      return formatISO(date);
    }
    return value || "";
  }
);
export type DateValue = TransmutationValue<Date | null, string>;

const DateField = (
  props: {
    variant?: "filled" | "outlined";
    maxDate?: Date;
    minDate?: Date;
  } & Omit<
    TextFieldProps,
    | "value"
    | "variant"
    | "error"
    | "helperText"
    | "animateYearScrolling"
    | "disableToolbar"
    | "disableFuture"
    | "inputVariant"
    | "variant"
    | "format"
    | "margin"
    | "label"
    | "maxDate"
    | "initialFocusedDate"
    | "autoOk"
    | "InputProps"
    | "inputProps"
    | "placeholder"
    | "KeyboardButtonProps"
    | "onBlur"
    | "onOpen"
    | "onClose"
    | "onChange"
    | keyof FieldInputProps<any>
  >
) => {
  const {
    variant: inputVariant = "filled",
    autoFocus = false,
    disabled = false,
    maxDate = new Date(),
    minDate,
  } = props;

  const { isSubmitting } = useFormikContext();

  const validate = useCallback(
    (
      value: TransmutationValue<Date | null, string> | undefined
    ): string | undefined => {
      const dateStr = (value?.value || "").trim();
      if (dateStr) {
        const date = parseISO(dateStr);
        if (!isValid(date)) {
          return "Invalid Date";
        } else if (minDate && date < minDate) {
          return `Cannot be before ${format(minDate, "MM/dd/yyyy")}`;
        } else if (maxDate < date) {
          return `Cannot be after ${format(maxDate, "MM/dd/yyyy")}`;
        }
      } else {
        return "Date is Required";
      }
    },
    [minDate, maxDate]
  );

  const [field, meta, helpers] = useField<
    TransmutationValue<Date | null, string> | undefined
  >({
    name: "date",
    validate,
  });

  const value = field.value?.inputValue ?? null;
  const { error, touched } = meta;
  const { setValue, setTouched } = helpers;

  const initialInputValue = meta.initialValue?.inputValue;
  const initialFocusedDate = useMemo(
    () =>
      initialInputValue && isValid(initialInputValue)
        ? initialInputValue
        : new Date(),
    [initialInputValue]
  );

  const InputProps = useMemo(
    () => ({
      autoFocus,
    }),
    [autoFocus]
  );

  // Handle touched
  const calOpen = useRef(false);
  const onBlur = useCallback(
    () =>
      setTimeout(() => {
        if (calOpen.current) {
          return;
        }
        setTouched(true);
      }, 0),
    [setTouched, calOpen]
  );
  const onOpen = useCallback(() => (calOpen.current = true), [calOpen]);
  const onClose = useCallback(() => {
    calOpen.current = false;
    onBlur();
  }, [calOpen, onBlur]);

  const onChange = useCallback<KeyboardDatePickerProps["onChange"]>(
    (date, value) => {
      setValue(
        dateValueTransmutator(
          // limit max date
          date && isValid(date) ? min([new Date(), date]) : date,
          value
        )
      );
    },
    [setValue]
  );

  const [formikStatus] = useFormikStatus();

  const dataPickerProps: KeyboardDatePickerProps = useMemo(
    () => ({
      ...field,
      disabled:
        isSubmitting ||
        disabled ||
        formikStatus?.type === FormikStatusType.FATAL_ERROR,
      value,
      error: touched && !!error,
      helperText: touched ? error : undefined,
      animateYearScrolling: true,
      disableToolbar: true,
      disableFuture: true,
      inputVariant,
      variant: "inline",
      format: "MM/dd/yyyy",
      margin: "none",
      label: "Date",
      initialFocusedDate,
      autoOk: true,
      InputProps,
      inputProps,
      placeholder: "mm/dd/yyyy",
      KeyboardButtonProps: keyboardButtonProps,
      onBlur,
      onOpen,
      onClose,
      onChange,
    }),
    [
      value,
      initialFocusedDate,
      onBlur,
      error,
      inputVariant,
      InputProps,
      isSubmitting,
      field,
      onOpen,
      onClose,
      onChange,
      touched,
      disabled,
      formikStatus,
    ]
  );

  return (
    <MuiPickersUtilsProvider utils={DateFnsUtils}>
      <KeyboardDatePicker
        maxDate={maxDate}
        {...(props as any)}
        {...dataPickerProps}
      />
    </MuiPickersUtilsProvider>
  );
};

export default DateField;
