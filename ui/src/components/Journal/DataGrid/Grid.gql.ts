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

export const REFUND = gql`
  fragment GridRefund on EntryRefund {
    __typename
    id
    date
    description
    paymentMethod {
      ...GridPaymentMethod
    }
    total
    reconciled
    deleted
  }
  ${PAYMENT_METHOD}
`;

export const ENTRY = gql`
  fragment GridEntry on Entry {
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
    total
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
  ${PAYMENT_METHOD}
  ${REFUND}
`;

export const GRID_ENTRIES = gql`
  query GridEntries($where: EntriesWhereBeta) {
    entries(where: $where) {
      ...GridEntry
    }
  }
  ${ENTRY}
`;
