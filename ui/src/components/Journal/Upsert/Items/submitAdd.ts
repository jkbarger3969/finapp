import { O } from "ts-toolbelt";
import { FormikConfig } from "formik";
import gql from "graphql-tag";
import { ApolloClient } from "@apollo/client";

import {
  EntryAddItemFields,
  DeptEntryOptFragment,
  CatEntryOptFragment,
  AddEntryItemMutation as AddItem,
  AddEntryItemMutationVariables as AddItemVars,
} from "../../../../apollo/graphTypes";
import { TransmutationValue } from "../../../../utils/formik";
import { JOURNAL_ENTRY_FRAGMENT } from "../../Table/Entries.gql";

export type AddValues = O.Overwrite<
  O.Required<
    EntryAddItemFields,
    keyof EntryAddItemFields,
    "deep"
  >,
  {
    total: TransmutationValue<string, EntryAddItemFields["total"]>;
    units: number;
    category: TransmutationValue<string, CatEntryOptFragment[]> | null;
    department: DeptEntryOptFragment | null;
  }
>;

const ADD_ENTRY_ITEM = gql`
  mutation AddEntryItem($id: ID!, $fields: EntryAddItemFields!) {
    entryAddItem(id: $id, fields: $fields) {
      entry {
        ...Entry_1Fragment
      }
    }
  }
  ${JOURNAL_ENTRY_FRAGMENT}
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
  const category = (() => {
    const value = values.category?.value || [];

    return value[value.length - 1]?.id ?? null;
  })();

  const department = (() => {
    return values.department?.id || null;
  })();

  const units = values.units;

  const variables: O.Required<AddItemVars, keyof AddItemVars, "deep"> = {
    id,
    fields: {
      units,
      category,
      department,
      description: values.description?.trim() || null,
      total: values.total.value,
    },
  };

  await client.mutate<AddItem, AddItemVars>({
    mutation: ADD_ENTRY_ITEM,
    variables,
  });
};

export default submitAdd;
