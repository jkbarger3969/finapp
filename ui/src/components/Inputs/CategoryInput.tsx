import React, { useMemo } from "react";
import TreeSelect, {
  TreeSelectProps,
  NodeType,
  Option,
  FreeSoloValue,
} from "mui-tree-select";
import { ApolloError, gql, useApolloClient } from "@apollo/client";

import {
  CategoryInputOptsQuery as CategoryOpts,
  CategoryInputOptsQueryVariables as CategoryOptsVars,
  CategoryInputOptFragment,
  CategoryWhereInput,
} from "../../apollo/graphTypes";

export type CategoryInputOpt = Omit<CategoryInputOptFragment, "children"> &
  Partial<Pick<CategoryInputOptFragment, "children">>;

const CATEGORY_INPUT_CHILD_OPTS = gql`
  fragment CategoryInputOpt on Category {
    __typename
    id
    name
    children {
      __typename
      id
    }
  }

  query CategoryInputOpts($where: CategoryWhereInput!) {
    categories(where: $where) {
      ...CategoryInputOpt
    }
  }
`;

export type CategoryInputPropsWithQuery<
  Multiple extends boolean | undefined,
  DisableClearable extends boolean | undefined,
  FreeSolo extends boolean | undefined = undefined
> = {
  onGQLError: (e: ApolloError) => void;
  rootOptions: CategoryWhereInput;
  selectable?: (categoryInputOpt: CategoryInputOpt) => boolean;
} & Omit<
  TreeSelectProps<CategoryInputOpt, Multiple, DisableClearable, FreeSolo>,
  "getOptionLabel" | "getOptionSelected" | "getOptions"
>;

export type CategoryInputPropsWithGetOptions<
  Multiple extends boolean | undefined,
  DisableClearable extends boolean | undefined,
  FreeSolo extends boolean | undefined = undefined
> = {
  onGQLError: (e: ApolloError) => void;
} & Omit<
  TreeSelectProps<CategoryInputOpt, Multiple, DisableClearable, FreeSolo>,
  "getOptionLabel" | "getOptionSelected"
>;

export type CategoryInputProps<
  Multiple extends boolean | undefined,
  DisableClearable extends boolean | undefined,
  FreeSolo extends boolean | undefined = undefined
> =
  | CategoryInputPropsWithQuery<Multiple, DisableClearable, FreeSolo>
  | CategoryInputPropsWithGetOptions<Multiple, DisableClearable, FreeSolo>;

const getOptionLabel: NonNullable<
  TreeSelectProps<
    CategoryInputOpt,
    undefined,
    undefined,
    true | false
  >["getOptionLabel"]
> = (opt) => ("value" in opt ? opt.value : opt.name);

const getOptionSelected: NonNullable<
  TreeSelectProps<
    CategoryInputOpt,
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
    return (opt as CategoryInputOpt).id === (val as CategoryInputOpt).id;
  } else {
    return false;
  }
};

export const CategoryInput = <
  Multiple extends boolean | undefined,
  DisableClearable extends boolean | undefined,
  FreeSolo extends boolean | undefined = undefined
>(
  props: CategoryInputProps<Multiple, DisableClearable, FreeSolo>
): JSX.Element => {
  const {
    onGQLError,
    rootOptions,
    selectable,
    disabled,
    getOptions: getOptionsProp,
    ...rest
  } = props as CategoryInputPropsWithQuery<
    Multiple,
    DisableClearable,
    FreeSolo
  > &
    CategoryInputPropsWithGetOptions<Multiple, DisableClearable, FreeSolo>;

  type CategoryTreeSelectProps = TreeSelectProps<
    CategoryInputOpt,
    Multiple,
    DisableClearable,
    FreeSolo
  >;

  const client = useApolloClient();

  const getOptions = useMemo<CategoryTreeSelectProps["getOptions"]>(
    () =>
      getOptionsProp ||
      (async (branchNode) => {
        if (disabled || !rootOptions) {
          return [];
        }

        const where: CategoryOptsVars["where"] =
          branchNode === undefined
            ? rootOptions
            : {
                parent: {
                  eq: branchNode.id,
                },
              };

        const { error, data } = await client.query<
          CategoryOpts,
          CategoryOptsVars
        >({
          query: CATEGORY_INPUT_CHILD_OPTS,
          variables: {
            where,
          },
        });

        if (error) {
          onGQLError(error);
        }

        const categoryOpts = data?.categories || [];

        return categoryOpts.map<Option<CategoryInputOptFragment>>(
          (categoryOpt) => ({
            option: categoryOpt,
            type: (() => {
              if (categoryOpt.children.length === 0) {
                return NodeType.Leaf;
              } else {
                return !selectable || selectable(categoryOpt)
                  ? NodeType.SelectableBranch
                  : NodeType.Branch;
              }
            })(),
          })
        );
      }),
    [client, rootOptions, selectable, disabled, onGQLError, getOptionsProp]
  );

  return (
    <TreeSelect<CategoryInputOpt, Multiple, DisableClearable, FreeSolo>
      {...rest}
      disabled={disabled}
      getOptionLabel={getOptionLabel}
      getOptions={getOptions}
      getOptionSelected={getOptionSelected}
    />
  );
};

export default CategoryInput;
