import React, { useCallback, useMemo, useState } from "react";
import { TextField, TextFieldProps } from "@material-ui/core";
import Fraction from "fraction.js";

const NULLISH = Symbol();

export type RationalInputProps = Omit<
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
  value?: string | number | Fraction;
};

export const RationalInput = (props: RationalInputProps): JSX.Element => {
  const {
    defaultValue: defaultValueProp,
    decimalPlaces,
    onChange: onChangeProp,
    value: valueProp,
    variant,
    ...rest
  } = props;

  const isValueControlled = valueProp !== undefined;

  const [state, setState] = useState({
    value: defaultValueProp,
  });

  const onChange = useCallback<NonNullable<TextFieldProps["onChange"]>>(
    (event) => {
      const value = event.target.value.trim() ?? "";

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

      if (!isValueControlled) {
        setState((state) => ({
          ...state,
          value,
        }));
      }
    },
    [onChangeProp, isValueControlled, setState]
  );

  const value = useMemo<string>(() => {
    const value = isValueControlled ? valueProp : state.value;

    if ((value ?? NULLISH) === NULLISH) {
      return "";
    } else if (value instanceof Fraction) {
      return value.toString(decimalPlaces);
    } else {
      return (value as number | string).toString();
    }
  }, [decimalPlaces, isValueControlled, valueProp, state.value]);

  return (
    <TextField
      {...rest}
      onChange={onChange}
      type="number"
      value={value}
      variant={variant}
    />
  );
};
