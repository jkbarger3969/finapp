import { GraphQLResolveInfo, GraphQLScalarType, GraphQLScalarTypeConfig } from 'graphql';
import { Context } from './types';
export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
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
};

export type AccountCard = Aliasable & PaymentCardInterface & {
  __typename?: 'AccountCard';
  account: AccountChecking | AccountCreditCard;
  active: Scalars['Boolean'];
  aliases: Array<Alias>;
  authorizedUsers: Array<Entity>;
  id: Scalars['ID'];
  trailingDigits: Scalars['String'];
  type: PaymentCardType;
};


export type AccountCardAliasesArgs = {
  where?: InputMaybe<AliasesWhere>;
};

export type AccountCardsWhere = {
  account?: InputMaybe<AccountsWhere>;
  active?: InputMaybe<Scalars['Boolean']>;
  and?: InputMaybe<Array<AccountCardsWhere>>;
  authorizedUsers?: InputMaybe<EntitiesWhere>;
  id?: InputMaybe<WhereId>;
  nor?: InputMaybe<Array<AccountCardsWhere>>;
  or?: InputMaybe<Array<AccountCardsWhere>>;
  trailingDigits?: InputMaybe<WhereRegex>;
  type?: InputMaybe<PaymentCardType>;
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
  accountNumber: Scalars['String'];
  active: Scalars['Boolean'];
  cards: Array<AccountCard>;
  currency: Currency;
  id: Scalars['ID'];
  name: Scalars['String'];
  owner: Entity;
};

export type AccountCreditCard = AccountInterface & AccountWithCardsInterface & {
  __typename?: 'AccountCreditCard';
  active: Scalars['Boolean'];
  cards: Array<AccountCard>;
  currency: Currency;
  id: Scalars['ID'];
  name: Scalars['String'];
  owner: Entity;
};

export type AccountInterface = {
  active: Scalars['Boolean'];
  currency: Currency;
  id: Scalars['ID'];
  name: Scalars['String'];
  owner: Entity;
};

export enum AccountType {
  Checking = 'CHECKING',
  CreditCard = 'CREDIT_CARD'
}

export type AccountWithCardsInterface = {
  active: Scalars['Boolean'];
  cards: Array<AccountCard>;
  currency: Currency;
  id: Scalars['ID'];
  name: Scalars['String'];
  owner: Entity;
};

export type AccountsWhere = {
  accountNumber?: InputMaybe<WhereRegex>;
  accountType?: InputMaybe<AccountType>;
  active?: InputMaybe<Scalars['Boolean']>;
  and?: InputMaybe<Array<AccountsWhere>>;
  cards?: InputMaybe<AccountCardsWhere>;
  id?: InputMaybe<WhereId>;
  name?: InputMaybe<WhereRegex>;
  nor?: InputMaybe<Array<AccountsWhere>>;
  or?: InputMaybe<Array<AccountsWhere>>;
  owner?: InputMaybe<EntitiesWhere>;
};

export type AddNewEntryPayload = {
  __typename?: 'AddNewEntryPayload';
  newEntry: Entry;
};

export type AddNewEntryRefundPayload = {
  __typename?: 'AddNewEntryRefundPayload';
  newEntryRefund: EntryRefund;
};

export type AddNewPersonPayload = {
  __typename?: 'AddNewPersonPayload';
  newPerson: Person;
};

export type Alias = {
  __typename?: 'Alias';
  id: Scalars['ID'];
  name: Scalars['String'];
};

export type Aliasable = {
  aliases: Array<Alias>;
};


export type AliasableAliasesArgs = {
  where?: InputMaybe<AliasesWhere>;
};

export type AliasesWhere = {
  id?: InputMaybe<WhereId>;
};

export type Budget = {
  __typename?: 'Budget';
  amount: Scalars['Rational'];
  fiscalYear: FiscalYear;
  id: Scalars['ID'];
  owner: BudgetOwner;
};

export type BudgetOwner = Business | Department;

export type BudgetsWhere = {
  amount?: InputMaybe<WhereRational>;
  and?: InputMaybe<Array<BudgetsWhere>>;
  fiscalYear?: InputMaybe<FiscalYearsWhere>;
  id?: InputMaybe<WhereId>;
  nor?: InputMaybe<Array<BudgetsWhere>>;
  or?: InputMaybe<Array<BudgetsWhere>>;
  owner?: InputMaybe<WhereNode>;
};

export type Business = {
  __typename?: 'Business';
  budgets: Array<Budget>;
  /**
   * When root is `true`, only departments who's direct parent is the the Business
   * are returned.
   */
  departments: Array<Department>;
  id: Scalars['ID'];
  name: Scalars['String'];
  vendor?: Maybe<Vendor>;
};


export type BusinessDepartmentsArgs = {
  root?: InputMaybe<Scalars['Boolean']>;
};

export type BusinessesWhere = {
  and?: InputMaybe<Array<BusinessesWhere>>;
  id?: InputMaybe<WhereId>;
  name?: InputMaybe<WhereRegex>;
  nor?: InputMaybe<Array<BusinessesWhere>>;
  or?: InputMaybe<Array<BusinessesWhere>>;
};

export type CategoriesWhere = {
  active?: InputMaybe<Scalars['Boolean']>;
  and?: InputMaybe<Array<CategoriesWhere>>;
  id?: InputMaybe<WhereTreeId>;
  name?: InputMaybe<WhereRegex>;
  nor?: InputMaybe<Array<CategoriesWhere>>;
  or?: InputMaybe<Array<CategoriesWhere>>;
  parent?: InputMaybe<WhereId>;
  /** Root Categories i.e. NO parent. */
  root?: InputMaybe<Scalars['Boolean']>;
  type?: InputMaybe<EntryType>;
};

export type Category = {
  __typename?: 'Category';
  active: Scalars['Boolean'];
  aliases: Array<Alias>;
  ancestors: Array<Category>;
  children: Array<Category>;
  id: Scalars['ID'];
  name: Scalars['String'];
  parent?: Maybe<Category>;
  type: EntryType;
};

export enum Currency {
  Usd = 'USD'
}

export type DeleteEntryPayload = {
  __typename?: 'DeleteEntryPayload';
  deletedEntry: Entry;
};

export type DeleteEntryRefundPayload = {
  __typename?: 'DeleteEntryRefundPayload';
  deletedEntryRefund: EntryRefund;
};

export type Department = {
  __typename?: 'Department';
  aliases: Array<Alias>;
  ancestors: Array<DepartmentAncestor>;
  budgets: Array<Budget>;
  business: Business;
  children: Array<Department>;
  code?: Maybe<Scalars['String']>;
  descendants: Array<Department>;
  id: Scalars['ID'];
  name: Scalars['String'];
  parent: DepartmentAncestor;
  virtualRoot?: Maybe<Scalars['Boolean']>;
};


export type DepartmentAncestorsArgs = {
  root?: InputMaybe<DepartmentsWhere>;
};

export type DepartmentAncestor = Business | Department;

export type DepartmentsWhere = {
  and?: InputMaybe<Array<DepartmentsWhere>>;
  /** Matches all departments that are a decedents of the business. */
  business?: InputMaybe<Scalars['ID']>;
  code?: InputMaybe<Scalars['String']>;
  id?: InputMaybe<WhereTreeId>;
  name?: InputMaybe<WhereRegex>;
  nor?: InputMaybe<Array<DepartmentsWhere>>;
  or?: InputMaybe<Array<DepartmentsWhere>>;
  parent?: InputMaybe<WhereNode>;
};

export type EntitiesWhere = {
  businesses?: InputMaybe<BusinessesWhere>;
  departments?: InputMaybe<DepartmentsWhere>;
  people?: InputMaybe<PeopleWhere>;
};

export type Entity = Business | Department | Person;

export type EntityInput = {
  id: Scalars['ID'];
  type: EntityType;
};

export enum EntityType {
  Business = 'BUSINESS',
  Department = 'DEPARTMENT',
  Person = 'PERSON'
}

export type EntriesWhere = {
  and?: InputMaybe<Array<EntriesWhere>>;
  category?: InputMaybe<CategoriesWhere>;
  date?: InputMaybe<WhereDate>;
  dateOfRecord?: InputMaybe<EntriesWhereDateOfRecord>;
  deleted?: InputMaybe<Scalars['Boolean']>;
  department?: InputMaybe<DepartmentsWhere>;
  description?: InputMaybe<WhereRegex>;
  fiscalYear?: InputMaybe<FiscalYearsWhere>;
  id?: InputMaybe<WhereId>;
  items?: InputMaybe<EntryItemsWhere>;
  lastUpdate?: InputMaybe<WhereDate>;
  nor?: InputMaybe<Array<EntriesWhere>>;
  or?: InputMaybe<Array<EntriesWhere>>;
  reconciled?: InputMaybe<Scalars['Boolean']>;
  refunds?: InputMaybe<EntryRefundsWhere>;
  source?: InputMaybe<EntriesWhereSource>;
  total?: InputMaybe<WhereRational>;
  type?: InputMaybe<EntryType>;
};

export type EntriesWhereDateOfRecord = {
  date?: InputMaybe<WhereDate>;
  overrideFiscalYear?: InputMaybe<Scalars['Boolean']>;
};

export type EntriesWhereSource = {
  businesses?: InputMaybe<BusinessesWhere>;
  departments?: InputMaybe<DepartmentsWhere>;
  people?: InputMaybe<PeopleWhere>;
};

export type Entry = {
  __typename?: 'Entry';
  category: Category;
  date: Scalars['Date'];
  dateOfRecord?: Maybe<EntryDateOfRecord>;
  deleted: Scalars['Boolean'];
  department: Department;
  description?: Maybe<Scalars['String']>;
  fiscalYear: FiscalYear;
  id: Scalars['ID'];
  items: Array<EntryItem>;
  lastUpdate: Scalars['Date'];
  paymentMethod: PaymentMethodCard | PaymentMethodCash | PaymentMethodCheck | PaymentMethodCombination | PaymentMethodOnline | PaymentMethodUnknown;
  reconciled: Scalars['Boolean'];
  refunds: Array<EntryRefund>;
  source: Entity;
  total: Scalars['Rational'];
};

/** `Entry.source` value. */
export type EntryDateOfRecord = {
  __typename?: 'EntryDateOfRecord';
  date: Scalars['Date'];
  overrideFiscalYear: Scalars['Boolean'];
};

export type EntryItem = {
  __typename?: 'EntryItem';
  category?: Maybe<Category>;
  deleted: Scalars['Boolean'];
  department?: Maybe<Department>;
  description?: Maybe<Scalars['String']>;
  id: Scalars['ID'];
  lastUpdate: Scalars['Date'];
  total: Scalars['Rational'];
  units: Scalars['Int'];
};

export type EntryItemsWhere = {
  and?: InputMaybe<Array<EntryItemsWhere>>;
  category?: InputMaybe<CategoriesWhere>;
  deleted?: InputMaybe<Scalars['Boolean']>;
  department?: InputMaybe<DepartmentsWhere>;
  id?: InputMaybe<WhereId>;
  lastUpdate?: InputMaybe<WhereDate>;
  nor?: InputMaybe<Array<EntryItemsWhere>>;
  or?: InputMaybe<Array<EntryItemsWhere>>;
  total?: InputMaybe<WhereRational>;
  units?: InputMaybe<WhereInt>;
};

export type EntryRefund = {
  __typename?: 'EntryRefund';
  date: Scalars['Date'];
  dateOfRecord?: Maybe<EntryDateOfRecord>;
  deleted: Scalars['Boolean'];
  description?: Maybe<Scalars['String']>;
  /** `Entry` associated with `EntryRefund` */
  entry: Entry;
  fiscalYear: FiscalYear;
  id: Scalars['ID'];
  lastUpdate: Scalars['Date'];
  paymentMethod: PaymentMethodCard | PaymentMethodCash | PaymentMethodCheck | PaymentMethodCombination | PaymentMethodOnline | PaymentMethodUnknown;
  reconciled: Scalars['Boolean'];
  total: Scalars['Rational'];
};

export type EntryRefundsWhere = {
  and?: InputMaybe<Array<EntryRefundsWhere>>;
  date?: InputMaybe<WhereDate>;
  dateOfRecord?: InputMaybe<EntriesWhereDateOfRecord>;
  deleted?: InputMaybe<Scalars['Boolean']>;
  fiscalYear?: InputMaybe<FiscalYearsWhere>;
  id?: InputMaybe<WhereId>;
  lastUpdate?: InputMaybe<WhereDate>;
  nor?: InputMaybe<Array<EntryRefundsWhere>>;
  or?: InputMaybe<Array<EntryRefundsWhere>>;
  reconciled?: InputMaybe<Scalars['Boolean']>;
  total?: InputMaybe<WhereRational>;
};

export enum EntryType {
  Credit = 'CREDIT',
  Debit = 'DEBIT'
}

export type FiscalYear = {
  __typename?: 'FiscalYear';
  begin: Scalars['Date'];
  end: Scalars['Date'];
  id: Scalars['ID'];
  name: Scalars['String'];
};

export type FiscalYearsWhere = {
  and?: InputMaybe<Array<FiscalYearsWhere>>;
  /**
   * A FiscalYear is the set of all dates in the interval [begin, end).
   *   eq: A fiscal year that contains the date.
   *   ne: Any fiscal year that does NOT contain the date.
   *   gt: Any fiscal year that begins after the date.
   *   gte: Any fiscal year that contains the date or begins after the date.
   *   lt: Any fiscal year that ends on or before the date.
   *   lte: Any fiscal year that contains the date or ends on or before the date.
   */
  date?: InputMaybe<WhereDate>;
  id?: InputMaybe<WhereId>;
  name?: InputMaybe<WhereRegex>;
  nor?: InputMaybe<Array<FiscalYearsWhere>>;
  or?: InputMaybe<Array<FiscalYearsWhere>>;
};

export type Mutation = {
  __typename?: 'Mutation';
  addNewBusiness: Business;
  addNewEntry: AddNewEntryPayload;
  addNewEntryRefund: AddNewEntryRefundPayload;
  addNewPerson: AddNewPersonPayload;
  deleteEntry: DeleteEntryPayload;
  deleteEntryRefund: DeleteEntryRefundPayload;
  reconcileEntries: ReconcileEntriesPayload;
  updateEntry: UpdateEntryPayload;
  updateEntryRefund: UpdateEntryRefundPayload;
};


export type MutationAddNewBusinessArgs = {
  input: NewBusiness;
};


export type MutationAddNewEntryArgs = {
  input: NewEntry;
};


export type MutationAddNewEntryRefundArgs = {
  input: NewEntryRefund;
};


export type MutationAddNewPersonArgs = {
  input: NewPerson;
};


export type MutationDeleteEntryArgs = {
  id: Scalars['ID'];
};


export type MutationDeleteEntryRefundArgs = {
  id: Scalars['ID'];
};


export type MutationReconcileEntriesArgs = {
  input?: InputMaybe<ReconcileEntries>;
};


export type MutationUpdateEntryArgs = {
  input: UpdateEntry;
};


export type MutationUpdateEntryRefundArgs = {
  input: UpdateEntryRefund;
};

export type NewAlias = {
  name: Scalars['String'];
  type: Scalars['String'];
};

export type NewBusiness = {
  name: Scalars['String'];
};

export type NewEntry = {
  category: Scalars['ID'];
  date: Scalars['Date'];
  dateOfRecord?: InputMaybe<NewEntryDateOfRecord>;
  department: Scalars['ID'];
  description?: InputMaybe<Scalars['String']>;
  paymentMethod: UpsertPaymentMethod;
  reconciled?: InputMaybe<Scalars['Boolean']>;
  source: UpsertEntrySource;
  total: Scalars['Rational'];
};

/** `NewEntry.dateOfRecord` input. */
export type NewEntryDateOfRecord = {
  date: Scalars['Date'];
  overrideFiscalYear: Scalars['Boolean'];
};

export type NewEntryRefund = {
  date: Scalars['Date'];
  dateOfRecord?: InputMaybe<NewEntryDateOfRecord>;
  description?: InputMaybe<Scalars['String']>;
  entry: Scalars['ID'];
  paymentMethod: UpsertPaymentMethod;
  reconciled?: InputMaybe<Scalars['Boolean']>;
  total: Scalars['Rational'];
};

export type NewPerson = {
  email?: InputMaybe<Scalars['String']>;
  name: PersonNameInput;
  phone?: InputMaybe<Scalars['String']>;
};

