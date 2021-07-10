import React, { forwardRef, useCallback, useMemo, useState, Ref } from "react";
import TreeSelect, {
  ValueNode,
  BranchNode,
  FreeSoloNode,
  TreeSelectProps,
  defaultInput,
  TreeSelectValue,
} from "mui-tree-select";
import { gql, useQuery } from "@apollo/client";
import { MarkOptional, MarkRequired } from "ts-essentials";
import { Control, UseControllerProps } from "react-hook-form";

import {
  CategoryInputOptsQuery as CategoryOpts,
  CategoryInputOptsQueryVariables as CategoryOptsVars,
  CategoryInputIniValueQuery as CategoryIniValue,
  CategoryInputIniValueQueryVariables as CategoryIniValueVars,
  CategoryInputOptFragment,
  CategoriesWhere,
} from "../../apollo/graphTypes";
import { LoadingDefaultBlank, sortBranchesToTop } from "./shared";
import { useController } from "../../utils/reactHookForm";

export type CategoryInputOpt = Omit<CategoryInputOptFragment, "children"> &
  Partial<Pick<CategoryInputOptFragment, "children">>;

export const CATEGORY_INPUT_OPTS_FRAGMENTS = gql`
  fragment CategoryInputOpt on Category {
    __typename
    id
    name
    type
    children {
      __typename
      id
    }
    parent {
      __typename
      id
    }
  }
`;

export const CATEGORY_DEFAULT_VALUE = gql`
  query CategoryInputIniValue($where: CategoriesWhere!) {
    categories(where: $where) {
      ...CategoryInputOpt
      ancestors {
        ...CategoryInputOpt
      }
    }
  }
  ${CATEGORY_INPUT_OPTS_FRAGMENTS}
`;

export const CATEGORY_INPUT_OPTS = gql`
  query CategoryInputOpts($where: CategoriesWhere!) {
    categories(where: $where) {
      ...CategoryInputOpt
    }
  }
  ${CATEGORY_INPUT_OPTS_FRAGMENTS}
`;

export type CategoryTreeSelectProps<
  Multiple extends boolean | undefined = undefined,
  DisableClearable extends boolean | undefined = undefined,
  FreeSolo extends boolean | undefined = undefined
> = TreeSelectProps<
  CategoryInputOpt,
  CategoryInputOpt,
  Multiple,
  DisableClearable,
  FreeSolo
>;

export const getOptionLabel: NonNullable<
  CategoryTreeSelectProps<undefined, undefined, true | false>["getOptionLabel"]
> = (option) => {
  if (option instanceof FreeSoloNode) {
    return option.toString();
  } else {
    return option.valueOf().name;
  }
};

export const getOptionSelected: NonNullable<
  CategoryTreeSelectProps<
    undefined,
    undefined,
    true | false
  >["getOptionSelected"]
> = (option, value) =>
  !(option instanceof FreeSoloNode) &&
  !(value instanceof FreeSoloNode) &&
  option.valueOf().id === value.valueOf().id;

export type CategoryInputBaseProps<
  Multiple extends boolean | undefined = undefined,
  DisableClearable extends boolean | undefined = undefined,
  FreeSolo extends boolean | undefined = undefined
> = MarkOptional<
  MarkRequired<
    Omit<
      CategoryTreeSelectProps<Multiple, DisableClearable, FreeSolo>,
      "branch" | "options" | "defaultValue"
    >,
    "onChange" | "value"
  >,
  "onBranchChange"
>;

