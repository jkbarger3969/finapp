import gql from "graphql-tag";

export const GET_REPORT_DATA_DEPT_FRAGMENT = gql`
  fragment GetReportDataDept_1Fragment on Department {
    __typename
    id
    name
    budgets {
      id
      __typename
      amount
      fiscalYear {
        __typename
        id
      }
    }
  }
`;

export const GET_REPORT_DATA_ENTRY_FRAGMENT = gql`
  fragment GetReportDataEntry_1Fragment on Entry {
    id
    __typename
    category {
      __typename
      id
      name
    }
    type
    total
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
      total
      deleted
      lastUpdate
    }
    items {
      __typename
      id
      total
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
  query GetReportData($deptId:ID!, $where:EntriesWhere!) {
    department(id:$deptId) {
      ...GetReportDataDept_1Fragment
      descendants {
        ...GetReportDataDept_1Fragment
      }
    }
    entries(where:$where) {
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
  subscription EntryAdded_2 {
    entryAdded {
      ...GetReportDataEntry_1Fragment
    }
  }
  ${GET_REPORT_DATA_ENTRY_FRAGMENT}
`;

export const JOURNAL_ENTRY_UPDATED_SUB = gql`
  subscription EntryUpdated_2 {
    entryUpdated {
      ...GetReportDataEntry_1Fragment
    }
  }
  ${GET_REPORT_DATA_ENTRY_FRAGMENT}
`;
