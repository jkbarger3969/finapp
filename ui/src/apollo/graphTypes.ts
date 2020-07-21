import { GraphQLResolveInfo, GraphQLScalarType, GraphQLScalarTypeConfig } from 'graphql';
import { Context } from './types';
export type Maybe<T> = T | null;
export type Exact<T extends { [key: string]: any }> = { [K in keyof T]: T[K] };
export type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>;
export type RequireFields<T, K extends keyof T> = { [X in Exclude<keyof T, K>]?: T[X] } & { [P in K]-?: NonNullable<T[P]> };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: string;
  String: string;
  Boolean: boolean;
  Int: number;
  Float: number;
  /** The `Upload` scalar type represents a file upload. */
  Upload: any;
};

export type Budget = {
  __typename?: 'Budget';
  id: Scalars['ID'];
  amount: Rational;
  owner: BudgetOwner;
};

export type BudgetOwner = Department | Business;

export type Business = {
  __typename?: 'Business';
  id: Scalars['ID'];
  name: Scalars['String'];
  budget?: Maybe<Budget>;
  departments: Array<Department>;
  vendor?: Maybe<Vendor>;
};

export type BusinessAddFields = {
  name: Scalars['String'];
};

export type ByIdFilter = {
  eq?: Maybe<Scalars['ID']>;
};

export enum CacheControlScope {
  Public = 'PUBLIC',
  Private = 'PRIVATE'
}

export type Department = {
  __typename?: 'Department';
  id: Scalars['ID'];
  name: Scalars['String'];
  code?: Maybe<Scalars['String']>;
  budget?: Maybe<Budget>;
  business: Business;
  parent: DepartmentAncestor;
  ancestors: Array<DepartmentAncestor>;
  descendants: Array<Department>;
  virtualRoot?: Maybe<Scalars['Boolean']>;
};

export type DepartmentAddFields = {
  name: Scalars['String'];
};

export type DepartmentAncestor = Department | Business;

export enum FilterType {
  Include = 'INCLUDE',
  Exclude = 'EXCLUDE'
}

export type JournalEntiresWhereInput = {
  date?: Maybe<WhereDate>;
  department?: Maybe<JournalEntriesWhereDepartment>;
  category?: Maybe<JournalEntriesWhereCategory>;
  source?: Maybe<JournalEntriesWhereSource>;
  paymentMethod?: Maybe<JournalEntriesWherePaymentMethod>;
  total?: Maybe<WhereRational>;
  reconciled?: Maybe<Scalars['Boolean']>;
  deleted?: Maybe<Scalars['Boolean']>;
  lastUpdate?: Maybe<WhereDate>;
  lastUpdateRefund?: Maybe<WhereDate>;
  lastUpdateItem?: Maybe<WhereDate>;
  or?: Maybe<Array<Maybe<JournalEntiresWhereInput>>>;
  and?: Maybe<Array<Maybe<JournalEntiresWhereInput>>>;
};

export type JournalEntriesWhereCategory = {
  eq?: Maybe<Scalars['ID']>;
  ne?: Maybe<Scalars['ID']>;
  in?: Maybe<Array<Maybe<Scalars['ID']>>>;
  nin?: Maybe<Array<Maybe<Scalars['ID']>>>;
  matchDecedentTree?: Maybe<Scalars['Boolean']>;
};

/** Where */
export type JournalEntriesWhereDepartment = {
  eq?: Maybe<Scalars['ID']>;
  ne?: Maybe<Scalars['ID']>;
  in?: Maybe<Array<Maybe<Scalars['ID']>>>;
  nin?: Maybe<Array<Maybe<Scalars['ID']>>>;
  matchDecedentTree?: Maybe<Scalars['Boolean']>;
};

export type JournalEntriesWherePaymentMethod = {
  eq?: Maybe<Scalars['ID']>;
  ne?: Maybe<Scalars['ID']>;
  in?: Maybe<Array<Maybe<Scalars['ID']>>>;
  nin?: Maybe<Array<Maybe<Scalars['ID']>>>;
  matchDecedentTree?: Maybe<Scalars['Boolean']>;
};

export type JournalEntriesWhereSource = {
  sourceType: JournalEntrySourceType;
  eq?: Maybe<Scalars['ID']>;
  ne?: Maybe<Scalars['ID']>;
  in?: Maybe<Array<Maybe<Scalars['ID']>>>;
  nin?: Maybe<Array<Maybe<Scalars['ID']>>>;
};

export type JournalEntry = {
  __typename?: 'JournalEntry';
  id: Scalars['ID'];
  refunds: Array<JournalEntryRefund>;
  items: Array<JournalEntryItem>;
  type: JournalEntryType;
  date: Scalars['String'];
  department: Department;
  category: JournalEntryCategory;
  paymentMethod: PaymentMethod;
  description?: Maybe<Scalars['String']>;
  total: Rational;
  source: JournalEntrySource;
  reconciled: Scalars['Boolean'];
  lastUpdate: Scalars['String'];
  deleted: Scalars['Boolean'];
};

export type JournalEntryAddFields = {
  date: Scalars['String'];
  department: Scalars['ID'];
  type: JournalEntryType;
  category: Scalars['ID'];
  paymentMethod: Scalars['ID'];
  description?: Maybe<Scalars['String']>;
  total: RationalInput;
  source: JournalEntrySourceInput;
  reconciled?: Maybe<Scalars['Boolean']>;
};

export type JournalEntryAddItemFields = {
  department?: Maybe<Scalars['ID']>;
  category?: Maybe<Scalars['ID']>;
  description?: Maybe<Scalars['String']>;
  units: Scalars['Int'];
  total: RationalInput;
};

export type JournalEntryAddRefundFields = {
  date: Scalars['String'];
  description?: Maybe<Scalars['String']>;
  paymentMethod: Scalars['ID'];
  total: RationalInput;
  reconciled?: Maybe<Scalars['Boolean']>;
};

export type JournalEntryCategory = {
  __typename?: 'JournalEntryCategory';
  id: Scalars['ID'];
  name: Scalars['String'];
  type: JournalEntryType;
  parent?: Maybe<JournalEntryCategory>;
  ancestors: Array<JournalEntryCategory>;
  children: Array<JournalEntryCategory>;
};

export type JournalEntryCategoryWhereInput = {
  name?: Maybe<JournalEntryCategoryWhereNameInput>;
  type?: Maybe<JournalEntryCategoryWhereTypeInput>;
  hasParent?: Maybe<Scalars['Boolean']>;
  parent?: Maybe<JournalEntryCategoryWhereParentInput>;
  or?: Maybe<Array<Maybe<JournalEntryCategoryWhereInput>>>;
  and?: Maybe<Array<Maybe<JournalEntryCategoryWhereInput>>>;
};

export type JournalEntryCategoryWhereNameInput = {
  eq?: Maybe<Scalars['String']>;
  ne?: Maybe<Scalars['String']>;
  in?: Maybe<Array<Maybe<Scalars['String']>>>;
  nin?: Maybe<Array<Maybe<Scalars['String']>>>;
};

export type JournalEntryCategoryWhereParentInput = {
  eq?: Maybe<Scalars['ID']>;
  ne?: Maybe<Scalars['ID']>;
  in?: Maybe<Array<Maybe<Scalars['ID']>>>;
  nin?: Maybe<Array<Maybe<Scalars['ID']>>>;
};

export type JournalEntryCategoryWhereTypeInput = {
  eq?: Maybe<JournalEntryType>;
  ne?: Maybe<JournalEntryType>;
};

/** Items */
export type JournalEntryItem = {
  __typename?: 'JournalEntryItem';
  id: Scalars['ID'];
  department?: Maybe<Department>;
  category?: Maybe<JournalEntryCategory>;
  description?: Maybe<Scalars['String']>;
  units: Scalars['Int'];
  total: Rational;
  lastUpdate: Scalars['String'];
  deleted: Scalars['Boolean'];
};

export type JournalEntryItemUpsertResult = {
  __typename?: 'JournalEntryItemUpsertResult';
  journalEntryItem: JournalEntryItem;
  journalEntry: JournalEntry;
};

/** Refunds */
export type JournalEntryRefund = {
  __typename?: 'JournalEntryRefund';
  id: Scalars['ID'];
  date: Scalars['String'];
  description?: Maybe<Scalars['String']>;
  paymentMethod: PaymentMethod;
  total: Rational;
  reconciled: Scalars['Boolean'];
  lastUpdate: Scalars['String'];
  deleted: Scalars['Boolean'];
};

export type JournalEntrySource = Person | Business | Department;

export type JournalEntrySourceInput = {
  sourceType: JournalEntrySourceType;
  id: Scalars['ID'];
};

export enum JournalEntrySourceType {
  Business = 'BUSINESS',
  Department = 'DEPARTMENT',
  Person = 'PERSON'
}

export enum JournalEntryType {
  Credit = 'CREDIT',
  Debit = 'DEBIT'
}

export type JournalEntryUpdateFields = {
  date?: Maybe<Scalars['String']>;
  department?: Maybe<Scalars['ID']>;
  type?: Maybe<JournalEntryType>;
  category?: Maybe<Scalars['ID']>;
  paymentMethod?: Maybe<Scalars['ID']>;
  description?: Maybe<Scalars['String']>;
  total?: Maybe<RationalInput>;
  source?: Maybe<JournalEntrySourceInput>;
  reconciled?: Maybe<Scalars['Boolean']>;
};

