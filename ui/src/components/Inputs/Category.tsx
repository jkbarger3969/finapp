import React, { useCallback, useMemo, useState } from "react";
import TreeSelect, {
  ValueNode,
  BranchNode,
  FreeSoloNode,
  TreeSelectProps,
  defaultInput,
  mergeInputEndAdornment,
} from "mui-tree-select";
import { gql, QueryHookOptions, useQuery } from "@apollo/client";
import { MarkRequired } from "ts-essentials";
import CircularProgress from "@material-ui/core/CircularProgress";

import {
  CategoryInputOptsQuery as CategoryOpts,
  CategoryInputOptsQueryVariables as CategoryOptsVars,
  CategoryInputIniValueQuery as CategoryIniValue,
  CategoryInputIniValueQueryVariables as CategoryIniValueVars,
  CategoryInputOptFragment,
  CategoriesWhere,
} from "../../apollo/graphTypes";

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

export const CATEGORY_INPUT_INI_VALUE = gql`
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

export type CategoryInputProps<
  Multiple extends boolean | undefined = undefined,
  DisableClearable extends boolean | undefined = undefined,
  FreeSolo extends boolean | undefined = undefined
> = {
  iniValue?: CategoriesWhere;
  error?: string | Error;
} & MarkRequired<
  Pick<
    CategoryTreeSelectProps<Multiple, DisableClearable, FreeSolo>,
    "renderInput" | "disabled" | "onChange" | "value"
  >,
  "onChange" | "value"
>;

export const CategoryInput = <
  Multiple extends boolean | undefined = undefined,
  DisableClearable extends boolean | undefined = undefined,
  FreeSolo extends boolean | undefined = undefined
>(
  props: CategoryInputProps<Multiple, DisableClearable, FreeSolo>
): JSX.Element => {
  const {
    iniValue: iniValueProp,
    renderInput: renderInputProp,
    onChange: onChangeProp,
    value: valueProp,
    disabled: disabledProp,
    error: errorProp,
  } = props;

  const [state, setState] = useState<{
    iniValue?: NonNullable<CategoryTreeSelectProps["value"]>;
    iniValueWhere?: CategoriesWhere;
    useIniValue: boolean;
    branch: NonNullable<CategoryTreeSelectProps["branch"]> | null;
  }>(() => ({
    useIniValue: !!iniValueProp,
    iniValueWhere: iniValueProp,
    branch: null,
  }));

  const iniValueResult = useQuery<CategoryIniValue, CategoryIniValueVars>(
    CATEGORY_INPUT_INI_VALUE,
    {
      skip: !!state.iniValue || !state.iniValueWhere,
      variables: {
        where: state.iniValueWhere as CategoriesWhere,
      },
      onCompleted: useCallback<
        NonNullable<
          QueryHookOptions<
            CategoryIniValue,
            CategoryIniValueVars
          >["onCompleted"]
        >
      >(
        (data) => {
          if (state.useIniValue && !state.iniValue) {
            const value = data.categories[0];

            const iniValue = new ValueNode(
              value,
              [...value.ancestors].reverse()
            );

            setState((state) => ({
              ...state,
              branch: iniValue.parent,
              iniValue,
            }));
          }
        },
        [state.iniValue, state.useIniValue]
      ),
    }
  );

  const queryResult = useQuery<CategoryOpts, CategoryOptsVars>(
    CATEGORY_INPUT_OPTS,
    useMemo(() => {
      if (iniValueResult.loading) {
        return { skip: true, variables: { where: {} } };
      } else if (state.branch) {
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
    }, [state.branch, iniValueResult.loading])
  );

  const onBranchChange = useCallback<
    NonNullable<CategoryTreeSelectProps["onBranchChange"]>
  >(
    (_, branch) =>
      setState((state) => ({
        ...state,
        branch,
      })),
    []
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
    (params) => {
      const errorMsg =
        typeof errorProp === "string"
          ? errorProp.trim()
          : errorProp?.message || "";

      if (iniValueResult.loading) {
        return (renderInputProp || defaultInput)({
          ...params,
          name: "category",
          InputProps: mergeInputEndAdornment(
            "append",
            <CircularProgress size={20} color="inherit" />,
            params.InputProps || {}
          ),
        });
      } else if (iniValueResult.error || queryResult.error || errorMsg) {
        return (renderInputProp || defaultInput)({
          ...params,
          name: "category",
          error: true,
          helperText:
            iniValueResult.error?.message ||
            queryResult.error?.message ||
            errorMsg,
        });
      } else {
        return (renderInputProp || defaultInput)({
          ...params,
          name: "category",
        });
      }
    },
    [
      renderInputProp,
      iniValueResult.error,
      iniValueResult.loading,
      queryResult.error,
      queryResult.loading,
      errorProp,
    ]
  );

  const options = useMemo<CategoryTreeSelectProps["options"]>(
    () =>
      (() => {
        const options: CategoryTreeSelectProps["options"] = [];

        if (iniValueResult.loading) {
          return options;
        } else {
          return (queryResult.data?.categories || []).reduce(
            (options, category) => {
              if (category.children.length) {
                options.push(new BranchNode(category, state.branch));
              }
              options.push(category);

              return options;
            },
            options
          );
        }
      })().sort((a, b) => {
        // Put branches at top of options to encourage, more detailed
        // labeling for users.

        const aIsBranch = a instanceof BranchNode;
        const bIsBranch = b instanceof BranchNode;

        if (aIsBranch) {
          return bIsBranch ? 0 : -1;
        } else if (bIsBranch) {
          return aIsBranch ? 0 : 1;
        } else {
          return 0;
        }
      }),
    [queryResult.data?.categories, iniValueResult.loading, state.branch]
  );

  const onChange = useCallback<
    NonNullable<
      CategoryTreeSelectProps<Multiple, DisableClearable, FreeSolo>["onChange"]
    >
  >(
    (...args) => {
      onChangeProp(...args);
      if (state.useIniValue) {
        setState((state) => ({
          ...state,
          useIniValue: false,
        }));
      }
    },
    [onChangeProp, state.useIniValue]
  );

  const value = useMemo<
    CategoryTreeSelectProps<Multiple, DisableClearable, FreeSolo>["value"]
  >(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (state.useIniValue ? state.iniValue : valueProp) ?? (null as any);
  }, [state.iniValue, state.useIniValue, valueProp]);

  return (
    <TreeSelect<
      CategoryInputOpt,
      CategoryInputOpt,
      Multiple,
      DisableClearable,
      FreeSolo
    >
      disabled={disabledProp || iniValueResult.loading}
      loading={queryResult.loading || iniValueResult.loading}
      getOptionLabel={getOptionLabel}
      getOptionSelected={getOptionSelected}
      onBranchChange={onBranchChange}
      branch={state.branch}
      renderInput={renderInput}
      options={options}
      onChange={onChange}
      value={value}
    />
  );
};
