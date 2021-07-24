import React, { forwardRef, Ref, useCallback } from "react";
import {
  KeyboardDatePicker,
  KeyboardDatePickerProps,
  MuiPickersUtilsProvider,
} from "@material-ui/pickers";
import DateFnsUtils from "@date-io/date-fns";
import { Control, UseControllerProps } from "react-hook-form";
import { MarkOptional } from "ts-essentials";

import { useController } from "../../utils/reactHookForm";

export type DateInputProps = {
  control?: Control;
  rules?: UseControllerProps["rules"];
  defaultValue?: Date;
} & MarkOptional<
  Omit<KeyboardDatePickerProps, "value" | "inputRef" | "required">,
  "onChange"
>;

export const DateInput = forwardRef(
  (props: DateInputProps, ref: Ref<HTMLDivElement>) => {
    const {
      control,
      rules,
      defaultValue = null,
      name: nameProp = "date",
      onBlur: onBlurProp,
      onChange: onChangeProp,
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

    const handleChange = useCallback<KeyboardDatePickerProps["onChange"]>(
      (...args) => {
        onChangeControlled(args[0]);
        if (onChangeProp) {
          onChangeProp(...args);
        }
      },
      [onChangeControlled, onChangeProp]
    );

    const handleBlur = useCallback<
      NonNullable<KeyboardDatePickerProps["onBlur"]>
    >(
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
          onChange={handleChange}
          onBlur={handleBlur}
          disabled={isSubmitting || disabled}
        />
      </MuiPickersUtilsProvider>
    );
  }
);
