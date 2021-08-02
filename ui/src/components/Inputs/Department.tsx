import React, { forwardRef, Ref, useCallback, useMemo, useState } from "react";
import TreeSelect, {
  ValueNode,
  BranchNode,
  FreeSoloNode,
  TreeSelectProps,
  defaultInput,
  TreeSelectValue,
} from "mui-tree-select";
import { gql, QueryHookOptions, useQuery } from "@apollo/client";
import { MarkOptional, MarkRequired, Merge } from "ts-essentials";

import {
  DepartmentInputOptsQuery as DepartmentInputOpts,
  DepartmentInputOptsQueryVariables as DepartmentInputOptsVars,
  DepartmentInputIniValueQuery as DepartmentInputIniValue,
  DepartmentInputIniValueQueryVariables as DepartmentInputIniValueVars,
  DepartmentInputOptFragment,
  DepartmentsWhere,
} from "../../apollo/graphTypes";
import { LoadingDefaultBlank, sortBranchesToTop } from "./shared";
import {
  FieldValue,
  useField,
  UseFieldOptions,
  useFormContext,
  useLoading,
} from "../../useKISSForm/form";

export type DepartmentInputOpt = MarkOptional<
  DepartmentInputOptFragment,
  "children"
>;

export const DEPT_INPUT_OPT_FRAGMENT = gql`
  fragment DepartmentInputOpt on Department {
    __typename
    id
    name
    children {
      __typename
      id
    }
  }
`;

export const DEPT_INPUT_INI_VALUE = gql`
  query DepartmentInputIniValue($where: DepartmentsWhere!) {
    departments(where: $where) {
      ...DepartmentInputOpt
      ancestors {
        __typename
        ... on Department {
          ...DepartmentInputOpt
        }
      }
    }
  }
  ${DEPT_INPUT_OPT_FRAGMENT}
`;

export const DEPT_INPUT_OPTS = gql`
  query DepartmentInputOpts($where: DepartmentsWhere!) {
    departments(where: $where) {
      ...DepartmentInputOpt
    }
  }
  ${DEPT_INPUT_OPT_FRAGMENT}
`;

export type DepartmentTreeSelectProps<
  Multiple extends boolean | undefined = undefined,
  DisableClearable extends boolean | undefined = undefined,
  FreeSolo extends boolean | undefined = undefined
> = TreeSelectProps<
  DepartmentInputOpt,
  DepartmentInputOpt,
  Multiple,
  DisableClearable,
  FreeSolo
>;

export const getOptionLabel: NonNullable<
  DepartmentTreeSelectProps<
    undefined,
    undefined,
    true | false
  >["getOptionLabel"]
> = (option) => {
  if (option instanceof FreeSoloNode) {
    return option.toString();
  } else {
    return option.valueOf().name;
  }
};

export const getOptionSelected: NonNullable<
  DepartmentTreeSelectProps<
    undefined,
    undefined,
    true | false
  >["getOptionSelected"]
> = (option, value) =>
  !(option instanceof FreeSoloNode) &&
  !(value instanceof FreeSoloNode) &&
  option.valueOf().id === value.valueOf().id;

export type DepartmentInputBaseProps<
  Multiple extends boolean | undefined = undefined,
  DisableClearable extends boolean | undefined = undefined,
  FreeSolo extends boolean | undefined = undefined
> = MarkOptional<
  MarkRequired<
    Omit<
      DepartmentTreeSelectProps<Multiple, DisableClearable, FreeSolo>,
      "branch" | "options" | "defaultValue"
    >,
    "onChange" | "value"
  >,
  "onBranchChange"
> & {
  root: DepartmentsWhere;
};

