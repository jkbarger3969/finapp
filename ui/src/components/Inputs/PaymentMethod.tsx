import React, { useCallback, useMemo, useState, forwardRef, Ref } from "react";
import TreeSelect, {
  ValueNode,
  BranchNode,
  FreeSoloNode,
  TreeSelectProps,
  defaultInput,
  mergeInputStartAdornment,
  DefaultOption,
  TreeSelectValue,
} from "mui-tree-select";
import { ApolloError, gql, QueryHookOptions, useQuery } from "@apollo/client";
import { DeepPartial, MarkOptional, MarkRequired } from "ts-essentials";
import { capitalCase } from "change-case";
import { Control, UseControllerProps } from "react-hook-form";

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
import { LoadingDefaultBlank } from "./shared";
import { useControlled } from "@material-ui/core";
import { useController } from "../../utils/reactHookForm";

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

export type PaymentMethodInputBaseProps<
  Multiple extends boolean | undefined = undefined,
  DisableClearable extends boolean | undefined = undefined
> = MarkOptional<
  MarkRequired<
    Omit<
      PayMethodTreeSelectProps<Multiple, DisableClearable>,
      "branch" | "options" | "defaultValue"
    >,
    "onChange" | "value"
  >,
  "onBranchChange"
> & {
  accounts: AccountsWhere;
  entryType: EntryType | null;
  isRefund: boolean;
};

export const PaymentMethodInputBase = forwardRef(
  function PaymentMethodInputBase<
    Multiple extends boolean | undefined = undefined,
    DisableClearable extends boolean | undefined = undefined
  >(
    props: PaymentMethodInputBaseProps<Multiple, DisableClearable>,
    ref: Ref<unknown>
  ): JSX.Element {
    const {
      accounts: accountsWhere,
      autoSelect,
      entryType,
      isRefund,
      renderInput: renderInputProp = defaultInput,
      inputValue: inputValueProp,
      onBranchChange: onBranchChangeProp,
      onInputChange: onInputChangeProp,
      disabled,
      ...rest
    } = props;

    const entryTypeIsUndefined = (entryType ?? NULLISH) === NULLISH;

    const [inputValue, setInputValue] = useControlled({
      controlled: inputValueProp,
      default: "",
      name: "PaymentMethodInputBase",
      state: "inputValue",
    });

    const [state, setState] = useState<{
      branch: BranchNode<PaymentMethodInputBranchOpt> | null;
      checkingAccountBranchOpts: BranchNode<PaymentMethodInputBranchOpt>[];
      cardOpts: Map<PaymentCardType, AccountCardPayMethodInputOpt[]>;
    }>({
      branch: props.value instanceof ValueNode ? props.value.parent : null,
      checkingAccountBranchOpts: [],
      cardOpts: new Map<PaymentCardType, AccountCardPayMethodInputOpt[]>(),
    });

    const queryResult = useQuery<AccountInputOpts, AccountInputOptsVars>(
      PAY_METHOD_INPUT_OPTS,
      useMemo<QueryHookOptions<AccountInputOpts, AccountInputOptsVars>>(
        () => ({
          variables: {
            where: accountsWhere,
          },
          onCompleted: (data) => {
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

            setState((state) => ({
              ...state,
              checkingAccountBranchOpts,
              cardOpts,
            }));
          },
        }),
        [accountsWhere]
      )
    );

    const onBranchChange = useCallback<
      NonNullable<PayMethodTreeSelectProps["onBranchChange"]>
    >(
      (...args) => {
        setInputValue("");

        if (onInputChangeProp) {
          onInputChangeProp(args[0], "", "reset");
        }

        setState((state) => ({
          ...state,
          branch: args[1],
        }));

        if (onBranchChangeProp) {
          onBranchChangeProp(...args);
        }
      },
      [setInputValue, onInputChangeProp, onBranchChangeProp]
    );

    const onInputChange = useCallback<
      NonNullable<PayMethodTreeSelectProps["onInputChange"]>
    >(
      (...args) => {
        setInputValue(args[1]);

        if (onInputChangeProp) {
          onInputChangeProp(...args);
        }
      },
      [setInputValue, onInputChangeProp]
    );

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
        renderInputProp(
          (() => {
            const inputProps = {
              name: "paymentMethod",
              ...(entryTypeIsUndefined
                ? {
                    helperText: "Category Required",
                  }
                : {}),
              ...params,
            } as typeof params;

            const error = queryResult.error
              ? {
                  error: true,
                  helperText: (queryResult.error as ApolloError).message,
                }
              : {};

            const curBranch = state.branch?.valueOf();

            if (typeof curBranch === "string") {
              switch (curBranch) {
                case PaymentMethodType.Check:
                  if (entryType === EntryType.Credit) {
                    return {
                      ...inputProps,
                      placeholder: "####",
                      InputProps: mergeInputStartAdornment(
                        "append",
                        "CK-",
                        inputProps.InputProps || {}
                      ),
                      ...error,
                    };
                  }
                  break;
                case PaymentCardType.AmericanExpress:
                case PaymentCardType.Discover:
                case PaymentCardType.MasterCard:
                case PaymentCardType.Visa:
                  return {
                    ...inputProps,
                    placeholder:
                      entryType === EntryType.Credit && !isRefund
                        ? "Last 4 Digits"
                        : undefined,
                    InputProps: mergeInputStartAdornment(
                      "append",
                      `${getCardTypeAbbreviation(curBranch)}-`,
                      inputProps.InputProps || {}
                    ),
                    ...error,
                  };
              }
            } else if (curBranch?.__typename === "AccountChecking") {
              return {
                ...inputProps,
                placeholder: "####",
                InputProps: mergeInputStartAdornment(
                  "append",
                  "CK-",
                  inputProps.InputProps || {}
                ),
                ...error,
              };
            }

            return inputProps;
          })()
        ),
      [
        isRefund,
        entryType,
        entryTypeIsUndefined,
        renderInputProp,
        queryResult.error,
        state.branch,
      ]
    );

    const [options, freeSolo] = useMemo<
      [options: PayMethodTreeSelectProps["options"], freeSolo: boolean]
    >(() => {
      const curBranch = state.branch?.valueOf();

      if (queryResult.loading || entryTypeIsUndefined) {
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
      state.checkingAccountBranchOpts,
      state.cardOpts,
      state.branch,
    ]);

    if (queryResult.loading) {
      return <LoadingDefaultBlank {...rest} renderInput={renderInput} />;
    }

    return (
      <TreeSelect<
        PayMethodInputOpt,
        PaymentMethodInputBranchOpt,
        Multiple,
        DisableClearable,
        true | false
      >
        getOptionLabel={getOptionLabel}
        getOptionSelected={getOptionSelected}
        {...rest}
        disabled={disabled || entryTypeIsUndefined}
        autoSelect={!!autoSelect || freeSolo}
        ref={ref}
        options={options}
        onBranchChange={onBranchChange}
        branch={state.branch}
        renderOption={renderOption}
        renderInput={renderInput}
        freeSolo={freeSolo}
        onInputChange={onInputChange}
        inputValue={inputValue}
      />
    );
  }
);