export type NodeInput = {
  id: Scalars['ID'];
  type: Scalars['String'];
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

export type PaymentCardInterface = {
  trailingDigits: Scalars['String'];
  type: PaymentCardType;
};

export enum PaymentCardType {
  AmericanExpress = 'AMERICAN_EXPRESS',
  Discover = 'DISCOVER',
  MasterCard = 'MASTER_CARD',
  Visa = 'VISA'
}

export type PaymentCheck = PaymentCheckInterface & {
  __typename?: 'PaymentCheck';
  checkNumber: Scalars['String'];
};

export type PaymentCheckInput = {
  checkNumber: Scalars['String'];
};

export type PaymentCheckInterface = {
  checkNumber: Scalars['String'];
};

export type PaymentMethodAccountCardInput = {
  /** id from AccountCard */
  card: Scalars['ID'];
  currency: Currency;
};

export type PaymentMethodAccountCheckInput = {
  check: AccountCheckInput;
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

export type PaymentMethodCash = PaymentMethodInterface & {
  __typename?: 'PaymentMethodCash';
  currency: Currency;
};

export type PaymentMethodCashInput = {
  currency: Currency;
};

export type PaymentMethodCheck = PaymentMethodInterface & {
  __typename?: 'PaymentMethodCheck';
  check: AccountCheck | PaymentCheck;
  currency: Currency;
};

export type PaymentMethodCheckInput = {
  check: PaymentCheckInput;
  currency: Currency;
};

export type PaymentMethodCombination = PaymentMethodInterface & {
  __typename?: 'PaymentMethodCombination';
  currency: Currency;
};

export type PaymentMethodCombinationInput = {
  currency: Currency;
};

export type PaymentMethodInterface = {
  currency: Currency;
};

export type PaymentMethodOnline = PaymentMethodInterface & {
  __typename?: 'PaymentMethodOnline';
  currency: Currency;
};

export type PaymentMethodOnlineInput = {
  currency: Currency;
};

export enum PaymentMethodType {
  Card = 'CARD',
  Cash = 'CASH',
  Check = 'CHECK',
  Combination = 'COMBINATION',
  Online = 'ONLINE',
  Unknown = 'UNKNOWN'
}

export type PaymentMethodUnknown = PaymentMethodInterface & {
  __typename?: 'PaymentMethodUnknown';
  currency: Currency;
};

export type PaymentMethodUnknownInput = {
  currency: Currency;
};

export type PeopleNameWhere = {
  first?: InputMaybe<WhereRegex>;
  last?: InputMaybe<WhereRegex>;
};

export type PeopleWhere = {
  and?: InputMaybe<Array<PeopleWhere>>;
  id?: InputMaybe<WhereId>;
  name?: InputMaybe<PeopleNameWhere>;
  nor?: InputMaybe<Array<PeopleWhere>>;
  or?: InputMaybe<Array<PeopleWhere>>;
};

export type Person = {
  __typename?: 'Person';
  email?: Maybe<Scalars['String']>;
  id: Scalars['ID'];
  name: PersonName;
  phone?: Maybe<Scalars['String']>;
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
  account: AccountChecking | AccountCreditCard;
  accountCard: AccountCard;
  accountCards: Array<AccountCard>;
  accounts: Array<AccountChecking | AccountCreditCard>;
  budget: Budget;
  budgets: Array<Budget>;
  business: Business;
  businesses: Array<Business>;
  categories: Array<Category>;
  category: Category;
  department: Department;
  departments: Array<Department>;
  entities: Array<Entity>;
  /**
   * filterRefunds: filter refunds against `where` argument by mapping the refund onto it's entry and running the `EntriesWhere` filter.
   * NOTE: A `EntryRefund` is a subset of an `Entry`.  Excludes `EntriesWhere.refunds` in refund matching.
   */
  entries: Array<Entry>;
  entry?: Maybe<Entry>;
  entryItem?: Maybe<EntryItem>;
  entryRefund?: Maybe<EntryRefund>;
  entryRefunds: Array<EntryRefund>;
  fiscalYear: FiscalYear;
  fiscalYears: Array<FiscalYear>;
  people: Array<Person>;
  person: Person;
  sources: Array<Source>;
};


export type QueryAccountArgs = {
  id: Scalars['ID'];
};


export type QueryAccountCardArgs = {
  id: Scalars['ID'];
};


export type QueryAccountCardsArgs = {
  where?: InputMaybe<AccountCardsWhere>;
};


export type QueryAccountsArgs = {
  where?: InputMaybe<AccountsWhere>;
};


export type QueryBudgetArgs = {
  id: Scalars['ID'];
};


export type QueryBudgetsArgs = {
  where?: InputMaybe<BudgetsWhere>;
};


export type QueryBusinessArgs = {
  id: Scalars['ID'];
};


export type QueryBusinessesArgs = {
  where?: InputMaybe<BusinessesWhere>;
};


export type QueryCategoriesArgs = {
  where?: InputMaybe<CategoriesWhere>;
};


export type QueryCategoryArgs = {
  id: Scalars['ID'];
};


export type QueryDepartmentArgs = {
  id: Scalars['ID'];
};


export type QueryDepartmentsArgs = {
  where?: InputMaybe<DepartmentsWhere>;
};


export type QueryEntitiesArgs = {
  where: EntitiesWhere;
};


export type QueryEntriesArgs = {
  filterRefunds?: InputMaybe<Scalars['Boolean']>;
  where?: InputMaybe<EntriesWhere>;
};


export type QueryEntryArgs = {
  id: Scalars['ID'];
};


export type QueryEntryItemArgs = {
  id: Scalars['ID'];
};


export type QueryEntryRefundArgs = {
  id: Scalars['ID'];
};


export type QueryEntryRefundsArgs = {
  entriesWhere?: InputMaybe<EntriesWhere>;
  where?: InputMaybe<EntryRefundsWhere>;
};


export type QueryFiscalYearArgs = {
  id: Scalars['ID'];
};


export type QueryFiscalYearsArgs = {
  where?: InputMaybe<FiscalYearsWhere>;
};


export type QueryPeopleArgs = {
  where?: InputMaybe<PeopleWhere>;
};


export type QueryPersonArgs = {
  id: Scalars['ID'];
};


export type QuerySourcesArgs = {
  searchByName: Scalars['String'];
};

export type ReconcileEntries = {
  entries?: InputMaybe<Array<InputMaybe<Scalars['ID']>>>;
  refunds?: InputMaybe<Array<InputMaybe<Scalars['ID']>>>;
};

export type ReconcileEntriesPayload = {
  __typename?: 'ReconcileEntriesPayload';
  reconciledEntries: Array<Entry>;
  reconciledRefunds: Array<EntryRefund>;
};

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

export type Source = Business | Department | Person;

export type Subscription = {
  __typename?: 'Subscription';
  entryAdded: Entry;
  entryUpdated: Entry;
  entryUpserted: Entry;
};

/** Requirers at least ONE optional field. */
export type UpdateEntry = {
  category?: InputMaybe<Scalars['ID']>;
  date?: InputMaybe<Scalars['Date']>;
  dateOfRecord?: InputMaybe<UpdateEntryDateOfRecord>;
  department?: InputMaybe<Scalars['ID']>;
  description?: InputMaybe<Scalars['String']>;
  id: Scalars['ID'];
  paymentMethod?: InputMaybe<UpsertPaymentMethod>;
  reconciled?: InputMaybe<Scalars['Boolean']>;
  source?: InputMaybe<UpsertEntrySource>;
  total?: InputMaybe<Scalars['Rational']>;
};

/** `UpdateEntry.dateOfRecord` input.  Fields "date" and "overrideFiscalYear" are mutually exclusive to field "clear".  Requires at least ONE optional field. */
export type UpdateEntryDateOfRecord = {
  clear?: InputMaybe<Scalars['Boolean']>;
  date?: InputMaybe<Scalars['Date']>;
  overrideFiscalYear?: InputMaybe<Scalars['Boolean']>;
};

export type UpdateEntryPayload = {
  __typename?: 'UpdateEntryPayload';
  updatedEntry: Entry;
};

export type UpdateEntryRefund = {
  date?: InputMaybe<Scalars['Date']>;
  dateOfRecord?: InputMaybe<UpdateEntryDateOfRecord>;
  description?: InputMaybe<Scalars['String']>;
  id: Scalars['ID'];
  paymentMethod?: InputMaybe<UpsertPaymentMethod>;
  reconciled?: InputMaybe<Scalars['Boolean']>;
  total?: InputMaybe<Scalars['Rational']>;
};

export type UpdateEntryRefundPayload = {
  __typename?: 'UpdateEntryRefundPayload';
  updatedEntryRefund: EntryRefund;
};

/** `NewEntry.source` and `UpdateEntry.source` input.  Choose ONE field only. */
export type UpsertEntrySource = {
  business?: InputMaybe<NewBusiness>;
  person?: InputMaybe<NewPerson>;
  source?: InputMaybe<EntityInput>;
};

/** One field is required and fields are mutually exclusive.. */
export type UpsertPaymentMethod = {
  accountCard?: InputMaybe<PaymentMethodAccountCardInput>;
  accountCheck?: InputMaybe<PaymentMethodAccountCheckInput>;
  card?: InputMaybe<PaymentMethodCardInput>;
  cash?: InputMaybe<PaymentMethodCashInput>;
  check?: InputMaybe<PaymentMethodCheckInput>;
  combination?: InputMaybe<PaymentMethodCombinationInput>;
  online?: InputMaybe<PaymentMethodOnlineInput>;
  unknown?: InputMaybe<PaymentMethodUnknownInput>;
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
  eq?: InputMaybe<Scalars['Date']>;
  gt?: InputMaybe<Scalars['Date']>;
  gte?: InputMaybe<Scalars['Date']>;
  lt?: InputMaybe<Scalars['Date']>;
  lte?: InputMaybe<Scalars['Date']>;
  ne?: InputMaybe<Scalars['Date']>;
};

export type WhereId = {
  eq?: InputMaybe<Scalars['ID']>;
  in?: InputMaybe<Array<Scalars['ID']>>;
  ne?: InputMaybe<Scalars['ID']>;
  nin?: InputMaybe<Array<Scalars['ID']>>;
};

export type WhereInt = {
  eq?: InputMaybe<Scalars['Int']>;
  gt?: InputMaybe<Scalars['Int']>;
  gte?: InputMaybe<Scalars['Int']>;
  lt?: InputMaybe<Scalars['Int']>;
  lte?: InputMaybe<Scalars['Int']>;
  ne?: InputMaybe<Scalars['Int']>;
};

export type WhereNode = {
  eq?: InputMaybe<NodeInput>;
  in?: InputMaybe<Array<NodeInput>>;
  ne?: InputMaybe<NodeInput>;
  nin?: InputMaybe<Array<NodeInput>>;
};

export type WhereRational = {
  eq?: InputMaybe<Scalars['Rational']>;
  gt?: InputMaybe<Scalars['Rational']>;
  gte?: InputMaybe<Scalars['Rational']>;
  in?: InputMaybe<Array<Scalars['Rational']>>;
  lt?: InputMaybe<Scalars['Rational']>;
  lte?: InputMaybe<Scalars['Rational']>;
  ne?: InputMaybe<Scalars['Rational']>;
  nin?: InputMaybe<Array<Scalars['Rational']>>;
};

export type WhereRegex = {
  flags?: InputMaybe<Array<RegexFlags>>;
  /**
   * "pattern" argument of the javascript RegExp constructor.
   * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/RegExp/RegExp#parameters
   */
  pattern: Scalars['String'];
};

export type WhereTreeId = {
  eq?: InputMaybe<Scalars['ID']>;
  /** Range operators will match descendants and ancestors in the tree. */
  gt?: InputMaybe<Scalars['ID']>;
  gte?: InputMaybe<Scalars['ID']>;
  in?: InputMaybe<Array<Scalars['ID']>>;
  lt?: InputMaybe<Scalars['ID']>;
  lte?: InputMaybe<Scalars['ID']>;
  ne?: InputMaybe<Scalars['ID']>;
  nin?: InputMaybe<Array<Scalars['ID']>>;
};

export type DepartmentNameQueryVariables = Exact<{
  id: Scalars['ID'];
}>;


export type DepartmentNameQuery = { __typename?: 'Query', department: { __typename: 'Department', id: string, name: string } };

export type GetReportDataDeptFragment = { __typename: 'Department', id: string, name: string, budgets: Array<{ __typename: 'Budget', id: string, amount: string, fiscalYear: { __typename: 'FiscalYear', id: string } }> };

export type ReportDataEntryRefundFragment = { __typename: 'EntryRefund', id: string, total: string, deleted: boolean, lastUpdate: string };

export type ReportDataEntryCategoryFragment = { __typename: 'Category', id: string, name: string, type: EntryType };

export type ReportDataEntryDeptFragment = { __typename: 'Department', id: string, ancestors: Array<{ __typename: 'Business', id: string } | { __typename: 'Department', id: string }> };

export type GetReportDataEntrySansRefundsFragment = { __typename: 'Entry', id: string, total: string, lastUpdate: string, deleted: boolean, category: { __typename: 'Category', id: string, name: string, type: EntryType }, fiscalYear: { __typename: 'FiscalYear', id: string }, department: { __typename: 'Department', id: string, ancestors: Array<{ __typename: 'Business', id: string } | { __typename: 'Department', id: string }> }, items: Array<{ __typename: 'EntryItem', id: string, total: string, deleted: boolean, department?: { __typename: 'Department', id: string } | null | undefined }> };

export type GetReportDataEntryFragment = { __typename: 'Entry', id: string, total: string, lastUpdate: string, deleted: boolean, refunds: Array<{ __typename: 'EntryRefund', id: string, total: string, deleted: boolean, lastUpdate: string }>, category: { __typename: 'Category', id: string, name: string, type: EntryType }, fiscalYear: { __typename: 'FiscalYear', id: string }, department: { __typename: 'Department', id: string, ancestors: Array<{ __typename: 'Business', id: string } | { __typename: 'Department', id: string }> }, items: Array<{ __typename: 'EntryItem', id: string, total: string, deleted: boolean, department?: { __typename: 'Department', id: string } | null | undefined }> };

export type ReportDataOtherEntryRefundFragment = { __typename: 'EntryRefund', id: string, total: string, deleted: boolean, lastUpdate: string, entry: { __typename: 'Entry', id: string, category: { __typename: 'Category', id: string, name: string, type: EntryType }, department: { __typename: 'Department', id: string, ancestors: Array<{ __typename: 'Business', id: string } | { __typename: 'Department', id: string }> } } };

export type GetReportDataQueryVariables = Exact<{
  deptId: Scalars['ID'];
  where: EntriesWhere;
  filterRefunds?: InputMaybe<Scalars['Boolean']>;
  whereRefunds: EntryRefundsWhere;
  whereRefundEntries: EntriesWhere;
}>;


export type GetReportDataQuery = { __typename?: 'Query', department: { __typename: 'Department', id: string, name: string, descendants: Array<{ __typename: 'Department', id: string, name: string, budgets: Array<{ __typename: 'Budget', id: string, amount: string, fiscalYear: { __typename: 'FiscalYear', id: string } }> }>, budgets: Array<{ __typename: 'Budget', id: string, amount: string, fiscalYear: { __typename: 'FiscalYear', id: string } }> }, entries: Array<{ __typename: 'Entry', id: string, total: string, lastUpdate: string, deleted: boolean, refunds: Array<{ __typename: 'EntryRefund', id: string, total: string, deleted: boolean, lastUpdate: string }>, category: { __typename: 'Category', id: string, name: string, type: EntryType }, fiscalYear: { __typename: 'FiscalYear', id: string }, department: { __typename: 'Department', id: string, ancestors: Array<{ __typename: 'Business', id: string } | { __typename: 'Department', id: string }> }, items: Array<{ __typename: 'EntryItem', id: string, total: string, deleted: boolean, department?: { __typename: 'Department', id: string } | null | undefined }> }>, entryRefunds: Array<{ __typename: 'EntryRefund', id: string, total: string, deleted: boolean, lastUpdate: string, entry: { __typename: 'Entry', id: string, category: { __typename: 'Category', id: string, name: string, type: EntryType }, department: { __typename: 'Department', id: string, ancestors: Array<{ __typename: 'Business', id: string } | { __typename: 'Department', id: string }> } } }>, fiscalYears: Array<{ __typename: 'FiscalYear', id: string, name: string, begin: string, end: string }> };

export type EntryAdded_2SubscriptionVariables = Exact<{ [key: string]: never; }>;


export type EntryAdded_2Subscription = { __typename?: 'Subscription', entryAdded: { __typename: 'Entry', id: string, total: string, lastUpdate: string, deleted: boolean, refunds: Array<{ __typename: 'EntryRefund', id: string, total: string, deleted: boolean, lastUpdate: string }>, category: { __typename: 'Category', id: string, name: string, type: EntryType }, fiscalYear: { __typename: 'FiscalYear', id: string }, department: { __typename: 'Department', id: string, ancestors: Array<{ __typename: 'Business', id: string } | { __typename: 'Department', id: string }> }, items: Array<{ __typename: 'EntryItem', id: string, total: string, deleted: boolean, department?: { __typename: 'Department', id: string } | null | undefined }> } };

export type EntryUpdated_2SubscriptionVariables = Exact<{ [key: string]: never; }>;


export type EntryUpdated_2Subscription = { __typename?: 'Subscription', entryUpdated: { __typename: 'Entry', id: string, total: string, lastUpdate: string, deleted: boolean, refunds: Array<{ __typename: 'EntryRefund', id: string, total: string, deleted: boolean, lastUpdate: string }>, category: { __typename: 'Category', id: string, name: string, type: EntryType }, fiscalYear: { __typename: 'FiscalYear', id: string }, department: { __typename: 'Department', id: string, ancestors: Array<{ __typename: 'Business', id: string } | { __typename: 'Department', id: string }> }, items: Array<{ __typename: 'EntryItem', id: string, total: string, deleted: boolean, department?: { __typename: 'Department', id: string } | null | undefined }> } };

export type CategoryInputOptFragment = { __typename: 'Category', id: string, name: string, type: EntryType, children: Array<{ __typename: 'Category', id: string }>, parent?: { __typename: 'Category', id: string } | null | undefined };

export type CategoryInputDefaultValueFragment = { __typename: 'Category', id: string, name: string, type: EntryType, ancestors: Array<{ __typename: 'Category', id: string, name: string, type: EntryType, children: Array<{ __typename: 'Category', id: string }>, parent?: { __typename: 'Category', id: string } | null | undefined }>, children: Array<{ __typename: 'Category', id: string }>, parent?: { __typename: 'Category', id: string } | null | undefined };

export type CategoryInputDefaultValuesQueryVariables = Exact<{
  where: CategoriesWhere;
}>;


export type CategoryInputDefaultValuesQuery = { __typename?: 'Query', categories: Array<{ __typename: 'Category', id: string, name: string, type: EntryType, ancestors: Array<{ __typename: 'Category', id: string, name: string, type: EntryType, children: Array<{ __typename: 'Category', id: string }>, parent?: { __typename: 'Category', id: string } | null | undefined }>, children: Array<{ __typename: 'Category', id: string }>, parent?: { __typename: 'Category', id: string } | null | undefined }> };

export type CategoryInputOptsQueryVariables = Exact<{
  where: CategoriesWhere;
}>;


export type CategoryInputOptsQuery = { __typename?: 'Query', categories: Array<{ __typename: 'Category', id: string, name: string, type: EntryType, children: Array<{ __typename: 'Category', id: string }>, parent?: { __typename: 'Category', id: string } | null | undefined }> };

export type DepartmentInputOptFragment = { __typename: 'Department', id: string, name: string, children: Array<{ __typename: 'Department', id: string }> };

export type DepartmentInputDefaultValueFragment = { __typename: 'Department', id: string, name: string, ancestors: Array<{ __typename: 'Business' } | { __typename: 'Department', id: string, name: string, children: Array<{ __typename: 'Department', id: string }> }>, children: Array<{ __typename: 'Department', id: string }> };

export type DepartmentInputDefaultValuesQueryVariables = Exact<{
  where: DepartmentsWhere;
  deptRoot?: InputMaybe<DepartmentsWhere>;
}>;


export type DepartmentInputDefaultValuesQuery = { __typename?: 'Query', departments: Array<{ __typename: 'Department', id: string, name: string, ancestors: Array<{ __typename: 'Business' } | { __typename: 'Department', id: string, name: string, children: Array<{ __typename: 'Department', id: string }> }>, children: Array<{ __typename: 'Department', id: string }> }> };

export type DepartmentInputOptsQueryVariables = Exact<{
  where: DepartmentsWhere;
}>;


export type DepartmentInputOptsQuery = { __typename?: 'Query', departments: Array<{ __typename: 'Department', id: string, name: string, children: Array<{ __typename: 'Department', id: string }> }> };

export type EntityBusinessInputOptFragment = { __typename: 'Business', id: string, name: string, departments: Array<{ __typename: 'Department', id: string }> };

export type EntityPersonInputOptFragment = { __typename: 'Person', id: string, email?: string | null | undefined, phone?: string | null | undefined, personName: { __typename?: 'PersonName', first: string, last: string } };

export type EntityInputDefaultValue_Business_Fragment = { __typename: 'Business', id: string, name: string, departments: Array<{ __typename: 'Department', id: string }> };

export type EntityInputDefaultValue_Department_Fragment = { __typename: 'Department', id: string, name: string, ancestors: Array<{ __typename: 'Business', id: string, name: string, departments: Array<{ __typename: 'Department', id: string }> } | { __typename: 'Department', id: string, name: string, children: Array<{ __typename: 'Department', id: string }> }>, children: Array<{ __typename: 'Department', id: string }> };

export type EntityInputDefaultValue_Person_Fragment = { __typename: 'Person', id: string, email?: string | null | undefined, phone?: string | null | undefined, personName: { __typename?: 'PersonName', first: string, last: string } };

export type EntityInputDefaultValueFragment = EntityInputDefaultValue_Business_Fragment | EntityInputDefaultValue_Department_Fragment | EntityInputDefaultValue_Person_Fragment;

export type EntityInputOptsQueryVariables = Exact<{
  where: EntitiesWhere;
}>;


export type EntityInputOptsQuery = { __typename?: 'Query', entities: Array<{ __typename: 'Business', id: string, name: string, departments: Array<{ __typename: 'Department', id: string }> } | { __typename: 'Department', id: string, name: string, children: Array<{ __typename: 'Department', id: string }> } | { __typename: 'Person', id: string, email?: string | null | undefined, phone?: string | null | undefined, personName: { __typename?: 'PersonName', first: string, last: string } }> };

export type EntityInputDefaultValueQueryVariables = Exact<{
  where: EntitiesWhere;
  deptRoot?: InputMaybe<DepartmentsWhere>;
}>;


export type EntityInputDefaultValueQuery = { __typename?: 'Query', entities: Array<{ __typename: 'Business', id: string, name: string, departments: Array<{ __typename: 'Department', id: string }> } | { __typename: 'Department', id: string, name: string, ancestors: Array<{ __typename: 'Business', id: string, name: string, departments: Array<{ __typename: 'Department', id: string }> } | { __typename: 'Department', id: string, name: string, children: Array<{ __typename: 'Department', id: string }> }>, children: Array<{ __typename: 'Department', id: string }> } | { __typename: 'Person', id: string, email?: string | null | undefined, phone?: string | null | undefined, personName: { __typename?: 'PersonName', first: string, last: string } }> };

export type AccountCardPayMethodInputOptFragment = { __typename: 'AccountCard', id: string, active: boolean, type: PaymentCardType, trailingDigits: string, aliases: Array<{ __typename?: 'Alias', name: string }> };

export type AccountOwnerPayMethodInputOpt_Business_Fragment = { __typename: 'Business', id: string, name: string };

export type AccountOwnerPayMethodInputOpt_Department_Fragment = { __typename: 'Department', id: string, name: string };

export type AccountOwnerPayMethodInputOpt_Person_Fragment = { __typename: 'Person', id: string, personName: { __typename?: 'PersonName', first: string, last: string } };

export type AccountOwnerPayMethodInputOptFragment = AccountOwnerPayMethodInputOpt_Business_Fragment | AccountOwnerPayMethodInputOpt_Department_Fragment | AccountOwnerPayMethodInputOpt_Person_Fragment;

export type AccountCheckingPayMethodInputOptFragment = { __typename: 'AccountChecking', id: string, accountNumber: string, active: boolean, name: string, cards: Array<{ __typename: 'AccountCard', id: string, active: boolean, type: PaymentCardType, trailingDigits: string, aliases: Array<{ __typename?: 'Alias', name: string }> }>, owner: { __typename: 'Business', id: string, name: string } | { __typename: 'Department', id: string, name: string } | { __typename: 'Person', id: string, personName: { __typename?: 'PersonName', first: string, last: string } } };

export type AccountCreditCardPayMethodInputOptFragment = { __typename: 'AccountCreditCard', id: string, active: boolean, name: string, cards: Array<{ __typename: 'AccountCard', id: string, active: boolean, type: PaymentCardType, trailingDigits: string, aliases: Array<{ __typename?: 'Alias', name: string }> }>, owner: { __typename: 'Business', id: string, name: string } | { __typename: 'Department', id: string, name: string } | { __typename: 'Person', id: string, personName: { __typename?: 'PersonName', first: string, last: string } } };

export type AccountPayMethodInputOptsQueryVariables = Exact<{
  where: AccountsWhere;
}>;


export type AccountPayMethodInputOptsQuery = { __typename?: 'Query', accounts: Array<{ __typename: 'AccountChecking', id: string, accountNumber: string, active: boolean, name: string, cards: Array<{ __typename: 'AccountCard', id: string, active: boolean, type: PaymentCardType, trailingDigits: string, aliases: Array<{ __typename?: 'Alias', name: string }> }>, owner: { __typename: 'Business', id: string, name: string } | { __typename: 'Department', id: string, name: string } | { __typename: 'Person', id: string, personName: { __typename?: 'PersonName', first: string, last: string } } } | { __typename: 'AccountCreditCard', id: string, active: boolean, name: string, cards: Array<{ __typename: 'AccountCard', id: string, active: boolean, type: PaymentCardType, trailingDigits: string, aliases: Array<{ __typename?: 'Alias', name: string }> }>, owner: { __typename: 'Business', id: string, name: string } | { __typename: 'Department', id: string, name: string } | { __typename: 'Person', id: string, personName: { __typename?: 'PersonName', first: string, last: string } } }> };

export type PayMethodDefaultValue_PaymentMethodCard_Fragment = { __typename: 'PaymentMethodCard', currency: Currency, card: { __typename: 'AccountCard', trailingDigits: string, type: PaymentCardType, id: string, active: boolean, aliases: Array<{ __typename?: 'Alias', name: string }> } | { __typename: 'PaymentCard', trailingDigits: string, type: PaymentCardType } };

export type PayMethodDefaultValue_PaymentMethodCash_Fragment = { __typename: 'PaymentMethodCash', currency: Currency };

export type PayMethodDefaultValue_PaymentMethodCheck_Fragment = { __typename: 'PaymentMethodCheck', currency: Currency, check: { __typename: 'AccountCheck', checkNumber: string, account: { __typename: 'AccountChecking', id: string, accountNumber: string, active: boolean, name: string, cards: Array<{ __typename: 'AccountCard', id: string, active: boolean, type: PaymentCardType, trailingDigits: string, aliases: Array<{ __typename?: 'Alias', name: string }> }>, owner: { __typename: 'Business', id: string, name: string } | { __typename: 'Department', id: string, name: string } | { __typename: 'Person', id: string, personName: { __typename?: 'PersonName', first: string, last: string } } } } | { __typename: 'PaymentCheck', checkNumber: string } };

export type PayMethodDefaultValue_PaymentMethodCombination_Fragment = { __typename: 'PaymentMethodCombination', currency: Currency };

export type PayMethodDefaultValue_PaymentMethodOnline_Fragment = { __typename: 'PaymentMethodOnline', currency: Currency };

export type PayMethodDefaultValue_PaymentMethodUnknown_Fragment = { __typename: 'PaymentMethodUnknown', currency: Currency };

export type PayMethodDefaultValueFragment = PayMethodDefaultValue_PaymentMethodCard_Fragment | PayMethodDefaultValue_PaymentMethodCash_Fragment | PayMethodDefaultValue_PaymentMethodCheck_Fragment | PayMethodDefaultValue_PaymentMethodCombination_Fragment | PayMethodDefaultValue_PaymentMethodOnline_Fragment | PayMethodDefaultValue_PaymentMethodUnknown_Fragment;

export type PayMethodDefaultValueFromEntryQueryVariables = Exact<{
  where: EntriesWhere;
}>;


export type PayMethodDefaultValueFromEntryQuery = { __typename?: 'Query', entries: Array<{ __typename: 'Entry', id: string, paymentMethod: { __typename: 'PaymentMethodCard', currency: Currency, card: { __typename: 'AccountCard', trailingDigits: string, type: PaymentCardType, id: string, active: boolean, aliases: Array<{ __typename?: 'Alias', name: string }> } | { __typename: 'PaymentCard', trailingDigits: string, type: PaymentCardType } } | { __typename: 'PaymentMethodCash', currency: Currency } | { __typename: 'PaymentMethodCheck', currency: Currency, check: { __typename: 'AccountCheck', checkNumber: string, account: { __typename: 'AccountChecking', id: string, accountNumber: string, active: boolean, name: string, cards: Array<{ __typename: 'AccountCard', id: string, active: boolean, type: PaymentCardType, trailingDigits: string, aliases: Array<{ __typename?: 'Alias', name: string }> }>, owner: { __typename: 'Business', id: string, name: string } | { __typename: 'Department', id: string, name: string } | { __typename: 'Person', id: string, personName: { __typename?: 'PersonName', first: string, last: string } } } } | { __typename: 'PaymentCheck', checkNumber: string } } | { __typename: 'PaymentMethodCombination', currency: Currency } | { __typename: 'PaymentMethodOnline', currency: Currency } | { __typename: 'PaymentMethodUnknown', currency: Currency } }> };

export type PayMethodDefaultValueFromRefundQueryVariables = Exact<{
  where: EntryRefundsWhere;
}>;


export type PayMethodDefaultValueFromRefundQuery = { __typename?: 'Query', entryRefunds: Array<{ __typename: 'EntryRefund', id: string, paymentMethod: { __typename: 'PaymentMethodCard', currency: Currency, card: { __typename: 'AccountCard', trailingDigits: string, type: PaymentCardType, id: string, active: boolean, aliases: Array<{ __typename?: 'Alias', name: string }> } | { __typename: 'PaymentCard', trailingDigits: string, type: PaymentCardType } } | { __typename: 'PaymentMethodCash', currency: Currency } | { __typename: 'PaymentMethodCheck', currency: Currency, check: { __typename: 'AccountCheck', checkNumber: string, account: { __typename: 'AccountChecking', id: string, accountNumber: string, active: boolean, name: string, cards: Array<{ __typename: 'AccountCard', id: string, active: boolean, type: PaymentCardType, trailingDigits: string, aliases: Array<{ __typename?: 'Alias', name: string }> }>, owner: { __typename: 'Business', id: string, name: string } | { __typename: 'Department', id: string, name: string } | { __typename: 'Person', id: string, personName: { __typename?: 'PersonName', first: string, last: string } } } } | { __typename: 'PaymentCheck', checkNumber: string } } | { __typename: 'PaymentMethodCombination', currency: Currency } | { __typename: 'PaymentMethodOnline', currency: Currency } | { __typename: 'PaymentMethodUnknown', currency: Currency } }> };

export type UpdateEntryDefaultValuesQueryVariables = Exact<{
  id: Scalars['ID'];
  deptRoot?: InputMaybe<DepartmentsWhere>;
}>;


export type UpdateEntryDefaultValuesQuery = { __typename?: 'Query', entry?: { __typename: 'Entry', id: string, date: string, description?: string | null | undefined, reconciled: boolean, total: string, dateOfRecord?: { __typename?: 'EntryDateOfRecord', date: string } | null | undefined, category: { __typename: 'Category', id: string, name: string, type: EntryType, ancestors: Array<{ __typename: 'Category', id: string, name: string, type: EntryType, children: Array<{ __typename: 'Category', id: string }>, parent?: { __typename: 'Category', id: string } | null | undefined }>, children: Array<{ __typename: 'Category', id: string }>, parent?: { __typename: 'Category', id: string } | null | undefined }, department: { __typename: 'Department', id: string, name: string, ancestors: Array<{ __typename: 'Business' } | { __typename: 'Department', id: string, name: string, children: Array<{ __typename: 'Department', id: string }> }>, children: Array<{ __typename: 'Department', id: string }> }, source: { __typename: 'Business', id: string, name: string, departments: Array<{ __typename: 'Department', id: string }> } | { __typename: 'Department', id: string, name: string, ancestors: Array<{ __typename: 'Business', id: string, name: string, departments: Array<{ __typename: 'Department', id: string }> } | { __typename: 'Department', id: string, name: string, children: Array<{ __typename: 'Department', id: string }> }>, children: Array<{ __typename: 'Department', id: string }> } | { __typename: 'Person', id: string, email?: string | null | undefined, phone?: string | null | undefined, personName: { __typename?: 'PersonName', first: string, last: string } }, paymentMethod: { __typename: 'PaymentMethodCard', currency: Currency, card: { __typename: 'AccountCard', trailingDigits: string, type: PaymentCardType, id: string, active: boolean, aliases: Array<{ __typename?: 'Alias', name: string }> } | { __typename: 'PaymentCard', trailingDigits: string, type: PaymentCardType } } | { __typename: 'PaymentMethodCash', currency: Currency } | { __typename: 'PaymentMethodCheck', currency: Currency, check: { __typename: 'AccountCheck', checkNumber: string, account: { __typename: 'AccountChecking', id: string, accountNumber: string, active: boolean, name: string, cards: Array<{ __typename: 'AccountCard', id: string, active: boolean, type: PaymentCardType, trailingDigits: string, aliases: Array<{ __typename?: 'Alias', name: string }> }>, owner: { __typename: 'Business', id: string, name: string } | { __typename: 'Department', id: string, name: string } | { __typename: 'Person', id: string, personName: { __typename?: 'PersonName', first: string, last: string } } } } | { __typename: 'PaymentCheck', checkNumber: string } } | { __typename: 'PaymentMethodCombination', currency: Currency } | { __typename: 'PaymentMethodOnline', currency: Currency } | { __typename: 'PaymentMethodUnknown', currency: Currency } } | null | undefined };

export type UpdateRefundDefaultValuesFragment = { __typename: 'EntryRefund', id: string, date: string, deleted: boolean, description?: string | null | undefined, reconciled: boolean, total: string, paymentMethod: { __typename: 'PaymentMethodCard', currency: Currency, card: { __typename: 'AccountCard', trailingDigits: string, type: PaymentCardType, id: string, active: boolean, aliases: Array<{ __typename?: 'Alias', name: string }> } | { __typename: 'PaymentCard', trailingDigits: string, type: PaymentCardType } } | { __typename: 'PaymentMethodCash', currency: Currency } | { __typename: 'PaymentMethodCheck', currency: Currency, check: { __typename: 'AccountCheck', checkNumber: string, account: { __typename: 'AccountChecking', id: string, accountNumber: string, active: boolean, name: string, cards: Array<{ __typename: 'AccountCard', id: string, active: boolean, type: PaymentCardType, trailingDigits: string, aliases: Array<{ __typename?: 'Alias', name: string }> }>, owner: { __typename: 'Business', id: string, name: string } | { __typename: 'Department', id: string, name: string } | { __typename: 'Person', id: string, personName: { __typename?: 'PersonName', first: string, last: string } } } } | { __typename: 'PaymentCheck', checkNumber: string } } | { __typename: 'PaymentMethodCombination', currency: Currency } | { __typename: 'PaymentMethodOnline', currency: Currency } | { __typename: 'PaymentMethodUnknown', currency: Currency } };

export type RefundEntryStateQueryVariables = Exact<{
  where: EntriesWhere;
}>;


export type RefundEntryStateQuery = { __typename?: 'Query', entries: Array<{ __typename: 'Entry', id: string, date: string, total: string, category: { __typename: 'Category', id: string, type: EntryType }, paymentMethod: { __typename: 'PaymentMethodCard', currency: Currency, card: { __typename: 'AccountCard', trailingDigits: string, type: PaymentCardType, id: string, active: boolean, aliases: Array<{ __typename?: 'Alias', name: string }> } | { __typename: 'PaymentCard', trailingDigits: string, type: PaymentCardType } } | { __typename: 'PaymentMethodCash', currency: Currency } | { __typename: 'PaymentMethodCheck', currency: Currency, check: { __typename: 'AccountCheck', checkNumber: string, account: { __typename: 'AccountChecking', id: string, accountNumber: string, active: boolean, name: string, cards: Array<{ __typename: 'AccountCard', id: string, active: boolean, type: PaymentCardType, trailingDigits: string, aliases: Array<{ __typename?: 'Alias', name: string }> }>, owner: { __typename: 'Business', id: string, name: string } | { __typename: 'Department', id: string, name: string } | { __typename: 'Person', id: string, personName: { __typename?: 'PersonName', first: string, last: string } } } } | { __typename: 'PaymentCheck', checkNumber: string } } | { __typename: 'PaymentMethodCombination', currency: Currency } | { __typename: 'PaymentMethodOnline', currency: Currency } | { __typename: 'PaymentMethodUnknown', currency: Currency }, refunds: Array<{ __typename: 'EntryRefund', id: string, date: string, deleted: boolean, description?: string | null | undefined, reconciled: boolean, total: string, paymentMethod: { __typename: 'PaymentMethodCard', currency: Currency, card: { __typename: 'AccountCard', trailingDigits: string, type: PaymentCardType, id: string, active: boolean, aliases: Array<{ __typename?: 'Alias', name: string }> } | { __typename: 'PaymentCard', trailingDigits: string, type: PaymentCardType } } | { __typename: 'PaymentMethodCash', currency: Currency } | { __typename: 'PaymentMethodCheck', currency: Currency, check: { __typename: 'AccountCheck', checkNumber: string, account: { __typename: 'AccountChecking', id: string, accountNumber: string, active: boolean, name: string, cards: Array<{ __typename: 'AccountCard', id: string, active: boolean, type: PaymentCardType, trailingDigits: string, aliases: Array<{ __typename?: 'Alias', name: string }> }>, owner: { __typename: 'Business', id: string, name: string } | { __typename: 'Department', id: string, name: string } | { __typename: 'Person', id: string, personName: { __typename?: 'PersonName', first: string, last: string } } } } | { __typename: 'PaymentCheck', checkNumber: string } } | { __typename: 'PaymentMethodCombination', currency: Currency } | { __typename: 'PaymentMethodOnline', currency: Currency } | { __typename: 'PaymentMethodUnknown', currency: Currency } }> }> };

export type GridEntrySrcPersonFragment = { __typename: 'Person', id: string, personName: { __typename?: 'PersonName', first: string, last: string } };

export type GridEntrySrcBusinessFragment = { __typename: 'Business', id: string, name: string };

export type GridEntrySrcDeptFragment = { __typename: 'Department', id: string, name: string };

export type GridPaymentMethodCardFragment = { __typename: 'PaymentMethodCard', card: { __typename: 'AccountCard', id: string, active: boolean, trailingDigits: string, type: PaymentCardType, account: { __typename: 'AccountChecking', id: string, name: string } | { __typename: 'AccountCreditCard', id: string, name: string }, aliases: Array<{ __typename?: 'Alias', name: string }> } | { __typename: 'PaymentCard', trailingDigits: string, type: PaymentCardType } };

export type GridPaymentMethodCheckFragment = { __typename: 'PaymentMethodCheck', check: { __typename: 'AccountCheck', checkNumber: string, account: { __typename: 'AccountChecking', id: string, name: string, accountNumber: string } } | { __typename: 'PaymentCheck', checkNumber: string } };

export type GridPaymentMethod_PaymentMethodCard_Fragment = { __typename: 'PaymentMethodCard', currency: Currency, card: { __typename: 'AccountCard', id: string, active: boolean, trailingDigits: string, type: PaymentCardType, account: { __typename: 'AccountChecking', id: string, name: string } | { __typename: 'AccountCreditCard', id: string, name: string }, aliases: Array<{ __typename?: 'Alias', name: string }> } | { __typename: 'PaymentCard', trailingDigits: string, type: PaymentCardType } };

export type GridPaymentMethod_PaymentMethodCash_Fragment = { __typename: 'PaymentMethodCash', currency: Currency };

export type GridPaymentMethod_PaymentMethodCheck_Fragment = { __typename: 'PaymentMethodCheck', currency: Currency, check: { __typename: 'AccountCheck', checkNumber: string, account: { __typename: 'AccountChecking', id: string, name: string, accountNumber: string } } | { __typename: 'PaymentCheck', checkNumber: string } };

export type GridPaymentMethod_PaymentMethodCombination_Fragment = { __typename: 'PaymentMethodCombination', currency: Currency };

export type GridPaymentMethod_PaymentMethodOnline_Fragment = { __typename: 'PaymentMethodOnline', currency: Currency };

export type GridPaymentMethod_PaymentMethodUnknown_Fragment = { __typename: 'PaymentMethodUnknown', currency: Currency };

export type GridPaymentMethodFragment = GridPaymentMethod_PaymentMethodCard_Fragment | GridPaymentMethod_PaymentMethodCash_Fragment | GridPaymentMethod_PaymentMethodCheck_Fragment | GridPaymentMethod_PaymentMethodCombination_Fragment | GridPaymentMethod_PaymentMethodOnline_Fragment | GridPaymentMethod_PaymentMethodUnknown_Fragment;

export type GridRefundFragment = { __typename: 'EntryRefund', id: string, date: string, description?: string | null | undefined, total: string, reconciled: boolean, deleted: boolean, dateOfRecord?: { __typename?: 'EntryDateOfRecord', date: string } | null | undefined, paymentMethod: { __typename: 'PaymentMethodCard', currency: Currency, card: { __typename: 'AccountCard', id: string, active: boolean, trailingDigits: string, type: PaymentCardType, account: { __typename: 'AccountChecking', id: string, name: string } | { __typename: 'AccountCreditCard', id: string, name: string }, aliases: Array<{ __typename?: 'Alias', name: string }> } | { __typename: 'PaymentCard', trailingDigits: string, type: PaymentCardType } } | { __typename: 'PaymentMethodCash', currency: Currency } | { __typename: 'PaymentMethodCheck', currency: Currency, check: { __typename: 'AccountCheck', checkNumber: string, account: { __typename: 'AccountChecking', id: string, name: string, accountNumber: string } } | { __typename: 'PaymentCheck', checkNumber: string } } | { __typename: 'PaymentMethodCombination', currency: Currency } | { __typename: 'PaymentMethodOnline', currency: Currency } | { __typename: 'PaymentMethodUnknown', currency: Currency } };

export type GridEntrySansRefundsFragment = { __typename: 'Entry', id: string, date: string, description?: string | null | undefined, total: string, reconciled: boolean, deleted: boolean, dateOfRecord?: { __typename?: 'EntryDateOfRecord', date: string } | null | undefined, department: { __typename: 'Department', id: string, name: string }, category: { __typename: 'Category', id: string, name: string, type: EntryType }, paymentMethod: { __typename: 'PaymentMethodCard', currency: Currency, card: { __typename: 'AccountCard', id: string, active: boolean, trailingDigits: string, type: PaymentCardType, account: { __typename: 'AccountChecking', id: string, name: string } | { __typename: 'AccountCreditCard', id: string, name: string }, aliases: Array<{ __typename?: 'Alias', name: string }> } | { __typename: 'PaymentCard', trailingDigits: string, type: PaymentCardType } } | { __typename: 'PaymentMethodCash', currency: Currency } | { __typename: 'PaymentMethodCheck', currency: Currency, check: { __typename: 'AccountCheck', checkNumber: string, account: { __typename: 'AccountChecking', id: string, name: string, accountNumber: string } } | { __typename: 'PaymentCheck', checkNumber: string } } | { __typename: 'PaymentMethodCombination', currency: Currency } | { __typename: 'PaymentMethodOnline', currency: Currency } | { __typename: 'PaymentMethodUnknown', currency: Currency }, source: { __typename: 'Business', id: string, name: string } | { __typename: 'Department', id: string, name: string } | { __typename: 'Person', id: string, personName: { __typename?: 'PersonName', first: string, last: string } } };

export type GridEntryFragment = { __typename: 'Entry', id: string, date: string, description?: string | null | undefined, total: string, reconciled: boolean, deleted: boolean, refunds: Array<{ __typename: 'EntryRefund', id: string, date: string, description?: string | null | undefined, total: string, reconciled: boolean, deleted: boolean, dateOfRecord?: { __typename?: 'EntryDateOfRecord', date: string } | null | undefined, paymentMethod: { __typename: 'PaymentMethodCard', currency: Currency, card: { __typename: 'AccountCard', id: string, active: boolean, trailingDigits: string, type: PaymentCardType, account: { __typename: 'AccountChecking', id: string, name: string } | { __typename: 'AccountCreditCard', id: string, name: string }, aliases: Array<{ __typename?: 'Alias', name: string }> } | { __typename: 'PaymentCard', trailingDigits: string, type: PaymentCardType } } | { __typename: 'PaymentMethodCash', currency: Currency } | { __typename: 'PaymentMethodCheck', currency: Currency, check: { __typename: 'AccountCheck', checkNumber: string, account: { __typename: 'AccountChecking', id: string, name: string, accountNumber: string } } | { __typename: 'PaymentCheck', checkNumber: string } } | { __typename: 'PaymentMethodCombination', currency: Currency } | { __typename: 'PaymentMethodOnline', currency: Currency } | { __typename: 'PaymentMethodUnknown', currency: Currency } }>, dateOfRecord?: { __typename?: 'EntryDateOfRecord', date: string } | null | undefined, department: { __typename: 'Department', id: string, name: string }, category: { __typename: 'Category', id: string, name: string, type: EntryType }, paymentMethod: { __typename: 'PaymentMethodCard', currency: Currency, card: { __typename: 'AccountCard', id: string, active: boolean, trailingDigits: string, type: PaymentCardType, account: { __typename: 'AccountChecking', id: string, name: string } | { __typename: 'AccountCreditCard', id: string, name: string }, aliases: Array<{ __typename?: 'Alias', name: string }> } | { __typename: 'PaymentCard', trailingDigits: string, type: PaymentCardType } } | { __typename: 'PaymentMethodCash', currency: Currency } | { __typename: 'PaymentMethodCheck', currency: Currency, check: { __typename: 'AccountCheck', checkNumber: string, account: { __typename: 'AccountChecking', id: string, name: string, accountNumber: string } } | { __typename: 'PaymentCheck', checkNumber: string } } | { __typename: 'PaymentMethodCombination', currency: Currency } | { __typename: 'PaymentMethodOnline', currency: Currency } | { __typename: 'PaymentMethodUnknown', currency: Currency }, source: { __typename: 'Business', id: string, name: string } | { __typename: 'Department', id: string, name: string } | { __typename: 'Person', id: string, personName: { __typename?: 'PersonName', first: string, last: string } } };

export type GridEntriesQueryVariables = Exact<{
  where?: InputMaybe<EntriesWhere>;
  filterRefunds?: InputMaybe<Scalars['Boolean']>;
}>;


export type GridEntriesQuery = { __typename?: 'Query', entries: Array<{ __typename: 'Entry', id: string, date: string, description?: string | null | undefined, total: string, reconciled: boolean, deleted: boolean, refunds: Array<{ __typename: 'EntryRefund', id: string, date: string, description?: string | null | undefined, total: string, reconciled: boolean, deleted: boolean, dateOfRecord?: { __typename?: 'EntryDateOfRecord', date: string } | null | undefined, paymentMethod: { __typename: 'PaymentMethodCard', currency: Currency, card: { __typename: 'AccountCard', id: string, active: boolean, trailingDigits: string, type: PaymentCardType, account: { __typename: 'AccountChecking', id: string, name: string } | { __typename: 'AccountCreditCard', id: string, name: string }, aliases: Array<{ __typename?: 'Alias', name: string }> } | { __typename: 'PaymentCard', trailingDigits: string, type: PaymentCardType } } | { __typename: 'PaymentMethodCash', currency: Currency } | { __typename: 'PaymentMethodCheck', currency: Currency, check: { __typename: 'AccountCheck', checkNumber: string, account: { __typename: 'AccountChecking', id: string, name: string, accountNumber: string } } | { __typename: 'PaymentCheck', checkNumber: string } } | { __typename: 'PaymentMethodCombination', currency: Currency } | { __typename: 'PaymentMethodOnline', currency: Currency } | { __typename: 'PaymentMethodUnknown', currency: Currency } }>, dateOfRecord?: { __typename?: 'EntryDateOfRecord', date: string } | null | undefined, department: { __typename: 'Department', id: string, name: string }, category: { __typename: 'Category', id: string, name: string, type: EntryType }, paymentMethod: { __typename: 'PaymentMethodCard', currency: Currency, card: { __typename: 'AccountCard', id: string, active: boolean, trailingDigits: string, type: PaymentCardType, account: { __typename: 'AccountChecking', id: string, name: string } | { __typename: 'AccountCreditCard', id: string, name: string }, aliases: Array<{ __typename?: 'Alias', name: string }> } | { __typename: 'PaymentCard', trailingDigits: string, type: PaymentCardType } } | { __typename: 'PaymentMethodCash', currency: Currency } | { __typename: 'PaymentMethodCheck', currency: Currency, check: { __typename: 'AccountCheck', checkNumber: string, account: { __typename: 'AccountChecking', id: string, name: string, accountNumber: string } } | { __typename: 'PaymentCheck', checkNumber: string } } | { __typename: 'PaymentMethodCombination', currency: Currency } | { __typename: 'PaymentMethodOnline', currency: Currency } | { __typename: 'PaymentMethodUnknown', currency: Currency }, source: { __typename: 'Business', id: string, name: string } | { __typename: 'Department', id: string, name: string } | { __typename: 'Person', id: string, personName: { __typename?: 'PersonName', first: string, last: string } } }> };

export type GridEntryRefundFragment = { __typename: 'EntryRefund', id: string, date: string, description?: string | null | undefined, total: string, reconciled: boolean, deleted: boolean, entry: { __typename: 'Entry', id: string, date: string, description?: string | null | undefined, total: string, reconciled: boolean, deleted: boolean, dateOfRecord?: { __typename?: 'EntryDateOfRecord', date: string } | null | undefined, department: { __typename: 'Department', id: string, name: string }, category: { __typename: 'Category', id: string, name: string, type: EntryType }, paymentMethod: { __typename: 'PaymentMethodCard', currency: Currency, card: { __typename: 'AccountCard', id: string, active: boolean, trailingDigits: string, type: PaymentCardType, account: { __typename: 'AccountChecking', id: string, name: string } | { __typename: 'AccountCreditCard', id: string, name: string }, aliases: Array<{ __typename?: 'Alias', name: string }> } | { __typename: 'PaymentCard', trailingDigits: string, type: PaymentCardType } } | { __typename: 'PaymentMethodCash', currency: Currency } | { __typename: 'PaymentMethodCheck', currency: Currency, check: { __typename: 'AccountCheck', checkNumber: string, account: { __typename: 'AccountChecking', id: string, name: string, accountNumber: string } } | { __typename: 'PaymentCheck', checkNumber: string } } | { __typename: 'PaymentMethodCombination', currency: Currency } | { __typename: 'PaymentMethodOnline', currency: Currency } | { __typename: 'PaymentMethodUnknown', currency: Currency }, source: { __typename: 'Business', id: string, name: string } | { __typename: 'Department', id: string, name: string } | { __typename: 'Person', id: string, personName: { __typename?: 'PersonName', first: string, last: string } } }, dateOfRecord?: { __typename?: 'EntryDateOfRecord', date: string } | null | undefined, paymentMethod: { __typename: 'PaymentMethodCard', currency: Currency, card: { __typename: 'AccountCard', id: string, active: boolean, trailingDigits: string, type: PaymentCardType, account: { __typename: 'AccountChecking', id: string, name: string } | { __typename: 'AccountCreditCard', id: string, name: string }, aliases: Array<{ __typename?: 'Alias', name: string }> } | { __typename: 'PaymentCard', trailingDigits: string, type: PaymentCardType } } | { __typename: 'PaymentMethodCash', currency: Currency } | { __typename: 'PaymentMethodCheck', currency: Currency, check: { __typename: 'AccountCheck', checkNumber: string, account: { __typename: 'AccountChecking', id: string, name: string, accountNumber: string } } | { __typename: 'PaymentCheck', checkNumber: string } } | { __typename: 'PaymentMethodCombination', currency: Currency } | { __typename: 'PaymentMethodOnline', currency: Currency } | { __typename: 'PaymentMethodUnknown', currency: Currency } };

export type GridEntryRefundsQueryVariables = Exact<{
  where?: InputMaybe<EntryRefundsWhere>;
  entriesWhere?: InputMaybe<EntriesWhere>;
}>;


export type GridEntryRefundsQuery = { __typename?: 'Query', entryRefunds: Array<{ __typename: 'EntryRefund', id: string, date: string, description?: string | null | undefined, total: string, reconciled: boolean, deleted: boolean, entry: { __typename: 'Entry', id: string, date: string, description?: string | null | undefined, total: string, reconciled: boolean, deleted: boolean, dateOfRecord?: { __typename?: 'EntryDateOfRecord', date: string } | null | undefined, department: { __typename: 'Department', id: string, name: string }, category: { __typename: 'Category', id: string, name: string, type: EntryType }, paymentMethod: { __typename: 'PaymentMethodCard', currency: Currency, card: { __typename: 'AccountCard', id: string, active: boolean, trailingDigits: string, type: PaymentCardType, account: { __typename: 'AccountChecking', id: string, name: string } | { __typename: 'AccountCreditCard', id: string, name: string }, aliases: Array<{ __typename?: 'Alias', name: string }> } | { __typename: 'PaymentCard', trailingDigits: string, type: PaymentCardType } } | { __typename: 'PaymentMethodCash', currency: Currency } | { __typename: 'PaymentMethodCheck', currency: Currency, check: { __typename: 'AccountCheck', checkNumber: string, account: { __typename: 'AccountChecking', id: string, name: string, accountNumber: string } } | { __typename: 'PaymentCheck', checkNumber: string } } | { __typename: 'PaymentMethodCombination', currency: Currency } | { __typename: 'PaymentMethodOnline', currency: Currency } | { __typename: 'PaymentMethodUnknown', currency: Currency }, source: { __typename: 'Business', id: string, name: string } | { __typename: 'Department', id: string, name: string } | { __typename: 'Person', id: string, personName: { __typename?: 'PersonName', first: string, last: string } } }, dateOfRecord?: { __typename?: 'EntryDateOfRecord', date: string } | null | undefined, paymentMethod: { __typename: 'PaymentMethodCard', currency: Currency, card: { __typename: 'AccountCard', id: string, active: boolean, trailingDigits: string, type: PaymentCardType, account: { __typename: 'AccountChecking', id: string, name: string } | { __typename: 'AccountCreditCard', id: string, name: string }, aliases: Array<{ __typename?: 'Alias', name: string }> } | { __typename: 'PaymentCard', trailingDigits: string, type: PaymentCardType } } | { __typename: 'PaymentMethodCash', currency: Currency } | { __typename: 'PaymentMethodCheck', currency: Currency, check: { __typename: 'AccountCheck', checkNumber: string, account: { __typename: 'AccountChecking', id: string, name: string, accountNumber: string } } | { __typename: 'PaymentCheck', checkNumber: string } } | { __typename: 'PaymentMethodCombination', currency: Currency } | { __typename: 'PaymentMethodOnline', currency: Currency } | { __typename: 'PaymentMethodUnknown', currency: Currency } }> };

export type DeleteEntryStateQueryVariables = Exact<{
  id: Scalars['ID'];
}>;


export type DeleteEntryStateQuery = { __typename?: 'Query', entry?: { __typename: 'Entry', id: string, total: string } | null | undefined };

export type DeleteRefundStateQueryVariables = Exact<{
  id: Scalars['ID'];
}>;


export type DeleteRefundStateQuery = { __typename?: 'Query', entryRefund?: { __typename: 'EntryRefund', id: string, total: string } | null | undefined };

export type DeleteEntryMutationVariables = Exact<{
  id: Scalars['ID'];
}>;


export type DeleteEntryMutation = { __typename?: 'Mutation', deleteEntry: { __typename?: 'DeleteEntryPayload', deletedEntry: { __typename: 'Entry', id: string, date: string, description?: string | null | undefined, total: string, reconciled: boolean, deleted: boolean, refunds: Array<{ __typename: 'EntryRefund', id: string, date: string, description?: string | null | undefined, total: string, reconciled: boolean, deleted: boolean, dateOfRecord?: { __typename?: 'EntryDateOfRecord', date: string } | null | undefined, paymentMethod: { __typename: 'PaymentMethodCard', currency: Currency, card: { __typename: 'AccountCard', id: string, active: boolean, trailingDigits: string, type: PaymentCardType, account: { __typename: 'AccountChecking', id: string, name: string } | { __typename: 'AccountCreditCard', id: string, name: string }, aliases: Array<{ __typename?: 'Alias', name: string }> } | { __typename: 'PaymentCard', trailingDigits: string, type: PaymentCardType } } | { __typename: 'PaymentMethodCash', currency: Currency } | { __typename: 'PaymentMethodCheck', currency: Currency, check: { __typename: 'AccountCheck', checkNumber: string, account: { __typename: 'AccountChecking', id: string, name: string, accountNumber: string } } | { __typename: 'PaymentCheck', checkNumber: string } } | { __typename: 'PaymentMethodCombination', currency: Currency } | { __typename: 'PaymentMethodOnline', currency: Currency } | { __typename: 'PaymentMethodUnknown', currency: Currency } }>, dateOfRecord?: { __typename?: 'EntryDateOfRecord', date: string } | null | undefined, department: { __typename: 'Department', id: string, name: string }, category: { __typename: 'Category', id: string, name: string, type: EntryType }, paymentMethod: { __typename: 'PaymentMethodCard', currency: Currency, card: { __typename: 'AccountCard', id: string, active: boolean, trailingDigits: string, type: PaymentCardType, account: { __typename: 'AccountChecking', id: string, name: string } | { __typename: 'AccountCreditCard', id: string, name: string }, aliases: Array<{ __typename?: 'Alias', name: string }> } | { __typename: 'PaymentCard', trailingDigits: string, type: PaymentCardType } } | { __typename: 'PaymentMethodCash', currency: Currency } | { __typename: 'PaymentMethodCheck', currency: Currency, check: { __typename: 'AccountCheck', checkNumber: string, account: { __typename: 'AccountChecking', id: string, name: string, accountNumber: string } } | { __typename: 'PaymentCheck', checkNumber: string } } | { __typename: 'PaymentMethodCombination', currency: Currency } | { __typename: 'PaymentMethodOnline', currency: Currency } | { __typename: 'PaymentMethodUnknown', currency: Currency }, source: { __typename: 'Business', id: string, name: string } | { __typename: 'Department', id: string, name: string } | { __typename: 'Person', id: string, personName: { __typename?: 'PersonName', first: string, last: string } } } } };

export type DeleteEntryRefundMutationVariables = Exact<{
  id: Scalars['ID'];
}>;


export type DeleteEntryRefundMutation = { __typename?: 'Mutation', deleteEntryRefund: { __typename?: 'DeleteEntryRefundPayload', deletedEntryRefund: { __typename: 'EntryRefund', id: string, date: string, description?: string | null | undefined, total: string, reconciled: boolean, deleted: boolean, dateOfRecord?: { __typename?: 'EntryDateOfRecord', date: string } | null | undefined, paymentMethod: { __typename: 'PaymentMethodCard', currency: Currency, card: { __typename: 'AccountCard', id: string, active: boolean, trailingDigits: string, type: PaymentCardType, account: { __typename: 'AccountChecking', id: string, name: string } | { __typename: 'AccountCreditCard', id: string, name: string }, aliases: Array<{ __typename?: 'Alias', name: string }> } | { __typename: 'PaymentCard', trailingDigits: string, type: PaymentCardType } } | { __typename: 'PaymentMethodCash', currency: Currency } | { __typename: 'PaymentMethodCheck', currency: Currency, check: { __typename: 'AccountCheck', checkNumber: string, account: { __typename: 'AccountChecking', id: string, name: string, accountNumber: string } } | { __typename: 'PaymentCheck', checkNumber: string } } | { __typename: 'PaymentMethodCombination', currency: Currency } | { __typename: 'PaymentMethodOnline', currency: Currency } | { __typename: 'PaymentMethodUnknown', currency: Currency } } } };

export type ReconcileEntriesMutationVariables = Exact<{
  input: ReconcileEntries;
}>;


export type ReconcileEntriesMutation = { __typename?: 'Mutation', reconcileEntries: { __typename?: 'ReconcileEntriesPayload', reconciledEntries: Array<{ __typename: 'Entry', id: string, date: string, description?: string | null | undefined, total: string, reconciled: boolean, deleted: boolean, refunds: Array<{ __typename: 'EntryRefund', id: string, date: string, description?: string | null | undefined, total: string, reconciled: boolean, deleted: boolean, dateOfRecord?: { __typename?: 'EntryDateOfRecord', date: string } | null | undefined, paymentMethod: { __typename: 'PaymentMethodCard', currency: Currency, card: { __typename: 'AccountCard', id: string, active: boolean, trailingDigits: string, type: PaymentCardType, account: { __typename: 'AccountChecking', id: string, name: string } | { __typename: 'AccountCreditCard', id: string, name: string }, aliases: Array<{ __typename?: 'Alias', name: string }> } | { __typename: 'PaymentCard', trailingDigits: string, type: PaymentCardType } } | { __typename: 'PaymentMethodCash', currency: Currency } | { __typename: 'PaymentMethodCheck', currency: Currency, check: { __typename: 'AccountCheck', checkNumber: string, account: { __typename: 'AccountChecking', id: string, name: string, accountNumber: string } } | { __typename: 'PaymentCheck', checkNumber: string } } | { __typename: 'PaymentMethodCombination', currency: Currency } | { __typename: 'PaymentMethodOnline', currency: Currency } | { __typename: 'PaymentMethodUnknown', currency: Currency } }>, dateOfRecord?: { __typename?: 'EntryDateOfRecord', date: string } | null | undefined, department: { __typename: 'Department', id: string, name: string }, category: { __typename: 'Category', id: string, name: string, type: EntryType }, paymentMethod: { __typename: 'PaymentMethodCard', currency: Currency, card: { __typename: 'AccountCard', id: string, active: boolean, trailingDigits: string, type: PaymentCardType, account: { __typename: 'AccountChecking', id: string, name: string } | { __typename: 'AccountCreditCard', id: string, name: string }, aliases: Array<{ __typename?: 'Alias', name: string }> } | { __typename: 'PaymentCard', trailingDigits: string, type: PaymentCardType } } | { __typename: 'PaymentMethodCash', currency: Currency } | { __typename: 'PaymentMethodCheck', currency: Currency, check: { __typename: 'AccountCheck', checkNumber: string, account: { __typename: 'AccountChecking', id: string, name: string, accountNumber: string } } | { __typename: 'PaymentCheck', checkNumber: string } } | { __typename: 'PaymentMethodCombination', currency: Currency } | { __typename: 'PaymentMethodOnline', currency: Currency } | { __typename: 'PaymentMethodUnknown', currency: Currency }, source: { __typename: 'Business', id: string, name: string } | { __typename: 'Department', id: string, name: string } | { __typename: 'Person', id: string, personName: { __typename?: 'PersonName', first: string, last: string } } }>, reconciledRefunds: Array<{ __typename: 'EntryRefund', id: string, date: string, description?: string | null | undefined, total: string, reconciled: boolean, deleted: boolean, dateOfRecord?: { __typename?: 'EntryDateOfRecord', date: string } | null | undefined, paymentMethod: { __typename: 'PaymentMethodCard', currency: Currency, card: { __typename: 'AccountCard', id: string, active: boolean, trailingDigits: string, type: PaymentCardType, account: { __typename: 'AccountChecking', id: string, name: string } | { __typename: 'AccountCreditCard', id: string, name: string }, aliases: Array<{ __typename?: 'Alias', name: string }> } | { __typename: 'PaymentCard', trailingDigits: string, type: PaymentCardType } } | { __typename: 'PaymentMethodCash', currency: Currency } | { __typename: 'PaymentMethodCheck', currency: Currency, check: { __typename: 'AccountCheck', checkNumber: string, account: { __typename: 'AccountChecking', id: string, name: string, accountNumber: string } } | { __typename: 'PaymentCheck', checkNumber: string } } | { __typename: 'PaymentMethodCombination', currency: Currency } | { __typename: 'PaymentMethodOnline', currency: Currency } | { __typename: 'PaymentMethodUnknown', currency: Currency } }> } };

export type NewEntryMutationVariables = Exact<{
  newEntry: NewEntry;
}>;


export type NewEntryMutation = { __typename?: 'Mutation', addNewEntry: { __typename?: 'AddNewEntryPayload', newEntry: { __typename: 'Entry', id: string, date: string, description?: string | null | undefined, total: string, reconciled: boolean, deleted: boolean, refunds: Array<{ __typename: 'EntryRefund', id: string, date: string, description?: string | null | undefined, total: string, reconciled: boolean, deleted: boolean, dateOfRecord?: { __typename?: 'EntryDateOfRecord', date: string } | null | undefined, paymentMethod: { __typename: 'PaymentMethodCard', currency: Currency, card: { __typename: 'AccountCard', id: string, active: boolean, trailingDigits: string, type: PaymentCardType, account: { __typename: 'AccountChecking', id: string, name: string } | { __typename: 'AccountCreditCard', id: string, name: string }, aliases: Array<{ __typename?: 'Alias', name: string }> } | { __typename: 'PaymentCard', trailingDigits: string, type: PaymentCardType } } | { __typename: 'PaymentMethodCash', currency: Currency } | { __typename: 'PaymentMethodCheck', currency: Currency, check: { __typename: 'AccountCheck', checkNumber: string, account: { __typename: 'AccountChecking', id: string, name: string, accountNumber: string } } | { __typename: 'PaymentCheck', checkNumber: string } } | { __typename: 'PaymentMethodCombination', currency: Currency } | { __typename: 'PaymentMethodOnline', currency: Currency } | { __typename: 'PaymentMethodUnknown', currency: Currency } }>, dateOfRecord?: { __typename?: 'EntryDateOfRecord', date: string } | null | undefined, department: { __typename: 'Department', id: string, name: string }, category: { __typename: 'Category', id: string, name: string, type: EntryType }, paymentMethod: { __typename: 'PaymentMethodCard', currency: Currency, card: { __typename: 'AccountCard', id: string, active: boolean, trailingDigits: string, type: PaymentCardType, account: { __typename: 'AccountChecking', id: string, name: string } | { __typename: 'AccountCreditCard', id: string, name: string }, aliases: Array<{ __typename?: 'Alias', name: string }> } | { __typename: 'PaymentCard', trailingDigits: string, type: PaymentCardType } } | { __typename: 'PaymentMethodCash', currency: Currency } | { __typename: 'PaymentMethodCheck', currency: Currency, check: { __typename: 'AccountCheck', checkNumber: string, account: { __typename: 'AccountChecking', id: string, name: string, accountNumber: string } } | { __typename: 'PaymentCheck', checkNumber: string } } | { __typename: 'PaymentMethodCombination', currency: Currency } | { __typename: 'PaymentMethodOnline', currency: Currency } | { __typename: 'PaymentMethodUnknown', currency: Currency }, source: { __typename: 'Business', id: string, name: string } | { __typename: 'Department', id: string, name: string } | { __typename: 'Person', id: string, personName: { __typename?: 'PersonName', first: string, last: string } } } } };

export type UpdateEntryMutationVariables = Exact<{
  updateEntry: UpdateEntry;
}>;


export type UpdateEntryMutation = { __typename?: 'Mutation', updateEntry: { __typename?: 'UpdateEntryPayload', updatedEntry: { __typename: 'Entry', id: string, date: string, description?: string | null | undefined, total: string, reconciled: boolean, deleted: boolean, refunds: Array<{ __typename: 'EntryRefund', id: string, date: string, description?: string | null | undefined, total: string, reconciled: boolean, deleted: boolean, dateOfRecord?: { __typename?: 'EntryDateOfRecord', date: string } | null | undefined, paymentMethod: { __typename: 'PaymentMethodCard', currency: Currency, card: { __typename: 'AccountCard', id: string, active: boolean, trailingDigits: string, type: PaymentCardType, account: { __typename: 'AccountChecking', id: string, name: string } | { __typename: 'AccountCreditCard', id: string, name: string }, aliases: Array<{ __typename?: 'Alias', name: string }> } | { __typename: 'PaymentCard', trailingDigits: string, type: PaymentCardType } } | { __typename: 'PaymentMethodCash', currency: Currency } | { __typename: 'PaymentMethodCheck', currency: Currency, check: { __typename: 'AccountCheck', checkNumber: string, account: { __typename: 'AccountChecking', id: string, name: string, accountNumber: string } } | { __typename: 'PaymentCheck', checkNumber: string } } | { __typename: 'PaymentMethodCombination', currency: Currency } | { __typename: 'PaymentMethodOnline', currency: Currency } | { __typename: 'PaymentMethodUnknown', currency: Currency } }>, dateOfRecord?: { __typename?: 'EntryDateOfRecord', date: string } | null | undefined, department: { __typename: 'Department', id: string, name: string }, category: { __typename: 'Category', id: string, name: string, type: EntryType }, paymentMethod: { __typename: 'PaymentMethodCard', currency: Currency, card: { __typename: 'AccountCard', id: string, active: boolean, trailingDigits: string, type: PaymentCardType, account: { __typename: 'AccountChecking', id: string, name: string } | { __typename: 'AccountCreditCard', id: string, name: string }, aliases: Array<{ __typename?: 'Alias', name: string }> } | { __typename: 'PaymentCard', trailingDigits: string, type: PaymentCardType } } | { __typename: 'PaymentMethodCash', currency: Currency } | { __typename: 'PaymentMethodCheck', currency: Currency, check: { __typename: 'AccountCheck', checkNumber: string, account: { __typename: 'AccountChecking', id: string, name: string, accountNumber: string } } | { __typename: 'PaymentCheck', checkNumber: string } } | { __typename: 'PaymentMethodCombination', currency: Currency } | { __typename: 'PaymentMethodOnline', currency: Currency } | { __typename: 'PaymentMethodUnknown', currency: Currency }, source: { __typename: 'Business', id: string, name: string } | { __typename: 'Department', id: string, name: string } | { __typename: 'Person', id: string, personName: { __typename?: 'PersonName', first: string, last: string } } } } };

export type NewEntryRefundMutationVariables = Exact<{
  newEntryRefund: NewEntryRefund;
}>;


export type NewEntryRefundMutation = { __typename?: 'Mutation', addNewEntryRefund: { __typename?: 'AddNewEntryRefundPayload', newEntryRefund: { __typename: 'EntryRefund', id: string, entry: { __typename: 'Entry', id: string, date: string, description?: string | null | undefined, total: string, reconciled: boolean, deleted: boolean, refunds: Array<{ __typename: 'EntryRefund', id: string, date: string, description?: string | null | undefined, total: string, reconciled: boolean, deleted: boolean, dateOfRecord?: { __typename?: 'EntryDateOfRecord', date: string } | null | undefined, paymentMethod: { __typename: 'PaymentMethodCard', currency: Currency, card: { __typename: 'AccountCard', id: string, active: boolean, trailingDigits: string, type: PaymentCardType, account: { __typename: 'AccountChecking', id: string, name: string } | { __typename: 'AccountCreditCard', id: string, name: string }, aliases: Array<{ __typename?: 'Alias', name: string }> } | { __typename: 'PaymentCard', trailingDigits: string, type: PaymentCardType } } | { __typename: 'PaymentMethodCash', currency: Currency } | { __typename: 'PaymentMethodCheck', currency: Currency, check: { __typename: 'AccountCheck', checkNumber: string, account: { __typename: 'AccountChecking', id: string, name: string, accountNumber: string } } | { __typename: 'PaymentCheck', checkNumber: string } } | { __typename: 'PaymentMethodCombination', currency: Currency } | { __typename: 'PaymentMethodOnline', currency: Currency } | { __typename: 'PaymentMethodUnknown', currency: Currency } }>, dateOfRecord?: { __typename?: 'EntryDateOfRecord', date: string } | null | undefined, department: { __typename: 'Department', id: string, name: string }, category: { __typename: 'Category', id: string, name: string, type: EntryType }, paymentMethod: { __typename: 'PaymentMethodCard', currency: Currency, card: { __typename: 'AccountCard', id: string, active: boolean, trailingDigits: string, type: PaymentCardType, account: { __typename: 'AccountChecking', id: string, name: string } | { __typename: 'AccountCreditCard', id: string, name: string }, aliases: Array<{ __typename?: 'Alias', name: string }> } | { __typename: 'PaymentCard', trailingDigits: string, type: PaymentCardType } } | { __typename: 'PaymentMethodCash', currency: Currency } | { __typename: 'PaymentMethodCheck', currency: Currency, check: { __typename: 'AccountCheck', checkNumber: string, account: { __typename: 'AccountChecking', id: string, name: string, accountNumber: string } } | { __typename: 'PaymentCheck', checkNumber: string } } | { __typename: 'PaymentMethodCombination', currency: Currency } | { __typename: 'PaymentMethodOnline', currency: Currency } | { __typename: 'PaymentMethodUnknown', currency: Currency }, source: { __typename: 'Business', id: string, name: string } | { __typename: 'Department', id: string, name: string } | { __typename: 'Person', id: string, personName: { __typename?: 'PersonName', first: string, last: string } } } } } };

export type UpdateEntryRefundMutationVariables = Exact<{
  updateEntryRefund: UpdateEntryRefund;
}>;


export type UpdateEntryRefundMutation = { __typename?: 'Mutation', updateEntryRefund: { __typename?: 'UpdateEntryRefundPayload', updatedEntryRefund: { __typename: 'EntryRefund', id: string, date: string, description?: string | null | undefined, total: string, reconciled: boolean, deleted: boolean, dateOfRecord?: { __typename?: 'EntryDateOfRecord', date: string } | null | undefined, paymentMethod: { __typename: 'PaymentMethodCard', currency: Currency, card: { __typename: 'AccountCard', id: string, active: boolean, trailingDigits: string, type: PaymentCardType, account: { __typename: 'AccountChecking', id: string, name: string } | { __typename: 'AccountCreditCard', id: string, name: string }, aliases: Array<{ __typename?: 'Alias', name: string }> } | { __typename: 'PaymentCard', trailingDigits: string, type: PaymentCardType } } | { __typename: 'PaymentMethodCash', currency: Currency } | { __typename: 'PaymentMethodCheck', currency: Currency, check: { __typename: 'AccountCheck', checkNumber: string, account: { __typename: 'AccountChecking', id: string, name: string, accountNumber: string } } | { __typename: 'PaymentCheck', checkNumber: string } } | { __typename: 'PaymentMethodCombination', currency: Currency } | { __typename: 'PaymentMethodOnline', currency: Currency } | { __typename: 'PaymentMethodUnknown', currency: Currency } } } };

export type DeptsForNav_1QueryVariables = Exact<{ [key: string]: never; }>;


export type DeptsForNav_1Query = { __typename?: 'Query', departments: Array<{ __typename: 'Department', id: string, name: string, virtualRoot?: boolean | null | undefined, parent: { __typename: 'Business', id: string } | { __typename: 'Department', id: string } }> };



export type ResolverTypeWrapper<T> = Promise<T> | T;


export type ResolverWithResolve<TResult, TParent, TContext, TArgs> = {
  resolve: ResolverFn<TResult, TParent, TContext, TArgs>;
};
export type Resolver<TResult, TParent = {}, TContext = {}, TArgs = {}> = ResolverFn<TResult, TParent, TContext, TArgs> | ResolverWithResolve<TResult, TParent, TContext, TArgs>;

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
) => AsyncIterable<TResult> | Promise<AsyncIterable<TResult>>;

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
  AccountCard: ResolverTypeWrapper<Omit<AccountCard, 'authorizedUsers'> & { authorizedUsers: Array<ResolversTypes['Entity']> }>;
  AccountCardsWhere: AccountCardsWhere;
  AccountCheck: ResolverTypeWrapper<AccountCheck>;
  AccountCheckInput: AccountCheckInput;
  AccountChecking: ResolverTypeWrapper<Omit<AccountChecking, 'owner'> & { owner: ResolversTypes['Entity'] }>;
  AccountCreditCard: ResolverTypeWrapper<Omit<AccountCreditCard, 'owner'> & { owner: ResolversTypes['Entity'] }>;
  AccountInterface: ResolversTypes['AccountChecking'] | ResolversTypes['AccountCreditCard'];
  AccountType: AccountType;
  AccountWithCardsInterface: ResolversTypes['AccountChecking'] | ResolversTypes['AccountCreditCard'];
  AccountsWhere: AccountsWhere;
  AddNewEntryPayload: ResolverTypeWrapper<AddNewEntryPayload>;
  AddNewEntryRefundPayload: ResolverTypeWrapper<AddNewEntryRefundPayload>;
  AddNewPersonPayload: ResolverTypeWrapper<AddNewPersonPayload>;
  Alias: ResolverTypeWrapper<Alias>;
  Aliasable: ResolversTypes['AccountCard'];
  AliasesWhere: AliasesWhere;
  Boolean: ResolverTypeWrapper<Scalars['Boolean']>;
  Budget: ResolverTypeWrapper<Omit<Budget, 'owner'> & { owner: ResolversTypes['BudgetOwner'] }>;
  BudgetOwner: ResolversTypes['Business'] | ResolversTypes['Department'];
  BudgetsWhere: BudgetsWhere;
  Business: ResolverTypeWrapper<Business>;
  BusinessesWhere: BusinessesWhere;
  CategoriesWhere: CategoriesWhere;
  Category: ResolverTypeWrapper<Category>;
  Currency: Currency;
  Date: ResolverTypeWrapper<Scalars['Date']>;
  DeleteEntryPayload: ResolverTypeWrapper<DeleteEntryPayload>;
  DeleteEntryRefundPayload: ResolverTypeWrapper<DeleteEntryRefundPayload>;
  Department: ResolverTypeWrapper<Omit<Department, 'ancestors' | 'parent'> & { ancestors: Array<ResolversTypes['DepartmentAncestor']>, parent: ResolversTypes['DepartmentAncestor'] }>;
  DepartmentAncestor: ResolversTypes['Business'] | ResolversTypes['Department'];
  DepartmentsWhere: DepartmentsWhere;
  EntitiesWhere: EntitiesWhere;
  Entity: ResolversTypes['Business'] | ResolversTypes['Department'] | ResolversTypes['Person'];
  EntityInput: EntityInput;
  EntityType: EntityType;
  EntriesWhere: EntriesWhere;
  EntriesWhereDateOfRecord: EntriesWhereDateOfRecord;
  EntriesWhereSource: EntriesWhereSource;
  Entry: ResolverTypeWrapper<Omit<Entry, 'source'> & { source: ResolversTypes['Entity'] }>;
  EntryDateOfRecord: ResolverTypeWrapper<EntryDateOfRecord>;
  EntryItem: ResolverTypeWrapper<EntryItem>;
  EntryItemsWhere: EntryItemsWhere;
  EntryRefund: ResolverTypeWrapper<EntryRefund>;
  EntryRefundsWhere: EntryRefundsWhere;
  EntryType: EntryType;
  FiscalYear: ResolverTypeWrapper<FiscalYear>;
  FiscalYearsWhere: FiscalYearsWhere;
  ID: ResolverTypeWrapper<Scalars['ID']>;
  Int: ResolverTypeWrapper<Scalars['Int']>;
  Mutation: ResolverTypeWrapper<{}>;
  NewAlias: NewAlias;
  NewBusiness: NewBusiness;
  NewEntry: NewEntry;
  NewEntryDateOfRecord: NewEntryDateOfRecord;
  NewEntryRefund: NewEntryRefund;
  NewPerson: NewPerson;
  NodeInput: NodeInput;
  PaymentCard: ResolverTypeWrapper<PaymentCard>;
  PaymentCardInput: PaymentCardInput;
  PaymentCardInterface: ResolversTypes['AccountCard'] | ResolversTypes['PaymentCard'];
  PaymentCardType: PaymentCardType;
  PaymentCheck: ResolverTypeWrapper<PaymentCheck>;
  PaymentCheckInput: PaymentCheckInput;
  PaymentCheckInterface: ResolversTypes['AccountCheck'] | ResolversTypes['PaymentCheck'];
  PaymentMethodAccountCardInput: PaymentMethodAccountCardInput;
  PaymentMethodAccountCheckInput: PaymentMethodAccountCheckInput;
  PaymentMethodCard: ResolverTypeWrapper<PaymentMethodCard>;
  PaymentMethodCardInput: PaymentMethodCardInput;
  PaymentMethodCash: ResolverTypeWrapper<PaymentMethodCash>;
  PaymentMethodCashInput: PaymentMethodCashInput;
  PaymentMethodCheck: ResolverTypeWrapper<PaymentMethodCheck>;
  PaymentMethodCheckInput: PaymentMethodCheckInput;
  PaymentMethodCombination: ResolverTypeWrapper<PaymentMethodCombination>;
  PaymentMethodCombinationInput: PaymentMethodCombinationInput;
  PaymentMethodInterface: ResolversTypes['PaymentMethodCard'] | ResolversTypes['PaymentMethodCash'] | ResolversTypes['PaymentMethodCheck'] | ResolversTypes['PaymentMethodCombination'] | ResolversTypes['PaymentMethodOnline'] | ResolversTypes['PaymentMethodUnknown'];
  PaymentMethodOnline: ResolverTypeWrapper<PaymentMethodOnline>;
  PaymentMethodOnlineInput: PaymentMethodOnlineInput;
  PaymentMethodType: PaymentMethodType;
  PaymentMethodUnknown: ResolverTypeWrapper<PaymentMethodUnknown>;
  PaymentMethodUnknownInput: PaymentMethodUnknownInput;
  PeopleNameWhere: PeopleNameWhere;
  PeopleWhere: PeopleWhere;
  Person: ResolverTypeWrapper<Person>;
  PersonName: ResolverTypeWrapper<PersonName>;
  PersonNameInput: PersonNameInput;
  Query: ResolverTypeWrapper<{}>;
  Rational: ResolverTypeWrapper<Scalars['Rational']>;
  ReconcileEntries: ReconcileEntries;
  ReconcileEntriesPayload: ResolverTypeWrapper<ReconcileEntriesPayload>;
  RegexFlags: RegexFlags;
  Source: ResolversTypes['Business'] | ResolversTypes['Department'] | ResolversTypes['Person'];
  String: ResolverTypeWrapper<Scalars['String']>;
  Subscription: ResolverTypeWrapper<{}>;
  UpdateEntry: UpdateEntry;
  UpdateEntryDateOfRecord: UpdateEntryDateOfRecord;
  UpdateEntryPayload: ResolverTypeWrapper<UpdateEntryPayload>;
  UpdateEntryRefund: UpdateEntryRefund;
  UpdateEntryRefundPayload: ResolverTypeWrapper<UpdateEntryRefundPayload>;
  UpsertEntrySource: UpsertEntrySource;
  UpsertPaymentMethod: UpsertPaymentMethod;
  User: ResolverTypeWrapper<User>;
  Vendor: ResolverTypeWrapper<Vendor>;
  WhereDate: WhereDate;
  WhereId: WhereId;
  WhereInt: WhereInt;
  WhereNode: WhereNode;
  WhereRational: WhereRational;
  WhereRegex: WhereRegex;
  WhereTreeId: WhereTreeId;
};

