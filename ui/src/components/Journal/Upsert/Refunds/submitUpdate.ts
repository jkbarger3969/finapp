import { O } from "ts-toolbelt";
import { FormikConfig } from "formik";
import gql from "graphql-tag";
import { ApolloClient } from "@apollo/client";
import { isEqual } from "date-fns";

import {
  EntryUpdateRefundFields,
  UpdateRefundMutation as UpdateRefund,
  UpdateRefundMutationVariables as UpdateRefundVars,
} from "../../../../apollo/graphTypes";
import { deserializeRational } from "../../../../apollo/scalars";
import { TransmutationValue } from "../../../../utils/formik";
import { JOURNAL_ENTRY_REFUND } from "../../Table/Entries.gql";
import { CHECK_ID } from "../../constants";

export type UpdateValues = O.NonNullable<
  O.Overwrite<
    O.Required<EntryUpdateRefundFields>,
    {
      date: TransmutationValue<
        Date,
        NonNullable<EntryUpdateRefundFields["date"]>
      >;
      total: TransmutationValue<
        string,
        NonNullable<EntryUpdateRefundFields["total"]>
      >;
      paymentMethod: TransmutationValue<
        string,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (any | string)[]
      >;
    }
  >,
  keyof Omit<EntryUpdateRefundFields, "description">
>;

export type IniUpdateValues = O.Overwrite<
  UpdateValues,
  {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    paymentMethod: TransmutationValue<string, any[]>;
  }
>;

const UPDATE_REFUND = gql`
  mutation UpdateRefund(
    $id: ID!
    $fields: EntryUpdateRefundFields!
    $paymentMethodUpdate: EntryUpdatePaymentMethod
  ) {
    entryUpdateRefund(
      id: $id
      fields: $fields
      paymentMethodUpdate: $paymentMethodUpdate
    ) {
      id
      __typename
      refunds {
        ...EntryRefund_1Fragment
      }
    }
  }
  ${JOURNAL_ENTRY_REFUND}
`;

const submitUpdate: (
  client: ApolloClient<unknown>,
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
    values.description !== iniValues.description
      ? values.description?.trim() ?? ""
      : null;

  // Total
  const total =
    deserializeRational(values.total.value).compare(
      deserializeRational(iniValues.total.value)
    ) === 0
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
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      string | any,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      any
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
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } as any;

  await client.mutate<UpdateRefund, UpdateRefundVars>({
    mutation: UPDATE_REFUND,
    variables,
  });
};

export default submitUpdate;
