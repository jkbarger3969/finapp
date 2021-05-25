import { useCallback, useMemo, useState } from "react";
import { TreeSelectProps, FreeSoloValue, BranchOption } from "mui-tree-select";
import { useQuery, gql, QueryResult, QueryHookOptions } from "@apollo/client";
import { MarkOptional } from "ts-essentials";

import {
  DeptInputOptsQuery as DeptOpts,
  DeptInputOptsQueryVariables as DeptOptsVars,
  DeptInputIniValueQuery as DeptIniValue,
  DeptInputIniValueQueryVariables as DeptIniValueVars,
  DeptInputOptFragment,
  DepartmentsWhere,
  NodeInput,
  Scalars,
  Department,
} from "../../apollo/graphTypes";

export type DeptInputOpt = MarkOptional<DeptInputOptFragment, "children">;

export const DEPT_INPUT_OPT_FRAGMENT = gql`
  fragment DeptInputOpt on Department {
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
  query DeptInputIniValue($id: ID!) {
    iniValue: department(id: $id) {
      ...DeptInputOpt
      parent {
        __typename
        ... on Department {
          id
          children {
            ...DeptInputOpt
          }
        }
        ... on Business {
          id
          departments(root: true) {
            ...DeptInputOpt
          }
        }
      }
    }
    ancestors: departments(where: { id: { gt: $id } }) {
      ...DeptInputOpt
      parent {
        __typename
        ... on Department {
          id
        }
        ... on Business {
          id
        }
      }
    }
  }
  ${DEPT_INPUT_OPT_FRAGMENT}
`;

export const DEPT_INPUT_OPTS = gql`
  query DeptInputOpts($where: DepartmentsWhere!) {
    departments(where: $where) {
      ...DeptInputOpt
    }
  }
  ${DEPT_INPUT_OPT_FRAGMENT}
`;

export type DeptTreeSelectProps = TreeSelectProps<
  DeptInputOpt,
  DeptInputOpt,
  undefined,
  undefined,
  true | false
>;

export type DeptTreeRoot = NodeInput | DepartmentsWhere;

const getWhere = (root: DeptTreeRoot): DepartmentsWhere => {
  if ("type" in root && "id" in root) {
    return {
      parent: {
        eq: root,
      },
    };
  } else {
    return root;
  }
};

export type DeptTreeQueryResult = QueryResult<DeptOpts, DeptOptsVars>;

export interface UseDepartmentTreeOptions {
  root: DeptTreeRoot;
  queryHookOptions?: Omit<QueryHookOptions<DeptOpts>, "variables">;
  iniValue?: Scalars["ID"];
}

export type TreeSelectParams = Required<
  Pick<DeptTreeSelectProps, "branchPath" | "onBranchChange" | "options">
>;

export const useDepartmentTree = (
  options: UseDepartmentTreeOptions
): {
  iniValue?: DeptInputOpt;
  treeSelectParams: TreeSelectParams;
  queryResult: QueryResult<DeptOpts, DeptOptsVars>;
} => {
  interface State {
    iniValue?: {
      iniValue: NonNullable<UseDepartmentTreeOptions["iniValue"]>;
      value?: DeptIniValue["iniValue"];
    };
    variables?: DeptOptsVars;
    branchPath: NonNullable<DeptTreeSelectProps["branchPath"]>;
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

  const iniValueResult = useQuery<DeptIniValue, DeptIniValueVars>(
    DEPT_INPUT_INI_VALUE,
    {
      onCompleted: useCallback<
        NonNullable<QueryHookOptions<DeptIniValue>["onCompleted"]>
      >(
        (data) => {
          if (!state.iniValue || state.iniValue.value) {
            return;
          }

          // Order is not guaranteed but it is likely from iniValue leaf back
          // up the tree.  Reversing, likely makes unsorted already in order.
          const unsorted = [...data.ancestors].reverse();
          const sorted: DeptInputOptFragment[] = [];
          let parentKey: keyof Pick<
            NonNullable<Department["parent"]>,
            "__typename" | "id"
          > = "__typename";
          let parent: DeptInputOptFragment["id"] | "Business" = "Business";
          while (unsorted.length) {
            for (let i = 0, len = unsorted.length; i < len; i++) {
              if (unsorted[i].parent[parentKey] === parent) {
                parentKey = "id";
                parent = unsorted[i].id;
                sorted.push(...unsorted.splice(i, 1));
                break;
              }
            }
          }

          const value = data.iniValue;
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

  const queryResult = useQuery<DeptOpts, DeptOptsVars>(DEPT_INPUT_OPTS, {
    variables: state.variables,
    ...(options.queryHookOptions || {}),
    skip: options.queryHookOptions?.skip || !state.variables,
  });

  const onBranchChange = useCallback<DeptTreeSelectProps["onBranchChange"]>(
    (...[, branchOption, branchPath]) => {
      setState((state) => ({
        ...state,
        branchPath,
        variables: {
          ...state.variables,
          where: getWhere(
            branchOption
              ? {
                  type: "Department",
                  id: branchOption.option.id,
                }
              : options.root
          ),
        },
      }));
    },
    [options.root, setState]
  );

  const treeSelectOptions = useMemo<DeptTreeSelectProps["options"]>(() => {
    return (() => {
      if (queryResult.data?.departments) {
        return queryResult.data.departments;
      } else if (!state.iniValue?.value?.parent) {
        return [];
      } else if (state.iniValue.value.parent.__typename === "Business") {
        return state.iniValue.value.parent.departments;
      } else {
        return state.iniValue.value.parent.children;
      }
    })().reduce((options, option) => {
      if (option.children.length) {
        options.push(new BranchOption(option));
      }

      options.push(option);

      return options;
    }, [] as DeptTreeSelectProps["options"]);
  }, [queryResult.data?.departments, state.iniValue?.value?.parent]);

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

export const getOptionLabel: NonNullable<
  DeptTreeSelectProps["getOptionLabel"]
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
  DeptTreeSelectProps["getOptionSelected"]
> = (option, value) => option.id === value.id;
