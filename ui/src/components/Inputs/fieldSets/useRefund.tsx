import React, { useCallback, useMemo } from "react";
import { defaultInput } from "mui-tree-select";
import { ApolloError, gql, useQuery } from "@apollo/client";
import Fraction from "fraction.js";

import { BoolFieldDef, BoolInput, BoolInputProps } from "../BoolInput";
import { DateFieldDef, DateInput, DateInputProps } from "../Date";
import {
  PaymentMethodFieldDef,
  PaymentMethodInput,
  PaymentMethodInputProps,
  PAYMENT_METHOD_NAME,
  PAY_METHOD_DEFAULT_VALUE_FRAGMENT,
} from "../PaymentMethod";
import {
  RationalFieldDef,
  RationalInput,
  RationalInputProps,
} from "../RationalInput";
import {
  NamePrefixProvider,
  prefixName,
  UseFieldOptions,
  useLoading,
  useNamePrefix,
  UseValidatorOptions,
  useValidators,
  Validator,
} from "../../../useKISSForm/form";
import { gtZero, requiredValidator } from "../shared";
import { DepartmentInputProps } from "../Department";
import {
  EntryType,
  RefundEntryStateQuery as RefundEntryState,
  RefundEntryStateQueryVariables as RefundEntryStateVars,
} from "../../../apollo/graphTypes";
import { deserializeRational } from "../../../apollo/scalars";
export type RefundInputProps = {
  date?: Omit<DateInputProps, "name" | "form">;
  paymentMethod: Omit<
    PaymentMethodInputProps,
    "multiple" | "entryType" | "form" | "isRefund"
  >;
  total?: Omit<RationalInputProps, "name" | "form">;
  reconciled?:
    | Partial<Omit<BoolInputProps<"checkbox">, "name" | "form">>
    | Partial<Omit<BoolInputProps<"switch">, "name" | "form">>;
};

export const DATE_NAME = "date";
export const TOTAL_NAME = "total";
export const RECONCILED_NAME = "reconciled";

export type RefundFieldDef = {
  refund: DateFieldDef<typeof DATE_NAME> &
    PaymentMethodFieldDef<false, false> &
    RationalFieldDef<typeof TOTAL_NAME> &
    BoolFieldDef<typeof RECONCILED_NAME>;
};
export const REFUND_NAME: keyof RefundFieldDef = "refund";

const nameLoading = [
  prefixName(DATE_NAME, REFUND_NAME),
  prefixName(PAYMENT_METHOD_NAME, REFUND_NAME),
  prefixName(TOTAL_NAME, REFUND_NAME),
  prefixName(RECONCILED_NAME, REFUND_NAME),
] as const;

const REFUND_ENTRY_STATE = gql`
  query RefundEntryState($where: EntriesWhere!) {
    entries(where: $where) {
      __typename
      id
      date
      category {
        __typename
        id
        type
      }
      paymentMethod {
        ...PayMethodDefaultValue
      }
      total
      refunds {
        __typename
        id
        deleted
        total
      }
    }
  }
  ${PAY_METHOD_DEFAULT_VALUE_FRAGMENT}
`;

export type RefundProps = (
  | {
      entryId: string;
    }
  | { refundId: string }
) & {
  showLabels?: boolean;
  insertNamePrefix?: string;
  required?: boolean;
} & RefundInputProps &
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  Pick<UseFieldOptions<any, string, any>, "form">;

