import gql from "graphql-tag";

export const JOURNAL_FRAGMENT = gql`
  fragment Entry_3Fragment on Entry {
    __typename
    id
    type
    total 
    date
    items {
      id
      __typename
      deleted
      total 
    }
  }
`;