/** Mapping between all available schema types and the resolvers parents */
export type ResolversParentTypes = {
  AccountCard: Omit<AccountCard, 'authorizedUsers'> & { authorizedUsers: Array<ResolversParentTypes['Entity']> };
  AccountCardsWhere: AccountCardsWhere;
  AccountCheck: AccountCheck;
  AccountCheckInput: AccountCheckInput;
  AccountChecking: Omit<AccountChecking, 'owner'> & { owner: ResolversParentTypes['Entity'] };
  AccountCreditCard: Omit<AccountCreditCard, 'owner'> & { owner: ResolversParentTypes['Entity'] };
  AccountInterface: ResolversParentTypes['AccountChecking'] | ResolversParentTypes['AccountCreditCard'];
  AccountWithCardsInterface: ResolversParentTypes['AccountChecking'] | ResolversParentTypes['AccountCreditCard'];
  AccountsWhere: AccountsWhere;
  AddNewEntryPayload: AddNewEntryPayload;
  AddNewEntryRefundPayload: AddNewEntryRefundPayload;
  AddNewPersonPayload: AddNewPersonPayload;
  Alias: Alias;
  Aliasable: ResolversParentTypes['AccountCard'];
  AliasesWhere: AliasesWhere;
  Boolean: Scalars['Boolean'];
  Budget: Omit<Budget, 'owner'> & { owner: ResolversParentTypes['BudgetOwner'] };
  BudgetOwner: ResolversParentTypes['Business'] | ResolversParentTypes['Department'];
  BudgetsWhere: BudgetsWhere;
  Business: Business;
  BusinessesWhere: BusinessesWhere;
  CategoriesWhere: CategoriesWhere;
  Category: Category;
  Date: Scalars['Date'];
  DeleteEntryPayload: DeleteEntryPayload;
  DeleteEntryRefundPayload: DeleteEntryRefundPayload;
  Department: Omit<Department, 'ancestors' | 'parent'> & { ancestors: Array<ResolversParentTypes['DepartmentAncestor']>, parent: ResolversParentTypes['DepartmentAncestor'] };
  DepartmentAncestor: ResolversParentTypes['Business'] | ResolversParentTypes['Department'];
  DepartmentsWhere: DepartmentsWhere;
  EntitiesWhere: EntitiesWhere;
  Entity: ResolversParentTypes['Business'] | ResolversParentTypes['Department'] | ResolversParentTypes['Person'];
  EntityInput: EntityInput;
  EntriesWhere: EntriesWhere;
  EntriesWhereDateOfRecord: EntriesWhereDateOfRecord;
  EntriesWhereSource: EntriesWhereSource;
  Entry: Omit<Entry, 'source'> & { source: ResolversParentTypes['Entity'] };
  EntryDateOfRecord: EntryDateOfRecord;
  EntryItem: EntryItem;
  EntryItemsWhere: EntryItemsWhere;
  EntryRefund: EntryRefund;
  EntryRefundsWhere: EntryRefundsWhere;
  FiscalYear: FiscalYear;
  FiscalYearsWhere: FiscalYearsWhere;
  ID: Scalars['ID'];
  Int: Scalars['Int'];
  Mutation: {};
  NewAlias: NewAlias;
  NewBusiness: NewBusiness;
  NewEntry: NewEntry;
  NewEntryDateOfRecord: NewEntryDateOfRecord;
  NewEntryRefund: NewEntryRefund;
  NewPerson: NewPerson;
  NodeInput: NodeInput;
  PaymentCard: PaymentCard;
  PaymentCardInput: PaymentCardInput;
  PaymentCardInterface: ResolversParentTypes['AccountCard'] | ResolversParentTypes['PaymentCard'];
  PaymentCheck: PaymentCheck;
  PaymentCheckInput: PaymentCheckInput;
  PaymentCheckInterface: ResolversParentTypes['AccountCheck'] | ResolversParentTypes['PaymentCheck'];
  PaymentMethodAccountCardInput: PaymentMethodAccountCardInput;
  PaymentMethodAccountCheckInput: PaymentMethodAccountCheckInput;
  PaymentMethodCard: PaymentMethodCard;
  PaymentMethodCardInput: PaymentMethodCardInput;
  PaymentMethodCash: PaymentMethodCash;
  PaymentMethodCashInput: PaymentMethodCashInput;
  PaymentMethodCheck: PaymentMethodCheck;
  PaymentMethodCheckInput: PaymentMethodCheckInput;
  PaymentMethodCombination: PaymentMethodCombination;
  PaymentMethodCombinationInput: PaymentMethodCombinationInput;
  PaymentMethodInterface: ResolversParentTypes['PaymentMethodCard'] | ResolversParentTypes['PaymentMethodCash'] | ResolversParentTypes['PaymentMethodCheck'] | ResolversParentTypes['PaymentMethodCombination'] | ResolversParentTypes['PaymentMethodOnline'] | ResolversParentTypes['PaymentMethodUnknown'];
  PaymentMethodOnline: PaymentMethodOnline;
  PaymentMethodOnlineInput: PaymentMethodOnlineInput;
  PaymentMethodUnknown: PaymentMethodUnknown;
  PaymentMethodUnknownInput: PaymentMethodUnknownInput;
  PeopleNameWhere: PeopleNameWhere;
  PeopleWhere: PeopleWhere;
  Person: Person;
  PersonName: PersonName;
  PersonNameInput: PersonNameInput;
  Query: {};
  Rational: Scalars['Rational'];
  ReconcileEntries: ReconcileEntries;
  ReconcileEntriesPayload: ReconcileEntriesPayload;
  Source: ResolversParentTypes['Business'] | ResolversParentTypes['Department'] | ResolversParentTypes['Person'];
  String: Scalars['String'];
  Subscription: {};
  UpdateEntry: UpdateEntry;
  UpdateEntryDateOfRecord: UpdateEntryDateOfRecord;
  UpdateEntryPayload: UpdateEntryPayload;
  UpdateEntryRefund: UpdateEntryRefund;
  UpdateEntryRefundPayload: UpdateEntryRefundPayload;
  UpsertEntrySource: UpsertEntrySource;
  UpsertPaymentMethod: UpsertPaymentMethod;
  User: User;
  Vendor: Vendor;
  WhereDate: WhereDate;
  WhereId: WhereId;
  WhereInt: WhereInt;
  WhereNode: WhereNode;
  WhereRational: WhereRational;
  WhereRegex: WhereRegex;
  WhereTreeId: WhereTreeId;
};

