import { useCallback, useMemo, useState } from "react";
import { BranchOption, FreeSoloValue, TreeSelectProps } from "mui-tree-select";
import { gql, useQuery, QueryResult, QueryHookOptions } from "@apollo/client";

import {
  CategoryInputOptsQuery as CategoryOpts,
  CategoryInputOptsQueryVariables as CategoryOptsVars,
  CategoryInputIniValueQuery as CategoryIniValue,
  CategoryInputIniValueQueryVariables as CategoryIniValueVars,
  CategoryInputOptFragment,
  Scalars,
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
  query CategoryInputIniValue($id: ID!) {
    categories(where: { id: { gte: $id } }) {
      ...CategoryInputOpt
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

type CategoryTreeSelectProps = TreeSelectProps<
  CategoryInputOpt,
  CategoryInputOpt,
  undefined,
  undefined,
  true | false
>;

export type CategoryTreeRoot = Scalars["ID"] | CategoriesWhere;

const getWhere = (
  root?: CategoryTreeRoot | BranchOption<CategoryInputOpt>
): CategoriesWhere => {
  if (root === undefined) {
    return { root: true };
  } else if (root instanceof BranchOption) {
    return {
      parent: {
        eq: root.option.id,
      },
    };
  } else if (typeof root === "string") {
    return {
      parent: {
        eq: root,
      },
    };
  } else {
    return root;
  }
};

export const getOptionLabel: NonNullable<
  CategoryTreeSelectProps["getOptionLabel"]
> = (option) => {
  if (option instanceof FreeSoloValue) {
    return option.toString();
  } else {
    const opt = option instanceof BranchOption ? option.option : option;
    return (opt as CategoryInputOptFragment).name;
  }
};

export const getOptionSelected: NonNullable<
  CategoryTreeSelectProps["getOptionSelected"]
> = (option, value) => {
  return (
    (option as CategoryInputOptFragment).id ===
    (value as CategoryInputOptFragment).id
  );
};

export interface UseCategoryTreeOptions {
  root?: CategoryTreeRoot;
  queryHookOptions?: Omit<QueryHookOptions, "variables">;
  iniValue?: Scalars["ID"];
}

export type TreeSelectParams = Required<
  Pick<CategoryTreeSelectProps, "branchPath" | "onBranchChange" | "options">
>;

export const useCategoryTree = (
  options: UseCategoryTreeOptions
): {
  iniValue?: CategoryInputOpt;
  treeSelectParams: TreeSelectParams;
  queryResult: QueryResult<CategoryOpts, CategoryOptsVars>;
} => {
  interface State {
    iniValue?: {
      iniValue: NonNullable<UseCategoryTreeOptions["iniValue"]>;
      value?: CategoryInputOptFragment;
    };
    variables?: CategoryOptsVars;
    branchPath: NonNullable<CategoryTreeSelectProps["branchPath"]>;
  }

  const [state, setState] = useState<State>(() => {
    const state: State = {
      branchPath: [],
    };

    if (options.iniValue) {
      state.iniValue = {
        iniValue: options.iniValue,
      };
    } else {
      state.variables = { where: getWhere(options.root) };
    }

    return state;
  });

  const iniValueResult = useQuery<CategoryIniValue, CategoryIniValueVars>(
    CATEGORY_INPUT_INI_VALUE,
    {
      onCompleted: useCallback<
        NonNullable<QueryHookOptions<CategoryIniValue>["onCompleted"]>
      >(
        (data) => {
          if (!state.iniValue || state.iniValue.value) {
            return;
          }

          // Order is not guaranteed but it is likely from iniValue leaf back
          // up the tree.  Reversing, likely makes unsorted already in order.
          const unsorted = [...data.categories].reverse();
          const sorted: CategoryInputOptFragment[] = [];
          let parent: CategoryInputOptFragment["id"] | undefined;
          while (unsorted.length) {
            for (let i = 0, len = unsorted.length; i < len; i++) {
              if (unsorted[i].parent?.id === parent) {
                parent = unsorted[i].id;
                sorted.push(...unsorted.splice(i, 1));
                break;
              }
            }
          }

          const value = sorted.pop();

          setState((state) => ({
            ...state,
            branchPath: sorted.map((opt) => new BranchOption(opt)),
            iniValue: {
              ...(state.iniValue || {}),
              value,
            } as State["iniValue"],
          }));
        },
        [setState, state.iniValue]
      ),
      variables: {
        id: state.iniValue?.iniValue || "",
      },
      skip: !state.iniValue || !!state.iniValue?.value,
    }
  );

  const queryResult = useQuery<CategoryOpts, CategoryOptsVars>(
    CATEGORY_INPUT_OPTS,
    {
      variables: state.variables,
      ...(options.queryHookOptions || {}),
      skip: options.queryHookOptions?.skip || !state.variables,
    }
  );

  const onBranchChange = useCallback<CategoryTreeSelectProps["onBranchChange"]>(
    (...[, branchOption, branchPath]) => {
      setState((state) => ({
        ...state,
        branchPath,
        variables: {
          ...state.variables,
          where: getWhere(branchOption || options.root),
        },
      }));
    },
    [options.root, setState]
  );

  const treeSelectOptions = useMemo<CategoryTreeSelectProps["options"]>(() => {
    return (
      queryResult.data?.categories ||
      (state.iniValue?.value ? [state.iniValue.value] : [])
    ).reduce((options, option) => {
      if (option.children.length) {
        options.push(new BranchOption(option));
      }

      // Root categories NOT selectable
      if (option.parent) {
        options.push(option);
      }

      return options;
    }, [] as CategoryTreeSelectProps["options"]);
  }, [queryResult.data?.categories, state.iniValue?.value]);

  return {
    iniValue: state.iniValue?.value,
    treeSelectParams: {
      options: treeSelectOptions,
      onBranchChange,
      branchPath: state.branchPath,
    },
    queryResult: {
      ...queryResult,
      error: queryResult.error || iniValueResult.error,
      loading: queryResult.loading || iniValueResult.loading,
    },
  };
};
