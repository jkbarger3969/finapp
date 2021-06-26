import React, { useCallback, useMemo, useState } from "react";
import {
  Table,
  TableEditRow,
  TableFilterRow,
} from "@devexpress/dx-react-grid-material-ui";
import { TextField, TextFieldProps } from "@material-ui/core";
import Autocomplete, { AutocompleteProps } from "@material-ui/lab/Autocomplete";
import { FreeSoloNode, ValueNode } from "mui-tree-select";
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
} from "../../../../apollo/graphTypes";
import { OnFilter } from "../plugins";
import { Filter, LogicFilter } from "../plugins";
import {
  PaymentMethodInput,
  PayMethodInputOpt,
  PaymentMethodInputBranchOpt,
  PayMethodTreeSelectProps,
  PaymentMethodInputProps,
  PayMethodIniValue,
} from "../../../Inputs/PaymentMethod";
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

// Editor Cell

export type PayMethodRowChanges = {
  paymentMethod:
    | ValueNode<PayMethodInputOpt, PaymentMethodInputBranchOpt>
    | FreeSoloNode<PaymentMethodInputBranchOpt>
    | null;
} & CategoryRowChanges;

export type PayMethodEditorProps = TableEditRow.CellProps & {
  accounts: PaymentMethodInputProps["accounts"];
  options?: Pick<PaymentMethodInputProps, "renderInput" | "disabled">;
} & RowChangesProp<PayMethodRowChanges>;

export const PayMethodEditor = (props: PayMethodEditorProps): JSX.Element => {
  const { accounts, options = {}, rowChanges = {}, ...rest } = props;

  const { onValueChange, row, value: valueProp } = props;

  const value = (valueProp instanceof ValueNode ||
  valueProp instanceof FreeSoloNode
    ? valueProp
    : null) as PayMethodRowChanges["paymentMethod"];

  const [iniValue] = useState<PayMethodIniValue | undefined>(() => {
    if (valueProp) {
      return valueProp as GridEntry["paymentMethod"];
    }
  });

  const entryType =
    rowChanges[row.id as string]?.category !== undefined
      ? rowChanges[row.id]?.category?.valueOf().type
      : ((row as GridEntry)?.category?.type as EntryType | undefined);

  const isRefund = (row as GridEntry)?.__typename === "EntryRefund";

  const onChange = useCallback<
    NonNullable<PayMethodTreeSelectProps<false, false>["onChange"]>
  >(
    (...args) => {
      const [, value] = args;

      onValueChange(value);
    },
    [onValueChange]
  );

  return (
    <TableEditRow.Cell {...rest}>
      <PaymentMethodInput<false, false>
        {...options}
        iniValue={iniValue}
        accounts={accounts}
        onChange={onChange}
        value={value}
        isRefund={isRefund}
        entryType={entryType ?? null}
      />
    </TableEditRow.Cell>
  );
};