export type JournalEntryUpdateItemFields = {
  department?: Maybe<Scalars['ID']>;
  category?: Maybe<Scalars['ID']>;
  description?: Maybe<Scalars['String']>;
  units?: Maybe<Scalars['Int']>;
  total?: Maybe<RationalInput>;
};

export type JournalEntryUpdatePaymentMethod = {
  id: Scalars['ID'];
  fields: PaymentMethodUpdateFields;
};

export type JournalEntryUpdateRefundFields = {
  date?: Maybe<Scalars['String']>;
  description?: Maybe<Scalars['String']>;
  paymentMethod?: Maybe<Scalars['ID']>;
  total?: Maybe<RationalInput>;
  reconciled?: Maybe<Scalars['Boolean']>;
};

export type Lc_JournalEntryUpsert = {
  __typename?: 'LC_JournalEntryUpsert';
  id: Scalars['ID'];
  valid: Scalars['Boolean'];
  type: Lc_JournalEntryUpsertType;
  submitStatus: Lc_JournalEntryUpsertSubmitStatus;
  submitError?: Maybe<Scalars['String']>;
  inputValues: Lc_JournalEntryUpsertInputValues;
  inputErrors: Lc_JournalEntryUpsertInputErrors;
  fields: Lc_JournalEntryUpsertFields;
};

export type Lc_JournalEntryUpsertFields = {
  __typename?: 'LC_JournalEntryUpsertFields';
  id?: Maybe<Scalars['ID']>;
  date?: Maybe<Scalars['String']>;
  department: Array<Scalars['ID']>;
  type?: Maybe<Scalars['ID']>;
  paymentMethod?: Maybe<Scalars['ID']>;
  total?: Maybe<Rational>;
  source: Array<Lc_JournalEntryUpsertSource>;
};

export type Lc_JournalEntryUpsertInputErrors = {
  __typename?: 'LC_JournalEntryUpsertInputErrors';
  dateError?: Maybe<Scalars['String']>;
  deptError?: Maybe<Scalars['String']>;
  typeError?: Maybe<Scalars['String']>;
  payMethodError?: Maybe<Scalars['String']>;
  totalError?: Maybe<Scalars['String']>;
  srcError?: Maybe<Scalars['String']>;
};

export type Lc_JournalEntryUpsertInputValues = {
  __typename?: 'LC_JournalEntryUpsertInputValues';
  deptInput?: Maybe<Scalars['String']>;
  totalInput?: Maybe<Scalars['String']>;
  srcInput?: Maybe<Scalars['String']>;
  srcType?: Maybe<JournalEntrySourceType>;
};

export type Lc_JournalEntryUpsertSource = {
  __typename?: 'LC_JournalEntryUpsertSource';
  sourceType: JournalEntrySourceType;
  id: Scalars['ID'];
};

export enum Lc_JournalEntryUpsertSubmitStatus {
  NotSubmitted = 'NOT_SUBMITTED',
  Submitting = 'SUBMITTING',
  Submitted = 'SUBMITTED'
}

export enum Lc_JournalEntryUpsertType {
  Update = 'UPDATE',
  Add = 'ADD'
}

export type Mutation = {
  __typename?: 'Mutation';
  addBusiness: Business;
  journalEntryUpdate: JournalEntry;
  journalEntryAdd: JournalEntry;
  journalEntryDelete: JournalEntry;
  journalEntryAddRefund: JournalEntry;
  journalEntryUpdateRefund: JournalEntry;
  journalEntryDeleteRefund: JournalEntry;
  journalEntryAddItem: JournalEntryItemUpsertResult;
  journalEntryUpdateItem: JournalEntryItemUpsertResult;
  journalEntryDeleteItem: JournalEntryItemUpsertResult;
  paymentMethodUpdate: PaymentMethod;
  paymentMethodAdd: PaymentMethod;
  addPerson: Person;
};


export type MutationAddBusinessArgs = {
  fields: BusinessAddFields;
};


export type MutationJournalEntryUpdateArgs = {
  id: Scalars['ID'];
  fields: JournalEntryUpdateFields;
  paymentMethodAdd?: Maybe<PaymentMethodAddFields>;
  paymentMethodUpdate?: Maybe<JournalEntryUpdatePaymentMethod>;
  personAdd?: Maybe<PersonAddFields>;
  businessAdd?: Maybe<BusinessAddFields>;
};


export type MutationJournalEntryAddArgs = {
  fields: JournalEntryAddFields;
  paymentMethodAdd?: Maybe<PaymentMethodAddFields>;
  personAdd?: Maybe<PersonAddFields>;
  businessAdd?: Maybe<BusinessAddFields>;
};


export type MutationJournalEntryDeleteArgs = {
  id: Scalars['ID'];
};


export type MutationJournalEntryAddRefundArgs = {
  id: Scalars['ID'];
  fields: JournalEntryAddRefundFields;
  paymentMethodAdd?: Maybe<PaymentMethodAddFields>;
};


export type MutationJournalEntryUpdateRefundArgs = {
  id: Scalars['ID'];
  fields: JournalEntryUpdateRefundFields;
  paymentMethodAdd?: Maybe<PaymentMethodAddFields>;
  paymentMethodUpdate?: Maybe<JournalEntryUpdatePaymentMethod>;
};


export type MutationJournalEntryDeleteRefundArgs = {
  id: Scalars['ID'];
};


export type MutationJournalEntryAddItemArgs = {
  id: Scalars['ID'];
  fields: JournalEntryAddItemFields;
};


export type MutationJournalEntryUpdateItemArgs = {
  id: Scalars['ID'];
  fields: JournalEntryUpdateItemFields;
};


export type MutationJournalEntryDeleteItemArgs = {
  id: Scalars['ID'];
};


export type MutationPaymentMethodUpdateArgs = {
  id: Scalars['ID'];
  fields: PaymentMethodUpdateFields;
};


export type MutationPaymentMethodAddArgs = {
  fields: PaymentMethodAddFields;
};


export type MutationAddPersonArgs = {
  fields: PersonAddFields;
};

export type PaginateInput = {
  skip: Scalars['Int'];
  limit: Scalars['Int'];
};

export type PaymentMethod = {
  __typename?: 'PaymentMethod';
  id: Scalars['ID'];
  active: Scalars['Boolean'];
  refId?: Maybe<Scalars['String']>;
  name: Scalars['String'];
  parent?: Maybe<PaymentMethod>;
  ancestors: Array<PaymentMethod>;
  children: Array<PaymentMethod>;
  allowChildren: Scalars['Boolean'];
  authorization: Array<PaymentMethodAuthorization>;
};

export type PaymentMethodAddFields = {
  active: Scalars['Boolean'];
  refId?: Maybe<Scalars['String']>;
  name: Scalars['String'];
  parent: Scalars['ID'];
};

export type PaymentMethodAuthorization = {
  __typename?: 'PaymentMethodAuthorization';
  owner: Scalars['Boolean'];
  entity?: Maybe<PaymentMethodAuthorizedEntity>;
};

export type PaymentMethodAuthorizedEntity = Person | Business | Department;

export type PaymentMethodUpdateFields = {
  active?: Maybe<Scalars['Boolean']>;
  refId?: Maybe<Scalars['String']>;
  name?: Maybe<Scalars['String']>;
};

export type PaymentMethodWhereInput = {
  active?: Maybe<Scalars['Boolean']>;
  refId?: Maybe<PaymentMethodWhereRefIdInput>;
  name?: Maybe<PaymentMethodWhereNameInput>;
  hasParent?: Maybe<Scalars['Boolean']>;
  parent?: Maybe<PaymentMethodWhereParentInput>;
  or?: Maybe<Array<Maybe<PaymentMethodWhereInput>>>;
  and?: Maybe<Array<Maybe<PaymentMethodWhereInput>>>;
};

export type PaymentMethodWhereNameInput = {
  eq?: Maybe<Scalars['String']>;
  ne?: Maybe<Scalars['String']>;
  in?: Maybe<Array<Maybe<Scalars['String']>>>;
  nin?: Maybe<Array<Maybe<Scalars['String']>>>;
};

export type PaymentMethodWhereParentInput = {
  eq?: Maybe<Scalars['ID']>;
  ne?: Maybe<Scalars['ID']>;
  in?: Maybe<Array<Maybe<Scalars['ID']>>>;
  nin?: Maybe<Array<Maybe<Scalars['ID']>>>;
};

export type PaymentMethodWhereRefIdInput = {
  eq?: Maybe<Scalars['String']>;
  ne?: Maybe<Scalars['String']>;
  in?: Maybe<Array<Maybe<Scalars['String']>>>;
  nin?: Maybe<Array<Maybe<Scalars['String']>>>;
};

export type Person = {
  __typename?: 'Person';
  id: Scalars['ID'];
  name: PersonName;
};

export type PersonAddFields = {
  name: PersonNameInput;
};

export type PersonName = {
  __typename?: 'PersonName';
  first: Scalars['String'];
  last: Scalars['String'];
};

export type PersonNameInput = {
  first: Scalars['String'];
  last: Scalars['String'];
};

