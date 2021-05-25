import { useCallback, useEffect, useMemo, useState } from "react";
import { TreeSelectProps, FreeSoloValue, BranchOption } from "mui-tree-select";
import {
  useQuery,
  QueryResult,
  QueryHookOptions as QueryHookOptionsApollo,
} from "@apollo/client";
import { capitalCase } from "change-case";
import { DeepPartial, MarkRequired } from "ts-essentials";
import gql from "graphql-tag";

import {
  AccountCheckingPayMethodInputOptFragment as AccountCheckingPayMethodInputOpt,
  AccountPayMethodInputOptsQuery as AccountInputOpts,
  AccountPayMethodInputOptsQueryVariables as AccountInputOptsVars,
  PaymentMethodType,
  PaymentCardType,
  EntryType,
  AccountsWhere,
  PaymentMethodCard,
  AccountCard,
  PaymentCard,
  PaymentMethodCheck,
  PaymentCheck,
  AccountCheck,
  PaymentMethodCash,
  PaymentMethodOnline,
  PaymentMethodCombination,
  PaymentMethodUnknown,
  AccountCardPayMethodInputOptFragment as AccountCardPayMethodInputOpt,
} from "../../apollo/graphTypes";
import { QueryHookOptions } from "./shared";

export type PayMethodIniValue =
  | (Required<Pick<PaymentMethodCard, "__typename" | "currency">> & {
      card:
        | Required<Extract<PaymentMethodCard["card"], PaymentCard>>
        | Required<
            Pick<
              Extract<PaymentMethodCard["card"], AccountCard>,
              "__typename" | "id"
            >
          >;
    })
  | (Required<Pick<PaymentMethodCheck, "__typename" | "currency">> & {
      check:
        | Required<Extract<PaymentMethodCheck["check"], PaymentCheck>>
        | (Required<
            Pick<
              Extract<PaymentMethodCheck["check"], AccountCheck>,
              "__typename" | "checkNumber"
            >
          > & {
            account: Required<
              Pick<
                Extract<PaymentMethodCheck["check"], AccountCheck>["account"],
                "id"
              >
            >;
          });
    })
  | MarkRequired<DeepPartial<PaymentMethodCash>, "__typename" | "currency">
  | MarkRequired<DeepPartial<PaymentMethodOnline>, "__typename" | "currency">
  | MarkRequired<
      DeepPartial<PaymentMethodCombination>,
      "__typename" | "currency"
    >
  | MarkRequired<DeepPartial<PaymentMethodUnknown>, "__typename" | "currency">;

export type PayMethodInputOpt =
  | AccountCardPayMethodInputOpt
  | PaymentMethodType.Cash
  | PaymentMethodType.Combination
  | PaymentMethodType.Online
  | PaymentMethodType.Unknown;

export type PaymentMethodInputBranchOpt =
  | Exclude<PaymentMethodType, PayMethodInputOpt>
  | PaymentCardType
  | AccountCheckingPayMethodInputOpt;

/* export type PayMethodTypeToInputArg =
  | (Pick<Required<PaymentMethodCard>, "__typename" | "currency"> & {
      card:
        | Pick<
            Required<Extract<PaymentMethodCard["card"], PaymentCard>>,
            "__typename" | "trailingDigits" | "type"
          >
        | Required<
            Pick<
              Extract<PaymentMethodCard["card"], AccountCard>,
              "__typename" | "id" | "type"
            >
          >;
    })
  | (Pick<Required<PaymentMethodCheck>, "__typename" | "currency"> & {
      check:
        | Pick<
            Required<Extract<PaymentMethodCheck["check"], PaymentCheck>>,
            "__typename" | "checkNumber"
          >
        | (Pick<
            Required<Extract<PaymentMethodCheck["check"], AccountCheck>>,
            "__typename" | "checkNumber"
          > & {
            account: Pick<
              Required<
                Extract<PaymentMethodCheck["check"], AccountCheck>["account"]
              >,
              "__typename" | "id"
            >;
          });
    })
  | Pick<Required<PaymentMethodCash>, "__typename" | "currency">
  | Pick<Required<PaymentMethodOnline>, "__typename" | "currency">
  | Pick<Required<PaymentMethodCombination>, "__typename" | "currency">
  | Pick<Required<PaymentMethodUnknown>, "__typename" | "currency">;

export const payMethodTypeToInput = (payMethod: PayMethodTypeToInputArg) => {
  switch (payMethod.__typename) {
    case "PaymentMethodCard":
      if (payMethod.card.__typename === "AccountCard") {
        return {
          accountCard: {
            currency: payMethod.currency,
            card: payMethod.card.id,
          },
        };
      } else {
        return {
          card: {
            currency: payMethod.currency,
            card: {
              trailingDigits: payMethod.card.trailingDigits,
              type: payMethod.card.type,
            },
          },
        };
      }
    case "PaymentMethodCheck":
      if (payMethod.check.__typename === "AccountCheck") {
        return {
          accountCheck: {
            currency: payMethod.currency,
            check: {
              checkNumber: payMethod.check.checkNumber,
              account: payMethod.check.account.id,
            },
          },
        };
      } else {
        return {
          check: {
            currency: payMethod.currency,
            check: {
              checkNumber: payMethod.check.checkNumber,
            },
          },
        };
      }
    case "PaymentMethodCash":
      return {
        cash: {
          currency: payMethod.currency,
        },
      };
    case "PaymentMethodCombination":
      return {
        combination: {
          currency: payMethod.currency,
        },
      };
    case "PaymentMethodOnline":
      return {
        online: {
          currency: payMethod.currency,
        },
      };
    case "PaymentMethodUnknown":
      return {
        unknown: {
          currency: payMethod.currency,
        },
      };
  }
}; */

