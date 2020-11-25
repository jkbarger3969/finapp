import { O, U } from "ts-toolbelt";
import { FormikConfig } from "formik";
import gql from "graphql-tag";
import { ApolloClient } from "@apollo/client";
import { isEqual } from "date-fns";
import { parseName } from "humanparser";

import {
  JournalEntryUpdateFields,
  PayMethodEntryOptFragment,
  DeptEntryOptFragment,
  CatEntryOptFragment,
  JournalEntrySourceType,
  UpdateEntryMutation as UpdateEntry,
  UpdateEntryMutationVariables as UpdateEntryVars,
  JournalEntryDateOfRecordUpdate,
} from "../../../../apollo/graphTypes";
import { TransmutationValue } from "../../../../utils/formik";
import { CHECK_ID } from "../../constants";
import { JOURNAL_ENTRY_FRAGMENT } from "../../Table/JournalEntries.gql";
import { SourceValue } from "./submitAdd";
import { rationalToFraction } from "../../../../utils/rational";

const NULLISH = Symbol();

export type UpdateValues = O.NonNullable<
  O.Overwrite<
    O.Required<
      JournalEntryUpdateFields,
      keyof JournalEntryUpdateFields,
      "deep"
    >,
    {
      category: TransmutationValue<string, CatEntryOptFragment[]>;
      date: TransmutationValue<
        Date,
        NonNullable<JournalEntryUpdateFields["date"]>
      >;
      dateOfRecord: O.Overwrite<
        JournalEntryDateOfRecordUpdate,
        {
          date: TransmutationValue<
            Date | null,
            NonNullable<JournalEntryDateOfRecordUpdate["date"]>
          >;
        }
      > | null;
      total: TransmutationValue<
        string,
        NonNullable<JournalEntryUpdateFields["total"]>
      >;
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
  >,
  keyof Omit<JournalEntryUpdateFields, "description" | "dateOfRecord">
>;

export type IniUpdateValues = O.Overwrite<
  UpdateValues,
  {
    paymentMethod: TransmutationValue<string, PayMethodEntryOptFragment[]>;
    source: TransmutationValue<
      string,
      (JournalEntrySourceType | U.Exclude<SourceValue, string>)[]
    >;
  }
>;

const UPDATE_ENTRY = gql`
  mutation UpdateEntry(
    $id: ID!
    $fields: JournalEntryUpdateFields!
    $paymentMethodAdd: PaymentMethodAddFields
    $paymentMethodUpdate: JournalEntryUpdatePaymentMethod
    $personAdd: PersonAddFields
    $businessAdd: BusinessAddFields
  ) {
    journalEntryUpdate(
      id: $id
      fields: $fields
      paymentMethodAdd: $paymentMethodAdd
      paymentMethodUpdate: $paymentMethodUpdate
      personAdd: $personAdd
      businessAdd: $businessAdd
    ) {
      ...JournalEntry_1Fragment
    }
  }
  ${JOURNAL_ENTRY_FRAGMENT}
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
  // Category
  const category = (() => {
    const category =
      values.category.value[values.category.value.length - 1]?.id ?? null;

    return category ===
      (iniValues.category.value[iniValues.category.value.length - 1]?.id ??
        null)
      ? null
      : category;
  })();

  // Date
  const date = isEqual(iniValues.date.inputValue, values.date.inputValue)
    ? null
    : values.date.value;

  // Date of Record
  const dateOfRecord = (() => {
    const dateOfRecord = {} as JournalEntryDateOfRecordUpdate;
    // date
    if (
      !isEqual(
        iniValues?.dateOfRecord?.date?.inputValue ?? 0,
        values?.dateOfRecord?.date?.inputValue ?? 0
      )
    ) {
      dateOfRecord.date = values?.dateOfRecord?.date?.value ?? null;
    }

    // overrideFiscalYear
    if (
      iniValues?.dateOfRecord?.overrideFiscalYear !==
      values?.dateOfRecord?.overrideFiscalYear
    ) {
      dateOfRecord.overrideFiscalYear =
        values?.dateOfRecord?.overrideFiscalYear ?? null;
    }

    // clear
    if (iniValues?.dateOfRecord?.clear !== values?.dateOfRecord?.clear) {
      dateOfRecord.clear = values?.dateOfRecord?.clear ?? null;
    }

    return dateOfRecord.date ||
      (dateOfRecord.clear ?? NULLISH) !== NULLISH ||
      (dateOfRecord.overrideFiscalYear ?? NULLISH) !== NULLISH
      ? dateOfRecord
      : null;
  })();

  // Department
  const department =
    values.department.id === iniValues.department.id
      ? null
      : values.department.id;

  // Description
  const description =
    values.description?.trim() && values.description !== iniValues.description
      ? (values.description as string).trim()
      : null;

  // Total
  const total =
    rationalToFraction(values.total.value).compare(
      rationalToFraction(iniValues.total.value)
    ) === 0
      ? null
      : values.total.value;

  // Type
  const type = values.type === iniValues.type ? null : values.type;

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

  // Source
  const { source, personAdd, businessAdd } = (() => {
    const srcType = values.source.value[0] as JournalEntrySourceType;
    const src = values.source.value[
      values.source.value.length - 1
    ] as SourceValue;

    const iniSrcType = iniValues.source.value[0] as JournalEntrySourceType;
    const iniSrc = iniValues.source.value[
      iniValues.source.value.length - 1
    ] as Exclude<SourceValue, string>;

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
    } else if (srcType === iniSrcType && src.id === iniSrc.id) {
      // No Updates
      return {
        source: null,
        businessAdd: null,
        personAdd: null,
      };
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

  const variables: O.Overwrite<
    O.Required<UpdateEntryVars, keyof Omit<UpdateEntryVars, "fields">, "deep">,
    {
      fields: O.Required<
        UpdateEntryVars["fields"],
        keyof Omit<UpdateEntryVars["fields"], "dateOfRecord">,
        "deep"
      >;
    }
  > = {
    id,
    fields: {
      category,
      date,
      dateOfRecord,
      department,
      description,
      total,
      type,
      source,
      reconciled,
      paymentMethod,
    },
    paymentMethodAdd,
    paymentMethodUpdate,
    personAdd,
    businessAdd,
  };

  await client.mutate<UpdateEntry, UpdateEntryVars>({
    mutation: UPDATE_ENTRY,
    variables,
  });
};

export default submitUpdate;
