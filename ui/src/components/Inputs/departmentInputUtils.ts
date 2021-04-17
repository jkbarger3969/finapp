import { useCallback, useMemo, useState } from "react";
import { TreeSelectProps, FreeSoloValue, BranchOption } from "mui-tree-select";
import { useQuery, gql, QueryHookOptions, QueryResult } from "@apollo/client";

import {
  DeptInputOptsQuery as DeptOpts,
  DeptInputOptsQueryVariables as DeptOptsVars,
  DeptInputOptFragment,
  DepartmentsWhere,
  NodeInput,
} from "../../apollo/graphTypes";

export type DeptInputOpt = Omit<DeptInputOptFragment, "children"> &
  Partial<Pick<DeptInputOptFragment, "children">>;

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

export const DEPT_INPUT_OPTS = gql`
  query DeptInputOpts($where: DepartmentsWhere!) {
    departments(where: $where) {
      ...DeptInputOpt
    }
  }
`;

type DeptTreeSelectProps = TreeSelectProps<
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

export const useDepartmentTree = (
  root: DeptTreeRoot,
  queryHookOptions: Omit<QueryHookOptions, "variables"> = {}
): {
  options: DeptTreeSelectProps["options"];
  onBranchChange: DeptTreeSelectProps["onBranchChange"];
  queryResult: DeptTreeQueryResult;
} => {
  const [{ variables }, setState] = useState({
    variables: { where: getWhere(root) },
  });

  const onBranchChange = useCallback<DeptTreeSelectProps["onBranchChange"]>(
    (...[, branchOption]) => {
      setState((state) => ({
        ...state,
        variables: {
          ...state.variables,
          where: getWhere(
            branchOption
              ? {
                  type: "Department",
                  id: branchOption.option.id,
                }
              : root
          ),
        },
      }));
    },
    [root, setState]
  );

  const queryResult = useQuery<DeptOpts, DeptOptsVars>(DEPT_INPUT_OPTS, {
    variables,
    ...queryHookOptions,
  });

  const options = useMemo<DeptTreeSelectProps["options"]>(() => {
    return (queryResult.data?.departments || []).reduce((options, option) => {
      if (option.children.length) {
        options.push(new BranchOption(option));
      }

      options.push(option);

      return options;
    }, [] as DeptTreeSelectProps["options"]);
  }, [queryResult.data?.departments]);

  return {
    onBranchChange,
    options,
    queryResult,
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
