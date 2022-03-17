import React, { useCallback, useMemo, useState } from "react";
import { Table, TableFilterRow } from "@devexpress/dx-react-grid-material-ui";
import { capitalCase } from "capital-case";
import { IntegratedFiltering } from "@devexpress/dx-react-grid";
import TreeSelect, {
  BranchNode,
  TreeSelectProps,
  ValueNode,
} from "mui-tree-select";

import {
  GridPaymentMethodFragment,
  PaymentCardType,
} from "../../../../apollo/graphTypes";
import { TableFilterCellProps } from "../plugins";
import { Filter } from "../plugins";
import {
  inlineAutoCompleteProps,
  inlinePadding,
  renderFilterInput,
} from "./shared";
import { AvailableFilterOperations } from "../filters/rangeFilterUtils";
import { toString as toStringCardType } from "../../../../apollo/typeUtils/paymentCardType";
import { toString as toStringAccountCard } from "../../../../apollo/typeUtils/accountCard";

export const payMethodToStr = (
  payMethod: GridPaymentMethodFragment
): string => {
  switch (payMethod.__typename) {
    case "PaymentMethodCard":
      if (payMethod.card.__typename === "AccountCard") {
        return toStringAccountCard(payMethod.card);
      }

      switch (payMethod.card.type) {
        case PaymentCardType.Visa:
        case PaymentCardType.AmericanExpress:
        case PaymentCardType.MasterCard:
        case PaymentCardType.Discover:
          return `${toStringCardType(payMethod.card.type)}-${
            payMethod.card.trailingDigits
          }`;
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
export type PayMethodFilterProps = TableFilterCellProps<
  GridPaymentMethodFragment,
  Extract<AvailableFilterOperations, "equal">
> & {
  payMethodFilterOpts?: GridPaymentMethodFragment[];
};

const payMethodFilterEquals = (
  a: GridPaymentMethodFragment,
  b: GridPaymentMethodFragment
): boolean => {
  switch (a.__typename) {
    case "PaymentMethodCash":
    case "PaymentMethodCombination":
    case "PaymentMethodOnline":
    case "PaymentMethodUnknown":
      return a.__typename === b.__typename;
    case "PaymentMethodCard":
      return (
        a.__typename === b.__typename &&
        a.card.__typename === b.card.__typename &&
        a.card.type === b.card.type &&
        a.card.trailingDigits === b.card.trailingDigits
      );
    case "PaymentMethodCheck":
      if (a.__typename === b.__typename) {
        if (
          a.check.__typename === "AccountCheck" &&
          b.check.__typename === "AccountCheck"
        ) {
          return (
            a.check.checkNumber === b.check.checkNumber &&
            a.check.account.id === b.check.account.id
          );
        } else {
          return (
            a.check.__typename === b.check.__typename &&
            a.check.checkNumber === b.check.checkNumber
          );
        }
      }
      return false;
  }
};

export const PayMethodFilter = (props: PayMethodFilterProps): JSX.Element => {
  type RootLeafOpts = Exclude<
    GridPaymentMethodFragment["__typename"],
    "PaymentMethodCard" | "PaymentMethodCheck"
  >;

  type PayMethodBranch =
    | Exclude<GridPaymentMethodFragment["__typename"], RootLeafOpts>
    | PaymentCardType
    | { checkingAccountId: string; accountNumber: string }
    | "Internal"
    | "External";

  type PayMethodTreeProps = TreeSelectProps<
    GridPaymentMethodFragment,
    PayMethodBranch,
    true,
    false,
    false
  >;

  const { payMethodFilterOpts, ...rest } = props;
  const { onFilter, filter } = props;

  const [branch, setBranch] = useState<PayMethodTreeProps["branch"]>(null);

  const options = useMemo<PayMethodTreeProps["options"]>(() => {
    const paymentMethods = payMethodFilterOpts || [];

    if (branch) {
      const branchVal = branch.valueOf();
      switch (branchVal) {
        case "External":
          return [
            ...paymentMethods
              .reduce((options, payMethod) => {
                if (
                  payMethod.__typename === "PaymentMethodCard" &&
                  payMethod.card.__typename === "PaymentCard" &&
                  !options.has(payMethod.card.type)
                ) {
                  options.set(
                    payMethod.card.type,
                    new BranchNode<PayMethodBranch>(payMethod.card.type, branch)
                  );
                }

                return options;
              }, new Map<string, BranchNode<PayMethodBranch>>())
              .values(),
          ];
        case "Internal":
          return [
            ...paymentMethods
              .reduce((options, payMethod) => {
                if (
                  payMethod.__typename === "PaymentMethodCard" &&
                  payMethod.card.__typename === "AccountCard" &&
                  !options.has(payMethod.card.type)
                ) {
                  options.set(
                    payMethod.card.type,
                    new BranchNode<PayMethodBranch>(payMethod.card.type, branch)
                  );
                }

                return options;
              }, new Map<string, BranchNode<PayMethodBranch>>())
              .values(),
          ];
        case "PaymentMethodCard":
          return [
            new BranchNode<PayMethodBranch>("Internal", branch),
            new BranchNode<PayMethodBranch>("External", branch),
          ];
        case "PaymentMethodCheck": {
          return paymentMethods
            .reduce(
              ([checks], payMethod) => {
                if (payMethod.__typename === "PaymentMethodCheck") {
                  if (payMethod.check.__typename === "AccountCheck") {
                    if (!checks.accounts.has(payMethod.check.account.id)) {
                      checks.accounts.set(
                        payMethod.check.account.id,
                        new BranchNode<PayMethodBranch>(
                          {
                            checkingAccountId: payMethod.check.account.id,
                            accountNumber:
                              payMethod.check.account.accountNumber,
                          },
                          branch
                        )
                      );
                    }
                  } else {
                    checks.externalChecks.set(
                      payMethod.check.checkNumber,
                      payMethod
                    );
                  }
                }

                return [checks];
              },
              [
                {
                  accounts: new Map<string, BranchNode<PayMethodBranch>>(),
                  externalChecks: new Map<string, GridPaymentMethodFragment>(),
                },
              ]
            )
            .map(({ accounts, externalChecks }) => [
              ...accounts.values(),
              ...externalChecks.values(),
            ])[0];
        }
        case PaymentCardType.AmericanExpress:
        case PaymentCardType.Discover:
        case PaymentCardType.MasterCard:
        case PaymentCardType.Visa: {
          const cardTypename =
            branch.parent?.valueOf() === "External"
              ? "PaymentCard"
              : "AccountCard";

          return [
            ...paymentMethods
              .reduce((options, payMethod) => {
                if (
                  payMethod.__typename === "PaymentMethodCard" &&
                  payMethod.card.type === branchVal &&
                  payMethod.card.__typename === cardTypename &&
                  !options.has(payMethod.card.trailingDigits)
                ) {
                  options.set(payMethod.card.trailingDigits, payMethod);
                }
                return options;
              }, new Map<string, GridPaymentMethodFragment>())
              .values(),
          ];
        }
        default: {
          const { checkingAccountId: id } = branchVal;

          return [
            ...paymentMethods
              .reduce((options, payMethod) => {
                if (
                  payMethod.__typename === "PaymentMethodCheck" &&
                  payMethod.check.__typename === "AccountCheck" &&
                  payMethod.check.account.id === id &&
                  !options.has(payMethod.check.checkNumber)
                ) {
                  options.set(payMethod.check.checkNumber, payMethod);
                }

                return options;
              }, new Map<string, GridPaymentMethodFragment>())
              .values(),
          ];
        }
      }
    } else {
      return [
        ...paymentMethods
          .reduce((options, payMethod) => {
            switch (payMethod.__typename) {
              case "PaymentMethodCard":
              case "PaymentMethodCheck":
                if (!options.has(payMethod.__typename)) {
                  options.set(
                    payMethod.__typename,
                    new BranchNode<PayMethodBranch>(payMethod.__typename)
                  );
                }
                break;
              default:
                if (!options.has(payMethod.__typename)) {
                  options.set(payMethod.__typename, payMethod);
                }
            }
            return options;
          }, new Map<GridPaymentMethodFragment["__typename"], BranchNode<PayMethodBranch> | GridPaymentMethodFragment>())
          .values(),
      ];
    }
  }, [branch, payMethodFilterOpts]);

  const columnName = props.column.name;

  const handleChange = useCallback<NonNullable<PayMethodTreeProps["onChange"]>>(
    (_, value) => {
      if (value.length) {
        onFilter({
          columnName,
          operator: "or",
          filters: value.map((option) => ({
            operation: "equal",
            value: option.valueOf(),
          })),
        });
      } else {
        onFilter(null);
      }
    },
    [columnName, onFilter]
  );

  const handleBranchChange = useCallback<
    NonNullable<PayMethodTreeProps["onBranchChange"]>
  >((_, branch) => setBranch(branch), []);

  const getOptionLabel = useCallback<
    NonNullable<PayMethodTreeProps["getOptionLabel"]>
  >((option) => {
    if (option instanceof BranchNode) {
      const opt = option.valueOf();

      if (typeof opt === "string") {
        switch (opt) {
          case "PaymentMethodCheck":
            return "Check";
          case "PaymentMethodCard":
            return "Card";
          case "External":
          case "Internal":
            return opt;
          default:
            return capitalCase(opt);
        }
      } else {
        return `Acct# ...${opt.accountNumber?.slice(-4)}`;
      }
    } else {
      const opt = option.valueOf();
      switch (opt.__typename) {
        case "PaymentMethodCard":
          if (opt.card.__typename === "AccountCard") {
            return toStringAccountCard(opt.card);
          }

          return `${toStringCardType(opt.card.type)}-${
            opt.card.trailingDigits
          }`;
        case "PaymentMethodCheck":
          return `CK-${opt.check.checkNumber}`;
        case "PaymentMethodCash":
          return "Cash";
        case "PaymentMethodCombination":
          return "Combination";
        case "PaymentMethodOnline":
          return "Online";
        case "PaymentMethodUnknown":
          return "Unknown";
      }
    }
  }, []);

  const getOptionSelected = useCallback<
    NonNullable<PayMethodTreeProps["getOptionSelected"]>
  >(
    (option, value) => payMethodFilterEquals(option.valueOf(), value.valueOf()),
    []
  );

  const value = useMemo<
    ValueNode<GridPaymentMethodFragment, PayMethodBranch>[]
  >(() => {
    if (!filter) {
      return [];
    } else if ("operator" in filter) {
      return filter.filters.reduce((value, filter) => {
        if ("operation" in filter && filter.value) {
          value.push(
            branch
              ? new ValueNode(filter.value, branch)
              : new ValueNode(filter.value)
          );
        }
        return value;
      }, [] as ValueNode<GridPaymentMethodFragment, PayMethodBranch>[]);
    }
    return "operation" in filter && filter.value
      ? [
          branch
            ? new ValueNode(filter.value, branch)
            : new ValueNode(filter.value),
        ]
      : [];
  }, [filter, branch]);

  return (
    <TableFilterRow.Cell
      {...(rest as TableFilterRow.CellProps)}
      style={inlinePadding}
    >
      <TreeSelect<
        GridPaymentMethodFragment,
        PayMethodBranch,
        true,
        false,
        false
      >
        onBranchChange={handleBranchChange}
        branch={branch}
        onChange={handleChange}
        options={options}
        multiple
        getOptionLabel={getOptionLabel}
        getOptionSelected={getOptionSelected}
        renderInput={renderFilterInput}
        value={value}
        {...inlineAutoCompleteProps}
      />
    </TableFilterRow.Cell>
  );
};

export const payMethodFilterColumnExtension = (
  columnName: string,
  toString: (value: GridPaymentMethodFragment) => string = payMethodToStr
): IntegratedFiltering.ColumnExtension => ({
  columnName,
  predicate: (value, filter, row): boolean => {
    const filterValue = (filter as unknown as Filter<GridPaymentMethodFragment>)
      .value;

    if (filterValue === undefined) {
      return true;
    }

    switch (filter.operation) {
      case "equal":
        return payMethodFilterEquals(
          filterValue,
          value as GridPaymentMethodFragment
        );
      case "notEqual":
        return payMethodFilterEquals(
          filterValue,
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
