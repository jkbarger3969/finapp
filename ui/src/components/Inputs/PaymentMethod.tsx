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
import { MarkOptional, MarkRequired } from "ts-essentials";
import { capitalCase } from "change-case";

import {
  PayMethodDefaultValueFragment,
  AccountCardPayMethodInputOptFragment as AccountCardPayMethodInputOpt,
  PaymentMethodType,
  PaymentCardType,
  AccountCheckingPayMethodInputOptFragment as AccountCheckingPayMethodInputOpt,
  AccountsWhere,
  AccountPayMethodInputOptsQuery as AccountInputOpts,
  AccountPayMethodInputOptsQueryVariables as AccountInputOptsVars,
  EntryType,
} from "../../apollo/graphTypes";
import { LoadingDefaultBlank } from "./shared";
import { useControlled } from "@material-ui/core";
import {
  FieldValue,
  useField,
  UseFieldOptions,
  useFormContext,
} from "../../useKISSForm/form";

const NULLISH = Symbol("NULLISH");

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

const ACCOUNT_CARD_PAY_METHOD_INPUT_OPT = gql`
  fragment AccountCardPayMethodInputOpt on AccountCard {
    __typename
    id
    active
    type
    trailingDigits
  }
`;

const ACCOUNT_OWNER_PAY_METHOD_INPUT_OPT = gql`
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
`;

const ACCOUNT_CHECKING_PAY_METHOD_INPUT_OPT = gql`
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
  ${ACCOUNT_OWNER_PAY_METHOD_INPUT_OPT}
  ${ACCOUNT_CARD_PAY_METHOD_INPUT_OPT}
`;

const ACCOUNT_CREDIT_CARD_PAY_METHOD_INPUT_OPT = gql`
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
  ${ACCOUNT_OWNER_PAY_METHOD_INPUT_OPT}
  ${ACCOUNT_CARD_PAY_METHOD_INPUT_OPT}
`;

const PAY_METHOD_INPUT_OPTS = gql`
  query AccountPayMethodInputOpts($where: AccountsWhere!) {
    accounts(where: $where) {
      ...AccountCheckingPayMethodInputOpt
      ...AccountCreditCardPayMethodInputOpt
    }
  }
  ${ACCOUNT_CHECKING_PAY_METHOD_INPUT_OPT}
  ${ACCOUNT_CREDIT_CARD_PAY_METHOD_INPUT_OPT}
`;

export const PAY_METHOD_DEFAULT_VALUE_FRAGMENT = gql`
  fragment PayMethodDefaultValue on PaymentMethodInterface {
    __typename
    currency
    ... on PaymentMethodCard {
      card {
        __typename
        trailingDigits
        type
        ...AccountCardPayMethodInputOpt
      }
    }
    ... on PaymentMethodCheck {
      check {
        __typename
        checkNumber
        ... on AccountCheck {
          account {
            ...AccountCheckingPayMethodInputOpt
          }
        }
      }
    }
  }
  ${ACCOUNT_CARD_PAY_METHOD_INPUT_OPT}
  ${ACCOUNT_CHECKING_PAY_METHOD_INPUT_OPT}
`;

export const PAY_METHOD_DEFAULT_VALUE_FROM_ENTRY = gql`
  query PayMethodDefaultValueFromEntry($where: EntriesWhere!) {
    entries(where: $where) {
      __typename
      id
      paymentMethod {
        ...PayMethodDefaultValue
      }
    }
  }
  ${PAY_METHOD_DEFAULT_VALUE_FRAGMENT}
`;

export const PAY_METHOD_DEFAULT_VALUE_FROM_REFUND = gql`
  query PayMethodDefaultValueFromRefund($where: EntryRefundsWhere!) {
    entryRefunds(where: $where) {
      __typename
      id
      paymentMethod {
        ...PayMethodDefaultValue
      }
    }
  }
  ${PAY_METHOD_DEFAULT_VALUE_FRAGMENT}
`;