export type Query = {
  __typename?: 'Query';
  budget: Budget;
  budgets: Array<Budget>;
  business: Business;
  businesses: Array<Business>;
  department?: Maybe<Department>;
  departments: Array<Department>;
  journalEntries: Array<JournalEntry>;
  journalEntry?: Maybe<JournalEntry>;
  journalEntryCategories: Array<JournalEntryCategory>;
  journalEntryCategory: JournalEntryCategory;
  journalEntryItem?: Maybe<JournalEntryItem>;
  journalEntryRefund?: Maybe<JournalEntryRefund>;
  journalEntrySources: Array<JournalEntrySource>;
  lc_journalEntryUpserts: Array<Lc_JournalEntryUpsert>;
  paymentMethod?: Maybe<PaymentMethod>;
  paymentMethods: Array<PaymentMethod>;
  people: Array<Person>;
};


export type QueryBudgetArgs = {
  id: Scalars['ID'];
};


export type QueryBusinessArgs = {
  id: Scalars['ID'];
};


export type QueryBusinessesArgs = {
  searchByName?: Maybe<Scalars['String']>;
};


export type QueryDepartmentArgs = {
  id: Scalars['ID'];
};


export type QueryDepartmentsArgs = {
  fromParent?: Maybe<Scalars['ID']>;
  searchByName?: Maybe<Scalars['String']>;
};


export type QueryJournalEntriesArgs = {
  where?: Maybe<JournalEntiresWhereInput>;
};


export type QueryJournalEntryArgs = {
  id: Scalars['ID'];
};


export type QueryJournalEntryCategoriesArgs = {
  where?: Maybe<JournalEntryCategoryWhereInput>;
};


export type QueryJournalEntryCategoryArgs = {
  id: Scalars['ID'];
};


export type QueryJournalEntryItemArgs = {
  id: Scalars['ID'];
};


export type QueryJournalEntryRefundArgs = {
  id: Scalars['ID'];
};


export type QueryJournalEntrySourcesArgs = {
  searchByName: Scalars['String'];
};


export type QueryPaymentMethodArgs = {
  id: Scalars['ID'];
};


export type QueryPaymentMethodsArgs = {
  where?: Maybe<PaymentMethodWhereInput>;
};


export type QueryPeopleArgs = {
  searchByName?: Maybe<PersonNameInput>;
};

export type Rational = {
  __typename?: 'Rational';
  n: Scalars['Int'];
  d: Scalars['Int'];
  s: RationalSign;
};

export type RationalInput = {
  n: Scalars['Int'];
  d: Scalars['Int'];
  s: RationalSign;
};

export enum RationalSign {
  Pos = 'POS',
  Neg = 'NEG'
}

export enum SortDirection {
  Asc = 'ASC',
  Desc = 'DESC'
}

export type Subscription = {
  __typename?: 'Subscription';
  journalEntryAdded: JournalEntry;
  journalEntryUpdated: JournalEntry;
  journalEntryUpserted: JournalEntry;
};


export type User = {
  __typename?: 'User';
  id: Scalars['ID'];
  user: Person;
};

export type Vendor = {
  __typename?: 'Vendor';
  approved: Scalars['Boolean'];
  vendorId?: Maybe<Scalars['ID']>;
};

export type WhereDate = {
  eq?: Maybe<Scalars['String']>;
  ne?: Maybe<Scalars['String']>;
  gt?: Maybe<Scalars['String']>;
  gte?: Maybe<Scalars['String']>;
  lt?: Maybe<Scalars['String']>;
  lte?: Maybe<Scalars['String']>;
  ignoreTime?: Maybe<Scalars['Boolean']>;
};

export type WhereRational = {
  eq?: Maybe<RationalInput>;
  ne?: Maybe<RationalInput>;
  gt?: Maybe<RationalInput>;
  gte?: Maybe<RationalInput>;
  lt?: Maybe<RationalInput>;
  lte?: Maybe<RationalInput>;
};

export type WhereRegexInput = {
  pattern: Scalars['String'];
  flags?: Maybe<Scalars['String']>;
};

export type DepartmentName_1QueryVariables = Exact<{
  id: Scalars['ID'];
}>;


export type DepartmentName_1Query = { __typename?: 'Query', department?: Maybe<{ __typename: 'Department', id: string, name: string }> };

export type DeptForUpsertAddQueryVariables = Exact<{
  id: Scalars['ID'];
}>;


export type DeptForUpsertAddQuery = { __typename?: 'Query', department?: Maybe<(
    { __typename?: 'Department' }
    & DeptEntryOptFragment
  )> };

export type OnEntryUpsert_2SubscriptionVariables = Exact<{ [key: string]: never; }>;


export type OnEntryUpsert_2Subscription = { __typename?: 'Subscription', journalEntryUpserted: (
    { __typename?: 'JournalEntry', department: { __typename?: 'Department', ancestors: Array<{ __typename: 'Department', id: string } | { __typename?: 'Business' }> } }
    & GetReportDataEntry_1Fragment
  ) };

export type GetReportDataDept_1Fragment = { __typename: 'Department', id: string, name: string, budget?: Maybe<{ __typename: 'Budget', id: string, amount: { __typename?: 'Rational', n: number, d: number, s: RationalSign } }> };

export type GetReportDataEntry_1Fragment = { __typename: 'JournalEntry', id: string, type: JournalEntryType, lastUpdate: string, deleted: boolean, category: { __typename: 'JournalEntryCategory', id: string, name: string }, total: { __typename?: 'Rational', n: number, d: number, s: RationalSign }, department: { __typename: 'Department', id: string, ancestors: Array<{ __typename: 'Department', id: string } | { __typename: 'Business', id: string }> }, refunds: Array<{ __typename: 'JournalEntryRefund', id: string, deleted: boolean, lastUpdate: string, total: { __typename?: 'Rational', n: number, d: number, s: RationalSign } }> };

export type GetReportDataQueryVariables = Exact<{
  deptId: Scalars['ID'];
  where: JournalEntiresWhereInput;
}>;


export type GetReportDataQuery = { __typename?: 'Query', department?: Maybe<(
    { __typename?: 'Department', descendants: Array<(
      { __typename?: 'Department' }
      & GetReportDataDept_1Fragment
    )> }
    & GetReportDataDept_1Fragment
  )>, journalEntries: Array<(
    { __typename?: 'JournalEntry' }
    & GetReportDataEntry_1Fragment
  )> };

export type JournalEntryAdded_2SubscriptionVariables = Exact<{ [key: string]: never; }>;


export type JournalEntryAdded_2Subscription = { __typename?: 'Subscription', journalEntryAdded: (
    { __typename?: 'JournalEntry' }
    & GetReportDataEntry_1Fragment
  ) };

export type JournalEntryUpdated_2SubscriptionVariables = Exact<{ [key: string]: never; }>;


export type JournalEntryUpdated_2Subscription = { __typename?: 'Subscription', journalEntryUpdated: (
    { __typename?: 'JournalEntry' }
    & GetReportDataEntry_1Fragment
  ) };

export type OnEntryUpsert_1SubscriptionVariables = Exact<{ [key: string]: never; }>;


export type OnEntryUpsert_1Subscription = { __typename?: 'Subscription', journalEntryUpserted: (
    { __typename?: 'JournalEntry', department: { __typename?: 'Department', ancestors: Array<{ __typename: 'Department', id: string } | { __typename?: 'Business' }> } }
    & JournalEntry_1Fragment
  ) };

export type ReconcileEntryMutationVariables = Exact<{
  id: Scalars['ID'];
}>;


export type ReconcileEntryMutation = { __typename?: 'Mutation', journalEntryUpdate: (
    { __typename?: 'JournalEntry' }
    & JournalEntry_1Fragment
  ) };

export type ReconcileRefundMutationVariables = Exact<{
  id: Scalars['ID'];
}>;


export type ReconcileRefundMutation = { __typename?: 'Mutation', journalEntryUpdateRefund: (
    { __typename?: 'JournalEntry' }
    & JournalEntry_1Fragment
  ) };

export type JournalEntryPayMethod_1Fragment = { __typename: 'PaymentMethod', id: string, name: string, parent?: Maybe<{ __typename: 'PaymentMethod', id: string }> };

export type JournalEntryCategory_1Fragment = { __typename: 'JournalEntryCategory', id: string, type: JournalEntryType, name: string };

export type JournalEntryDept_1Fragment = { __typename: 'Department', id: string, name: string, ancestors: Array<{ __typename: 'Department', id: string, deptName: string } | { __typename: 'Business', id: string, bizName: string }> };

export type JournalEntryRefund_1Fragment = { __typename: 'JournalEntryRefund', id: string, date: string, description?: Maybe<string>, reconciled: boolean, lastUpdate: string, deleted: boolean, total: { __typename?: 'Rational', n: number, d: number, s: RationalSign }, paymentMethod: (
    { __typename?: 'PaymentMethod' }
    & JournalEntryPayMethod_1Fragment
  ) };

export type JournalEntryItem_1Fragment = { __typename: 'JournalEntryItem', id: string, units: number, description?: Maybe<string>, lastUpdate: string, deleted: boolean, category?: Maybe<(
    { __typename?: 'JournalEntryCategory' }
    & JournalEntryCategory_1Fragment
  )>, department?: Maybe<(
    { __typename?: 'Department' }
    & JournalEntryDept_1Fragment
  )>, total: { __typename?: 'Rational', n: number, d: number, s: RationalSign } };

