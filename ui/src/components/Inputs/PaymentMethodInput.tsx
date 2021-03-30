import React, { useMemo } from "react";
import TreeSelect, {
  TreeSelectProps,
  NodeType,
  Option,
  FreeSoloValue,
} from "mui-tree-select";
import { ApolloError, gql, useApolloClient } from "@apollo/client";

import {
  PayMethodInputOptsQuery as PayMethodOpts,
  PayMethodInputOptsQueryVariables as PayMethodOptsVars,
  PayMethodInputOptFragment,
  PaymentMethodWhereInput,
} from "../../apollo/graphTypes";

export type PayMethodInputOpt = Omit<PayMethodInputOptFragment, "children"> &
  Partial<Pick<PayMethodInputOptFragment, "children">>;

const PAY_METHOD_INPUT_CHILD_OPTS = gql`
  fragment PayMethodInputOpt on PaymentMethod {
    __typename
    id
    name
    children {
      __typename
      id
    }
  }

  query PayMethodInputOpts($where: PaymentMethodWhereInput!) {
    paymentMethods(where: $where) {
      ...PayMethodInputOpt
    }
  }
`;

export type PayMethodInputPropsWithQuery<
  Multiple extends boolean | undefined,
  DisableClearable extends boolean | undefined,
  FreeSolo extends boolean | undefined = undefined
> = {
  onGQLError: (e: ApolloError) => void;
  rootOptions: PaymentMethodWhereInput;
  selectable?: (categoryInputOpt: PayMethodInputOpt) => boolean;
} & Omit<
  TreeSelectProps<PayMethodInputOpt, Multiple, DisableClearable, FreeSolo>,
  "getOptionLabel" | "getOptionSelected" | "getOptions"
>;

export type PayMethodInputPropsWithGetOptions<
  Multiple extends boolean | undefined,
  DisableClearable extends boolean | undefined,
  FreeSolo extends boolean | undefined = undefined
> = {
  onGQLError: (e: ApolloError) => void;
} & Omit<
  TreeSelectProps<PayMethodInputOpt, Multiple, DisableClearable, FreeSolo>,
  "getOptionLabel" | "getOptionSelected"
>;

export type PayMethodInputProps<
  Multiple extends boolean | undefined,
  DisableClearable extends boolean | undefined,
  FreeSolo extends boolean | undefined = undefined
> =
  | PayMethodInputPropsWithQuery<Multiple, DisableClearable, FreeSolo>
  | PayMethodInputPropsWithGetOptions<Multiple, DisableClearable, FreeSolo>;

const getOptionLabel: NonNullable<
  TreeSelectProps<
    PayMethodInputOpt,
    undefined,
    undefined,
    true | false
  >["getOptionLabel"]
> = (opt) => ("value" in opt ? opt.value : opt.name);

const getOptionSelected: NonNullable<
  TreeSelectProps<
    PayMethodInputOpt,
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
    return (opt as PayMethodInputOpt).id === (val as PayMethodInputOpt).id;
  } else {
    return false;
  }
};

export const PaymentMethodInput = <
  Multiple extends boolean | undefined,
  DisableClearable extends boolean | undefined,
  FreeSolo extends boolean | undefined = undefined
>(
  props: PayMethodInputProps<Multiple, DisableClearable, FreeSolo>
): JSX.Element => {
  const {
    onGQLError,
    rootOptions,
    selectable,
    disabled,
    getOptions: getOptionsProp,
    ...rest
  } = props as PayMethodInputPropsWithQuery<
    Multiple,
    DisableClearable,
    FreeSolo
  > &
    PayMethodInputPropsWithGetOptions<Multiple, DisableClearable, FreeSolo>;

  type CategoryTreeSelectProps = TreeSelectProps<
    PayMethodInputOpt,
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

        const where: PayMethodOptsVars["where"] =
          branchNode === undefined
            ? rootOptions
            : {
                parent: {
                  eq: branchNode.id,
                },
              };

        const { error, data } = await client.query<
          PayMethodOpts,
          PayMethodOptsVars
        >({
          query: PAY_METHOD_INPUT_CHILD_OPTS,
          variables: {
            where,
          },
        });

        if (error) {
          onGQLError(error);
        }

        const payMethodsOpts = data?.paymentMethods || [];

        return payMethodsOpts.map<Option<PayMethodInputOptFragment>>(
          (payMethodOpt) => ({
            option: payMethodOpt,
            type: (() => {
              if (payMethodOpt.children.length === 0) {
                return NodeType.Leaf;
              } else {
                return !selectable || selectable(payMethodOpt)
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
    <TreeSelect<PayMethodInputOpt, Multiple, DisableClearable, FreeSolo>
      {...rest}
      disabled={disabled}
      getOptionLabel={getOptionLabel}
      getOptions={getOptions}
      getOptionSelected={getOptionSelected}
    />
  );
};

export default PaymentMethodInput;
