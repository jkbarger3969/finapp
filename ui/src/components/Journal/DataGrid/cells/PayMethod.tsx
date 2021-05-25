import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Table,
  TableEditRow,
  TableFilterRow,
} from "@devexpress/dx-react-grid-material-ui";
import { TextField, TextFieldProps } from "@material-ui/core";
import Autocomplete, { AutocompleteProps } from "@material-ui/lab/Autocomplete";
import TreeSelect, { defaultInput, TreeSelectProps } from "mui-tree-select";
import { capitalCase } from "capital-case";
import { IntegratedFiltering } from "@devexpress/dx-react-grid";

import {
  EntryType,
  GridPaymentMethodFragment,
  GridPaymentMethod_PaymentMethodCard_Fragment,
  AccountCard,
  PaymentCard,
  GridPaymentMethod_PaymentMethodCheck_Fragment,
  AccountCheck,
  PaymentCheck,
  PaymentCardType,
  GridEntryFragment,
  PaymentMethodType,
} from "../../../../apollo/graphTypes";
import { OnFilter } from "../plugins";
import { Filter, LogicFilter } from "../plugins";
import {
  PayMethodInputOpt,
  usePaymentMethodTree,
  PaymentMethodInputBranchOpt,
  getOptionLabel as getOptionLabelEditor,
  getOptionSelected as getOptionSelectedEditor,
  UsePaymentMethodTreeOptions,
  PayMethodTreeSelectProps,
  getCardTypeAbbreviation,
} from "../../../Inputs/paymentMethodInputUtils";
import {
  inlineAutoCompleteProps,
  inlineInputProps,
  inlinePadding,
  RowChangesProp,
} from "./shared";
import { CategoryRowChanges } from "./Category";
import { GridEntry } from "../Grid";

export const payMethodToStr = (
  payMethod: GridPaymentMethodFragment
): string => {
  switch (payMethod.__typename) {
    case "PaymentMethodCard":
      switch (payMethod.card.type) {
        case PaymentCardType.Visa:
          return `VISA-${payMethod.card.trailingDigits}`;
        case PaymentCardType.MasterCard:
          return `MC-${payMethod.card.trailingDigits}`;
        case PaymentCardType.AmericanExpress:
          return `AMEX-${payMethod.card.trailingDigits}`;
        case PaymentCardType.Discover:
          return `DS-${payMethod.card.trailingDigits}`;
        default:
          return payMethod.card.trailingDigits;
      }
    case "PaymentMethodCheck":
      return `CK-${payMethod.check.checkNumber}`;
    default:
      return capitalCase(payMethod.__typename.replace(/^PaymentMethod/i, ""));
  }
};

export const PayMethodCell = (props: Table.DataCellProps): JSX.Element => {
  const { value, ...rest } = props;

  return (
    <Table.Cell
      {...rest}
      value={payMethodToStr(value as GridPaymentMethodFragment)}
    />
  );
};

// Filter Cell
export type PayMethodFilterProps = Omit<
  TableFilterRow.CellProps,
  "onFilter"
> & {
  onFilter: OnFilter<GridPaymentMethodFragment, "equal">;
  payMethodFilterOpts?: GridPaymentMethodFragment[];
};

const renderInput: AutocompleteProps<
  GridPaymentMethodFragment,
  true,
  false,
  false
>["renderInput"] = (params) => {
  const props = {
    ...params,
    InputProps: {
      ...inlineInputProps,
      ...params.InputProps,
    },
  } as TextFieldProps;

  return <TextField {...props} />;
};

const getOptionLabelFilter: NonNullable<
  AutocompleteProps<
    GridPaymentMethodFragment,
    true,
    false,
    false
  >["getOptionLabel"]
> = (value): string => {
  switch (value.__typename) {
    case "PaymentMethodCard":
      return `${capitalCase(value.card.type)}-${capitalCase(
        value.card.trailingDigits
      )}`;
    case "PaymentMethodCheck":
      return `CK-${value.check.checkNumber}`;
    default:
      return capitalCase(value.__typename.replace(/^PaymentMethod/i, ""));
  }
};

