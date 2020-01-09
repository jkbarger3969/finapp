import gql from "graphql-tag";

import {Lc_JournalEntryUpsert_1Fragment,
  Lc_JournalEntryUpserts_1Query} from "../../apollo/graphTypes"

export type JournalEntryUpsertFragment = Lc_JournalEntryUpsert_1Fragment;
export type JournalEntryUpserts = Lc_JournalEntryUpserts_1Query;

export const LC_JOURNAL_ENTRY_UPSERT_FRAGMENT = gql`
  fragment LC_JournalEntryUpsert_1Fragment on LC_JournalEntryUpsert {
    __typename
    id
    valid
    type
    submitStatus
    submitError
    inputValues {
      deptInput
      totalInput
      srcInput
      srcType
    }
    inputErrors {
      dateError
      deptError
      typeError
      payMethodError
      totalError
      srcError
    }
    fields {
      id
      date
      department
      type
      paymentMethod
      total {
        num
        den
      }
      source {
        sourceType
        id
      }
    }
  }
`;

export const LC_JOURNAL_ENTRY_UPSERTS = gql`
  query LC_JournalEntryUpserts_1 {
    lc_journalEntryUpserts @client {
      ...LC_JournalEntryUpsert_1Fragment
    }
  }
  ${LC_JOURNAL_ENTRY_UPSERT_FRAGMENT}
`;

export const ADD_JOURNAL_ENTRY = gql`
  mutation AddJournalEntry_1($fields:JournalEntryAddFields!) {
    addJournalEntry(fields:$fields) {
      __typename
      id
    }
  }
`;

export const UPDATE_JOURNAL_ENTRY = gql`
  mutation UpdateJournalEntry_1($id:ID!, $fields:JournalEntryUpdateFields!) {
    updateJournalEntry(id:$id, fields:$fields) {
      __typename
      id
    }
  }
`;