const PAY_METHOD_INPUT_OPTS_FRAGMENTS = gql`
  fragment AccountCardPayMethodInputOpt on AccountCard {
    __typename
    id
    active
    type
    trailingDigits
  }

  fragment AccountOwnerPayMethodInputOpt on Entity {
    __typename
    ... on Business {
      id
      name
    }
    ... on Department {
      id
      name
    }
    ... on Person {
      id
      personName: name {
        first
        last
      }
    }
  }

  fragment AccountCheckingPayMethodInputOpt on AccountChecking {
    __typename
    id
    accountNumber
    active
    cards {
      ...AccountCardPayMethodInputOpt
    }
    name
    owner {
      ...AccountOwnerPayMethodInputOpt
    }
  }

  fragment AccountCreditCardPayMethodInputOpt on AccountCreditCard {
    __typename
    id
    active
    cards {
      ...AccountCardPayMethodInputOpt
    }
    name
    owner {
      ...AccountOwnerPayMethodInputOpt
    }
  }
`;

const PAY_METHOD_INPUT_OPTS = gql`
  query AccountPayMethodInputOpts($where: AccountsWhere!) {
    accounts(where: $where) {
      ...AccountCheckingPayMethodInputOpt
      ...AccountCreditCardPayMethodInputOpt
    }
  }
  ${PAY_METHOD_INPUT_OPTS_FRAGMENTS}
`;

export type PayMethodTreeSelectProps = TreeSelectProps<
  PayMethodInputOpt,
  PaymentMethodInputBranchOpt,
  undefined,
  undefined,
  true | false
>;

export const getOptionLabel: NonNullable<
  PayMethodTreeSelectProps["getOptionLabel"]
> = (option) => {
  if (option instanceof FreeSoloValue) {
    return option.toString();
  }

  const opt = option instanceof BranchOption ? option.option : option;

  if (typeof opt === "string") {
    return capitalCase(opt);
  } else if (opt.__typename === "AccountChecking") {
    return `Acct# ...${opt.accountNumber?.slice(-4)}`;
  } else {
    return opt.trailingDigits;
  }
};

export const getOptionSelected: NonNullable<
  PayMethodTreeSelectProps["getOptionSelected"]
> = (option, value) => {
  if (typeof option === "string" || typeof value === "string") {
    return option === value;
  } else {
    return option.id === value.id;
  }
};

export const getCardTypeAbbreviation = (cardType: PaymentCardType): string => {
  switch (cardType) {
    case PaymentCardType.Visa:
      return "VISA";
    case PaymentCardType.MasterCard:
      return "MC";
    case PaymentCardType.AmericanExpress:
      return "AMEX";
    case PaymentCardType.Discover:
      return "DS";
  }
};

const defaultOptions: (
  | PayMethodInputOpt
  | BranchOption<PaymentMethodInputBranchOpt>
)[] = [
  new BranchOption(PaymentMethodType.Card),
  new BranchOption(PaymentMethodType.Check),
  PaymentMethodType.Cash,
  PaymentMethodType.Combination,
  PaymentMethodType.Online,
];

