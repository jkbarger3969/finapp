import { useCallback, useMemo, useState } from "react";
import { TreeSelectProps, FreeSoloValue, BranchOption } from "mui-tree-select";
import { gql, useQuery, QueryHookOptions, QueryResult } from "@apollo/client";

import {
  PayMethodInputOptsQuery as PayMethodOpts,
  PayMethodInputOptsQueryVariables as PayMethodOptsVars,
  PayMethodInputOptFragment,
  PaymentMethodsWhere,
  Scalars,
} from "../../apollo/graphTypes";
import { composeAlias } from "../../utils/alias";

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
    aliases {
      __typename
      id
      name
      type
    }
  }

  query PayMethodInputOpts($where: PaymentMethodsWhere!) {
    paymentMethods(where: $where) {
      ...PayMethodInputOpt
    }
  }
`;

type PayMethodTreeSelectProps = TreeSelectProps<
  PayMethodInputOpt,
  undefined,
  undefined,
  true | false
>;

export type PayMethodTreeRoot = Scalars["ID"] | PaymentMethodsWhere | undefined;

const getWhere = (root: PayMethodTreeRoot): PaymentMethodsWhere => {
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

export const usePaymentMethodTree = (
  root: PayMethodTreeRoot,
  queryHookOptions: Omit<QueryHookOptions, "variables"> = {}
): {
  options: PayMethodTreeSelectProps["options"];
  onBranchChange: PayMethodTreeSelectProps["onBranchChange"];
  queryResult: QueryResult<PayMethodOpts, PayMethodOptsVars>;
} => {
  const [{ variables }, setState] = useState({
    variables: { where: getWhere(root) },
  });

  const onBranchChange = useCallback<
    PayMethodTreeSelectProps["onBranchChange"]
  >(
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

  const queryResult = useQuery<PayMethodOpts, PayMethodOptsVars>(
    PAY_METHOD_INPUT_CHILD_OPTS,
    {
      variables,
      ...queryHookOptions,
    }
  );

  const options = useMemo<PayMethodTreeSelectProps["options"]>(() => {
    return (queryResult.data?.paymentMethods || []).reduce(
      (options, option) => {
        if (option.children.length) {
          options.push(new BranchOption(option));
        }

        options.push(option);

        return options;
      },
      [] as PayMethodTreeSelectProps["options"]
    );
  }, [queryResult.data?.paymentMethods]);

  return {
    onBranchChange,
    options,
    queryResult,
  };
};

export const getOptionLabel: NonNullable<
  PayMethodTreeSelectProps["getOptionLabel"]
> = (option) => {
  if (option instanceof BranchOption) {
    return composeAlias(option.option.aliases, option.option.name);
  } else if (option instanceof FreeSoloValue) {
    return option.toString();
  } else {
    return composeAlias(option.aliases, option.name);
  }
};

export const getOptionSelected: NonNullable<
  PayMethodTreeSelectProps["getOptionSelected"]
> = (option, value) => option.id === value.id;
