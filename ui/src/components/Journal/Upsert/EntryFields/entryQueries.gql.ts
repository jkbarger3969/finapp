import gql from "graphql-tag";

export const SRC_ENTRY_PERSON_OPT_FRAGMENT = gql`
  fragment SrcEntryPersonOptFragment on Person {
    __typename
    id
    name {
      first
      last
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

export const SRC_ENTRY_OPTS_QUERY = gql`
  query SrcEntryOpts($name: String!, $isBiz: Boolean!) {
    businesses(searchByName: $name) @include(if: $isBiz) {
      ...SrcEntryBizOptFragment
    }
    people(searchByName: { first: $name, last: $name }) @skip(if: $isBiz) {
      ...SrcEntryPersonOptFragment
    }
  }
  ${SRC_ENTRY_PERSON_OPT_FRAGMENT}
  ${SRC_ENTRY_BIZ_OPT_FRAGMENT}
  ${SRC_ENTRY_DEPT_OPT_FRAGMENT}
`;
