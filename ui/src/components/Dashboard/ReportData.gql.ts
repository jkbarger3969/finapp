import gql from "graphql-tag";

export const GET_REPORT_DATA_DEPT_FRAGMENT = gql`
  fragment GetReportDataDept_1Fragment on Department {
    __typename
    id
    name
    budgets {
      id
      __typename
      amount {
        n
        d
        s
      }
      fiscalYear {
        __typename
        id
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
      n
      d
      s
    }
    fiscalYear {
      __typename
      id
    }
    department {
      __typename
      id
      ancestors {
        __typename
        ... on Business {
          id
        }
        ... on Department {
          id
        }
      }
    }
    refunds {
      __typename
      id
      total {
        n
        d
        s
      }
      deleted
      lastUpdate
    }
    items {
      __typename
      id
      total {
        n
        d
        s
      }
      department {
        __typename
        id
      }
      deleted
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
    fiscalYears {
      __typename
      id
      name
      begin
      end
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
