import React, { useMemo, useState, useCallback } from "react";
import { TextField, TextFieldProps, Box, Chip } from "@material-ui/core";
import gql from "graphql-tag";
import { useQuery, QueryHookOptions } from "@apollo/react-hooks";
import { useField, FieldInputProps } from "formik";

import { PAY_METHOD_ENTRY_OPT_FRAGMENT } from "../upsertEntry.gql";
import {
  PayMethodEntryOptsQuery as PayMethodEntryOpts,
  PayMethodEntryOptsQueryVariables as PayMethodEntryOptsQueryVars,
  PayMethodEntryOptFragment,
} from "../../../../apollo/graphTypes";
import Autocomplete, {
  AutocompleteProps as AutocompletePropsRaw,
  RenderInputParams,
} from "@material-ui/lab/Autocomplete";
import { UseAutocompleteMultipleProps } from "@material-ui/lab/useAutocomplete";
import { ChevronRight } from "@material-ui/icons";
import { CHECK_ID } from "../../constants";
import {
  TransmutationValue,
  useFormikStatus,
  FormikStatusType,
} from "../../../../utils/formik";

type Value = PayMethodEntryOptFragment | string;

type AutocompleteProps = AutocompletePropsRaw<Value> &
  UseAutocompleteMultipleProps<Value>;

const PAY_METHOD_ENTRY_OPTS = gql`
  query PayMethodEntryOpts($where: PaymentMethodWhereInput!) {
    paymentMethods(where: $where) {
      ...PayMethodEntryOptFragment
    }
  }
  ${PAY_METHOD_ENTRY_OPT_FRAGMENT}
`;

export type PaymentMethodValue = TransmutationValue<string, Value[]>;

const validate = (payMethodValue: PaymentMethodValue | undefined) => {
  const value = payMethodValue?.value ?? [];
  const numValues = value.length;
  const curValue = value[numValues - 1];
  const parent = value[numValues - 2] as PayMethodEntryOptFragment | undefined;

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

const renderTags: AutocompleteProps["renderTags"] = (values, getTagProps) => {
  const lastIndex = values.length - 1;
  return values.map((value: Value, index: number) => {
    const isLastIndex = lastIndex === index;
    const { key, ...props } = getTagProps({ index }) as Record<string, unknown>;

    const parent = values[index - 1] as PayMethodEntryOptFragment | undefined;

    const isString = typeof value === "string";

    let label: string;
    switch (parent?.id) {
      case CHECK_ID:
        label =
          "CK-" +
          (isString ? value : (value as PayMethodEntryOptFragment).name);
        break;
      default:
        label = getOptionLabel(value);
    }

    let endAdornment: JSX.Element | undefined;
    if (!isLastIndex) {
      endAdornment = <ChevronRight fontSize="small" />;
    } else if (!isString) {
      // Add Prefixes
      switch ((value as PayMethodEntryOptFragment).id) {
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
    | keyof Omit<RenderInputParams, "id" | "disabled">
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

  const variables = useMemo<PayMethodEntryOptsQueryVars>(
    () =>
      curValue === null
        ? {
            where: {
              hasParent: false,
            },
          }
        : {
            where: {
              parent: {
                eq: (curValue as PayMethodEntryOptFragment).id,
              },
            },
          },
    [curValue]
  );

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
    variables,
    onError,
  });

  const options = useMemo<PayMethodEntryOptFragment[]>(
    () =>
      !data?.paymentMethods ||
      typeof curValue === "string" ||
      curValue?.id === CHECK_ID
        ? []
        : data.paymentMethods,
    [data, curValue]
  );

  const hasOptions = options.length > 0;

  const freeSolo = useMemo<boolean>(
    () => (curValue as PayMethodEntryOptFragment | null)?.id === CHECK_ID,
    [curValue]
  );

  const disableTextInput = useMemo(() => !hasOptions && !freeSolo, [
    hasOptions,
    freeSolo,
  ]);

  const label = useMemo(() => {
    if (
      typeof curValue === "string" ||
      (curValue as PayMethodEntryOptFragment | null)?.id === CHECK_ID
    ) {
      return "Check #";
    }

    return "Payment Method";
  }, [curValue]);

  const InputProps = useMemo(() => {
    if ((curValue as PayMethodEntryOptFragment | null)?.id === CHECK_ID) {
      return {
        type: "number",
      };
    }

    return {};
  }, [curValue]);

  const inputProps = useMemo(() => {
    if ((curValue as PayMethodEntryOptFragment | null)?.id === CHECK_ID) {
      return {
        min: "0",
        step: "1",
      };
    }

    return {};
  }, [curValue]);

  const renderInput = useCallback(
    (params: RenderInputParams) => {
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
