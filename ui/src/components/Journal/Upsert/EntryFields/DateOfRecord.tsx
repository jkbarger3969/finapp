import React, { useMemo, useCallback, useRef } from "react";
import {
  KeyboardDatePicker,
  KeyboardDatePickerProps,
  MuiPickersUtilsProvider,
} from "@material-ui/pickers";
import DateFnsUtils from "@date-io/date-fns";
import { useField, useFormikContext, FieldInputProps } from "formik";
import {
  Box,
  FormControlLabel,
  Grid,
  Switch,
  SwitchProps,
  TextFieldProps,
  Tooltip,
} from "@material-ui/core";
import { parseISO, min, isValid, formatISO, format } from "date-fns";

import {
  TransmutationValue,
  createValueTransmutator,
  useFormikStatus,
  FormikStatusType,
} from "../../../../utils/formik";
import { JournalEntryDateOfRecordUpdate } from "../../../../apollo/graphTypes";
import { O } from "ts-toolbelt";

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
export type DateOfRecordValue = O.Overwrite<
  JournalEntryDateOfRecordUpdate,
  {
    date: TransmutationValue<
      Date | null,
      NonNullable<JournalEntryDateOfRecordUpdate["date"]>
    >;
  }
> | null;

export const DateOfRecord = (
  props: {
    variant?: "filled" | "outlined";
    maxDate?: Date;
    minDate?: Date;
  } & Partial<
    Omit<
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
      | "onError"
      | "onOpen"
      | "onClose"
      | "onChange"
      | keyof FieldInputProps<unknown>
    >
  >
): JSX.Element => {
  const {
    autoFocus = false,
    disabled = false,
    maxDate = new Date(),
    minDate,
  } = props;

  const { variant: inputVariant = "filled", ...textFieldProps } = props;

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
      }
    },
    [minDate, maxDate]
  );

  const [field, meta, helpers] = useField<DateOfRecordValue>({
    name: "dateOfRecord",
    validate,
  });

  const fieldValue = field.value;
  const value = fieldValue?.date?.value ?? null;
  const { error, touched } = meta;
  const { setValue, setTouched } = helpers;

  const initialInputValue = meta.initialValue?.date?.inputValue;
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
      setValue({
        date: dateValueTransmutator(
          // limit max date
          date && isValid(date) ? min([new Date(), date]) : date,
          value
        ),
        clear: !date,
        overrideFiscalYear: !date ? false : fieldValue?.overrideFiscalYear,
      });
    },
    [setValue, fieldValue]
  );

  const onChangeSwitch = useCallback<NonNullable<SwitchProps["onChange"]>>(
    (event, checked) => {
      setValue({
        ...fieldValue,
        overrideFiscalYear: checked,
      });
    },
    [fieldValue, setValue]
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
      label: "Date of Record",
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
    <Grid container direction="row" justify="center" alignItems="center">
      <Box flexGrow="1" marginRight={1} clone>
        <Grid item>
          <MuiPickersUtilsProvider utils={DateFnsUtils}>
            <KeyboardDatePicker
              maxDate={maxDate}
              {...textFieldProps}
              {...dataPickerProps}
            />
          </MuiPickersUtilsProvider>
        </Grid>
      </Box>
      <Grid item>
        <Tooltip title="Override fiscal year with date of record.">
          <FormControlLabel
            label="As Year"
            disabled={
              !value ||
              isSubmitting ||
              disabled ||
              formikStatus?.type === FormikStatusType.FATAL_ERROR
            }
            control={
              <Switch
                checked={fieldValue?.overrideFiscalYear ?? false}
                name="overrideFiscalYear"
                onChange={onChangeSwitch}
              />
            }
          />
        </Tooltip>
      </Grid>
    </Grid>
  );
};
