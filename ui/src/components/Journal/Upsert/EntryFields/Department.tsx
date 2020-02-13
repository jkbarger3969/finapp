import React, { useCallback, useMemo, useState } from "react";
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
  DeptEntryOptFragment as DeptValue,
  DeptEntryOptsQuery,
  DeptEntryOptsQueryVariables as DeptEntryOptsQueryVars
} from "../../../../apollo/graphTypes";

const DEPT_OPTS_QUERY = gql`
  query DeptEntryOpts($fromParent: ID) {
    deptOpts: departments(fromParent: $fromParent) {
      ...DeptEntryOptFragment
    }
  }
  fragment DeptEntryOptFragment on Department {
    __typename
    id
    name
    parent {
      __typename
      ... on Business {
        id
      }
      ... on Department {
        id
      }
    }
  }
`;

const businessId = "5dc4b09bcf96e166daaa0090";

const getOptionLabel = (opt: DeptValue) => opt.name;
const renderTags: AutocompleteProps["renderTags"] = (
  values: DeptValue[],
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
export type DepartmentProps = {
  variant?: "filled" | "outlined";
  autoFocus?: boolean;
} & Omit<TextFieldProps, "value">;

const Department = function(props: DepartmentProps) {
  const { loading, error: gqlError, data } = useQuery<
    DeptEntryOptsQuery,
    DeptEntryOptsQueryVars
  >(DEPT_OPTS_QUERY, { variables: { fromParent: businessId } });

  const depts = data?.deptOpts || [];

  const [hasFocus, setHasFocus] = useState(false);

  const validate = useCallback(
    (value: DeptValue | null) => {
      if (!value) {
        return "Department Required";
      } else if (
        depts.some(
          ({ parent }) =>
            parent.__typename === "Department" && parent.id === value.id
        )
      ) {
        return "Sub-department Required";
      }
    },
    [depts]
  );

  const [field, meta, helpers] = useField<DeptValue | null>({
    name: "department",
    validate
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
    return depts.filter(opt =>
      deptId ? opt.parent.id === deptId : opt.parent.__typename === "Business"
    );
  }, [depts, value]);

  const renderInput = useCallback(
    (params: RenderInputParams) => {
      return (
        <TextField
          {...(props as any)}
          variant={props.variant || "filled"}
          {...params}
          error={touched && !!error}
          helperText={touched ? error : undefined}
          name="department"
          label="Department"
          disabled={options.length === 0}
        />
      );
    },
    [props, touched, error, options]
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
      name: "department"
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

export default Department;
