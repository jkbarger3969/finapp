import gql from 'graphql-tag';

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
        ...on Business {
        id
          bizName : name
        }
        ...on Department {
          id
          deptName: name
        }
      }
    }
    type {
      __typename
      id
      type
      ancestors {
        __typename
        id
        type
      }
    }
    description
    paymentMethod {
      __typename
      id
      method
    }
    source {
      __typename
      ...on Person {
        id
        name {
          first
          last
        }
      }
      ...on Business {
        id
        bizName : name
      }
      ...on Department {
        id
        deptName: name
      }
    }
    total {
      num
      den
    }
    reconciled
  }
`;

export const JOURNAL_ENTRIES = gql`
  query JournalEntries_1($paginate:PaginateInput!, 
    $sortBy:[JournalEntriesSortByInput!]!) 
  {
    journalEntries(paginate:$paginate, sortBy:$sortBy) 
      @connection(key:"JournalEntries_1", filter:["sortBy"]) 
    {
      totalCount
      entries {
        ...JournalEntry_1Fragment
      }
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