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
    dateOfRecord {
      date
    }
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

export const ENTRY_SANS_REFUNDS = gql`
  fragment GridEntrySansRefunds on Entry {
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
    deleted
  }
  ${SOURCE_PERSON}
  ${SOURCE_BUSINESS}
  ${SOURCE_DEPT}
  ${PAYMENT_METHOD}
`;

export const ENTRY = gql`
  fragment GridEntry on Entry {
    ...GridEntrySansRefunds
    refunds {
      ...GridRefund
    }
  }
  ${ENTRY_SANS_REFUNDS}
  ${REFUND}
`;

export const GRID_ENTRIES = gql`
  query GridEntries($where: EntriesWhere, $filterRefunds: Boolean) {
    entries(where: $where, filterRefunds: $filterRefunds) {
      ...GridEntry
    }
  }
  ${ENTRY}
`;

export const GRID_ENTRY_REFUND = gql`
  fragment GridEntryRefund on EntryRefund {
    ...GridRefund
    entry {
      ...GridEntrySansRefunds
    }
  }
  ${REFUND}
  ${ENTRY_SANS_REFUNDS}
`;

export const GRID_ENTRY_REFUNDS = gql`
  query GridEntryRefunds(
    $where: EntryRefundsWhere
    $entriesWhere: EntriesWhere
  ) {
    entryRefunds(where: $where, entriesWhere: $entriesWhere) {
      ...GridEntryRefund
    }
  }
  ${GRID_ENTRY_REFUND}
`;