export const PayMethodFilter = (props: PayMethodFilterProps): JSX.Element => {
  const { payMethodFilterOpts, ...rest } = props;

  const options = useMemo(() => payMethodFilterOpts || [], [
    payMethodFilterOpts,
  ]);

  const columnName = props.column.name;

  type Props = AutocompleteProps<GridPaymentMethodFragment, true, false, false>;

  const onChange = useCallback<NonNullable<Props["onChange"]>>(
    (_, value) => {
      if (value.length) {
        const logicFilter: LogicFilter<GridPaymentMethodFragment, "equal"> = {
          operator: "or",
          filters: [],
        };

        for (const option of value) {
          logicFilter.filters.push({
            operation: "equal",
            value: option,
          });
        }

        props.onFilter({
          columnName,
          filters: [logicFilter],
        });
      } else {
        props.onFilter(null);
      }
    },
    [columnName, props.onFilter]
  );

  return (
    <TableFilterRow.Cell
      {...(rest as TableFilterRow.CellProps)}
      style={inlinePadding}
    >
      <Autocomplete
        getOptionLabel={getOptionLabelFilter}
        multiple
        renderInput={renderInput}
        onChange={onChange}
        options={options}
        {...inlineAutoCompleteProps}
      />
    </TableFilterRow.Cell>
  );
};

const payMethodFilterEquals = (
  a: GridPaymentMethodFragment,
  b: GridPaymentMethodFragment
): boolean => {
  if (a.__typename !== b.__typename) {
    return false;
  }

  switch (a.__typename) {
    case "PaymentMethodCard": {
      const bCard = b as GridPaymentMethod_PaymentMethodCard_Fragment;
      if (a.card.__typename !== bCard.card.__typename) {
        return false;
      } else if (a.card.__typename === "AccountCard") {
        return (
          a.card.account.id === (bCard.card as AccountCard).account.id &&
          a.card.id === (bCard.card as AccountCard).id
        );
      } else {
        return (
          a.card.type === (bCard.card as PaymentCard).type &&
          a.card.trailingDigits === (bCard.card as PaymentCard).trailingDigits
        );
      }
    }
    case "PaymentMethodCheck": {
      const bCard = b as GridPaymentMethod_PaymentMethodCheck_Fragment;
      if (a.check.__typename !== bCard.check.__typename) {
        return false;
      } else if (a.check.__typename === "AccountCheck") {
        return (
          a.check.account.id === (bCard.check as AccountCheck).account.id &&
          a.check.checkNumber === (bCard.check as AccountCheck).checkNumber
        );
      } else {
        return (
          a.check.checkNumber === (bCard.check as PaymentCheck).checkNumber
        );
      }
    }
    default:
      return true;
  }
};

export const payMethodFilterColumnExtension = (
  columnName: string,
  toString: (value: GridPaymentMethodFragment) => string
): IntegratedFiltering.ColumnExtension => ({
  columnName,
  predicate: (value, filter, row): boolean => {
    switch (filter.operation) {
      case "equal":
        return payMethodFilterEquals(
          ((filter as unknown) as Filter<GridPaymentMethodFragment>).value,
          value as GridPaymentMethodFragment
        );
      case "notEqual":
        return payMethodFilterEquals(
          ((filter as unknown) as Filter<GridPaymentMethodFragment>).value,
          value as GridPaymentMethodFragment
        );
      default:
        return IntegratedFiltering.defaultPredicate(
          toString(value as GridPaymentMethodFragment),
          filter,
          row
        );
    }
  },
});

type PayMethodEditorSelect = TreeSelectProps<
  PayMethodInputOpt,
  PaymentMethodInputBranchOpt,
  false,
  true,
  true | false
>;

export type PayMethodEditorProps = TableEditRow.CellProps & {
  treeSelectParams?: Partial<
    Pick<PayMethodEditorSelect, "renderInput" | "disabled">
  >;
  options: Omit<UsePaymentMethodTreeOptions, "iniValue" | "type">;
} & RowChangesProp<PayMethodRowChanges & CategoryRowChanges>;

export interface PayMethodEditorOnValueChangeResult {
  value: Exclude<PayMethodTreeSelectProps["value"], undefined>;
  branchPath: NonNullable<PayMethodTreeSelectProps["branchPath"]>;
}

export type PayMethodRowChanges = {
  paymentMethod: PayMethodEditorOnValueChangeResult | null;
};

