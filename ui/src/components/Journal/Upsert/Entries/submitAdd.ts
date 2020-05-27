import { O } from "ts-toolbelt";
import { FormikConfig } from "formik";
import gql from "graphql-tag";
import ApolloClient from "apollo-client";
import { parseName } from "humanparser";

import {
  JournalEntryAddFields,
  PayMethodEntryOptFragment,
  DeptEntryOptFragment,
  CatEntryOptFragment,
  SrcEntryBizOptFragment,
  SrcEntryDeptOptFragment,
  SrcEntryPersonOptFragment,
  JournalEntrySourceType,
  AddEntryMutation as AddEntry,
  AddEntryMutationVariables as AddEntryVars,
} from "../../../../apollo/graphTypes";
import { TransmutationValue } from "../../../../formik/utils";
import { JOURNAL_ENTRY_FRAGMENT } from "../../Table/JournalEntries.gql";

export type SourceValue =
  | SrcEntryBizOptFragment
  | SrcEntryDeptOptFragment
  | SrcEntryPersonOptFragment
  | string;

export type AddValues = O.Overwrite<
  O.Required<JournalEntryAddFields, keyof JournalEntryAddFields, "deep">,
  {
    category: TransmutationValue<string, CatEntryOptFragment[]>;
    date: TransmutationValue<Date | null, JournalEntryAddFields["date"]>;
    total: TransmutationValue<string, JournalEntryAddFields["total"]>;
    paymentMethod: TransmutationValue<
      string,
      (PayMethodEntryOptFragment | string)[]
    >;
    department: DeptEntryOptFragment;
    source: TransmutationValue<
      string,
      (JournalEntrySourceType | SourceValue)[]
    >;
  }
>;

const ADD_ENTRY = gql`
  mutation AddEntry(
    $fields: JournalEntryAddFields!
    $paymentMethodAdd: PaymentMethodAddFields
    $personAdd: PersonAddFields
    $businessAdd: BusinessAddFields
  ) {
    journalEntryAdd(
      fields: $fields
      paymentMethodAdd: $paymentMethodAdd
      personAdd: $personAdd
      businessAdd: $businessAdd
    ) {
      ...JournalEntry_1Fragment
    }
  }
  ${JOURNAL_ENTRY_FRAGMENT}
`;

const submitAdd: (
  client: ApolloClient<any>,
  ...rest: Parameters<FormikConfig<AddValues>["onSubmit"]>
) => ReturnType<FormikConfig<AddValues>["onSubmit"]> = async (
  client,
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

  const { source, personAdd, businessAdd } = (() => {
    const srcType = values.source.value[0] as JournalEntrySourceType;
    const src = values.source.value[
      values.source.value.length - 1
    ] as SourceValue;

    if (typeof src === "string") {
      if (srcType === JournalEntrySourceType.Person) {
        const parsedName = parseName(src);

        return {
          source: {
            sourceType: JournalEntrySourceType.Person,
            id: "",
          },
          businessAdd: null,
          personAdd: {
            name: {
              first: parsedName.firstName,
              last: parsedName.lastName,
            },
          },
        };
      } else {
        return {
          source: {
            sourceType: JournalEntrySourceType.Business,
            id: "",
          },
          businessAdd: {
            name: src,
          },
          personAdd: null,
        };
      }
    }

    return {
      source: {
        sourceType: (() => {
          switch (src.__typename) {
            case "Business":
              return JournalEntrySourceType.Business;
            case "Department":
              return JournalEntrySourceType.Department;
            case "Person":
              return JournalEntrySourceType.Person;
          }
        })(),
        id: src.id,
      },
      personAdd: null,
      businessAdd: null,
    };
  })();

  const variables: O.Required<AddEntryVars, keyof AddEntryVars, "deep"> = {
    fields: {
      date: values.date.value,
      department: values.department.id,
      type: values.type,
      category: values.category.value[values.category.value.length - 1].id,
      description: values.description?.trim() || null,
      total: values.total.value,
      reconciled: values.reconciled ?? null,
      paymentMethod,
      source,
    },
    paymentMethodAdd,
    personAdd,
    businessAdd,
  };

  await client.mutate<AddEntry, AddEntryVars>({
    mutation: ADD_ENTRY,
    variables,
  });
};

export default submitAdd;
