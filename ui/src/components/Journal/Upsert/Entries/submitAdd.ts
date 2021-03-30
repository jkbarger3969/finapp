import { O } from "ts-toolbelt";
import { FormikConfig } from "formik";
import gql from "graphql-tag";
import { ApolloClient } from "@apollo/client";
import { parseName } from "humanparser";

import {
  EntryAddFields,
  PayMethodEntryOptFragment,
  DeptEntryOptFragment,
  CatEntryOptFragment,
  SrcEntryBizOptFragment,
  SrcEntryDeptOptFragment,
  SrcEntryPersonOptFragment,
  SourceType,
  AddEntryMutation as AddEntry,
  AddEntryMutationVariables as AddEntryVars,
} from "../../../../apollo/graphTypes";
import { TransmutationValue } from "../../../../utils/formik";
import { JOURNAL_ENTRY_FRAGMENT } from "../../Table/Entries.gql";

export type SourceValue =
  | SrcEntryBizOptFragment
  | SrcEntryDeptOptFragment
  | SrcEntryPersonOptFragment
  | string;

export type AddValues = O.Overwrite<
  O.Required<EntryAddFields, keyof EntryAddFields, "deep">,
  {
    category: TransmutationValue<string, CatEntryOptFragment[]>;
    date: TransmutationValue<Date | null, EntryAddFields["date"]>;
    total: TransmutationValue<string, EntryAddFields["total"]>;
    paymentMethod: TransmutationValue<
      string,
      (PayMethodEntryOptFragment | string)[]
    >;
    department: DeptEntryOptFragment;
    source: TransmutationValue<
      string,
      (SourceType | SourceValue)[]
    >;
  }
>;

const ADD_ENTRY = gql`
  mutation AddEntry(
    $fields: EntryAddFields!
    $paymentMethodAdd: PaymentMethodAddFields
    $personAdd: PersonAddFields
    $businessAdd: BusinessAddFields
  ) {
    entryAdd(
      fields: $fields
      paymentMethodAdd: $paymentMethodAdd
      personAdd: $personAdd
      businessAdd: $businessAdd
    ) {
      ...Entry_1Fragment
    }
  }
  ${JOURNAL_ENTRY_FRAGMENT}
`;

const submitAdd: (
  client: ApolloClient<unknown>,
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
    const srcType = values.source.value[0] as SourceType;
    const src = values.source.value[
      values.source.value.length - 1
    ] as SourceValue;

    if (typeof src === "string") {
      if (srcType === SourceType.Person) {
        const parsedName = parseName(src);

        return {
          source: {
            sourceType: SourceType.Person,
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
            sourceType: SourceType.Business,
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
              return SourceType.Business;
            case "Department":
              return SourceType.Department;
            case "Person":
              return SourceType.Person;
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
      dateOfRecord: null,
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