export const DepartmentInputBase = forwardRef(function DepartmentInputBase<
  Multiple extends boolean | undefined = undefined,
  DisableClearable extends boolean | undefined = undefined,
  FreeSolo extends boolean | undefined = undefined
>(
  props: DepartmentInputBaseProps<Multiple, DisableClearable, FreeSolo>,
  ref: Ref<unknown>
): JSX.Element {
  const {
    root,
    renderInput: renderInputProp = defaultInput,
    onBranchChange: onBranchChangeProp,
    loading,
    ...rest
  } = props;

  const [state, setState] = useState<{
    branch: Exclude<DepartmentTreeSelectProps["branch"], undefined>;
  }>({
    branch: props.value instanceof ValueNode ? props.value.parent : null,
  });

  const rootResult = useQuery<DepartmentInputOpts, DepartmentInputOptsVars>(
    DEPT_INPUT_OPTS,
    useMemo<QueryHookOptions<DepartmentInputOpts, DepartmentInputOptsVars>>(
      () => ({
        variables: {
          where: root,
        },
        // Filter out any branch path that exceeds the root bounds.
        onCompleted: (data) =>
          setState((state) => {
            if (state.branch) {
              const filteredPath: DepartmentInputOpt[] = [];

              for (const branch of state.branch.up()) {
                const branchVal = branch.valueOf();
                const branchId = branchVal.id;

                filteredPath.push(branchVal);

                if (data.departments.some(({ id }) => id === branchId)) {
                  const [self, ...path] = filteredPath;

                  return {
                    ...state,
                    branch: self ? new BranchNode(self, path.reverse()) : null,
                  };
                }
              }
            }
            return { ...state };
          }),
      }),
      [root]
    )
  );

  const queryResult = useQuery<DepartmentInputOpts, DepartmentInputOptsVars>(
    DEPT_INPUT_OPTS,
    useMemo<QueryHookOptions<DepartmentInputOpts, DepartmentInputOptsVars>>(
      () => ({
        skip: !state.branch,
        variables: {
          where: {
            parent: {
              eq: {
                type: "Department",
                id: state.branch?.valueOf()?.id as string,
              },
            },
          },
        },
      }),
      [state.branch]
    )
  );

  const onBranchChange = useCallback<
    NonNullable<DepartmentTreeSelectProps["onBranchChange"]>
  >(
    (...args) => {
      setState((state) => ({
        ...state,
        branch: args[1],
      }));

      if (onBranchChangeProp) {
        onBranchChangeProp(...args);
      }
    },
    [onBranchChangeProp]
  );

  const renderInput = useCallback<
    NonNullable<
      DepartmentTreeSelectProps<
        Multiple,
        DisableClearable,
        FreeSolo
      >["renderInput"]
    >
  >(
    (params) =>
      renderInputProp({
        name: "department",
        ...params,
        ...(rootResult.error || queryResult.error
          ? {
              error: true,
              helperText:
                rootResult.error?.message || queryResult.error?.message,
            }
          : {}),
      }),
    [queryResult.error, renderInputProp, rootResult.error]
  );

  const options = useMemo<DepartmentTreeSelectProps["options"]>(() => {
    const options: DepartmentTreeSelectProps["options"] = [];

    if (rootResult.loading) {
      return options;
    }

    return (
      (state.branch
        ? queryResult.data?.departments
        : rootResult.data?.departments) || []
    )
      .reduce((options, category) => {
        if (category.children.length) {
          options.push(new BranchNode(category, state.branch));
        }
        options.push(category);

        return options;
      }, options)
      .sort(sortBranchesToTop);
  }, [
    rootResult.loading,
    rootResult.data?.departments,
    state.branch,
    queryResult.data?.departments,
  ]);

  if (rootResult.loading) {
    return <LoadingDefaultBlank {...props} />;
  }

  return (
    <TreeSelect<
      DepartmentInputOpt,
      DepartmentInputOpt,
      Multiple,
      DisableClearable,
      FreeSolo
    >
      getOptionLabel={getOptionLabel}
      getOptionSelected={getOptionSelected}
      {...rest}
      ref={ref}
      loading={queryResult.loading || !!loading}
      onBranchChange={onBranchChange}
      branch={state.branch}
      renderInput={renderInput}
      options={options}
    />
  );
});

export type DepartmentInputProps<
  Multiple extends boolean | undefined = undefined,
  DisableClearable extends boolean | undefined = undefined,
  FreeSolo extends boolean | undefined = undefined
> = {
  root: DepartmentsWhere;
  defaultValue?: DepartmentsWhere;
} & Omit<
  DepartmentInputBaseProps<Multiple, DisableClearable, FreeSolo>,
  "onChange" | "value" | "name"
> &
  Pick<UseFieldOptions, "form" | "shouldUnregister">;

export const DEPARTMENT_NAME = "department";
export interface DepartmentFieldDef<
  Multiple extends boolean | undefined = undefined,
  FreeSolo extends boolean | undefined = undefined
