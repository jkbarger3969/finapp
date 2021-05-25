import React, { useMemo, useState, useCallback } from "react";
import { TextField, TextFieldProps, Box, Chip } from "@material-ui/core";
import gql from "graphql-tag";
import { useQuery, QueryHookOptions } from "@apollo/client";
import { useField, FieldInputProps } from "formik";

import {
  PayMethodEntryOptsQuery as PayMethodEntryOpts,
  PayMethodEntryOptsQueryVariables as PayMethodEntryOptsQueryVars,
} from "../../../../apollo/graphTypes";
import Autocomplete, {
  AutocompleteProps as AutocompletePropsRaw,
  AutocompleteRenderInputParams,
  AutocompleteGetTagProps,
} from "@material-ui/lab/Autocomplete";
import { UseAutocompleteProps } from "@material-ui/lab/useAutocomplete";
import { ChevronRight } from "@material-ui/icons";
import { CHECK_ID } from "../../constants";
import {
  TransmutationValue,
  useFormikStatus,
  FormikStatusType,
} from "../../../../utils/formik";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Value = any | string;

type AutocompleteProps = AutocompletePropsRaw<Value, true, false, boolean> &
  UseAutocompleteProps<Value, true, false, boolean>;

const PAY_METHOD_ENTRY_OPTS = gql`
  query PayMethodEntryOpts($where: AccountsWhere!) {
    accounts(where: $where) {
      __typename
    }
  }
`;

export type PaymentMethodValue = TransmutationValue<string, Value[]>;

const validate = (payMethodValue: PaymentMethodValue | undefined) => {
  const value = payMethodValue?.value ?? [];
  const numValues = value.length;
  const curValue = value[numValues - 1];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const parent = value[numValues - 2] as any | undefined;

  if (curValue === undefined) {
    return "Method Required";
  } else if (typeof curValue === "string") {
    if (parent?.id === CHECK_ID) {
      const checkNumber = (curValue.match(/[0-9]/g) ?? []).join("");
      if (!checkNumber) {
        return "Check # Required";
      }
    }
  } else if (curValue.id === CHECK_ID) {
    return "Check # Required";
  }
};

const getOptionLabel: AutocompleteProps["getOptionLabel"] = (opt): string => {
  return typeof opt === "string" ? opt : opt.name;
};

const renderTags: AutocompleteProps["renderTags"] = (
  values: Value[],
  getTagProps: AutocompleteGetTagProps
) => {
  const lastIndex = values.length - 1;
  return values.map((value: Value, index: number) => {
    const isLastIndex = lastIndex === index;
    const { key, ...props } = getTagProps({ index }) as Record<string, unknown>;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const parent = values[index - 1] as any;

    const isString = typeof value === "string";

    let label: string;
    switch (parent?.id) {
      case CHECK_ID:
        label =
          "CK-" +
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (isString ? value : (value as any).name);
        break;
      default:
        label = getOptionLabel(value);
    }

    let endAdornment: JSX.Element | undefined;
    if (!isLastIndex) {
      endAdornment = <ChevronRight fontSize="small" />;
    } else if (!isString) {
      // Add Prefixes
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      switch ((value as any).id) {
        case CHECK_ID:
          endAdornment = <span>CK-</span>;
          break;
      }
    }

    return (
      <Box
        key={key as string}
        display="flex"
        flexDirection="row"
        alignItems="center"
        justifyContent="flex-start"
      >
        <Chip
          color={isLastIndex ? "primary" : "default"}
          variant={isLastIndex ? "default" : "outlined"}
          label={label}
          size="medium"
          {...props}
          disabled={!isLastIndex}
        />{" "}
        {endAdornment}
      </Box>
    );
  });
};

