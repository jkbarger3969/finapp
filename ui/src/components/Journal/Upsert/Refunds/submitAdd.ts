import { O } from "ts-toolbelt";
import { FormikConfig } from "formik";
import gql from "graphql-tag";
import ApolloClient from "apollo-client";

import {
  JournalEntryAddRefundFields,
  PayMethodEntryOptFragment,
  AddEntryRefundMutation as AddRefund,
  AddEntryRefundMutationVariables as AddRefundVars,
} from "../../../../apollo/graphTypes";
import { TransmutationValue } from "../../../../utils/formik";
import { JOURNAL_ENTRY_REFUND } from "../../Table/JournalEntries.gql";

export type AddValues = O.Overwrite<
  O.Required<
    JournalEntryAddRefundFields,
    keyof JournalEntryAddRefundFields,
    "deep"
  >,
  {
    date: TransmutationValue<Date | null, JournalEntryAddRefundFields["date"]>;
    total: TransmutationValue<string, JournalEntryAddRefundFields["total"]>;
    paymentMethod: TransmutationValue<
      string,
      (PayMethodEntryOptFragment | string)[]
    >;
  }
>;

const ADD_REFUND = gql`
  mutation AddEntryRefund(
    $id: ID!
    $fields: JournalEntryAddRefundFields!
    $paymentMethodAdd: PaymentMethodAddFields
  ) {
    journalEntryAddRefund(
      id: $id
      fields: $fields
      paymentMethodAdd: $paymentMethodAdd
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

const submitAdd: (
  client: ApolloClient<unknown>,
  id: string,
  ...rest: Parameters<FormikConfig<AddValues>["onSubmit"]>
) => ReturnType<FormikConfig<AddValues>["onSubmit"]> = async (
  client,
  id,
  values
) => {
  const { paymentMethod, paymentMethodAdd } = (() => {
    const payMethod =
      values.paymentMethod.value[values.paymentMethod.value.length - 1];

    // New Payment Method
    if (typeof payMethod === "string") {
      const parent = (values.paymentMethod.value[
        values.paymentMethod.value.length - 2
      ] as PayMethodEntryOptFragment).id;

      return {
        paymentMethod: "",
        paymentMethodAdd: {
          parent,
          refId: payMethod,
          name: payMethod,
          active: false,
        },
      };
    }

    return {
      paymentMethod: payMethod.id,
      paymentMethodAdd: null,
    };
  })();

  const variables: O.Required<AddRefundVars, keyof AddRefundVars, "deep"> = {
    id,
    fields: {
      date: values.date.value,
      description: values.description?.trim()
        ? values.description.trim()
        : null,
      paymentMethod,
      total: values.total.value,
      reconciled: values.reconciled ?? null,
    },
    paymentMethodAdd,
  };

  await client.mutate<AddRefund, AddRefundVars>({
    mutation: ADD_REFUND,
    variables,
  });
};

export default submitAdd;
