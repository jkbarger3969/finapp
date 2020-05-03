import { O } from "ts-toolbelt";
import { FormikConfig } from "formik";
import gql from "graphql-tag";
import ApolloClient from "apollo-client";
import { isEqual } from "date-fns";

import {
  JournalEntryUpdateRefundFields,
  PayMethodEntryOptFragment,
  UpdateRefundMutation as UpdateRefund,
  UpdateRefundMutationVariables as UpdateRefundVars,
} from "../../../../apollo/graphTypes";
import { TransmutationValue } from "../../../../formik/utils";
import { JOURNAL_ENTRY_REFUND } from "../../Table/JournalEntries.gql";
import { CHECK_ID } from "../../constants";

export type UpdateValues = O.NonNullable<
  O.Overwrite<
    O.Required<JournalEntryUpdateRefundFields>,
    {
      date: TransmutationValue<
        Date,
        NonNullable<JournalEntryUpdateRefundFields["date"]>
      >;
      total: TransmutationValue<
        string,
        NonNullable<JournalEntryUpdateRefundFields["total"]>
      >;
      paymentMethod: TransmutationValue<
        string,
        (PayMethodEntryOptFragment | string)[]
      >;
    }
  >,
  keyof Omit<JournalEntryUpdateRefundFields, "description">
>;

export type IniUpdateValues = O.Overwrite<
  UpdateValues,
  {
    paymentMethod: TransmutationValue<string, PayMethodEntryOptFragment[]>;
  }
>;

const UPDATE_REFUND = gql`
  mutation UpdateRefund(
    $id: ID!
    $fields: JournalEntryUpdateRefundFields!
    $paymentMethodAdd: PaymentMethodAddFields
    $paymentMethodUpdate: JournalEntryUpdatePaymentMethod
  ) {
    journalEntryUpdateRefund(
      id: $id
      fields: $fields
      paymentMethodAdd: $paymentMethodAdd
      paymentMethodUpdate: $paymentMethodUpdate
    ) {
      id
      __typename
      refunds {
        ...JournalEntryRefund_1Fragment
      }
    }
  }
  ${JOURNAL_ENTRY_REFUND}
`;

const submitUpdate: (
  client: ApolloClient<any>,
  iniValues: IniUpdateValues,
  id: string,
  ...rest: Parameters<FormikConfig<UpdateValues>["onSubmit"]>
) => ReturnType<FormikConfig<UpdateValues>["onSubmit"]> = async (
  client,
  iniValues,
  id,
  values
) => {
  // Date
  const date = isEqual(iniValues.date.inputValue, values.date.inputValue)
    ? null
    : values.date.value;

  // Description
  const description =
    (values.description || "").trim() &&
    values.description !== iniValues.description
      ? (values.description as string).trim()
      : null;

  // Total
  const total =
    values.total.value.num / values.total.value.den ===
    iniValues.total.value.num / iniValues.total.value.den
      ? null
      : values.total.value;

  // Reconciled
  const reconciled =
    values.reconciled === iniValues.reconciled ? null : values.reconciled;

  // Payment Method
  const { paymentMethod, paymentMethodAdd, paymentMethodUpdate } = (() => {
    const iniPayMethod =
      iniValues.paymentMethod.value[iniValues.paymentMethod.value.length - 1];

    const [payMethod, parent] = values.paymentMethod.value
      .slice(-2)
      .reverse() as [
      string | PayMethodEntryOptFragment,
      PayMethodEntryOptFragment
    ];

    // Currently CHECK Numbers only
    if (typeof payMethod === "string") {
      // Update check number on payment method
      if (iniPayMethod.parent && iniPayMethod.parent.id === CHECK_ID) {
        return {
          paymentMethod: null,
          paymentMethodAdd: null,
          paymentMethodUpdate: {
            id: iniPayMethod.id,
            fields: {
              active: null,
              refId: payMethod,
              name: payMethod,
            },
          },
        };

        // Add new check number payment method
      } else {
        return {
          paymentMethod: null,
          paymentMethodAdd: {
            parent: parent.id,
            refId: payMethod,
            name: payMethod,
            active: false,
          },
          paymentMethodUpdate: null,
        };
      }
      // Update payment method
    } else if (payMethod.id !== iniPayMethod.id) {
      return {
        paymentMethod: payMethod.id,
        paymentMethodAdd: null,
        paymentMethodUpdate: null,
      };
    }

    return {
      paymentMethod: null,
      paymentMethodAdd: null,
      paymentMethodUpdate: null,
    };
  })();

  const variables: O.Required<
    UpdateRefundVars,
    keyof UpdateRefundVars,
    "deep"
  > = {
    id,
    fields: {
      date,
      description,
      total,
      reconciled,
      paymentMethod,
    },
    paymentMethodAdd,
    paymentMethodUpdate,
  };

  await client.mutate<UpdateRefund, UpdateRefundVars>({
    mutation: UPDATE_REFUND,
    variables,
  });
};

export default submitUpdate;
