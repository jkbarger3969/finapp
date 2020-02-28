import React, { useCallback, useMemo, useState, useRef } from "react";
import Autocomplete, {
  AutocompleteProps as AutocompletePropsRaw,
  RenderInputParams
} from "@material-ui/lab/Autocomplete";
import { UseAutocompleteMultipleProps } from "@material-ui/lab/useAutocomplete";
import { useField } from "formik";
import { useQuery } from "@apollo/react-hooks";
import { TextFieldProps, TextField, Box, Chip } from "@material-ui/core";
import { ChevronRight } from "@material-ui/icons";
import { parseName } from "humanparser";
import * as namecase from "namecase";
import gql from "graphql-tag";

import {
  JournalEntrySourceType,
  SrcEntryOptsQuery,
  SrcEntryOptsQueryVariables as SrcEntryOptsQueryVars,
  SrcEntryBizOptFragment as BizOpt,
  SrcEntryDeptOptFragment as DeptOpt,
  SrcEntryPersonOptFragment as PersonOpt
} from "../../../../apollo/graphTypes";
import { Values } from "../UpsertEntry";
import {
  SRC_ENTRY_PERSON_OPT_FRAGMENT,
  SRC_ENTRY_BIZ_OPT_FRAGMENT,
  SRC_ENTRY_DEPT_OPT_FRAGMENT
} from "../upsertEntry.gql";

const SRC_ENTRY_OPTS_QUERY = gql`
  query SrcEntryOpts($name: String!, $isBiz: Boolean!) {
    businesses(searchByName: $name) @include(if: $isBiz) {
      ...SrcEntryBizOptFragment
    }
    people(searchByName: { first: $name, last: $name }) @skip(if: $isBiz) {
      ...SrcEntryPersonOptFragment
    }
  }
  ${SRC_ENTRY_PERSON_OPT_FRAGMENT}
  ${SRC_ENTRY_BIZ_OPT_FRAGMENT}
  ${SRC_ENTRY_DEPT_OPT_FRAGMENT}
`;

export type SourceProps = {
  variant?: "filled" | "outlined";
  autoFocus?: boolean;
} & Omit<TextFieldProps, "value">;

export type SourceValue = BizOpt | DeptOpt | PersonOpt | string;
export type Value = SourceValue | JournalEntrySourceType;
type Options = Value[];

type AutocompleteProps = AutocompletePropsRaw<Value> &
  UseAutocompleteMultipleProps<Value>;

export const isFreeSoloOpt = (opt: Value) => {
  switch (opt) {
    case JournalEntrySourceType.Business:
    case JournalEntrySourceType.Department:
    case JournalEntrySourceType.Person:
      break;
    default:
      return typeof opt === "string";
  }
  return false;
};

const getOptionLabel: AutocompleteProps["getOptionLabel"] = (opt): string => {
  switch (opt) {
    case JournalEntrySourceType.Business:
      return "Vendor";
    case JournalEntrySourceType.Department:
      return "Department";
    case JournalEntrySourceType.Person:
      return "Person";
    default:
      if (typeof opt === "string") {
        return opt;
      }
  }

  if (opt.__typename === "Person") {
    return `${opt.personName.first} ${opt.personName.last}`;
  }

  return opt.name;
};

const renderTags: AutocompleteProps["renderTags"] = (values, getTagProps) => {
  const lastIndex = values.length - 1;
  return values.map((value: Value, index: number) => {
    const isLastIndex = lastIndex === index;
    const { key, ...props } = getTagProps({ index }) as any;

    if (isFreeSoloOpt(value)) {
      return value;
    }

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
          label={getOptionLabel(value)}
          size="medium"
          {...props}
          disabled={!isLastIndex}
        />{" "}
        {!isLastIndex && <ChevronRight fontSize="small" />}
      </Box>
    );
  });
};

const filterOptions: AutocompleteProps["filterOptions"] = (
  options,
  { inputValue }
) => {
  const regex = new RegExp(`(^|\\s)${inputValue}`, "i");
  return options.filter(opt => regex.test(getOptionLabel(opt)));
};
const validate = ({ value }: Values["source"]) => {
  const srcType = (value[0] ?? null) as JournalEntrySourceType | null;
  const srcValue = value.length > 1 ? value[value.length - 1] : null;

  if (srcType === null || srcValue === null || srcValue === "") {
    return "Source Required";
  } else if (
    isFreeSoloOpt(srcValue) &&
    srcType === JournalEntrySourceType.Person
  ) {
    // Validate Free Solo Person name
    const parsedName = parseName(srcValue as string);
    if (!parsedName.firstName.trim()) {
      return "First Name Required";
    } else if (!parsedName.lastName.trim()) {
      return "Last Name Required";
    }
  }
};

