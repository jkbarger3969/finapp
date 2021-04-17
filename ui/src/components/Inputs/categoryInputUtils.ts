import { useCallback, useMemo, useState } from "react";
import { BranchOption, FreeSoloValue, TreeSelectProps } from "mui-tree-select";
import { gql, useQuery, QueryHookOptions, QueryResult } from "@apollo/client";

import {
  CategoryInputOptsQuery as CategoryOpts,
  CategoryInputOptsQueryVariables as CategoryOptsVars,
  CategoryInputOptFragment,
  Scalars,
  CategoriesWhere,
} from "../../apollo/graphTypes";

export type CategoryInputOpt = Omit<CategoryInputOptFragment, "children"> &
  Partial<Pick<CategoryInputOptFragment, "children">>;

export const CATEGORY_INPUT_CHILD_OPTS = gql`
  fragment CategoryInputOpt on Category {
    __typename
    id
    name
    children {
      __typename
      id
    }
  }

  query CategoryInputOpts($where: CategoriesWhere!) {
    categories(where: $where) {
      ...CategoryInputOpt
    }
  }
`;

type CategoryTreeSelectProps = TreeSelectProps<
  CategoryInputOpt,
  undefined,
  undefined,
  true | false
>;

export type CategoryTreeRoot = Scalars["ID"] | CategoriesWhere | undefined;

const getWhere = (root: CategoryTreeRoot): CategoriesWhere => {
  if (root === undefined) {
    return { root: true };
  } else if (typeof root === "object") {
    return root;
  } else {
    return {
      parent: {
        eq: root,
      },
    };
  }
};

export const useCategoryTree = (
  root: CategoryTreeRoot,
  queryHookOptions: Omit<QueryHookOptions, "variables"> = {}
): {
  options: CategoryTreeSelectProps["options"];
  onBranchChange: CategoryTreeSelectProps["onBranchChange"];
  queryResult: QueryResult<CategoryOpts, CategoryOptsVars>;
} => {
  const [{ variables }, setState] = useState({
    variables: { where: getWhere(root) },
  });

  const onBranchChange = useCallback<CategoryTreeSelectProps["onBranchChange"]>(
    (...[, branchOption]) => {
      setState((state) => ({
        ...state,
        variables: {
          ...state.variables,
          where: getWhere(branchOption?.option.id || root),
        },
      }));
    },
    [root, setState]
  );

  const queryResult = useQuery<CategoryOpts, CategoryOptsVars>(
    CATEGORY_INPUT_CHILD_OPTS,
    {
      variables,
      ...queryHookOptions,
    }
  );

  const options = useMemo<CategoryTreeSelectProps["options"]>(() => {
    return (queryResult.data?.categories || []).reduce((options, option) => {
      if (option.children.length) {
        options.push(new BranchOption(option));
      }

      options.push(option);

      return options;
    }, [] as CategoryTreeSelectProps["options"]);
  }, [queryResult.data?.categories]);

  return {
    onBranchChange,
    options,
    queryResult,
  };
};

export const getOptionLabel: NonNullable<
  CategoryTreeSelectProps["getOptionLabel"]
> = (option) => {
  if (option instanceof BranchOption) {
    return option.option.name;
  } else if (option instanceof FreeSoloValue) {
    return option.toString();
  } else {
    return option.name;
  }
};

export const getOptionSelected: NonNullable<
  CategoryTreeSelectProps["getOptionSelected"]
> = (option, value) => option.id === value.id;
