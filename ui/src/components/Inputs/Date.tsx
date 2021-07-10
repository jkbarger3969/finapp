import React, { forwardRef, Ref, useCallback } from "react";
import {
  KeyboardDatePicker,
  KeyboardDatePickerProps,
  MuiPickersUtilsProvider,
} from "@material-ui/pickers";
import DateFnsUtils from "@date-io/date-fns";
import { Control, UseControllerProps } from "react-hook-form";

import { useController } from "../../utils/reactHookForm";

export type DateInputProps = {
  control?: Control;
  rules?: UseControllerProps["rules"];
  defaultValue?: Date;
} & Omit<
  KeyboardDatePickerProps,
  "value" | "onChange" | "inputRef" | "required"
>;

export const DateInput = forwardRef(
  (props: DateInputProps, ref: Ref<HTMLDivElement>) => {
    const {
      control,
      rules,
      defaultValue,
      name: nameProp = "date",
      onBlur: onBlurProp,
      disabled,
      ...rest
    } = props;

    const {
      field: {
        onBlur: onBlurControlled,
        onChange: onChangeControlled,
        ref: inputRef,
        value,
        ...field
      },
      fieldState: { isTouched, error },
      formState: { isSubmitting },
    } = useController({
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      name: nameProp as any,
      control,
      defaultValue,
      rules,
      shouldUnregister: true,
    });

    const onChange = useCallback<KeyboardDatePickerProps["onChange"]>(
      (...args) => {
        onChangeControlled(args[0]);
      },
      [onChangeControlled]
    );

    const onBlur = useCallback<NonNullable<KeyboardDatePickerProps["onBlur"]>>(
      (...args) => {
        onBlurControlled();

        if (onBlurProp) {
          onBlurProp(...args);
        }
      },
      [onBlurControlled, onBlurProp]
    );

    return (
      <MuiPickersUtilsProvider utils={DateFnsUtils}>
        <KeyboardDatePicker
          ref={ref}
          {...rest}
          {...field}
          {...(isTouched && error
            ? {
                error: true,
                helperText: error.message,
              }
            : {})}
          inputRef={inputRef}
          value={value || null}
          onChange={onChange}
          onBlur={onBlur}
          disabled={isSubmitting || disabled}
        />
      </MuiPickersUtilsProvider>
    );
  }
);
