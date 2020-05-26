import gql from "graphql-tag";

export const JOURNAL_FRAGMENT = gql`
  fragment JournalEntry_3Fragment on JournalEntry {
    __typename
    id
    type
    total {
      num
      den
    }
    items {
      id
      __typename
      deleted
      total {
        num
        den
      }
    }
  }
`;
