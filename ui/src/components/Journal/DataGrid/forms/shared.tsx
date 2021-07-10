import { GridProps, TextField, TextFieldProps } from "@material-ui/core";
import React, { useCallback, forwardRef, Ref, PropsWithChildren } from "react";
import {
  useController,
  UseControllerProps,
  FieldValues,
  FieldPath,
} from "react-hook-form";
import { OmitProperties } from "ts-essentials";

export const preventDefault = (
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  event?: React.SyntheticEvent<any, Event>
): void => {
  if (event && !event.defaultPrevented) {
    event.preventDefault();
  }
};

export const stopPropagation = (
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  event?: React.SyntheticEvent<any, Event>
): void => {
  if (event && !event.isPropagationStopped()) {
    event.stopPropagation();
  }
};

export const preventDefaultEnter = (
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  event?: React.KeyboardEvent<any>
): void => {
  if (event && event.key === "Enter") {
    preventDefault(event);
  }
};
const NULLISH = Symbol();

export const usePreventEnterOnNullish = function <T>(
  value?: T | null
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
): React.KeyboardEventHandler<any> {
  return useCallback(
    (
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      event?: React.KeyboardEvent<any>
    ) => {
      if ((value ?? NULLISH) === NULLISH) {
        preventDefaultEnter(event);
      }
    },
    [value]
  );
};

export const removeNullishProperties = <T extends Record<string, unknown>>(
  obj: T
): OmitProperties<T, undefined | null> =>
  Object.keys(obj).reduce((newObj, key) => {
    if ((obj[key] ?? NULLISH) !== NULLISH) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (newObj as any)[key] = obj[key];
    }
    return newObj;
  }, {} as OmitProperties<T, undefined | null>);

export const inputGridContainerProps: GridProps = {
  item: true,
  lg: 4,
  sm: 6,
  xs: 12,
} as const;

export type TextFieldControlledProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
> = UseControllerProps<TFieldValues, TName> &
  Omit<TextFieldProps, keyof UseControllerProps | "value" | "inputRef"> & {
    setValueAs?: (
      ...args: Parameters<NonNullable<TextFieldProps["onChange"]>>
    ) => // eslint-disable-next-line @typescript-eslint/no-explicit-any
    any;
  };

export const TextFieldControlled = forwardRef(function TextFieldControlled(
  props: PropsWithChildren<TextFieldControlledProps>,
  ref: Ref<HTMLDivElement>
) {
  const {
    name,
    control,
    defaultValue,
    rules,
    shouldUnregister,
    onBlur: onBlurProp,
    onChange: onChangeProp,
    disabled,
    children,
    setValueAs,
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
    formState: { isSubmitting },
  } = useController({
    name,
    control,
    defaultValue,
    rules,
    shouldUnregister,
  });

  return (
    <TextField
      {...rest}
      {...field}
      ref={ref}
      disabled={disabled || isSubmitting}
      innerRef={inputRef}
      {...(isTouched && error
        ? {
            error: true,
            helperText: error.message,
          }
        : {})}
      onBlur={useCallback<NonNullable<TextFieldProps["onBlur"]>>(
        (...args) => {
          onBlurControlled();

          if (onBlurProp) {
            onBlurProp(...args);
          }
        },
        [onBlurControlled, onBlurProp]
      )}
      onChange={useCallback<NonNullable<TextFieldProps["onChange"]>>(
        (...args) => {
          if (setValueAs) {
            onChangeControlled(setValueAs(...args));
          } else {
            onChangeControlled(...args);
          }

          if (onChangeProp) {
            onChangeProp(...args);
          }
        },
        [onChangeControlled, onChangeProp, setValueAs]
      )}
    >
      {children}
    </TextField>
  );
});
