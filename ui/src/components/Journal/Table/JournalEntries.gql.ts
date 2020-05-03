import gql from "graphql-tag";

export const JOURNAL_ENTRY_REFUND = gql`
  fragment JournalEntryRefund_1Fragment on JournalEntryRefund {
    __typename
    id
    date
    description
    total {
      num
      den
    }
    paymentMethod {
      __typename
      id
      name
      parent {
        __typename
        id
      }
    }
    reconciled
    lastUpdate
    deleted
  }
`;

export const JOURNAL_ENTRY_FRAGMENT = gql`
  fragment JournalEntry_1Fragment on JournalEntry {
    __typename
    id
    date
    department {
      __typename
      id
      name
      ancestors {
        __typename
        ... on Business {
          id
          bizName: name
        }
        ... on Department {
          id
          deptName: name
        }
      }
    }
    type
    category {
      __typename
      id
      type
      name
    }
    description
    paymentMethod {
      __typename
      id
      name
      parent {
        __typename
        id
      }
    }
    source {
      __typename
      ... on Person {
        id
        name {
          first
          last
        }
      }
      ... on Business {
        id
        bizName: name
      }
      ... on Department {
        id
        deptName: name
      }
    }
    total {
      num
      den
    }
    refunds {
      ...JournalEntryRefund_1Fragment
    }
    deleted
    lastUpdate
    reconciled
  }
  ${JOURNAL_ENTRY_REFUND}
`;

export const JOURNAL_ENTRIES = gql`
  query JournalEntries_1($where: JournalEntiresWhereInput!) {
    journalEntries(where: $where)
      @connection(key: "JournalEntries_1", filter: ["where"]) {
      ...JournalEntry_1Fragment
    }
  }
  ${JOURNAL_ENTRY_FRAGMENT}
`;

export const JOURNAL_ENTRY_ADDED_SUB = gql`
  subscription JournalEntryAdded_1 {
    journalEntryAdded {
      ...JournalEntry_1Fragment
    }
  }
  ${JOURNAL_ENTRY_FRAGMENT}
`;

export const JOURNAL_ENTRY_UPDATED_SUB = gql`
  subscription JournalEntryUpdated_1 {
    journalEntryUpdated {
      ...JournalEntry_1Fragment
    }
  }
  ${JOURNAL_ENTRY_FRAGMENT}
`;