export type AccountCardResolvers<ContextType = Context, ParentType extends ResolversParentTypes['AccountCard'] = ResolversParentTypes['AccountCard']> = {
  account?: Resolver<ResolversTypes['AccountWithCardsInterface'], ParentType, ContextType>;
  active?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  aliases?: Resolver<Array<ResolversTypes['Alias']>, ParentType, ContextType, RequireFields<AccountCardAliasesArgs, never>>;
  authorizedUsers?: Resolver<Array<ResolversTypes['Entity']>, ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  trailingDigits?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  type?: Resolver<ResolversTypes['PaymentCardType'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type AccountCheckResolvers<ContextType = Context, ParentType extends ResolversParentTypes['AccountCheck'] = ResolversParentTypes['AccountCheck']> = {
  account?: Resolver<ResolversTypes['AccountChecking'], ParentType, ContextType>;
  checkNumber?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type AccountCheckingResolvers<ContextType = Context, ParentType extends ResolversParentTypes['AccountChecking'] = ResolversParentTypes['AccountChecking']> = {
  accountNumber?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  active?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  cards?: Resolver<Array<ResolversTypes['AccountCard']>, ParentType, ContextType>;
  currency?: Resolver<ResolversTypes['Currency'], ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  name?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  owner?: Resolver<ResolversTypes['Entity'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type AccountCreditCardResolvers<ContextType = Context, ParentType extends ResolversParentTypes['AccountCreditCard'] = ResolversParentTypes['AccountCreditCard']> = {
  active?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  cards?: Resolver<Array<ResolversTypes['AccountCard']>, ParentType, ContextType>;
  currency?: Resolver<ResolversTypes['Currency'], ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  name?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  owner?: Resolver<ResolversTypes['Entity'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type AccountInterfaceResolvers<ContextType = Context, ParentType extends ResolversParentTypes['AccountInterface'] = ResolversParentTypes['AccountInterface']> = {
  __resolveType: TypeResolveFn<'AccountChecking' | 'AccountCreditCard', ParentType, ContextType>;
  active?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  currency?: Resolver<ResolversTypes['Currency'], ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  name?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  owner?: Resolver<ResolversTypes['Entity'], ParentType, ContextType>;
};

export type AccountWithCardsInterfaceResolvers<ContextType = Context, ParentType extends ResolversParentTypes['AccountWithCardsInterface'] = ResolversParentTypes['AccountWithCardsInterface']> = {
  __resolveType: TypeResolveFn<'AccountChecking' | 'AccountCreditCard', ParentType, ContextType>;
  active?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  cards?: Resolver<Array<ResolversTypes['AccountCard']>, ParentType, ContextType>;
  currency?: Resolver<ResolversTypes['Currency'], ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  name?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  owner?: Resolver<ResolversTypes['Entity'], ParentType, ContextType>;
};

export type AddNewEntryPayloadResolvers<ContextType = Context, ParentType extends ResolversParentTypes['AddNewEntryPayload'] = ResolversParentTypes['AddNewEntryPayload']> = {
  newEntry?: Resolver<ResolversTypes['Entry'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type AddNewEntryRefundPayloadResolvers<ContextType = Context, ParentType extends ResolversParentTypes['AddNewEntryRefundPayload'] = ResolversParentTypes['AddNewEntryRefundPayload']> = {
  newEntryRefund?: Resolver<ResolversTypes['EntryRefund'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type AddNewPersonPayloadResolvers<ContextType = Context, ParentType extends ResolversParentTypes['AddNewPersonPayload'] = ResolversParentTypes['AddNewPersonPayload']> = {
  newPerson?: Resolver<ResolversTypes['Person'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type AliasResolvers<ContextType = Context, ParentType extends ResolversParentTypes['Alias'] = ResolversParentTypes['Alias']> = {
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  name?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type AliasableResolvers<ContextType = Context, ParentType extends ResolversParentTypes['Aliasable'] = ResolversParentTypes['Aliasable']> = {
  __resolveType: TypeResolveFn<'AccountCard', ParentType, ContextType>;
  aliases?: Resolver<Array<ResolversTypes['Alias']>, ParentType, ContextType, RequireFields<AliasableAliasesArgs, never>>;
};

export type BudgetResolvers<ContextType = Context, ParentType extends ResolversParentTypes['Budget'] = ResolversParentTypes['Budget']> = {
  amount?: Resolver<ResolversTypes['Rational'], ParentType, ContextType>;
  fiscalYear?: Resolver<ResolversTypes['FiscalYear'], ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  owner?: Resolver<ResolversTypes['BudgetOwner'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type BudgetOwnerResolvers<ContextType = Context, ParentType extends ResolversParentTypes['BudgetOwner'] = ResolversParentTypes['BudgetOwner']> = {
  __resolveType: TypeResolveFn<'Business' | 'Department', ParentType, ContextType>;
};

export type BusinessResolvers<ContextType = Context, ParentType extends ResolversParentTypes['Business'] = ResolversParentTypes['Business']> = {
  budgets?: Resolver<Array<ResolversTypes['Budget']>, ParentType, ContextType>;
  departments?: Resolver<Array<ResolversTypes['Department']>, ParentType, ContextType, RequireFields<BusinessDepartmentsArgs, 'root'>>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  name?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  vendor?: Resolver<Maybe<ResolversTypes['Vendor']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type CategoryResolvers<ContextType = Context, ParentType extends ResolversParentTypes['Category'] = ResolversParentTypes['Category']> = {
  active?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  aliases?: Resolver<Array<ResolversTypes['Alias']>, ParentType, ContextType>;
  ancestors?: Resolver<Array<ResolversTypes['Category']>, ParentType, ContextType>;
  children?: Resolver<Array<ResolversTypes['Category']>, ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  name?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  parent?: Resolver<Maybe<ResolversTypes['Category']>, ParentType, ContextType>;
  type?: Resolver<ResolversTypes['EntryType'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export interface DateScalarConfig extends GraphQLScalarTypeConfig<ResolversTypes['Date'], any> {
  name: 'Date';
}

export type DeleteEntryPayloadResolvers<ContextType = Context, ParentType extends ResolversParentTypes['DeleteEntryPayload'] = ResolversParentTypes['DeleteEntryPayload']> = {
  deletedEntry?: Resolver<ResolversTypes['Entry'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type DeleteEntryRefundPayloadResolvers<ContextType = Context, ParentType extends ResolversParentTypes['DeleteEntryRefundPayload'] = ResolversParentTypes['DeleteEntryRefundPayload']> = {
  deletedEntryRefund?: Resolver<ResolversTypes['EntryRefund'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type DepartmentResolvers<ContextType = Context, ParentType extends ResolversParentTypes['Department'] = ResolversParentTypes['Department']> = {
  aliases?: Resolver<Array<ResolversTypes['Alias']>, ParentType, ContextType>;
  ancestors?: Resolver<Array<ResolversTypes['DepartmentAncestor']>, ParentType, ContextType, RequireFields<DepartmentAncestorsArgs, never>>;
  budgets?: Resolver<Array<ResolversTypes['Budget']>, ParentType, ContextType>;
  business?: Resolver<ResolversTypes['Business'], ParentType, ContextType>;
  children?: Resolver<Array<ResolversTypes['Department']>, ParentType, ContextType>;
  code?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  descendants?: Resolver<Array<ResolversTypes['Department']>, ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  name?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  parent?: Resolver<ResolversTypes['DepartmentAncestor'], ParentType, ContextType>;
  virtualRoot?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type DepartmentAncestorResolvers<ContextType = Context, ParentType extends ResolversParentTypes['DepartmentAncestor'] = ResolversParentTypes['DepartmentAncestor']> = {
  __resolveType: TypeResolveFn<'Business' | 'Department', ParentType, ContextType>;
};

export type EntityResolvers<ContextType = Context, ParentType extends ResolversParentTypes['Entity'] = ResolversParentTypes['Entity']> = {
  __resolveType: TypeResolveFn<'Business' | 'Department' | 'Person', ParentType, ContextType>;
};

export type EntryResolvers<ContextType = Context, ParentType extends ResolversParentTypes['Entry'] = ResolversParentTypes['Entry']> = {
  category?: Resolver<ResolversTypes['Category'], ParentType, ContextType>;
  date?: Resolver<ResolversTypes['Date'], ParentType, ContextType>;
  dateOfRecord?: Resolver<Maybe<ResolversTypes['EntryDateOfRecord']>, ParentType, ContextType>;
  deleted?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  department?: Resolver<ResolversTypes['Department'], ParentType, ContextType>;
  description?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  fiscalYear?: Resolver<ResolversTypes['FiscalYear'], ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  items?: Resolver<Array<ResolversTypes['EntryItem']>, ParentType, ContextType>;
  lastUpdate?: Resolver<ResolversTypes['Date'], ParentType, ContextType>;
  paymentMethod?: Resolver<ResolversTypes['PaymentMethodInterface'], ParentType, ContextType>;
  reconciled?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  refunds?: Resolver<Array<ResolversTypes['EntryRefund']>, ParentType, ContextType>;
  source?: Resolver<ResolversTypes['Entity'], ParentType, ContextType>;
  total?: Resolver<ResolversTypes['Rational'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type EntryDateOfRecordResolvers<ContextType = Context, ParentType extends ResolversParentTypes['EntryDateOfRecord'] = ResolversParentTypes['EntryDateOfRecord']> = {
  date?: Resolver<ResolversTypes['Date'], ParentType, ContextType>;
  overrideFiscalYear?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type EntryItemResolvers<ContextType = Context, ParentType extends ResolversParentTypes['EntryItem'] = ResolversParentTypes['EntryItem']> = {
  category?: Resolver<Maybe<ResolversTypes['Category']>, ParentType, ContextType>;
  deleted?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  department?: Resolver<Maybe<ResolversTypes['Department']>, ParentType, ContextType>;
  description?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  lastUpdate?: Resolver<ResolversTypes['Date'], ParentType, ContextType>;
  total?: Resolver<ResolversTypes['Rational'], ParentType, ContextType>;
  units?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type EntryRefundResolvers<ContextType = Context, ParentType extends ResolversParentTypes['EntryRefund'] = ResolversParentTypes['EntryRefund']> = {
  date?: Resolver<ResolversTypes['Date'], ParentType, ContextType>;
  dateOfRecord?: Resolver<Maybe<ResolversTypes['EntryDateOfRecord']>, ParentType, ContextType>;
  deleted?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  description?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  entry?: Resolver<ResolversTypes['Entry'], ParentType, ContextType>;
  fiscalYear?: Resolver<ResolversTypes['FiscalYear'], ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  lastUpdate?: Resolver<ResolversTypes['Date'], ParentType, ContextType>;
  paymentMethod?: Resolver<ResolversTypes['PaymentMethodInterface'], ParentType, ContextType>;
  reconciled?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  total?: Resolver<ResolversTypes['Rational'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type FiscalYearResolvers<ContextType = Context, ParentType extends ResolversParentTypes['FiscalYear'] = ResolversParentTypes['FiscalYear']> = {
  begin?: Resolver<ResolversTypes['Date'], ParentType, ContextType>;
  end?: Resolver<ResolversTypes['Date'], ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  name?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type MutationResolvers<ContextType = Context, ParentType extends ResolversParentTypes['Mutation'] = ResolversParentTypes['Mutation']> = {
  addNewBusiness?: Resolver<ResolversTypes['Business'], ParentType, ContextType, RequireFields<MutationAddNewBusinessArgs, 'input'>>;
  addNewEntry?: Resolver<ResolversTypes['AddNewEntryPayload'], ParentType, ContextType, RequireFields<MutationAddNewEntryArgs, 'input'>>;
  addNewEntryRefund?: Resolver<ResolversTypes['AddNewEntryRefundPayload'], ParentType, ContextType, RequireFields<MutationAddNewEntryRefundArgs, 'input'>>;
  addNewPerson?: Resolver<ResolversTypes['AddNewPersonPayload'], ParentType, ContextType, RequireFields<MutationAddNewPersonArgs, 'input'>>;
  deleteEntry?: Resolver<ResolversTypes['DeleteEntryPayload'], ParentType, ContextType, RequireFields<MutationDeleteEntryArgs, 'id'>>;
  deleteEntryRefund?: Resolver<ResolversTypes['DeleteEntryRefundPayload'], ParentType, ContextType, RequireFields<MutationDeleteEntryRefundArgs, 'id'>>;
  reconcileEntries?: Resolver<ResolversTypes['ReconcileEntriesPayload'], ParentType, ContextType, RequireFields<MutationReconcileEntriesArgs, never>>;
  updateEntry?: Resolver<ResolversTypes['UpdateEntryPayload'], ParentType, ContextType, RequireFields<MutationUpdateEntryArgs, 'input'>>;
  updateEntryRefund?: Resolver<ResolversTypes['UpdateEntryRefundPayload'], ParentType, ContextType, RequireFields<MutationUpdateEntryRefundArgs, 'input'>>;
};

export type PaymentCardResolvers<ContextType = Context, ParentType extends ResolversParentTypes['PaymentCard'] = ResolversParentTypes['PaymentCard']> = {
  trailingDigits?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  type?: Resolver<ResolversTypes['PaymentCardType'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type PaymentCardInterfaceResolvers<ContextType = Context, ParentType extends ResolversParentTypes['PaymentCardInterface'] = ResolversParentTypes['PaymentCardInterface']> = {
  __resolveType: TypeResolveFn<'AccountCard' | 'PaymentCard', ParentType, ContextType>;
  trailingDigits?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  type?: Resolver<ResolversTypes['PaymentCardType'], ParentType, ContextType>;
};

export type PaymentCheckResolvers<ContextType = Context, ParentType extends ResolversParentTypes['PaymentCheck'] = ResolversParentTypes['PaymentCheck']> = {
  checkNumber?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type PaymentCheckInterfaceResolvers<ContextType = Context, ParentType extends ResolversParentTypes['PaymentCheckInterface'] = ResolversParentTypes['PaymentCheckInterface']> = {
  __resolveType: TypeResolveFn<'AccountCheck' | 'PaymentCheck', ParentType, ContextType>;
  checkNumber?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
};

export type PaymentMethodCardResolvers<ContextType = Context, ParentType extends ResolversParentTypes['PaymentMethodCard'] = ResolversParentTypes['PaymentMethodCard']> = {
  card?: Resolver<ResolversTypes['PaymentCardInterface'], ParentType, ContextType>;
  currency?: Resolver<ResolversTypes['Currency'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type PaymentMethodCashResolvers<ContextType = Context, ParentType extends ResolversParentTypes['PaymentMethodCash'] = ResolversParentTypes['PaymentMethodCash']> = {
  currency?: Resolver<ResolversTypes['Currency'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type PaymentMethodCheckResolvers<ContextType = Context, ParentType extends ResolversParentTypes['PaymentMethodCheck'] = ResolversParentTypes['PaymentMethodCheck']> = {
  check?: Resolver<ResolversTypes['PaymentCheckInterface'], ParentType, ContextType>;
  currency?: Resolver<ResolversTypes['Currency'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type PaymentMethodCombinationResolvers<ContextType = Context, ParentType extends ResolversParentTypes['PaymentMethodCombination'] = ResolversParentTypes['PaymentMethodCombination']> = {
  currency?: Resolver<ResolversTypes['Currency'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type PaymentMethodInterfaceResolvers<ContextType = Context, ParentType extends ResolversParentTypes['PaymentMethodInterface'] = ResolversParentTypes['PaymentMethodInterface']> = {
  __resolveType: TypeResolveFn<'PaymentMethodCard' | 'PaymentMethodCash' | 'PaymentMethodCheck' | 'PaymentMethodCombination' | 'PaymentMethodOnline' | 'PaymentMethodUnknown', ParentType, ContextType>;
  currency?: Resolver<ResolversTypes['Currency'], ParentType, ContextType>;
};

export type PaymentMethodOnlineResolvers<ContextType = Context, ParentType extends ResolversParentTypes['PaymentMethodOnline'] = ResolversParentTypes['PaymentMethodOnline']> = {
  currency?: Resolver<ResolversTypes['Currency'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type PaymentMethodUnknownResolvers<ContextType = Context, ParentType extends ResolversParentTypes['PaymentMethodUnknown'] = ResolversParentTypes['PaymentMethodUnknown']> = {
  currency?: Resolver<ResolversTypes['Currency'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type PersonResolvers<ContextType = Context, ParentType extends ResolversParentTypes['Person'] = ResolversParentTypes['Person']> = {
  email?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  name?: Resolver<ResolversTypes['PersonName'], ParentType, ContextType>;
  phone?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type PersonNameResolvers<ContextType = Context, ParentType extends ResolversParentTypes['PersonName'] = ResolversParentTypes['PersonName']> = {
  first?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  last?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type QueryResolvers<ContextType = Context, ParentType extends ResolversParentTypes['Query'] = ResolversParentTypes['Query']> = {
  account?: Resolver<ResolversTypes['AccountInterface'], ParentType, ContextType, RequireFields<QueryAccountArgs, 'id'>>;
  accountCard?: Resolver<ResolversTypes['AccountCard'], ParentType, ContextType, RequireFields<QueryAccountCardArgs, 'id'>>;
  accountCards?: Resolver<Array<ResolversTypes['AccountCard']>, ParentType, ContextType, RequireFields<QueryAccountCardsArgs, never>>;
  accounts?: Resolver<Array<ResolversTypes['AccountInterface']>, ParentType, ContextType, RequireFields<QueryAccountsArgs, never>>;
  budget?: Resolver<ResolversTypes['Budget'], ParentType, ContextType, RequireFields<QueryBudgetArgs, 'id'>>;
  budgets?: Resolver<Array<ResolversTypes['Budget']>, ParentType, ContextType, RequireFields<QueryBudgetsArgs, never>>;
  business?: Resolver<ResolversTypes['Business'], ParentType, ContextType, RequireFields<QueryBusinessArgs, 'id'>>;
  businesses?: Resolver<Array<ResolversTypes['Business']>, ParentType, ContextType, RequireFields<QueryBusinessesArgs, never>>;
  categories?: Resolver<Array<ResolversTypes['Category']>, ParentType, ContextType, RequireFields<QueryCategoriesArgs, never>>;
  category?: Resolver<ResolversTypes['Category'], ParentType, ContextType, RequireFields<QueryCategoryArgs, 'id'>>;
  department?: Resolver<ResolversTypes['Department'], ParentType, ContextType, RequireFields<QueryDepartmentArgs, 'id'>>;
  departments?: Resolver<Array<ResolversTypes['Department']>, ParentType, ContextType, RequireFields<QueryDepartmentsArgs, never>>;
  entities?: Resolver<Array<ResolversTypes['Entity']>, ParentType, ContextType, RequireFields<QueryEntitiesArgs, 'where'>>;
  entries?: Resolver<Array<ResolversTypes['Entry']>, ParentType, ContextType, RequireFields<QueryEntriesArgs, 'filterRefunds'>>;
  entry?: Resolver<Maybe<ResolversTypes['Entry']>, ParentType, ContextType, RequireFields<QueryEntryArgs, 'id'>>;
  entryItem?: Resolver<Maybe<ResolversTypes['EntryItem']>, ParentType, ContextType, RequireFields<QueryEntryItemArgs, 'id'>>;
  entryRefund?: Resolver<Maybe<ResolversTypes['EntryRefund']>, ParentType, ContextType, RequireFields<QueryEntryRefundArgs, 'id'>>;
  entryRefunds?: Resolver<Array<ResolversTypes['EntryRefund']>, ParentType, ContextType, RequireFields<QueryEntryRefundsArgs, never>>;
  fiscalYear?: Resolver<ResolversTypes['FiscalYear'], ParentType, ContextType, RequireFields<QueryFiscalYearArgs, 'id'>>;
  fiscalYears?: Resolver<Array<ResolversTypes['FiscalYear']>, ParentType, ContextType, RequireFields<QueryFiscalYearsArgs, never>>;
  people?: Resolver<Array<ResolversTypes['Person']>, ParentType, ContextType, RequireFields<QueryPeopleArgs, never>>;
  person?: Resolver<ResolversTypes['Person'], ParentType, ContextType, RequireFields<QueryPersonArgs, 'id'>>;
  sources?: Resolver<Array<ResolversTypes['Source']>, ParentType, ContextType, RequireFields<QuerySourcesArgs, 'searchByName'>>;
};

export interface RationalScalarConfig extends GraphQLScalarTypeConfig<ResolversTypes['Rational'], any> {
  name: 'Rational';
}

export type ReconcileEntriesPayloadResolvers<ContextType = Context, ParentType extends ResolversParentTypes['ReconcileEntriesPayload'] = ResolversParentTypes['ReconcileEntriesPayload']> = {
  reconciledEntries?: Resolver<Array<ResolversTypes['Entry']>, ParentType, ContextType>;
  reconciledRefunds?: Resolver<Array<ResolversTypes['EntryRefund']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type SourceResolvers<ContextType = Context, ParentType extends ResolversParentTypes['Source'] = ResolversParentTypes['Source']> = {
  __resolveType: TypeResolveFn<'Business' | 'Department' | 'Person', ParentType, ContextType>;
};

export type SubscriptionResolvers<ContextType = Context, ParentType extends ResolversParentTypes['Subscription'] = ResolversParentTypes['Subscription']> = {
  entryAdded?: SubscriptionResolver<ResolversTypes['Entry'], "entryAdded", ParentType, ContextType>;
  entryUpdated?: SubscriptionResolver<ResolversTypes['Entry'], "entryUpdated", ParentType, ContextType>;
  entryUpserted?: SubscriptionResolver<ResolversTypes['Entry'], "entryUpserted", ParentType, ContextType>;
};

export type UpdateEntryPayloadResolvers<ContextType = Context, ParentType extends ResolversParentTypes['UpdateEntryPayload'] = ResolversParentTypes['UpdateEntryPayload']> = {
  updatedEntry?: Resolver<ResolversTypes['Entry'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type UpdateEntryRefundPayloadResolvers<ContextType = Context, ParentType extends ResolversParentTypes['UpdateEntryRefundPayload'] = ResolversParentTypes['UpdateEntryRefundPayload']> = {
  updatedEntryRefund?: Resolver<ResolversTypes['EntryRefund'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type UserResolvers<ContextType = Context, ParentType extends ResolversParentTypes['User'] = ResolversParentTypes['User']> = {
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  user?: Resolver<ResolversTypes['Person'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type VendorResolvers<ContextType = Context, ParentType extends ResolversParentTypes['Vendor'] = ResolversParentTypes['Vendor']> = {
  approved?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  vendorId?: Resolver<Maybe<ResolversTypes['ID']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type Resolvers<ContextType = Context> = {
  AccountCard?: AccountCardResolvers<ContextType>;
  AccountCheck?: AccountCheckResolvers<ContextType>;
  AccountChecking?: AccountCheckingResolvers<ContextType>;
  AccountCreditCard?: AccountCreditCardResolvers<ContextType>;
  AccountInterface?: AccountInterfaceResolvers<ContextType>;
  AccountWithCardsInterface?: AccountWithCardsInterfaceResolvers<ContextType>;
  AddNewEntryPayload?: AddNewEntryPayloadResolvers<ContextType>;
  AddNewEntryRefundPayload?: AddNewEntryRefundPayloadResolvers<ContextType>;
  AddNewPersonPayload?: AddNewPersonPayloadResolvers<ContextType>;
  Alias?: AliasResolvers<ContextType>;
  Aliasable?: AliasableResolvers<ContextType>;
  Budget?: BudgetResolvers<ContextType>;
  BudgetOwner?: BudgetOwnerResolvers<ContextType>;
  Business?: BusinessResolvers<ContextType>;
  Category?: CategoryResolvers<ContextType>;
  Date?: GraphQLScalarType;
  DeleteEntryPayload?: DeleteEntryPayloadResolvers<ContextType>;
  DeleteEntryRefundPayload?: DeleteEntryRefundPayloadResolvers<ContextType>;
  Department?: DepartmentResolvers<ContextType>;
  DepartmentAncestor?: DepartmentAncestorResolvers<ContextType>;
  Entity?: EntityResolvers<ContextType>;
  Entry?: EntryResolvers<ContextType>;
  EntryDateOfRecord?: EntryDateOfRecordResolvers<ContextType>;
  EntryItem?: EntryItemResolvers<ContextType>;
  EntryRefund?: EntryRefundResolvers<ContextType>;
  FiscalYear?: FiscalYearResolvers<ContextType>;
  Mutation?: MutationResolvers<ContextType>;
  PaymentCard?: PaymentCardResolvers<ContextType>;
  PaymentCardInterface?: PaymentCardInterfaceResolvers<ContextType>;
  PaymentCheck?: PaymentCheckResolvers<ContextType>;
  PaymentCheckInterface?: PaymentCheckInterfaceResolvers<ContextType>;
  PaymentMethodCard?: PaymentMethodCardResolvers<ContextType>;
  PaymentMethodCash?: PaymentMethodCashResolvers<ContextType>;
  PaymentMethodCheck?: PaymentMethodCheckResolvers<ContextType>;
  PaymentMethodCombination?: PaymentMethodCombinationResolvers<ContextType>;
  PaymentMethodInterface?: PaymentMethodInterfaceResolvers<ContextType>;
  PaymentMethodOnline?: PaymentMethodOnlineResolvers<ContextType>;
  PaymentMethodUnknown?: PaymentMethodUnknownResolvers<ContextType>;
  Person?: PersonResolvers<ContextType>;
  PersonName?: PersonNameResolvers<ContextType>;
  Query?: QueryResolvers<ContextType>;
  Rational?: GraphQLScalarType;
  ReconcileEntriesPayload?: ReconcileEntriesPayloadResolvers<ContextType>;
  Source?: SourceResolvers<ContextType>;
  Subscription?: SubscriptionResolvers<ContextType>;
  UpdateEntryPayload?: UpdateEntryPayloadResolvers<ContextType>;
  UpdateEntryRefundPayload?: UpdateEntryRefundPayloadResolvers<ContextType>;
  User?: UserResolvers<ContextType>;
  Vendor?: VendorResolvers<ContextType>;
};