const Source = function(props: SourceProps) {
  const [hasFocus, setHasFocus] = useState(false);

  const [field, meta, helpers] = useField<Values["source"]>({
    name: "source",
    validate
  });

  const { value: fieldValue } = field;
  const { value, inputValue } = fieldValue;
  const { onBlur: onBlurField } = field;
  const { error, touched } = meta;
  const { setValue } = helpers;

  const srcType = (value[0] ?? null) as JournalEntrySourceType | null;
  const srcValue = value.length > 1 ? value[value.length - 1] : null;

  const searchedName = useRef("");

  const { loading, error: gqlError, data } = useQuery<
    SrcEntryOptsQuery,
    SrcEntryOptsQueryVars
  >(SRC_ENTRY_OPTS_QUERY, {
    skip: !searchedName.current && !value[1],
    variables: {
      name: searchedName.current,
      isBiz: srcType !== JournalEntrySourceType.Person
    }
  });

  const idDeptMap = useMemo(() => {
    const idDeptMap = new Map<string, DeptOpt>();
    for (const bizOpt of data?.businesses || []) {
      for (const deptOpt of bizOpt.departments) {
        idDeptMap.set(deptOpt.id, deptOpt);
      }
    }
    return idDeptMap;
  }, [data]);

  const options = useMemo<Options>(() => {
    if (srcType === null) {
      return [JournalEntrySourceType.Business, JournalEntrySourceType.Person];
      // Person ONLY person options
    } else if (srcType === JournalEntrySourceType.Person) {
      return srcValue === null ? data?.people || [] : [];
      // Only Business options
    } else if (!srcValue) {
      return data?.businesses || [];
      // Free solo no options
    } else if (typeof srcValue === "string") {
      return [] as Options;
    }

    const options: DeptOpt[] = [];

    for (const deptOpt of idDeptMap.values()) {
      if (
        deptOpt.parent.__typename === srcValue.__typename &&
        deptOpt.parent.id === srcValue.id
      ) {
        options.push(deptOpt);
      }
    }

    return options;
  }, [srcType, data, idDeptMap, srcValue]);

  const freeSolo = useMemo(() => {
    return srcType !== null && srcValue === null;
  }, [srcType, srcValue]);

  const disableTextInput = useMemo(() => {
    return value.length > 0 && options.length === 0 && !freeSolo;
  }, [value, options, freeSolo]);

  const label = useMemo(() => {
    if (srcType === null) {
      return "Source Type";
    } else if (srcType === JournalEntrySourceType.Person) {
      return "Person Name";
    } else if (value.length === 1) {
      return "Vendor";
    } else if (value.length === 2 && options.length > 0) {
      return "Department";
    } else if (options.length > 0) {
      return "Sub-Department";
    }

    return "Vendor";
  }, [value, options, srcType]);

  const renderInput = useCallback(
    (params: RenderInputParams) => {
      return (
        <TextField
          {...(props as any)}
          variant={props.variant || "filled"}
          {...params}
          error={touched && !!error}
          helperText={touched ? error : undefined}
          name="source"
          label={label}
        />
      );
    },
    [props, touched, error, label]
  );

  const onFocus = useCallback((event?) => setHasFocus(true), [setHasFocus]);
  const onBlur = useCallback<NonNullable<AutocompleteProps["onBlur"]>>(
    event => {
      setHasFocus(false);
      // Fixes formik validate called with wrong version of value
      event.persist();
      setTimeout(() => onBlurField(event), 0);
    },
    [setHasFocus, onBlurField]
  );

  const onChange = useCallback<NonNullable<AutocompleteProps["onChange"]>>(
    (event, value) => {
      const srcValueIndex = value.length - 1;
      const srcValue = value[srcValueIndex];
      if (isFreeSoloOpt(srcValue)) {
        const formattedSrcStrs: string[] = [];

        for (let str of (srcValue as string).split(" ")) {
          if (str) {
            if (namecase.checkName(str)) {
              str = namecase(str);
            }

            formattedSrcStrs.push(str);
          }
        }

        const formattedStr = formattedSrcStrs.join(" ").trim();

        value[srcValueIndex] =
          formattedStr.charAt(0).toUpperCase() + formattedStr.substring(1);
      }
      setValue({ inputValue, value });
    },
    [setValue, inputValue]
  );

  const onInputChange = useCallback<
    NonNullable<AutocompleteProps["onInputChange"]>
  >(
    (event, inputValue: string, reason) => {
      inputValue = (inputValue || "").trimStart();

      if (!disableTextInput) {
        setValue({ inputValue, value });
      }

      if (srcType !== null && srcValue === null && inputValue) {
        searchedName.current = inputValue[0].toLowerCase();
      }
    },
    [setValue, srcType, srcValue, value, disableTextInput, searchedName]
  );

  const autoCompleteProps = useMemo<AutocompleteProps>(() => {
    return {
      ...field,
      inputValue: disableTextInput ? "" : inputValue,
      open: hasFocus && options.length > 0,
      onFocus,
      onBlur,
      options,
      renderTags,
      forcePopupIcon: false,
      freeSolo,
      value,
      renderInput,
      loading,
      autoSelect: true,
      multiple: true,
      getOptionLabel,
      onInputChange,
      onChange,
      filterOptions,
      name: "source"
    };
  }, [
    disableTextInput,
    freeSolo,
    inputValue,
    onInputChange,
    onChange,
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

export default Source;
