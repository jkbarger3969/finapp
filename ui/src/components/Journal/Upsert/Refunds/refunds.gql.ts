import gql from "graphql-tag";

export const JOURNAL_FRAGMENT = gql`
  fragment Entry_2Fragment on Entry {
    __typename
    id
    date
    total
    refunds {
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