export const CategoryInputBase = forwardRef(function CategoryInputBase<
  Multiple extends boolean | undefined = undefined,
  DisableClearable extends boolean | undefined = undefined,
  FreeSolo extends boolean | undefined = undefined
>(
  props: CategoryInputBaseProps<Multiple, DisableClearable, FreeSolo>,
  ref: Ref<unknown>
): JSX.Element {
  const {
    renderInput: renderInputProp = defaultInput,
    onBranchChange: onBranchChangeProp,
    loading,
    ...rest
  } = props;

  const [state, setState] = useState<{
    branch: Exclude<CategoryTreeSelectProps["branch"], undefined>;
  }>({
    branch: props.value instanceof ValueNode ? props.value.parent : null,
  });

  const queryResult = useQuery<CategoryOpts, CategoryOptsVars>(
    CATEGORY_INPUT_OPTS,
    useMemo(() => {
      if (state.branch) {
        return {
          skip: false,
          variables: {
            where: {
              parent: {
                eq: state.branch.valueOf().id,
              },
            },
          },
        };
      } else {
        return {
          skip: false,
          variables: {
            where: {
              root: true,
            },
          },
        };
      }
    }, [state.branch])
  );

  const onBranchChange = useCallback<
    NonNullable<CategoryTreeSelectProps["onBranchChange"]>
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
      CategoryTreeSelectProps<
        Multiple,
        DisableClearable,
        FreeSolo
      >["renderInput"]
    >
  >(
    (params) =>
      renderInputProp({
        name: "category",
        ...params,
        ...(queryResult.error
          ? {
              error: true,
              helperText: queryResult.error.message,
            }
          : {}),
      }),
    [queryResult.error, renderInputProp]
  );

  const options = useMemo<CategoryTreeSelectProps["options"]>(
    () =>
      (queryResult.data?.categories || [])
        .reduce((options, category) => {
          if (category.children.length) {
            options.push(new BranchNode(category, state.branch));
          }
          options.push(category);

          return options;
        }, [] as CategoryTreeSelectProps["options"])
        .sort(sortBranchesToTop),
    [queryResult.data?.categories, state.branch]
  );

  return (
    <TreeSelect<
      CategoryInputOpt,
      CategoryInputOpt,
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

export type CategoryInputProps<
  Multiple extends boolean | undefined = undefined,
  DisableClearable extends boolean | undefined = undefined,
  FreeSolo extends boolean | undefined = undefined
> = {
  defaultValue?: CategoriesWhere;
  control?: Control;
  namePrefix?: string;
  rules?: UseControllerProps["rules"];
} & Omit<
  CategoryInputBaseProps<Multiple, DisableClearable, FreeSolo>,
  "onChange" | "value" | "name"
>;

export const CATEGORY_NAME = "category";
export const categoryName = (namePrefix?: string): string =>
  namePrefix ? `${namePrefix}.${CATEGORY_NAME}` : CATEGORY_NAME;

const CategoryInputControlled = forwardRef(function CategoryInputControlled<
  Multiple extends boolean | undefined = undefined,
  DisableClearable extends boolean | undefined = undefined,
  FreeSolo extends boolean | undefined = undefined
>(
  props: Omit<
    CategoryInputProps<Multiple, DisableClearable, FreeSolo>,
    "defaultValue"
  > & {
    defaultValue: TreeSelectValue<
      CategoryInputOpt,
      CategoryInputOpt,
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
    name: categoryName(namePrefixProp) as any,
    control,
    defaultValue,
    rules,
    shouldUnregister: true,
  });

  const handleBlur = useCallback<NonNullable<CategoryInputBaseProps["onBlur"]>>(
    (...args) => {
      onBlurControlled();
      if (onBlurProp) {
        onBlurProp(...args);
      }
    },
    [onBlurControlled, onBlurProp]
  );

  const renderInput = useCallback<
    NonNullable<CategoryInputBaseProps["renderInput"]>
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
      CategoryInputBaseProps<Multiple, DisableClearable, FreeSolo>["onChange"]
    >
  >(
    (_, value) => {
      onChangeControlled(value);
    },
    [onChangeControlled]
  );

  return (
    <CategoryInputBase
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

export const CategoryInput = forwardRef(function CategoryInput<
  Multiple extends boolean | undefined = undefined,
  DisableClearable extends boolean | undefined = undefined,
  FreeSolo extends boolean | undefined = undefined
>(
  props: CategoryInputProps<Multiple, DisableClearable, FreeSolo>,
  ref: Ref<unknown>
): JSX.Element {
  const {
    defaultValue: defaultValueProp,
    renderInput: renderInputProp = defaultInput,
    ...rest
  } = props;

  const { loading, error, data } = useQuery<
    CategoryIniValue,
    CategoryIniValueVars
  >(CATEGORY_DEFAULT_VALUE, {
    skip: !defaultValueProp,
    variables: useMemo(
      () => ({
        where: defaultValueProp as CategoriesWhere,
      }),
      [defaultValueProp]
    ),
  });

  const renderInput = useCallback<
    NonNullable<
      CategoryInputProps<Multiple, DisableClearable, FreeSolo>["renderInput"]
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
      (data?.categories || []).map(
        (value) => new ValueNode(value, [...value.ancestors].reverse())
      ),
    [data?.categories]
  );

  if (loading) {
    return <LoadingDefaultBlank {...rest} />;
  }

  return (
    <CategoryInputControlled<Multiple, DisableClearable, FreeSolo>
      {...rest}
      ref={ref}
      renderInput={renderInput}
      defaultValue={
        ((props.multiple
          ? defaultValues
          : defaultValues[0] ?? null) as unknown) as TreeSelectValue<
          CategoryInputOpt,
          CategoryInputOpt,
          Multiple,
          false,
          false
        >
      }
    />
  );
});
