import { GraphQLResolveInfo, GraphQLScalarType, GraphQLScalarTypeConfig } from 'graphql';
import { Context } from './types';
export type Maybe<T> = T | null;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>;
export type RequireFields<T, K extends keyof T> = { [X in Exclude<keyof T, K>]?: T[X] } & { [P in K]-?: NonNullable<T[P]> };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: string;
  String: string;
  Boolean: boolean;
  Int: number;
  Float: number;
  /** ISO 8601 Date String */
  Date: string;
  /** Rational Number JSON String: "{"s":-1|1,"n":Int,"d":Int}" */
  Rational: string;
  /** The `Upload` scalar type represents a file upload. */
  Upload: any;
};


export type BudgetOwner = Department | Business;

export type Budget = {
  __typename?: 'Budget';
  id: Scalars['ID'];
  amount: Scalars['Rational'];
  owner: BudgetOwner;
  fiscalYear: FiscalYear;
};

export enum BudgetOwnerType {
  Business = 'BUSINESS',
  Department = 'DEPARTMENT'
}

export type BudgetOwnerInput = {
  id: Scalars['ID'];
  type: BudgetOwnerType;
};

export type BudgetsWhereOwner = {
  eq?: Maybe<BudgetOwnerInput>;
  ne?: Maybe<BudgetOwnerInput>;
  in?: Maybe<Array<BudgetOwnerInput>>;
  nin?: Maybe<Array<BudgetOwnerInput>>;
};

export type BudgetsWhereInput = {
  eq?: Maybe<Scalars['ID']>;
  ne?: Maybe<Scalars['ID']>;
  in?: Maybe<Array<Scalars['ID']>>;
  nin?: Maybe<Array<Scalars['ID']>>;
  and?: Maybe<Array<BudgetsWhereInput>>;
  or?: Maybe<Array<BudgetsWhereInput>>;
  nor?: Maybe<Array<BudgetsWhereInput>>;
  amount?: Maybe<WhereRational>;
  owner?: Maybe<BudgetsWhereOwner>;
  /**
   * Matches Budgets assigned to the Department or first ancestor of the
   * Department.
   */
  department?: Maybe<Scalars['ID']>;
  fiscalYear?: Maybe<FiscalYearWhereInput>;
};

export type Query = {
  __typename?: 'Query';
  budgets: Array<Budget>;
  budget: Budget;
  businesses: Array<Business>;
  business: Business;
  categories: Array<Category>;
  category: Category;
  departments: Array<Department>;
  department: Department;
  entries: Array<Entry>;
  entry?: Maybe<Entry>;
  entryRefund?: Maybe<EntryRefund>;
  entryItem?: Maybe<EntryItem>;
  fiscalYears: Array<FiscalYear>;
  fiscalYear: FiscalYear;
  paymentMethods: Array<PaymentMethod>;
  paymentMethod?: Maybe<PaymentMethod>;
  people: Array<Person>;
  person: Person;
  sources: Array<Source>;
};


export type QueryBudgetsArgs = {
  where?: Maybe<BudgetsWhereInput>;
};


export type QueryBudgetArgs = {
  id: Scalars['ID'];
};


export type QueryBusinessesArgs = {
  where?: Maybe<BusinessesWhereInput>;
};


export type QueryBusinessArgs = {
  id: Scalars['ID'];
};


export type QueryCategoriesArgs = {
  where?: Maybe<CategoryWhereInput>;
};


export type QueryCategoryArgs = {
  id: Scalars['ID'];
};


export type QueryDepartmentsArgs = {
  where?: Maybe<DepartmentsWhereInput>;
};


export type QueryDepartmentArgs = {
  id: Scalars['ID'];
};


export type QueryEntriesArgs = {
  where?: Maybe<EntriesWhere>;
};


export type QueryEntryArgs = {
  id: Scalars['ID'];
};


export type QueryEntryRefundArgs = {
  id: Scalars['ID'];
};


export type QueryEntryItemArgs = {
  id: Scalars['ID'];
};


export type QueryFiscalYearsArgs = {
  where?: Maybe<FiscalYearWhereInput>;
};


export type QueryFiscalYearArgs = {
  id: Scalars['ID'];
};


export type QueryPaymentMethodsArgs = {
  where?: Maybe<PaymentMethodWhereInput>;
};


export type QueryPaymentMethodArgs = {
  id: Scalars['ID'];
};


export type QueryPeopleArgs = {
  where?: Maybe<PeopleWhereInput>;
};


export type QueryPersonArgs = {
  id: Scalars['ID'];
};


export type QuerySourcesArgs = {
  searchByName: Scalars['String'];
};

export type Vendor = {
  __typename?: 'Vendor';
  approved: Scalars['Boolean'];
  vendorId?: Maybe<Scalars['ID']>;
};

export type Business = {
  __typename?: 'Business';
  id: Scalars['ID'];
  name: Scalars['String'];
  budgets: Array<Budget>;
  departments: Array<Department>;
  vendor?: Maybe<Vendor>;
};

export type BusinessAddFields = {
  name: Scalars['String'];
};

export type BusinessesWhereInput = {
  eq?: Maybe<Scalars['ID']>;
  ne?: Maybe<Scalars['ID']>;
  in?: Maybe<Array<Scalars['ID']>>;
  nin?: Maybe<Array<Scalars['ID']>>;
  name?: Maybe<WhereRegexInput>;
  and?: Maybe<Array<BusinessesWhereInput>>;
  or?: Maybe<Array<BusinessesWhereInput>>;
  nor?: Maybe<Array<BusinessesWhereInput>>;
};

export type Mutation = {
  __typename?: 'Mutation';
  addBusiness: Business;
  entryUpdate: Entry;
  entryAdd: Entry;
  entryDelete: Entry;
  entryAddRefund: Entry;
  entryUpdateRefund: Entry;
  entryDeleteRefund: Entry;
  entryAddItem: EntryItemUpsertResult;
  entryUpdateItem: EntryItemUpsertResult;
  entryDeleteItem: EntryItemUpsertResult;
  paymentMethodUpdate: PaymentMethod;
  paymentMethodAdd: PaymentMethod;
  addPerson: Person;
};


export type MutationAddBusinessArgs = {
  fields: BusinessAddFields;
};


export type MutationEntryUpdateArgs = {
  id: Scalars['ID'];
  fields: EntryUpdateFields;
  paymentMethodAdd?: Maybe<PaymentMethodAddFields>;
  paymentMethodUpdate?: Maybe<EntryUpdatePaymentMethod>;
  personAdd?: Maybe<PersonAddFields>;
  businessAdd?: Maybe<BusinessAddFields>;
};


export type MutationEntryAddArgs = {
  fields: EntryAddFields;
  paymentMethodAdd?: Maybe<PaymentMethodAddFields>;
  personAdd?: Maybe<PersonAddFields>;
  businessAdd?: Maybe<BusinessAddFields>;
};


export type MutationEntryDeleteArgs = {
  id: Scalars['ID'];
};


export type MutationEntryAddRefundArgs = {
  id: Scalars['ID'];
  fields: EntryAddRefundFields;
  paymentMethodAdd?: Maybe<PaymentMethodAddFields>;
};


export type MutationEntryUpdateRefundArgs = {
  id: Scalars['ID'];
  fields: EntryUpdateRefundFields;
  paymentMethodAdd?: Maybe<PaymentMethodAddFields>;
  paymentMethodUpdate?: Maybe<EntryUpdatePaymentMethod>;
};


export type MutationEntryDeleteRefundArgs = {
  id: Scalars['ID'];
};


export type MutationEntryAddItemArgs = {
  id: Scalars['ID'];
  fields: EntryAddItemFields;
};


export type MutationEntryUpdateItemArgs = {
  id: Scalars['ID'];
  fields: EntryUpdateItemFields;
};


