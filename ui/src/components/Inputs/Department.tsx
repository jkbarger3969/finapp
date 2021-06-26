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
import { MarkOptional, MarkRequired } from "ts-essentials";
import CircularProgress from "@material-ui/core/CircularProgress";

import {
  DepartmentInputRootOptsQuery as DepartmentInputRootOpts,
  DepartmentInputRootOptsQueryVariables as DepartmentInputRootOptsVars,
  DepartmentInputOptsQuery as DepartmentInputOpts,
  DepartmentInputOptsQueryVariables as DepartmentInputOptsVars,
  DepartmentInputIniValueQuery as DepartmentInputIniValue,
  DepartmentInputIniValueQueryVariables as DepartmentInputIniValueVars,
  DepartmentInputOptFragment,
  DepartmentsWhere,
} from "../../apollo/graphTypes";

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

export const DEPT_INPUT_ROOT_OPTS = gql`
  query DepartmentInputRootOpts($where: DepartmentsWhere!) {
    departments(where: $where) {
      ...DepartmentInputOpt
    }
  }
  ${DEPT_INPUT_OPT_FRAGMENT}
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

export type DepartmentInputProps<
  Multiple extends boolean | undefined = undefined,
  DisableClearable extends boolean | undefined = undefined,
  FreeSolo extends boolean | undefined = undefined
> = {
  root: DepartmentsWhere;
  iniValue?: DepartmentsWhere;
  error?: string | Error;
} & MarkRequired<
  Pick<
    DepartmentTreeSelectProps<Multiple, DisableClearable, FreeSolo>,
    "renderInput" | "disabled" | "onChange" | "value"
  >,
  "onChange" | "value"
>;

export const DepartmentInput = <
  Multiple extends boolean | undefined = undefined,
  DisableClearable extends boolean | undefined = undefined,
  FreeSolo extends boolean | undefined = undefined
>(
  props: DepartmentInputProps<Multiple, DisableClearable, FreeSolo>
): JSX.Element => {
  const {
    root: rootProp,
    iniValue: iniValueProp,
    renderInput: renderInputProp,
    onChange: onChangeProp,
    value: valueProp,
    disabled: disabledProp,
    error: errorProp,
  } = props;

  const [state, setState] = useState<{
    rootWhere: DepartmentsWhere;
    iniValueWhere?: DepartmentsWhere;
    iniValue?: NonNullable<DepartmentTreeSelectProps["value"]>;
    useIniValue: boolean;
    branch: NonNullable<DepartmentTreeSelectProps["branch"]> | null;
  }>(() => ({
    rootWhere: rootProp,
    iniValueWhere: iniValueProp,
    useIniValue: !!iniValueProp,
    branch: null,
  }));

  const rootResults = useQuery<
    DepartmentInputRootOpts,
    DepartmentInputRootOptsVars
  >(DEPT_INPUT_ROOT_OPTS, {
    variables: {
      where: state.rootWhere,
    },
    onCompleted: useCallback<
      NonNullable<
        QueryHookOptions<
          DepartmentInputRootOpts,
          DepartmentInputRootOptsVars
        >["onCompleted"]
      >
    >((data) => {
      if (
        data.departments.length === 1 &&
        data.departments[0].children.length
      ) {
        setState((state) => ({
          ...state,
          // When there is only one root dept and it is a branch node,
          // step into the branch node.
          branch: new BranchNode(data.departments[0]),
        }));
        return;
      }
    }, []),
  });

  const iniValueResult = useQuery<
    DepartmentInputIniValue,
    DepartmentInputIniValueVars
  >(DEPT_INPUT_INI_VALUE, {
    skip:
      !rootResults.data?.departments ||
      !!state.iniValue ||
      !state.iniValueWhere,
    variables: {
      where: iniValueProp as DepartmentsWhere,
    },
    onCompleted: useCallback<
      NonNullable<
        QueryHookOptions<
          DepartmentInputIniValue,
          DepartmentInputIniValueVars
        >["onCompleted"]
      >
    >(
      (data) => {
        if (state.useIniValue && !state.iniValue) {
          const value = data.departments[0];

          const rootDepts = rootResults.data?.departments || [];

          const iniValue = new ValueNode(
            value,
            (function* () {
              // If root opt IS iniValue DO NOT create branch path.
              if (rootDepts.every(({ id }) => id !== value.id)) {
                // If a root opt is in the ini value ancestor path,
                // do not include more ancestors.
                // for (const value of iniValue.ancestors) {
                for (let i = value.ancestors.length - 1; i > -1; i--) {
                  const dept = value.ancestors[i];

                  if (dept.__typename === "Department") {
                    yield dept;

                    if (rootDepts.some(({ id }) => id === dept.id)) {
                      return;
                    }
                  }
                }
              }
            })()
          );

          setState((state) => ({
            ...state,
            branch: iniValue.parent,
            iniValue,
          }));
        }
      },
      [state.iniValue, state.useIniValue, rootResults.data?.departments]
    ),
  });

  const queryResult = useQuery<DepartmentInputOpts, DepartmentInputOptsVars>(
    DEPT_INPUT_OPTS,
    useMemo(() => {
      const curBranch = state.branch?.valueOf();
      if (rootResults.loading || iniValueResult.loading || !curBranch) {
        return { skip: true, variables: { where: {} } };
      } else {
        return {
          skip: false,
          variables: {
            where: {
              parent: {
                eq: {
                  type: "Department",
                  id: curBranch.id,
                },
              },
            },
          },
        };
      }
    }, [state.branch, rootResults.loading, iniValueResult.loading])
  );

  const onBranchChange = useCallback<
    NonNullable<DepartmentTreeSelectProps["onBranchChange"]>
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
      DepartmentTreeSelectProps<
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

      if (rootResults.loading || iniValueResult.loading) {
        return (renderInputProp || defaultInput)({
          ...params,
          InputProps: mergeInputEndAdornment(
            "append",
            <CircularProgress size={20} color="inherit" />,
            params.InputProps || {}
          ),
          name: "department",
        });
      } else if (
        rootResults.error ||
        iniValueResult.error ||
        queryResult.error ||
        errorMsg
      ) {
        return (renderInputProp || defaultInput)({
          ...params,
          error: true,
          helperText:
            (rootResults.error || iniValueResult.error || queryResult.error)
              ?.message || errorMsg,
          name: "department",
        });
      } else {
        return (renderInputProp || defaultInput)({
          ...params,
          name: "department",
        });
      }
    },
    [
      renderInputProp,
      rootResults.error,
      rootResults.loading,
      iniValueResult.error,
      iniValueResult.loading,
      queryResult.error,
      queryResult.loading,
      errorProp,
    ]
  );

  const options = useMemo<DepartmentTreeSelectProps["options"]>(
    () =>
      (() => {
        const options: DepartmentTreeSelectProps["options"] = [];

        if (rootResults.loading || iniValueResult.loading) {
          return options;
        } else if (state.branch) {
          return (queryResult.data?.departments || []).reduce(
            (options, category) => {
              if (category.children.length) {
                options.push(new BranchNode(category));
              }
              options.push(category);

              return options;
            },
            options
          );
        } else {
          return (rootResults.data?.departments || []).reduce(
            (options, category) => {
              if (category.children.length) {
                options.push(new BranchNode(category));
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
    [
      queryResult.data?.departments,
      rootResults.data?.departments,
      rootResults.loading,
      iniValueResult.loading,
      state.branch,
    ]
  );

  const onChange = useCallback<
    NonNullable<
      DepartmentTreeSelectProps<
        Multiple,
        DisableClearable,
        FreeSolo
      >["onChange"]
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
    DepartmentTreeSelectProps<Multiple, DisableClearable, FreeSolo>["value"]
  >(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (state.useIniValue ? state.iniValue : valueProp) ?? (null as any);
  }, [state.iniValue, state.useIniValue, valueProp]);

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
      disabled={disabledProp || rootResults.loading || iniValueResult.loading}
      loading={
        queryResult.loading || rootResults.loading || iniValueResult.loading
      }
      onBranchChange={onBranchChange}
      branch={state.branch}
      renderInput={renderInput}
      options={options}
      onChange={onChange}
      value={value}
    />
  );
};
