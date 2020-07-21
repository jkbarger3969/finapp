import React, { useCallback, useMemo, useState, useEffect } from "react";
import Autocomplete, {
  AutocompleteProps as AutocompletePropsRaw,
  RenderInputParams,
} from "@material-ui/lab/Autocomplete";
import { UseAutocompleteMultipleProps } from "@material-ui/lab/useAutocomplete";
import { useField, useFormikContext } from "formik";
import gql from "graphql-tag";
import { useQuery, QueryHookOptions } from "@apollo/react-hooks";
import { TextFieldProps, TextField, Box, Chip } from "@material-ui/core";
import { ChevronRight } from "@material-ui/icons";

import { CAT_ENTRY_OPT_FRAGMENT } from "../upsertEntry.gql";
import {
  CatEntryOptsQuery as CatEntryOpts,
  CatEntryOptsQueryVariables as CatEntryOptsVars,
  CatEntryOptFragment as CatValue,
  CatEntryOptFragment,
  JournalEntryType,
} from "../../../../apollo/graphTypes";
import {
  TransmutationValue,
  useFormikStatus,
  FormikStatusType,
} from "../../../../formik/utils";

const CAT_OPTS_QUERY = gql`
  query CatEntryOpts($where: JournalEntryCategoryWhereInput!) {
    catOpts: journalEntryCategories(where: $where) {
      ...CatEntryOptFragment
    }
  }
  ${CAT_ENTRY_OPT_FRAGMENT}
`;

type CatValueBeta = TransmutationValue<string, CatEntryOptFragment[]>;

type AutocompleteProps = AutocompletePropsRaw<CatValue> &
  UseAutocompleteMultipleProps<CatValue>;

const getOptionLabel = (opt: CatValue) => opt.name;
const renderTags: AutocompleteProps["renderTags"] = (
  values: CatValue[],
  getTagProps
) => {
  const lastIndex = values.length - 1;

  return values.map((dept: any, index: number) => {
    const isLastIndex = lastIndex === index;
    const { key, ...props } = getTagProps({ index }) as any;

    return (
      <Box
        key={key}
        display="flex"
        flexDirection="row"
        alignItems="center"
        justifyContent="flex-start"
      >
        <Chip
          color={isLastIndex ? "primary" : "default"}
          variant={isLastIndex ? "default" : "outlined"}
          label={dept.name}
          size="medium"
          {...props}
          disabled={!isLastIndex}
        />{" "}
        {!isLastIndex && <ChevronRight fontSize="small" />}
      </Box>
    );
  });
};

const NULLISH = Symbol();

export type CategoryProps = {
  entryType?: JournalEntryType | null;
  variant?: "filled" | "outlined";
  autoFocus?: boolean;
} & Omit<TextFieldProps, "value">;

const Category = function (props: CategoryProps) {
  const formikContext = useFormikContext<{
    category?: CatValueBeta;
    type?: JournalEntryType;
  }>();

  const { disabled: disabledFromProps = false, required } = props;

  const { entryType: entryTypeFromProps, ...textFieldProps } = props;

  const value = formikContext.values?.category?.value || [];
  const inputValue =
    formikContext.values?.category?.inputValue.trimLeft() || "";
  const entryType = entryTypeFromProps ?? formikContext.values?.type ?? null;

  const catValue = value[value.length - 1];

  const variables = useMemo<CatEntryOptsVars>(
    () =>
      catValue?.id
        ? {
            where: {
              parent: {
                eq: catValue.id,
              },
              type: {
                eq: entryType,
              },
            },
          }
        : {
            where: {
              hasParent: false,
              type: {
                eq: entryType,
              },
            },
          },
    [catValue, entryType]
  );

  const [formikStatus, setFormikStatus] = useFormikStatus();

  const onError = useCallback<
    NonNullable<QueryHookOptions<CatEntryOpts, CatEntryOptsVars>["onError"]>
  >(
    (error) =>
      void setFormikStatus({
        msg: error.message,
        type: FormikStatusType.FATAL_ERROR,
      }),
    [setFormikStatus]
  );

  const { loading, error: gqlError, data } = useQuery<
    CatEntryOpts,
    CatEntryOptsVars
  >(CAT_OPTS_QUERY, {
    skip: (entryType ?? NULLISH) === NULLISH,
    variables,
    onCompleted: () =>
      setTimeout(() => formikContext.validateField("category"), 0),
    onError,
  });
  const catOpts = data?.catOpts;
  const options = useMemo<CatEntryOptFragment[]>(() => catOpts || [], [
    catOpts,
  ]);

  const validate = useCallback(
    (transmutationVal: CatValueBeta | null | undefined) => {
      const values = transmutationVal?.value || [];
      const value = values[values.length - 1] || null;

      if (!value) {
        if (required) {
          return "Category Required";
        }
        return;
      } else if (options.length > 0) {
        return "Sub-category Required";
      }
    },
    [options, required]
  );

  const [field, meta, helpers] = useField<CatValueBeta | null | undefined>({
    name: "category",
    validate,
  });

  const { onBlur: onBlurField } = field;
  const { error, touched } = meta;
  const { setValue } = helpers;

  // Reset category value if type changes
  useEffect(() => {
    if (catValue && entryType !== catValue.type) {
      setValue({
        inputValue: "",
        value: [],
      });
    }
  }, [entryType, catValue, setValue]);

  // const disableTextInput = useMemo(() => {
  //   return value.length > 0 && options.length === 0;
  // }, [value, options]);

  const helperText = useMemo(() => {
    if (!!error && touched) {
      return error;
    } else if ((entryType ?? NULLISH) === NULLISH) {
      return "Category requires entry type.";
    } else if (gqlError) {
      return gqlError.message;
    }
    return "";
  }, [entryType, error, touched, gqlError]);

  const disabled = useMemo(
    () =>
      loading ||
      formikStatus?.type === FormikStatusType.FATAL_ERROR ||
      (entryType ?? NULLISH) === NULLISH ||
      disabledFromProps ||
      (value.length > 0 && options.length === 0),
    [
      disabledFromProps,
      entryType,
      formikStatus,
      loading,
      options.length,
      value.length,
    ]
  );

  const renderInput = useCallback(
    (params: RenderInputParams) => {
      return (
        <TextField
          {...(textFieldProps as any)}
          variant={textFieldProps.variant || "filled"}
          {...params}
          error={(touched && !!error) || !!gqlError}
          disabled={disabled}
          helperText={helperText}
          name="category"
          label="Category"
        />
      );
    },
    [textFieldProps, touched, error, gqlError, disabled, helperText]
  );

  const [hasFocus, setHasFocus] = useState(false);

  const onFocus = useCallback((event?) => setHasFocus(true), [setHasFocus]);
  const onBlur = useCallback(
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
    (event, inputValue: string, reason) => {
      inputValue = (inputValue || "").trimStart();
      setValue({
        inputValue,
        value,
      });
    },
    [setValue, value]
  );

  const autoCompleteProps = useMemo<AutocompleteProps>(() => {
    return {
      ...field,
      open: hasFocus && options.length > 0,
      onFocus,
      onBlur,
      options,
      renderTags,
      forcePopupIcon: false,
      disabled,
      value,
      renderInput,
      loading,
      autoSelect: true,
      multiple: true,
      getOptionLabel,
      onInputChange,
      inputValue,
      onChange,
      name: "category",
    };
  }, [
    field,
    hasFocus,
    options,
    onFocus,
    onBlur,
    loading,
    disabled,
    value,
    renderInput,
    onInputChange,
    inputValue,
    onChange,
  ]);

  return <Autocomplete {...autoCompleteProps} />;
};

export default Category;
