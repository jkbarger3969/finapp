import gql from "graphql-tag";
import Fraction from "fraction.js";
import { FormikHelpers } from "formik";
import ApolloClient from "apollo-client";
import { parseName } from "humanparser";

import { Values, Status, createInitialValues } from "./UpsertEntry";
import {
  JournalEntrySourceInput,
  JournalEntrySourceType,
  UpsertEntryAddPersonMutation as AddPerson,
  UpsertEntryAddPersonMutationVariables as AddPersonVars,
  UpsertEntryAddBusinessMutation as AddBusiness,
  UpsertEntryAddBusinessMutationVariables as AddBusinessVars,
  UpsertEntryAddMutation as AddEntry,
  UpsertEntryAddMutationVariables as AddEntryVars,
  UpsertEntryUpdateMutation as UpdateEntry,
  UpsertEntryUpdateMutationVariables as UpdateEntryVars,
  JournalEntryUpdateFields,
  PayMethodEntryOptFragment,
  RationalInput
} from "../../../apollo/graphTypes";
import { SourceValue, SrcObjectValue } from "./EntryFields/Source";
import {
  SRC_ENTRY_PERSON_OPT_FRAGMENT,
  SRC_ENTRY_BIZ_OPT_FRAGMENT,
  PAY_METHOD_ENTRY_OPT_FRAGMENT
} from "./upsertEntry.gql";
import { CHECK_ID } from "../constants";

const ADD_PERSON = gql`
  mutation UpsertEntryAddPerson($fields: PersonAddFields!) {
    addPerson(fields: $fields) {
      ...SrcEntryPersonOptFragment
    }
  }
  ${SRC_ENTRY_PERSON_OPT_FRAGMENT}
`;

const ADD_BUSINESS = gql`
  mutation UpsertEntryAddBusiness($fields: BusinessAddFields!) {
    addBusiness(fields: $fields) {
      ...SrcEntryBizOptFragment
    }
  }
  ${SRC_ENTRY_BIZ_OPT_FRAGMENT}
`;

const ADD_JOURNAL_ENTRY = gql`
  mutation UpsertEntryAdd(
    $fields: JournalEntryAddFields!
    $paymentMethodAdd: PaymentMethodAddFields
  ) {
    journalEntryAdd(fields: $fields, paymentMethodAdd: $paymentMethodAdd) {
      __typename
      id
    }
  }
`;

const UPDATE_JOURNAL_ENTRY = gql`
  mutation UpsertEntryUpdate(
    $id: ID!
    $fields: JournalEntryUpdateFields!
    $paymentMethodAdd: PaymentMethodAddFields
    $paymentMethodUpdate: JournalEntryUpdatePaymentMethod
  ) {
    journalEntryUpdate(
      id: $id
      fields: $fields
      paymentMethodAdd: $paymentMethodAdd
      paymentMethodUpdate: $paymentMethodUpdate
    ) {
      __typename
      id
    }
  }
`;

const getSourceType = (sourceValue: SrcObjectValue): JournalEntrySourceType => {
  switch (sourceValue.__typename) {
    case "Business":
      return JournalEntrySourceType.Business;
    case "Person":
      return JournalEntrySourceType.Person;
    case "Department":
      return JournalEntrySourceType.Department;
  }
};

const getSource = async (
  value: Values["source"]["value"],
  formikHelpers: FormikHelpers<Values>,
  client: ApolloClient<any>
): Promise<JournalEntrySourceInput> => {
  const sourceValue = value[value.length - 1] as SourceValue;

  // Free Solo
  if (typeof sourceValue === "string") {
    const sourceType = value[0] as JournalEntrySourceType;
    if (sourceType === JournalEntrySourceType.Person) {
      const parsedName = parseName(sourceValue);

      const result = await client.mutate<AddPerson, AddPersonVars>({
        mutation: ADD_PERSON,
        variables: {
          fields: {
            name: {
              first: parsedName.firstName,
              last: parsedName.lastName
            }
          }
        }
      });

      if (!result.data?.addPerson.id) {
        throw new Error(
          "Something went wrong. Server did not respond with new person id."
        );
      }

      const newSourceField: Values["source"] = {
        inputValue: "",
        value: [sourceType, result.data.addPerson]
      };

      formikHelpers.setFieldValue("source", newSourceField, false);

      return {
        sourceType: JournalEntrySourceType.Person,
        id: result.data.addPerson.id
      };
    } else {
      const result = await client.mutate<AddBusiness, AddBusinessVars>({
        mutation: ADD_BUSINESS,
        variables: {
          fields: {
            name: sourceValue
          }
        }
      });

      if (!result.data?.addBusiness.id) {
        throw new Error(
          "Something went wrong. Server did not respond with new business id."
        );
      }

      const newSourceField: Values["source"] = {
        inputValue: "",
        value: [sourceType, result.data.addBusiness]
      };

      formikHelpers.setFieldValue("source", newSourceField, false);

      return {
        sourceType: JournalEntrySourceType.Business,
        id: result.data.addBusiness.id
      };
    }
  }

  return {
    sourceType: getSourceType(sourceValue),
    id: sourceValue.id
  };
};

