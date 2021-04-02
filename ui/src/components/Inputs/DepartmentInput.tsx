import React, { useMemo } from "react";
import TreeSelect, {
  TreeSelectProps,
  NodeType,
  Option,
  FreeSoloValue,
} from "mui-tree-select";
import { ApolloError, gql, useApolloClient } from "@apollo/client";

import {
  DepartmentAncestorType,
  DeptInputOptsQuery as DeptOpts,
  DeptInputOptsQueryVariables as DeptOptsVars,
  DeptInputOptFragment,
  DepartmentsWhereInput,
} from "../../apollo/graphTypes";

export type DeptInputOpt = Omit<DeptInputOptFragment, "children"> &
  Partial<Pick<DeptInputOptFragment, "children">>;

const DEPT_INPUT_CHILD_OPTS = gql`
  fragment DeptInputOpt on Department {
    __typename
    id
    name
    children {
      __typename
      id
    }
  }

  query DeptInputOpts($where: DepartmentsWhere!) {
    departments(where: $where) {
      ...DeptInputOpt
    }
  }
`;

export type DepartmentInputPropsWithQuery<
  Multiple extends boolean | undefined,
  DisableClearable extends boolean | undefined,
  FreeSolo extends boolean | undefined = undefined
> = {
  onGQLError: (e: ApolloError) => void;
  rootOptions: DepartmentsWhereInput;
  selectable?: (deptInputOpt: DeptInputOpt) => boolean;
} & Omit<
  TreeSelectProps<DeptInputOpt, Multiple, DisableClearable, FreeSolo>,
  "getOptionLabel" | "getOptionSelected" | "getOptions"
>;

export type DepartmentInputPropsWithGetOptions<
  Multiple extends boolean | undefined,
  DisableClearable extends boolean | undefined,
  FreeSolo extends boolean | undefined = undefined
> = {
  onGQLError: (e: ApolloError) => void;
} & Omit<
  TreeSelectProps<DeptInputOpt, Multiple, DisableClearable, FreeSolo>,
  "getOptionLabel" | "getOptionSelected"
>;

export type DepartmentInputProps<
  Multiple extends boolean | undefined,
  DisableClearable extends boolean | undefined,
  FreeSolo extends boolean | undefined = undefined
> =
  | DepartmentInputPropsWithQuery<Multiple, DisableClearable, FreeSolo>
  | DepartmentInputPropsWithGetOptions<Multiple, DisableClearable, FreeSolo>;

const getOptionLabel: NonNullable<
  TreeSelectProps<
    DeptInputOpt,
    undefined,
    undefined,
    true | false
  >["getOptionLabel"]
> = (opt) => ("value" in opt ? opt.value : opt.name);

const getOptionSelected: NonNullable<
  TreeSelectProps<
    DeptInputOpt,
    undefined,
    undefined,
    true | false
  >["getOptionSelected"]
> = (opt, val) => {
  const optIsFreeSolo = opt instanceof FreeSoloValue;
  const valIsFreeSolo = val instanceof FreeSoloValue;
  if (optIsFreeSolo && valIsFreeSolo) {
    return (opt as FreeSoloValue).value === (val as FreeSoloValue).value;
  } else if (!optIsFreeSolo && !optIsFreeSolo) {
    return (opt as DeptInputOpt).id === (val as DeptInputOpt).id;
  } else {
    return false;
  }
};

export const DepartmentInput = <
  Multiple extends boolean | undefined,
  DisableClearable extends boolean | undefined,
  FreeSolo extends boolean | undefined = undefined
>(
  props: DepartmentInputProps<Multiple, DisableClearable, FreeSolo>
): JSX.Element => {
  const {
    onGQLError,
    rootOptions,
    selectable,
    disabled,
    getOptions: getOptionsProp,
    ...rest
  } = props as DepartmentInputPropsWithQuery<
    Multiple,
    DisableClearable,
    FreeSolo
  > &
    DepartmentInputPropsWithGetOptions<Multiple, DisableClearable, FreeSolo>;

  type DeptTreeSelectProps = TreeSelectProps<
    DeptInputOpt,
    Multiple,
    DisableClearable,
    FreeSolo
  >;

  const client = useApolloClient();

  const getOptions = useMemo<DeptTreeSelectProps["getOptions"]>(
    () =>
      getOptionsProp ||
      (async (branchNode) => {
        if (disabled || !rootOptions) {
          return [];
        }

        const where: DeptOptsVars["where"] =
          branchNode === undefined
            ? rootOptions
            : {
                parent: {
                  eq: {
                    id: branchNode.id,
                    type: DepartmentAncestorType.Department,
                  },
                },
              };

        const { error, data } = await client.query<DeptOpts, DeptOptsVars>({
          query: DEPT_INPUT_CHILD_OPTS,
          variables: {
            where,
          },
        });

        if (error) {
          onGQLError(error);
        }

        const deptOpts = data?.departments || [];

        return deptOpts.map<Option<DeptInputOptFragment>>((deptOpt) => ({
          option: deptOpt,
          type: (() => {
            if (deptOpt.children.length === 0) {
              return NodeType.Leaf;
            } else {
              return !selectable || selectable(deptOpt)
                ? NodeType.SelectableBranch
                : NodeType.Branch;
            }
          })(),
        }));
      }),
    [client, rootOptions, disabled, onGQLError, selectable, getOptionsProp]
  );

  return (
    <TreeSelect<DeptInputOpt, Multiple, DisableClearable, FreeSolo>
      {...rest}
      disabled={disabled}
      getOptionLabel={getOptionLabel}
      getOptions={getOptions}
      getOptionSelected={getOptionSelected}
    />
  );
};

export default DepartmentInput;
