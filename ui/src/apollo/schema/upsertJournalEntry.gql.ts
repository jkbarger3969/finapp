import gql from "graphql-tag";

export default gql`
  type LC_JournalEntryUpsertSource {
    sourceType: JournalEntrySourceType!
    id: ID!
  }

  type LC_JournalEntryUpsertFields {
    id: ID
    date: String
    department: [ID!]!
    type: ID
    paymentMethod: ID
    total: Rational
    source: [LC_JournalEntryUpsertSource!]!
  }

  type LC_JournalEntryUpsertInputValues {
    deptInput: String
    totalInput: String
    srcInput: String
    srcType: JournalEntrySourceType
  }

  type LC_JournalEntryUpsertInputErrors {
    dateError: String
    deptError: String
    typeError: String
    payMethodError: String
    totalError: String
    srcError: String
  }

  enum LC_JournalEntryUpsertSubmitStatus {
    NOT_SUBMITTED
    SUBMITTING
    SUBMITTED
  }

  enum LC_JournalEntryUpsertType {
    UPDATE
    ADD
  }

  type LC_JournalEntryUpsert {
    id: ID!
    valid: Boolean!
    type: LC_JournalEntryUpsertType!
    submitStatus: LC_JournalEntryUpsertSubmitStatus!
    submitError: String
    inputValues: LC_JournalEntryUpsertInputValues!
    inputErrors: LC_JournalEntryUpsertInputErrors!
    fields: LC_JournalEntryUpsertFields!
  }

  extend type Query {
    lc_journalEntryUpserts: [LC_JournalEntryUpsert!]!
  }
`;
