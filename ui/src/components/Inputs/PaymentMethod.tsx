import React, { useCallback, useMemo, useState } from "react";
import TreeSelect, {
  ValueNode,
  BranchNode,
  FreeSoloNode,
  TreeSelectProps,
  defaultInput,
  mergeInputEndAdornment,
  mergeInputStartAdornment,
  DefaultOption,
} from "mui-tree-select";
import { gql, QueryHookOptions, useQuery } from "@apollo/client";
import { DeepPartial, MarkRequired } from "ts-essentials";
import { capitalCase } from "change-case";
import CircularProgress from "@material-ui/core/CircularProgress";

import {
  AccountCard,
  PaymentCard,
  PaymentCheck,
  PaymentMethodCard,
  PaymentMethodCash,
  PaymentMethodCheck,
  PaymentMethodCombination,
  PaymentMethodOnline,
  PaymentMethodUnknown,
  AccountCardPayMethodInputOptFragment as AccountCardPayMethodInputOpt,
  PaymentMethodType,
  PaymentCardType,
  AccountCheckingPayMethodInputOptFragment as AccountCheckingPayMethodInputOpt,
  AccountsWhere,
  AccountCheck,
  AccountPayMethodInputOptsQuery as AccountInputOpts,
  AccountPayMethodInputOptsQueryVariables as AccountInputOptsVars,
  EntryType,
} from "../../apollo/graphTypes";

const NULLISH = Symbol("NULLISH");

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

export type PayMethodTreeSelectProps<
  Multiple extends boolean | undefined = undefined,
  DisableClearable extends boolean | undefined = undefined
> = TreeSelectProps<
  PayMethodInputOpt,
  PaymentMethodInputBranchOpt,
  Multiple,
  DisableClearable,
  true | false
>;

export const getOptionLabel: NonNullable<
  PayMethodTreeSelectProps<undefined, undefined>["getOptionLabel"]
> = (option) => {
  if (option instanceof FreeSoloNode) {
    return option.toString();
  }

  const opt = option.valueOf();

  if (typeof opt === "string") {
    return capitalCase(opt);
  } else if (opt.__typename === "AccountChecking") {
    return `Acct# ...${opt.accountNumber?.slice(-4)}`;
  } else {
    return opt.trailingDigits;
  }
};

export const getOptionLabelWithPrefixes: NonNullable<
  PayMethodTreeSelectProps<undefined, undefined>["getOptionLabel"]
> = (option) => {
  const optStr = getOptionLabel(option);

  if (option instanceof FreeSoloNode) {
    const curBranch = option.parent?.valueOf();
    if (curBranch) {
      if (typeof curBranch === "string") {
        switch (curBranch) {
          case PaymentMethodType.Check:
            return `CK-${optStr}`;
          case PaymentCardType.Visa:
          case PaymentCardType.MasterCard:
          case PaymentCardType.AmericanExpress:
          case PaymentCardType.Discover:
            return `${getCardTypeAbbreviation(curBranch)}-${optStr}`;
          default:
            break;
        }
      } else if (curBranch.__typename === "AccountChecking") {
        return `CK-${optStr}`;
      }
    }
    return optStr;
  }

  const opt = option.valueOf();

  if (typeof opt === "string" || opt.__typename === "AccountChecking") {
    return optStr;
  } else {
    return `${getCardTypeAbbreviation(opt.type)}-${optStr}`;
  }
};

export const getOptionSelected: NonNullable<
  PayMethodTreeSelectProps["getOptionSelected"]
