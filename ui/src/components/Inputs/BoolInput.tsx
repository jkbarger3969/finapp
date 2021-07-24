/* eslint-disable react/prop-types */
import React, { forwardRef, Ref, useCallback } from "react";
import {
  Checkbox,
  CheckboxProps,
  Switch,
  SwitchProps,
  FormControlLabel,
  FormControlLabelProps,
  FormControl,
  FormControlProps,
  FormHelperText,
  FormHelperTextProps,
} from "@material-ui/core";
import { Control, UseControllerProps } from "react-hook-form";
import { MarkRequired } from "ts-essentials";

import { useController } from "../../utils/reactHookForm";

export type BoolBaseInputVariant = "checkbox" | "switch";

export type BoolBaseInputProps<
  BoolVariant extends BoolBaseInputVariant | undefined = undefined
> = {
  name?: string;
  boolVariant?: BoolVariant;
  label?: FormControlLabelProps["label"];
  helperText?: React.ReactNode;
  FormHelperTextProps?: Partial<FormHelperTextProps>;
  FormControlLabelProps?: Partial<FormControlLabelProps>;
} & Omit<FormControlProps, "onChange"> &
  (BoolVariant extends "checkbox" | undefined
    ? { CheckboxProps?: Partial<CheckboxProps> } & Pick<
        CheckboxProps,
        "onChange" | "checked" | "inputRef"
      >
    : { SwitchProps?: Partial<SwitchProps> } & Pick<
        SwitchProps,
        "onChange" | "checked" | "inputRef"
      >);

export const BoolBaseInput = forwardRef(function BoolBaseInput<
  BoolVariant extends BoolBaseInputVariant = "checkbox"
>(props: BoolBaseInputProps<BoolVariant>, ref: Ref<HTMLDivElement>) {
  // eslint-disable-next-line react/prop-types
  const {
    boolVariant = "checkbox",
    name,
    label,
    helperText,
    onChange,
    checked,
    error,
    id,
    color,
    inputRef,
    FormHelperTextProps: FormHelperTextPropsProp = {},
    FormControlLabelProps: FormControlLabelPropsProp = {},
    CheckboxProps: CheckboxPropsProp = {},
    SwitchProps: SwitchPropsProp = {},
    ...rest
  } = props as BoolBaseInputProps<"checkbox"> & BoolBaseInputProps<"switch">;

  const helperTextId = helperText
    ? FormHelperTextPropsProp["id"] || (id ? `${id}-helper-text` : undefined)
    : undefined;

  const inputLabelId = label
    ? FormControlLabelPropsProp["id"] || (id ? `${id}-label` : undefined)
    : undefined;

  return (
    <FormControl ref={ref} error={error} {...rest}>
      <FormControlLabel
        htmlFor={id}
        id={inputLabelId}
        label={label}
        control={
          boolVariant === "checkbox" ? (
            <Checkbox
              id={id}
              aria-describedby={helperTextId}
              color={color}
              onChange={onChange}
              checked={checked}
              inputRef={inputRef}
              {...CheckboxPropsProp}
              inputProps={{
                name,
                ...(CheckboxPropsProp.inputProps || {}),
              }}
            />
          ) : (
            <Switch
              id={id}
              aria-describedby={helperTextId}
              color={color}
              onChange={onChange}
              checked={checked}
              inputRef={inputRef}
              {...SwitchPropsProp}
              inputProps={{
                name,
                ...(SwitchPropsProp.inputProps || {}),
              }}
            />
          )
        }
        {...FormControlLabelPropsProp}
      />
      {helperText && (
        <FormHelperText id={helperTextId} {...FormHelperTextPropsProp}>
          {helperText}
        </FormHelperText>
      )}
    </FormControl>
  );
});

export type BoolInputProps<
  BoolVariant extends BoolBaseInputVariant | undefined = undefined
> = {
  control?: Control;
  rules?: UseControllerProps["rules"];
  defaultValue?: boolean;
} & MarkRequired<
  Omit<BoolBaseInputProps<BoolVariant>, "checked" | "inputRef">,
  "name"
>;

export const BoolInput = forwardRef(function BoolInput<
  BoolVariant extends BoolBaseInputVariant | undefined = undefined
>(props: BoolInputProps<BoolVariant>, ref: Ref<HTMLDivElement>) {
  const {
    control,
    rules,
    defaultValue = false,
    name: nameProp,
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

  const handleChange = useCallback<NonNullable<BoolBaseInputProps["onChange"]>>(
    (...args) => {
      onChangeControlled(args[0]);
      if (onChangeProp) {
        onChangeProp(...args);
      }
    },
    [onChangeControlled, onChangeProp]
  );

  const handleBlur = useCallback<NonNullable<BoolBaseInputProps["onBlur"]>>(
    (...args) => {
      onBlurControlled();

      if (onBlurProp) {
        onBlurProp(...args);
      }
    },
    [onBlurControlled, onBlurProp]
  );

  return (
    <BoolBaseInput
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
      onChange={handleChange}
      onBlur={handleBlur}
      disabled={isSubmitting || disabled}
    />
  );
});
