import React, { forwardRef, useCallback, useMemo, Ref, useState } from "react";
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
  IsEqualFn,
  useField,
  UseFieldOptions,
  useFormContext,
} from "../../useKISSForm/form";
import { useControlled } from "@material-ui/core";

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

const categoryIsEqual: IsEqualFn<
  TreeSelectValue<
    CategoryInputOpt,
    CategoryInputOpt,
    true | false,
    true | false,
    true | false
  >
> = (a, b) => {
  type TIsEqual = TreeSelectValue<
    CategoryInputOpt,
    CategoryInputOpt,
    false,
    false,
    true
  >;

  const isEqual = (a: TIsEqual, b: TIsEqual) => {
    if (!a || !b) {
      return a === b;
    } else if (a instanceof FreeSoloNode || b instanceof FreeSoloNode) {
      return a.valueOf() === b.valueOf();
    } else {
      return a.valueOf().id === b.valueOf().id;
    }
  };

  if (Array.isArray(a) || Array.isArray(b)) {
    type TMulti = TreeSelectValue<
      CategoryInputOpt,
      CategoryInputOpt,
      true,
      true | false,
      true | false
    >;

    if ((a as TMulti).length !== (b as TMulti).length) {
      return false;
    } else {
      return (a as TMulti).every((a, i) => isEqual(a, (b as TMulti)[i]));
    }
  } else {
    return isEqual(a, b);
  }
};

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
      "options" | "defaultValue"
    >,
    "onChange" | "value"
  >,
  "branch" | "onBranchChange"
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
    branch: branchProp,
    loading,
    ...rest
  } = props;

  const [branch, setBranch] = useControlled({
    controlled: branchProp,
    default: null,
    name: "CategoryInputBaseProps",
    state: "branch",
  });

  const queryResult = useQuery<CategoryOpts, CategoryOptsVars>(
    CATEGORY_INPUT_OPTS,
    useMemo(() => {
      if (branch) {
        return {
          skip: false,
          variables: {
            where: {
              parent: {
                eq: branch.valueOf().id,
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
    }, [branch])
  );

  const onBranchChange = useCallback<
    NonNullable<CategoryTreeSelectProps["onBranchChange"]>
  >(
    (...args) => {
      setBranch(args[1]);

      if (onBranchChangeProp) {
        onBranchChangeProp(...args);
      }
    },
    [onBranchChangeProp, setBranch]
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
            options.push(new BranchNode(category, branch));
          }
          options.push(category);

          return options;
        }, [] as CategoryTreeSelectProps["options"])
        .sort(sortBranchesToTop),
    [queryResult.data?.categories, branch]
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
      branch={branch}
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
    "branch" | "value" | "name"
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

const BRANCH_NOT_SET = Symbol();

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
    onBranchChange: onBranchChangeProp,
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
    isEqual: categoryIsEqual,
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

  // The following accommodates async default value lookups.
  const [branch, setBranch] = useState(() =>
    value instanceof ValueNode ? value.parent : BRANCH_NOT_SET
  );
  const handleBranchChange = useCallback<
    NonNullable<
      CategoryInputBaseProps<
        Multiple,
        DisableClearable,
        FreeSolo
      >["onBranchChange"]
    >
  >(
    (...args) => {
      setBranch(args[1]);

      if (onBranchChangeProp) {
        onBranchChangeProp(...args);
      }
    },
    [onBranchChangeProp]
  );

  return (
    <CategoryInputBase<Multiple, DisableClearable, FreeSolo>
      {...rest}
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      value={value ?? (null as any)}
      disabled={isSubmitting || disabled}
      ref={ref}
      onChange={handleChange}
      branch={
        branch === BRANCH_NOT_SET
          ? value instanceof ValueNode
            ? value.parent
            : null
          : branch
      }
      onBranchChange={handleBranchChange}
      renderInput={renderInput}
      onBlur={handleBlur}
    />
  );
});
