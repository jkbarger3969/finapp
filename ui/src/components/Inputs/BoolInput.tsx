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

import {
  useField,
  UseFieldOptions,
  useFormContext,
  FieldValue,
} from "../../useKISSForm/form";

export type BoolFieldDef<TName extends string> = {
  [key in TName]: FieldValue<boolean>;
};

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
> = Omit<UseFieldOptions<boolean>, "validator"> &
  Omit<BoolBaseInputProps<BoolVariant>, "checked" | "name">;

export const BoolInput = forwardRef(function BoolInput<
  BoolVariant extends BoolBaseInputVariant | undefined = undefined
>(props: BoolInputProps<BoolVariant>, ref: Ref<HTMLDivElement>) {
  const {
    name: nameProp,
    defaultValue,
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
  } = useField<boolean>({
    name: nameProp,
    defaultValue,
    form,
  });

  const handleChange = useCallback<NonNullable<BoolBaseInputProps["onChange"]>>(
    (...args) => {
      setValue(args[1]);
      if (onChangeProp) {
        onChangeProp(...args);
      }
    },
    [setValue, onChangeProp]
  );

  const handleBlur = useCallback<NonNullable<BoolBaseInputProps["onBlur"]>>(
    (...args) => {
      setTouched(true);

      if (onBlurProp) {
        onBlurProp(...args);
      }
    },
    [setTouched, onBlurProp]
  );

  return (
    <BoolBaseInput
      ref={ref}
      {...rest}
      {...(isTouched && errors.length
        ? {
            error: true,
            helperText: errors[0].message,
          }
        : {})}
      name={name}
      checked={value ?? false}
      onChange={handleChange}
      onBlur={handleBlur}
      disabled={isSubmitting || disabled}
    />
  );
});
