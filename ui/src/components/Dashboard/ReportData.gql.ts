import gql from "graphql-tag";

export const GET_REPORT_DATA_DEPT_FRAGMENT = gql`
  fragment GetReportDataDept on Department {
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

export const REPORT_DATA_ENTRY_REFUND = gql`
  fragment ReportDataEntryRefund on EntryRefund {
    __typename
    id
    total
    deleted
    lastUpdate
  }
`;

export const REPORT_DATA_ENTRY_CATEGORY = gql`
  fragment ReportDataEntryCategory on Category {
    __typename
    id
    name
    type
  }
`;

export const REPORT_DATA_ENTRY_DEPT = gql`
  fragment ReportDataEntryDept on Department {
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
`;

export const GET_REPORT_DATA_ENTRY_SANS_REFUNDS = gql`
  fragment GetReportDataEntrySansRefunds on Entry {
    id
    __typename
    category {
      ...ReportDataEntryCategory
    }
    total
    fiscalYear {
      __typename
      id
    }
    department {
      ...ReportDataEntryDept
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
  ${REPORT_DATA_ENTRY_CATEGORY}
  ${REPORT_DATA_ENTRY_DEPT}
`;

export const GET_REPORT_DATA_ENTRY_FRAGMENT = gql`
  fragment GetReportDataEntry on Entry {
    ...GetReportDataEntrySansRefunds
    refunds {
      ...ReportDataEntryRefund
    }
  }
  ${GET_REPORT_DATA_ENTRY_SANS_REFUNDS}
  ${REPORT_DATA_ENTRY_REFUND}
`;

export const REPORT_DATA_OTHER_ENTRY_REFUND = gql`
  fragment ReportDataOtherEntryRefund on EntryRefund {
    ...ReportDataEntryRefund
    entry {
      __typename
      id
      category {
        ...ReportDataEntryCategory
      }
      department {
        ...ReportDataEntryDept
      }
    }
  }
  ${REPORT_DATA_ENTRY_REFUND}
  ${REPORT_DATA_ENTRY_CATEGORY}
  ${REPORT_DATA_ENTRY_DEPT}
`;

export const GET_REPORT_DATA = gql`
 
  query GetReportData($deptId:ID!, $where:EntriesWhere!, $filterRefunds:Boolean, $whereRefunds:EntryRefundsWhere!, $whereRefundEntries:EntriesWhere!) {
    department(id:$deptId) {
      ...GetReportDataDept
      descendants {
        ...GetReportDataDept
      }
    }
    entries(where:$where, filterRefunds:$filterRefunds) {
      ...GetReportDataEntry
    }
  
    entryRefunds(where:$whereRefunds, entriesWhere:$whereRefundEntries) {
      ...ReportDataOtherEntryRefund
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
  ${REPORT_DATA_OTHER_ENTRY_REFUND}
`;

export const JOURNAL_ENTRY_ADDED_SUB = gql`
  subscription EntryAdded_2 {
    entryAdded {
      ...GetReportDataEntry
    }
  }
  ${GET_REPORT_DATA_ENTRY_FRAGMENT}
`;

export const JOURNAL_ENTRY_UPDATED_SUB = gql`
  subscription EntryUpdated_2 {
    entryUpdated {
      ...GetReportDataEntry
    }
  }
  ${GET_REPORT_DATA_ENTRY_FRAGMENT}
`;
