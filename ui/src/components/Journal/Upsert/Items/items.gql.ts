import gql from "graphql-tag";

export const JOURNAL_FRAGMENT = gql`
  fragment JournalEntry_3Fragment on JournalEntry {
    __typename
    id
    type
    total {
      n
      d
      s
    }
    date
    items {
      id
      __typename
      deleted
      total {
        n
        d
        s
      }
    }
  }
`;
