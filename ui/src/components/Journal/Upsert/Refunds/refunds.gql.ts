import gql from "graphql-tag";

export const JOURNAL_FRAGMENT = gql`
  fragment JournalEntry_2Fragment on JournalEntry {
    __typename
    id
    date
    type
    total {
      n
      d
      s
    }
    refunds {
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
