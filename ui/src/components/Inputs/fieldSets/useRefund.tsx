import React, { useMemo } from "react";
import { ApolloError, gql, useQuery } from "@apollo/client";
import Fraction from "fraction.js";
import { isBefore, isFuture } from "date-fns";

import { BoolFieldDef, BoolInput, BoolInputProps } from "../BoolInput";
import { DateFieldDef, DateInput, DateInputProps } from "../Date";
import {
  DescriptionInput,
  DescriptionInputProps,
  DESCRIPTION_NAME,
  DescriptionFieldDef,
} from "../Description";
import {
  PaymentMethodFieldDef,
  PaymentMethodInput,
  PaymentMethodInputProps,
  PAYMENT_METHOD_NAME,
  PAY_METHOD_DEFAULT_VALUE_FRAGMENT,
  usePaymentMethodDefaultValue,
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
import {
  gtZero,
  requiredValidator,
  useRenderInputWithError,
  useRenderInputWithLabel,
} from "../shared";
import {
  EntryType,
  RefundEntryStateQuery as RefundEntryState,
  RefundEntryStateQueryVariables as RefundEntryStateVars,
  UpdateRefundDefaultValuesFragment as UpdateRefundDefaultValues,
} from "../../../apollo/graphTypes";
import { deserializeDate, deserializeRational } from "../../../apollo/scalars";
import { startOfDay } from "date-fns/esm";

export type RefundInputProps = {
  date?: Omit<DateInputProps, "name" | "form">;
  description?: Omit<DescriptionInputProps, "form">;
  paymentMethod: Omit<
    PaymentMethodInputProps,
    "multiple" | "entryType" | "form" | "isRefund" | "branch"
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
    DescriptionFieldDef<typeof DESCRIPTION_NAME> &
    PaymentMethodFieldDef<false> &
    RationalFieldDef<typeof TOTAL_NAME> &
    BoolFieldDef<typeof RECONCILED_NAME>;
};
export const REFUND_NAME: keyof RefundFieldDef = "refund";

const REFUND_ENTRY_STATE = gql`
  fragment UpdateRefundDefaultValues on EntryRefund {
    __typename
    id
    date
    deleted
    description
    paymentMethod {
      ...PayMethodDefaultValue
    }
    reconciled
    total
  }

  query RefundEntryState($where: EntriesWhere!) {
    entries(where: $where) {
      __typename
      id
      date
      dateOfRecord {
        date
      }
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
        ...UpdateRefundDefaultValues
      }
    }
  }
  ${PAY_METHOD_DEFAULT_VALUE_FRAGMENT}
`;

export type RefundProps = (
  | {
      entryId: string;
    }
  | { updateRefundId: string }
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
    description: descriptionProps,
    total: totalProps = {},
    reconciled: reconciledProps = {},
  } = props;

  const [entryId, updateRefundId] =
    "entryId" in props ? [props.entryId, null] : [null, props.updateRefundId];

  const refundName = insertNamePrefix
    ? prefixName(REFUND_NAME, insertNamePrefix)
    : REFUND_NAME;

  const fullName = useNamePrefix(refundName);

  const { loading, error, data } = useQuery<
    RefundEntryState,
    RefundEntryStateVars
  >(
    REFUND_ENTRY_STATE,
    useMemo(() => {
      if (entryId) {
        return {
          variables: {
            where: {
              id: { eq: entryId },
            },
          },
        };
      } else if (updateRefundId) {
        return {
          variables: {
            where: {
              refunds: {
                id: {
                  eq: updateRefundId as string,
                },
              },
            },
          },
        };
      } else {
        return {
          skip: true,
        };
      }
    }, [entryId, updateRefundId])
  );

  useLoading({
    loading,
    name: useMemo(
      () => [
        prefixName(DATE_NAME, refundName),
        prefixName(PAYMENT_METHOD_NAME, refundName),
        prefixName(TOTAL_NAME, refundName),
        prefixName(RECONCILED_NAME, refundName),
      ],
      [refundName]
    ),
    form,
  });

  const [entry] = data?.entries || [];

  const entryType: EntryType | null = entry?.category?.type ?? null;

  const [maxRefund, updateRefund] = useMemo(() => {
    let updateRefund: UpdateRefundDefaultValues | undefined;
    const maxRefund = (entry?.refunds || []).reduce(
      (maxRefund, refund) => {
        if (refund.id === updateRefundId) {
          updateRefund = refund;
          return maxRefund;
        }

        return refund.deleted
          ? maxRefund
          : maxRefund.sub(deserializeRational(refund.total));
      },
      entry?.total ? deserializeRational(entry?.total) : new Fraction(0)
    );

    return [maxRefund, updateRefund];
  }, [entry?.refunds, entry?.total, updateRefundId]);

  const minDate = useMemo(
    () => (entry ? deserializeDate(entry.date) : new Date("1900-01-01")),
    [entry]
  );

  useValidators<RefundFieldDef>(
    useMemo<UseValidatorOptions<RefundFieldDef>>(() => {
      const lteMaxTotalError = new RangeError(
        `Refund cannot exceed $${maxRefund.toString(2)}`
      );
      const lteMaxTotal: Validator<Fraction> = (value) => {
        if (value && value.compare(maxRefund) > 0) {
          return lteMaxTotalError;
        }
      };

      const beforeMinDateError = new RangeError(
        `Refund cannot be given before originating transaction.`
      );
      const afterMaxDateError = new RangeError(
        `Refund cannot recorded in the future.`
      );
      const validDateRange: Validator<Date> = (value) => {
        if (!value) {
          return;
        } else if (isFuture(value)) {
          return afterMaxDateError;
        } else if (isBefore(value, startOfDay(minDate))) {
          return beforeMinDateError;
        }
      };

      if (required) {
        return {
          validators: {
            refund: {
              date: [requiredValidator, validDateRange],
              paymentMethod: requiredValidator,
              total: [requiredValidator, gtZero, lteMaxTotal],
            },
          },
          form,
        };
      } else {
        return {
          validators: {
            refund: {
              date: validDateRange,
              total: [gtZero, lteMaxTotal],
            },
          },
          form,
        };
      }
    }, [form, maxRefund, minDate, required])
  );

  const dateDefaultValue = useMemo(
    () => (updateRefund?.date ? deserializeDate(updateRefund.date) : undefined),
    [updateRefund?.date]
  );

  const payMethodRenderInput = useRenderInputWithError(
    error,
    useRenderInputWithLabel(
      showLabels ? "Payment Method" : undefined,
      paymentMethodProps?.renderInput
    )
  );
  const payMethodDefaultValue = usePaymentMethodDefaultValue(
    (() => {
      if (updateRefund?.paymentMethod) {
        return updateRefund?.paymentMethod;
      } else if (entry?.paymentMethod?.__typename === "PaymentMethodCard") {
        return entry?.paymentMethod;
      }
    })()
  );

  const totalDefaultValue = useMemo(
    () =>
      updateRefund?.total ? deserializeRational(updateRefund.total) : undefined,
    [updateRefund?.total]
  );

  return {
    error,
    dateInput: useMemo(
      () => (
        <NamePrefixProvider namePrefix={refundName}>
          <DateInput
            label={showLabels && "Date"}
            defaultValue={dateDefaultValue}
            minDate={minDate}
            {...dateProps}
            name={DATE_NAME}
            form={form}
          />
        </NamePrefixProvider>
      ),
      [dateDefaultValue, dateProps, form, minDate, refundName, showLabels]
    ),
    dateInputName: prefixName(DATE_NAME, fullName),
    paymentMethodInput: useMemo(
      () => (
        <NamePrefixProvider namePrefix={refundName}>
          <PaymentMethodInput<false>
            defaultValue={payMethodDefaultValue}
            {...paymentMethodProps}
            isRefund
            renderInput={payMethodRenderInput}
            entryType={entryType}
            multiple={false}
            form={form}
          />
        </NamePrefixProvider>
      ),
      [
        entryType,
        form,
        payMethodDefaultValue,
        payMethodRenderInput,
        paymentMethodProps,
        refundName,
      ]
    ),
    paymentMethodInputName: prefixName(PAYMENT_METHOD_NAME, fullName),
    descriptionInput: useMemo(
      () => (
        <NamePrefixProvider namePrefix={refundName}>
          <DescriptionInput
            label={showLabels && "Description"}
            defaultValue={updateRefund?.description ?? undefined}
            {...descriptionProps}
            name={DESCRIPTION_NAME}
            form={form}
          />
        </NamePrefixProvider>
      ),
      [
        refundName,
        showLabels,
        updateRefund?.description,
        descriptionProps,
        form,
      ]
    ),
    descriptionInputName: prefixName(DESCRIPTION_NAME, fullName),
    totalInput: useMemo(
      () => (
        <NamePrefixProvider namePrefix={refundName}>
          <RationalInput
            label={showLabels && "Total"}
            decimals={2}
            helperText={`Max $${maxRefund.toString(2)}`}
            defaultValue={totalDefaultValue}
            {...totalProps}
            name={TOTAL_NAME}
            form={form}
          />
        </NamePrefixProvider>
      ),
      [form, maxRefund, refundName, showLabels, totalDefaultValue, totalProps]
    ),
    totalInputName: prefixName(TOTAL_NAME, fullName),
    reconciledInput: useMemo(
      () => (
        <NamePrefixProvider namePrefix={refundName}>
          <BoolInput
            label={showLabels && "Reconciled"}
            defaultValue={!!updateRefund?.reconciled}
            {...reconciledProps}
            name={RECONCILED_NAME}
            form={form}
          />
        </NamePrefixProvider>
      ),
      [form, reconciledProps, refundName, showLabels, updateRefund?.reconciled]
    ),
    reconciledInputName: prefixName(RECONCILED_NAME, fullName),
  };
};
