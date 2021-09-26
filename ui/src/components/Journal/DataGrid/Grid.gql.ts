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
  fragment GridPaymentMethodCard on PaymentMethodCard {
    __typename
    card {
      __typename
      ... on AccountCard {
        id
        active
        account {
          __typename
          ... on AccountCreditCard {
            id
            name
          }
          ... on AccountChecking {
            id
            name
          }
        }
        trailingDigits
        type
      }
      ... on PaymentCard {
        trailingDigits
        type
      }
    }
  }

  fragment GridPaymentMethodCheck on PaymentMethodCheck {
    __typename
    check {
      __typename
      ... on AccountCheck {
        checkNumber
        account {
          __typename
          id
          name
          accountNumber
        }
      }
      ... on PaymentCheck {
        checkNumber
      }
    }
  }

  fragment GridPaymentMethod on PaymentMethodInterface {
    __typename
    currency
    ...GridPaymentMethodCard
    ...GridPaymentMethodCheck
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
    department {
      __typename
      id
      name
    }
    category {
      __typename
      id
      name
      type
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
  query GridEntries($where: EntriesWhere) {
    entries(where: $where) {
      ...GridEntry
    }
  }
  ${ENTRY}
`;
