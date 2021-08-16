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

import {
  CategoryInputOptsQuery as CategoryOpts,
  CategoryInputOptsQueryVariables as CategoryOptsVars,
  CategoryInputDefaultValueFragment,
  CategoryInputOptFragment,
} from "../../apollo/graphTypes";
import { sortBranchesToTop } from "./shared";
import {
  FieldValue,
  useField,
  UseFieldOptions,
  useFormContext,
} from "../../useKISSForm/form";

export type CategoryInputOpt = MarkOptional<
  CategoryInputOptFragment,
  "children"
>;

const CATEGORY_INPUT_OPTS_FRAGMENT = gql`
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

export const CATEGORY_DEFAULT_VALUE_FRAGMENT = gql`
  fragment CategoryInputDefaultValue on Category {
    ...CategoryInputOpt
    ancestors {
      ...CategoryInputOpt
    }
  }
  ${CATEGORY_INPUT_OPTS_FRAGMENT}
`;

export const CATEGORY_DEFAULT_VALUE = gql`
  query CategoryInputDefaultValues($where: CategoriesWhere!) {
    categories(where: $where) {
      ...CategoryInputDefaultValue
    }
  }
  ${CATEGORY_DEFAULT_VALUE_FRAGMENT}
`;

export const CATEGORY_INPUT_OPTS = gql`
  query CategoryInputOpts($where: CategoriesWhere!) {
    categories(where: $where) {
      ...CategoryInputOpt
    }
  }
  ${CATEGORY_INPUT_OPTS_FRAGMENT}
`;

export const useCategoryDefaultValue = (
  defaultValue?: CategoryInputDefaultValueFragment
): ValueNode<CategoryInputOpt, CategoryInputOpt> | undefined =>
  useMemo(
    () =>
      defaultValue
        ? new ValueNode(defaultValue, [...defaultValue.ancestors].reverse())
        : undefined,
    [defaultValue]
  );

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
  defaultValue?: TreeSelectValue<
    CategoryInputOpt,
    CategoryInputOpt,
    Multiple,
    false,
    false
  >;
} & Partial<
  Omit<
    CategoryInputBaseProps<Multiple, DisableClearable, FreeSolo>,
    "value" | "name"
  >
> &
  Pick<UseFieldOptions, "form">;

export type CategoryFieldDef<
  Multiple extends boolean | undefined = undefined,
  FreeSolo extends boolean | undefined = undefined
> = {
  category: FieldValue<
    TreeSelectValue<
      CategoryInputOpt,
      CategoryInputOpt,
      Multiple,
      false,
      FreeSolo
    >
  >;
};
export const CATEGORY_NAME: keyof CategoryFieldDef = "category";

export const CategoryInput = forwardRef(function CategoryInputInner<
  Multiple extends boolean | undefined = undefined,
  DisableClearable extends boolean | undefined = undefined,
  FreeSolo extends boolean | undefined = undefined
>(
  props: CategoryInputProps<Multiple, DisableClearable, FreeSolo>,
  ref: Ref<unknown>
): JSX.Element {
  const {
    defaultValue,
    form,
    renderInput: renderInputProp = defaultInput,
    disabled,
    onBlur: onBlurProp,
    onChange: onChangeProp,
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
      CategoryInputOpt,
      CategoryInputOpt,
      Multiple,
      DisableClearable,
      FreeSolo
    >
  >({
    name: CATEGORY_NAME,
    form,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    defaultValue: defaultValue as any,
  });

  const value = useMemo(
    () => fieldValue || (rest.multiple ? [] : null),
    [fieldValue, rest.multiple]
  ) as TreeSelectValue<
    CategoryInputOpt,
    CategoryInputOpt,
    Multiple,
    DisableClearable,
    FreeSolo
  >;

  const handleBlur = useCallback<NonNullable<CategoryInputBaseProps["onBlur"]>>(
    (...args) => {
      setTouched(true);
      if (onBlurProp) {
        onBlurProp(...args);
      }
    },
    [setTouched, onBlurProp]
  );

  const renderInput = useCallback<
    NonNullable<CategoryInputBaseProps["renderInput"]>
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
      CategoryInputBaseProps<Multiple, DisableClearable, FreeSolo>["onChange"]
    >
  >(
    (...args) => {
      setValue(args[1] ?? undefined);
      if (onChangeProp) {
        onChangeProp(...args);
      }
    },
    [onChangeProp, setValue]
  );

  return (
    <CategoryInputBase<Multiple, DisableClearable, FreeSolo>
      {...rest}
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      value={value ?? (null as any)}
      disabled={isSubmitting || disabled}
      ref={ref}
      onChange={handleChange}
      renderInput={renderInput}
      onBlur={handleBlur}
    />
  );
});