function setPaymentMethod(
  upsertEntryVars: AddEntryVars,
  value: Values["paymentMethod"]["value"]
): AddEntryVars;
function setPaymentMethod(
  upsertEntryVars: UpdateEntryVars,
  value: Values["paymentMethod"]["value"],
  iniValue: Values["paymentMethod"]["value"]
): UpdateEntryVars;
function setPaymentMethod(
  upsertEntryVars: AddEntryVars | UpdateEntryVars,
  value: Values["paymentMethod"]["value"],
  iniValue?: Values["paymentMethod"]["value"]
) {
  const curValue = value[value.length - 1];
  const parent = value[value.length - 2] as
    | PayMethodEntryOptFragment
    | undefined;

  // Update
  if (iniValue) {
    const prevValue = iniValue[
      iniValue.length - 1
    ] as PayMethodEntryOptFragment;

    if (typeof curValue === "string") {
      // Update payment method
    } else if (prevValue.id !== curValue.id) {
      upsertEntryVars.fields.paymentMethod = curValue.id;
    }

    // Add check number
  } else if (typeof curValue === "string") {
    upsertEntryVars.fields.paymentMethod = "";

    if (parent?.id === CHECK_ID) {
      (upsertEntryVars as AddEntryVars).paymentMethodAdd = {
        parent: parent.id,
        name: curValue,
        active: false
      };
    } else {
      throw Error("Check number/parent type mismatch.");
    }
    // Add Payment method
  } else {
    upsertEntryVars.fields.paymentMethod = curValue.id;
  }

  return upsertEntryVars;
}

const getRational = (
  number: string | number,
  fractionDigits = 2
): RationalInput => {
  const { n: num, d: den } = new Fraction(
    (typeof number === "string" ? Number.parseFloat(number) : number).toFixed(
      fractionDigits
    )
  );

  return { num, den };
};

