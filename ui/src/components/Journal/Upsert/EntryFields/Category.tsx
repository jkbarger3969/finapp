import React, { useCallback, useMemo, useState, useEffect } from "react";
import Autocomplete, {
  AutocompleteProps as AutocompletePropsRaw,
  RenderInputParams
} from "@material-ui/lab/Autocomplete";
import { UseAutocompleteMultipleProps } from "@material-ui/lab/useAutocomplete";
import { useField } from "formik";
import gql from "graphql-tag";
import { useQuery } from "@apollo/react-hooks";
import { TextFieldProps, TextField, Box, Chip } from "@material-ui/core";
import { ChevronRight } from "@material-ui/icons";

import {
  CatEntryOptsQuery,
  CatEntryOptFragment as CatValue,
  JournalEntryType
} from "../../../../apollo/graphTypes";

const CAT_OPTS_QUERY = gql`
  query CatEntryOpts {
    catOpts: journalEntryCategories {
      ...CatEntryOptFragment
    }
  }
  fragment CatEntryOptFragment on JournalEntryCategory {
    __typename
    id
    name
    type
    parent {
      id
    }
  }
`;

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
          disabled={!isLastIndex}
          variant={isLastIndex ? "default" : "outlined"}
          label={dept.name}
          size="medium"
          {...props}
        />{" "}
        {!isLastIndex && <ChevronRight fontSize="small" />}
      </Box>
    );
  });
};

export type CategoryProps = {
  entryType: JournalEntryType | null;
  variant?: "filled" | "outlined";
  autoFocus?: boolean;
} & Omit<TextFieldProps, "value">;

const Category = function(props: CategoryProps) {
  const { entryType, ...fowardProps } = props;

  const { loading, error: gqlError, data } = useQuery<CatEntryOptsQuery>(
    CAT_OPTS_QUERY
  );

  const categories = data?.catOpts || [];

  const [hasFocus, setHasFocus] = useState(false);

  // Input must be controlled to stop input when leaf option is selected.
  const [inputValue, setInputValue] = useState("");

  const validate = useCallback(
    (value: CatValue | null) => {
      if (!value) {
        return "Category Required";
      } else if (categories.some(({ parent }) => parent?.id === value.id)) {
        return "Sub-category Required";
      }
    },
    [categories]
  );

  const [field, meta, helpers] = useField<CatValue | null>({
    name: "category",
    validate
  });

  const { value: catValue, onBlur: onBlurField } = field;
  const { error, touched } = meta;
  const { setValue } = helpers;

  // Reset category value if type changes
  useEffect(() => {
    if (
      catValue !== null &&
      entryType !== null &&
      entryType !== catValue.type
    ) {
      setValue(null);
    }
  }, [entryType, catValue, setValue]);

  const idCatMap = useMemo(
    () =>
      new Map(
        categories.reduce((idCats, cat) => {
          idCats.push([cat.id, cat]);
          return idCats;
        }, [] as [string, CatValue][])
      ),
    [categories]
  );

  const value = useMemo(() => {
    if (!catValue) {
      return [];
    }

    const value: CatValue[] = [catValue];

    let id = catValue.parent?.id;

    while (id && idCatMap.has(id)) {
      const parentCat = idCatMap.get(id) as CatValue;
      value.unshift(parentCat);
      id = parentCat.parent?.id;
    }

    return value;
  }, [catValue, idCatMap]);

  const options = useMemo(() => {
    const catId = value[value.length - 1]?.id;
    if (entryType === null) {
      return [];
    } else if (catId) {
      return categories.filter(
        opt => opt.parent?.id === catId && opt.type === entryType
      );
    } else {
      return categories.filter(opt => !opt.parent && opt.type === entryType);
    }
  }, [categories, value, entryType]);

  const disableTextInput = useMemo(() => {
    return value.length > 0 && options.length === 0;
  }, [value, options]);

  const renderInput = useCallback(
    (params: RenderInputParams) => {
      return (
        <TextField
          {...(fowardProps as any)}
          variant={props.variant || "filled"}
          {...params}
          error={touched && !!error}
          helperText={touched ? error : undefined}
          name="category"
          label="Category"
          disabled={disableTextInput}
        />
      );
    },
    [props, fowardProps, touched, error, disableTextInput]
  );

  const onFocus = useCallback((event?) => setHasFocus(true), [setHasFocus]);
  const onBlur = useCallback(
    event => {
      setHasFocus(false);
      onBlurField(event);
    },
    [setHasFocus, onBlurField]
  );

  const onChange = useCallback<NonNullable<AutocompleteProps["onChange"]>>(
    (event, value) => {
      if (!value) {
        setValue(null);
      } else if (Array.isArray(value)) {
        const len = value.length;
        setValue(len === 0 ? null : value[len - 1]);
      } else {
        setValue(value);
      }
    },
    [setValue]
  );

  const onInputChange = useCallback<
    NonNullable<AutocompleteProps["onInputChange"]>
  >(
    (event, value: string, reason) => {
      value = (value || "").trimStart();
      setInputValue(value);
    },
    [setInputValue]
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
      disabled: loading,
      value,
      renderInput,
      loading,
      autoSelect: true,
      multiple: true,
      getOptionLabel,
      onInputChange,
      inputValue: disableTextInput ? "" : inputValue,
      onChange,
      name: "category"
    };
  }, [
    disableTextInput,
    onChange,
    onInputChange,
    inputValue,
    value,
    loading,
    renderInput,
    field,
    hasFocus,
    onFocus,
    onBlur,
    options
  ]);

  if (gqlError) {
    return <pre>{JSON.stringify(gqlError, null, 2)}</pre>;
  }

  return <Autocomplete {...autoCompleteProps} />;
};

export default Category;
