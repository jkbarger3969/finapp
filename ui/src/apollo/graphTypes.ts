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


export type AccountInterface = {
  id: Scalars['ID'];
  active: Scalars['Boolean'];
  currency: Currency;
  name: Scalars['String'];
  owner: Entity;
};

export type AccountCard = PaymentCardInterface & {
  __typename?: 'AccountCard';
  id: Scalars['ID'];
  account: AccountChecking | AccountCreditCard;
  active: Scalars['Boolean'];
  authorizedUsers: Array<Entity>;
  trailingDigits: Scalars['String'];
  type: PaymentCardType;
};

export type AccountWithCardsInterface = {
  id: Scalars['ID'];
  active: Scalars['Boolean'];
  cards: Array<AccountCard>;
  currency: Currency;
  name: Scalars['String'];
  owner: Entity;
};

export type AccountCheck = PaymentCheckInterface & {
  __typename?: 'AccountCheck';
  account: AccountChecking;
  checkNumber: Scalars['String'];
};

export type AccountCheckInput = {
  /** id of AccountChecking */
  account: Scalars['ID'];
  checkNumber: Scalars['String'];
};

export type AccountChecking = AccountInterface & AccountWithCardsInterface & {
  __typename?: 'AccountChecking';
  id: Scalars['ID'];
  accountNumber: Scalars['String'];
  active: Scalars['Boolean'];
  cards: Array<AccountCard>;
  currency: Currency;
  name: Scalars['String'];
  owner: Entity;
};

export type AccountCreditCard = AccountInterface & AccountWithCardsInterface & {
  __typename?: 'AccountCreditCard';
  id: Scalars['ID'];
  active: Scalars['Boolean'];
  cards: Array<AccountCard>;
  currency: Currency;
  name: Scalars['String'];
  owner: Entity;
};

export type AccountCardsWhere = {
  id?: Maybe<WhereId>;
  account?: Maybe<AccountsWhere>;
  active?: Maybe<Scalars['Boolean']>;
  authorizedUsers?: Maybe<EntitiesWhere>;
  trailingDigits?: Maybe<WhereRegex>;
  type?: Maybe<PaymentCardType>;
  and?: Maybe<Array<AccountCardsWhere>>;
  or?: Maybe<Array<AccountCardsWhere>>;
  nor?: Maybe<Array<AccountCardsWhere>>;
};

export enum AccountType {
  CreditCard = 'CREDIT_CARD',
  Checking = 'CHECKING'
}

export type AccountsWhere = {
  id?: Maybe<WhereId>;
  accountNumber?: Maybe<WhereRegex>;
  accountType?: Maybe<AccountType>;
  active?: Maybe<Scalars['Boolean']>;
  cards?: Maybe<AccountCardsWhere>;
  name?: Maybe<WhereRegex>;
  owner?: Maybe<EntitiesWhere>;
  and?: Maybe<Array<AccountsWhere>>;
  or?: Maybe<Array<AccountsWhere>>;
  nor?: Maybe<Array<AccountsWhere>>;
};

export type Query = {
  __typename?: 'Query';
  accounts: Array<AccountChecking | AccountCreditCard>;
  account: AccountChecking | AccountCreditCard;
  accountCards: Array<AccountCard>;
  accountCard: AccountCard;
  alias?: Maybe<Alias>;
  aliases: Array<Alias>;
  budgets: Array<Budget>;
  budget: Budget;
  businesses: Array<Business>;
  business: Business;
  categories: Array<Category>;
  category: Category;
  departments: Array<Department>;
  department: Department;
  entities: Array<Entity>;
  entries: Array<Entry>;
  entry?: Maybe<Entry>;
  entryRefund?: Maybe<EntryRefund>;
  entryItem?: Maybe<EntryItem>;
  fiscalYears: Array<FiscalYear>;
  fiscalYear: FiscalYear;
  people: Array<Person>;
  person: Person;
  sources: Array<Source>;
};


export type QueryAccountsArgs = {
  where?: Maybe<AccountsWhere>;
};


export type QueryAccountArgs = {
  id: Scalars['ID'];
};


export type QueryAccountCardsArgs = {
  where?: Maybe<AccountCardsWhere>;
};


export type QueryAccountCardArgs = {
  id: Scalars['ID'];
};


export type QueryAliasArgs = {
  id: Scalars['ID'];
};


export type QueryAliasesArgs = {
  where?: Maybe<AliasesWhere>;
};


export type QueryBudgetsArgs = {
  where?: Maybe<BudgetsWhere>;
};


export type QueryBudgetArgs = {
  id: Scalars['ID'];
};


export type QueryBusinessesArgs = {
  where?: Maybe<BusinessesWhere>;
};


export type QueryBusinessArgs = {
  id: Scalars['ID'];
};


export type QueryCategoriesArgs = {
  where?: Maybe<CategoriesWhere>;
};


export type QueryCategoryArgs = {
  id: Scalars['ID'];
};


export type QueryDepartmentsArgs = {
  where?: Maybe<DepartmentsWhere>;
};


export type QueryDepartmentArgs = {
  id: Scalars['ID'];
};


export type QueryEntitiesArgs = {
  where: EntitiesWhere;
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
  where?: Maybe<FiscalYearsWhere>;
};


export type QueryFiscalYearArgs = {
  id: Scalars['ID'];
};


export type QueryPeopleArgs = {
  where?: Maybe<PeopleWhere>;
};


export type QueryPersonArgs = {
  id: Scalars['ID'];
};


export type QuerySourcesArgs = {
  searchByName: Scalars['String'];
};

export type AliasTarget = Category | Department;

export enum AliasType {
  Alias = 'ALIAS',
  PrefixDescendants = 'PREFIX_DESCENDANTS',
  PostfixDescendants = 'POSTFIX_DESCENDANTS'
}

export type Alias = {
  __typename?: 'Alias';
  id: Scalars['ID'];
  target: AliasTarget;
  name: Scalars['String'];
  type: AliasType;
};

export type AliasWhereTarget = {
  eq?: Maybe<NodeInput>;
  ne?: Maybe<NodeInput>;
  in?: Maybe<Array<NodeInput>>;
  nin?: Maybe<Array<NodeInput>>;
};

export type AliasesWhere = {
  id?: Maybe<WhereId>;
  target?: Maybe<WhereNode>;
  name?: Maybe<WhereRegex>;
  type?: Maybe<AliasType>;
  and?: Maybe<Array<AliasesWhere>>;
  or?: Maybe<Array<AliasesWhere>>;
  nor?: Maybe<Array<AliasesWhere>>;
};

export type BudgetOwner = Department | Business;

export type Budget = {
  __typename?: 'Budget';
  id: Scalars['ID'];
  amount: Scalars['Rational'];
  owner: BudgetOwner;
  fiscalYear: FiscalYear;
};

export type BudgetsWhere = {
  id?: Maybe<WhereId>;
  amount?: Maybe<WhereRational>;
  owner?: Maybe<WhereNode>;
  fiscalYear?: Maybe<FiscalYearsWhere>;
  and?: Maybe<Array<BudgetsWhere>>;
  or?: Maybe<Array<BudgetsWhere>>;
  nor?: Maybe<Array<BudgetsWhere>>;
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
  /**
   * When root is `true`, only departments who's direct parent is the the Business
   * are returned.
   */
  departments: Array<Department>;
  vendor?: Maybe<Vendor>;
};


