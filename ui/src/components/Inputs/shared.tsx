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
import { UseControllerProps, FieldValues, FieldPath } from "react-hook-form";

import { useController } from "../../utils/reactHookForm";

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
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
> = UseControllerProps<TFieldValues, TName> &
  Omit<
    TextFieldProps,
    keyof UseControllerProps | "value" | "inputRef" | "required"
  > & {
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