export type JournalEntry_1Fragment = { __typename: 'JournalEntry', id: string, date: string, type: JournalEntryType, description?: Maybe<string>, deleted: boolean, lastUpdate: string, reconciled: boolean, department: (
    { __typename: 'Department', id: string, name: string, ancestors: Array<{ __typename: 'Department', id: string, deptName: string } | { __typename: 'Business', id: string, bizName: string }> }
    & JournalEntryDept_1Fragment
  ), category: (
    { __typename?: 'JournalEntryCategory' }
    & JournalEntryCategory_1Fragment
  ), paymentMethod: (
    { __typename?: 'PaymentMethod' }
    & JournalEntryPayMethod_1Fragment
  ), source: { __typename: 'Person', id: string, name: { __typename?: 'PersonName', first: string, last: string } } | { __typename: 'Business', id: string, bizName: string } | { __typename: 'Department', id: string, deptName: string }, total: { __typename?: 'Rational', n: number, d: number, s: RationalSign }, refunds: Array<(
    { __typename?: 'JournalEntryRefund' }
    & JournalEntryRefund_1Fragment
  )>, items: Array<(
    { __typename?: 'JournalEntryItem' }
    & JournalEntryItem_1Fragment
  )> };

export type JournalEntries_1QueryVariables = Exact<{
  where: JournalEntiresWhereInput;
}>;


export type JournalEntries_1Query = { __typename?: 'Query', journalEntries: Array<(
    { __typename?: 'JournalEntry' }
    & JournalEntry_1Fragment
  )> };

export type JournalEntryAdded_1SubscriptionVariables = Exact<{ [key: string]: never; }>;


export type JournalEntryAdded_1Subscription = { __typename?: 'Subscription', journalEntryAdded: (
    { __typename?: 'JournalEntry' }
    & JournalEntry_1Fragment
  ) };

export type JournalEntryUpdated_1SubscriptionVariables = Exact<{ [key: string]: never; }>;


export type JournalEntryUpdated_1Subscription = { __typename?: 'Subscription', journalEntryUpdated: (
    { __typename?: 'JournalEntry' }
    & JournalEntry_1Fragment
  ) };

export type DeptIniValueForAddEntryQueryVariables = Exact<{
  id: Scalars['ID'];
}>;


export type DeptIniValueForAddEntryQuery = { __typename?: 'Query', department?: Maybe<(
    { __typename?: 'Department' }
    & DeptEntryOptFragment
  )> };

export type DeleteEntryMutationVariables = Exact<{
  id: Scalars['ID'];
}>;


export type DeleteEntryMutation = { __typename?: 'Mutation', journalEntryDelete: (
    { __typename?: 'JournalEntry' }
    & JournalEntry_1Fragment
  ) };

export type UpdateEntryIniStateQueryVariables = Exact<{
  id: Scalars['ID'];
}>;


export type UpdateEntryIniStateQuery = { __typename?: 'Query', journalEntry?: Maybe<{ __typename: 'JournalEntry', id: string, type: JournalEntryType, date: string, description?: Maybe<string>, reconciled: boolean, department: (
      { __typename?: 'Department' }
      & DeptEntryOptFragment
    ), category: (
      { __typename?: 'JournalEntryCategory', ancestors: Array<(
        { __typename?: 'JournalEntryCategory' }
        & CatEntryOptFragment
      )> }
      & CatEntryOptFragment
    ), source: (
      { __typename?: 'Person' }
      & SrcEntryPersonOptFragment
    ) | (
      { __typename?: 'Business' }
      & SrcEntryBizOptFragment
    ) | (
      { __typename?: 'Department', ancestors: Array<(
        { __typename?: 'Department' }
        & SrcEntryDeptOptFragment
      ) | (
        { __typename?: 'Business' }
        & SrcEntryBizOptFragment
      )> }
      & SrcEntryDeptOptFragment
    ), paymentMethod: (
      { __typename?: 'PaymentMethod', ancestors: Array<(
        { __typename?: 'PaymentMethod' }
        & PayMethodEntryOptFragment
      )> }
      & PayMethodEntryOptFragment
    ), total: { __typename?: 'Rational', n: number, d: number, s: RationalSign }, refunds: Array<{ __typename: 'JournalEntryRefund', id: string, deleted: boolean, date: string, total: { __typename?: 'Rational', n: number, d: number, s: RationalSign } }> }> };

export type AddEntryMutationVariables = Exact<{
  fields: JournalEntryAddFields;
  paymentMethodAdd?: Maybe<PaymentMethodAddFields>;
  personAdd?: Maybe<PersonAddFields>;
  businessAdd?: Maybe<BusinessAddFields>;
}>;


export type AddEntryMutation = { __typename?: 'Mutation', journalEntryAdd: (
    { __typename?: 'JournalEntry' }
    & JournalEntry_1Fragment
  ) };

export type UpdateEntryMutationVariables = Exact<{
  id: Scalars['ID'];
  fields: JournalEntryUpdateFields;
  paymentMethodAdd?: Maybe<PaymentMethodAddFields>;
  paymentMethodUpdate?: Maybe<JournalEntryUpdatePaymentMethod>;
  personAdd?: Maybe<PersonAddFields>;
  businessAdd?: Maybe<BusinessAddFields>;
}>;


export type UpdateEntryMutation = { __typename?: 'Mutation', journalEntryUpdate: (
    { __typename?: 'JournalEntry' }
    & JournalEntry_1Fragment
  ) };

export type CatEntryOptsQueryVariables = Exact<{
  where: JournalEntryCategoryWhereInput;
}>;


export type CatEntryOptsQuery = { __typename?: 'Query', catOpts: Array<(
    { __typename?: 'JournalEntryCategory' }
    & CatEntryOptFragment
  )> };

export type DeptEntryOptsQueryVariables = Exact<{
  fromParent?: Maybe<Scalars['ID']>;
}>;


export type DeptEntryOptsQuery = { __typename?: 'Query', deptOpts: Array<(
    { __typename?: 'Department' }
    & DeptEntryOptFragment
  )> };

export type PayMethodEntryOptsQueryVariables = Exact<{
  where: PaymentMethodWhereInput;
}>;


export type PayMethodEntryOptsQuery = { __typename?: 'Query', paymentMethods: Array<(
    { __typename?: 'PaymentMethod' }
    & PayMethodEntryOptFragment
  )> };

export type SrcEntryOptsQueryVariables = Exact<{
  name: Scalars['String'];
  isBiz: Scalars['Boolean'];
}>;


export type SrcEntryOptsQuery = { __typename?: 'Query', businesses: Array<(
    { __typename?: 'Business' }
    & SrcEntryBizOptFragment
  )>, people: Array<(
    { __typename?: 'Person' }
    & SrcEntryPersonOptFragment
  )> };

export type GetEntryItemState_1QueryVariables = Exact<{
  id: Scalars['ID'];
}>;


export type GetEntryItemState_1Query = { __typename?: 'Query', journalEntry?: Maybe<(
    { __typename?: 'JournalEntry' }
    & JournalEntry_3Fragment
  )> };

export type DeleteItemMutationVariables = Exact<{
  id: Scalars['ID'];
}>;


export type DeleteItemMutation = { __typename?: 'Mutation', journalEntryDeleteItem: { __typename?: 'JournalEntryItemUpsertResult', journalEntryItem: { __typename: 'JournalEntryItem', id: string, deleted: boolean } } };

export type UpdateItemIniStateQueryVariables = Exact<{
  entryId: Scalars['ID'];
  itemId: Scalars['ID'];
}>;


export type UpdateItemIniStateQuery = { __typename?: 'Query', journalEntry?: Maybe<(
    { __typename?: 'JournalEntry' }
    & JournalEntry_3Fragment
  )>, journalEntryItem?: Maybe<{ __typename: 'JournalEntryItem', id: string, description?: Maybe<string>, units: number, department?: Maybe<(
      { __typename?: 'Department' }
      & DeptEntryOptFragment
    )>, category?: Maybe<(
      { __typename?: 'JournalEntryCategory', ancestors: Array<(
        { __typename?: 'JournalEntryCategory' }
        & CatEntryOptFragment
      )> }
      & CatEntryOptFragment
    )>, total: { __typename?: 'Rational', n: number, d: number, s: RationalSign } }> };

export type JournalEntry_3Fragment = { __typename: 'JournalEntry', id: string, type: JournalEntryType, total: { __typename?: 'Rational', n: number, d: number, s: RationalSign }, items: Array<{ __typename: 'JournalEntryItem', id: string, deleted: boolean, total: { __typename?: 'Rational', n: number, d: number, s: RationalSign } }> };

export type AddEntryItemMutationVariables = Exact<{
  id: Scalars['ID'];
  fields: JournalEntryAddItemFields;
}>;


export type AddEntryItemMutation = { __typename?: 'Mutation', journalEntryAddItem: { __typename?: 'JournalEntryItemUpsertResult', journalEntry: (
      { __typename?: 'JournalEntry' }
      & JournalEntry_1Fragment
    ) } };