export type PaymentMethodInputProps<
  Multiple extends boolean | undefined = undefined,
  DisableClearable extends boolean | undefined = undefined
> = {
  defaultValue?: PayMethodIniValue;
  control?: Control;
  namePrefix?: string;
  rules?: UseControllerProps["rules"];
} & Omit<
  PaymentMethodInputBaseProps<Multiple, DisableClearable>,
  "onChange" | "value" | "name"
>;

export const PAYMENT_METHOD_NAME = "paymentMethod";
export const paymentMethodName = (namePrefix?: string): string =>
  namePrefix ? `${namePrefix}.${PAYMENT_METHOD_NAME}` : PAYMENT_METHOD_NAME;

const PaymentMethodInputControlled = forwardRef(
  function PaymentMethodInputControlled<
    Multiple extends boolean | undefined = undefined,
    DisableClearable extends boolean | undefined = undefined
  >(
    props: Omit<
      PaymentMethodInputProps<Multiple, DisableClearable>,
      "defaultValue"
    > & {
      defaultValue: TreeSelectValue<
        PayMethodInputOpt,
        PaymentMethodInputBranchOpt,
        Multiple,
        false,
        false | true
      >;
    },
    ref: Ref<unknown>
  ): JSX.Element {
    const {
      control,
      namePrefix: namePrefixProp,
      defaultValue,
      renderInput: renderInputProp = defaultInput,
      disabled,
      onBlur: onBlurProp,
      rules,
      ...rest
    } = props;

    const {
      field: {
        onBlur: onBlurControlled,
        name,
        onChange: onChangeControlled,
        ref: inputRef,
        ...field
      },
      fieldState: { isTouched, error },
      formState: { isSubmitting, isValidating },
    } = useController({
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      name: paymentMethodName(namePrefixProp) as any,
      control,
      defaultValue,
      rules,
      shouldUnregister: true,
    });

    const handleBlur = useCallback<
      NonNullable<PaymentMethodInputBaseProps["onBlur"]>
    >(
      (...args) => {
        onBlurControlled();
        if (onBlurProp) {
          onBlurProp(...args);
        }
      },
      [onBlurControlled, onBlurProp]
    );

    const renderInput = useCallback<
      NonNullable<PaymentMethodInputBaseProps["renderInput"]>
    >(
      (params) =>
        renderInputProp({
          ...params,
          inputRef,
          name,
          ...(isTouched && error
            ? {
                error: true,
                helperText: error?.message || "Invalid",
              }
            : {}),
        }),
      [renderInputProp, inputRef, name, isTouched, error]
    );

    const handleChange = useCallback<
      NonNullable<
        PaymentMethodInputBaseProps<Multiple, DisableClearable>["onChange"]
      >
    >(
      (_, value) => {
        onChangeControlled(value);
      },
      [onChangeControlled]
    );

    return (
      <PaymentMethodInputBase
        {...rest}
        {...field}
        disabled={isValidating || isSubmitting || disabled}
        ref={ref}
        onChange={handleChange}
        renderInput={renderInput}
        onBlur={handleBlur}
      />
    );
  }
);

