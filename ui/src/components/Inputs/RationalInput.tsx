import React, { useCallback, useMemo } from "react";
import { TextField, TextFieldProps, useControlled } from "@material-ui/core";
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
  value?: string | number | Fraction | null;
};

export const RationalInput = (props: RationalInputProps): JSX.Element => {
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
    name: "RationalInput",
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
};
