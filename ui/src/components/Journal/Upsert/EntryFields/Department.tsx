import React, { useCallback, useMemo, useState } from "react";
import Autocomplete, {
  AutocompleteProps as AutocompletePropsRaw,
  RenderInputParams,
} from "@material-ui/lab/Autocomplete";
import { UseAutocompleteMultipleProps } from "@material-ui/lab/useAutocomplete";
import { useField } from "formik";
import gql from "graphql-tag";
import { useQuery, QueryHookOptions } from "@apollo/react-hooks";
import { TextFieldProps, TextField, Box, Chip } from "@material-ui/core";
import { ChevronRight } from "@material-ui/icons";

import {
  DeptEntryOptFragment as DeptValue,
  DeptEntryOptsQuery,
  DeptEntryOptsQueryVariables as DeptEntryOptsQueryVars,
} from "../../../../apollo/graphTypes";
import { DEPT_ENTRY_OPT_FRAGMENT } from "../upsertEntry.gql";
import {
  // TransmutationValue,
  useFormikStatus,
  FormikStatusType,
} from "../../../../utils/formik";

const DEPT_OPTS_QUERY = gql`
  query DeptEntryOpts($fromParent: ID) {
    deptOpts: departments(fromParent: $fromParent) {
      ...DeptEntryOptFragment
    }
  }
  ${DEPT_ENTRY_OPT_FRAGMENT}
`;

const businessId = "5dc4b09bcf96e166daaa0090";

type AutocompleteProps = AutocompletePropsRaw<DeptValue> &
  UseAutocompleteMultipleProps<DeptValue>;

const getOptionLabel = (opt: DeptValue) => opt.name;
const renderTags: AutocompleteProps["renderTags"] = (
  values: DeptValue[],
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
export type DepartmentProps = {
  variant?: "filled" | "outlined";
  autoFocus?: boolean;
} & Omit<TextFieldProps, "value">;

const Department = function (props: DepartmentProps) {
  const { disabled: disabledFromProps = false, required } = props;

  const [formikStatus, setFormikStatus] = useFormikStatus();

  const onError = useCallback<
    NonNullable<
      QueryHookOptions<DeptEntryOptsQuery, DeptEntryOptsQueryVars>["onError"]
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
    DeptEntryOptsQuery,
    DeptEntryOptsQueryVars
  >(DEPT_OPTS_QUERY, { onError, variables: { fromParent: businessId } });

  const depts = data?.deptOpts || [];

  const [hasFocus, setHasFocus] = useState(false);

  // Input must be controlled to stop input when leaf option is selected.
  const [inputValue, setInputValue] = useState("");

  const validate = useCallback(
    (value: DeptValue | null) => {
      if (!value) {
        if (required) {
          return "Department Required";
        }
        return;
      } else if (
        depts.some(
          ({ parent }) =>
            parent.__typename === "Department" && parent.id === value.id
        )
      ) {
        return "Sub-department Required";
      }
    },
    [depts, required]
  );

  const [field, meta, helpers] = useField<DeptValue | null>({
    name: "department",
    validate,
  });

  const { value: deptValue, onBlur: onBlurField } = field;
  const { error, touched } = meta;
  const { setValue } = helpers;

  const idDeptMap = useMemo(
    () =>
      new Map(
        depts.reduce((idDepts, dept) => {
          idDepts.push([dept.id, dept]);
          return idDepts;
        }, [] as [string, DeptValue][])
      ),
    [depts]
  );

  const value = useMemo(() => {
    if (!deptValue) {
      return [];
    }

    const value: DeptValue[] = [deptValue];

    let { __typename, id } = deptValue.parent;

    while (__typename !== "Business" && idDeptMap.has(id)) {
      const parentDept = idDeptMap.get(id) as DeptValue;
      value.unshift(parentDept);
      ({ __typename, id } = parentDept.parent);
    }

    return value;
  }, [deptValue, idDeptMap]);

  const options = useMemo(() => {
    const deptId = value[value.length - 1]?.id;
    return depts.filter((opt) =>
      deptId ? opt.parent.id === deptId : opt.parent.__typename === "Business"
    );
  }, [depts, value]);

  const disableTextInput = useMemo(() => {
    return value.length > 0 && options.length === 0;
  }, [value, options]);

  const helperText = useMemo(() => {
    if (!!error && touched) {
      return error;
    } else if (gqlError) {
      return gqlError.message;
    }
    return "";
  }, [error, touched, gqlError]);

  const disabled = useMemo(
    () =>
      loading ||
      disableTextInput ||
      formikStatus?.type === FormikStatusType.FATAL_ERROR ||
      disabledFromProps,
    [disableTextInput, disabledFromProps, formikStatus, loading]
  );

  const renderInput = useCallback(
    (params: RenderInputParams) => {
      return (
        <TextField
          {...(props as any)}
          variant={props.variant || "filled"}
          {...params}
          error={touched && !!error}
          helperText={helperText}
          name="department"
          label="Department"
          disabled={disabled}
        />
      );
    },
    [props, touched, error, helperText, disabled]
  );

  const onFocus = useCallback((event?) => setHasFocus(true), [setHasFocus]);
  const onBlur = useCallback(
    (event) => {
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
      setInputValue((value || "").trimStart());
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
      disabled,
      value,
      renderInput,
      loading,
      autoSelect: true,
      multiple: true,
      getOptionLabel,
      onChange,
      onInputChange,
      inputValue: disableTextInput ? "" : inputValue,
      name: "department",
    };
  }, [
    field,
    hasFocus,
    options,
    onFocus,
    onBlur,
    disableTextInput,
    disabled,
    value,
    renderInput,
    loading,
    onChange,
    onInputChange,
    inputValue,
  ]);

  if (gqlError) {
    return <pre>{JSON.stringify(gqlError, null, 2)}</pre>;
  }

  return <Autocomplete {...autoCompleteProps} />;
};

export default Department;