export const useRefund = (
  props: RefundProps
): {
  error?: ApolloError;
} & {
  [Name in keyof RefundInputProps as `${Name}Input`]-?: JSX.Element;
} &
  {
    [Name in keyof RefundInputProps as `${Name}InputName`]-?: string;
  } => {
  const {
    form,
    required,
    showLabels,
    insertNamePrefix,
    date: dateProps = {} as DateInputProps,
    paymentMethod: paymentMethodProps,
    total: totalProps = {},
    reconciled: reconciledProps = {},
  } = props;

  const refundName = insertNamePrefix
    ? prefixName(REFUND_NAME, insertNamePrefix)
    : REFUND_NAME;

  const fullName = useNamePrefix(refundName);

  const [refundId, entryId] =
    "refundId" in props ? [props.refundId, null] : [null, props.entryId];
  const { loading, error, data } = useQuery<
    RefundEntryState,
    RefundEntryStateVars
  >(
    REFUND_ENTRY_STATE,
    useMemo(() => {
      if (refundId) {
        return {
          variables: {
            where: {
              refunds: {
                id: {
                  eq: refundId,
                },
              },
            },
          },
        };
      } else {
        return {
          variables: {
            where: {
              id: {
                eq: entryId,
              },
            },
          },
        };
      }
    }, [entryId, refundId])
  );

  useLoading({
    loading,
    name: nameLoading as unknown as string[],
    form,
  });

  const [entry] = data?.entries || [];

  const entryType: EntryType | null = entry?.category?.type ?? null;

  const maxRefund = useMemo(
    () =>
      (entry?.refunds || []).reduce(
        (maxRefund, refund) => {
          return refund.deleted || refund.id === refundId
            ? maxRefund
            : maxRefund.sub(deserializeRational(refund.total));
        },
        entry?.total ? deserializeRational(entry?.total) : new Fraction(0)
      ),
    [entry?.refunds, entry?.total, refundId]
  );

  console.log(refundId, entryId, entryType, maxRefund);

  useValidators<RefundFieldDef>(
    useMemo<UseValidatorOptions<RefundFieldDef>>(() => {
      const lteMaxError = new RangeError(
        `Refund cannot exceed $${maxRefund.toString(2)}`
      );
      const lteMax: Validator<Fraction> = (value) => {
        if (value && value.compare(maxRefund) > 0) {
          return lteMaxError;
        }
      };

      if (required) {
        return {
          validators: {
            refund: {
              date: requiredValidator,
              paymentMethod: requiredValidator,
              total: [requiredValidator, gtZero, lteMax],
            },
          },
          form,
        };
      } else {
        return {
          validators: {
            refund: {
              total: [gtZero, lteMax],
            },
          },
          form,
        };
      }
    }, [form, maxRefund, required])
  );

  return {
    error,
    dateInput: (
      <NamePrefixProvider namePrefix={refundName}>
        <DateInput
          label={showLabels && "Date"}
          {...dateProps}
          name={DATE_NAME}
          form={form}
        />
      </NamePrefixProvider>
    ),
    dateInputName: prefixName(DATE_NAME, fullName),
    paymentMethodInput: (
      <NamePrefixProvider namePrefix={refundName}>
        <PaymentMethodInput<false>
          {...paymentMethodProps}
          isRefund
          renderInput={useCallback<
            NonNullable<DepartmentInputProps["renderInput"]>
          >(
            (params) =>
              (paymentMethodProps.renderInput || defaultInput)({
                label: showLabels ? "Payment Method" : undefined,
                ...params,
              }),
            [paymentMethodProps.renderInput, showLabels]
          )}
          entryType={entryType}
          multiple={false}
          form={form}
        />
      </NamePrefixProvider>
    ),
    paymentMethodInputName: prefixName(PAYMENT_METHOD_NAME, fullName),
    totalInput: (
      <NamePrefixProvider namePrefix={refundName}>
        <RationalInput
          label={showLabels && "Total"}
          decimals={2}
          helperText={`Max $${maxRefund.toString(2)}`}
          {...totalProps}
          name={TOTAL_NAME}
          form={form}
        />
      </NamePrefixProvider>
    ),
    totalInputName: prefixName(TOTAL_NAME, fullName),
    reconciledInput: (
      <NamePrefixProvider namePrefix={refundName}>
        <BoolInput
          label={showLabels && "Reconciled"}
          {...reconciledProps}
          name={RECONCILED_NAME}
          form={form}
        />
      </NamePrefixProvider>
    ),
    reconciledInputName: prefixName(RECONCILED_NAME, fullName),
  };
};