const PaymentMethod = (
  props: {
    variant?: "filled" | "outlined";
  } & Omit<
    TextFieldProps,
    | "value"
    | "variant"
    | "error"
    | "helperText"
    | "name"
    | "label"
    | keyof FieldInputProps<unknown>
    | keyof Omit<AutocompleteRenderInputParams, "id" | "disabled" | "fullWidth">
  >
): JSX.Element => {
  const { disabled = false, ...textFieldProps } = props;

  const [hasFocus, setHasFocus] = useState(false);

  const [field, meta, helpers] = useField<PaymentMethodValue | undefined>({
    name: "paymentMethod",
    validate,
  });

  const onBlurField = field.onBlur;
  const value = field.value?.value ?? [];
  const inputValue = field.value?.inputValue ?? "";
  const { error, touched } = meta;
  const { setValue } = helpers;

  const curValue = value[value.length - 1] ?? null;

  const [formikStatus, setFormikStatus] = useFormikStatus();

  const onError = useCallback<
    NonNullable<
      QueryHookOptions<
        PayMethodEntryOpts,
        PayMethodEntryOptsQueryVars
      >["onError"]
    >
  >(
    (error) =>
      void setFormikStatus({
        msg: error.message,
        type: FormikStatusType.FATAL_ERROR,
      }),
    [setFormikStatus]
  );

  const { loading, error: gqlError, data } = useQuery<
    PayMethodEntryOpts,
    PayMethodEntryOptsQueryVars
  >(PAY_METHOD_ENTRY_OPTS, {
    skip: typeof curValue === "string",
    onError,
  });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const options = useMemo<any[]>(() => [], [data, curValue]);

  const hasOptions = options.length > 0;

  const freeSolo = useMemo<boolean>(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    () => (curValue as any | null)?.id === CHECK_ID,
    [curValue]
  );

  const disableTextInput = useMemo(() => !hasOptions && !freeSolo, [
    hasOptions,
    freeSolo,
  ]);

  const label = useMemo(() => {
    if (
      typeof curValue === "string" ||
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (curValue as any | null)?.id === CHECK_ID
    ) {
      return "Check #";
    }

    return "Payment Method";
  }, [curValue]);

  const InputProps = useMemo(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if ((curValue as any | null)?.id === CHECK_ID) {
      return {
        type: "number",
      };
    }

    return {};
  }, [curValue]);

  const inputProps = useMemo(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if ((curValue as any | null)?.id === CHECK_ID) {
      return {
        min: "0",
        step: "1",
      };
    }

    return {};
  }, [curValue]);

  const renderInput = useCallback(
    (params: AutocompleteRenderInputParams) => {
      params.InputProps = {
        ...(params.InputProps ?? {}),
        ...InputProps,
      };

      params.inputProps = {
        ...(params.inputProps ?? {}),
        ...inputProps,
      };

      const helperText = (() => {
        if (gqlError) {
          return gqlError.message;
        } else if (touched) {
          return error;
        }
      })();

      return (
        <TextField
          {...textFieldProps}
          {...params}
          variant={
            (textFieldProps.variant || "filled") as TextFieldProps["variant"]
          }
          error={(touched && !!error) || !!gqlError}
          helperText={helperText}
          name="paymentMethod"
          label={label}
        />
      );
    },
    [textFieldProps, touched, gqlError, error, label, InputProps, inputProps]
  );

  const onFocus = useCallback(() => setHasFocus(true), [setHasFocus]);
  const onBlur = useCallback<NonNullable<AutocompleteProps["onBlur"]>>(
    (event) => {
      setHasFocus(false);
      // Fixes formik validate called with wrong version of value
      event.persist();
      setTimeout(() => void onBlurField(event), 0);
    },
    [setHasFocus, onBlurField]
  );

  const onChange = useCallback<NonNullable<AutocompleteProps["onChange"]>>(
    (event, value) => {
      setValue({ inputValue, value });
    },
    [setValue, inputValue]
  );

  const onInputChange = useCallback<
    NonNullable<AutocompleteProps["onInputChange"]>
  >(
    (event, inputValue: string) => {
      inputValue = (inputValue || "").trimStart();
      if (!disableTextInput) {
        setValue({ inputValue, value });
      }
    },
    [setValue, value, disableTextInput]
  );

  const autoCompleteProps = useMemo<AutocompleteProps>(
    () => ({
      value,
      disabled:
        !!gqlError ||
        loading ||
        formikStatus?.type === FormikStatusType.FATAL_ERROR ||
        disabled,
      multiple: true,
      options,
      renderInput,
      renderTags,
      freeSolo,
      getOptionLabel,
      onChange,
      onInputChange,
      inputValue: disableTextInput ? "" : inputValue,
      onFocus,
      onBlur,
      open:
        hasFocus &&
        hasOptions &&
        formikStatus?.type !== FormikStatusType.FATAL_ERROR,
      loading,
      autoSelect: true,
      name: "paymentMethod",
    }),
    [
      options,
      value,
      renderInput,
      freeSolo,
      onChange,
      onInputChange,
      inputValue,
      disableTextInput,
      onFocus,
      onBlur,
      hasFocus,
      hasOptions,
      loading,
      gqlError,
      disabled,
      formikStatus,
    ]
  );

  return <Autocomplete {...autoCompleteProps} />;
};

export default PaymentMethod;
