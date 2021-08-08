import React, { useCallback, forwardRef, Ref, PropsWithChildren } from "react";
import { QueryHookOptions as QueryHookOptionsApollo } from "@apollo/client";
import { CircularProgress, TextField, TextFieldProps } from "@material-ui/core";
import { Autocomplete, AutocompleteProps } from "@material-ui/lab";
import {
  TreeSelectProps,
  mergeInputEndAdornment,
  defaultInput,
  BranchNode,
} from "mui-tree-select";
import {
  useField,
  UseFieldOptions,
  useFormContext,
  Validator,
} from "../../useKISSForm/form";

export type QueryHookOptions = Omit<QueryHookOptionsApollo, "variables">;

const BLANK_OPTIONS: unknown[] = [];
export const LoadingDefaultBlank = forwardRef(function LoadingDefaultBlank(
  {
    // grab all props effecting appearance and discard rest.
    renderInput = defaultInput,
    classes,
    closeIcon,
    forcePopupIcon,
    fullWidth,
    popupIcon,
    size,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    ...discard
  }:
    | // eslint-disable-next-line @typescript-eslint/no-explicit-any
    Partial<AutocompleteProps<any, true | false, true | false, true | false>>
    | Partial<
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        TreeSelectProps<any, any, true | false, true | false, true | false>
      >,
  ref: Ref<unknown>
): JSX.Element {
  return (
    <Autocomplete
      ref={ref}
      classes={classes}
      closeIcon={closeIcon}
      forcePopupIcon={forcePopupIcon}
      fullWidth={fullWidth}
      popupIcon={popupIcon}
      size={size}
      defaultValue={undefined}
      value={null}
      inputValue=""
      disabled
      options={BLANK_OPTIONS}
      renderInput={useCallback<
        AutocompleteProps<
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          any,
          undefined,
          undefined,
          undefined
        >["renderInput"]
      >(
        (params) =>
          renderInput({
            ...params,
            InputProps: mergeInputEndAdornment(
              "append",
              <CircularProgress size={20} color="inherit" />,
              params.InputProps
            ),
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
          } as any),
        [renderInput]
      )}
    />
  );
});

export const sortBranchesToTop = (
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  a: any | BranchNode<any>,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  b: any | BranchNode<any>
): number => {
  // Put branches at top of options to encourage, more detailed
  // labeling for users.

  const aIsBranch = a instanceof BranchNode;
  const bIsBranch = b instanceof BranchNode;

  if (aIsBranch) {
    return bIsBranch ? 0 : -1;
  } else if (bIsBranch) {
    return aIsBranch ? 0 : 1;
  } else {
    return 0;
  }
};

export type TextFieldControlledProps<
  T = unknown,
  TName extends string = string,
  TFieldDef extends Record<string, unknown> = Record<string, unknown>
> = UseFieldOptions<T, TName, TFieldDef> &
  Omit<TextFieldProps, keyof UseFieldOptions | "value"> & {
    setValueAs?: (
      ...args: Parameters<NonNullable<TextFieldProps["onChange"]>>
    ) => T;
  };

export const TextFieldControlled = forwardRef(function TextFieldControlled(
  props: PropsWithChildren<TextFieldControlledProps>,
  ref: Ref<HTMLDivElement>
) {
  const {
    name: nameProp,
    defaultValue,
    validator,
    shouldRunValidation,
    shouldUnregister,
    form,
    onBlur: onBlurProp,
    onChange: onChangeProp,
    disabled,
    children,
    setValueAs,
    ...rest
  } = props;

  const isSubmitting = useFormContext(form)?.isSubmitting ?? false;

  const {
    props: { value, name },
    state: { isTouched, errors },
    setValue,
    setTouched,
  } = useField({
    name: nameProp,
    defaultValue,
    validator,
    shouldRunValidation,
    shouldUnregister,
    form,
  });

  return (
    <TextField
      {...rest}
      name={name}
      value={value ?? ""}
      ref={ref}
      disabled={disabled || isSubmitting}
      {...(isTouched && errors.length
        ? {
            error: true,
            helperText: errors[0].message,
          }
        : {})}
      onBlur={useCallback<NonNullable<TextFieldProps["onBlur"]>>(
        (...args) => {
          setTouched(true);

          if (onBlurProp) {
            onBlurProp(...args);
          }
        },
        [setTouched, onBlurProp]
      )}
      onChange={useCallback<NonNullable<TextFieldProps["onChange"]>>(
        (...args) => {
          if (setValueAs) {
            setValue(setValueAs(...args));
          } else {
            setValue(args[0].target.value.trim() || undefined);
          }

          if (onChangeProp) {
            onChangeProp(...args);
          }
        },
        [setValue, onChangeProp, setValueAs]
      )}
    >
      {children}
    </TextField>
  );
});

const REQUIRED_ERROR = new Error("Required");
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const requiredValidator: Validator<any> = (_, { form, name }) => {
  const value = form.getFieldValue(name, false);
  if (
    value === undefined ||
    value === null ||
    (typeof value === "string" && value.trim() === "")
  ) {
    return REQUIRED_ERROR;
  }
};
