import { O, U } from "ts-toolbelt";
import { FormikConfig } from "formik";
import gql from "graphql-tag";
import { ApolloClient } from "@apollo/client";
import { isEqual } from "date-fns";
import { parseName } from "humanparser";

import {
  EntryUpdateFields,
  DeptEntryOptFragment,
  CatEntryOptFragment,
  SourceType,
  UpdateEntryMutation as UpdateEntry,
  UpdateEntryMutationVariables as UpdateEntryVars,
  EntryDateOfRecordUpdate,
} from "../../../../apollo/graphTypes";
import { deserializeRational } from "../../../../apollo/scalars";
import { TransmutationValue } from "../../../../utils/formik";
import { CHECK_ID } from "../../constants";
import { JOURNAL_ENTRY_FRAGMENT } from "../../Table/Entries.gql";
import { SourceValue } from "./submitAdd";

const NULLISH = Symbol();

export type UpdateValues = O.NonNullable<
  O.Overwrite<
    O.Required<EntryUpdateFields, keyof EntryUpdateFields, "deep">,
    {
      category: TransmutationValue<string, CatEntryOptFragment[]>;
      date: TransmutationValue<Date, NonNullable<EntryUpdateFields["date"]>>;
      dateOfRecord: O.Overwrite<
        EntryDateOfRecordUpdate,
        {
          date: TransmutationValue<
            Date | null,
            NonNullable<EntryDateOfRecordUpdate["date"]>
          >;
        }
      > | null;
      total: TransmutationValue<
        string,
        NonNullable<EntryUpdateFields["total"]>
      >;
      paymentMethod: TransmutationValue<
        string,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (any | string)[]
      >;
      department: DeptEntryOptFragment;
      source: TransmutationValue<string, (SourceType | SourceValue)[]>;
    }
  >,
  keyof Omit<EntryUpdateFields, "description" | "dateOfRecord">
>;

export type IniUpdateValues = O.Overwrite<
  UpdateValues,
  {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    paymentMethod: TransmutationValue<string, any[]>;
    source: TransmutationValue<
      string,
      (SourceType | U.Exclude<SourceValue, string>)[]
    >;
  }
>;

const UPDATE_ENTRY = gql`
  mutation UpdateEntry(
    $id: ID!
    $fields: EntryUpdateFields!
    $paymentMethodUpdate: EntryUpdatePaymentMethod
    $personAdd: PersonAddFields
    $businessAdd: BusinessAddFields
  ) {
    entryUpdate(
      id: $id
      fields: $fields
      paymentMethodUpdate: $paymentMethodUpdate
      personAdd: $personAdd
      businessAdd: $businessAdd
    ) {
      ...Entry_1Fragment
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
    const dateOfRecord = {} as EntryDateOfRecordUpdate;
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
    deserializeRational(values.total.value).compare(
      deserializeRational(iniValues.total.value)
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

  // Source
  const { source, personAdd, businessAdd } = (() => {
    const srcType = values.source.value[0] as SourceType;
    const src = values.source.value[
      values.source.value.length - 1
    ] as SourceValue;

    const iniSrcType = iniValues.source.value[0] as SourceType;
    const iniSrc = iniValues.source.value[
      iniValues.source.value.length - 1
    ] as Exclude<SourceValue, string>;

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
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } as any;

  await client.mutate<UpdateEntry, UpdateEntryVars>({
    mutation: UPDATE_ENTRY,
    variables,
  });
};

export default submitUpdate;
