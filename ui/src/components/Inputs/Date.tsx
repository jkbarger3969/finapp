import React, { forwardRef, Ref, useCallback } from "react";
import {
  KeyboardDatePicker,
  KeyboardDatePickerProps,
  MuiPickersUtilsProvider,
} from "@material-ui/pickers";
import DateFnsUtils from "@date-io/date-fns";
import { MarkOptional } from "ts-essentials";
import { isEqual, isValid } from "date-fns";

import {
  useField,
  useFormContext,
  Validator,
  UseFieldOptions,
  FieldValue,
} from "../../useKISSForm/form";

const validDate: Validator<Date, string> = (value) => {
  // Do NOT test 'blank' field i.e. undefined
  if (value === undefined || isValid(value)) {
    return;
  }
  return new TypeError("Invalid Date");
};

export type DateInputProps = MarkOptional<
  Omit<KeyboardDatePickerProps, "value">,
  "onChange"
> &
  Omit<UseFieldOptions<Date>, "validator">;

export const DATE_NAME = "date";
export type DateFieldDef<TName extends string = typeof DATE_NAME> = {
  [key in TName]: FieldValue<Date>;
};

export const DateInput = forwardRef(
  (props: DateInputProps, ref: Ref<HTMLDivElement>) => {
    const {
      defaultValue,
      name: nameProp = DATE_NAME,
      form,
      onBlur: onBlurProp,
      onChange: onChangeProp,
      disabled,
      ...rest
    } = props;

    const isSubmitting = useFormContext(form)?.isSubmitting ?? false;

    const {
      props: { name, value },
      state: { isTouched, errors },
      setValue,
      setTouched,
    } = useField<Date>({
      name: nameProp,
      defaultValue,
      isEqual: isEqual,
      validator: validDate,
      form,
    });

    const handleChange = useCallback<KeyboardDatePickerProps["onChange"]>(
      (...args) => {
        // undefined clears values in KISS form
        setValue(args[0] ?? undefined);
        if (onChangeProp) {
          onChangeProp(...args);
        }
      },
      [setValue, onChangeProp]
    );

    const handleBlur = useCallback<
      NonNullable<KeyboardDatePickerProps["onBlur"]>
    >(
      (...args) => {
        setTouched(true);

        if (onBlurProp) {
          onBlurProp(...args);
        }
      },
      [setTouched, onBlurProp]
    );

    return (
      <MuiPickersUtilsProvider utils={DateFnsUtils}>
        <KeyboardDatePicker
          ref={ref}
          {...rest}
          {...(isTouched && errors.length
            ? {
                error: true,
                helperText: errors[0].message,
              }
            : {})}
          name={name}
          // Must control value with null
          value={value ?? null}
          onChange={handleChange}
          onBlur={handleBlur}
          disabled={isSubmitting || disabled}
        />
      </MuiPickersUtilsProvider>
    );
  }
);