export const usePaymentMethodDefaultValue = (
  defaultValue?: PayMethodDefaultValueFragment
):
  | ValueNode<PayMethodInputOpt, PaymentMethodInputBranchOpt>
  | FreeSoloNode<PaymentMethodInputBranchOpt>
  | undefined =>
  useMemo(() => {
    switch (defaultValue?.__typename) {
      case undefined:
        return undefined;
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
      case "PaymentMethodCard": {
        const card = defaultValue?.card;

        if (card.__typename === "AccountCard") {
          return new ValueNode<PayMethodInputOpt, PaymentMethodInputBranchOpt>(
            card,
            new BranchNode(card.type, cardBranch)
          );
        } else {
          return new FreeSoloNode<PaymentMethodInputBranchOpt>(
            card.trailingDigits,
            new BranchNode(card.type, cardBranch)
          );
        }
      }
      case "PaymentMethodCheck": {
        const check = defaultValue?.check;

        if (check.__typename === "AccountCheck") {
          return new FreeSoloNode<PaymentMethodInputBranchOpt>(
            check.checkNumber,
            new BranchNode(check.account, checkBranch)
          );
        } else {
          return new FreeSoloNode<PaymentMethodInputBranchOpt>(
            check.checkNumber,
            checkBranch
          );
        }
      }
    }
  }, [defaultValue]);

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
      "options" | "defaultValue"
    >,
    "onChange" | "value"
  >,
  "onBranchChange" | "branch"
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
      branch: branchProp,
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

    const [branch, setBranch] = useControlled({
      controlled: branchProp,
      default: null,
      name: "PaymentMethodInputBase",
      state: "branch",
    });

    const [state, setState] = useState<{
      checkingAccountBranchOpts: BranchNode<PaymentMethodInputBranchOpt>[];
      cardOpts: Map<PaymentCardType, AccountCardPayMethodInputOpt[]>;
    }>({
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
            const checkingAccountBranchOpts: BranchNode<PaymentMethodInputBranchOpt>[] =
              [];
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

        setBranch(args[1]);

        if (onBranchChangeProp) {
          onBranchChangeProp(...args);
        }
      },
      [setInputValue, onInputChangeProp, setBranch, onBranchChangeProp]
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
              curBranch={branch}
              getOptionLabel={getOptionLabel}
            />
          );
        } else {
          return (
            <DefaultOption
              option={option}
              curBranch={branch}
              getOptionLabel={getOptionLabelWithPrefixes}
            />
          );
        }
      },
      [branch]
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

            const curBranch = branch?.valueOf();

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
        branch,
      ]
    );

    const [options, freeSolo] = useMemo<
      [options: PayMethodTreeSelectProps["options"], freeSolo: boolean]
    >(() => {
      const curBranch = branch?.valueOf();

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
      branch,
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
        branch={branch}
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
  defaultValue?: TreeSelectValue<
    PayMethodInputOpt,
    PaymentMethodInputBranchOpt,
    Multiple,
    true,
    false | true
  >;
} & MarkOptional<
  Omit<
    PaymentMethodInputBaseProps<Multiple, DisableClearable>,
    "branch" | "value" | "name"
  >,
  "onChange"
> &
  Pick<UseFieldOptions, "form">;

export type PaymentMethodFieldDef<
  Multiple extends boolean | undefined = undefined,
  FreeSolo extends boolean | undefined = undefined
> = {
  paymentMethod: FieldValue<
    TreeSelectValue<
      PayMethodInputOpt,
      PaymentMethodInputBranchOpt,
      Multiple,
      false,
      FreeSolo
    >
  >;
};

const BRANCH_NOT_SET = Symbol();

export const PAYMENT_METHOD_NAME: keyof PaymentMethodFieldDef = "paymentMethod";

export const PaymentMethodInput = forwardRef(function PaymentMethodInput<
  Multiple extends boolean | undefined = undefined,
  DisableClearable extends boolean | undefined = undefined
>(
  props: PaymentMethodInputProps<Multiple, DisableClearable>,
  ref: Ref<unknown>
): JSX.Element {
  const {
    defaultValue,
    form,
    renderInput: renderInputProp = defaultInput,
    disabled,
    onBlur: onBlurProp,
    onChange: onChangeProp,
    onBranchChange: onBranchChangeProp,
    ...rest
  } = props;

  const isSubmitting = useFormContext(form)?.isSubmitting ?? false;

  const {
    props: { value: fieldValue, name },
    state: { isTouched, errors },
    setValue,
    setTouched,
  } = useField<
    TreeSelectValue<
      PayMethodInputOpt,
      PaymentMethodInputBranchOpt,
      Multiple,
      DisableClearable,
      false | true
    >
  >({
    name: PAYMENT_METHOD_NAME,
    form,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    defaultValue: defaultValue as any,
  });

  const value = useMemo(
    () => fieldValue || (rest.multiple ? [] : null),
    [fieldValue, rest.multiple]
  ) as TreeSelectValue<
    PayMethodInputOpt,
    PaymentMethodInputBranchOpt,
    Multiple,
    DisableClearable,
    false | true
  >;

  const handleBlur = useCallback<
    NonNullable<PaymentMethodInputBaseProps["onBlur"]>
  >(
    (...args) => {
      setTouched(true);
      if (onBlurProp) {
        onBlurProp(...args);
      }
    },
    [setTouched, onBlurProp]
  );

  const renderInput = useCallback<
    NonNullable<PaymentMethodInputBaseProps["renderInput"]>
  >(
    (params) =>
      renderInputProp({
        ...params,
        name,
        ...(isTouched && errors.length
          ? {
              error: true,
              helperText: errors[0].message,
            }
          : {}),
      }),
    [renderInputProp, name, isTouched, errors]
  );

  const handleChange = useCallback<
    NonNullable<
      PaymentMethodInputBaseProps<Multiple, DisableClearable>["onChange"]
    >
  >(
    (...args) => {
      setValue(args[1] ?? undefined);
      if (onChangeProp) {
        onChangeProp(...args);
      }
    },
    [setValue, onChangeProp]
  );

  // The following accommodates async default value lookups.
  const [branch, setBranch] = useState(() =>
    value instanceof ValueNode ? value.parent : BRANCH_NOT_SET
  );
  const handleBranchChange = useCallback<
    NonNullable<
      PaymentMethodInputBaseProps<Multiple, DisableClearable>["onBranchChange"]
    >
  >(
    (...args) => {
      setBranch(args[1]);

      if (onBranchChangeProp) {
        onBranchChangeProp(...args);
      }
    },
    [onBranchChangeProp]
  );

  return (
    <PaymentMethodInputBase
      {...rest}
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      value={value ?? (null as any)}
      disabled={isSubmitting || disabled}
      ref={ref}
      onChange={handleChange}
      branch={
        branch === BRANCH_NOT_SET
          ? value instanceof ValueNode
            ? value.parent
            : null
          : branch
      }
      onBranchChange={handleBranchChange}
      renderInput={renderInput}
      onBlur={handleBlur}
    />
  );
});
