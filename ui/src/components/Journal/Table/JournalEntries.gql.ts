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
    $sortBy:[JournalEntriesSortByInput!]!, $filterBy:JournalEntiresFilterInput) 
  {
    journalEntries(paginate:$paginate, sortBy:$sortBy, filterBy:$filterBy)
      @connection(key:"JournalEntries_1", filter:["sortBy", "filterBy"]) 
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

export const JOURNAL_ENTRY_UPDATED_SUB = gql`
  subscription JournalEntryUpdated_1 {
    journalEntryUpdated {
      ...JournalEntry_1Fragment
    }
  }
  ${JOURNAL_ENTRY_FRAGMENT}
`;