export default async (args: {
  values: Values;
  formikHelpers: FormikHelpers<Values>;
  setOpen: (open: boolean) => void;
  client: ApolloClient<any>;
  initialValues: Values;
  entryId?: string;
}) => {
  const {
    values,
    formikHelpers,
    setOpen,
    client,
    initialValues,
    entryId
  } = args;

  try {
    // Get field values from values
    const type = values.type as NonNullable<Values["type"]>;
    const dateField = values.date as NonNullable<Values["date"]>;
    const department = (values.department as NonNullable<Values["department"]>)
      .id;
    const category = (values.category as NonNullable<Values["category"]>).id;
    const source = await getSource(
      (values.source as NonNullable<Values["source"]>).value,
      formikHelpers,
      client
    );

    const payMethodValue = values.paymentMethod.value;

    const description = values.description?.trim() || undefined;
    const totalField = values.total as NonNullable<Values["total"]>;
    const reconciled = values.reconciled;

    const isUpdate = !!entryId;

    // Add
    if (!entryId) {
      const total = getRational(totalField);
      const date = dateField.toISOString();

      const variables = {
        fields: {
          type,
          date,
          department,
          category,
          source,
          description,
          total,
          reconciled
        }
      } as AddEntryVars;

      const curPayMethod = payMethodValue[payMethodValue.length - 1];

      if (typeof curPayMethod === "string") {
        const parentPayMethod = payMethodValue[payMethodValue.length - 2] as
          | PayMethodEntryOptFragment
          | undefined;

        if (parentPayMethod?.id === CHECK_ID) {
          variables.paymentMethodAdd = {
            parent: parentPayMethod.id,
            refId: curPayMethod,
            name: curPayMethod,
            active: false
          };
        } else {
          throw Error("Check number/parent type mismatch.");
        }

        variables.fields.paymentMethod = "";
      } else {
        variables.fields.paymentMethod = curPayMethod.id;
      }

      await client.mutate<AddEntry, AddEntryVars>({
        mutation: ADD_JOURNAL_ENTRY,
        variables
      });

      // Update
    } else {
      const fields = {} as JournalEntryUpdateFields;
      const variables = { id: entryId, fields } as UpdateEntryVars;

      // Capture fields that have changed
      if (initialValues.type !== type) {
        fields.type = type;
      }

      // Date
      if (
        !dateField.isSame(
          initialValues.date as NonNullable<typeof initialValues.date>
        )
      ) {
        fields.date = dateField.toISOString();
      }

      // Department
      if (department !== initialValues.department?.id) {
        fields.department = department;
      }

      // Category
      if (category !== initialValues.category?.id) {
        fields.category = category;
      }

      // Source
      if (
        (() => {
          const value = initialValues.source.value as SrcObjectValue[];

          const sourceValue = value[value.length - 1];
          const sourceType = getSourceType(sourceValue);

          return (
            sourceValue.id !== source.id || sourceType !== source.sourceType
          );
        })()
      ) {
        fields.source = source;
      }

      // Payment Method
      {
        const prevPayMethod = initialValues.paymentMethod.value[
          initialValues.paymentMethod.value.length - 1
        ] as PayMethodEntryOptFragment;

        const curPayMethod = payMethodValue[payMethodValue.length - 1];

        // Check number
        if (typeof curPayMethod === "string") {
          const parentPayMethod = payMethodValue[payMethodValue.length - 2] as
            | PayMethodEntryOptFragment
            | undefined;

          if (parentPayMethod?.id === CHECK_ID) {
            const prevParentPayMethod = initialValues.paymentMethod.value[
              initialValues.paymentMethod.value.length - 2
            ] as PayMethodEntryOptFragment | undefined;

            // Add payment method
            if (prevParentPayMethod?.id !== CHECK_ID) {
              variables.paymentMethodAdd = {
                parent: parentPayMethod.id,
                refId: curPayMethod,
                name: curPayMethod,
                active: false
              };

              // Update payment method
              // Ensure same check number was not entered twice
            } else if (curPayMethod !== prevPayMethod.refId) {
              variables.paymentMethodUpdate = {
                id: prevPayMethod.id,
                fields: {
                  refId: curPayMethod,
                  name: curPayMethod
                }
              };
            }
          } else {
            throw Error("Check number/parent type mismatch.");
          }
        } else if (prevPayMethod.id !== curPayMethod.id) {
          fields.paymentMethod = curPayMethod.id;
        }
      }

      // Description
      if (description && description !== initialValues.description) {
        fields.description = description;
      }

      // Total
      if (totalField !== initialValues.total) {
        fields.total = getRational(totalField);
      }

      // Reconciled
      if (reconciled !== initialValues.reconciled) {
        fields.reconciled = reconciled;
      }

      // Insure updates were processed
      if (
        Object.keys(fields).length === 0 &&
        Object.keys(variables).length < 2
      ) {
        const status: Status = {
          errors: {
            submission: "No changes detected."
          }
        };

        formikHelpers.setStatus(status);

        return;
      }

      const result = await client.mutate<UpdateEntry, UpdateEntryVars>({
        mutation: UPDATE_JOURNAL_ENTRY,
        variables
      });
    }

    // Success!
    const status: Status = {
      submitted: true,
      errors: {}
    };
    formikHelpers.setStatus(status);
    await new Promise(resolve => setTimeout(resolve, 750));
    setOpen(false);
    if (!isUpdate) {
      formikHelpers.resetForm({ values: createInitialValues() });
    }
  } catch (error) {
    const status: Status = {
      errors: {
        submission: error
      }
    };

    formikHelpers.setStatus(status);
  }
};
