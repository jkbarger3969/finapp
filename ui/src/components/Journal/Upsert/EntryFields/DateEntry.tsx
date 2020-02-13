import React, { useMemo, useCallback, useRef } from "react";
import {
  KeyboardDatePicker,
  KeyboardDatePickerProps,
  MuiPickersUtilsProvider
} from "@material-ui/pickers";
import MomentUtils from "@date-io/moment";
import { useField, useFormikContext } from "formik";
import moment, { Moment } from "moment";
import { TextFieldProps } from "@material-ui/core";

const inputProps = {
  inputMode: "numeric"
} as const;

const keyboardButtonProps = {
  tabIndex: -1
} as const;

const validate = (value: Moment | null): string | undefined => {
  if (value) {
    if (!value.isValid()) {
      return "Invalid Date";
    }
  } else {
    return "Date is Required";
  }
};

const DateField = function(
  props: {
    variant?: "filled" | "outlined";
    autoFocus?: boolean;
  } & TextFieldProps
) {
  const { variant: inputVariant = "filled", autoFocus = false } = props;

  const calOpen = useRef(false);

  const { isSubmitting } = useFormikContext();

  const [field, meta, helpers] = useField<Moment | null>({
    name: "date",
    validate
  });

  const { value } = field;
  const { error, touched } = meta;
  const { setValue, setTouched } = helpers;

  const InputProps = useMemo(
    () => ({
      autoFocus
    }),
    [autoFocus]
  );

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

  const onChange = useCallback(
    (date: Moment | null) =>
      setValue(date ? moment.min([date, moment()]) : date),
    [setValue]
  );

  const dataPickerProps: KeyboardDatePickerProps = useMemo(
    () => ({
      ...field,
      value: field.value,
      disabled: isSubmitting,
      error: touched && !!error,
      helperText: touched ? error : undefined,
      animateYearScrolling: true,
      disableToolbar: true,
      disableFuture: true,
      inputVariant,
      variant: "inline",
      format: "MM/DD/YYYY",
      margin: "none",
      label: "Date",
      initialFocusedDate: field.value || moment(),
      autoOk: true,
      InputProps,
      inputProps,
      placeholder: "mm/dd/yyyy",
      KeyboardButtonProps: keyboardButtonProps,
      onBlur,
      onOpen,
      onClose,
      onChange
    }),
    [
      onBlur,
      error,
      inputVariant,
      InputProps,
      isSubmitting,
      field,
      onOpen,
      onClose,
      onChange,
      touched
    ]
  );

  return (
    <MuiPickersUtilsProvider utils={MomentUtils}>
      <KeyboardDatePicker {...(props as any)} {...dataPickerProps} />
    </MuiPickersUtilsProvider>
  );
};

export default DateField;