export type UpdateEntryItemMutationVariables = Exact<{
  id: Scalars['ID'];
  fields: JournalEntryUpdateItemFields;
}>;


export type UpdateEntryItemMutation = { __typename?: 'Mutation', journalEntryUpdateItem: { __typename?: 'JournalEntryItemUpsertResult', journalEntryItem: (
      { __typename?: 'JournalEntryItem' }
      & JournalEntryItem_1Fragment
    ) } };

export type GetEntryRefundInfo_1QueryVariables = Exact<{
  id: Scalars['ID'];
}>;


export type GetEntryRefundInfo_1Query = { __typename?: 'Query', journalEntry?: Maybe<(
    { __typename?: 'JournalEntry' }
    & JournalEntry_2Fragment
  )> };

export type DeleteRefundMutationVariables = Exact<{
  id: Scalars['ID'];
}>;


export type DeleteRefundMutation = { __typename?: 'Mutation', journalEntryDeleteRefund: (
    { __typename?: 'JournalEntry' }
    & JournalEntry_1Fragment
  ) };

export type UpdateRefundIniStateQueryVariables = Exact<{
  entryId: Scalars['ID'];
  refundId: Scalars['ID'];
}>;


export type UpdateRefundIniStateQuery = { __typename?: 'Query', journalEntry?: Maybe<(
    { __typename?: 'JournalEntry' }
    & JournalEntry_2Fragment
  )>, journalEntryRefund?: Maybe<{ __typename: 'JournalEntryRefund', id: string, date: string, description?: Maybe<string>, reconciled: boolean, paymentMethod: (
      { __typename?: 'PaymentMethod', ancestors: Array<(
        { __typename?: 'PaymentMethod' }
        & PayMethodEntryOptFragment
      )> }
      & PayMethodEntryOptFragment
    ), total: { __typename?: 'Rational', n: number, d: number, s: RationalSign } }> };

export type JournalEntry_2Fragment = { __typename: 'JournalEntry', id: string, date: string, type: JournalEntryType, total: { __typename?: 'Rational', n: number, d: number, s: RationalSign }, refunds: Array<{ __typename: 'JournalEntryRefund', id: string, deleted: boolean, total: { __typename?: 'Rational', n: number, d: number, s: RationalSign } }> };

export type AddEntryRefundMutationVariables = Exact<{
  id: Scalars['ID'];
  fields: JournalEntryAddRefundFields;
  paymentMethodAdd?: Maybe<PaymentMethodAddFields>;
}>;


export type AddEntryRefundMutation = { __typename?: 'Mutation', journalEntryAddRefund: { __typename: 'JournalEntry', id: string, refunds: Array<(
      { __typename?: 'JournalEntryRefund' }
      & JournalEntryRefund_1Fragment
    )> } };

export type UpdateRefundMutationVariables = Exact<{
  id: Scalars['ID'];
  fields: JournalEntryUpdateRefundFields;
  paymentMethodAdd?: Maybe<PaymentMethodAddFields>;
  paymentMethodUpdate?: Maybe<JournalEntryUpdatePaymentMethod>;
}>;


export type UpdateRefundMutation = { __typename?: 'Mutation', journalEntryUpdateRefund: { __typename: 'JournalEntry', id: string, refunds: Array<(
      { __typename?: 'JournalEntryRefund' }
      & JournalEntryRefund_1Fragment
    )> } };

export type DeptEntryOptFragment = { __typename: 'Department', id: string, name: string, parent: { __typename: 'Department', id: string } | { __typename: 'Business', id: string } };

export type CatEntryOptFragment = { __typename: 'JournalEntryCategory', id: string, name: string, type: JournalEntryType, parent?: Maybe<{ __typename: 'JournalEntryCategory', id: string }> };

export type SrcEntryPersonOptFragment = { __typename: 'Person', id: string, personName: { __typename?: 'PersonName', first: string, last: string } };

export type SrcEntryDeptOptFragment = { __typename: 'Department', id: string, name: string, parent: { __typename: 'Department', id: string } | { __typename: 'Business', id: string } };

export type SrcEntryBizOptFragment = { __typename: 'Business', id: string, name: string, vendor?: Maybe<{ __typename?: 'Vendor', approved: boolean, vendorId?: Maybe<string> }>, departments: Array<(
    { __typename?: 'Department' }
    & SrcEntryDeptOptFragment
  )> };

export type PayMethodEntryOptFragment = { __typename: 'PaymentMethod', id: string, refId?: Maybe<string>, name: string, active: boolean, parent?: Maybe<{ __typename: 'PaymentMethod', id: string }> };

export type DeptsForNav_1QueryVariables = Exact<{ [key: string]: never; }>;


export type DeptsForNav_1Query = { __typename?: 'Query', departments: Array<{ __typename: 'Department', id: string, name: string, virtualRoot?: Maybe<boolean>, parent: { __typename: 'Department', id: string } | { __typename: 'Business', id: string } }> };



export type ResolverTypeWrapper<T> = Promise<T> | T;

export type Resolver<TResult, TParent = {}, TContext = {}, TArgs = {}> = ResolverFn<TResult, TParent, TContext, TArgs>;

export type ResolverFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => Promise<TResult> | TResult;

export type SubscriptionSubscribeFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => AsyncIterator<TResult> | Promise<AsyncIterator<TResult>>;

export type SubscriptionResolveFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => TResult | Promise<TResult>;

export interface SubscriptionSubscriberObject<TResult, TKey extends string, TParent, TContext, TArgs> {
  subscribe: SubscriptionSubscribeFn<{ [key in TKey]: TResult }, TParent, TContext, TArgs>;
  resolve?: SubscriptionResolveFn<TResult, { [key in TKey]: TResult }, TContext, TArgs>;
}

export interface SubscriptionResolverObject<TResult, TParent, TContext, TArgs> {
  subscribe: SubscriptionSubscribeFn<any, TParent, TContext, TArgs>;
  resolve: SubscriptionResolveFn<TResult, any, TContext, TArgs>;
}

export type SubscriptionObject<TResult, TKey extends string, TParent, TContext, TArgs> =
  | SubscriptionSubscriberObject<TResult, TKey, TParent, TContext, TArgs>
  | SubscriptionResolverObject<TResult, TParent, TContext, TArgs>;

export type SubscriptionResolver<TResult, TKey extends string, TParent = {}, TContext = {}, TArgs = {}> =
  | ((...args: any[]) => SubscriptionObject<TResult, TKey, TParent, TContext, TArgs>)
  | SubscriptionObject<TResult, TKey, TParent, TContext, TArgs>;

export type TypeResolveFn<TTypes, TParent = {}, TContext = {}> = (
  parent: TParent,
  context: TContext,
  info: GraphQLResolveInfo
) => Maybe<TTypes> | Promise<Maybe<TTypes>>;

export type IsTypeOfResolverFn<T = {}> = (obj: T, info: GraphQLResolveInfo) => boolean | Promise<boolean>;

export type NextResolverFn<T> = () => Promise<T>;