> {
  [DEPARTMENT_NAME]: FieldValue<
    TreeSelectValue<
      DepartmentInputOpt,
      DepartmentInputOpt,
      Multiple,
      false,
      FreeSolo
    >
  >;
}
const DepartmentInputControlled = forwardRef(function DepartmentInputControlled<
  Multiple extends boolean | undefined = undefined,
  DisableClearable extends boolean | undefined = undefined,
  FreeSolo extends boolean | undefined = undefined
>(
  props: Merge<
    DepartmentInputProps<Multiple, DisableClearable, FreeSolo>,
    {
      defaultValue?: TreeSelectValue<
        DepartmentInputOpt,
        DepartmentInputOpt,
        Multiple,
        true,
        false
      >;
    }
  >,
  ref: Ref<unknown>
): JSX.Element {
  const {
    defaultValue,
    form,
    shouldUnregister,
    renderInput: renderInputProp = defaultInput,
    disabled,
    onBlur: onBlurProp,
    ...rest
  } = props;

  const isSubmitting = useFormContext(form)?.isSubmitting ?? false;

  const {
    props: { value: fieldValue, name },
    state: { isTouched, errors },
    setValue,
    setTouched,
  } = useField<
    TreeSelectValue<
      DepartmentInputOpt,
      DepartmentInputOpt,
      Multiple,
      DisableClearable,
      FreeSolo
    >
  >({
    name: DEPARTMENT_NAME,
    form,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    defaultValue: defaultValue as any,
    shouldUnregister,
  });

  const value = useMemo(() => fieldValue || (rest.multiple ? [] : null), [
    fieldValue,
    rest.multiple,
  ]) as TreeSelectValue<
    DepartmentInputOpt,
    DepartmentInputOpt,
    Multiple,
    DisableClearable,
    FreeSolo
  >;

  const handleBlur = useCallback<
    NonNullable<DepartmentInputBaseProps["onBlur"]>
  >(
    (...args) => {
      setTouched(true);
      if (onBlurProp) {
        onBlurProp(...args);
      }
    },
    [setTouched, onBlurProp]
  );

  const renderInput = useCallback<
    NonNullable<DepartmentInputBaseProps["renderInput"]>
  >(
    (params) =>
      renderInputProp({
        ...params,
        name,
        ...(isTouched && errors.length
          ? {
              error: true,
              helperText: errors[0].message,
            }
          : {}),
      }),
    [renderInputProp, name, isTouched, errors]
  );

  const handleChange = useCallback<
    NonNullable<
      DepartmentInputBaseProps<Multiple, DisableClearable, FreeSolo>["onChange"]
    >
  >(
    (_, value) => {
      setValue(value ?? undefined);
    },
    [setValue]
  );

  return (
    <DepartmentInputBase
      {...rest}
      value={value}
      disabled={isSubmitting || disabled}
      ref={ref}
      onChange={handleChange}
      renderInput={renderInput}
      onBlur={handleBlur}
    />
  );
});

export const DepartmentInput = forwardRef(function DepartmentInput<
  Multiple extends boolean | undefined = undefined,
  DisableClearable extends boolean | undefined = undefined,
  FreeSolo extends boolean | undefined = undefined
>(
  props: DepartmentInputProps<Multiple, DisableClearable, FreeSolo>,
  ref: Ref<unknown>
): JSX.Element {
  const {
    defaultValue: defaultValueProp,
    renderInput: renderInputProp = defaultInput,
    ...rest
  } = props;

  const { loading, error, data } = useQuery<
    DepartmentInputIniValue,
    DepartmentInputIniValueVars
  >(DEPT_INPUT_INI_VALUE, {
    skip: !defaultValueProp,
    variables: useMemo(
      () => ({
        where: defaultValueProp as DepartmentsWhere,
      }),
      [defaultValueProp]
    ),
  });

  useLoading({
    loading,
    name: DEPARTMENT_NAME,
    form: rest.form,
    shouldUnregister: true,
  });

  const renderInput = useCallback<
    NonNullable<
      DepartmentInputProps<Multiple, DisableClearable, FreeSolo>["renderInput"]
    >
  >(
    (params) =>
      renderInputProp({
        ...params,
        ...(error
          ? {
              error: true,
              helperText: error.message,
            }
          : {}),
      }),
    [error, renderInputProp]
  );

  const defaultValues = useMemo(
    () =>
      (data?.departments || []).map(
        (value) =>
          new ValueNode(
            value,
            value.ancestors
              .reduceRight((path, parent) => {
                if (parent.__typename !== "Business") {
                  path.push(parent);
                }

                return path;
              }, [] as DepartmentInputOpt[])
              .reverse()
          )
      ),
    [data?.departments]
  );

  if (loading) {
    return <LoadingDefaultBlank {...rest} />;
  }

  return (
    <DepartmentInputControlled<Multiple, DisableClearable, FreeSolo>
      {...rest}
      ref={ref}
      renderInput={renderInput}
      defaultValue={
        ((props.multiple
          ? defaultValues.length
            ? defaultValues
            : undefined
          : defaultValues[0] ?? undefined) as unknown) as TreeSelectValue<
          DepartmentInputOpt,
          DepartmentInputOpt,
          Multiple,
          true,
          false
        >
      }
    />
  );
});
