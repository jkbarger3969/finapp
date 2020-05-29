import gql from "graphql-tag";

export const JOURNAL_ENTRY_PAY_METHOD_FRAGMENT = gql`
  fragment JournalEntryPayMethod_1Fragment on PaymentMethod {
    __typename
    id
    name
    parent {
      __typename
      id
    }
  }
`;

export const JOURNAL_ENTRY_CATEGORY_FRAGMENT = gql`
  fragment JournalEntryCategory_1Fragment on JournalEntryCategory {
    __typename
    id
    type
    name
  }
`;

export const JOURNAL_ENTRY_DEPT_FRAGMENT = gql`
  fragment JournalEntryDept_1Fragment on Department {
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
`;

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
      ...JournalEntryPayMethod_1Fragment
    }
    reconciled
    lastUpdate
    deleted
  }
  ${JOURNAL_ENTRY_PAY_METHOD_FRAGMENT}
`;

export const JOURNAL_ENTRY_ITEM = gql`
  fragment JournalEntryItem_1Fragment on JournalEntryItem {
    __typename
    id
    category {
      ...JournalEntryCategory_1Fragment
    }
    department {
      ...JournalEntryDept_1Fragment
    }
    total {
      num
      den
    }
    units
    description
    lastUpdate
    deleted
  }
  ${JOURNAL_ENTRY_CATEGORY_FRAGMENT}
  ${JOURNAL_ENTRY_DEPT_FRAGMENT}
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
      ...JournalEntryCategory_1Fragment
    }
    department {
      ...JournalEntryDept_1Fragment
    }
    description
    paymentMethod {
      ...JournalEntryPayMethod_1Fragment
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
    items {
      ...JournalEntryItem_1Fragment
    }
    deleted
    lastUpdate
    reconciled
  }
  ${JOURNAL_ENTRY_PAY_METHOD_FRAGMENT}
  ${JOURNAL_ENTRY_DEPT_FRAGMENT}
  ${JOURNAL_ENTRY_CATEGORY_FRAGMENT}
  ${JOURNAL_ENTRY_REFUND}
  ${JOURNAL_ENTRY_ITEM}
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
