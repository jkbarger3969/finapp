import gql from "graphql-tag";

export const JOURNAL_ENTRY_PAY_METHOD_FRAGMENT = gql`
  fragment EntryPayMethod_1Fragment on PaymentMethod {
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
  fragment Category_1Fragment on Category {
    __typename
    id
    type
    name
  }
`;

export const JOURNAL_ENTRY_DEPT_FRAGMENT = gql`
  fragment EntryDept_1Fragment on Department {
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
  fragment EntryRefund_1Fragment on EntryRefund {
    __typename
    id
    date
    description
    total
    paymentMethod {
      ...EntryPayMethod_1Fragment
    }
    reconciled
    lastUpdate
    deleted
  }
  ${JOURNAL_ENTRY_PAY_METHOD_FRAGMENT}
`;

export const JOURNAL_ENTRY_ITEM = gql`
  fragment EntryItem_1Fragment on EntryItem {
    __typename
    id
    category {
      ...Category_1Fragment
    }
    department {
      ...EntryDept_1Fragment
    }
    total
    units
    description
    lastUpdate
    deleted
  }
  ${JOURNAL_ENTRY_CATEGORY_FRAGMENT}
  ${JOURNAL_ENTRY_DEPT_FRAGMENT}
`;

export const JOURNAL_ENTRY_FRAGMENT = gql`
  fragment Entry_1Fragment on Entry {
    __typename
    id
    date
    dateOfRecord {
      date
      overrideFiscalYear
    }
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
      ...Category_1Fragment
    }
    department {
      ...EntryDept_1Fragment
    }
    description
    paymentMethod {
      ...EntryPayMethod_1Fragment
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
    total
    refunds {
      ...EntryRefund_1Fragment
    }
    items {
      ...EntryItem_1Fragment
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
  query Entries_1($where: EntriesWhere!) {
    entries(where: $where)
      @connection(key: "Entries_1", filter: ["where"]) {
      ...Entry_1Fragment
    }
    fiscalYears {
      __typename
      id
      name
      begin
      end
    }
  }
  ${JOURNAL_ENTRY_FRAGMENT}
`;

export const JOURNAL_ENTRY_ADDED_SUB = gql`
  subscription EntryAdded_1 {
    entryAdded {
      ...Entry_1Fragment
    }
  }
  ${JOURNAL_ENTRY_FRAGMENT}
`;

export const JOURNAL_ENTRY_UPDATED_SUB = gql`
  subscription EntryUpdated_1 {
    entryUpdated {
      ...Entry_1Fragment
    }
  }
  ${JOURNAL_ENTRY_FRAGMENT}
`;
