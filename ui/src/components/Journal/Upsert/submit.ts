import gql from "graphql-tag";
import Fraction from "fraction.js";
import { FormikHelpers } from "formik";
import ApolloClient from "apollo-client";
import { parseName } from "humanparser";

import { Values, Status } from "./UpsertEntry";
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
  JournalEntryUpdateFields
} from "../../../apollo/graphTypes";
import { SourceValue, SrcObjectValue } from "./EntryFields/Source";
import {
  SRC_ENTRY_PERSON_OPT_FRAGMENT,
  SRC_ENTRY_BIZ_OPT_FRAGMENT
} from "./upsertEntry.gql";

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
  mutation UpsertEntryAdd($fields: JournalEntryAddFields!) {
    journalEntryAdd(fields: $fields) {
      __typename
      id
    }
  }
`;

const UPDATE_JOURNAL_ENTRY = gql`
  mutation UpsertEntryUpdate($id: ID!, $fields: JournalEntryUpdateFields!) {
    journalEntryUpdate(id: $id, fields: $fields) {
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

export default async (args: {
  values: Values;
  formikHelpers: FormikHelpers<Values>;
  close: () => void;
  client: ApolloClient<any>;
  initialValues: Values;
  entryId?: string;
}) => {
  const { values, formikHelpers, close, client, initialValues, entryId } = args;

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
    const paymentMethod = values.paymentMethod as NonNullable<
      Values["paymentMethod"]
    >;
    const description = values.description as NonNullable<
      Values["description"]
    >;
    const totalField = values.total as NonNullable<Values["total"]>;
    const reconciled = values.reconciled;

    // Update
    if (entryId) {
      const fields = {} as JournalEntryUpdateFields;

      // Capture fields that have changed
      if (initialValues.type !== type) {
        fields.type = type;
      }

      if (
        !dateField.isSame(
          initialValues.date as NonNullable<typeof initialValues.date>
        )
      ) {
        fields.date = dateField.toISOString();
      }

      if (department !== initialValues.department?.id) {
        fields.department = department;
      }

      if (category !== initialValues.category?.id) {
        fields.category = category;
      }

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

      if (paymentMethod !== initialValues.paymentMethod) {
        fields.paymentMethod = paymentMethod;
      }

      if (description && description !== initialValues.description) {
        fields.description = description;
      }

      if (totalField !== initialValues.total) {
        const { n: num, d: den } = new Fraction(
          (typeof totalField === "string"
            ? Number.parseFloat(totalField)
            : totalField
          ).toFixed(2)
        );
        fields.total = { num, den };
      }

      if (reconciled !== initialValues.reconciled) {
        fields.reconciled = reconciled;
      }

      if (Object.keys(fields).length === 0) {
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
        variables: {
          id: entryId,
          fields
        }
      });

      // Add
    } else {
      const { n: num, d: den } = new Fraction(
        (typeof totalField === "string"
          ? Number.parseFloat(totalField)
          : totalField
        ).toFixed(2)
      );
      const total = { num, den };
      const date = dateField.toISOString();

      const result = await client.mutate<AddEntry, AddEntryVars>({
        mutation: ADD_JOURNAL_ENTRY,
        variables: {
          fields: {
            type,
            date,
            department,
            category,
            source,
            paymentMethod,
            description,
            total,
            reconciled
          }
        }
      });
    }

    // Success!
    const status: Status = {
      submitted: true,
      errors: {}
    };
    formikHelpers.setStatus(status);
    await new Promise(resolve => setTimeout(resolve, 1000));
    close();
    formikHelpers.resetForm();
  } catch (error) {
    const status: Status = {
      errors: {
        submission: error
      }
    };

    formikHelpers.setStatus(status);
  }
};