export const PaymentMethodInput = forwardRef(function PaymentMethodInput<
  Multiple extends boolean | undefined = undefined,
  DisableClearable extends boolean | undefined = undefined
>(
  props: PaymentMethodInputProps<Multiple, DisableClearable>,
  ref: Ref<unknown>
): JSX.Element {
  const {
    renderInput: renderInputProp = defaultInput,
    defaultValue: defaultValueProp,
    ...rest
  } = props;

  const { loading, error, data } = useQuery<
    AccountInputOpts,
    AccountInputOptsVars
  >(
    PAY_METHOD_INPUT_OPTS,
    useMemo<QueryHookOptions<AccountInputOpts, AccountInputOptsVars>>(() => {
      if (
        defaultValueProp?.__typename === "PaymentMethodCard" &&
        defaultValueProp.card.__typename === "AccountCard"
      ) {
        return {
          variables: {
            where: {
              cards: {
                id: {
                  eq: defaultValueProp.card.id,
                },
              },
            },
          },
        };
      } else if (
        defaultValueProp?.__typename === "PaymentMethodCheck" &&
        defaultValueProp.check.__typename === "AccountCheck"
      ) {
        return {
          variables: {
            where: {
              id: {
                eq: defaultValueProp.check.account.id,
              },
            },
          },
        };
      }

      return {
        skip: true,
      };
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [
      defaultValueProp?.__typename,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any, react-hooks/exhaustive-deps,
      (defaultValueProp as any)?.card?.__typename,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any, react-hooks/exhaustive-deps,
      (defaultValueProp as any)?.card?.id,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any, react-hooks/exhaustive-deps,
      (defaultValueProp as any)?.check?.__typename,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any, react-hooks/exhaustive-deps,
      (defaultValueProp as any)?.check?.account?.id,
    ])
  );

  const renderInput = useCallback<
    NonNullable<PayMethodTreeSelectProps["renderInput"]>
  >(
    (params) =>
      renderInputProp({
        ...params,
        ...(error
          ? {
              error: true,
              helperText: error.message,
            }
          : {}),
      }),
    [renderInputProp, error]
  );

  const defaultValue = useMemo(() => {
    switch (defaultValueProp?.__typename) {
      case "PaymentMethodCash":
        return new ValueNode<PayMethodInputOpt, PaymentMethodInputBranchOpt>(
          PaymentMethodType.Cash
        );
      case "PaymentMethodCombination":
        return new ValueNode<PayMethodInputOpt, PaymentMethodInputBranchOpt>(
          PaymentMethodType.Combination
        );
      case "PaymentMethodOnline":
        return new ValueNode<PayMethodInputOpt, PaymentMethodInputBranchOpt>(
          PaymentMethodType.Online
        );
      case "PaymentMethodUnknown":
        return new ValueNode<PayMethodInputOpt, PaymentMethodInputBranchOpt>(
          PaymentMethodType.Unknown
        );
      case "PaymentMethodCard":
        {
          const iniCard = defaultValueProp.card;

          if (iniCard.__typename === "AccountCard") {
            for (const account of data?.accounts || []) {
              for (const card of account.cards) {
                if (card.id === iniCard.id) {
                  return new ValueNode<
                    PayMethodInputOpt,
                    PaymentMethodInputBranchOpt
                  >(card, new BranchNode(card.type, cardBranch));
                }
              }
            }
          } else {
            return new FreeSoloNode<PaymentMethodInputBranchOpt>(
              iniCard.trailingDigits,
              new BranchNode(iniCard.type, cardBranch)
            );
          }
        }
        break;
      case "PaymentMethodCheck":
        {
          const iniCheck = defaultValueProp.check;

          if (iniCheck.__typename === "AccountCheck") {
            for (const account of data?.accounts || []) {
              if (
                account.__typename === "AccountChecking" &&
                account.id === iniCheck.account.id
              ) {
                return new FreeSoloNode<PaymentMethodInputBranchOpt>(
                  iniCheck.checkNumber,
                  new BranchNode(account, checkBranch)
                );
              }
            }
          }
        }
        break;
    }

    return props.multiple ? [] : null;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    data?.accounts,
    defaultValueProp?.__typename,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any, react-hooks/exhaustive-deps
    (defaultValueProp as any)?.card,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any, react-hooks/exhaustive-deps
    (defaultValueProp as any)?.check,
    props.multiple,
  ]) as TreeSelectValue<
    PayMethodInputOpt,
    PaymentMethodInputBranchOpt,
    Multiple,
    false,
    true | false
  >;

  if (loading) {
    return <LoadingDefaultBlank {...rest} renderInput={renderInput} />;
  }

  return (
    <PaymentMethodInputControlled<Multiple, DisableClearable>
      {...rest}
      ref={ref}
      renderInput={renderInput}
      defaultValue={defaultValue}
    />
  );
});