export type DirectiveResolverFn<TResult = {}, TParent = {}, TContext = {}, TArgs = {}> = (
  next: NextResolverFn<TResult>,
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => TResult | Promise<TResult>;

/** Mapping between all available schema types and the resolvers types */
export type ResolversTypes = {
  Query: ResolverTypeWrapper<{}>;
  ID: ResolverTypeWrapper<Scalars['ID']>;
  Budget: ResolverTypeWrapper<Omit<Budget, 'owner'> & { owner: ResolversTypes['BudgetOwner'] }>;
  Rational: ResolverTypeWrapper<Rational>;
  Int: ResolverTypeWrapper<Scalars['Int']>;
  RationalSign: RationalSign;
  BudgetOwner: ResolversTypes['Department'] | ResolversTypes['Business'];
  Department: ResolverTypeWrapper<Omit<Department, 'parent' | 'ancestors'> & { parent: ResolversTypes['DepartmentAncestor'], ancestors: Array<ResolversTypes['DepartmentAncestor']> }>;
  String: ResolverTypeWrapper<Scalars['String']>;
  Business: ResolverTypeWrapper<Business>;
  Vendor: ResolverTypeWrapper<Vendor>;
  Boolean: ResolverTypeWrapper<Scalars['Boolean']>;
  DepartmentAncestor: ResolversTypes['Department'] | ResolversTypes['Business'];
  JournalEntiresWhereInput: JournalEntiresWhereInput;
  WhereDate: WhereDate;
  JournalEntriesWhereDepartment: JournalEntriesWhereDepartment;
  JournalEntriesWhereCategory: JournalEntriesWhereCategory;
  JournalEntriesWhereSource: JournalEntriesWhereSource;
  JournalEntrySourceType: JournalEntrySourceType;
  JournalEntriesWherePaymentMethod: JournalEntriesWherePaymentMethod;
  WhereRational: WhereRational;
  RationalInput: RationalInput;
  JournalEntry: ResolverTypeWrapper<Omit<JournalEntry, 'source'> & { source: ResolversTypes['JournalEntrySource'] }>;
  JournalEntryRefund: ResolverTypeWrapper<JournalEntryRefund>;
  PaymentMethod: ResolverTypeWrapper<PaymentMethod>;
  PaymentMethodAuthorization: ResolverTypeWrapper<Omit<PaymentMethodAuthorization, 'entity'> & { entity?: Maybe<ResolversTypes['PaymentMethodAuthorizedEntity']> }>;
  PaymentMethodAuthorizedEntity: ResolversTypes['Person'] | ResolversTypes['Business'] | ResolversTypes['Department'];
  Person: ResolverTypeWrapper<Person>;
  PersonName: ResolverTypeWrapper<PersonName>;
  JournalEntryItem: ResolverTypeWrapper<JournalEntryItem>;
  JournalEntryCategory: ResolverTypeWrapper<JournalEntryCategory>;
  JournalEntryType: JournalEntryType;
  JournalEntrySource: ResolversTypes['Person'] | ResolversTypes['Business'] | ResolversTypes['Department'];
  JournalEntryCategoryWhereInput: JournalEntryCategoryWhereInput;
  JournalEntryCategoryWhereNameInput: JournalEntryCategoryWhereNameInput;
  JournalEntryCategoryWhereTypeInput: JournalEntryCategoryWhereTypeInput;
  JournalEntryCategoryWhereParentInput: JournalEntryCategoryWhereParentInput;
  LC_JournalEntryUpsert: ResolverTypeWrapper<Lc_JournalEntryUpsert>;
  LC_JournalEntryUpsertType: Lc_JournalEntryUpsertType;
  LC_JournalEntryUpsertSubmitStatus: Lc_JournalEntryUpsertSubmitStatus;
  LC_JournalEntryUpsertInputValues: ResolverTypeWrapper<Lc_JournalEntryUpsertInputValues>;
  LC_JournalEntryUpsertInputErrors: ResolverTypeWrapper<Lc_JournalEntryUpsertInputErrors>;
  LC_JournalEntryUpsertFields: ResolverTypeWrapper<Lc_JournalEntryUpsertFields>;
  LC_JournalEntryUpsertSource: ResolverTypeWrapper<Lc_JournalEntryUpsertSource>;
  PaymentMethodWhereInput: PaymentMethodWhereInput;
  PaymentMethodWhereRefIdInput: PaymentMethodWhereRefIdInput;
  PaymentMethodWhereNameInput: PaymentMethodWhereNameInput;
  PaymentMethodWhereParentInput: PaymentMethodWhereParentInput;
  PersonNameInput: PersonNameInput;
  Mutation: ResolverTypeWrapper<{}>;
  BusinessAddFields: BusinessAddFields;
  JournalEntryUpdateFields: JournalEntryUpdateFields;
  JournalEntrySourceInput: JournalEntrySourceInput;
  PaymentMethodAddFields: PaymentMethodAddFields;
  JournalEntryUpdatePaymentMethod: JournalEntryUpdatePaymentMethod;
  PaymentMethodUpdateFields: PaymentMethodUpdateFields;
  PersonAddFields: PersonAddFields;
  JournalEntryAddFields: JournalEntryAddFields;
  JournalEntryAddRefundFields: JournalEntryAddRefundFields;
  JournalEntryUpdateRefundFields: JournalEntryUpdateRefundFields;
  JournalEntryAddItemFields: JournalEntryAddItemFields;
  JournalEntryItemUpsertResult: ResolverTypeWrapper<JournalEntryItemUpsertResult>;
  JournalEntryUpdateItemFields: JournalEntryUpdateItemFields;
  Subscription: ResolverTypeWrapper<{}>;
  DepartmentAddFields: DepartmentAddFields;
  SortDirection: SortDirection;
  FilterType: FilterType;
  PaginateInput: PaginateInput;
  ByIdFilter: ByIdFilter;
  WhereRegexInput: WhereRegexInput;
  User: ResolverTypeWrapper<User>;
  CacheControlScope: CacheControlScope;
  Upload: ResolverTypeWrapper<Scalars['Upload']>;
};

/** Mapping between all available schema types and the resolvers parents */
export type ResolversParentTypes = {
  Query: {};
  ID: Scalars['ID'];
  Budget: Omit<Budget, 'owner'> & { owner: ResolversParentTypes['BudgetOwner'] };
  Rational: Rational;
  Int: Scalars['Int'];
  BudgetOwner: ResolversParentTypes['Department'] | ResolversParentTypes['Business'];
  Department: Omit<Department, 'parent' | 'ancestors'> & { parent: ResolversParentTypes['DepartmentAncestor'], ancestors: Array<ResolversParentTypes['DepartmentAncestor']> };
  String: Scalars['String'];
  Business: Business;
  Vendor: Vendor;
  Boolean: Scalars['Boolean'];
  DepartmentAncestor: ResolversParentTypes['Department'] | ResolversParentTypes['Business'];
  JournalEntiresWhereInput: JournalEntiresWhereInput;
  WhereDate: WhereDate;
  JournalEntriesWhereDepartment: JournalEntriesWhereDepartment;
  JournalEntriesWhereCategory: JournalEntriesWhereCategory;
  JournalEntriesWhereSource: JournalEntriesWhereSource;
  JournalEntriesWherePaymentMethod: JournalEntriesWherePaymentMethod;
  WhereRational: WhereRational;
  RationalInput: RationalInput;
  JournalEntry: Omit<JournalEntry, 'source'> & { source: ResolversParentTypes['JournalEntrySource'] };
  JournalEntryRefund: JournalEntryRefund;
  PaymentMethod: PaymentMethod;
  PaymentMethodAuthorization: Omit<PaymentMethodAuthorization, 'entity'> & { entity?: Maybe<ResolversParentTypes['PaymentMethodAuthorizedEntity']> };
  PaymentMethodAuthorizedEntity: ResolversParentTypes['Person'] | ResolversParentTypes['Business'] | ResolversParentTypes['Department'];
  Person: Person;
  PersonName: PersonName;
  JournalEntryItem: JournalEntryItem;
  JournalEntryCategory: JournalEntryCategory;
  JournalEntrySource: ResolversParentTypes['Person'] | ResolversParentTypes['Business'] | ResolversParentTypes['Department'];
  JournalEntryCategoryWhereInput: JournalEntryCategoryWhereInput;
  JournalEntryCategoryWhereNameInput: JournalEntryCategoryWhereNameInput;
  JournalEntryCategoryWhereTypeInput: JournalEntryCategoryWhereTypeInput;
  JournalEntryCategoryWhereParentInput: JournalEntryCategoryWhereParentInput;
  LC_JournalEntryUpsert: Lc_JournalEntryUpsert;
  LC_JournalEntryUpsertInputValues: Lc_JournalEntryUpsertInputValues;
  LC_JournalEntryUpsertInputErrors: Lc_JournalEntryUpsertInputErrors;
  LC_JournalEntryUpsertFields: Lc_JournalEntryUpsertFields;
  LC_JournalEntryUpsertSource: Lc_JournalEntryUpsertSource;
  PaymentMethodWhereInput: PaymentMethodWhereInput;
  PaymentMethodWhereRefIdInput: PaymentMethodWhereRefIdInput;
  PaymentMethodWhereNameInput: PaymentMethodWhereNameInput;
  PaymentMethodWhereParentInput: PaymentMethodWhereParentInput;
  PersonNameInput: PersonNameInput;
  Mutation: {};
  BusinessAddFields: BusinessAddFields;
  JournalEntryUpdateFields: JournalEntryUpdateFields;
  JournalEntrySourceInput: JournalEntrySourceInput;
  PaymentMethodAddFields: PaymentMethodAddFields;
  JournalEntryUpdatePaymentMethod: JournalEntryUpdatePaymentMethod;
  PaymentMethodUpdateFields: PaymentMethodUpdateFields;
  PersonAddFields: PersonAddFields;
  JournalEntryAddFields: JournalEntryAddFields;
  JournalEntryAddRefundFields: JournalEntryAddRefundFields;
  JournalEntryUpdateRefundFields: JournalEntryUpdateRefundFields;
  JournalEntryAddItemFields: JournalEntryAddItemFields;
  JournalEntryItemUpsertResult: JournalEntryItemUpsertResult;
  JournalEntryUpdateItemFields: JournalEntryUpdateItemFields;
  Subscription: {};
  DepartmentAddFields: DepartmentAddFields;
  PaginateInput: PaginateInput;
  ByIdFilter: ByIdFilter;
  WhereRegexInput: WhereRegexInput;
  User: User;
  Upload: Scalars['Upload'];
};

export type BudgetResolvers<ContextType = Context, ParentType extends ResolversParentTypes['Budget'] = ResolversParentTypes['Budget']> = {
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  amount?: Resolver<ResolversTypes['Rational'], ParentType, ContextType>;
  owner?: Resolver<ResolversTypes['BudgetOwner'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType>;
};

export type BudgetOwnerResolvers<ContextType = Context, ParentType extends ResolversParentTypes['BudgetOwner'] = ResolversParentTypes['BudgetOwner']> = {
  __resolveType: TypeResolveFn<'Department' | 'Business', ParentType, ContextType>;
};

export type BusinessResolvers<ContextType = Context, ParentType extends ResolversParentTypes['Business'] = ResolversParentTypes['Business']> = {
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  name?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  budget?: Resolver<Maybe<ResolversTypes['Budget']>, ParentType, ContextType>;
  departments?: Resolver<Array<ResolversTypes['Department']>, ParentType, ContextType>;
  vendor?: Resolver<Maybe<ResolversTypes['Vendor']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType>;
};

export type DepartmentResolvers<ContextType = Context, ParentType extends ResolversParentTypes['Department'] = ResolversParentTypes['Department']> = {
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  name?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  code?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  budget?: Resolver<Maybe<ResolversTypes['Budget']>, ParentType, ContextType>;
  business?: Resolver<ResolversTypes['Business'], ParentType, ContextType>;
  parent?: Resolver<ResolversTypes['DepartmentAncestor'], ParentType, ContextType>;
  ancestors?: Resolver<Array<ResolversTypes['DepartmentAncestor']>, ParentType, ContextType>;
  descendants?: Resolver<Array<ResolversTypes['Department']>, ParentType, ContextType>;
  virtualRoot?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType>;
};

export type DepartmentAncestorResolvers<ContextType = Context, ParentType extends ResolversParentTypes['DepartmentAncestor'] = ResolversParentTypes['DepartmentAncestor']> = {
  __resolveType: TypeResolveFn<'Department' | 'Business', ParentType, ContextType>;
};

export type JournalEntryResolvers<ContextType = Context, ParentType extends ResolversParentTypes['JournalEntry'] = ResolversParentTypes['JournalEntry']> = {
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  refunds?: Resolver<Array<ResolversTypes['JournalEntryRefund']>, ParentType, ContextType>;
  items?: Resolver<Array<ResolversTypes['JournalEntryItem']>, ParentType, ContextType>;
  type?: Resolver<ResolversTypes['JournalEntryType'], ParentType, ContextType>;
  date?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  department?: Resolver<ResolversTypes['Department'], ParentType, ContextType>;
  category?: Resolver<ResolversTypes['JournalEntryCategory'], ParentType, ContextType>;
  paymentMethod?: Resolver<ResolversTypes['PaymentMethod'], ParentType, ContextType>;
  description?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  total?: Resolver<ResolversTypes['Rational'], ParentType, ContextType>;
  source?: Resolver<ResolversTypes['JournalEntrySource'], ParentType, ContextType>;
  reconciled?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  lastUpdate?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  deleted?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType>;
};

export type JournalEntryCategoryResolvers<ContextType = Context, ParentType extends ResolversParentTypes['JournalEntryCategory'] = ResolversParentTypes['JournalEntryCategory']> = {
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  name?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  type?: Resolver<ResolversTypes['JournalEntryType'], ParentType, ContextType>;
  parent?: Resolver<Maybe<ResolversTypes['JournalEntryCategory']>, ParentType, ContextType>;
  ancestors?: Resolver<Array<ResolversTypes['JournalEntryCategory']>, ParentType, ContextType>;
  children?: Resolver<Array<ResolversTypes['JournalEntryCategory']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType>;
};

export type JournalEntryItemResolvers<ContextType = Context, ParentType extends ResolversParentTypes['JournalEntryItem'] = ResolversParentTypes['JournalEntryItem']> = {
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  department?: Resolver<Maybe<ResolversTypes['Department']>, ParentType, ContextType>;
  category?: Resolver<Maybe<ResolversTypes['JournalEntryCategory']>, ParentType, ContextType>;
  description?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  units?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  total?: Resolver<ResolversTypes['Rational'], ParentType, ContextType>;
  lastUpdate?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  deleted?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType>;
};

export type JournalEntryItemUpsertResultResolvers<ContextType = Context, ParentType extends ResolversParentTypes['JournalEntryItemUpsertResult'] = ResolversParentTypes['JournalEntryItemUpsertResult']> = {
  journalEntryItem?: Resolver<ResolversTypes['JournalEntryItem'], ParentType, ContextType>;
  journalEntry?: Resolver<ResolversTypes['JournalEntry'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType>;
};

export type JournalEntryRefundResolvers<ContextType = Context, ParentType extends ResolversParentTypes['JournalEntryRefund'] = ResolversParentTypes['JournalEntryRefund']> = {
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  date?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  description?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  paymentMethod?: Resolver<ResolversTypes['PaymentMethod'], ParentType, ContextType>;
  total?: Resolver<ResolversTypes['Rational'], ParentType, ContextType>;
  reconciled?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  lastUpdate?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  deleted?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType>;
};

export type JournalEntrySourceResolvers<ContextType = Context, ParentType extends ResolversParentTypes['JournalEntrySource'] = ResolversParentTypes['JournalEntrySource']> = {
  __resolveType: TypeResolveFn<'Person' | 'Business' | 'Department', ParentType, ContextType>;
};

export type Lc_JournalEntryUpsertResolvers<ContextType = Context, ParentType extends ResolversParentTypes['LC_JournalEntryUpsert'] = ResolversParentTypes['LC_JournalEntryUpsert']> = {
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  valid?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  type?: Resolver<ResolversTypes['LC_JournalEntryUpsertType'], ParentType, ContextType>;
  submitStatus?: Resolver<ResolversTypes['LC_JournalEntryUpsertSubmitStatus'], ParentType, ContextType>;
  submitError?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  inputValues?: Resolver<ResolversTypes['LC_JournalEntryUpsertInputValues'], ParentType, ContextType>;
  inputErrors?: Resolver<ResolversTypes['LC_JournalEntryUpsertInputErrors'], ParentType, ContextType>;
  fields?: Resolver<ResolversTypes['LC_JournalEntryUpsertFields'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType>;
};

export type Lc_JournalEntryUpsertFieldsResolvers<ContextType = Context, ParentType extends ResolversParentTypes['LC_JournalEntryUpsertFields'] = ResolversParentTypes['LC_JournalEntryUpsertFields']> = {
  id?: Resolver<Maybe<ResolversTypes['ID']>, ParentType, ContextType>;
  date?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  department?: Resolver<Array<ResolversTypes['ID']>, ParentType, ContextType>;
  type?: Resolver<Maybe<ResolversTypes['ID']>, ParentType, ContextType>;
  paymentMethod?: Resolver<Maybe<ResolversTypes['ID']>, ParentType, ContextType>;
  total?: Resolver<Maybe<ResolversTypes['Rational']>, ParentType, ContextType>;
  source?: Resolver<Array<ResolversTypes['LC_JournalEntryUpsertSource']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType>;
};

export type Lc_JournalEntryUpsertInputErrorsResolvers<ContextType = Context, ParentType extends ResolversParentTypes['LC_JournalEntryUpsertInputErrors'] = ResolversParentTypes['LC_JournalEntryUpsertInputErrors']> = {
  dateError?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  deptError?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  typeError?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  payMethodError?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  totalError?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  srcError?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType>;
};

export type Lc_JournalEntryUpsertInputValuesResolvers<ContextType = Context, ParentType extends ResolversParentTypes['LC_JournalEntryUpsertInputValues'] = ResolversParentTypes['LC_JournalEntryUpsertInputValues']> = {
  deptInput?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  totalInput?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  srcInput?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  srcType?: Resolver<Maybe<ResolversTypes['JournalEntrySourceType']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType>;
};

export type Lc_JournalEntryUpsertSourceResolvers<ContextType = Context, ParentType extends ResolversParentTypes['LC_JournalEntryUpsertSource'] = ResolversParentTypes['LC_JournalEntryUpsertSource']> = {
  sourceType?: Resolver<ResolversTypes['JournalEntrySourceType'], ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType>;
};

export type MutationResolvers<ContextType = Context, ParentType extends ResolversParentTypes['Mutation'] = ResolversParentTypes['Mutation']> = {
  addBusiness?: Resolver<ResolversTypes['Business'], ParentType, ContextType, RequireFields<MutationAddBusinessArgs, 'fields'>>;
  journalEntryUpdate?: Resolver<ResolversTypes['JournalEntry'], ParentType, ContextType, RequireFields<MutationJournalEntryUpdateArgs, 'id' | 'fields'>>;
  journalEntryAdd?: Resolver<ResolversTypes['JournalEntry'], ParentType, ContextType, RequireFields<MutationJournalEntryAddArgs, 'fields'>>;
  journalEntryDelete?: Resolver<ResolversTypes['JournalEntry'], ParentType, ContextType, RequireFields<MutationJournalEntryDeleteArgs, 'id'>>;
  journalEntryAddRefund?: Resolver<ResolversTypes['JournalEntry'], ParentType, ContextType, RequireFields<MutationJournalEntryAddRefundArgs, 'id' | 'fields'>>;
  journalEntryUpdateRefund?: Resolver<ResolversTypes['JournalEntry'], ParentType, ContextType, RequireFields<MutationJournalEntryUpdateRefundArgs, 'id' | 'fields'>>;
  journalEntryDeleteRefund?: Resolver<ResolversTypes['JournalEntry'], ParentType, ContextType, RequireFields<MutationJournalEntryDeleteRefundArgs, 'id'>>;
  journalEntryAddItem?: Resolver<ResolversTypes['JournalEntryItemUpsertResult'], ParentType, ContextType, RequireFields<MutationJournalEntryAddItemArgs, 'id' | 'fields'>>;
  journalEntryUpdateItem?: Resolver<ResolversTypes['JournalEntryItemUpsertResult'], ParentType, ContextType, RequireFields<MutationJournalEntryUpdateItemArgs, 'id' | 'fields'>>;
  journalEntryDeleteItem?: Resolver<ResolversTypes['JournalEntryItemUpsertResult'], ParentType, ContextType, RequireFields<MutationJournalEntryDeleteItemArgs, 'id'>>;
  paymentMethodUpdate?: Resolver<ResolversTypes['PaymentMethod'], ParentType, ContextType, RequireFields<MutationPaymentMethodUpdateArgs, 'id' | 'fields'>>;
  paymentMethodAdd?: Resolver<ResolversTypes['PaymentMethod'], ParentType, ContextType, RequireFields<MutationPaymentMethodAddArgs, 'fields'>>;
  addPerson?: Resolver<ResolversTypes['Person'], ParentType, ContextType, RequireFields<MutationAddPersonArgs, 'fields'>>;
};

export type PaymentMethodResolvers<ContextType = Context, ParentType extends ResolversParentTypes['PaymentMethod'] = ResolversParentTypes['PaymentMethod']> = {
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  active?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  refId?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  name?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  parent?: Resolver<Maybe<ResolversTypes['PaymentMethod']>, ParentType, ContextType>;
  ancestors?: Resolver<Array<ResolversTypes['PaymentMethod']>, ParentType, ContextType>;
  children?: Resolver<Array<ResolversTypes['PaymentMethod']>, ParentType, ContextType>;
  allowChildren?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  authorization?: Resolver<Array<ResolversTypes['PaymentMethodAuthorization']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType>;
};

export type PaymentMethodAuthorizationResolvers<ContextType = Context, ParentType extends ResolversParentTypes['PaymentMethodAuthorization'] = ResolversParentTypes['PaymentMethodAuthorization']> = {
  owner?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  entity?: Resolver<Maybe<ResolversTypes['PaymentMethodAuthorizedEntity']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType>;
};

export type PaymentMethodAuthorizedEntityResolvers<ContextType = Context, ParentType extends ResolversParentTypes['PaymentMethodAuthorizedEntity'] = ResolversParentTypes['PaymentMethodAuthorizedEntity']> = {
  __resolveType: TypeResolveFn<'Person' | 'Business' | 'Department', ParentType, ContextType>;
};

export type PersonResolvers<ContextType = Context, ParentType extends ResolversParentTypes['Person'] = ResolversParentTypes['Person']> = {
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  name?: Resolver<ResolversTypes['PersonName'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType>;
};

export type PersonNameResolvers<ContextType = Context, ParentType extends ResolversParentTypes['PersonName'] = ResolversParentTypes['PersonName']> = {
  first?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  last?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType>;
};

export type QueryResolvers<ContextType = Context, ParentType extends ResolversParentTypes['Query'] = ResolversParentTypes['Query']> = {
  budget?: Resolver<ResolversTypes['Budget'], ParentType, ContextType, RequireFields<QueryBudgetArgs, 'id'>>;
  budgets?: Resolver<Array<ResolversTypes['Budget']>, ParentType, ContextType>;
  business?: Resolver<ResolversTypes['Business'], ParentType, ContextType, RequireFields<QueryBusinessArgs, 'id'>>;
  businesses?: Resolver<Array<ResolversTypes['Business']>, ParentType, ContextType, RequireFields<QueryBusinessesArgs, never>>;
  department?: Resolver<Maybe<ResolversTypes['Department']>, ParentType, ContextType, RequireFields<QueryDepartmentArgs, 'id'>>;
  departments?: Resolver<Array<ResolversTypes['Department']>, ParentType, ContextType, RequireFields<QueryDepartmentsArgs, never>>;
  journalEntries?: Resolver<Array<ResolversTypes['JournalEntry']>, ParentType, ContextType, RequireFields<QueryJournalEntriesArgs, never>>;
  journalEntry?: Resolver<Maybe<ResolversTypes['JournalEntry']>, ParentType, ContextType, RequireFields<QueryJournalEntryArgs, 'id'>>;
  journalEntryCategories?: Resolver<Array<ResolversTypes['JournalEntryCategory']>, ParentType, ContextType, RequireFields<QueryJournalEntryCategoriesArgs, never>>;
  journalEntryCategory?: Resolver<ResolversTypes['JournalEntryCategory'], ParentType, ContextType, RequireFields<QueryJournalEntryCategoryArgs, 'id'>>;
  journalEntryItem?: Resolver<Maybe<ResolversTypes['JournalEntryItem']>, ParentType, ContextType, RequireFields<QueryJournalEntryItemArgs, 'id'>>;
  journalEntryRefund?: Resolver<Maybe<ResolversTypes['JournalEntryRefund']>, ParentType, ContextType, RequireFields<QueryJournalEntryRefundArgs, 'id'>>;
  journalEntrySources?: Resolver<Array<ResolversTypes['JournalEntrySource']>, ParentType, ContextType, RequireFields<QueryJournalEntrySourcesArgs, 'searchByName'>>;
  lc_journalEntryUpserts?: Resolver<Array<ResolversTypes['LC_JournalEntryUpsert']>, ParentType, ContextType>;
  paymentMethod?: Resolver<Maybe<ResolversTypes['PaymentMethod']>, ParentType, ContextType, RequireFields<QueryPaymentMethodArgs, 'id'>>;
  paymentMethods?: Resolver<Array<ResolversTypes['PaymentMethod']>, ParentType, ContextType, RequireFields<QueryPaymentMethodsArgs, never>>;
  people?: Resolver<Array<ResolversTypes['Person']>, ParentType, ContextType, RequireFields<QueryPeopleArgs, never>>;
};

export type RationalResolvers<ContextType = Context, ParentType extends ResolversParentTypes['Rational'] = ResolversParentTypes['Rational']> = {
  n?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  d?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  s?: Resolver<ResolversTypes['RationalSign'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType>;
};

export type SubscriptionResolvers<ContextType = Context, ParentType extends ResolversParentTypes['Subscription'] = ResolversParentTypes['Subscription']> = {
  journalEntryAdded?: SubscriptionResolver<ResolversTypes['JournalEntry'], "journalEntryAdded", ParentType, ContextType>;
  journalEntryUpdated?: SubscriptionResolver<ResolversTypes['JournalEntry'], "journalEntryUpdated", ParentType, ContextType>;
  journalEntryUpserted?: SubscriptionResolver<ResolversTypes['JournalEntry'], "journalEntryUpserted", ParentType, ContextType>;
};

export interface UploadScalarConfig extends GraphQLScalarTypeConfig<ResolversTypes['Upload'], any> {
  name: 'Upload';
}

export type UserResolvers<ContextType = Context, ParentType extends ResolversParentTypes['User'] = ResolversParentTypes['User']> = {
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  user?: Resolver<ResolversTypes['Person'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType>;
};

export type VendorResolvers<ContextType = Context, ParentType extends ResolversParentTypes['Vendor'] = ResolversParentTypes['Vendor']> = {
  approved?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  vendorId?: Resolver<Maybe<ResolversTypes['ID']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType>;
};

export type Resolvers<ContextType = Context> = {
  Budget?: BudgetResolvers<ContextType>;
  BudgetOwner?: BudgetOwnerResolvers;
  Business?: BusinessResolvers<ContextType>;
  Department?: DepartmentResolvers<ContextType>;
  DepartmentAncestor?: DepartmentAncestorResolvers;
  JournalEntry?: JournalEntryResolvers<ContextType>;
  JournalEntryCategory?: JournalEntryCategoryResolvers<ContextType>;
  JournalEntryItem?: JournalEntryItemResolvers<ContextType>;
  JournalEntryItemUpsertResult?: JournalEntryItemUpsertResultResolvers<ContextType>;
  JournalEntryRefund?: JournalEntryRefundResolvers<ContextType>;
  JournalEntrySource?: JournalEntrySourceResolvers;
  LC_JournalEntryUpsert?: Lc_JournalEntryUpsertResolvers<ContextType>;
  LC_JournalEntryUpsertFields?: Lc_JournalEntryUpsertFieldsResolvers<ContextType>;
  LC_JournalEntryUpsertInputErrors?: Lc_JournalEntryUpsertInputErrorsResolvers<ContextType>;
  LC_JournalEntryUpsertInputValues?: Lc_JournalEntryUpsertInputValuesResolvers<ContextType>;
  LC_JournalEntryUpsertSource?: Lc_JournalEntryUpsertSourceResolvers<ContextType>;
  Mutation?: MutationResolvers<ContextType>;
  PaymentMethod?: PaymentMethodResolvers<ContextType>;
  PaymentMethodAuthorization?: PaymentMethodAuthorizationResolvers<ContextType>;
  PaymentMethodAuthorizedEntity?: PaymentMethodAuthorizedEntityResolvers;
  Person?: PersonResolvers<ContextType>;
  PersonName?: PersonNameResolvers<ContextType>;
  Query?: QueryResolvers<ContextType>;
  Rational?: RationalResolvers<ContextType>;
  Subscription?: SubscriptionResolvers<ContextType>;
  Upload?: GraphQLScalarType;
  User?: UserResolvers<ContextType>;
  Vendor?: VendorResolvers<ContextType>;
};


/**
 * @deprecated
 * Use "Resolvers" root object instead. If you wish to get "IResolvers", add "typesPrefix: I" to your config.
 */
export type IResolvers<ContextType = Context> = Resolvers<ContextType>;