const paymentCardOptions: BranchOption<PaymentCardType>[] = [
  new BranchOption(PaymentCardType.Visa),
  new BranchOption(PaymentCardType.MasterCard),
  new BranchOption(PaymentCardType.AmericanExpress),
  new BranchOption(PaymentCardType.Discover),
];

export interface UsePaymentMethodTreeOptions {
  accountsWhere: AccountsWhere;
  type?: EntryType;
  isRefund?: boolean;
  queryHookOptions?: QueryHookOptions;
  iniValue?: PayMethodIniValue;
}

export type TreeSelectParams = Required<
  Pick<
    PayMethodTreeSelectProps,
    "branchPath" | "freeSolo" | "onBranchChange" | "options"
  >
>;

export const usePaymentMethodTree = (
  options: UsePaymentMethodTreeOptions
): {
  iniValue?: Exclude<PayMethodTreeSelectProps["value"], null>;
  treeSelectParams: TreeSelectParams;
  queryResult: QueryResult<AccountInputOpts, AccountInputOptsVars>;
} => {
  const {
    accountsWhere,
    type,
    isRefund = false,
    // onChange: onChangeArg,
    queryHookOptions = {},
  } = options;

  interface State {
    branchPath: NonNullable<PayMethodTreeSelectProps["branchPath"]>;
    iniValue?: {
      iniValue: PayMethodIniValue;
      value?: Exclude<PayMethodTreeSelectProps["value"], null>;
    };
    type?: EntryType;
    variables: AccountInputOptsVars;
  }

  const [state, setState] = useState<State>(() => {
    const iniValue = options.iniValue;

    const state: State = {
      branchPath: [],
      type,
      variables: {
        where: options.accountsWhere,
      },
    };

    if (iniValue) {
      switch (iniValue.__typename) {
        case "PaymentMethodCash":
          state.iniValue = {
            iniValue,
            value: PaymentMethodType.Cash,
          };
          break;
        case "PaymentMethodCombination":
          state.iniValue = {
            iniValue,
            value: PaymentMethodType.Combination,
          };
          break;
        case "PaymentMethodUnknown":
          state.iniValue = {
            iniValue,
            value: PaymentMethodType.Unknown,
          };
          break;
        case "PaymentMethodOnline":
          state.iniValue = {
            iniValue,
            value: PaymentMethodType.Online,
          };
          break;
        case "PaymentMethodCard":
          if (iniValue.card.__typename === "PaymentCard") {
            state.branchPath.push(
              new BranchOption(PaymentMethodType.Card),
              new BranchOption(iniValue.card.type)
            );
            state.iniValue = {
              iniValue,
              value: new FreeSoloValue(iniValue.card.trailingDigits),
            };
          } else {
            state.iniValue = {
              iniValue,
            };
            state.variables.where = {
              or: [
                state.variables.where,
                {
                  cards: {
                    id: {
                      eq: iniValue.card.id,
                    },
                  },
                },
              ],
            };
          }
          break;
        case "PaymentMethodCheck":
          if (iniValue.check.__typename === "PaymentCheck") {
            state.branchPath.push(new BranchOption(PaymentMethodType.Check));
            state.iniValue = {
              iniValue,
              value: new FreeSoloValue(iniValue.check.checkNumber),
            };
          } else {
            state.iniValue = {
              iniValue,
            };
            state.variables.where = {
              or: [
                state.variables.where,
                {
                  id: {
                    eq: iniValue.check.account.id,
                  },
                },
              ],
            };
          }
          break;
      }
    }

    return state;
  });

  useEffect(() => {
    if (state.type && state.type !== type) {
      setState((state) => ({
        ...state,
        branchPath: [],
        type,
      }));
    }
  }, [type, state.type, setState]);

  const queryResult = useQuery<AccountInputOpts, AccountInputOptsVars>(
    PAY_METHOD_INPUT_OPTS,
    {
      variables: {
        where: accountsWhere,
      },
      ...queryHookOptions,
      onCompleted: useCallback<
        NonNullable<QueryHookOptionsApollo<AccountInputOpts>["onCompleted"]>
      >(
        (data) => {
          if (state.iniValue && !state.iniValue?.value) {
            const iniValue = state.iniValue.iniValue;

            // PaymentMethodCard and PaymentMethodCheck with AccountCard and
            // AccountCheck, are the only 2 that require lookup.
            if (iniValue.__typename === "PaymentMethodCard") {
              const card = iniValue.card;
              if (card.__typename === "AccountCard") {
                const accountCard = (() => {
                  for (const account of data.accounts) {
                    for (const accountCard of account.cards) {
                      if (accountCard.id === card.id) {
                        return accountCard;
                      }
                    }
                  }
                })() as AccountCardPayMethodInputOpt;

                setState((state) => ({
                  ...state,
                  branchPath: [
                    new BranchOption(PaymentMethodType.Card),
                    new BranchOption(accountCard.type),
                  ],
                  iniValue: {
                    ...(state.iniValue || {}),
                    value: accountCard,
                  } as State["iniValue"],
                }));
              }
            } else if (iniValue.__typename === "PaymentMethodCheck") {
              const check = iniValue.check;
              if (check.__typename === "AccountCheck") {
                for (const account of data.accounts) {
                  if (
                    account.__typename === "AccountChecking" &&
                    account.id === check.account.id
                  ) {
                    setState((state) => ({
                      ...state,
                      branchPath: [
                        new BranchOption(PaymentMethodType.Check),
                        new BranchOption(account),
                      ],
                      iniValue: {
                        ...(state.iniValue || {}),
                        value: new FreeSoloValue(check.checkNumber),
                      } as State["iniValue"],
                    }));

                    break;
                  }
                }
              }
            }
          }

          if (queryHookOptions.onCompleted) {
            queryHookOptions.onCompleted(data);
          }
        },
        [queryHookOptions.onCompleted, state.iniValue]
      ),
      skip:
        type === undefined ||
        type === EntryType.Credit ||
        !!queryHookOptions.skip,
    }
  );

  const onBranchChange = useCallback<
    NonNullable<PayMethodTreeSelectProps["onBranchChange"]>
  >(
    (...[, , branchPath]) =>
      setState((state) => ({
        ...state,
        branchPath,
      })),
    [setState]
  );

  const treeSelectParams = useMemo<
    Pick<TreeSelectParams, "options" | "freeSolo">
  >(() => {
    const treeSelectParams: Pick<TreeSelectParams, "options" | "freeSolo"> = {
      options: [],
      freeSolo: false,
    };

    if (type === undefined) {
      return treeSelectParams;
    } else if (!state.branchPath.length) {
      treeSelectParams.options = defaultOptions;
    } else {
      const curBranchOpt = state.branchPath[state.branchPath.length - 1].option;

      if (typeof curBranchOpt === "string") {
        switch (curBranchOpt) {
          case PaymentMethodType.Card:
            treeSelectParams.options = paymentCardOptions;
            break;
          case PaymentMethodType.Check:
            if (type === EntryType.Debit && !isRefund) {
              treeSelectParams.options = (
                queryResult.data?.accounts || []
              ).reduce((options, account) => {
                if (
                  account.__typename === "AccountChecking" &&
                  account.active
                ) {
                  options.push(new BranchOption(account));
                }

                return options;
              }, [] as BranchOption<AccountCheckingPayMethodInputOpt>[]);
            } else {
              treeSelectParams.freeSolo = true;
            }
            break;

          // Only PaymentMethodType Card and Check are branch options.
          case PaymentCardType.Visa:
          case PaymentCardType.MasterCard:
          case PaymentCardType.AmericanExpress:
          case PaymentCardType.Discover:
            if (type === EntryType.Debit) {
              treeSelectParams.options = (
                queryResult.data?.accounts || []
              ).reduce((options, account) => {
                if (account.active) {
                  options.push(
                    ...account.cards.filter(
                      ({ active, type }) => active && type === curBranchOpt
                    )
                  );
                }

                return options;
              }, [] as AccountCardPayMethodInputOpt[]);
            } else {
              treeSelectParams.freeSolo = true;
            }
            break;

          default:
            break;
        }
      } else if (curBranchOpt.__typename === "AccountChecking") {
        treeSelectParams.freeSolo = true;
      }
    }

    return treeSelectParams;
  }, [type, isRefund, queryResult.data?.accounts, state.branchPath]);

  return {
    iniValue: state.iniValue?.value,
    treeSelectParams: {
      ...treeSelectParams,
      onBranchChange,
      branchPath: state.branchPath,
    },
    queryResult,
  };
};
