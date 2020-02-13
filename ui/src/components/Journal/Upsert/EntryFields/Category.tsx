import React, { useCallback, useMemo, useState, useEffect } from "react";
import Autocomplete, {
  AutocompleteProps,
  RenderInputParams
} from "@material-ui/lab/Autocomplete";
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

const getOptionLabel = (opt: CatValue) => opt.name;
const renderTags: AutocompleteProps["renderTags"] = (
  values: CatValue[],
  getTagProps
) => {
  const lastIndex = values.length - 1;
  return values.map((dept: any, index: number) => {
    const isLastIndex = lastIndex === index;
    return (
      <Box
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
          {...getTagProps({ index })}
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
          disabled={options.length === 0}
        />
      );
    },
    [props, fowardProps, touched, error, options]
  );

  const onFocus = useCallback((event?) => setHasFocus(true), [setHasFocus]);
  const onBlur = useCallback(
    event => {
      setHasFocus(false);
      onBlurField(event);
    },
    [setHasFocus, onBlurField]
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
      onChange: (event, value) => {
        if (!value) {
          setValue(null);
        } else if (Array.isArray(value)) {
          const len = value.length;
          setValue(len === 0 ? null : value[len - 1]);
        } else {
          setValue(value);
        }
      },
      name: "category"
    };
  }, [
    value,
    loading,
    renderInput,
    setValue,
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
