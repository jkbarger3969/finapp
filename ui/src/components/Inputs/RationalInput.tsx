import React, { useCallback, forwardRef, Ref } from "react";
import { TextField, TextFieldProps, useControlled } from "@material-ui/core";
import Fraction from "fraction.js";
import { Control, UseControllerProps } from "react-hook-form";

import { useController } from "../../utils/reactHookForm";

const NULLISH = Symbol();

export type RationalInputBaseProps = Omit<
  TextFieldProps,
  "value" | "onChange" | "defaultValue" | "type"
> & {
  onChange?: (
    event: Parameters<NonNullable<TextFieldProps["onChange"]>>[0],
    rational: Fraction | null,
    value: string
  ) => void;
  decimalPlaces?: number;
  defaultValue?: string | number | Fraction;
  value?: string | number | Fraction | null;
};

export const RationalInputBase = forwardRef(function RationalInputBase(
  props: RationalInputBaseProps,
  ref: Ref<HTMLDivElement>
): JSX.Element {
  const {
    defaultValue,
    decimalPlaces,
    onChange: onChangeProp,
    value: valueProp,
    ...rest
  } = props;

  const [value, setValue] = useControlled({
    controlled: valueProp,
    default: defaultValue,
    name: "RationalInputBase",
    state: "value",
  });

  const onChange = useCallback<NonNullable<TextFieldProps["onChange"]>>(
    (event) => {
      const value = event.target.value.trim() ?? "";

      setValue(value);

      if (onChangeProp) {
        onChangeProp(
          event,
          (() => {
            try {
              return value ? new Fraction(value) : null;
            } catch {
              return null;
            }
          })(),
          value
        );
      }
    },
    [onChangeProp, setValue]
  );

  return (
    <TextField
      {...rest}
      ref={ref}
      onChange={onChange}
      type="number"
      value={(() => {
        if ((value ?? NULLISH) === NULLISH) {
          return "";
        } else if (value instanceof Fraction) {
          return value.toString(decimalPlaces);
        } else {
          return (value as number | string).toString();
        }
      })()}
    />
  );
});

export type RationalInputProps = {
  control?: Control;
  rules?: UseControllerProps["rules"];
} & Omit<RationalInputBaseProps, "onChange" | "value" | "inputRef">;

export const RationalInput = forwardRef(function RationalInput(
  props: RationalInputProps,
  ref: Ref<HTMLDivElement>
): JSX.Element {
  const {
    control,
    name: nameProp = "rational",
    onBlur: onBlurProp,
    disabled,
    defaultValue = null,
    rules,
    ...rest
  } = props;

  const {
    field: {
      onBlur: onBlurControlled,
      onChange: onChangeControlled,
      ref: inputRef,
      ...field
    },
    fieldState: { isTouched, error },
    formState: { isSubmitting, isValidating },
  } = useController({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    name: nameProp as any,
    control,
    defaultValue,
    rules,
    shouldUnregister: true,
  });

  const handleBlur = useCallback<NonNullable<RationalInputBaseProps["onBlur"]>>(
    (...args) => {
      onBlurControlled();
      if (onBlurProp) {
        onBlurProp(...args);
      }
    },
    [onBlurControlled, onBlurProp]
  );

  const handleChange = useCallback<
    NonNullable<RationalInputBaseProps["onChange"]>
  >(
    (_, value) => {
      onChangeControlled(value);
    },
    [onChangeControlled]
  );

  return (
    <RationalInputBase
      {...rest}
      {...field}
      {...(isTouched && error
        ? {
            error: true,
            helperText: error.message,
          }
        : {})}
      ref={ref}
      disabled={isSubmitting || isValidating || disabled}
      inputRef={inputRef}
      onBlur={handleBlur}
      onChange={handleChange}
    />
  );
});
