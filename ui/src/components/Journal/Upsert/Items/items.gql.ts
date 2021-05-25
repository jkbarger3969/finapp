import gql from "graphql-tag";

export const JOURNAL_FRAGMENT = gql`
  fragment Entry_3Fragment on Entry {
    __typename
    id
    total
    date
    items {
      id
      __typename
      deleted
      total
    }
    category {
      id
      __typename
      type
    }
  }
`;