> = (option, value) => {
  if (option instanceof FreeSoloNode || value instanceof FreeSoloNode) {
    return false;
  }

  const opt = option.valueOf();
  const val = value.valueOf();

  if (typeof opt === "string" || typeof val === "string") {
    return opt === val;
  } else {
    return opt.id === val.id;
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

const cardBranch = new BranchNode<PaymentMethodInputBranchOpt>(
  PaymentMethodType.Card
);

const checkBranch = new BranchNode<PaymentMethodInputBranchOpt>(
  PaymentMethodType.Check
);

const defaultOptions: (
  | PayMethodInputOpt
  | BranchNode<PaymentMethodInputBranchOpt>
)[] = [
  cardBranch,
  checkBranch,
  PaymentMethodType.Cash,
  PaymentMethodType.Combination,
  PaymentMethodType.Online,
];

const paymentCardBranchOpts: BranchNode<PaymentMethodInputBranchOpt>[] = [
  new BranchNode(PaymentCardType.Visa, cardBranch),
  new BranchNode(PaymentCardType.MasterCard, cardBranch),
  new BranchNode(PaymentCardType.AmericanExpress, cardBranch),
  new BranchNode(PaymentCardType.Discover, cardBranch),
];

export type PaymentMethodInputProps<
  Multiple extends boolean | undefined = undefined,
  DisableClearable extends boolean | undefined = undefined
> = {
  accounts: AccountsWhere;
  iniValue?: PayMethodIniValue;
  entryType: EntryType | null;
  isRefund: boolean;
  error?: string | Error;
} & MarkRequired<
  Pick<
    PayMethodTreeSelectProps<Multiple, DisableClearable>,
    | "renderInput"
    | "disabled"
    | "onChange"
    | "value"
    | "onBlur"
    | "fullWidth"
    | "autoSelect"
  >,
  "onChange" | "value"
>;

export const PaymentMethodInput = <
  Multiple extends boolean | undefined = undefined,
  DisableClearable extends boolean | undefined = undefined
>(
  props: PaymentMethodInputProps<Multiple, DisableClearable>
): JSX.Element => {
  const {
    renderInput: renderInputProp,
    disabled: disabledProp,
    onChange: onChangeProp,
    value: valueProp,
    entryType,
    isRefund,
    error: errorProp,
    autoSelect,
    ...rest
  } = props;

  const entryTypeIsUndefined = (entryType ?? NULLISH) === NULLISH;

  interface State {
    iniValue?:
      | ValueNode<PayMethodInputOpt, PaymentMethodInputBranchOpt>
      | FreeSoloNode<PaymentMethodInputBranchOpt>;
    inputValue: string;
    useIniValue: boolean;
    iniValueProp?: PayMethodIniValue;
    accountsWhere: AccountsWhere;
    branch: NonNullable<PayMethodTreeSelectProps["branch"]> | null;
    checkingAccountBranchOpts: BranchNode<PaymentMethodInputBranchOpt>[];
    cardOpts: Map<PaymentCardType, AccountCardPayMethodInputOpt[]>;
  }

  const [state, setState] = useState<State>(() => {
    const state = {
      branch: null,
      accountsWhere: props.accounts,
      inputValue: "",
      useIniValue: !!props.iniValue,
      iniValueProp: props.iniValue,
      checkingAccountBranchOpts: [],
      cardOpts: new Map<PaymentCardType, AccountCardPayMethodInputOpt[]>(),
    } as State;

    if (props.iniValue) {
      switch (props.iniValue.__typename) {
        case "PaymentMethodCard":
          if (props.iniValue.card.__typename === "AccountCard") {
            state.accountsWhere = {
              or: [
                props.accounts,
                {
                  cards: {
                    id: {
                      eq: props.iniValue.card.id,
                    },
                  },
                },
              ],
            };
          }
          break;
        case "PaymentMethodCheck":
          if (props.iniValue.check.__typename === "AccountCheck") {
            state.accountsWhere = {
              or: [
                props.accounts,
                {
                  id: {
                    eq: props.iniValue.check.account.id,
                  },
                },
              ],
            };
          }
          break;
        case "PaymentMethodCash":
        case "PaymentMethodCombination":
        case "PaymentMethodOnline":
        case "PaymentMethodUnknown":
          break;
      }
    }

    return state;
  });

  const value = useMemo<
    PayMethodTreeSelectProps<Multiple, DisableClearable>["value"]
  >(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (state.useIniValue ? state.iniValue : valueProp) ?? (null as any);
  }, [state.iniValue, state.useIniValue, valueProp]);

  const queryResult = useQuery<AccountInputOpts, AccountInputOptsVars>(
    PAY_METHOD_INPUT_OPTS,
    {
      variables: {
        where: state.accountsWhere,
      },
      onCompleted: useCallback<
        NonNullable<
          QueryHookOptions<
            AccountInputOpts,
            AccountInputOptsVars
          >["onCompleted"]
        >
      >(
        (data) => {
          const checkingAccountBranchOpts: BranchNode<PaymentMethodInputBranchOpt>[] = [];
          const cardOpts = new Map<
            PaymentCardType,
            AccountCardPayMethodInputOpt[]
          >();

          // Create checking account branch opts and account card opts.
          for (const account of data.accounts) {
            if (!account.active) {
              continue;
            }
            if (account.__typename === "AccountChecking") {
              checkingAccountBranchOpts.push(
                new BranchNode(account, checkBranch)
              );
            }

            for (const card of account.cards) {
              if (card.active) {
                const cards = cardOpts.get(card.type) || [];
                cards.push(card);
                cardOpts.set(card.type, cards);
              }
            }
          }

          if (state.useIniValue && state.iniValueProp && !state.iniValue) {
            let iniValue: State["iniValue"];

            switch (state.iniValueProp.__typename) {
              case "PaymentMethodCash":
                iniValue = new ValueNode(PaymentMethodType.Cash);
                break;
              case "PaymentMethodCombination":
                iniValue = new ValueNode(PaymentMethodType.Combination);
                break;
              case "PaymentMethodOnline":
                iniValue = new ValueNode(PaymentMethodType.Online);
                break;
              case "PaymentMethodUnknown":
                iniValue = new ValueNode(PaymentMethodType.Unknown);
                break;
              case "PaymentMethodCard":
                {
                  const iniCard = state.iniValueProp.card;

                  if (iniCard.__typename === "AccountCard") {
                    (() => {
                      for (const account of data.accounts) {
                        for (const card of account.cards) {
                          if (card.id === iniCard.id) {
                            iniValue = new ValueNode(card, [
                              PaymentMethodType.Card,
                              card.type,
                            ]);
                            return;
                          }
                        }
                      }
                    })();
                  } else {
                    iniValue = new FreeSoloNode(iniCard.trailingDigits, [
                      PaymentMethodType.Card,
                      iniCard.type,
                    ]);
                  }
                }
                break;
              case "PaymentMethodCheck":
                {
                  const branch: PaymentMethodInputBranchOpt[] = [
                    PaymentMethodType.Check,
                  ];

                  const iniCheck = state.iniValueProp.check;

                  if (iniCheck.__typename === "AccountCheck") {
                    for (const account of data.accounts) {
                      if (
                        account.__typename === "AccountChecking" &&
                        account.id === iniCheck.account.id
                      ) {
                        branch.push(account);
                        break;
                      }
                    }
                    iniValue = new FreeSoloNode(iniCheck.checkNumber, branch);
                  }
                }
                break;
            }

            if (iniValue) {
              setState((state) => ({
                ...state,
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                branch: (iniValue as any).parent,
                iniValue,
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                inputValue: getOptionLabel(iniValue as any),
                checkingAccountBranchOpts,
                cardOpts,
              }));
              return;
            }
          }

          setState((state) => ({
            ...state,
            checkingAccountBranchOpts,
            cardOpts,
          }));
        },
        [state.iniValue, state.useIniValue, state.iniValueProp]
      ),
    }
  );

  const onBranchChange = useCallback<
    NonNullable<PayMethodTreeSelectProps["onBranchChange"]>
  >((_, branch) => {
    setState((state) => ({
      ...state,
      inputValue: "",
      branch,
    }));
  }, []);

  const onInputChange = useCallback<
    NonNullable<PayMethodTreeSelectProps["onInputChange"]>
  >((...[, inputValue]) => {
    setState((state) => ({
      ...state,
      inputValue,
    }));
  }, []);

  const renderOption = useCallback<
    NonNullable<PayMethodTreeSelectProps["renderOption"]>
  >(
    (option) => {
      if (option instanceof BranchNode) {
        return (
          <DefaultOption
            option={option}
            curBranch={state.branch}
            getOptionLabel={getOptionLabel}
          />
        );
      } else {
        return (
          <DefaultOption
            option={option}
            curBranch={state.branch}
            getOptionLabel={getOptionLabelWithPrefixes}
          />
        );
      }
    },
    [state.branch]
  );

  const renderInput = useCallback<
    NonNullable<PayMethodTreeSelectProps["renderInput"]>
  >(
    (params) =>
      (renderInputProp || defaultInput)(
        (() => {
          if (entryTypeIsUndefined) {
            return {
              ...params,
              helperText: "Category Required",
              name: "paymentMethod",
            };
          } else if (queryResult.loading && state.useIniValue) {
            return {
              ...params,
              InputProps: mergeInputEndAdornment(
                "append",
                <CircularProgress size={20} color="inherit" />,
                params.InputProps || {}
              ),
              name: "paymentMethod",
            };
          }

          const errorMsg =
            typeof errorProp === "string"
              ? errorProp.trim()
              : errorProp?.message || "";

          const errorObj =
            queryResult.error || errorMsg
              ? {
                  error: true,
                  helperText: queryResult.error?.message || errorMsg,
                }
              : {};

          const curBranch = state.branch?.valueOf();

          if (typeof curBranch === "string") {
            switch (curBranch) {
              case PaymentMethodType.Check:
                if (entryType === EntryType.Credit) {
                  return {
                    ...params,
                    placeholder: "####",
                    InputProps: mergeInputStartAdornment(
                      "append",
                      "CK-",
                      params.InputProps || {}
                    ),
                    name: "paymentMethod",
                    ...errorObj,
                  };
                }
                break;
              case PaymentCardType.AmericanExpress:
              case PaymentCardType.Discover:
              case PaymentCardType.MasterCard:
              case PaymentCardType.Visa:
                return {
                  ...params,
                  placeholder:
                    entryType === EntryType.Credit && !isRefund
                      ? "Last 4 Digits"
                      : undefined,
                  InputProps: mergeInputStartAdornment(
                    "append",
                    `${getCardTypeAbbreviation(curBranch)}-`,
                    params.InputProps || {}
                  ),
                  name: "paymentMethod",
                  ...errorObj,
                };
            }
          } else if (curBranch?.__typename === "AccountChecking") {
            return {
              ...params,
              placeholder: "####",
              InputProps: mergeInputStartAdornment(
                "append",
                "CK-",
                params.InputProps || {}
              ),
              name: "paymentMethod",
              ...errorObj,
            };
          }
          return { ...params, name: "paymentMethod", ...errorObj };
        })()
      ),
    [
      isRefund,
      entryType,
      entryTypeIsUndefined,
      renderInputProp,
      state.useIniValue,
      queryResult.error,
      queryResult.loading,
      state.branch,
      errorProp,
    ]
  );

  const [options, freeSolo] = useMemo<
    [options: PayMethodTreeSelectProps["options"], freeSolo: boolean]
  >(() => {
    const curBranch = state.branch?.valueOf();

    if ((queryResult.loading && state.useIniValue) || entryTypeIsUndefined) {
      return [[], false];
    } else if (!curBranch) {
      return [defaultOptions, false];
    } else if (typeof curBranch === "string") {
      switch (curBranch) {
        case PaymentMethodType.Card:
          return [paymentCardBranchOpts, false];
        case PaymentMethodType.Check:
          if (entryType === EntryType.Credit) {
            return [[], true];
          } else {
            return [state.checkingAccountBranchOpts, false];
          }
        case PaymentCardType.AmericanExpress:
        case PaymentCardType.Discover:
        case PaymentCardType.MasterCard:
        case PaymentCardType.Visa:
          if (entryType === EntryType.Credit && !isRefund) {
            return [[], true];
          } else {
            return [state.cardOpts.get(curBranch) || [], false];
          }
      }
    } /* if(curBranch.__typename === "AccountChecking") */ else {
      return [[], true];
    }
  }, [
    isRefund,
    entryTypeIsUndefined,
    entryType,
    queryResult.loading,
    state.useIniValue,
    state.checkingAccountBranchOpts,
    state.cardOpts,
    state.branch,
  ]);

  const onChange = useCallback<
    NonNullable<
      PayMethodTreeSelectProps<Multiple, DisableClearable>["onChange"]
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

  return (
    <TreeSelect<
      PayMethodInputOpt,
      PaymentMethodInputBranchOpt,
      Multiple,
      DisableClearable,
      true | false
    >
      {...rest}
      onBranchChange={onBranchChange}
      branch={state.branch}
      getOptionLabel={getOptionLabel}
      getOptionSelected={getOptionSelected}
      disabled={disabledProp || queryResult.loading || entryTypeIsUndefined}
      loading={queryResult.loading}
      onInputChange={onInputChange}
      inputValue={state.inputValue}
      renderInput={renderInput}
      renderOption={renderOption}
      options={options}
      freeSolo={freeSolo}
      autoSelect={!!autoSelect || freeSolo}
      onChange={onChange}
      value={value}
    />
  );
};
