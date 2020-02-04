import gql from 'graphql-tag';

export const GET_REPORT_DATA_DEPT_FRAGMENT = gql`
  fragment GetReportDataDept_1Fragment on Department {
    __typename
    id
    name
    budget {
      id
      __typename
      amount {
        num
        den
      }
    }
  }
`;

export const GET_REPORT_DATA_ENTRY_FRAGMENT = gql`
  fragment GetReportDataEntry_1Fragment on JournalEntry {
    id
    __typename
    category {
      __typename
      id
      name
    }
    type
    total {
      num
      den
    }
    department {
      __typename
      id
      ancestors {
        __typename
        ...on Business {
          id
        }
        ...on Department {
          id
        }
      }
    }
    lastUpdate
    deleted
  }
`;

export const GET_REPORT_DATA = gql`
  query GetReportData($deptId:ID!, $where:JournalEntiresWhereInput!) {
    department(id:$deptId) {
      ...GetReportDataDept_1Fragment
      descendants {
        ...GetReportDataDept_1Fragment
      }
    }
    journalEntries(where:$where) {
      ...GetReportDataEntry_1Fragment
    }
  }
  ${GET_REPORT_DATA_DEPT_FRAGMENT},
  ${GET_REPORT_DATA_ENTRY_FRAGMENT}
`;

export const JOURNAL_ENTRY_ADDED_SUB = gql`
  subscription JournalEntryAdded_2 {
    journalEntryAdded {
      ...GetReportDataEntry_1Fragment
    }
  }
  ${GET_REPORT_DATA_ENTRY_FRAGMENT}
`;

export const JOURNAL_ENTRY_UPDATED_SUB = gql`
  subscription JournalEntryUpdated_2 {
    journalEntryUpdated {
      ...GetReportDataEntry_1Fragment
    }
  }
  ${GET_REPORT_DATA_ENTRY_FRAGMENT}
`;