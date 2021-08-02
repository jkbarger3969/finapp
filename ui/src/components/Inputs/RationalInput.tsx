import React, { useCallback, forwardRef, Ref, useMemo } from "react";
import { TextField, TextFieldProps, useControlled } from "@material-ui/core";
import Fraction from "fraction.js";

import {
  useField,
  UseFieldOptions,
  useFormContext,
  FieldValue,
} from "../../useKISSForm/form";

const NULLISH = Symbol("NULLISH");

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

export type RationalInputProps = Omit<
  RationalInputBaseProps,
  "value" | "name"
> &
  Omit<UseFieldOptions, "defaultValue" | "validator">;

export type RationalFieldDef<TName extends string> = {
  [key in TName]: FieldValue<Fraction>;
};
export const RationalInput = forwardRef(function RationalInput(
  props: RationalInputProps,
  ref: Ref<HTMLDivElement>
): JSX.Element {
  const {
    name: nameProp,
    form,
    shouldUnregister,
    onBlur: onBlurProp,
    onChange: onChangeProp,
    disabled,
    defaultValue,
    ...rest
  } = props;

  const isSubmitting = useFormContext(form)?.isSubmitting ?? false;

  const {
    props: { name, value },
    state: { isTouched, errors },
    setValue,
    setTouched,
  } = useField<Fraction>({
    name: nameProp,
    defaultValue: useMemo(() => {
      if (defaultValue !== undefined) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return new Fraction(defaultValue as any);
      }
    }, [defaultValue]),
    shouldUnregister,
    form,
  });

  const handleBlur = useCallback<NonNullable<RationalInputBaseProps["onBlur"]>>(
    (...args) => {
      setTouched(true);
      if (onBlurProp) {
        onBlurProp(...args);
      }
    },
    [setTouched, onBlurProp]
  );

  const handleChange = useCallback<
    NonNullable<RationalInputBaseProps["onChange"]>
  >(
    (...args) => {
      setValue(args[1] ?? undefined);
      if (onChangeProp) {
        onChangeProp(...args);
      }
    },
    [setValue, onChangeProp]
  );

  return (
    <RationalInputBase
      {...rest}
      {...(isTouched && errors.length
        ? {
            error: true,
            helperText: errors[0].message,
          }
        : {})}
      ref={ref}
      name={name}
      value={value}
      disabled={isSubmitting || disabled}
      onBlur={handleBlur}
      onChange={handleChange}
    />
  );
});
