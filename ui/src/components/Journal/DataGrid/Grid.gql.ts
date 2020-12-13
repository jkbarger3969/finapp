import gql from "graphql-tag";

export const SOURCE_PERSON = gql`
  fragment GridEntrySrcPerson on Person {
    __typename
    id
    personName: name {
      first
      last
    }
  }
`;
export const SOURCE_BUSINESS = gql`
  fragment GridEntrySrcBusiness on Business {
    __typename
    id
    name
  }
`;
export const SOURCE_DEPT = gql`
  fragment GridEntrySrcDept on Department {
    __typename
    id
    name
  }
`;

export const PAYMENT_METHOD = gql`
  fragment GridPaymentMethod on PaymentMethod {
    __typename
    id
    name
    parent {
      __typename
      id
    }
  }
`;
export const RATIONAL = gql`
  fragment GridRational on Rational {
    s
    n
    d
  }
`;

export const REFUND = gql`
  fragment GridRefund on JournalEntryRefund {
    __typename
    id
    date
    description
    paymentMethod {
      ...GridPaymentMethod
    }
    total {
      ...GridRational
    }
    reconciled
    deleted
  }
  ${RATIONAL}
  ${PAYMENT_METHOD}
`;

export const ENTRY = gql`
  fragment GridEntry on JournalEntry {
    __typename
    id
    date
    dateOfRecord {
      date
    }
    type
    department {
      __typename
      id
      name
    }
    category {
      __typename
      id
      name
    }
    paymentMethod {
      ...GridPaymentMethod
    }
    description
    total {
      ...GridRational
    }
    source {
      ...GridEntrySrcPerson
      ...GridEntrySrcBusiness
      ...GridEntrySrcDept
    }
    reconciled
    refunds {
      ...GridRefund
    }
    deleted
  }
  ${SOURCE_PERSON}
  ${SOURCE_BUSINESS}
  ${SOURCE_DEPT}
  ${RATIONAL}
  ${PAYMENT_METHOD}
  ${REFUND}
`;

export const GRID_ENTRIES = gql`
  query GridEntries($where: JournalEntiresWhere) {
    journalEntries(where: $where) {
      ...GridEntry
    }
  }
  ${ENTRY}
`;