export type MutationEntryDeleteItemArgs = {
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

export type CategoryWhereParentInput = {
  eq?: Maybe<Scalars['ID']>;
  ne?: Maybe<Scalars['ID']>;
  in?: Maybe<Array<Maybe<Scalars['ID']>>>;
  nin?: Maybe<Array<Maybe<Scalars['ID']>>>;
};

export type CategoryWhereNameInput = {
  eq?: Maybe<Scalars['String']>;
  ne?: Maybe<Scalars['String']>;
  in?: Maybe<Array<Maybe<Scalars['String']>>>;
  nin?: Maybe<Array<Maybe<Scalars['String']>>>;
};

export type CategoryWhereTypeInput = {
  eq?: Maybe<EntryType>;
  ne?: Maybe<EntryType>;
};

export type CategoryWhereInput = {
  name?: Maybe<CategoryWhereNameInput>;
  type?: Maybe<CategoryWhereTypeInput>;
  hasParent?: Maybe<Scalars['Boolean']>;
  parent?: Maybe<CategoryWhereParentInput>;
  or?: Maybe<Array<Maybe<CategoryWhereInput>>>;
  and?: Maybe<Array<Maybe<CategoryWhereInput>>>;
};

export type Category = {
  __typename?: 'Category';
  id: Scalars['ID'];
  name: Scalars['String'];
  type: EntryType;
  parent?: Maybe<Category>;
  ancestors: Array<Category>;
  children: Array<Category>;
};

export type DepartmentAncestor = Department | Business;

export type Department = {
  __typename?: 'Department';
  id: Scalars['ID'];
  name: Scalars['String'];
  code?: Maybe<Scalars['String']>;
  /**
   * Budgets are the FIRST Budget per FiscalYear assigned to
   * the Department or an ancestor of the Department.
   */
  budgets: Array<Budget>;
  business: Business;
  parent: DepartmentAncestor;
  ancestors: Array<DepartmentAncestor>;
  descendants: Array<Department>;
  children: Array<Department>;
  virtualRoot?: Maybe<Scalars['Boolean']>;
};

export enum DepartmentAncestorType {
  Business = 'BUSINESS',
  Department = 'DEPARTMENT'
}

export type DepartmentAncestorInput = {
  id: Scalars['ID'];
  type: DepartmentAncestorType;
};

export type DepartmentsWhereAncestor = {
  eq?: Maybe<DepartmentAncestorInput>;
  ne?: Maybe<DepartmentAncestorInput>;
  in?: Maybe<Array<DepartmentAncestorInput>>;
  nin?: Maybe<Array<DepartmentAncestorInput>>;
};

export type DepartmentsWhereInput = {
  eq?: Maybe<Scalars['ID']>;
  ne?: Maybe<Scalars['ID']>;
  in?: Maybe<Array<Scalars['ID']>>;
  nin?: Maybe<Array<Scalars['ID']>>;
  name?: Maybe<WhereRegexInput>;
  parent?: Maybe<DepartmentsWhereAncestor>;
  and?: Maybe<Array<DepartmentsWhereInput>>;
  or?: Maybe<Array<DepartmentsWhereInput>>;
  nor?: Maybe<Array<DepartmentsWhereInput>>;
};

export type DepartmentAddFields = {
  name: Scalars['String'];
};

export enum EntryType {
  Credit = 'CREDIT',
  Debit = 'DEBIT'
}

export type EntryDateOfRecord = {
  __typename?: 'EntryDateOfRecord';
  /** ISO 8601 */
  date: Scalars['Date'];
  overrideFiscalYear: Scalars['Boolean'];
};

export type EntryDateOfRecordAdd = {
  /** ISO 8601 */
  date: Scalars['Date'];
  overrideFiscalYear: Scalars['Boolean'];
};

export type EntryDateOfRecordUpdate = {
  /** ISO 8601 */
  date?: Maybe<Scalars['Date']>;
  overrideFiscalYear?: Maybe<Scalars['Boolean']>;
  /**
   * When "clear" field is true, the "date" and "overrideFiscalYear" are ignored.
   * When "clear" field is false or null, it is ignored i.e. does nothing.
   */
  clear?: Maybe<Scalars['Boolean']>;
};

export type Entry = {
  __typename?: 'Entry';
  id: Scalars['ID'];
  refunds: Array<EntryRefund>;
  items: Array<EntryItem>;
  type: EntryType;
  /** ISO 8601 */
  date: Scalars['Date'];
  dateOfRecord?: Maybe<EntryDateOfRecord>;
  department: Department;
  budget: Budget;
  fiscalYear: FiscalYear;
  category: Category;
  paymentMethod: PaymentMethod;
  description?: Maybe<Scalars['String']>;
  total: Scalars['Rational'];
  source: Source;
  reconciled: Scalars['Boolean'];
  lastUpdate: Scalars['Date'];
  deleted: Scalars['Boolean'];
};

export enum SourceType {
  Business = 'BUSINESS',
  Department = 'DEPARTMENT',
  Person = 'PERSON'
}

export type SourceInput = {
  sourceType: SourceType;
  id: Scalars['ID'];
};

export type EntryUpdateFields = {
  /** ISO 8601 */
  date?: Maybe<Scalars['Date']>;
  dateOfRecord?: Maybe<EntryDateOfRecordUpdate>;
  department?: Maybe<Scalars['ID']>;
  type?: Maybe<EntryType>;
  category?: Maybe<Scalars['ID']>;
  paymentMethod?: Maybe<Scalars['ID']>;
  description?: Maybe<Scalars['String']>;
  total?: Maybe<Scalars['Rational']>;
  source?: Maybe<SourceInput>;
  reconciled?: Maybe<Scalars['Boolean']>;
};

export type EntryAddFields = {
  /** ISO 8601 */
  date: Scalars['Date'];
  dateOfRecord?: Maybe<EntryDateOfRecordAdd>;
  department: Scalars['ID'];
  type: EntryType;
  category: Scalars['ID'];
  paymentMethod: Scalars['ID'];
  description?: Maybe<Scalars['String']>;
  total: Scalars['Rational'];
  source: SourceInput;
  reconciled?: Maybe<Scalars['Boolean']>;
};

export type EntryRefund = {
  __typename?: 'EntryRefund';
  id: Scalars['ID'];
  /** ISO 8601 */
  date: Scalars['Date'];
  description?: Maybe<Scalars['String']>;
  paymentMethod: PaymentMethod;
  total: Scalars['Rational'];
  reconciled: Scalars['Boolean'];
  lastUpdate: Scalars['Date'];
  deleted: Scalars['Boolean'];
};

export type EntryAddRefundFields = {
  /** ISO 8601 */
  date: Scalars['Date'];
  description?: Maybe<Scalars['String']>;
  paymentMethod: Scalars['ID'];
  total: Scalars['Rational'];
  reconciled?: Maybe<Scalars['Boolean']>;
};

export type EntryUpdateRefundFields = {
  /** ISO 8601 */
  date?: Maybe<Scalars['Date']>;
  description?: Maybe<Scalars['String']>;
  paymentMethod?: Maybe<Scalars['ID']>;
  total?: Maybe<Scalars['Rational']>;
  reconciled?: Maybe<Scalars['Boolean']>;
};

export type EntryItem = {
  __typename?: 'EntryItem';
  id: Scalars['ID'];
  department?: Maybe<Department>;
  category?: Maybe<Category>;
  description?: Maybe<Scalars['String']>;
  units: Scalars['Int'];
  total: Scalars['Rational'];
  lastUpdate: Scalars['Date'];
  deleted: Scalars['Boolean'];
};

export type EntryAddItemFields = {
  department?: Maybe<Scalars['ID']>;
  category?: Maybe<Scalars['ID']>;
  description?: Maybe<Scalars['String']>;
  units: Scalars['Int'];
  total: Scalars['Rational'];
};

export type EntryUpdateItemFields = {
  department?: Maybe<Scalars['ID']>;
  category?: Maybe<Scalars['ID']>;
  description?: Maybe<Scalars['String']>;
  units?: Maybe<Scalars['Int']>;
  total?: Maybe<Scalars['Rational']>;
};

export type EntryItemUpsertResult = {
  __typename?: 'EntryItemUpsertResult';
  entryItem: EntryItem;
  entry: Entry;
};

export type EntriesWhereDepartment = {
  eq?: Maybe<WhereTreeNodeInput>;
  ne?: Maybe<WhereTreeNodeInput>;
  in?: Maybe<Array<WhereTreeNodeInput>>;
  nin?: Maybe<Array<WhereTreeNodeInput>>;
};

export type EntriesWhereCategory = {
  eq?: Maybe<WhereTreeNodeInput>;
  ne?: Maybe<WhereTreeNodeInput>;
  in?: Maybe<Array<WhereTreeNodeInput>>;
  nin?: Maybe<Array<WhereTreeNodeInput>>;
};

export type EntriesSourceInput = {
  id: Scalars['ID'];
  type: SourceType;
};

export type EntriesWhereSource = {
  eq?: Maybe<EntriesSourceInput>;
  ne?: Maybe<EntriesSourceInput>;
  in?: Maybe<Array<EntriesSourceInput>>;
  nin?: Maybe<Array<EntriesSourceInput>>;
};

export type EntriesWherePaymentMethod = {
  eq?: Maybe<WhereTreeNodeInput>;
  ne?: Maybe<WhereTreeNodeInput>;
  in?: Maybe<Array<WhereTreeNodeInput>>;
  nin?: Maybe<Array<WhereTreeNodeInput>>;
};

export type EntriesWhereFiscalYear = {
  eq?: Maybe<Scalars['ID']>;
  ne?: Maybe<Scalars['ID']>;
  in?: Maybe<Array<Scalars['ID']>>;
  nin?: Maybe<Array<Scalars['ID']>>;
};

export type EntriesWhere = {
  eq?: Maybe<Scalars['ID']>;
  ne?: Maybe<Scalars['ID']>;
  in?: Maybe<Array<Scalars['ID']>>;
  nin?: Maybe<Array<Scalars['ID']>>;
  date?: Maybe<WhereDate>;
  dateOfRecord?: Maybe<WhereDate>;
  fiscalYear?: Maybe<EntriesWhereFiscalYear>;
  department?: Maybe<EntriesWhereDepartment>;
  category?: Maybe<EntriesWhereCategory>;
  source?: Maybe<EntriesWhereSource>;
  paymentMethod?: Maybe<EntriesWherePaymentMethod>;
  total?: Maybe<WhereRational>;
  reconciled?: Maybe<Scalars['Boolean']>;
  deleted?: Maybe<Scalars['Boolean']>;
  lastUpdate?: Maybe<WhereDate>;
  lastUpdateRefund?: Maybe<WhereDate>;
  lastUpdateItem?: Maybe<WhereDate>;
  or?: Maybe<Array<EntriesWhere>>;
  and?: Maybe<Array<EntriesWhere>>;
};

export type EntryUpdatePaymentMethod = {
  id: Scalars['ID'];
  fields: PaymentMethodUpdateFields;
};

export type Subscription = {
  __typename?: 'Subscription';
  entryAdded: Entry;
  entryUpdated: Entry;
  entryUpserted: Entry;
};

export type FiscalYear = {
  __typename?: 'FiscalYear';
  id: Scalars['ID'];
  name: Scalars['String'];
  begin: Scalars['Date'];
  end: Scalars['Date'];
};

export type FiscalYearWhereHasDate = {
  eq?: Maybe<Scalars['Date']>;
  ne?: Maybe<Scalars['Date']>;
  in?: Maybe<Array<Scalars['Date']>>;
  nin?: Maybe<Array<Scalars['Date']>>;
};

export type FiscalYearWhereInput = {
  eq?: Maybe<Scalars['ID']>;
  ne?: Maybe<Scalars['ID']>;
  in?: Maybe<Array<Scalars['ID']>>;
  nin?: Maybe<Array<Scalars['ID']>>;
  name?: Maybe<WhereRegexInput>;
  /** A FiscalYear is the set of all dates in the interval [begin, end). */
  hasDate?: Maybe<FiscalYearWhereHasDate>;
  and?: Maybe<Array<FiscalYearWhereInput>>;
  or?: Maybe<Array<FiscalYearWhereInput>>;
  nor?: Maybe<Array<FiscalYearWhereInput>>;
};

export type PaymentMethodAuthorizedEntity = Person | Business | Department;

export type PaymentMethodAuthorization = {
  __typename?: 'PaymentMethodAuthorization';
  owner: Scalars['Boolean'];
  entity?: Maybe<PaymentMethodAuthorizedEntity>;
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

export type PaymentMethodWhereNameInput = {
  eq?: Maybe<Scalars['String']>;
  ne?: Maybe<Scalars['String']>;
  in?: Maybe<Array<Maybe<Scalars['String']>>>;
  nin?: Maybe<Array<Maybe<Scalars['String']>>>;
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

export type PaymentMethodAddFields = {
  active: Scalars['Boolean'];
  refId?: Maybe<Scalars['String']>;
  name: Scalars['String'];
  parent: Scalars['ID'];
};

export type PaymentMethodUpdateFields = {
  active?: Maybe<Scalars['Boolean']>;
  refId?: Maybe<Scalars['String']>;
  name?: Maybe<Scalars['String']>;
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

export type PersonAddFields = {
  name: PersonNameInput;
};

export type Person = {
  __typename?: 'Person';
  id: Scalars['ID'];
  name: PersonName;
};

export type PeopleWhereInput = {
  lastName?: Maybe<WhereRegexInput>;
  firstName?: Maybe<WhereRegexInput>;
  eq?: Maybe<Scalars['ID']>;
  ne?: Maybe<Scalars['ID']>;
  in?: Maybe<Array<Scalars['ID']>>;
  nin?: Maybe<Array<Scalars['ID']>>;
  and?: Maybe<Array<PeopleWhereInput>>;
  or?: Maybe<Array<PeopleWhereInput>>;
  nor?: Maybe<Array<PeopleWhereInput>>;
};

export type WhereRational = {
  eq?: Maybe<Scalars['Rational']>;
  ne?: Maybe<Scalars['Rational']>;
  in?: Maybe<Array<Scalars['Rational']>>;
  nin?: Maybe<Array<Scalars['Rational']>>;
  gt?: Maybe<Scalars['Rational']>;
  lt?: Maybe<Scalars['Rational']>;
  gte?: Maybe<Scalars['Rational']>;
  lte?: Maybe<Scalars['Rational']>;
};



export enum SortDirection {
  Asc = 'ASC',
  Desc = 'DESC'
}

export enum FilterType {
  Include = 'INCLUDE',
  Exclude = 'EXCLUDE'
}

export type PaginateInput = {
  skip: Scalars['Int'];
  limit: Scalars['Int'];
};

export type ByIdFilter = {
  eq?: Maybe<Scalars['ID']>;
};

export enum RegexOptions {
  CaseInsensitive = 'CaseInsensitive',
  Multiline = 'Multiline',
  Extended = 'Extended',
  DotAll = 'DotAll',
  I = 'I',
  M = 'M',
  X = 'X',
  S = 'S'
}

export type WhereTreeNodeInput = {
  id: Scalars['ID'];
  matchDescendants?: Maybe<Scalars['Boolean']>;
};

export type WhereRegexInput = {
  pattern: Scalars['String'];
  options?: Maybe<Array<RegexOptions>>;
};

export type WhereDateTime = {
  /** ISO 8601 */
  date: Scalars['Date'];
  ignoreTime?: Maybe<Scalars['Boolean']>;
};

export type WhereDate = {
  eq?: Maybe<WhereDateTime>;
  ne?: Maybe<WhereDateTime>;
  gt?: Maybe<WhereDateTime>;
  gte?: Maybe<WhereDateTime>;
  lt?: Maybe<WhereDateTime>;
  lte?: Maybe<WhereDateTime>;
};

export type Source = Person | Business | Department;

export type User = {
  __typename?: 'User';
  id: Scalars['ID'];
  user: Person;
};

export enum CacheControlScope {
  Public = 'PUBLIC',
  Private = 'PRIVATE'
}


export type DepartmentName_1QueryVariables = Exact<{
  id: Scalars['ID'];
}>;


export type DepartmentName_1Query = { __typename?: 'Query', department: { __typename: 'Department', id: string, name: string } };

export type DeptForUpsertAddQueryVariables = Exact<{
  id: Scalars['ID'];
}>;


export type DeptForUpsertAddQuery = { __typename?: 'Query', department: (
    { __typename?: 'Department' }
    & DeptEntryOptFragment
  ) };

export type OnEntryUpsert_2SubscriptionVariables = Exact<{ [key: string]: never; }>;


export type OnEntryUpsert_2Subscription = { __typename?: 'Subscription', entryUpserted: (
    { __typename?: 'Entry', department: { __typename?: 'Department', ancestors: Array<{ __typename: 'Department', id: string } | { __typename?: 'Business' }> } }
    & GetReportDataEntry_1Fragment
  ) };

export type GetReportDataDept_1Fragment = { __typename: 'Department', id: string, name: string, budgets: Array<{ __typename: 'Budget', id: string, amount: string, fiscalYear: { __typename: 'FiscalYear', id: string } }> };

export type GetReportDataEntry_1Fragment = { __typename: 'Entry', id: string, type: EntryType, total: string, lastUpdate: string, deleted: boolean, category: { __typename: 'Category', id: string, name: string }, fiscalYear: { __typename: 'FiscalYear', id: string }, department: { __typename: 'Department', id: string, ancestors: Array<{ __typename: 'Department', id: string } | { __typename: 'Business', id: string }> }, refunds: Array<{ __typename: 'EntryRefund', id: string, total: string, deleted: boolean, lastUpdate: string }>, items: Array<{ __typename: 'EntryItem', id: string, total: string, deleted: boolean, department?: Maybe<{ __typename: 'Department', id: string }> }> };

export type GetReportDataQueryVariables = Exact<{
  deptId: Scalars['ID'];
  where: EntriesWhere;
}>;


export type GetReportDataQuery = { __typename?: 'Query', department: (
    { __typename?: 'Department', descendants: Array<(
      { __typename?: 'Department' }
      & GetReportDataDept_1Fragment
    )> }
    & GetReportDataDept_1Fragment
  ), entries: Array<(
    { __typename?: 'Entry' }
    & GetReportDataEntry_1Fragment
  )>, fiscalYears: Array<{ __typename: 'FiscalYear', id: string, name: string, begin: string, end: string }> };

export type EntryAdded_2SubscriptionVariables = Exact<{ [key: string]: never; }>;


export type EntryAdded_2Subscription = { __typename?: 'Subscription', entryAdded: (
    { __typename?: 'Entry' }
    & GetReportDataEntry_1Fragment
  ) };

export type EntryUpdated_2SubscriptionVariables = Exact<{ [key: string]: never; }>;


export type EntryUpdated_2Subscription = { __typename?: 'Subscription', entryUpdated: (
    { __typename?: 'Entry' }
    & GetReportDataEntry_1Fragment
  ) };

export type CategoryInputOptFragment = { __typename: 'Category', id: string, name: string, children: Array<{ __typename: 'Category', id: string }> };

export type CategoryInputOptsQueryVariables = Exact<{
  where: CategoryWhereInput;
}>;


export type CategoryInputOptsQuery = { __typename?: 'Query', categories: Array<(
    { __typename?: 'Category' }
    & CategoryInputOptFragment
  )> };

export type DeptInputOptFragment = { __typename: 'Department', id: string, name: string, children: Array<{ __typename: 'Department', id: string }> };

export type DeptInputOptsQueryVariables = Exact<{
  where: DepartmentsWhereInput;
}>;


export type DeptInputOptsQuery = { __typename?: 'Query', departments: Array<(
    { __typename?: 'Department' }
    & DeptInputOptFragment
  )> };

export type PayMethodInputOptFragment = { __typename: 'PaymentMethod', id: string, name: string, children: Array<{ __typename: 'PaymentMethod', id: string }> };

export type PayMethodInputOptsQueryVariables = Exact<{
  where: PaymentMethodWhereInput;
}>;


export type PayMethodInputOptsQuery = { __typename?: 'Query', paymentMethods: Array<(
    { __typename?: 'PaymentMethod' }
    & PayMethodInputOptFragment
  )> };

export type GridEntrySrcPersonFragment = { __typename: 'Person', id: string, personName: { __typename?: 'PersonName', first: string, last: string } };

export type GridEntrySrcBusinessFragment = { __typename: 'Business', id: string, name: string };

export type GridEntrySrcDeptFragment = { __typename: 'Department', id: string, name: string };

export type GridPaymentMethodFragment = { __typename: 'PaymentMethod', id: string, name: string, parent?: Maybe<{ __typename: 'PaymentMethod', id: string }> };

export type GridRefundFragment = { __typename: 'EntryRefund', id: string, date: string, description?: Maybe<string>, total: string, reconciled: boolean, deleted: boolean, paymentMethod: (
    { __typename?: 'PaymentMethod' }
    & GridPaymentMethodFragment
  ) };

export type GridEntryFragment = { __typename: 'Entry', id: string, date: string, type: EntryType, description?: Maybe<string>, total: string, reconciled: boolean, deleted: boolean, dateOfRecord?: Maybe<{ __typename?: 'EntryDateOfRecord', date: string }>, department: { __typename: 'Department', id: string, name: string }, category: { __typename: 'Category', id: string, name: string }, paymentMethod: (
    { __typename?: 'PaymentMethod' }
    & GridPaymentMethodFragment
  ), source: (
    { __typename?: 'Person' }
    & GridEntrySrcPersonFragment
  ) | (
    { __typename?: 'Business' }
    & GridEntrySrcBusinessFragment
  ) | (
    { __typename?: 'Department' }
    & GridEntrySrcDeptFragment
  ), refunds: Array<(
    { __typename?: 'EntryRefund' }
    & GridRefundFragment
  )> };

export type GridEntriesQueryVariables = Exact<{
  where?: Maybe<EntriesWhere>;
}>;


export type GridEntriesQuery = { __typename?: 'Query', entries: Array<(
    { __typename?: 'Entry' }
    & GridEntryFragment
  )> };

export type EntryPayMethod_1Fragment = { __typename: 'PaymentMethod', id: string, name: string, parent?: Maybe<{ __typename: 'PaymentMethod', id: string }> };

export type Category_1Fragment = { __typename: 'Category', id: string, type: EntryType, name: string };

export type EntryDept_1Fragment = { __typename: 'Department', id: string, name: string, ancestors: Array<{ __typename: 'Department', id: string, deptName: string } | { __typename: 'Business', id: string, bizName: string }> };

export type EntryRefund_1Fragment = { __typename: 'EntryRefund', id: string, date: string, description?: Maybe<string>, total: string, reconciled: boolean, lastUpdate: string, deleted: boolean, paymentMethod: (
    { __typename?: 'PaymentMethod' }
    & EntryPayMethod_1Fragment
  ) };

export type EntryItem_1Fragment = { __typename: 'EntryItem', id: string, total: string, units: number, description?: Maybe<string>, lastUpdate: string, deleted: boolean, category?: Maybe<(
    { __typename?: 'Category' }
    & Category_1Fragment
  )>, department?: Maybe<(
    { __typename?: 'Department' }
    & EntryDept_1Fragment
  )> };

export type Entry_1Fragment = { __typename: 'Entry', id: string, date: string, type: EntryType, description?: Maybe<string>, total: string, deleted: boolean, lastUpdate: string, reconciled: boolean, dateOfRecord?: Maybe<{ __typename?: 'EntryDateOfRecord', date: string, overrideFiscalYear: boolean }>, department: (
    { __typename: 'Department', id: string, name: string, ancestors: Array<{ __typename: 'Department', id: string, deptName: string } | { __typename: 'Business', id: string, bizName: string }> }
    & EntryDept_1Fragment
  ), category: (
    { __typename?: 'Category' }
    & Category_1Fragment
  ), paymentMethod: (
    { __typename?: 'PaymentMethod' }
    & EntryPayMethod_1Fragment
  ), source: { __typename: 'Person', id: string, name: { __typename?: 'PersonName', first: string, last: string } } | { __typename: 'Business', id: string, bizName: string } | { __typename: 'Department', id: string, deptName: string }, refunds: Array<(
    { __typename?: 'EntryRefund' }
    & EntryRefund_1Fragment
  )>, items: Array<(
    { __typename?: 'EntryItem' }
    & EntryItem_1Fragment
  )> };

export type Entries_1QueryVariables = Exact<{
  where: EntriesWhere;
}>;


export type Entries_1Query = { __typename?: 'Query', entries: Array<(
    { __typename?: 'Entry' }
    & Entry_1Fragment
  )>, fiscalYears: Array<{ __typename: 'FiscalYear', id: string, name: string, begin: string, end: string }> };

export type EntryAdded_1SubscriptionVariables = Exact<{ [key: string]: never; }>;


export type EntryAdded_1Subscription = { __typename?: 'Subscription', entryAdded: (
    { __typename?: 'Entry' }
    & Entry_1Fragment
  ) };

export type EntryUpdated_1SubscriptionVariables = Exact<{ [key: string]: never; }>;


export type EntryUpdated_1Subscription = { __typename?: 'Subscription', entryUpdated: (
    { __typename?: 'Entry' }
    & Entry_1Fragment
  ) };

export type OnEntryUpsert_1SubscriptionVariables = Exact<{ [key: string]: never; }>;


export type OnEntryUpsert_1Subscription = { __typename?: 'Subscription', entryUpserted: (
    { __typename?: 'Entry', department: { __typename?: 'Department', ancestors: Array<{ __typename: 'Department', id: string } | { __typename?: 'Business' }> } }
    & Entry_1Fragment
  ) };

export type ReconcileEntryMutationVariables = Exact<{
  id: Scalars['ID'];
}>;


export type ReconcileEntryMutation = { __typename?: 'Mutation', entryUpdate: (
    { __typename?: 'Entry' }
    & Entry_1Fragment
  ) };

export type ReconcileRefundMutationVariables = Exact<{
  id: Scalars['ID'];
}>;


export type ReconcileRefundMutation = { __typename?: 'Mutation', entryUpdateRefund: (
    { __typename?: 'Entry' }
    & Entry_1Fragment
  ) };

export type DeptIniValueForAddEntryQueryVariables = Exact<{
  id: Scalars['ID'];
}>;


export type DeptIniValueForAddEntryQuery = { __typename?: 'Query', department: (
    { __typename?: 'Department' }
    & DeptEntryOptFragment
  ) };

export type DeleteEntryMutationVariables = Exact<{
  id: Scalars['ID'];
}>;


export type DeleteEntryMutation = { __typename?: 'Mutation', entryDelete: (
    { __typename?: 'Entry' }
    & Entry_1Fragment
  ) };

export type UpdateEntryIniStateQueryVariables = Exact<{
  id: Scalars['ID'];
}>;


export type UpdateEntryIniStateQuery = { __typename?: 'Query', entry?: Maybe<{ __typename: 'Entry', id: string, type: EntryType, date: string, description?: Maybe<string>, total: string, reconciled: boolean, dateOfRecord?: Maybe<{ __typename?: 'EntryDateOfRecord', date: string, overrideFiscalYear: boolean }>, department: (
      { __typename?: 'Department' }
      & DeptEntryOptFragment
    ), category: (
      { __typename?: 'Category', ancestors: Array<(
        { __typename?: 'Category' }
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
    ), refunds: Array<{ __typename: 'EntryRefund', id: string, deleted: boolean, date: string, total: string }> }> };

export type AddEntryMutationVariables = Exact<{
  fields: EntryAddFields;
  paymentMethodAdd?: Maybe<PaymentMethodAddFields>;
  personAdd?: Maybe<PersonAddFields>;
  businessAdd?: Maybe<BusinessAddFields>;
}>;


export type AddEntryMutation = { __typename?: 'Mutation', entryAdd: (
    { __typename?: 'Entry' }
    & Entry_1Fragment
  ) };

export type UpdateEntryMutationVariables = Exact<{
  id: Scalars['ID'];
  fields: EntryUpdateFields;
  paymentMethodAdd?: Maybe<PaymentMethodAddFields>;
  paymentMethodUpdate?: Maybe<EntryUpdatePaymentMethod>;
  personAdd?: Maybe<PersonAddFields>;
  businessAdd?: Maybe<BusinessAddFields>;
}>;


export type UpdateEntryMutation = { __typename?: 'Mutation', entryUpdate: (
    { __typename?: 'Entry' }
    & Entry_1Fragment
  ) };

export type CatEntryOptsQueryVariables = Exact<{
  where: CategoryWhereInput;
}>;


export type CatEntryOptsQuery = { __typename?: 'Query', catOpts: Array<(
    { __typename?: 'Category' }
    & CatEntryOptFragment
  )> };

export type DeptEntryOptsQueryVariables = Exact<{
  bizId: Scalars['ID'];
}>;


export type DeptEntryOptsQuery = { __typename?: 'Query', deptOpts: { __typename: 'Business', id: string, departments: Array<(
      { __typename?: 'Department' }
      & DeptEntryOptFragment
    )> } };

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


export type SrcEntryOptsQuery = { __typename?: 'Query', businesses?: Maybe<(
    { __typename?: 'Business' }
    & SrcEntryBizOptFragment
  )>, people?: Maybe<(
    { __typename?: 'Person' }
    & SrcEntryPersonOptFragment
  )> };

export type GetEntryItemState_1QueryVariables = Exact<{
  id: Scalars['ID'];
}>;


export type GetEntryItemState_1Query = { __typename?: 'Query', entry?: Maybe<(
    { __typename?: 'Entry' }
    & Entry_3Fragment
  )> };

export type DeleteItemMutationVariables = Exact<{
  id: Scalars['ID'];
}>;


export type DeleteItemMutation = { __typename?: 'Mutation', entryDeleteItem: { __typename?: 'EntryItemUpsertResult', entryItem: { __typename: 'EntryItem', id: string, deleted: boolean } } };

export type UpdateItemIniStateQueryVariables = Exact<{
  entryId: Scalars['ID'];
  itemId: Scalars['ID'];
}>;


export type UpdateItemIniStateQuery = { __typename?: 'Query', entry?: Maybe<(
    { __typename?: 'Entry' }
    & Entry_3Fragment
  )>, entryItem?: Maybe<{ __typename: 'EntryItem', id: string, description?: Maybe<string>, units: number, total: string, department?: Maybe<(
      { __typename?: 'Department' }
      & DeptEntryOptFragment
    )>, category?: Maybe<(
      { __typename?: 'Category', ancestors: Array<(
        { __typename?: 'Category' }
        & CatEntryOptFragment
      )> }
      & CatEntryOptFragment
    )> }> };

export type Entry_3Fragment = { __typename: 'Entry', id: string, type: EntryType, total: string, date: string, items: Array<{ __typename: 'EntryItem', id: string, deleted: boolean, total: string }> };

export type AddEntryItemMutationVariables = Exact<{
  id: Scalars['ID'];
  fields: EntryAddItemFields;
}>;


export type AddEntryItemMutation = { __typename?: 'Mutation', entryAddItem: { __typename?: 'EntryItemUpsertResult', entry: (
      { __typename?: 'Entry' }
      & Entry_1Fragment
    ) } };

export type UpdateEntryItemMutationVariables = Exact<{
  id: Scalars['ID'];
  fields: EntryUpdateItemFields;
}>;


export type UpdateEntryItemMutation = { __typename?: 'Mutation', entryUpdateItem: { __typename?: 'EntryItemUpsertResult', entryItem: (
      { __typename?: 'EntryItem' }
      & EntryItem_1Fragment
    ) } };

export type GetEntryRefundInfo_1QueryVariables = Exact<{
  id: Scalars['ID'];
}>;


export type GetEntryRefundInfo_1Query = { __typename?: 'Query', entry?: Maybe<(
    { __typename?: 'Entry' }
    & Entry_2Fragment
  )> };

export type DeleteRefundMutationVariables = Exact<{
  id: Scalars['ID'];
}>;


export type DeleteRefundMutation = { __typename?: 'Mutation', entryDeleteRefund: (
    { __typename?: 'Entry' }
    & Entry_1Fragment
  ) };

export type UpdateRefundIniStateQueryVariables = Exact<{
  entryId: Scalars['ID'];
  refundId: Scalars['ID'];
}>;


export type UpdateRefundIniStateQuery = { __typename?: 'Query', entry?: Maybe<(
    { __typename?: 'Entry' }
    & Entry_2Fragment
  )>, entryRefund?: Maybe<{ __typename: 'EntryRefund', id: string, date: string, description?: Maybe<string>, total: string, reconciled: boolean, paymentMethod: (
      { __typename?: 'PaymentMethod', ancestors: Array<(
        { __typename?: 'PaymentMethod' }
        & PayMethodEntryOptFragment
      )> }
      & PayMethodEntryOptFragment
    ) }> };

export type Entry_2Fragment = { __typename: 'Entry', id: string, date: string, type: EntryType, total: string, refunds: Array<{ __typename: 'EntryRefund', id: string, deleted: boolean, total: string }> };

export type AddEntryRefundMutationVariables = Exact<{
  id: Scalars['ID'];
  fields: EntryAddRefundFields;
  paymentMethodAdd?: Maybe<PaymentMethodAddFields>;
}>;


export type AddEntryRefundMutation = { __typename?: 'Mutation', entryAddRefund: { __typename: 'Entry', id: string, refunds: Array<(
      { __typename?: 'EntryRefund' }
      & EntryRefund_1Fragment
    )> } };

export type UpdateRefundMutationVariables = Exact<{
  id: Scalars['ID'];
  fields: EntryUpdateRefundFields;
  paymentMethodAdd?: Maybe<PaymentMethodAddFields>;
  paymentMethodUpdate?: Maybe<EntryUpdatePaymentMethod>;
}>;


export type UpdateRefundMutation = { __typename?: 'Mutation', entryUpdateRefund: { __typename: 'Entry', id: string, refunds: Array<(
      { __typename?: 'EntryRefund' }
      & EntryRefund_1Fragment
    )> } };

export type FiscalYearQueryVariables = Exact<{
  date?: Maybe<Scalars['Date']>;
}>;


export type FiscalYearQuery = { __typename?: 'Query', fiscalYears: Array<{ __typename: 'FiscalYear', id: string }> };

export type DeptEntryOptFragment = { __typename: 'Department', id: string, name: string, budgets: Array<{ __typename: 'Budget', id: string, fiscalYear: { __typename: 'FiscalYear', id: string } }>, parent: { __typename: 'Department', id: string } | { __typename: 'Business', id: string } };

export type CatEntryOptFragment = { __typename: 'Category', id: string, name: string, type: EntryType, parent?: Maybe<{ __typename: 'Category', id: string }> };

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

export type IsTypeOfResolverFn<T = {}, TContext = {}> = (obj: T, context: TContext, info: GraphQLResolveInfo) => boolean | Promise<boolean>;

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
  BudgetOwner: ResolversTypes['Department'] | ResolversTypes['Business'];
  Budget: ResolverTypeWrapper<Omit<Budget, 'owner'> & { owner: ResolversTypes['BudgetOwner'] }>;
  ID: ResolverTypeWrapper<Scalars['ID']>;
  BudgetOwnerType: BudgetOwnerType;
  BudgetOwnerInput: BudgetOwnerInput;
  BudgetsWhereOwner: BudgetsWhereOwner;
  BudgetsWhereInput: BudgetsWhereInput;
  Query: ResolverTypeWrapper<{}>;
  String: ResolverTypeWrapper<Scalars['String']>;
  Vendor: ResolverTypeWrapper<Vendor>;
  Boolean: ResolverTypeWrapper<Scalars['Boolean']>;
  Business: ResolverTypeWrapper<Business>;
  BusinessAddFields: BusinessAddFields;
  BusinessesWhereInput: BusinessesWhereInput;
  Mutation: ResolverTypeWrapper<{}>;
  CategoryWhereParentInput: CategoryWhereParentInput;
  CategoryWhereNameInput: CategoryWhereNameInput;
  CategoryWhereTypeInput: CategoryWhereTypeInput;
  CategoryWhereInput: CategoryWhereInput;
  Category: ResolverTypeWrapper<Category>;
  DepartmentAncestor: ResolversTypes['Department'] | ResolversTypes['Business'];
  Department: ResolverTypeWrapper<Omit<Department, 'parent' | 'ancestors'> & { parent: ResolversTypes['DepartmentAncestor'], ancestors: Array<ResolversTypes['DepartmentAncestor']> }>;
  DepartmentAncestorType: DepartmentAncestorType;
  DepartmentAncestorInput: DepartmentAncestorInput;
  DepartmentsWhereAncestor: DepartmentsWhereAncestor;
  DepartmentsWhereInput: DepartmentsWhereInput;
  DepartmentAddFields: DepartmentAddFields;
  EntryType: EntryType;
  EntryDateOfRecord: ResolverTypeWrapper<EntryDateOfRecord>;
  EntryDateOfRecordAdd: EntryDateOfRecordAdd;
  EntryDateOfRecordUpdate: EntryDateOfRecordUpdate;
  Entry: ResolverTypeWrapper<Omit<Entry, 'source'> & { source: ResolversTypes['Source'] }>;
  SourceType: SourceType;
  SourceInput: SourceInput;
  EntryUpdateFields: EntryUpdateFields;
  EntryAddFields: EntryAddFields;
  EntryRefund: ResolverTypeWrapper<EntryRefund>;
  EntryAddRefundFields: EntryAddRefundFields;
  EntryUpdateRefundFields: EntryUpdateRefundFields;
  EntryItem: ResolverTypeWrapper<EntryItem>;
  Int: ResolverTypeWrapper<Scalars['Int']>;
  EntryAddItemFields: EntryAddItemFields;
  EntryUpdateItemFields: EntryUpdateItemFields;
  EntryItemUpsertResult: ResolverTypeWrapper<EntryItemUpsertResult>;
  EntriesWhereDepartment: EntriesWhereDepartment;
  EntriesWhereCategory: EntriesWhereCategory;
  EntriesSourceInput: EntriesSourceInput;
  EntriesWhereSource: EntriesWhereSource;
  EntriesWherePaymentMethod: EntriesWherePaymentMethod;
  EntriesWhereFiscalYear: EntriesWhereFiscalYear;
  EntriesWhere: EntriesWhere;
  EntryUpdatePaymentMethod: EntryUpdatePaymentMethod;
  Subscription: ResolverTypeWrapper<{}>;
  FiscalYear: ResolverTypeWrapper<FiscalYear>;
  FiscalYearWhereHasDate: FiscalYearWhereHasDate;
  FiscalYearWhereInput: FiscalYearWhereInput;
  PaymentMethodAuthorizedEntity: ResolversTypes['Person'] | ResolversTypes['Business'] | ResolversTypes['Department'];
  PaymentMethodAuthorization: ResolverTypeWrapper<Omit<PaymentMethodAuthorization, 'entity'> & { entity?: Maybe<ResolversTypes['PaymentMethodAuthorizedEntity']> }>;
  PaymentMethod: ResolverTypeWrapper<PaymentMethod>;
  PaymentMethodWhereParentInput: PaymentMethodWhereParentInput;
  PaymentMethodWhereRefIdInput: PaymentMethodWhereRefIdInput;
  PaymentMethodWhereNameInput: PaymentMethodWhereNameInput;
  PaymentMethodWhereInput: PaymentMethodWhereInput;
  PaymentMethodAddFields: PaymentMethodAddFields;
  PaymentMethodUpdateFields: PaymentMethodUpdateFields;
  PersonName: ResolverTypeWrapper<PersonName>;
  PersonNameInput: PersonNameInput;
  PersonAddFields: PersonAddFields;
  Person: ResolverTypeWrapper<Person>;
  PeopleWhereInput: PeopleWhereInput;
  WhereRational: WhereRational;
  Date: ResolverTypeWrapper<Scalars['Date']>;
  Rational: ResolverTypeWrapper<Scalars['Rational']>;
  SortDirection: SortDirection;
  FilterType: FilterType;
  PaginateInput: PaginateInput;
  ByIdFilter: ByIdFilter;
  RegexOptions: RegexOptions;
  WhereTreeNodeInput: WhereTreeNodeInput;
  WhereRegexInput: WhereRegexInput;
  WhereDateTime: WhereDateTime;
  WhereDate: WhereDate;
  Source: ResolversTypes['Person'] | ResolversTypes['Business'] | ResolversTypes['Department'];
  User: ResolverTypeWrapper<User>;
  CacheControlScope: CacheControlScope;
  Upload: ResolverTypeWrapper<Scalars['Upload']>;
};

/** Mapping between all available schema types and the resolvers parents */
export type ResolversParentTypes = {
  BudgetOwner: ResolversParentTypes['Department'] | ResolversParentTypes['Business'];
  Budget: Omit<Budget, 'owner'> & { owner: ResolversParentTypes['BudgetOwner'] };
  ID: Scalars['ID'];
  BudgetOwnerInput: BudgetOwnerInput;
  BudgetsWhereOwner: BudgetsWhereOwner;
  BudgetsWhereInput: BudgetsWhereInput;
  Query: {};
  String: Scalars['String'];
  Vendor: Vendor;
  Boolean: Scalars['Boolean'];
  Business: Business;
  BusinessAddFields: BusinessAddFields;
  BusinessesWhereInput: BusinessesWhereInput;
  Mutation: {};
  CategoryWhereParentInput: CategoryWhereParentInput;
  CategoryWhereNameInput: CategoryWhereNameInput;
  CategoryWhereTypeInput: CategoryWhereTypeInput;
  CategoryWhereInput: CategoryWhereInput;
  Category: Category;
  DepartmentAncestor: ResolversParentTypes['Department'] | ResolversParentTypes['Business'];
  Department: Omit<Department, 'parent' | 'ancestors'> & { parent: ResolversParentTypes['DepartmentAncestor'], ancestors: Array<ResolversParentTypes['DepartmentAncestor']> };
  DepartmentAncestorInput: DepartmentAncestorInput;
  DepartmentsWhereAncestor: DepartmentsWhereAncestor;
  DepartmentsWhereInput: DepartmentsWhereInput;
  DepartmentAddFields: DepartmentAddFields;
  EntryDateOfRecord: EntryDateOfRecord;
  EntryDateOfRecordAdd: EntryDateOfRecordAdd;
  EntryDateOfRecordUpdate: EntryDateOfRecordUpdate;
  Entry: Omit<Entry, 'source'> & { source: ResolversParentTypes['Source'] };
  SourceInput: SourceInput;
  EntryUpdateFields: EntryUpdateFields;
  EntryAddFields: EntryAddFields;
  EntryRefund: EntryRefund;
  EntryAddRefundFields: EntryAddRefundFields;
  EntryUpdateRefundFields: EntryUpdateRefundFields;
  EntryItem: EntryItem;
  Int: Scalars['Int'];
  EntryAddItemFields: EntryAddItemFields;
  EntryUpdateItemFields: EntryUpdateItemFields;
  EntryItemUpsertResult: EntryItemUpsertResult;
  EntriesWhereDepartment: EntriesWhereDepartment;
  EntriesWhereCategory: EntriesWhereCategory;
  EntriesSourceInput: EntriesSourceInput;
  EntriesWhereSource: EntriesWhereSource;
  EntriesWherePaymentMethod: EntriesWherePaymentMethod;
  EntriesWhereFiscalYear: EntriesWhereFiscalYear;
  EntriesWhere: EntriesWhere;
  EntryUpdatePaymentMethod: EntryUpdatePaymentMethod;
  Subscription: {};
  FiscalYear: FiscalYear;
  FiscalYearWhereHasDate: FiscalYearWhereHasDate;
  FiscalYearWhereInput: FiscalYearWhereInput;
  PaymentMethodAuthorizedEntity: ResolversParentTypes['Person'] | ResolversParentTypes['Business'] | ResolversParentTypes['Department'];
  PaymentMethodAuthorization: Omit<PaymentMethodAuthorization, 'entity'> & { entity?: Maybe<ResolversParentTypes['PaymentMethodAuthorizedEntity']> };
  PaymentMethod: PaymentMethod;
  PaymentMethodWhereParentInput: PaymentMethodWhereParentInput;
  PaymentMethodWhereRefIdInput: PaymentMethodWhereRefIdInput;
  PaymentMethodWhereNameInput: PaymentMethodWhereNameInput;
  PaymentMethodWhereInput: PaymentMethodWhereInput;
  PaymentMethodAddFields: PaymentMethodAddFields;
  PaymentMethodUpdateFields: PaymentMethodUpdateFields;
  PersonName: PersonName;
  PersonNameInput: PersonNameInput;
  PersonAddFields: PersonAddFields;
  Person: Person;
  PeopleWhereInput: PeopleWhereInput;
  WhereRational: WhereRational;
  Date: Scalars['Date'];
  Rational: Scalars['Rational'];
  PaginateInput: PaginateInput;
  ByIdFilter: ByIdFilter;
  WhereTreeNodeInput: WhereTreeNodeInput;
  WhereRegexInput: WhereRegexInput;
  WhereDateTime: WhereDateTime;
  WhereDate: WhereDate;
  Source: ResolversParentTypes['Person'] | ResolversParentTypes['Business'] | ResolversParentTypes['Department'];
  User: User;
  Upload: Scalars['Upload'];
};

export type CacheControlDirectiveArgs = {   maxAge?: Maybe<Scalars['Int']>;
  scope?: Maybe<CacheControlScope>; };

export type CacheControlDirectiveResolver<Result, Parent, ContextType = Context, Args = CacheControlDirectiveArgs> = DirectiveResolverFn<Result, Parent, ContextType, Args>;

export type BudgetOwnerResolvers<ContextType = Context, ParentType extends ResolversParentTypes['BudgetOwner'] = ResolversParentTypes['BudgetOwner']> = {
  __resolveType: TypeResolveFn<'Department' | 'Business', ParentType, ContextType>;
};

export type BudgetResolvers<ContextType = Context, ParentType extends ResolversParentTypes['Budget'] = ResolversParentTypes['Budget']> = {
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  amount?: Resolver<ResolversTypes['Rational'], ParentType, ContextType>;
  owner?: Resolver<ResolversTypes['BudgetOwner'], ParentType, ContextType>;
  fiscalYear?: Resolver<ResolversTypes['FiscalYear'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type QueryResolvers<ContextType = Context, ParentType extends ResolversParentTypes['Query'] = ResolversParentTypes['Query']> = {
  budgets?: Resolver<Array<ResolversTypes['Budget']>, ParentType, ContextType, RequireFields<QueryBudgetsArgs, never>>;
  budget?: Resolver<ResolversTypes['Budget'], ParentType, ContextType, RequireFields<QueryBudgetArgs, 'id'>>;
  businesses?: Resolver<Array<ResolversTypes['Business']>, ParentType, ContextType, RequireFields<QueryBusinessesArgs, never>>;
  business?: Resolver<ResolversTypes['Business'], ParentType, ContextType, RequireFields<QueryBusinessArgs, 'id'>>;
  categories?: Resolver<Array<ResolversTypes['Category']>, ParentType, ContextType, RequireFields<QueryCategoriesArgs, never>>;
  category?: Resolver<ResolversTypes['Category'], ParentType, ContextType, RequireFields<QueryCategoryArgs, 'id'>>;
  departments?: Resolver<Array<ResolversTypes['Department']>, ParentType, ContextType, RequireFields<QueryDepartmentsArgs, never>>;
  department?: Resolver<ResolversTypes['Department'], ParentType, ContextType, RequireFields<QueryDepartmentArgs, 'id'>>;
  entries?: Resolver<Array<ResolversTypes['Entry']>, ParentType, ContextType, RequireFields<QueryEntriesArgs, never>>;
  entry?: Resolver<Maybe<ResolversTypes['Entry']>, ParentType, ContextType, RequireFields<QueryEntryArgs, 'id'>>;
  entryRefund?: Resolver<Maybe<ResolversTypes['EntryRefund']>, ParentType, ContextType, RequireFields<QueryEntryRefundArgs, 'id'>>;
  entryItem?: Resolver<Maybe<ResolversTypes['EntryItem']>, ParentType, ContextType, RequireFields<QueryEntryItemArgs, 'id'>>;
  fiscalYears?: Resolver<Array<ResolversTypes['FiscalYear']>, ParentType, ContextType, RequireFields<QueryFiscalYearsArgs, never>>;
  fiscalYear?: Resolver<ResolversTypes['FiscalYear'], ParentType, ContextType, RequireFields<QueryFiscalYearArgs, 'id'>>;
  paymentMethods?: Resolver<Array<ResolversTypes['PaymentMethod']>, ParentType, ContextType, RequireFields<QueryPaymentMethodsArgs, never>>;
  paymentMethod?: Resolver<Maybe<ResolversTypes['PaymentMethod']>, ParentType, ContextType, RequireFields<QueryPaymentMethodArgs, 'id'>>;
  people?: Resolver<Array<ResolversTypes['Person']>, ParentType, ContextType, RequireFields<QueryPeopleArgs, never>>;
  person?: Resolver<ResolversTypes['Person'], ParentType, ContextType, RequireFields<QueryPersonArgs, 'id'>>;
  sources?: Resolver<Array<ResolversTypes['Source']>, ParentType, ContextType, RequireFields<QuerySourcesArgs, 'searchByName'>>;
};

export type VendorResolvers<ContextType = Context, ParentType extends ResolversParentTypes['Vendor'] = ResolversParentTypes['Vendor']> = {
  approved?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  vendorId?: Resolver<Maybe<ResolversTypes['ID']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type BusinessResolvers<ContextType = Context, ParentType extends ResolversParentTypes['Business'] = ResolversParentTypes['Business']> = {
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  name?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  budgets?: Resolver<Array<ResolversTypes['Budget']>, ParentType, ContextType>;
  departments?: Resolver<Array<ResolversTypes['Department']>, ParentType, ContextType>;
  vendor?: Resolver<Maybe<ResolversTypes['Vendor']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type MutationResolvers<ContextType = Context, ParentType extends ResolversParentTypes['Mutation'] = ResolversParentTypes['Mutation']> = {
  addBusiness?: Resolver<ResolversTypes['Business'], ParentType, ContextType, RequireFields<MutationAddBusinessArgs, 'fields'>>;
  entryUpdate?: Resolver<ResolversTypes['Entry'], ParentType, ContextType, RequireFields<MutationEntryUpdateArgs, 'id' | 'fields'>>;
  entryAdd?: Resolver<ResolversTypes['Entry'], ParentType, ContextType, RequireFields<MutationEntryAddArgs, 'fields'>>;
  entryDelete?: Resolver<ResolversTypes['Entry'], ParentType, ContextType, RequireFields<MutationEntryDeleteArgs, 'id'>>;
  entryAddRefund?: Resolver<ResolversTypes['Entry'], ParentType, ContextType, RequireFields<MutationEntryAddRefundArgs, 'id' | 'fields'>>;
  entryUpdateRefund?: Resolver<ResolversTypes['Entry'], ParentType, ContextType, RequireFields<MutationEntryUpdateRefundArgs, 'id' | 'fields'>>;
  entryDeleteRefund?: Resolver<ResolversTypes['Entry'], ParentType, ContextType, RequireFields<MutationEntryDeleteRefundArgs, 'id'>>;
  entryAddItem?: Resolver<ResolversTypes['EntryItemUpsertResult'], ParentType, ContextType, RequireFields<MutationEntryAddItemArgs, 'id' | 'fields'>>;
  entryUpdateItem?: Resolver<ResolversTypes['EntryItemUpsertResult'], ParentType, ContextType, RequireFields<MutationEntryUpdateItemArgs, 'id' | 'fields'>>;
  entryDeleteItem?: Resolver<ResolversTypes['EntryItemUpsertResult'], ParentType, ContextType, RequireFields<MutationEntryDeleteItemArgs, 'id'>>;
  paymentMethodUpdate?: Resolver<ResolversTypes['PaymentMethod'], ParentType, ContextType, RequireFields<MutationPaymentMethodUpdateArgs, 'id' | 'fields'>>;
  paymentMethodAdd?: Resolver<ResolversTypes['PaymentMethod'], ParentType, ContextType, RequireFields<MutationPaymentMethodAddArgs, 'fields'>>;
  addPerson?: Resolver<ResolversTypes['Person'], ParentType, ContextType, RequireFields<MutationAddPersonArgs, 'fields'>>;
};

export type CategoryResolvers<ContextType = Context, ParentType extends ResolversParentTypes['Category'] = ResolversParentTypes['Category']> = {
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  name?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  type?: Resolver<ResolversTypes['EntryType'], ParentType, ContextType>;
  parent?: Resolver<Maybe<ResolversTypes['Category']>, ParentType, ContextType>;
  ancestors?: Resolver<Array<ResolversTypes['Category']>, ParentType, ContextType>;
  children?: Resolver<Array<ResolversTypes['Category']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type DepartmentAncestorResolvers<ContextType = Context, ParentType extends ResolversParentTypes['DepartmentAncestor'] = ResolversParentTypes['DepartmentAncestor']> = {
  __resolveType: TypeResolveFn<'Department' | 'Business', ParentType, ContextType>;
};

export type DepartmentResolvers<ContextType = Context, ParentType extends ResolversParentTypes['Department'] = ResolversParentTypes['Department']> = {
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  name?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  code?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  budgets?: Resolver<Array<ResolversTypes['Budget']>, ParentType, ContextType>;
  business?: Resolver<ResolversTypes['Business'], ParentType, ContextType>;
  parent?: Resolver<ResolversTypes['DepartmentAncestor'], ParentType, ContextType>;
  ancestors?: Resolver<Array<ResolversTypes['DepartmentAncestor']>, ParentType, ContextType>;
  descendants?: Resolver<Array<ResolversTypes['Department']>, ParentType, ContextType>;
  children?: Resolver<Array<ResolversTypes['Department']>, ParentType, ContextType>;
  virtualRoot?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type EntryDateOfRecordResolvers<ContextType = Context, ParentType extends ResolversParentTypes['EntryDateOfRecord'] = ResolversParentTypes['EntryDateOfRecord']> = {
  date?: Resolver<ResolversTypes['Date'], ParentType, ContextType>;
  overrideFiscalYear?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type EntryResolvers<ContextType = Context, ParentType extends ResolversParentTypes['Entry'] = ResolversParentTypes['Entry']> = {
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  refunds?: Resolver<Array<ResolversTypes['EntryRefund']>, ParentType, ContextType>;
  items?: Resolver<Array<ResolversTypes['EntryItem']>, ParentType, ContextType>;
  type?: Resolver<ResolversTypes['EntryType'], ParentType, ContextType>;
  date?: Resolver<ResolversTypes['Date'], ParentType, ContextType>;
  dateOfRecord?: Resolver<Maybe<ResolversTypes['EntryDateOfRecord']>, ParentType, ContextType>;
  department?: Resolver<ResolversTypes['Department'], ParentType, ContextType>;
  budget?: Resolver<ResolversTypes['Budget'], ParentType, ContextType>;
  fiscalYear?: Resolver<ResolversTypes['FiscalYear'], ParentType, ContextType>;
  category?: Resolver<ResolversTypes['Category'], ParentType, ContextType>;
  paymentMethod?: Resolver<ResolversTypes['PaymentMethod'], ParentType, ContextType>;
  description?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  total?: Resolver<ResolversTypes['Rational'], ParentType, ContextType>;
  source?: Resolver<ResolversTypes['Source'], ParentType, ContextType>;
  reconciled?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  lastUpdate?: Resolver<ResolversTypes['Date'], ParentType, ContextType>;
  deleted?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type EntryRefundResolvers<ContextType = Context, ParentType extends ResolversParentTypes['EntryRefund'] = ResolversParentTypes['EntryRefund']> = {
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  date?: Resolver<ResolversTypes['Date'], ParentType, ContextType>;
  description?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  paymentMethod?: Resolver<ResolversTypes['PaymentMethod'], ParentType, ContextType>;
  total?: Resolver<ResolversTypes['Rational'], ParentType, ContextType>;
  reconciled?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  lastUpdate?: Resolver<ResolversTypes['Date'], ParentType, ContextType>;
  deleted?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type EntryItemResolvers<ContextType = Context, ParentType extends ResolversParentTypes['EntryItem'] = ResolversParentTypes['EntryItem']> = {
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  department?: Resolver<Maybe<ResolversTypes['Department']>, ParentType, ContextType>;
  category?: Resolver<Maybe<ResolversTypes['Category']>, ParentType, ContextType>;
  description?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  units?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  total?: Resolver<ResolversTypes['Rational'], ParentType, ContextType>;
  lastUpdate?: Resolver<ResolversTypes['Date'], ParentType, ContextType>;
  deleted?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type EntryItemUpsertResultResolvers<ContextType = Context, ParentType extends ResolversParentTypes['EntryItemUpsertResult'] = ResolversParentTypes['EntryItemUpsertResult']> = {
  entryItem?: Resolver<ResolversTypes['EntryItem'], ParentType, ContextType>;
  entry?: Resolver<ResolversTypes['Entry'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type SubscriptionResolvers<ContextType = Context, ParentType extends ResolversParentTypes['Subscription'] = ResolversParentTypes['Subscription']> = {
  entryAdded?: SubscriptionResolver<ResolversTypes['Entry'], "entryAdded", ParentType, ContextType>;
  entryUpdated?: SubscriptionResolver<ResolversTypes['Entry'], "entryUpdated", ParentType, ContextType>;
  entryUpserted?: SubscriptionResolver<ResolversTypes['Entry'], "entryUpserted", ParentType, ContextType>;
};

export type FiscalYearResolvers<ContextType = Context, ParentType extends ResolversParentTypes['FiscalYear'] = ResolversParentTypes['FiscalYear']> = {
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  name?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  begin?: Resolver<ResolversTypes['Date'], ParentType, ContextType>;
  end?: Resolver<ResolversTypes['Date'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type PaymentMethodAuthorizedEntityResolvers<ContextType = Context, ParentType extends ResolversParentTypes['PaymentMethodAuthorizedEntity'] = ResolversParentTypes['PaymentMethodAuthorizedEntity']> = {
  __resolveType: TypeResolveFn<'Person' | 'Business' | 'Department', ParentType, ContextType>;
};

export type PaymentMethodAuthorizationResolvers<ContextType = Context, ParentType extends ResolversParentTypes['PaymentMethodAuthorization'] = ResolversParentTypes['PaymentMethodAuthorization']> = {
  owner?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  entity?: Resolver<Maybe<ResolversTypes['PaymentMethodAuthorizedEntity']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
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
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type PersonNameResolvers<ContextType = Context, ParentType extends ResolversParentTypes['PersonName'] = ResolversParentTypes['PersonName']> = {
  first?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  last?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type PersonResolvers<ContextType = Context, ParentType extends ResolversParentTypes['Person'] = ResolversParentTypes['Person']> = {
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  name?: Resolver<ResolversTypes['PersonName'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export interface DateScalarConfig extends GraphQLScalarTypeConfig<ResolversTypes['Date'], any> {
  name: 'Date';
}

export interface RationalScalarConfig extends GraphQLScalarTypeConfig<ResolversTypes['Rational'], any> {
  name: 'Rational';
}

export type SourceResolvers<ContextType = Context, ParentType extends ResolversParentTypes['Source'] = ResolversParentTypes['Source']> = {
  __resolveType: TypeResolveFn<'Person' | 'Business' | 'Department', ParentType, ContextType>;
};

export type UserResolvers<ContextType = Context, ParentType extends ResolversParentTypes['User'] = ResolversParentTypes['User']> = {
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  user?: Resolver<ResolversTypes['Person'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export interface UploadScalarConfig extends GraphQLScalarTypeConfig<ResolversTypes['Upload'], any> {
  name: 'Upload';
}

export type Resolvers<ContextType = Context> = {
  BudgetOwner?: BudgetOwnerResolvers<ContextType>;
  Budget?: BudgetResolvers<ContextType>;
  Query?: QueryResolvers<ContextType>;
  Vendor?: VendorResolvers<ContextType>;
  Business?: BusinessResolvers<ContextType>;
  Mutation?: MutationResolvers<ContextType>;
  Category?: CategoryResolvers<ContextType>;
  DepartmentAncestor?: DepartmentAncestorResolvers<ContextType>;
  Department?: DepartmentResolvers<ContextType>;
  EntryDateOfRecord?: EntryDateOfRecordResolvers<ContextType>;
  Entry?: EntryResolvers<ContextType>;
  EntryRefund?: EntryRefundResolvers<ContextType>;
  EntryItem?: EntryItemResolvers<ContextType>;
  EntryItemUpsertResult?: EntryItemUpsertResultResolvers<ContextType>;
  Subscription?: SubscriptionResolvers<ContextType>;
  FiscalYear?: FiscalYearResolvers<ContextType>;
  PaymentMethodAuthorizedEntity?: PaymentMethodAuthorizedEntityResolvers<ContextType>;
  PaymentMethodAuthorization?: PaymentMethodAuthorizationResolvers<ContextType>;
  PaymentMethod?: PaymentMethodResolvers<ContextType>;
  PersonName?: PersonNameResolvers<ContextType>;
  Person?: PersonResolvers<ContextType>;
  Date?: GraphQLScalarType;
  Rational?: GraphQLScalarType;
  Source?: SourceResolvers<ContextType>;
  User?: UserResolvers<ContextType>;
  Upload?: GraphQLScalarType;
};


/**
 * @deprecated
 * Use "Resolvers" root object instead. If you wish to get "IResolvers", add "typesPrefix: I" to your config.
 */
export type IResolvers<ContextType = Context> = Resolvers<ContextType>;
export type DirectiveResolvers<ContextType = Context> = {
  cacheControl?: CacheControlDirectiveResolver<any, any, ContextType>;
};


/**
 * @deprecated
 * Use "DirectiveResolvers" root object instead. If you wish to get "IDirectiveResolvers", add "typesPrefix: I" to your config.
 */
export type IDirectiveResolvers<ContextType = Context> = DirectiveResolvers<ContextType>;