export type BusinessDepartmentsArgs = {
  root?: Maybe<Scalars['Boolean']>;
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

export type BusinessesWhere = {
  id?: Maybe<WhereId>;
  name?: Maybe<WhereRegex>;
  and?: Maybe<Array<BusinessesWhere>>;
  or?: Maybe<Array<BusinessesWhere>>;
  nor?: Maybe<Array<BusinessesWhere>>;
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
  addPerson: Person;
};


export type MutationAddBusinessArgs = {
  fields: BusinessAddFields;
};


export type MutationEntryUpdateArgs = {
  id: Scalars['ID'];
  fields: EntryUpdateFields;
  paymentMethodUpdate?: Maybe<EntryUpdatePaymentMethod>;
  personAdd?: Maybe<PersonAddFields>;
  businessAdd?: Maybe<BusinessAddFields>;
};


export type MutationEntryAddArgs = {
  fields: EntryAddFields;
  personAdd?: Maybe<PersonAddFields>;
  businessAdd?: Maybe<BusinessAddFields>;
};


export type MutationEntryDeleteArgs = {
  id: Scalars['ID'];
};


export type MutationEntryAddRefundArgs = {
  id: Scalars['ID'];
  fields: EntryAddRefundFields;
};


export type MutationEntryUpdateRefundArgs = {
  id: Scalars['ID'];
  fields: EntryUpdateRefundFields;
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


export type MutationAddPersonArgs = {
  fields: PersonAddFields;
};

export type Category = {
  __typename?: 'Category';
  id: Scalars['ID'];
  name: Scalars['String'];
  type: EntryType;
  parent?: Maybe<Category>;
  children: Array<Category>;
  aliases: Array<Alias>;
};

export type CategoriesWhere = {
  id?: Maybe<WhereTreeId>;
  name?: Maybe<WhereRegex>;
  type?: Maybe<EntryType>;
  parent?: Maybe<WhereId>;
  and?: Maybe<Array<CategoriesWhere>>;
  or?: Maybe<Array<CategoriesWhere>>;
  nor?: Maybe<Array<CategoriesWhere>>;
  /** Root Categories i.e. NO parent. */
  root?: Maybe<Scalars['Boolean']>;
};

export enum Currency {
  Usd = 'USD'
}

export type DepartmentAncestor = Department | Business;

export type Department = {
  __typename?: 'Department';
  id: Scalars['ID'];
  name: Scalars['String'];
  code?: Maybe<Scalars['String']>;
  budgets: Array<Budget>;
  business: Business;
  parent: DepartmentAncestor;
  children: Array<Department>;
  ancestors: Array<DepartmentAncestor>;
  descendants: Array<Department>;
  virtualRoot?: Maybe<Scalars['Boolean']>;
  aliases: Array<Alias>;
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

export type DepartmentsWhere = {
  id?: Maybe<WhereTreeId>;
  name?: Maybe<WhereRegex>;
  code?: Maybe<Scalars['String']>;
  parent?: Maybe<WhereNode>;
  /** Matches all departments that are a decedents of the business. */
  business?: Maybe<Scalars['ID']>;
  and?: Maybe<Array<DepartmentsWhere>>;
  or?: Maybe<Array<DepartmentsWhere>>;
  nor?: Maybe<Array<DepartmentsWhere>>;
};

export type Entity = Person | Business | Department;

export type EntitiesWhere = {
  businesses?: Maybe<BusinessesWhere>;
  departments?: Maybe<DepartmentsWhere>;
  people?: Maybe<PeopleWhere>;
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
  category: Category;
  /** ISO 8601 */
  date: Scalars['Date'];
  dateOfRecord?: Maybe<EntryDateOfRecord>;
  deleted: Scalars['Boolean'];
  department: Department;
  description?: Maybe<Scalars['String']>;
  fiscalYear: FiscalYear;
  items: Array<EntryItem>;
  lastUpdate: Scalars['Date'];
  paymentMethod: PaymentMethodCard | PaymentMethodCheck | PaymentMethodCash | PaymentMethodOnline | PaymentMethodCombination | PaymentMethodUnknown;
  reconciled: Scalars['Boolean'];
  refunds: Array<EntryRefund>;
  source: Entity;
  total: Scalars['Rational'];
};

export type EntriesWhereSource = {
  businesses?: Maybe<BusinessesWhere>;
  departments?: Maybe<DepartmentsWhere>;
  people?: Maybe<PeopleWhere>;
};

export type EntriesWhereDateOfRecord = {
  date?: Maybe<WhereDateBeta>;
  overrideFiscalYear?: Maybe<Scalars['Boolean']>;
};

export type EntriesWhere = {
  id?: Maybe<WhereId>;
  refunds?: Maybe<EntryRefundsWhere>;
  items?: Maybe<EntryItemsWhere>;
  date?: Maybe<WhereDateBeta>;
  dateOfRecord?: Maybe<EntriesWhereDateOfRecord>;
  department?: Maybe<DepartmentsWhere>;
  fiscalYear?: Maybe<FiscalYearsWhere>;
  category?: Maybe<CategoriesWhere>;
  description?: Maybe<WhereRegex>;
  total?: Maybe<WhereRational>;
  source?: Maybe<EntriesWhereSource>;
  reconciled?: Maybe<Scalars['Boolean']>;
  lastUpdate?: Maybe<WhereDateBeta>;
  deleted?: Maybe<Scalars['Boolean']>;
  and?: Maybe<Array<EntriesWhere>>;
  or?: Maybe<Array<EntriesWhere>>;
  nor?: Maybe<Array<EntriesWhere>>;
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
  deleted: Scalars['Boolean'];
  description?: Maybe<Scalars['String']>;
  lastUpdate: Scalars['Date'];
  paymentMethod: PaymentMethodCard | PaymentMethodCheck | PaymentMethodCash | PaymentMethodOnline | PaymentMethodCombination | PaymentMethodUnknown;
  reconciled: Scalars['Boolean'];
  total: Scalars['Rational'];
};

export type EntryRefundsWhere = {
  id?: Maybe<WhereId>;
  date?: Maybe<WhereDateBeta>;
  total?: Maybe<WhereRational>;
  reconciled?: Maybe<Scalars['Boolean']>;
  lastUpdate?: Maybe<WhereDateBeta>;
  deleted?: Maybe<Scalars['Boolean']>;
  and?: Maybe<Array<EntryRefundsWhere>>;
  or?: Maybe<Array<EntryRefundsWhere>>;
  nor?: Maybe<Array<EntryRefundsWhere>>;
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
  category?: Maybe<Category>;
  deleted: Scalars['Boolean'];
  department?: Maybe<Department>;
  description?: Maybe<Scalars['String']>;
  lastUpdate: Scalars['Date'];
  total: Scalars['Rational'];
  units: Scalars['Int'];
};

export type EntryItemsWhere = {
  id?: Maybe<WhereId>;
  department?: Maybe<DepartmentsWhere>;
  category?: Maybe<CategoriesWhere>;
  units?: Maybe<WhereInt>;
  total?: Maybe<WhereRational>;
  lastUpdate?: Maybe<WhereDateBeta>;
  deleted?: Maybe<Scalars['Boolean']>;
  and?: Maybe<Array<EntryItemsWhere>>;
  or?: Maybe<Array<EntryItemsWhere>>;
  nor?: Maybe<Array<EntryItemsWhere>>;
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

export type EntryUpdatePaymentMethod = {
  id: Scalars['ID'];
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

export type FiscalYearsWhere = {
  id?: Maybe<WhereId>;
  name?: Maybe<WhereRegex>;
  /**
   * A FiscalYear is the set of all dates in the interval [begin, end).
   *   eq: A fiscal year that contains the date.
   *   ne: Any fiscal year that does NOT contain the date.
   *   gt: Any fiscal year that begins after the date.
   *   gte: Any fiscal year that contains the date or begins after the date.
   *   lt: Any fiscal year that ends on or before the date.
   *   lte: Any fiscal year that contains the date or ends on or before the date.
   */
  date?: Maybe<WhereDateBeta>;
  and?: Maybe<Array<FiscalYearsWhere>>;
  or?: Maybe<Array<FiscalYearsWhere>>;
  nor?: Maybe<Array<FiscalYearsWhere>>;
};

export enum PaymentCardType {
  Visa = 'VISA',
  MasterCard = 'MASTER_CARD',
  AmericanExpress = 'AMERICAN_EXPRESS',
  Discover = 'DISCOVER'
}

export type PaymentCardInterface = {
  trailingDigits: Scalars['String'];
  type: PaymentCardType;
};

export type PaymentCard = PaymentCardInterface & {
  __typename?: 'PaymentCard';
  trailingDigits: Scalars['String'];
  type: PaymentCardType;
};

export type PaymentCardInput = {
  trailingDigits: Scalars['String'];
  type: PaymentCardType;
};

export type PaymentCheckInterface = {
  checkNumber: Scalars['String'];
};

export type PaymentCheck = PaymentCheckInterface & {
  __typename?: 'PaymentCheck';
  checkNumber: Scalars['String'];
};

export type PaymentCheckInput = {
  checkNumber: Scalars['String'];
};

export type PaymentMethodInterface = {
  currency: Currency;
};

export type PaymentMethodCard = PaymentMethodInterface & {
  __typename?: 'PaymentMethodCard';
  card: AccountCard | PaymentCard;
  currency: Currency;
};

export type PaymentMethodCardInput = {
  card: PaymentCardInput;
  currency: Currency;
};

export type PaymentMethodAccountCardInput = {
  /** id from AccountCard */
  card: Scalars['ID'];
  currency: Currency;
};

export type PaymentMethodCheck = PaymentMethodInterface & {
  __typename?: 'PaymentMethodCheck';
  currency: Currency;
  check: AccountCheck | PaymentCheck;
};

export type PaymentMethodCheckInput = {
  currency: Currency;
  check: PaymentCheckInput;
};

export type PaymentMethodAccountCheckInput = {
  currency: Currency;
  check: AccountCheckInput;
};

export type PaymentMethodCash = PaymentMethodInterface & {
  __typename?: 'PaymentMethodCash';
  currency: Currency;
};

export type PaymentMethodCashInput = {
  currency: Currency;
};

export type PaymentMethodOnline = PaymentMethodInterface & {
  __typename?: 'PaymentMethodOnline';
  currency: Currency;
};

export type PaymentMethodOnlineInput = {
  currency: Currency;
};

export type PaymentMethodCombination = PaymentMethodInterface & {
  __typename?: 'PaymentMethodCombination';
  currency: Currency;
};

export type PaymentMethodCombinationInput = {
  currency: Currency;
};

export type PaymentMethodUnknown = PaymentMethodInterface & {
  __typename?: 'PaymentMethodUnknown';
  currency: Currency;
};

export type PaymentMethodUnknownInput = {
  currency: Currency;
};

export enum PaymentMethodType {
  Card = 'CARD',
  Check = 'CHECK',
  Cash = 'CASH',
  Online = 'ONLINE',
  Combination = 'COMBINATION',
  Unknown = 'UNKNOWN'
}

export type PaymentMethodInput = {
  card?: Maybe<PaymentMethodCardInput>;
  accountCard?: Maybe<PaymentMethodAccountCardInput>;
  check?: Maybe<PaymentMethodCheckInput>;
  accountCheck?: Maybe<PaymentMethodAccountCheckInput>;
  cash?: Maybe<PaymentMethodCashInput>;
  online?: Maybe<PaymentMethodOnlineInput>;
  combination?: Maybe<PaymentMethodCombinationInput>;
  unknown?: Maybe<PaymentMethodUnknownInput>;
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

export type PeopleNameWhere = {
  first?: Maybe<WhereRegex>;
  last?: Maybe<WhereRegex>;
};

export type PeopleWhere = {
  id?: Maybe<WhereId>;
  name?: Maybe<PeopleNameWhere>;
  and?: Maybe<Array<PeopleWhere>>;
  or?: Maybe<Array<PeopleWhere>>;
  nor?: Maybe<Array<PeopleWhere>>;
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



export type TypeNode = {
  id: Scalars['ID'];
  name: Scalars['String'];
  parent?: Maybe<TypeNode>;
  children: Array<TypeNode>;
};

export enum NodeChildrenType {
  All = 'ALL',
  Branch = 'BRANCH',
  Leaf = 'LEAF',
  None = 'NONE'
}

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

/** https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_Expressions#advanced_searching_with_flags */
export enum RegexFlags {
  /** Global search. */
  G = 'G',
  /** Case-insensitive search. */
  I = 'I',
  /** Multi-line search. */
  M = 'M',
  /** Allows . to match newline characters. */
  S = 'S'
}

export type WhereId = {
  eq?: Maybe<Scalars['ID']>;
  ne?: Maybe<Scalars['ID']>;
  in?: Maybe<Array<Scalars['ID']>>;
  nin?: Maybe<Array<Scalars['ID']>>;
};

export type WhereTreeId = {
  eq?: Maybe<Scalars['ID']>;
  ne?: Maybe<Scalars['ID']>;
  in?: Maybe<Array<Scalars['ID']>>;
  nin?: Maybe<Array<Scalars['ID']>>;
  /** Range operators will match descendants and ancestors in the tree. */
  gt?: Maybe<Scalars['ID']>;
  gte?: Maybe<Scalars['ID']>;
  lt?: Maybe<Scalars['ID']>;
  lte?: Maybe<Scalars['ID']>;
};

export type NodeInput = {
  type: Scalars['String'];
  id: Scalars['ID'];
};

export type WhereNode = {
  eq?: Maybe<NodeInput>;
  ne?: Maybe<NodeInput>;
  in?: Maybe<Array<NodeInput>>;
  nin?: Maybe<Array<NodeInput>>;
};

export type WhereTreeNode = {
  eq?: Maybe<NodeInput>;
  ne?: Maybe<NodeInput>;
  in?: Maybe<Array<NodeInput>>;
  nin?: Maybe<Array<NodeInput>>;
  /** Range operators will match descendants and ancestors in the tree. */
  gt?: Maybe<NodeInput>;
  gte?: Maybe<NodeInput>;
  lt?: Maybe<NodeInput>;
  lte?: Maybe<NodeInput>;
};

export type WhereTreeNodeInput = {
  id: Scalars['ID'];
  matchDescendants?: Maybe<Scalars['Boolean']>;
};

export type WhereRegexInput = {
  pattern: Scalars['String'];
  options?: Maybe<Array<RegexOptions>>;
};

export type WhereRegex = {
  /**
   * "pattern" argument of the javascript RegExp constructor.
   * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/RegExp/RegExp#parameters
   */
  pattern: Scalars['String'];
  flags?: Maybe<Array<RegexFlags>>;
};

export type WhereDateTime = {
  /** ISO 8601 */
  date: Scalars['Date'];
  ignoreTime?: Maybe<Scalars['Boolean']>;
};

export type WhereInt = {
  eq?: Maybe<Scalars['Int']>;
  ne?: Maybe<Scalars['Int']>;
  gt?: Maybe<Scalars['Int']>;
  gte?: Maybe<Scalars['Int']>;
  lt?: Maybe<Scalars['Int']>;
  lte?: Maybe<Scalars['Int']>;
};

export type WhereDateBeta = {
  eq?: Maybe<Scalars['Date']>;
  ne?: Maybe<Scalars['Date']>;
  gt?: Maybe<Scalars['Date']>;
  gte?: Maybe<Scalars['Date']>;
  lt?: Maybe<Scalars['Date']>;
  lte?: Maybe<Scalars['Date']>;
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

export type GetReportDataEntry_1Fragment = { __typename: 'Entry', id: string, total: string, lastUpdate: string, deleted: boolean, category: { __typename: 'Category', id: string, name: string, type: EntryType }, fiscalYear: { __typename: 'FiscalYear', id: string }, department: { __typename: 'Department', id: string, ancestors: Array<{ __typename: 'Department', id: string } | { __typename: 'Business', id: string }> }, refunds: Array<{ __typename: 'EntryRefund', id: string, total: string, deleted: boolean, lastUpdate: string }>, items: Array<{ __typename: 'EntryItem', id: string, total: string, deleted: boolean, department?: Maybe<{ __typename: 'Department', id: string }> }> };

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

export type CategoryInputOptFragment = { __typename: 'Category', id: string, name: string, type: EntryType, children: Array<{ __typename: 'Category', id: string }>, parent?: Maybe<{ __typename: 'Category', id: string }> };

export type CategoryInputIniValueQueryVariables = Exact<{
  id: Scalars['ID'];
}>;


export type CategoryInputIniValueQuery = { __typename?: 'Query', categories: Array<(
    { __typename?: 'Category' }
    & CategoryInputOptFragment
  )> };

export type CategoryInputOptsQueryVariables = Exact<{
  where: CategoriesWhere;
}>;


export type CategoryInputOptsQuery = { __typename?: 'Query', categories: Array<(
    { __typename?: 'Category' }
    & CategoryInputOptFragment
  )> };

export type DeptInputOptFragment = { __typename: 'Department', id: string, name: string, children: Array<{ __typename: 'Department', id: string }> };

export type DeptInputIniValueQueryVariables = Exact<{
  id: Scalars['ID'];
}>;


export type DeptInputIniValueQuery = { __typename?: 'Query', iniValue: (
    { __typename?: 'Department', parent: { __typename: 'Department', id: string, children: Array<(
        { __typename?: 'Department' }
        & DeptInputOptFragment
      )> } | { __typename: 'Business', id: string, departments: Array<(
        { __typename?: 'Department' }
        & DeptInputOptFragment
      )> } }
    & DeptInputOptFragment
  ), ancestors: Array<(
    { __typename?: 'Department', parent: { __typename: 'Department', id: string } | { __typename: 'Business', id: string } }
    & DeptInputOptFragment
  )> };

export type DeptInputOptsQueryVariables = Exact<{
  where: DepartmentsWhere;
}>;


export type DeptInputOptsQuery = { __typename?: 'Query', departments: Array<(
    { __typename?: 'Department' }
    & DeptInputOptFragment
  )> };

export type EntityBusinessInputOptFragment = { __typename: 'Business', id: string, name: string, departments: Array<{ __typename: 'Department', id: string }> };

export type EntityPersonInputOptFragment = { __typename: 'Person', id: string, personName: { __typename?: 'PersonName', first: string, last: string } };

export type EntityInputOptsQueryVariables = Exact<{
  where: EntitiesWhere;
}>;


export type EntityInputOptsQuery = { __typename?: 'Query', entities: Array<(
    { __typename?: 'Person' }
    & EntityPersonInputOptFragment
  ) | (
    { __typename?: 'Business' }
    & EntityBusinessInputOptFragment
  ) | (
    { __typename?: 'Department' }
    & DeptInputOptFragment
  )> };

export type EntityInputIniValueQueryVariables = Exact<{
  where: EntitiesWhere;
}>;


export type EntityInputIniValueQuery = { __typename?: 'Query', entities: Array<(
    { __typename?: 'Person' }
    & EntityPersonInputOptFragment
  ) | (
    { __typename?: 'Business' }
    & EntityBusinessInputOptFragment
  ) | (
    { __typename?: 'Department', ancestors: Array<(
      { __typename?: 'Department' }
      & DeptInputOptFragment
    ) | (
      { __typename?: 'Business' }
      & EntityBusinessInputOptFragment
    )> }
    & DeptInputOptFragment
  )> };

export type AccountCardPayMethodInputOptFragment = { __typename: 'AccountCard', id: string, active: boolean, type: PaymentCardType, trailingDigits: string };

export type AccountOwnerPayMethodInputOpt_Person_Fragment = { __typename: 'Person', id: string, personName: { __typename?: 'PersonName', first: string, last: string } };

export type AccountOwnerPayMethodInputOpt_Business_Fragment = { __typename: 'Business', id: string, name: string };

export type AccountOwnerPayMethodInputOpt_Department_Fragment = { __typename: 'Department', id: string, name: string };

export type AccountOwnerPayMethodInputOptFragment = AccountOwnerPayMethodInputOpt_Person_Fragment | AccountOwnerPayMethodInputOpt_Business_Fragment | AccountOwnerPayMethodInputOpt_Department_Fragment;

export type AccountCheckingPayMethodInputOptFragment = { __typename: 'AccountChecking', id: string, accountNumber: string, active: boolean, name: string, cards: Array<(
    { __typename?: 'AccountCard' }
    & AccountCardPayMethodInputOptFragment
  )>, owner: (
    { __typename?: 'Person' }
    & AccountOwnerPayMethodInputOpt_Person_Fragment
  ) | (
    { __typename?: 'Business' }
    & AccountOwnerPayMethodInputOpt_Business_Fragment
  ) | (
    { __typename?: 'Department' }
    & AccountOwnerPayMethodInputOpt_Department_Fragment
  ) };

export type AccountCreditCardPayMethodInputOptFragment = { __typename: 'AccountCreditCard', id: string, active: boolean, name: string, cards: Array<(
    { __typename?: 'AccountCard' }
    & AccountCardPayMethodInputOptFragment
  )>, owner: (
    { __typename?: 'Person' }
    & AccountOwnerPayMethodInputOpt_Person_Fragment
  ) | (
    { __typename?: 'Business' }
    & AccountOwnerPayMethodInputOpt_Business_Fragment
  ) | (
    { __typename?: 'Department' }
    & AccountOwnerPayMethodInputOpt_Department_Fragment
  ) };

export type AccountPayMethodInputOptsQueryVariables = Exact<{
  where: AccountsWhere;
}>;


export type AccountPayMethodInputOptsQuery = { __typename?: 'Query', accounts: Array<(
    { __typename?: 'AccountChecking' }
    & AccountCheckingPayMethodInputOptFragment
  ) | (
    { __typename?: 'AccountCreditCard' }
    & AccountCreditCardPayMethodInputOptFragment
  )> };

export type GridEntrySrcPersonFragment = { __typename: 'Person', id: string, personName: { __typename?: 'PersonName', first: string, last: string } };

export type GridEntrySrcBusinessFragment = { __typename: 'Business', id: string, name: string };

export type GridEntrySrcDeptFragment = { __typename: 'Department', id: string, name: string };

export type GridPaymentMethodCardFragment = { __typename: 'PaymentMethodCard', card: { __typename: 'AccountCard', id: string, active: boolean, trailingDigits: string, type: PaymentCardType, account: { __typename: 'AccountChecking', id: string, name: string } | { __typename: 'AccountCreditCard', id: string, name: string } } | { __typename: 'PaymentCard', trailingDigits: string, type: PaymentCardType } };

export type GridPaymentMethodCheckFragment = { __typename: 'PaymentMethodCheck', check: { __typename: 'AccountCheck', checkNumber: string, account: { __typename: 'AccountChecking', id: string, name: string } } | { __typename: 'PaymentCheck', checkNumber: string } };

export type GridPaymentMethod_PaymentMethodCard_Fragment = (
  { __typename: 'PaymentMethodCard', currency: Currency }
  & GridPaymentMethodCardFragment
);

export type GridPaymentMethod_PaymentMethodCheck_Fragment = (
  { __typename: 'PaymentMethodCheck', currency: Currency }
  & GridPaymentMethodCheckFragment
);

export type GridPaymentMethod_PaymentMethodCash_Fragment = { __typename: 'PaymentMethodCash', currency: Currency };

export type GridPaymentMethod_PaymentMethodOnline_Fragment = { __typename: 'PaymentMethodOnline', currency: Currency };

export type GridPaymentMethod_PaymentMethodCombination_Fragment = { __typename: 'PaymentMethodCombination', currency: Currency };

export type GridPaymentMethod_PaymentMethodUnknown_Fragment = { __typename: 'PaymentMethodUnknown', currency: Currency };

export type GridPaymentMethodFragment = GridPaymentMethod_PaymentMethodCard_Fragment | GridPaymentMethod_PaymentMethodCheck_Fragment | GridPaymentMethod_PaymentMethodCash_Fragment | GridPaymentMethod_PaymentMethodOnline_Fragment | GridPaymentMethod_PaymentMethodCombination_Fragment | GridPaymentMethod_PaymentMethodUnknown_Fragment;

export type GridRefundFragment = { __typename: 'EntryRefund', id: string, date: string, description?: Maybe<string>, total: string, reconciled: boolean, deleted: boolean, paymentMethod: (
    { __typename?: 'PaymentMethodCard' }
    & GridPaymentMethod_PaymentMethodCard_Fragment
  ) | (
    { __typename?: 'PaymentMethodCheck' }
    & GridPaymentMethod_PaymentMethodCheck_Fragment
  ) | (
    { __typename?: 'PaymentMethodCash' }
    & GridPaymentMethod_PaymentMethodCash_Fragment
  ) | (
    { __typename?: 'PaymentMethodOnline' }
    & GridPaymentMethod_PaymentMethodOnline_Fragment
  ) | (
    { __typename?: 'PaymentMethodCombination' }
    & GridPaymentMethod_PaymentMethodCombination_Fragment
  ) | (
    { __typename?: 'PaymentMethodUnknown' }
    & GridPaymentMethod_PaymentMethodUnknown_Fragment
  ) };

export type GridEntryFragment = { __typename: 'Entry', id: string, date: string, description?: Maybe<string>, total: string, reconciled: boolean, deleted: boolean, dateOfRecord?: Maybe<{ __typename?: 'EntryDateOfRecord', date: string }>, department: { __typename: 'Department', id: string, name: string }, category: { __typename: 'Category', id: string, name: string, type: EntryType }, paymentMethod: (
    { __typename?: 'PaymentMethodCard' }
    & GridPaymentMethod_PaymentMethodCard_Fragment
  ) | (
    { __typename?: 'PaymentMethodCheck' }
    & GridPaymentMethod_PaymentMethodCheck_Fragment
  ) | (
    { __typename?: 'PaymentMethodCash' }
    & GridPaymentMethod_PaymentMethodCash_Fragment
  ) | (
    { __typename?: 'PaymentMethodOnline' }
    & GridPaymentMethod_PaymentMethodOnline_Fragment
  ) | (
    { __typename?: 'PaymentMethodCombination' }
    & GridPaymentMethod_PaymentMethodCombination_Fragment
  ) | (
    { __typename?: 'PaymentMethodUnknown' }
    & GridPaymentMethod_PaymentMethodUnknown_Fragment
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

export type EntryPayMethod_1Fragment_PaymentMethodCard_ = { __typename: 'PaymentMethodCard' };

export type EntryPayMethod_1Fragment_PaymentMethodCheck_ = { __typename: 'PaymentMethodCheck' };

export type EntryPayMethod_1Fragment_PaymentMethodCash_ = { __typename: 'PaymentMethodCash' };

export type EntryPayMethod_1Fragment_PaymentMethodOnline_ = { __typename: 'PaymentMethodOnline' };

export type EntryPayMethod_1Fragment_PaymentMethodCombination_ = { __typename: 'PaymentMethodCombination' };

export type EntryPayMethod_1Fragment_PaymentMethodUnknown_ = { __typename: 'PaymentMethodUnknown' };

export type EntryPayMethod_1Fragment = EntryPayMethod_1Fragment_PaymentMethodCard_ | EntryPayMethod_1Fragment_PaymentMethodCheck_ | EntryPayMethod_1Fragment_PaymentMethodCash_ | EntryPayMethod_1Fragment_PaymentMethodOnline_ | EntryPayMethod_1Fragment_PaymentMethodCombination_ | EntryPayMethod_1Fragment_PaymentMethodUnknown_;

export type Category_1Fragment = { __typename: 'Category', id: string, type: EntryType, name: string };

export type EntryDept_1Fragment = { __typename: 'Department', id: string, name: string, ancestors: Array<{ __typename: 'Department', id: string, deptName: string } | { __typename: 'Business', id: string, bizName: string }> };

export type EntryRefund_1Fragment = { __typename: 'EntryRefund', id: string, date: string, description?: Maybe<string>, total: string, reconciled: boolean, lastUpdate: string, deleted: boolean, paymentMethod: { __typename: 'PaymentMethodCard' } | { __typename: 'PaymentMethodCheck' } | { __typename: 'PaymentMethodCash' } | { __typename: 'PaymentMethodOnline' } | { __typename: 'PaymentMethodCombination' } | { __typename: 'PaymentMethodUnknown' } };

export type EntryItem_1Fragment = { __typename: 'EntryItem', id: string, total: string, units: number, description?: Maybe<string>, lastUpdate: string, deleted: boolean, category?: Maybe<(
    { __typename?: 'Category' }
    & Category_1Fragment
  )>, department?: Maybe<(
    { __typename?: 'Department' }
    & EntryDept_1Fragment
  )> };

export type Entry_1Fragment = { __typename: 'Entry', id: string, date: string, description?: Maybe<string>, total: string, deleted: boolean, lastUpdate: string, reconciled: boolean, dateOfRecord?: Maybe<{ __typename?: 'EntryDateOfRecord', date: string, overrideFiscalYear: boolean }>, department: (
    { __typename: 'Department', id: string, name: string, ancestors: Array<{ __typename: 'Department', id: string, deptName: string } | { __typename: 'Business', id: string, bizName: string }> }
    & EntryDept_1Fragment
  ), category: (
    { __typename?: 'Category' }
    & Category_1Fragment
  ), paymentMethod: (
    { __typename?: 'PaymentMethodCard' }
    & EntryPayMethod_1Fragment_PaymentMethodCard_
  ) | (
    { __typename?: 'PaymentMethodCheck' }
    & EntryPayMethod_1Fragment_PaymentMethodCheck_
  ) | (
    { __typename?: 'PaymentMethodCash' }
    & EntryPayMethod_1Fragment_PaymentMethodCash_
  ) | (
    { __typename?: 'PaymentMethodOnline' }
    & EntryPayMethod_1Fragment_PaymentMethodOnline_
  ) | (
    { __typename?: 'PaymentMethodCombination' }
    & EntryPayMethod_1Fragment_PaymentMethodCombination_
  ) | (
    { __typename?: 'PaymentMethodUnknown' }
    & EntryPayMethod_1Fragment_PaymentMethodUnknown_
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


export type UpdateEntryIniStateQuery = { __typename?: 'Query', entry?: Maybe<{ __typename: 'Entry', id: string, date: string, description?: Maybe<string>, total: string, reconciled: boolean, dateOfRecord?: Maybe<{ __typename?: 'EntryDateOfRecord', date: string, overrideFiscalYear: boolean }>, department: (
      { __typename?: 'Department' }
      & DeptEntryOptFragment
    ), category: (
      { __typename?: 'Category' }
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
    ), paymentMethod: { __typename: 'PaymentMethodCard' } | { __typename: 'PaymentMethodCheck' } | { __typename: 'PaymentMethodCash' } | { __typename: 'PaymentMethodOnline' } | { __typename: 'PaymentMethodCombination' } | { __typename: 'PaymentMethodUnknown' }, refunds: Array<{ __typename: 'EntryRefund', id: string, deleted: boolean, date: string, total: string }> }> };

export type AddEntryMutationVariables = Exact<{
  fields: EntryAddFields;
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
  paymentMethodUpdate?: Maybe<EntryUpdatePaymentMethod>;
  personAdd?: Maybe<PersonAddFields>;
  businessAdd?: Maybe<BusinessAddFields>;
}>;


export type UpdateEntryMutation = { __typename?: 'Mutation', entryUpdate: (
    { __typename?: 'Entry' }
    & Entry_1Fragment
  ) };

export type CatEntryOptsQueryVariables = Exact<{
  where: CategoriesWhere;
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
  where: AccountsWhere;
}>;


export type PayMethodEntryOptsQuery = { __typename?: 'Query', accounts: Array<{ __typename: 'AccountChecking' } | { __typename: 'AccountCreditCard' }> };

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
      { __typename?: 'Category' }
      & CatEntryOptFragment
    )> }> };

export type Entry_3Fragment = { __typename: 'Entry', id: string, total: string, date: string, items: Array<{ __typename: 'EntryItem', id: string, deleted: boolean, total: string }>, category: { __typename: 'Category', id: string, type: EntryType } };

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
  )>, entryRefund?: Maybe<{ __typename: 'EntryRefund', id: string, date: string, description?: Maybe<string>, total: string, reconciled: boolean, paymentMethod: { __typename: 'PaymentMethodCard' } | { __typename: 'PaymentMethodCheck' } | { __typename: 'PaymentMethodCash' } | { __typename: 'PaymentMethodOnline' } | { __typename: 'PaymentMethodCombination' } | { __typename: 'PaymentMethodUnknown' } }> };

export type Entry_2Fragment = { __typename: 'Entry', id: string, date: string, total: string, refunds: Array<{ __typename: 'EntryRefund', id: string, deleted: boolean, total: string }>, category: { __typename: 'Category', id: string, type: EntryType } };

export type AddEntryRefundMutationVariables = Exact<{
  id: Scalars['ID'];
  fields: EntryAddRefundFields;
}>;


export type AddEntryRefundMutation = { __typename?: 'Mutation', entryAddRefund: { __typename: 'Entry', id: string, refunds: Array<(
      { __typename?: 'EntryRefund' }
      & EntryRefund_1Fragment
    )> } };

export type UpdateRefundMutationVariables = Exact<{
  id: Scalars['ID'];
  fields: EntryUpdateRefundFields;
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
  AccountInterface: ResolversTypes['AccountChecking'] | ResolversTypes['AccountCreditCard'];
  ID: ResolverTypeWrapper<Scalars['ID']>;
  Boolean: ResolverTypeWrapper<Scalars['Boolean']>;
  String: ResolverTypeWrapper<Scalars['String']>;
  AccountCard: ResolverTypeWrapper<Omit<AccountCard, 'authorizedUsers'> & { authorizedUsers: Array<ResolversTypes['Entity']> }>;
  AccountWithCardsInterface: ResolversTypes['AccountChecking'] | ResolversTypes['AccountCreditCard'];
  AccountCheck: ResolverTypeWrapper<AccountCheck>;
  AccountCheckInput: AccountCheckInput;
  AccountChecking: ResolverTypeWrapper<Omit<AccountChecking, 'owner'> & { owner: ResolversTypes['Entity'] }>;
  AccountCreditCard: ResolverTypeWrapper<Omit<AccountCreditCard, 'owner'> & { owner: ResolversTypes['Entity'] }>;
  AccountCardsWhere: AccountCardsWhere;
  AccountType: AccountType;
  AccountsWhere: AccountsWhere;
  Query: ResolverTypeWrapper<{}>;
  AliasTarget: ResolversTypes['Category'] | ResolversTypes['Department'];
  AliasType: AliasType;
  Alias: ResolverTypeWrapper<Omit<Alias, 'target'> & { target: ResolversTypes['AliasTarget'] }>;
  AliasWhereTarget: AliasWhereTarget;
  AliasesWhere: AliasesWhere;
  BudgetOwner: ResolversTypes['Department'] | ResolversTypes['Business'];
  Budget: ResolverTypeWrapper<Omit<Budget, 'owner'> & { owner: ResolversTypes['BudgetOwner'] }>;
  BudgetsWhere: BudgetsWhere;
  Vendor: ResolverTypeWrapper<Vendor>;
  Business: ResolverTypeWrapper<Business>;
  BusinessAddFields: BusinessAddFields;
  BusinessesWhereInput: BusinessesWhereInput;
  BusinessesWhere: BusinessesWhere;
  Mutation: ResolverTypeWrapper<{}>;
  Category: ResolverTypeWrapper<Category>;
  CategoriesWhere: CategoriesWhere;
  Currency: Currency;
  DepartmentAncestor: ResolversTypes['Department'] | ResolversTypes['Business'];
  Department: ResolverTypeWrapper<Omit<Department, 'parent' | 'ancestors'> & { parent: ResolversTypes['DepartmentAncestor'], ancestors: Array<ResolversTypes['DepartmentAncestor']> }>;
  DepartmentAncestorType: DepartmentAncestorType;
  DepartmentAncestorInput: DepartmentAncestorInput;
  DepartmentsWhereAncestor: DepartmentsWhereAncestor;
  DepartmentsWhereInput: DepartmentsWhereInput;
  DepartmentAddFields: DepartmentAddFields;
  DepartmentsWhere: DepartmentsWhere;
  Entity: ResolversTypes['Person'] | ResolversTypes['Business'] | ResolversTypes['Department'];
  EntitiesWhere: EntitiesWhere;
  EntryType: EntryType;
  EntryDateOfRecord: ResolverTypeWrapper<EntryDateOfRecord>;
  EntryDateOfRecordAdd: EntryDateOfRecordAdd;
  EntryDateOfRecordUpdate: EntryDateOfRecordUpdate;
  Entry: ResolverTypeWrapper<Omit<Entry, 'source'> & { source: ResolversTypes['Entity'] }>;
  EntriesWhereSource: EntriesWhereSource;
  EntriesWhereDateOfRecord: EntriesWhereDateOfRecord;
  EntriesWhere: EntriesWhere;
  SourceType: SourceType;
  SourceInput: SourceInput;
  EntryUpdateFields: EntryUpdateFields;
  EntryAddFields: EntryAddFields;
  EntryRefund: ResolverTypeWrapper<EntryRefund>;
  EntryRefundsWhere: EntryRefundsWhere;
  EntryAddRefundFields: EntryAddRefundFields;
  EntryUpdateRefundFields: EntryUpdateRefundFields;
  EntryItem: ResolverTypeWrapper<EntryItem>;
  Int: ResolverTypeWrapper<Scalars['Int']>;
  EntryItemsWhere: EntryItemsWhere;
  EntryAddItemFields: EntryAddItemFields;
  EntryUpdateItemFields: EntryUpdateItemFields;
  EntryItemUpsertResult: ResolverTypeWrapper<EntryItemUpsertResult>;
  EntryUpdatePaymentMethod: EntryUpdatePaymentMethod;
  Subscription: ResolverTypeWrapper<{}>;
  FiscalYear: ResolverTypeWrapper<FiscalYear>;
  FiscalYearWhereHasDate: FiscalYearWhereHasDate;
  FiscalYearWhereInput: FiscalYearWhereInput;
  FiscalYearsWhere: FiscalYearsWhere;
  PaymentCardType: PaymentCardType;
  PaymentCardInterface: ResolversTypes['AccountCard'] | ResolversTypes['PaymentCard'];
  PaymentCard: ResolverTypeWrapper<PaymentCard>;
  PaymentCardInput: PaymentCardInput;
  PaymentCheckInterface: ResolversTypes['AccountCheck'] | ResolversTypes['PaymentCheck'];
  PaymentCheck: ResolverTypeWrapper<PaymentCheck>;
  PaymentCheckInput: PaymentCheckInput;
  PaymentMethodInterface: ResolversTypes['PaymentMethodCard'] | ResolversTypes['PaymentMethodCheck'] | ResolversTypes['PaymentMethodCash'] | ResolversTypes['PaymentMethodOnline'] | ResolversTypes['PaymentMethodCombination'] | ResolversTypes['PaymentMethodUnknown'];
  PaymentMethodCard: ResolverTypeWrapper<PaymentMethodCard>;
  PaymentMethodCardInput: PaymentMethodCardInput;
  PaymentMethodAccountCardInput: PaymentMethodAccountCardInput;
  PaymentMethodCheck: ResolverTypeWrapper<PaymentMethodCheck>;
  PaymentMethodCheckInput: PaymentMethodCheckInput;
  PaymentMethodAccountCheckInput: PaymentMethodAccountCheckInput;
  PaymentMethodCash: ResolverTypeWrapper<PaymentMethodCash>;
  PaymentMethodCashInput: PaymentMethodCashInput;
  PaymentMethodOnline: ResolverTypeWrapper<PaymentMethodOnline>;
  PaymentMethodOnlineInput: PaymentMethodOnlineInput;
  PaymentMethodCombination: ResolverTypeWrapper<PaymentMethodCombination>;
  PaymentMethodCombinationInput: PaymentMethodCombinationInput;
  PaymentMethodUnknown: ResolverTypeWrapper<PaymentMethodUnknown>;
  PaymentMethodUnknownInput: PaymentMethodUnknownInput;
  PaymentMethodType: PaymentMethodType;
  PaymentMethodInput: PaymentMethodInput;
  PersonName: ResolverTypeWrapper<PersonName>;
  PersonNameInput: PersonNameInput;
  PersonAddFields: PersonAddFields;
  Person: ResolverTypeWrapper<Person>;
  PeopleWhereInput: PeopleWhereInput;
  PeopleNameWhere: PeopleNameWhere;
  PeopleWhere: PeopleWhere;
  WhereRational: WhereRational;
  Date: ResolverTypeWrapper<Scalars['Date']>;
  Rational: ResolverTypeWrapper<Scalars['Rational']>;
  TypeNode: never;
  NodeChildrenType: NodeChildrenType;
  SortDirection: SortDirection;
  FilterType: FilterType;
  PaginateInput: PaginateInput;
  ByIdFilter: ByIdFilter;
  RegexOptions: RegexOptions;
  RegexFlags: RegexFlags;
  WhereId: WhereId;
  WhereTreeId: WhereTreeId;
  NodeInput: NodeInput;
  WhereNode: WhereNode;
  WhereTreeNode: WhereTreeNode;
  WhereTreeNodeInput: WhereTreeNodeInput;
  WhereRegexInput: WhereRegexInput;
  WhereRegex: WhereRegex;
  WhereDateTime: WhereDateTime;
  WhereInt: WhereInt;
  WhereDateBeta: WhereDateBeta;
  WhereDate: WhereDate;
  Source: ResolversTypes['Person'] | ResolversTypes['Business'] | ResolversTypes['Department'];
  User: ResolverTypeWrapper<User>;
  CacheControlScope: CacheControlScope;
  Upload: ResolverTypeWrapper<Scalars['Upload']>;
};

/** Mapping between all available schema types and the resolvers parents */
export type ResolversParentTypes = {
  AccountInterface: ResolversParentTypes['AccountChecking'] | ResolversParentTypes['AccountCreditCard'];
  ID: Scalars['ID'];
  Boolean: Scalars['Boolean'];
  String: Scalars['String'];
  AccountCard: Omit<AccountCard, 'authorizedUsers'> & { authorizedUsers: Array<ResolversParentTypes['Entity']> };
  AccountWithCardsInterface: ResolversParentTypes['AccountChecking'] | ResolversParentTypes['AccountCreditCard'];
  AccountCheck: AccountCheck;
  AccountCheckInput: AccountCheckInput;
  AccountChecking: Omit<AccountChecking, 'owner'> & { owner: ResolversParentTypes['Entity'] };
  AccountCreditCard: Omit<AccountCreditCard, 'owner'> & { owner: ResolversParentTypes['Entity'] };
  AccountCardsWhere: AccountCardsWhere;
  AccountsWhere: AccountsWhere;
  Query: {};
  AliasTarget: ResolversParentTypes['Category'] | ResolversParentTypes['Department'];
  Alias: Omit<Alias, 'target'> & { target: ResolversParentTypes['AliasTarget'] };
  AliasWhereTarget: AliasWhereTarget;
  AliasesWhere: AliasesWhere;
  BudgetOwner: ResolversParentTypes['Department'] | ResolversParentTypes['Business'];
  Budget: Omit<Budget, 'owner'> & { owner: ResolversParentTypes['BudgetOwner'] };
  BudgetsWhere: BudgetsWhere;
  Vendor: Vendor;
  Business: Business;
  BusinessAddFields: BusinessAddFields;
  BusinessesWhereInput: BusinessesWhereInput;
  BusinessesWhere: BusinessesWhere;
  Mutation: {};
  Category: Category;
  CategoriesWhere: CategoriesWhere;
  DepartmentAncestor: ResolversParentTypes['Department'] | ResolversParentTypes['Business'];
  Department: Omit<Department, 'parent' | 'ancestors'> & { parent: ResolversParentTypes['DepartmentAncestor'], ancestors: Array<ResolversParentTypes['DepartmentAncestor']> };
  DepartmentAncestorInput: DepartmentAncestorInput;
  DepartmentsWhereAncestor: DepartmentsWhereAncestor;
  DepartmentsWhereInput: DepartmentsWhereInput;
  DepartmentAddFields: DepartmentAddFields;
  DepartmentsWhere: DepartmentsWhere;
  Entity: ResolversParentTypes['Person'] | ResolversParentTypes['Business'] | ResolversParentTypes['Department'];
  EntitiesWhere: EntitiesWhere;
  EntryDateOfRecord: EntryDateOfRecord;
  EntryDateOfRecordAdd: EntryDateOfRecordAdd;
  EntryDateOfRecordUpdate: EntryDateOfRecordUpdate;
  Entry: Omit<Entry, 'source'> & { source: ResolversParentTypes['Entity'] };
  EntriesWhereSource: EntriesWhereSource;
  EntriesWhereDateOfRecord: EntriesWhereDateOfRecord;
  EntriesWhere: EntriesWhere;
  SourceInput: SourceInput;
  EntryUpdateFields: EntryUpdateFields;
  EntryAddFields: EntryAddFields;
  EntryRefund: EntryRefund;
  EntryRefundsWhere: EntryRefundsWhere;
  EntryAddRefundFields: EntryAddRefundFields;
  EntryUpdateRefundFields: EntryUpdateRefundFields;
  EntryItem: EntryItem;
  Int: Scalars['Int'];
  EntryItemsWhere: EntryItemsWhere;
  EntryAddItemFields: EntryAddItemFields;
  EntryUpdateItemFields: EntryUpdateItemFields;
  EntryItemUpsertResult: EntryItemUpsertResult;
  EntryUpdatePaymentMethod: EntryUpdatePaymentMethod;
  Subscription: {};
  FiscalYear: FiscalYear;
  FiscalYearWhereHasDate: FiscalYearWhereHasDate;
  FiscalYearWhereInput: FiscalYearWhereInput;
  FiscalYearsWhere: FiscalYearsWhere;
  PaymentCardInterface: ResolversParentTypes['AccountCard'] | ResolversParentTypes['PaymentCard'];
  PaymentCard: PaymentCard;
  PaymentCardInput: PaymentCardInput;
  PaymentCheckInterface: ResolversParentTypes['AccountCheck'] | ResolversParentTypes['PaymentCheck'];
  PaymentCheck: PaymentCheck;
  PaymentCheckInput: PaymentCheckInput;
  PaymentMethodInterface: ResolversParentTypes['PaymentMethodCard'] | ResolversParentTypes['PaymentMethodCheck'] | ResolversParentTypes['PaymentMethodCash'] | ResolversParentTypes['PaymentMethodOnline'] | ResolversParentTypes['PaymentMethodCombination'] | ResolversParentTypes['PaymentMethodUnknown'];
  PaymentMethodCard: PaymentMethodCard;
  PaymentMethodCardInput: PaymentMethodCardInput;
  PaymentMethodAccountCardInput: PaymentMethodAccountCardInput;
  PaymentMethodCheck: PaymentMethodCheck;
  PaymentMethodCheckInput: PaymentMethodCheckInput;
  PaymentMethodAccountCheckInput: PaymentMethodAccountCheckInput;
  PaymentMethodCash: PaymentMethodCash;
  PaymentMethodCashInput: PaymentMethodCashInput;
  PaymentMethodOnline: PaymentMethodOnline;
  PaymentMethodOnlineInput: PaymentMethodOnlineInput;
  PaymentMethodCombination: PaymentMethodCombination;
  PaymentMethodCombinationInput: PaymentMethodCombinationInput;
  PaymentMethodUnknown: PaymentMethodUnknown;
  PaymentMethodUnknownInput: PaymentMethodUnknownInput;
  PaymentMethodInput: PaymentMethodInput;
  PersonName: PersonName;
  PersonNameInput: PersonNameInput;
  PersonAddFields: PersonAddFields;
  Person: Person;
  PeopleWhereInput: PeopleWhereInput;
  PeopleNameWhere: PeopleNameWhere;
  PeopleWhere: PeopleWhere;
  WhereRational: WhereRational;
  Date: Scalars['Date'];
  Rational: Scalars['Rational'];
  TypeNode: never;
  PaginateInput: PaginateInput;
  ByIdFilter: ByIdFilter;
  WhereId: WhereId;
  WhereTreeId: WhereTreeId;
  NodeInput: NodeInput;
  WhereNode: WhereNode;
  WhereTreeNode: WhereTreeNode;
  WhereTreeNodeInput: WhereTreeNodeInput;
  WhereRegexInput: WhereRegexInput;
  WhereRegex: WhereRegex;
  WhereDateTime: WhereDateTime;
  WhereInt: WhereInt;
  WhereDateBeta: WhereDateBeta;
  WhereDate: WhereDate;
  Source: ResolversParentTypes['Person'] | ResolversParentTypes['Business'] | ResolversParentTypes['Department'];
  User: User;
  Upload: Scalars['Upload'];
};

export type CacheControlDirectiveArgs = {   maxAge?: Maybe<Scalars['Int']>;
  scope?: Maybe<CacheControlScope>; };

export type CacheControlDirectiveResolver<Result, Parent, ContextType = Context, Args = CacheControlDirectiveArgs> = DirectiveResolverFn<Result, Parent, ContextType, Args>;

export type AccountInterfaceResolvers<ContextType = Context, ParentType extends ResolversParentTypes['AccountInterface'] = ResolversParentTypes['AccountInterface']> = {
  __resolveType: TypeResolveFn<'AccountChecking' | 'AccountCreditCard', ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  active?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  currency?: Resolver<ResolversTypes['Currency'], ParentType, ContextType>;
  name?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  owner?: Resolver<ResolversTypes['Entity'], ParentType, ContextType>;
};

export type AccountCardResolvers<ContextType = Context, ParentType extends ResolversParentTypes['AccountCard'] = ResolversParentTypes['AccountCard']> = {
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  account?: Resolver<ResolversTypes['AccountWithCardsInterface'], ParentType, ContextType>;
  active?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  authorizedUsers?: Resolver<Array<ResolversTypes['Entity']>, ParentType, ContextType>;
  trailingDigits?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  type?: Resolver<ResolversTypes['PaymentCardType'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type AccountWithCardsInterfaceResolvers<ContextType = Context, ParentType extends ResolversParentTypes['AccountWithCardsInterface'] = ResolversParentTypes['AccountWithCardsInterface']> = {
  __resolveType: TypeResolveFn<'AccountChecking' | 'AccountCreditCard', ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  active?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  cards?: Resolver<Array<ResolversTypes['AccountCard']>, ParentType, ContextType>;
  currency?: Resolver<ResolversTypes['Currency'], ParentType, ContextType>;
  name?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  owner?: Resolver<ResolversTypes['Entity'], ParentType, ContextType>;
};

export type AccountCheckResolvers<ContextType = Context, ParentType extends ResolversParentTypes['AccountCheck'] = ResolversParentTypes['AccountCheck']> = {
  account?: Resolver<ResolversTypes['AccountChecking'], ParentType, ContextType>;
  checkNumber?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type AccountCheckingResolvers<ContextType = Context, ParentType extends ResolversParentTypes['AccountChecking'] = ResolversParentTypes['AccountChecking']> = {
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  accountNumber?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  active?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  cards?: Resolver<Array<ResolversTypes['AccountCard']>, ParentType, ContextType>;
  currency?: Resolver<ResolversTypes['Currency'], ParentType, ContextType>;
  name?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  owner?: Resolver<ResolversTypes['Entity'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type AccountCreditCardResolvers<ContextType = Context, ParentType extends ResolversParentTypes['AccountCreditCard'] = ResolversParentTypes['AccountCreditCard']> = {
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  active?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  cards?: Resolver<Array<ResolversTypes['AccountCard']>, ParentType, ContextType>;
  currency?: Resolver<ResolversTypes['Currency'], ParentType, ContextType>;
  name?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  owner?: Resolver<ResolversTypes['Entity'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type QueryResolvers<ContextType = Context, ParentType extends ResolversParentTypes['Query'] = ResolversParentTypes['Query']> = {
  accounts?: Resolver<Array<ResolversTypes['AccountInterface']>, ParentType, ContextType, RequireFields<QueryAccountsArgs, never>>;
  account?: Resolver<ResolversTypes['AccountInterface'], ParentType, ContextType, RequireFields<QueryAccountArgs, 'id'>>;
  accountCards?: Resolver<Array<ResolversTypes['AccountCard']>, ParentType, ContextType, RequireFields<QueryAccountCardsArgs, never>>;
  accountCard?: Resolver<ResolversTypes['AccountCard'], ParentType, ContextType, RequireFields<QueryAccountCardArgs, 'id'>>;
  alias?: Resolver<Maybe<ResolversTypes['Alias']>, ParentType, ContextType, RequireFields<QueryAliasArgs, 'id'>>;
  aliases?: Resolver<Array<ResolversTypes['Alias']>, ParentType, ContextType, RequireFields<QueryAliasesArgs, never>>;
  budgets?: Resolver<Array<ResolversTypes['Budget']>, ParentType, ContextType, RequireFields<QueryBudgetsArgs, never>>;
  budget?: Resolver<ResolversTypes['Budget'], ParentType, ContextType, RequireFields<QueryBudgetArgs, 'id'>>;
  businesses?: Resolver<Array<ResolversTypes['Business']>, ParentType, ContextType, RequireFields<QueryBusinessesArgs, never>>;
  business?: Resolver<ResolversTypes['Business'], ParentType, ContextType, RequireFields<QueryBusinessArgs, 'id'>>;
  categories?: Resolver<Array<ResolversTypes['Category']>, ParentType, ContextType, RequireFields<QueryCategoriesArgs, never>>;
  category?: Resolver<ResolversTypes['Category'], ParentType, ContextType, RequireFields<QueryCategoryArgs, 'id'>>;
  departments?: Resolver<Array<ResolversTypes['Department']>, ParentType, ContextType, RequireFields<QueryDepartmentsArgs, never>>;
  department?: Resolver<ResolversTypes['Department'], ParentType, ContextType, RequireFields<QueryDepartmentArgs, 'id'>>;
  entities?: Resolver<Array<ResolversTypes['Entity']>, ParentType, ContextType, RequireFields<QueryEntitiesArgs, 'where'>>;
  entries?: Resolver<Array<ResolversTypes['Entry']>, ParentType, ContextType, RequireFields<QueryEntriesArgs, never>>;
  entry?: Resolver<Maybe<ResolversTypes['Entry']>, ParentType, ContextType, RequireFields<QueryEntryArgs, 'id'>>;
  entryRefund?: Resolver<Maybe<ResolversTypes['EntryRefund']>, ParentType, ContextType, RequireFields<QueryEntryRefundArgs, 'id'>>;
  entryItem?: Resolver<Maybe<ResolversTypes['EntryItem']>, ParentType, ContextType, RequireFields<QueryEntryItemArgs, 'id'>>;
  fiscalYears?: Resolver<Array<ResolversTypes['FiscalYear']>, ParentType, ContextType, RequireFields<QueryFiscalYearsArgs, never>>;
  fiscalYear?: Resolver<ResolversTypes['FiscalYear'], ParentType, ContextType, RequireFields<QueryFiscalYearArgs, 'id'>>;
  people?: Resolver<Array<ResolversTypes['Person']>, ParentType, ContextType, RequireFields<QueryPeopleArgs, never>>;
  person?: Resolver<ResolversTypes['Person'], ParentType, ContextType, RequireFields<QueryPersonArgs, 'id'>>;
  sources?: Resolver<Array<ResolversTypes['Source']>, ParentType, ContextType, RequireFields<QuerySourcesArgs, 'searchByName'>>;
};

export type AliasTargetResolvers<ContextType = Context, ParentType extends ResolversParentTypes['AliasTarget'] = ResolversParentTypes['AliasTarget']> = {
  __resolveType: TypeResolveFn<'Category' | 'Department', ParentType, ContextType>;
};

export type AliasResolvers<ContextType = Context, ParentType extends ResolversParentTypes['Alias'] = ResolversParentTypes['Alias']> = {
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  target?: Resolver<ResolversTypes['AliasTarget'], ParentType, ContextType>;
  name?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  type?: Resolver<ResolversTypes['AliasType'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

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

export type VendorResolvers<ContextType = Context, ParentType extends ResolversParentTypes['Vendor'] = ResolversParentTypes['Vendor']> = {
  approved?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  vendorId?: Resolver<Maybe<ResolversTypes['ID']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type BusinessResolvers<ContextType = Context, ParentType extends ResolversParentTypes['Business'] = ResolversParentTypes['Business']> = {
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  name?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  budgets?: Resolver<Array<ResolversTypes['Budget']>, ParentType, ContextType>;
  departments?: Resolver<Array<ResolversTypes['Department']>, ParentType, ContextType, RequireFields<BusinessDepartmentsArgs, 'root'>>;
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
  addPerson?: Resolver<ResolversTypes['Person'], ParentType, ContextType, RequireFields<MutationAddPersonArgs, 'fields'>>;
};

export type CategoryResolvers<ContextType = Context, ParentType extends ResolversParentTypes['Category'] = ResolversParentTypes['Category']> = {
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  name?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  type?: Resolver<ResolversTypes['EntryType'], ParentType, ContextType>;
  parent?: Resolver<Maybe<ResolversTypes['Category']>, ParentType, ContextType>;
  children?: Resolver<Array<ResolversTypes['Category']>, ParentType, ContextType>;
  aliases?: Resolver<Array<ResolversTypes['Alias']>, ParentType, ContextType>;
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
  children?: Resolver<Array<ResolversTypes['Department']>, ParentType, ContextType>;
  ancestors?: Resolver<Array<ResolversTypes['DepartmentAncestor']>, ParentType, ContextType>;
  descendants?: Resolver<Array<ResolversTypes['Department']>, ParentType, ContextType>;
  virtualRoot?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  aliases?: Resolver<Array<ResolversTypes['Alias']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type EntityResolvers<ContextType = Context, ParentType extends ResolversParentTypes['Entity'] = ResolversParentTypes['Entity']> = {
  __resolveType: TypeResolveFn<'Person' | 'Business' | 'Department', ParentType, ContextType>;
};

export type EntryDateOfRecordResolvers<ContextType = Context, ParentType extends ResolversParentTypes['EntryDateOfRecord'] = ResolversParentTypes['EntryDateOfRecord']> = {
  date?: Resolver<ResolversTypes['Date'], ParentType, ContextType>;
  overrideFiscalYear?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type EntryResolvers<ContextType = Context, ParentType extends ResolversParentTypes['Entry'] = ResolversParentTypes['Entry']> = {
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  category?: Resolver<ResolversTypes['Category'], ParentType, ContextType>;
  date?: Resolver<ResolversTypes['Date'], ParentType, ContextType>;
  dateOfRecord?: Resolver<Maybe<ResolversTypes['EntryDateOfRecord']>, ParentType, ContextType>;
  deleted?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  department?: Resolver<ResolversTypes['Department'], ParentType, ContextType>;
  description?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  fiscalYear?: Resolver<ResolversTypes['FiscalYear'], ParentType, ContextType>;
  items?: Resolver<Array<ResolversTypes['EntryItem']>, ParentType, ContextType>;
  lastUpdate?: Resolver<ResolversTypes['Date'], ParentType, ContextType>;
  paymentMethod?: Resolver<ResolversTypes['PaymentMethodInterface'], ParentType, ContextType>;
  reconciled?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  refunds?: Resolver<Array<ResolversTypes['EntryRefund']>, ParentType, ContextType>;
  source?: Resolver<ResolversTypes['Entity'], ParentType, ContextType>;
  total?: Resolver<ResolversTypes['Rational'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type EntryRefundResolvers<ContextType = Context, ParentType extends ResolversParentTypes['EntryRefund'] = ResolversParentTypes['EntryRefund']> = {
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  date?: Resolver<ResolversTypes['Date'], ParentType, ContextType>;
  deleted?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  description?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  lastUpdate?: Resolver<ResolversTypes['Date'], ParentType, ContextType>;
  paymentMethod?: Resolver<ResolversTypes['PaymentMethodInterface'], ParentType, ContextType>;
  reconciled?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  total?: Resolver<ResolversTypes['Rational'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type EntryItemResolvers<ContextType = Context, ParentType extends ResolversParentTypes['EntryItem'] = ResolversParentTypes['EntryItem']> = {
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  category?: Resolver<Maybe<ResolversTypes['Category']>, ParentType, ContextType>;
  deleted?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  department?: Resolver<Maybe<ResolversTypes['Department']>, ParentType, ContextType>;
  description?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  lastUpdate?: Resolver<ResolversTypes['Date'], ParentType, ContextType>;
  total?: Resolver<ResolversTypes['Rational'], ParentType, ContextType>;
  units?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
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

export type PaymentCardInterfaceResolvers<ContextType = Context, ParentType extends ResolversParentTypes['PaymentCardInterface'] = ResolversParentTypes['PaymentCardInterface']> = {
  __resolveType: TypeResolveFn<'AccountCard' | 'PaymentCard', ParentType, ContextType>;
  trailingDigits?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  type?: Resolver<ResolversTypes['PaymentCardType'], ParentType, ContextType>;
};

export type PaymentCardResolvers<ContextType = Context, ParentType extends ResolversParentTypes['PaymentCard'] = ResolversParentTypes['PaymentCard']> = {
  trailingDigits?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  type?: Resolver<ResolversTypes['PaymentCardType'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type PaymentCheckInterfaceResolvers<ContextType = Context, ParentType extends ResolversParentTypes['PaymentCheckInterface'] = ResolversParentTypes['PaymentCheckInterface']> = {
  __resolveType: TypeResolveFn<'AccountCheck' | 'PaymentCheck', ParentType, ContextType>;
  checkNumber?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
};

export type PaymentCheckResolvers<ContextType = Context, ParentType extends ResolversParentTypes['PaymentCheck'] = ResolversParentTypes['PaymentCheck']> = {
  checkNumber?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type PaymentMethodInterfaceResolvers<ContextType = Context, ParentType extends ResolversParentTypes['PaymentMethodInterface'] = ResolversParentTypes['PaymentMethodInterface']> = {
  __resolveType: TypeResolveFn<'PaymentMethodCard' | 'PaymentMethodCheck' | 'PaymentMethodCash' | 'PaymentMethodOnline' | 'PaymentMethodCombination' | 'PaymentMethodUnknown', ParentType, ContextType>;
  currency?: Resolver<ResolversTypes['Currency'], ParentType, ContextType>;
};

export type PaymentMethodCardResolvers<ContextType = Context, ParentType extends ResolversParentTypes['PaymentMethodCard'] = ResolversParentTypes['PaymentMethodCard']> = {
  card?: Resolver<ResolversTypes['PaymentCardInterface'], ParentType, ContextType>;
  currency?: Resolver<ResolversTypes['Currency'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type PaymentMethodCheckResolvers<ContextType = Context, ParentType extends ResolversParentTypes['PaymentMethodCheck'] = ResolversParentTypes['PaymentMethodCheck']> = {
  currency?: Resolver<ResolversTypes['Currency'], ParentType, ContextType>;
  check?: Resolver<ResolversTypes['PaymentCheckInterface'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type PaymentMethodCashResolvers<ContextType = Context, ParentType extends ResolversParentTypes['PaymentMethodCash'] = ResolversParentTypes['PaymentMethodCash']> = {
  currency?: Resolver<ResolversTypes['Currency'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type PaymentMethodOnlineResolvers<ContextType = Context, ParentType extends ResolversParentTypes['PaymentMethodOnline'] = ResolversParentTypes['PaymentMethodOnline']> = {
  currency?: Resolver<ResolversTypes['Currency'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type PaymentMethodCombinationResolvers<ContextType = Context, ParentType extends ResolversParentTypes['PaymentMethodCombination'] = ResolversParentTypes['PaymentMethodCombination']> = {
  currency?: Resolver<ResolversTypes['Currency'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type PaymentMethodUnknownResolvers<ContextType = Context, ParentType extends ResolversParentTypes['PaymentMethodUnknown'] = ResolversParentTypes['PaymentMethodUnknown']> = {
  currency?: Resolver<ResolversTypes['Currency'], ParentType, ContextType>;
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

export type TypeNodeResolvers<ContextType = Context, ParentType extends ResolversParentTypes['TypeNode'] = ResolversParentTypes['TypeNode']> = {
  __resolveType: TypeResolveFn<null, ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  name?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  parent?: Resolver<Maybe<ResolversTypes['TypeNode']>, ParentType, ContextType>;
  children?: Resolver<Array<ResolversTypes['TypeNode']>, ParentType, ContextType>;
};

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
  AccountInterface?: AccountInterfaceResolvers<ContextType>;
  AccountCard?: AccountCardResolvers<ContextType>;
  AccountWithCardsInterface?: AccountWithCardsInterfaceResolvers<ContextType>;
  AccountCheck?: AccountCheckResolvers<ContextType>;
  AccountChecking?: AccountCheckingResolvers<ContextType>;
  AccountCreditCard?: AccountCreditCardResolvers<ContextType>;
  Query?: QueryResolvers<ContextType>;
  AliasTarget?: AliasTargetResolvers<ContextType>;
  Alias?: AliasResolvers<ContextType>;
  BudgetOwner?: BudgetOwnerResolvers<ContextType>;
  Budget?: BudgetResolvers<ContextType>;
  Vendor?: VendorResolvers<ContextType>;
  Business?: BusinessResolvers<ContextType>;
  Mutation?: MutationResolvers<ContextType>;
  Category?: CategoryResolvers<ContextType>;
  DepartmentAncestor?: DepartmentAncestorResolvers<ContextType>;
  Department?: DepartmentResolvers<ContextType>;
  Entity?: EntityResolvers<ContextType>;
  EntryDateOfRecord?: EntryDateOfRecordResolvers<ContextType>;
  Entry?: EntryResolvers<ContextType>;
  EntryRefund?: EntryRefundResolvers<ContextType>;
  EntryItem?: EntryItemResolvers<ContextType>;
  EntryItemUpsertResult?: EntryItemUpsertResultResolvers<ContextType>;
  Subscription?: SubscriptionResolvers<ContextType>;
  FiscalYear?: FiscalYearResolvers<ContextType>;
  PaymentCardInterface?: PaymentCardInterfaceResolvers<ContextType>;
  PaymentCard?: PaymentCardResolvers<ContextType>;
  PaymentCheckInterface?: PaymentCheckInterfaceResolvers<ContextType>;
  PaymentCheck?: PaymentCheckResolvers<ContextType>;
  PaymentMethodInterface?: PaymentMethodInterfaceResolvers<ContextType>;
  PaymentMethodCard?: PaymentMethodCardResolvers<ContextType>;
  PaymentMethodCheck?: PaymentMethodCheckResolvers<ContextType>;
  PaymentMethodCash?: PaymentMethodCashResolvers<ContextType>;
  PaymentMethodOnline?: PaymentMethodOnlineResolvers<ContextType>;
  PaymentMethodCombination?: PaymentMethodCombinationResolvers<ContextType>;
  PaymentMethodUnknown?: PaymentMethodUnknownResolvers<ContextType>;
  PersonName?: PersonNameResolvers<ContextType>;
  Person?: PersonResolvers<ContextType>;
  Date?: GraphQLScalarType;
  Rational?: GraphQLScalarType;
  TypeNode?: TypeNodeResolvers<ContextType>;
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