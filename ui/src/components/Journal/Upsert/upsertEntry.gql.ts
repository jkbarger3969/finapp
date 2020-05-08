import gql from "graphql-tag";

export const DEPT_ENTRY_OPT_FRAGMENT = gql`
  fragment DeptEntryOptFragment on Department {
    __typename
    id
    name
    parent {
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

export const CAT_ENTRY_OPT_FRAGMENT = gql`
  fragment CatEntryOptFragment on JournalEntryCategory {
    __typename
    id
    name
    type
    parent {
      __typename
      id
    }
  }
`;

export const SRC_ENTRY_PERSON_OPT_FRAGMENT = gql`
  fragment SrcEntryPersonOptFragment on Person {
    __typename
    id
    personName: name {
      first
      last
    }
  }
`;

export const SRC_ENTRY_DEPT_OPT_FRAGMENT = gql`
  fragment SrcEntryDeptOptFragment on Department {
    __typename
    id
    name
    parent {
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

export const SRC_ENTRY_BIZ_OPT_FRAGMENT = gql`
  fragment SrcEntryBizOptFragment on Business {
    __typename
    id
    name
    vendor {
      approved
      vendorId
    }
    departments {
      ...SrcEntryDeptOptFragment
    }
  }
  ${SRC_ENTRY_DEPT_OPT_FRAGMENT}
`;

export const PAY_METHOD_ENTRY_OPT_FRAGMENT = gql`
  fragment PayMethodEntryOptFragment on PaymentMethod {
    __typename
    id
    refId
    name
    active
    parent {
      __typename
      id
    }
  }
`;