export const PayMethodEditor = (props: PayMethodEditorProps): JSX.Element => {
  const {
    treeSelectParams: treeSelectParamsProp,
    options: payMethodTreeHookOpts,
    rowChanges = {},
    ...rest
  } = props;

  const { onValueChange, row, editingEnabled } = props;

  const valueProp = (props.value || null) as
    | GridEntryFragment["paymentMethod"]
    | PayMethodEditorOnValueChangeResult
    | null;

  const type =
    rowChanges[row.id as string]?.category !== undefined
      ? rowChanges[row.id]?.category?.type
      : ((row as GridEntry)?.category?.type as EntryType | undefined);

  const isRefund = (row as GridEntry)?.__typename === "EntryRefund";

  const [state, setState] = useState<{
    inputValue: string;
    type?: EntryType;
  }>({ inputValue: "", type });

  useEffect(() => {
    if (state.type !== type) {
      props.onValueChange({
        value: null,
        branchPath: [],
      } as PayMethodEditorOnValueChangeResult);

      setState((state) => ({
        ...state,
        inputValue: "",
        type,
      }));
    }
  }, [type, state.type, setState, props.onValueChange]);

  const { iniValue, treeSelectParams, queryResult } = usePaymentMethodTree({
    ...payMethodTreeHookOpts,
    type,
    isRefund,
    iniValue: props.value
      ? (props.value as GridPaymentMethodFragment)
      : undefined,
  });

  useEffect(() => {
    if (iniValue) {
      setState((state) => ({
        ...state,
        inputValue: getOptionLabelEditor(iniValue),
      }));
    }
  }, [iniValue, setState]);

  const onChange = useCallback<
    NonNullable<PayMethodTreeSelectProps["onChange"]>
  >(
    (...args) => {
      const [, value] = args;

      onValueChange({
        value,
        branchPath: treeSelectParams.branchPath,
      } as PayMethodEditorOnValueChangeResult);
    },
    [onValueChange, treeSelectParams.branchPath]
  );

  const renderInput = useCallback<
    NonNullable<PayMethodTreeSelectProps["renderInput"]>
  >(
    (params) => {
      const curBranchOpt =
        treeSelectParams.branchPath[treeSelectParams.branchPath.length - 1]
          ?.option;

      const props: TextFieldProps = {
        ...params,
      };

      if (type === undefined) {
        props.helperText = "Requires a Category";
      } else if (curBranchOpt) {
        if (typeof curBranchOpt === "string") {
          switch (curBranchOpt) {
            case PaymentMethodType.Check:
              if (type === EntryType.Credit || isRefund) {
                props.placeholder = "####";
                props.InputProps = {
                  ...(props.InputProps || {}),
                  startAdornment: "CK-",
                };
              }
              break;
            case PaymentCardType.Visa:
            case PaymentCardType.MasterCard:
            case PaymentCardType.AmericanExpress:
            case PaymentCardType.Discover:
              if (type === EntryType.Credit) {
                if (type === EntryType.Credit) {
                  props.placeholder = "Last 4 Digits";
                }
              }
              props.InputProps = {
                ...(props.InputProps || {}),
                startAdornment: `${getCardTypeAbbreviation(curBranchOpt)}-`,
              };
              break;
          }
        } else if (curBranchOpt.__typename === "AccountChecking") {
          props.placeholder = "####";
          props.InputProps = {
            ...(props.InputProps || {}),
            startAdornment: "CK-",
          };
        }
      }

      if (!props.error && queryResult.error) {
        props.error = true;
        props.helperText = queryResult.error.message;
      }

      return (treeSelectParamsProp?.renderInput || defaultInput)(props);
    },
    [
      isRefund,
      queryResult.error,
      treeSelectParams.branchPath,
      treeSelectParamsProp?.renderInput,
      type,
    ]
  );

  const onInputChange = useCallback<
    NonNullable<PayMethodTreeSelectProps["onInputChange"]>
  >(
    (...args) => {
      const [, inputValue] = args;

      setState((state) => ({
        ...state,
        inputValue,
      }));
    },
    [setState]
  );

  const onBranchChange = useCallback<
    NonNullable<PayMethodTreeSelectProps["onBranchChange"]>
  >(
    (...args) => {
      setState((state) => ({
        ...state,
        inputValue: "",
      }));

      treeSelectParams.onBranchChange(...args);
    },
    [treeSelectParams.onBranchChange, setState]
  );

  return (
    <TableEditRow.Cell {...rest}>
      <TreeSelect<
        PayMethodInputOpt,
        PaymentMethodInputBranchOpt,
        undefined,
        undefined,
        true | false
      >
        {...treeSelectParamsProp}
        {...treeSelectParams}
        onBranchChange={onBranchChange}
        disabled={
          !editingEnabled ||
          type === undefined ||
          !!treeSelectParamsProp?.disabled
        }
        getOptionLabel={getOptionLabelEditor}
        getOptionSelected={getOptionSelectedEditor}
        loading={queryResult.loading}
        inputValue={state.inputValue}
        onInputChange={onInputChange}
        onChange={onChange}
        renderInput={renderInput}
        value={
          valueProp && "__typename" in valueProp
            ? iniValue || null
            : valueProp?.value || null
        }
      />
    </TableEditRow.Cell>
  );
};
