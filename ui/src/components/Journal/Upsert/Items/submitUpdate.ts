import { O } from "ts-toolbelt";
import { FormikConfig } from "formik";
import gql from "graphql-tag";
import ApolloClient from "apollo-client";

import {
  JournalEntryUpdateItemFields,
  DeptEntryOptFragment,
  CatEntryOptFragment,
  UpdateEntryItemMutation as UpdateItem,
  UpdateEntryItemMutationVariables as UpdateItemVars,
} from "../../../../apollo/graphTypes";
import { TransmutationValue } from "../../../../utils/formik";
import { JOURNAL_ENTRY_ITEM } from "../../Table/JournalEntries.gql";
import { rationalToFraction } from "../../../../utils/rational";

export type UpdateValues = O.NonNullable<
  O.Overwrite<
    O.Required<JournalEntryUpdateItemFields>,
    {
      total: TransmutationValue<
        string,
        NonNullable<JournalEntryUpdateItemFields["total"]>
      >;
      category: TransmutationValue<string, CatEntryOptFragment[]>;
      department: DeptEntryOptFragment | null;
    }
  >,
  keyof Pick<JournalEntryUpdateItemFields, "total">,
  "deep"
>;

const UPDATE_ITEM = gql`
  mutation UpdateEntryItem($id: ID!, $fields: JournalEntryUpdateItemFields!) {
    journalEntryUpdateItem(id: $id, fields: $fields) {
      journalEntryItem {
        ...JournalEntryItem_1Fragment
      }
    }
  }
  ${JOURNAL_ENTRY_ITEM}
`;

const submitUpdate: (
  client: ApolloClient<unknown>,
  iniValues: UpdateValues,
  id: string,
  ...rest: Parameters<FormikConfig<UpdateValues>["onSubmit"]>
) => ReturnType<FormikConfig<UpdateValues>["onSubmit"]> = async (
  client,
  iniValues,
  id,
  values
) => {
  // Description
  const description =
    values.description !== iniValues.description
      ? values.description?.trim() || null
      : null;

  // Department
  const department =
    values.department?.id === iniValues.department?.id
      ? null
      : values.department?.id ?? null;

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

  // Units
  const units = values.units === iniValues.units ? null : values.units;

  // Total
  const total =
    rationalToFraction(values.total.value).compare(
      rationalToFraction(iniValues.total.value)
    ) === 0
      ? null
      : values.total.value;

  const variables: O.Required<UpdateItemVars, keyof UpdateItemVars, "deep"> = {
    id,
    fields: {
      units,
      description,
      department,
      category,
      total,
    },
  };

  await client.mutate<UpdateItem, UpdateItemVars>({
    mutation: UPDATE_ITEM,
    variables,
  });
};

export default submitUpdate;
