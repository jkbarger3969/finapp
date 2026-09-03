export interface Name {
  first: string;
  last: string;
}

export interface DepartmentRef {
  id: string;
  name: string;
}

export interface CategoryRef {
  id: string;
  name: string;
  type: string;
}

export interface SourcePerson {
  __typename: "Person";
  id: string;
  personName: Name;
}

export interface SourceBusiness {
  __typename: "Business";
  id: string;
  businessName: string;
}

export type EntrySource = SourcePerson | SourceBusiness | null;

export interface PaymentMethodCard {
  __typename: "PaymentMethodCard";
  currency?: string;
  card?: {
    type?: string;
    trailingDigits?: string;
  };
}

export interface PaymentMethodCheck {
  __typename: "PaymentMethodCheck";
  currency?: string;
  check?: {
    checkNumber?: string;
  };
}

export interface PaymentMethodCash {
  __typename: "PaymentMethodCash";
  currency?: string;
}

export interface PaymentMethodOnline {
  __typename: "PaymentMethodOnline";
  currency?: string;
}

export type PaymentMethod =
  | PaymentMethodCard
  | PaymentMethodCheck
  | PaymentMethodCash
  | PaymentMethodOnline
  | null;

export interface EntryRefundRecord {
  id: string;
  date: string;
  description?: string | null;
  total: string;
  reconciled: boolean;
  paymentMethod: PaymentMethod;
}

export interface EntryDateOfRecord {
  date: string;
  overrideFiscalYear?: boolean | null;
}

export interface EntryRecord {
  id: string;
  description?: string | null;
  date: string;
  dateOfRecord?: EntryDateOfRecord | null;
  reconciled: boolean;
  total: string;
  category?: CategoryRef | null;
  department?: DepartmentRef | null;
  source?: EntrySource;
  refunds: EntryRefundRecord[];
  attachments: Array<{ id: string }>;
  paymentMethod: PaymentMethod;
}

export interface EntriesSummary {
  count: number;
  balance: number;
}

export interface GetEntriesByDepartmentData {
  entries: EntryRecord[];
  entriesCount: number;
  entriesSummary: EntriesSummary;
}

export interface RegexFilter {
  pattern: string;
  flags: string[];
}

export type SearchOrCondition =
  | { description: RegexFilter }
  | { category: { name: RegexFilter } }
  | { department: { name: RegexFilter } }
  | { total: { eq: string } };

export interface EntriesWhereInput {
  [key: string]: unknown;
  deleted: boolean;
  department?: { id: { lte?: string; in?: string[] } };
  fiscalYear?: { id: { eq: string } };
  reconciled?: boolean;
  date?: { gte?: string; lte?: string };
  category?: { type?: string; id?: { eq: string } | { in: string[] } };
  source?: {
    people?: { id: { eq: string } };
    businesses?: { id: { eq: string } };
  };
  paymentMethodType?: string;
  and?: Array<{ or: SearchOrCondition[] }>;
  hasRefunds?: boolean;
}