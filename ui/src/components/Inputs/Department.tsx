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
import { MarkOptional, MarkRequired } from "ts-essentials";
import { Control, UseControllerProps } from "react-hook-form";

import {
  DepartmentInputOptsQuery as DepartmentInputOpts,
  DepartmentInputOptsQueryVariables as DepartmentInputOptsVars,
  DepartmentInputIniValueQuery as DepartmentInputIniValue,
  DepartmentInputIniValueQueryVariables as DepartmentInputIniValueVars,
  DepartmentInputOptFragment,
  DepartmentsWhere,
} from "../../apollo/graphTypes";
import { LoadingDefaultBlank, sortBranchesToTop } from "./shared";
import { useController } from "../../utils/reactHookForm";

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
  control?: Control;
  namePrefix?: string;
  rules?: UseControllerProps["rules"];
} & Omit<
  DepartmentInputBaseProps<Multiple, DisableClearable, FreeSolo>,
  "onChange" | "value" | "name"
>;

export const DEPARTMENT_NAME = "department";
export const departmentName = (namePrefix?: string): string =>
  namePrefix ? `${namePrefix}.${DEPARTMENT_NAME}` : DEPARTMENT_NAME;

const DepartmentInputControlled = forwardRef(function DepartmentInputControlled<
  Multiple extends boolean | undefined = undefined,
  DisableClearable extends boolean | undefined = undefined,
  FreeSolo extends boolean | undefined = undefined
>(
  props: Omit<
    DepartmentInputProps<Multiple, DisableClearable, FreeSolo>,
    "defaultValue"
  > & {
    defaultValue: TreeSelectValue<
      DepartmentInputOpt,
      DepartmentInputOpt,
      Multiple,
      false,
      false
    >;
  },
  ref: Ref<unknown>
): JSX.Element {
  const {
    control,
    namePrefix: namePrefixProp,
    defaultValue,
    renderInput: renderInputProp = defaultInput,
    disabled,
    onBlur: onBlurProp,
    rules,
    ...rest
  } = props;

  const {
    field: {
      onBlur: onBlurControlled,
      name,
      onChange: onChangeControlled,
      ref: inputRef,
      ...field
    },
    fieldState: { isTouched, error },
    formState: { isSubmitting },
  } = useController({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    name: departmentName(namePrefixProp) as any,
    control,
    defaultValue,
    rules,
    shouldUnregister: true,
  });

  const handleBlur = useCallback<
    NonNullable<DepartmentInputBaseProps["onBlur"]>
  >(
    (...args) => {
      onBlurControlled();
      if (onBlurProp) {
        onBlurProp(...args);
      }
    },
    [onBlurControlled, onBlurProp]
  );

  const renderInput = useCallback<
    NonNullable<DepartmentInputBaseProps["renderInput"]>
  >(
    (params) =>
      renderInputProp({
        ...params,
        inputRef,
        name,
        ...(isTouched && error
          ? {
              error: true,
              helperText: error?.message || "Invalid",
            }
          : {}),
      }),
    [renderInputProp, inputRef, name, isTouched, error]
  );

  const handleChange = useCallback<
    NonNullable<
      DepartmentInputBaseProps<Multiple, DisableClearable, FreeSolo>["onChange"]
    >
  >(
    (_, value) => {
      onChangeControlled(value);
    },
    [onChangeControlled]
  );

  return (
    <DepartmentInputBase
      {...rest}
      {...field}
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
          ? defaultValues
          : defaultValues[0] ?? null) as unknown) as TreeSelectValue<
          DepartmentInputOpt,
          DepartmentInputOpt,
          Multiple,
          false,
          false
        >
      }
    />
  );
});
