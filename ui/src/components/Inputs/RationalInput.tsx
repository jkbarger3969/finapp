import React, {
  useCallback,
  forwardRef,
  Ref,
  useMemo,
  useState,
  useEffect,
} from "react";
import { TextField, TextFieldProps, useControlled } from "@material-ui/core";
import Fraction from "fraction.js";

import {
  useField,
  UseFieldOptions,
  useFormContext,
  FieldValue,
  IsEqualFn,
} from "../../useKISSForm/form";

export type RationalInputBaseProps = Omit<
  TextFieldProps,
  "value" | "onChange" | "defaultValue" | "type"
> & {
  decimals?: number;
  showDecimalZeros?: boolean;
  onChange?: (
    event: Parameters<NonNullable<TextFieldProps["onChange"]>>[0],
    rational: Fraction | null,
    value: string
  ) => void;
  defaultValue?: Fraction;
  value?: Fraction | null;
};

const formatDecimals = (input: string, decimals?: number) => {
  input = input.trim();
  if (input && decimals !== undefined) {
    const [whole, decimal = ""] = input.split(".");
    if (decimals === 0) {
      return whole;
    } else if (decimal.length > decimals) {
      return `${whole}.${decimal.slice(0, decimals)}`;
    }
  }
  return input;
};

const rationalToFixed = (rational: Fraction, decimals?: number): string =>
  decimals === undefined
    ? rational.valueOf().toString()
    : rational.valueOf().toFixed(decimals);

export const RationalInputBase = forwardRef(function RationalInputBase(
  props: RationalInputBaseProps,
  ref: Ref<HTMLDivElement>
): JSX.Element {
  const {
    defaultValue,
    onChange: onChangeProp,
    decimals,
    showDecimalZeros = true,
    onBlur: onBlurProp,
    value: valueProp,
    ...rest
  } = props;

  const [valueUnformatted, setValue] = useControlled({
    controlled: valueProp,
    default: defaultValue,
    name: "RationalInputBase",
    state: "value",
  });

  const [inputValue, setInputValue] = useState(() =>
    valueUnformatted ? rationalToFixed(valueUnformatted, decimals) : ""
  );

  // Insure value and inputValue stay synced.
  useEffect(() => {
    if (valueUnformatted) {
      if (!inputValue || !valueUnformatted.equals(inputValue)) {
        setInputValue(rationalToFixed(valueUnformatted, decimals));
      }
    } else if (inputValue) {
      setInputValue("");
    }
  }, [decimals, inputValue, valueUnformatted]);

  const handleChange = useCallback<NonNullable<TextFieldProps["onChange"]>>(
    (event) => {
      const value = formatDecimals(event.target.value ?? "", decimals);

      const rational = (() => {
        try {
          return value ? new Fraction(value) : null;
        } catch {
          return null;
        }
      })();

      setInputValue(value);
      setValue(rational);

      if (onChangeProp) {
        onChangeProp(event, rational, value);
      }
    },
    [decimals, onChangeProp, setValue]
  );

  const handleBlur = useCallback<NonNullable<TextFieldProps["onBlur"]>>(
    (...args) => {
      if (decimals !== undefined && showDecimalZeros) {
        if (valueUnformatted) {
          setInputValue(rationalToFixed(valueUnformatted, decimals));
        }
      }

      if (onBlurProp) {
        onBlurProp(...args);
      }
    },
    [decimals, onBlurProp, showDecimalZeros, valueUnformatted]
  );

  return (
    <TextField
      {...rest}
      ref={ref}
      onChange={handleChange}
      onBlur={handleBlur}
      type="number"
      value={inputValue}
    />
  );
});

const isRationalEqual: IsEqualFn<Fraction> = (a, b) => a.equals(b);

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
    isEqual: isRationalEqual,
    defaultValue: useMemo(() => {
      if (defaultValue !== undefined) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return new Fraction(defaultValue as any);
      }
    }, [defaultValue]),
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
      value={value ?? null}
      disabled={isSubmitting || disabled}
      onBlur={handleBlur}
      onChange={handleChange}
    />
  );
});
