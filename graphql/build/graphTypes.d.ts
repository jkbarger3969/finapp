import Fraction from 'fraction.js';
import { GraphQLResolveInfo, GraphQLScalarType, GraphQLScalarTypeConfig } from 'graphql';
import { PaymentCardDbRecord, AccountDbRecord, BudgetDbRecord, BusinessDbRecord, CategoryDbRecord, DepartmentDbRecord, EntryDbRecord, EntryRefundDbRecord, EntryItemDbRecord, FiscalYearDbRecord, PersonDbRecord } from './dataSources/accountingDb/types';
import { Context } from './types';
export declare type Maybe<T> = T | null;
export declare type InputMaybe<T> = Maybe<T>;
export declare type Exact<T extends {
    [key: string]: unknown;
}> = {
    [K in keyof T]: T[K];
};
export declare type MakeOptional<T, K extends keyof T> = Omit<T, K> & {
    [SubKey in K]?: Maybe<T[SubKey]>;
};
export declare type MakeMaybe<T, K extends keyof T> = Omit<T, K> & {
    [SubKey in K]: Maybe<T[SubKey]>;
};
export declare type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>;
export declare type RequireFields<T, K extends keyof T> = {
    [X in Exclude<keyof T, K>]?: T[X];
} & {
    [P in K]-?: NonNullable<T[P]>;
};
/** All built-in and custom scalars, mapped to their actual values */
export declare type Scalars = {
    ID: string;
    String: string;
    Boolean: boolean;
    Int: number;
    Float: number;
    /** ISO 8601 */
    Date: Date;
    Rational: Fraction;
};
export declare type AccountCard = PaymentCardInterface & {
    __typename?: 'AccountCard';
    account: AccountChecking | AccountCreditCard;
    active: Scalars['Boolean'];
    authorizedUsers: Array<Entity>;
    id: Scalars['ID'];
    trailingDigits: Scalars['String'];
    type: PaymentCardType;
};
export declare type AccountCardsWhere = {
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
export declare type AccountCheck = PaymentCheckInterface & {
    __typename?: 'AccountCheck';
    account: AccountChecking;
    checkNumber: Scalars['String'];
};
export declare type AccountCheckInput = {
    /** id of AccountChecking */
    account: Scalars['ID'];
    checkNumber: Scalars['String'];
};
export declare type AccountChecking = AccountInterface & AccountWithCardsInterface & {
    __typename?: 'AccountChecking';
    accountNumber: Scalars['String'];
    active: Scalars['Boolean'];
    cards: Array<AccountCard>;
    currency: Currency;
    id: Scalars['ID'];
    name: Scalars['String'];
    owner: Entity;
};
export declare type AccountCreditCard = AccountInterface & AccountWithCardsInterface & {
    __typename?: 'AccountCreditCard';
    active: Scalars['Boolean'];
    cards: Array<AccountCard>;
    currency: Currency;
    id: Scalars['ID'];
    name: Scalars['String'];
    owner: Entity;
};
export declare type AccountInterface = {
    active: Scalars['Boolean'];
    currency: Currency;
    id: Scalars['ID'];
    name: Scalars['String'];
    owner: Entity;
};
export declare enum AccountType {
    Checking = "CHECKING",
    CreditCard = "CREDIT_CARD"
}
export declare type AccountWithCardsInterface = {
    active: Scalars['Boolean'];
    cards: Array<AccountCard>;
    currency: Currency;
    id: Scalars['ID'];
    name: Scalars['String'];
    owner: Entity;
};
export declare type AccountsWhere = {
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
export declare type AddNewEntryPayload = {
    __typename?: 'AddNewEntryPayload';
    newEntry: Entry;
};
export declare type AddNewEntryRefundPayload = {
    __typename?: 'AddNewEntryRefundPayload';
    newEntryRefund: EntryRefund;
};
export declare type AddNewPersonPayload = {
    __typename?: 'AddNewPersonPayload';
    newPerson: Person;
};
export declare type Alias = {
    __typename?: 'Alias';
    id: Scalars['ID'];
    name: Scalars['String'];
    target: AliasTarget;
    type: AliasType;
};
export declare type AliasTarget = Category | Department;
export declare enum AliasType {
    Alias = "ALIAS",
    PostfixDescendants = "POSTFIX_DESCENDANTS",
    PrefixDescendants = "PREFIX_DESCENDANTS"
}
export declare type AliasesWhere = {
    and?: InputMaybe<Array<AliasesWhere>>;
    id?: InputMaybe<WhereId>;
    name?: InputMaybe<WhereRegex>;
    nor?: InputMaybe<Array<AliasesWhere>>;
    or?: InputMaybe<Array<AliasesWhere>>;
    target?: InputMaybe<WhereNode>;
    type?: InputMaybe<AliasType>;
};
export declare type Budget = {
    __typename?: 'Budget';
    amount: Scalars['Rational'];
    fiscalYear: FiscalYear;
    id: Scalars['ID'];
    owner: BudgetOwner;
};
export declare type BudgetOwner = Business | Department;
export declare type BudgetsWhere = {
    amount?: InputMaybe<WhereRational>;
    and?: InputMaybe<Array<BudgetsWhere>>;
    fiscalYear?: InputMaybe<FiscalYearsWhere>;
    id?: InputMaybe<WhereId>;
    nor?: InputMaybe<Array<BudgetsWhere>>;
    or?: InputMaybe<Array<BudgetsWhere>>;
    owner?: InputMaybe<WhereNode>;
};
export declare type Business = {
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
export declare type BusinessDepartmentsArgs = {
    root?: InputMaybe<Scalars['Boolean']>;
};
export declare type BusinessesWhere = {
    and?: InputMaybe<Array<BusinessesWhere>>;
    id?: InputMaybe<WhereId>;
    name?: InputMaybe<WhereRegex>;
    nor?: InputMaybe<Array<BusinessesWhere>>;
    or?: InputMaybe<Array<BusinessesWhere>>;
};
export declare type CategoriesWhere = {
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
export declare type Category = {
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
export declare enum Currency {
    Usd = "USD"
}
export declare type DeleteEntryPayload = {
    __typename?: 'DeleteEntryPayload';
    deletedEntry: Entry;
};
export declare type DeleteEntryRefundPayload = {
    __typename?: 'DeleteEntryRefundPayload';
    deletedEntryRefund: EntryRefund;
};
export declare type Department = {
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
export declare type DepartmentAncestorsArgs = {
    root?: InputMaybe<DepartmentsWhere>;
};
export declare type DepartmentAncestor = Business | Department;
export declare type DepartmentsWhere = {
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
export declare type EntitiesWhere = {
    businesses?: InputMaybe<BusinessesWhere>;
    departments?: InputMaybe<DepartmentsWhere>;
    people?: InputMaybe<PeopleWhere>;
};
export declare type Entity = Business | Department | Person;
export declare type EntityInput = {
    id: Scalars['ID'];
    type: EntityType;
};
export declare enum EntityType {
    Business = "BUSINESS",
    Department = "DEPARTMENT",
    Person = "PERSON"
}
export declare type EntriesWhere = {
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
export declare type EntriesWhereDateOfRecord = {
    date?: InputMaybe<WhereDate>;
    overrideFiscalYear?: InputMaybe<Scalars['Boolean']>;
};
export declare type EntriesWhereSource = {
    businesses?: InputMaybe<BusinessesWhere>;
    departments?: InputMaybe<DepartmentsWhere>;
    people?: InputMaybe<PeopleWhere>;
};
export declare type Entry = {
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
export declare type EntryDateOfRecord = {
    __typename?: 'EntryDateOfRecord';
    date: Scalars['Date'];
    overrideFiscalYear: Scalars['Boolean'];
};
export declare type EntryItem = {
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
export declare type EntryItemsWhere = {
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
export declare type EntryRefund = {
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
export declare type EntryRefundsWhere = {
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
export declare enum EntryType {
    Credit = "CREDIT",
    Debit = "DEBIT"
}
export declare type FiscalYear = {
    __typename?: 'FiscalYear';
    begin: Scalars['Date'];
    end: Scalars['Date'];
    id: Scalars['ID'];
    name: Scalars['String'];
};
export declare type FiscalYearsWhere = {
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
export declare type Mutation = {
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
export declare type MutationAddNewBusinessArgs = {
    input: NewBusiness;
};
export declare type MutationAddNewEntryArgs = {
    input: NewEntry;
};
export declare type MutationAddNewEntryRefundArgs = {
    input: NewEntryRefund;
};
export declare type MutationAddNewPersonArgs = {
    input: NewPerson;
};
export declare type MutationDeleteEntryArgs = {
    id: Scalars['ID'];
};
export declare type MutationDeleteEntryRefundArgs = {
    id: Scalars['ID'];
};
export declare type MutationReconcileEntriesArgs = {
    input?: InputMaybe<ReconcileEntries>;
};
export declare type MutationUpdateEntryArgs = {
    input: UpdateEntry;
};
export declare type MutationUpdateEntryRefundArgs = {
    input: UpdateEntryRefund;
};
export declare type NewBusiness = {
    name: Scalars['String'];
};
export declare type NewEntry = {
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
export declare type NewEntryDateOfRecord = {
    date: Scalars['Date'];
    overrideFiscalYear: Scalars['Boolean'];
};
export declare type NewEntryRefund = {
    date: Scalars['Date'];
    dateOfRecord?: InputMaybe<NewEntryDateOfRecord>;
    description?: InputMaybe<Scalars['String']>;
    entry: Scalars['ID'];
    paymentMethod: UpsertPaymentMethod;
    reconciled?: InputMaybe<Scalars['Boolean']>;
    total: Scalars['Rational'];
};
export declare type NewPerson = {
    email?: InputMaybe<Scalars['String']>;
    name: PersonNameInput;
    phone?: InputMaybe<Scalars['String']>;
};
export declare type NodeInput = {
    id: Scalars['ID'];
    type: Scalars['String'];
};
export declare type PaymentCard = PaymentCardInterface & {
    __typename?: 'PaymentCard';
    trailingDigits: Scalars['String'];
    type: PaymentCardType;
};
export declare type PaymentCardInput = {
    trailingDigits: Scalars['String'];
    type: PaymentCardType;
};
export declare type PaymentCardInterface = {
    trailingDigits: Scalars['String'];
    type: PaymentCardType;
};
export declare enum PaymentCardType {
    AmericanExpress = "AMERICAN_EXPRESS",
    Discover = "DISCOVER",
    MasterCard = "MASTER_CARD",
    Visa = "VISA"
}
export declare type PaymentCheck = PaymentCheckInterface & {
    __typename?: 'PaymentCheck';
    checkNumber: Scalars['String'];
};
export declare type PaymentCheckInput = {
    checkNumber: Scalars['String'];
};
export declare type PaymentCheckInterface = {
    checkNumber: Scalars['String'];
};
export declare type PaymentMethodAccountCardInput = {
    /** id from AccountCard */
    card: Scalars['ID'];
    currency: Currency;
};
export declare type PaymentMethodAccountCheckInput = {
    check: AccountCheckInput;
    currency: Currency;
};
export declare type PaymentMethodCard = PaymentMethodInterface & {
    __typename?: 'PaymentMethodCard';
    card: AccountCard | PaymentCard;
    currency: Currency;
};
export declare type PaymentMethodCardInput = {
    card: PaymentCardInput;
    currency: Currency;
};
export declare type PaymentMethodCash = PaymentMethodInterface & {
    __typename?: 'PaymentMethodCash';
    currency: Currency;
};
export declare type PaymentMethodCashInput = {
    currency: Currency;
};
export declare type PaymentMethodCheck = PaymentMethodInterface & {
    __typename?: 'PaymentMethodCheck';
    check: AccountCheck | PaymentCheck;
    currency: Currency;
};
export declare type PaymentMethodCheckInput = {
    check: PaymentCheckInput;
    currency: Currency;
};
export declare type PaymentMethodCombination = PaymentMethodInterface & {
    __typename?: 'PaymentMethodCombination';
    currency: Currency;
};
export declare type PaymentMethodCombinationInput = {
    currency: Currency;
};
export declare type PaymentMethodInterface = {
    currency: Currency;
};
export declare type PaymentMethodOnline = PaymentMethodInterface & {
    __typename?: 'PaymentMethodOnline';
    currency: Currency;
};
export declare type PaymentMethodOnlineInput = {
    currency: Currency;
};
export declare enum PaymentMethodType {
    Card = "CARD",
    Cash = "CASH",
    Check = "CHECK",
    Combination = "COMBINATION",
    Online = "ONLINE",
    Unknown = "UNKNOWN"
}
export declare type PaymentMethodUnknown = PaymentMethodInterface & {
    __typename?: 'PaymentMethodUnknown';
    currency: Currency;
};
export declare type PaymentMethodUnknownInput = {
    currency: Currency;
};
export declare type PeopleNameWhere = {
    first?: InputMaybe<WhereRegex>;
    last?: InputMaybe<WhereRegex>;
};
export declare type PeopleWhere = {
    and?: InputMaybe<Array<PeopleWhere>>;
    id?: InputMaybe<WhereId>;
    name?: InputMaybe<PeopleNameWhere>;
    nor?: InputMaybe<Array<PeopleWhere>>;
    or?: InputMaybe<Array<PeopleWhere>>;
};
export declare type Person = {
    __typename?: 'Person';
    id: Scalars['ID'];
    name: PersonName;
};
export declare type PersonName = {
    __typename?: 'PersonName';
    first: Scalars['String'];
    last: Scalars['String'];
};
export declare type PersonNameInput = {
    first: Scalars['String'];
    last: Scalars['String'];
};
export declare type Query = {
    __typename?: 'Query';
    account: AccountChecking | AccountCreditCard;
    accountCard: AccountCard;
    accountCards: Array<AccountCard>;
    accounts: Array<AccountChecking | AccountCreditCard>;
    alias?: Maybe<Alias>;
    aliases: Array<Alias>;
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
export declare type QueryAccountArgs = {
    id: Scalars['ID'];
};
export declare type QueryAccountCardArgs = {
    id: Scalars['ID'];
};
export declare type QueryAccountCardsArgs = {
    where?: InputMaybe<AccountCardsWhere>;
};
export declare type QueryAccountsArgs = {
    where?: InputMaybe<AccountsWhere>;
};
export declare type QueryAliasArgs = {
    id: Scalars['ID'];
};
export declare type QueryAliasesArgs = {
    where?: InputMaybe<AliasesWhere>;
};
export declare type QueryBudgetArgs = {
    id: Scalars['ID'];
};
export declare type QueryBudgetsArgs = {
    where?: InputMaybe<BudgetsWhere>;
};
export declare type QueryBusinessArgs = {
    id: Scalars['ID'];
};
export declare type QueryBusinessesArgs = {
    where?: InputMaybe<BusinessesWhere>;
};
export declare type QueryCategoriesArgs = {
    where?: InputMaybe<CategoriesWhere>;
};
export declare type QueryCategoryArgs = {
    id: Scalars['ID'];
};
export declare type QueryDepartmentArgs = {
    id: Scalars['ID'];
};
export declare type QueryDepartmentsArgs = {
    where?: InputMaybe<DepartmentsWhere>;
};
export declare type QueryEntitiesArgs = {
    where: EntitiesWhere;
};
export declare type QueryEntriesArgs = {
    filterRefunds?: InputMaybe<Scalars['Boolean']>;
    where?: InputMaybe<EntriesWhere>;
};
export declare type QueryEntryArgs = {
    id: Scalars['ID'];
};
export declare type QueryEntryItemArgs = {
    id: Scalars['ID'];
};
export declare type QueryEntryRefundArgs = {
    id: Scalars['ID'];
};
export declare type QueryEntryRefundsArgs = {
    entriesWhere?: InputMaybe<EntriesWhere>;
    where?: InputMaybe<EntryRefundsWhere>;
};
export declare type QueryFiscalYearArgs = {
    id: Scalars['ID'];
};
export declare type QueryFiscalYearsArgs = {
    where?: InputMaybe<FiscalYearsWhere>;
};
export declare type QueryPeopleArgs = {
    where?: InputMaybe<PeopleWhere>;
};
export declare type QueryPersonArgs = {
    id: Scalars['ID'];
};
export declare type QuerySourcesArgs = {
    searchByName: Scalars['String'];
};
export declare type ReconcileEntries = {
    entries?: InputMaybe<Array<InputMaybe<Scalars['ID']>>>;
    refunds?: InputMaybe<Array<InputMaybe<Scalars['ID']>>>;
};
export declare type ReconcileEntriesPayload = {
    __typename?: 'ReconcileEntriesPayload';
    reconciledEntries: Array<Entry>;
    reconciledRefunds: Array<EntryRefund>;
};
/** https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_Expressions#advanced_searching_with_flags */
export declare enum RegexFlags {
    /** Global search. */
    G = "G",
    /** Case-insensitive search. */
    I = "I",
    /** Multi-line search. */
    M = "M",
    /** Allows . to match newline characters. */
    S = "S"
}
export declare type Source = Business | Department | Person;
export declare type Subscription = {
    __typename?: 'Subscription';
    entryAdded: Entry;
    entryUpdated: Entry;
    entryUpserted: Entry;
};
/** Requirers at least ONE optional field. */
export declare type UpdateEntry = {
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
export declare type UpdateEntryDateOfRecord = {
    clear?: InputMaybe<Scalars['Boolean']>;
    date?: InputMaybe<Scalars['Date']>;
    overrideFiscalYear?: InputMaybe<Scalars['Boolean']>;
};
export declare type UpdateEntryPayload = {
    __typename?: 'UpdateEntryPayload';
    updatedEntry: Entry;
};
export declare type UpdateEntryRefund = {
    date?: InputMaybe<Scalars['Date']>;
    dateOfRecord?: InputMaybe<UpdateEntryDateOfRecord>;
    description?: InputMaybe<Scalars['String']>;
    id: Scalars['ID'];
    paymentMethod?: InputMaybe<UpsertPaymentMethod>;
    reconciled?: InputMaybe<Scalars['Boolean']>;
    total?: InputMaybe<Scalars['Rational']>;
};
export declare type UpdateEntryRefundPayload = {
    __typename?: 'UpdateEntryRefundPayload';
    updatedEntryRefund: EntryRefund;
};
/** `NewEntry.source` and `UpdateEntry.source` input.  Choose ONE field only. */
export declare type UpsertEntrySource = {
    business?: InputMaybe<NewBusiness>;
    person?: InputMaybe<NewPerson>;
    source?: InputMaybe<EntityInput>;
};
/** One field is required and fields are mutually exclusive.. */
export declare type UpsertPaymentMethod = {
    accountCard?: InputMaybe<PaymentMethodAccountCardInput>;
    accountCheck?: InputMaybe<PaymentMethodAccountCheckInput>;
    card?: InputMaybe<PaymentMethodCardInput>;
    cash?: InputMaybe<PaymentMethodCashInput>;
    check?: InputMaybe<PaymentMethodCheckInput>;
    combination?: InputMaybe<PaymentMethodCombinationInput>;
    online?: InputMaybe<PaymentMethodOnlineInput>;
    unknown?: InputMaybe<PaymentMethodUnknownInput>;
};
export declare type User = {
    __typename?: 'User';
    id: Scalars['ID'];
    user: Person;
};
export declare type Vendor = {
    __typename?: 'Vendor';
    approved: Scalars['Boolean'];
    vendorId?: Maybe<Scalars['ID']>;
};
export declare type WhereDate = {
    eq?: InputMaybe<Scalars['Date']>;
    gt?: InputMaybe<Scalars['Date']>;
    gte?: InputMaybe<Scalars['Date']>;
    lt?: InputMaybe<Scalars['Date']>;
    lte?: InputMaybe<Scalars['Date']>;
    ne?: InputMaybe<Scalars['Date']>;
};
export declare type WhereId = {
    eq?: InputMaybe<Scalars['ID']>;
    in?: InputMaybe<Array<Scalars['ID']>>;
    ne?: InputMaybe<Scalars['ID']>;
    nin?: InputMaybe<Array<Scalars['ID']>>;
};
export declare type WhereInt = {
    eq?: InputMaybe<Scalars['Int']>;
    gt?: InputMaybe<Scalars['Int']>;
    gte?: InputMaybe<Scalars['Int']>;
    lt?: InputMaybe<Scalars['Int']>;
    lte?: InputMaybe<Scalars['Int']>;
    ne?: InputMaybe<Scalars['Int']>;
};
export declare type WhereNode = {
    eq?: InputMaybe<NodeInput>;
    in?: InputMaybe<Array<NodeInput>>;
    ne?: InputMaybe<NodeInput>;
    nin?: InputMaybe<Array<NodeInput>>;
};
export declare type WhereRational = {
    eq?: InputMaybe<Scalars['Rational']>;
    gt?: InputMaybe<Scalars['Rational']>;
    gte?: InputMaybe<Scalars['Rational']>;
    in?: InputMaybe<Array<Scalars['Rational']>>;
    lt?: InputMaybe<Scalars['Rational']>;
    lte?: InputMaybe<Scalars['Rational']>;
    ne?: InputMaybe<Scalars['Rational']>;
    nin?: InputMaybe<Array<Scalars['Rational']>>;
};
export declare type WhereRegex = {
    flags?: InputMaybe<Array<RegexFlags>>;
    /**
     * "pattern" argument of the javascript RegExp constructor.
     * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/RegExp/RegExp#parameters
     */
    pattern: Scalars['String'];
};
export declare type WhereTreeId = {
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
export declare type ResolverTypeWrapper<T> = Promise<T> | T;
export declare type ResolverWithResolve<TResult, TParent, TContext, TArgs> = {
    resolve: ResolverFn<TResult, TParent, TContext, TArgs>;
};
export declare type Resolver<TResult, TParent = {}, TContext = {}, TArgs = {}> = ResolverFn<TResult, TParent, TContext, TArgs> | ResolverWithResolve<TResult, TParent, TContext, TArgs>;
export declare type ResolverFn<TResult, TParent, TContext, TArgs> = (parent: TParent, args: TArgs, context: TContext, info: GraphQLResolveInfo) => Promise<TResult> | TResult;
export declare type SubscriptionSubscribeFn<TResult, TParent, TContext, TArgs> = (parent: TParent, args: TArgs, context: TContext, info: GraphQLResolveInfo) => AsyncIterable<TResult> | Promise<AsyncIterable<TResult>>;
export declare type SubscriptionResolveFn<TResult, TParent, TContext, TArgs> = (parent: TParent, args: TArgs, context: TContext, info: GraphQLResolveInfo) => TResult | Promise<TResult>;
export interface SubscriptionSubscriberObject<TResult, TKey extends string, TParent, TContext, TArgs> {
    subscribe: SubscriptionSubscribeFn<{
        [key in TKey]: TResult;
    }, TParent, TContext, TArgs>;
    resolve?: SubscriptionResolveFn<TResult, {
        [key in TKey]: TResult;
    }, TContext, TArgs>;
}
export interface SubscriptionResolverObject<TResult, TParent, TContext, TArgs> {
    subscribe: SubscriptionSubscribeFn<any, TParent, TContext, TArgs>;
    resolve: SubscriptionResolveFn<TResult, any, TContext, TArgs>;
}
export declare type SubscriptionObject<TResult, TKey extends string, TParent, TContext, TArgs> = SubscriptionSubscriberObject<TResult, TKey, TParent, TContext, TArgs> | SubscriptionResolverObject<TResult, TParent, TContext, TArgs>;
export declare type SubscriptionResolver<TResult, TKey extends string, TParent = {}, TContext = {}, TArgs = {}> = ((...args: any[]) => SubscriptionObject<TResult, TKey, TParent, TContext, TArgs>) | SubscriptionObject<TResult, TKey, TParent, TContext, TArgs>;
export declare type TypeResolveFn<TTypes, TParent = {}, TContext = {}> = (parent: TParent, context: TContext, info: GraphQLResolveInfo) => Maybe<TTypes> | Promise<Maybe<TTypes>>;
export declare type IsTypeOfResolverFn<T = {}, TContext = {}> = (obj: T, context: TContext, info: GraphQLResolveInfo) => boolean | Promise<boolean>;
export declare type NextResolverFn<T> = () => Promise<T>;
export declare type DirectiveResolverFn<TResult = {}, TParent = {}, TContext = {}, TArgs = {}> = (next: NextResolverFn<TResult>, parent: TParent, args: TArgs, context: TContext, info: GraphQLResolveInfo) => TResult | Promise<TResult>;
/** Mapping between all available schema types and the resolvers types */
export declare type ResolversTypes = {
    AccountCard: ResolverTypeWrapper<PaymentCardDbRecord>;
    AccountCardsWhere: AccountCardsWhere;
    AccountCheck: ResolverTypeWrapper<Omit<AccountCheck, 'account'> & {
        account: ResolversTypes['AccountChecking'];
    }>;
    AccountCheckInput: AccountCheckInput;
    AccountChecking: ResolverTypeWrapper<AccountDbRecord>;
    AccountCreditCard: ResolverTypeWrapper<Omit<AccountCreditCard, 'cards' | 'owner'> & {
        cards: Array<ResolversTypes['AccountCard']>;
        owner: ResolversTypes['Entity'];
    }>;
    AccountInterface: ResolverTypeWrapper<AccountDbRecord>;
    AccountType: AccountType;
    AccountWithCardsInterface: ResolverTypeWrapper<AccountDbRecord>;
    AccountsWhere: AccountsWhere;
    AddNewEntryPayload: ResolverTypeWrapper<Omit<AddNewEntryPayload, 'newEntry'> & {
        newEntry: ResolversTypes['Entry'];
    }>;
    AddNewEntryRefundPayload: ResolverTypeWrapper<Omit<AddNewEntryRefundPayload, 'newEntryRefund'> & {
        newEntryRefund: ResolversTypes['EntryRefund'];
    }>;
    AddNewPersonPayload: ResolverTypeWrapper<Omit<AddNewPersonPayload, 'newPerson'> & {
        newPerson: ResolversTypes['Person'];
    }>;
    Alias: ResolverTypeWrapper<Omit<Alias, 'target'> & {
        target: ResolversTypes['AliasTarget'];
    }>;
    AliasTarget: ResolversTypes['Category'] | ResolversTypes['Department'];
    AliasType: AliasType;
    AliasesWhere: AliasesWhere;
    Boolean: ResolverTypeWrapper<Scalars['Boolean']>;
    Budget: ResolverTypeWrapper<BudgetDbRecord>;
    BudgetOwner: ResolversTypes['Business'] | ResolversTypes['Department'];
    BudgetsWhere: BudgetsWhere;
    Business: ResolverTypeWrapper<BusinessDbRecord>;
    BusinessesWhere: BusinessesWhere;
    CategoriesWhere: CategoriesWhere;
    Category: ResolverTypeWrapper<CategoryDbRecord>;
    Currency: Currency;
    Date: ResolverTypeWrapper<Scalars['Date']>;
    DeleteEntryPayload: ResolverTypeWrapper<Omit<DeleteEntryPayload, 'deletedEntry'> & {
        deletedEntry: ResolversTypes['Entry'];
    }>;
    DeleteEntryRefundPayload: ResolverTypeWrapper<Omit<DeleteEntryRefundPayload, 'deletedEntryRefund'> & {
        deletedEntryRefund: ResolversTypes['EntryRefund'];
    }>;
    Department: ResolverTypeWrapper<DepartmentDbRecord>;
    DepartmentAncestor: ResolversTypes['Business'] | ResolversTypes['Department'];
    DepartmentsWhere: DepartmentsWhere;
    EntitiesWhere: EntitiesWhere;
    Entity: ResolversTypes['Business'] | ResolversTypes['Department'] | ResolversTypes['Person'];
    EntityInput: EntityInput;
    EntityType: EntityType;
    EntriesWhere: EntriesWhere;
    EntriesWhereDateOfRecord: EntriesWhereDateOfRecord;
    EntriesWhereSource: EntriesWhereSource;
    Entry: ResolverTypeWrapper<EntryDbRecord>;
    EntryDateOfRecord: ResolverTypeWrapper<EntryDateOfRecord>;
    EntryItem: ResolverTypeWrapper<EntryItemDbRecord>;
    EntryItemsWhere: EntryItemsWhere;
    EntryRefund: ResolverTypeWrapper<EntryRefundDbRecord>;
    EntryRefundsWhere: EntryRefundsWhere;
    EntryType: EntryType;
    FiscalYear: ResolverTypeWrapper<FiscalYearDbRecord>;
    FiscalYearsWhere: FiscalYearsWhere;
    ID: ResolverTypeWrapper<Scalars['ID']>;
    Int: ResolverTypeWrapper<Scalars['Int']>;
    Mutation: ResolverTypeWrapper<{}>;
    NewBusiness: NewBusiness;
    NewEntry: NewEntry;
    NewEntryDateOfRecord: NewEntryDateOfRecord;
    NewEntryRefund: ResolverTypeWrapper<EntryRefundDbRecord>;
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
    Person: ResolverTypeWrapper<PersonDbRecord>;
    PersonName: ResolverTypeWrapper<PersonName>;
    PersonNameInput: PersonNameInput;
    Query: ResolverTypeWrapper<{}>;
    Rational: ResolverTypeWrapper<Scalars['Rational']>;
    ReconcileEntries: ReconcileEntries;
    ReconcileEntriesPayload: ResolverTypeWrapper<Omit<ReconcileEntriesPayload, 'reconciledEntries' | 'reconciledRefunds'> & {
        reconciledEntries: Array<ResolversTypes['Entry']>;
        reconciledRefunds: Array<ResolversTypes['EntryRefund']>;
    }>;
    RegexFlags: RegexFlags;
    Source: ResolversTypes['Business'] | ResolversTypes['Department'] | ResolversTypes['Person'];
    String: ResolverTypeWrapper<Scalars['String']>;
    Subscription: ResolverTypeWrapper<{}>;
    UpdateEntry: UpdateEntry;
    UpdateEntryDateOfRecord: UpdateEntryDateOfRecord;
    UpdateEntryPayload: ResolverTypeWrapper<Omit<UpdateEntryPayload, 'updatedEntry'> & {
        updatedEntry: ResolversTypes['Entry'];
    }>;
    UpdateEntryRefund: UpdateEntryRefund;
    UpdateEntryRefundPayload: ResolverTypeWrapper<Omit<UpdateEntryRefundPayload, 'updatedEntryRefund'> & {
        updatedEntryRefund: ResolversTypes['EntryRefund'];
    }>;
    UpsertEntrySource: UpsertEntrySource;
    UpsertPaymentMethod: UpsertPaymentMethod;
    User: ResolverTypeWrapper<Omit<User, 'user'> & {
        user: ResolversTypes['Person'];
    }>;
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
export declare type ResolversParentTypes = {
    AccountCard: PaymentCardDbRecord;
    AccountCardsWhere: AccountCardsWhere;
    AccountCheck: Omit<AccountCheck, 'account'> & {
        account: ResolversParentTypes['AccountChecking'];
    };
    AccountCheckInput: AccountCheckInput;
    AccountChecking: AccountDbRecord;
    AccountCreditCard: Omit<AccountCreditCard, 'cards' | 'owner'> & {
        cards: Array<ResolversParentTypes['AccountCard']>;
        owner: ResolversParentTypes['Entity'];
    };
    AccountInterface: AccountDbRecord;
    AccountWithCardsInterface: AccountDbRecord;
    AccountsWhere: AccountsWhere;
    AddNewEntryPayload: Omit<AddNewEntryPayload, 'newEntry'> & {
        newEntry: ResolversParentTypes['Entry'];
    };
    AddNewEntryRefundPayload: Omit<AddNewEntryRefundPayload, 'newEntryRefund'> & {
        newEntryRefund: ResolversParentTypes['EntryRefund'];
    };
    AddNewPersonPayload: Omit<AddNewPersonPayload, 'newPerson'> & {
        newPerson: ResolversParentTypes['Person'];
    };
    Alias: Omit<Alias, 'target'> & {
        target: ResolversParentTypes['AliasTarget'];
    };
    AliasTarget: ResolversParentTypes['Category'] | ResolversParentTypes['Department'];
    AliasesWhere: AliasesWhere;
    Boolean: Scalars['Boolean'];
    Budget: BudgetDbRecord;
    BudgetOwner: ResolversParentTypes['Business'] | ResolversParentTypes['Department'];
    BudgetsWhere: BudgetsWhere;
    Business: BusinessDbRecord;
    BusinessesWhere: BusinessesWhere;
    CategoriesWhere: CategoriesWhere;
    Category: CategoryDbRecord;
    Date: Scalars['Date'];
    DeleteEntryPayload: Omit<DeleteEntryPayload, 'deletedEntry'> & {
        deletedEntry: ResolversParentTypes['Entry'];
    };
    DeleteEntryRefundPayload: Omit<DeleteEntryRefundPayload, 'deletedEntryRefund'> & {
        deletedEntryRefund: ResolversParentTypes['EntryRefund'];
    };
    Department: DepartmentDbRecord;
    DepartmentAncestor: ResolversParentTypes['Business'] | ResolversParentTypes['Department'];
    DepartmentsWhere: DepartmentsWhere;
    EntitiesWhere: EntitiesWhere;
    Entity: ResolversParentTypes['Business'] | ResolversParentTypes['Department'] | ResolversParentTypes['Person'];
    EntityInput: EntityInput;
    EntriesWhere: EntriesWhere;
    EntriesWhereDateOfRecord: EntriesWhereDateOfRecord;
    EntriesWhereSource: EntriesWhereSource;
    Entry: EntryDbRecord;
    EntryDateOfRecord: EntryDateOfRecord;
    EntryItem: EntryItemDbRecord;
    EntryItemsWhere: EntryItemsWhere;
    EntryRefund: EntryRefundDbRecord;
    EntryRefundsWhere: EntryRefundsWhere;
    FiscalYear: FiscalYearDbRecord;
    FiscalYearsWhere: FiscalYearsWhere;
    ID: Scalars['ID'];
    Int: Scalars['Int'];
    Mutation: {};
    NewBusiness: NewBusiness;
    NewEntry: NewEntry;
    NewEntryDateOfRecord: NewEntryDateOfRecord;
    NewEntryRefund: EntryRefundDbRecord;
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
    Person: PersonDbRecord;
    PersonName: PersonName;
    PersonNameInput: PersonNameInput;
    Query: {};
    Rational: Scalars['Rational'];
    ReconcileEntries: ReconcileEntries;
    ReconcileEntriesPayload: Omit<ReconcileEntriesPayload, 'reconciledEntries' | 'reconciledRefunds'> & {
        reconciledEntries: Array<ResolversParentTypes['Entry']>;
        reconciledRefunds: Array<ResolversParentTypes['EntryRefund']>;
    };
    Source: ResolversParentTypes['Business'] | ResolversParentTypes['Department'] | ResolversParentTypes['Person'];
    String: Scalars['String'];
    Subscription: {};
    UpdateEntry: UpdateEntry;
    UpdateEntryDateOfRecord: UpdateEntryDateOfRecord;
    UpdateEntryPayload: Omit<UpdateEntryPayload, 'updatedEntry'> & {
        updatedEntry: ResolversParentTypes['Entry'];
    };
    UpdateEntryRefund: UpdateEntryRefund;
    UpdateEntryRefundPayload: Omit<UpdateEntryRefundPayload, 'updatedEntryRefund'> & {
        updatedEntryRefund: ResolversParentTypes['EntryRefund'];
    };
    UpsertEntrySource: UpsertEntrySource;
    UpsertPaymentMethod: UpsertPaymentMethod;
    User: Omit<User, 'user'> & {
        user: ResolversParentTypes['Person'];
    };
    Vendor: Vendor;
    WhereDate: WhereDate;
    WhereId: WhereId;
    WhereInt: WhereInt;
    WhereNode: WhereNode;
    WhereRational: WhereRational;
    WhereRegex: WhereRegex;
    WhereTreeId: WhereTreeId;
};
export declare type AccountCardResolvers<ContextType = Context, ParentType = ResolversParentTypes['AccountCard']> = {
    account?: Resolver<ResolversTypes['AccountWithCardsInterface'], ParentType, ContextType>;
    active?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
    authorizedUsers?: Resolver<Array<ResolversTypes['Entity']>, ParentType, ContextType>;
    id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
    trailingDigits?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
    type?: Resolver<ResolversTypes['PaymentCardType'], ParentType, ContextType>;
    __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};
export declare type AccountCheckResolvers<ContextType = Context, ParentType = ResolversParentTypes['AccountCheck']> = {
    account?: Resolver<ResolversTypes['AccountChecking'], ParentType, ContextType>;
    checkNumber?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
    __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};
export declare type AccountCheckingResolvers<ContextType = Context, ParentType = ResolversParentTypes['AccountChecking']> = {
    accountNumber?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
    active?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
    cards?: Resolver<Array<ResolversTypes['AccountCard']>, ParentType, ContextType>;
    currency?: Resolver<ResolversTypes['Currency'], ParentType, ContextType>;
    id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
    name?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
    owner?: Resolver<ResolversTypes['Entity'], ParentType, ContextType>;
    __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};
export declare type AccountCreditCardResolvers<ContextType = Context, ParentType = ResolversParentTypes['AccountCreditCard']> = {
    active?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
    cards?: Resolver<Array<ResolversTypes['AccountCard']>, ParentType, ContextType>;
    currency?: Resolver<ResolversTypes['Currency'], ParentType, ContextType>;
    id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
    name?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
    owner?: Resolver<ResolversTypes['Entity'], ParentType, ContextType>;
    __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};
export declare type AccountInterfaceResolvers<ContextType = Context, ParentType = ResolversParentTypes['AccountInterface']> = {
    __resolveType?: TypeResolveFn<'AccountChecking' | 'AccountCreditCard', ParentType, ContextType>;
    active?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
    currency?: Resolver<ResolversTypes['Currency'], ParentType, ContextType>;
    id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
    name?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
    owner?: Resolver<ResolversTypes['Entity'], ParentType, ContextType>;
};
export declare type AccountWithCardsInterfaceResolvers<ContextType = Context, ParentType = ResolversParentTypes['AccountWithCardsInterface']> = {
    __resolveType?: TypeResolveFn<'AccountChecking' | 'AccountCreditCard', ParentType, ContextType>;
    active?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
    cards?: Resolver<Array<ResolversTypes['AccountCard']>, ParentType, ContextType>;
    currency?: Resolver<ResolversTypes['Currency'], ParentType, ContextType>;
    id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
    name?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
    owner?: Resolver<ResolversTypes['Entity'], ParentType, ContextType>;
};
export declare type AddNewEntryPayloadResolvers<ContextType = Context, ParentType = ResolversParentTypes['AddNewEntryPayload']> = {
    newEntry?: Resolver<ResolversTypes['Entry'], ParentType, ContextType>;
    __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};
export declare type AddNewEntryRefundPayloadResolvers<ContextType = Context, ParentType = ResolversParentTypes['AddNewEntryRefundPayload']> = {
    newEntryRefund?: Resolver<ResolversTypes['EntryRefund'], ParentType, ContextType>;
    __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};
export declare type AddNewPersonPayloadResolvers<ContextType = Context, ParentType = ResolversParentTypes['AddNewPersonPayload']> = {
    newPerson?: Resolver<ResolversTypes['Person'], ParentType, ContextType>;
    __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};
export declare type AliasResolvers<ContextType = Context, ParentType = ResolversParentTypes['Alias']> = {
    id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
    name?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
    target?: Resolver<ResolversTypes['AliasTarget'], ParentType, ContextType>;
    type?: Resolver<ResolversTypes['AliasType'], ParentType, ContextType>;
    __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};
export declare type AliasTargetResolvers<ContextType = Context, ParentType = ResolversParentTypes['AliasTarget']> = {
    __resolveType?: TypeResolveFn<'Category' | 'Department', ParentType, ContextType>;
};
export declare type BudgetResolvers<ContextType = Context, ParentType = ResolversParentTypes['Budget']> = {
    amount?: Resolver<ResolversTypes['Rational'], ParentType, ContextType>;
    fiscalYear?: Resolver<ResolversTypes['FiscalYear'], ParentType, ContextType>;
    id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
    owner?: Resolver<ResolversTypes['BudgetOwner'], ParentType, ContextType>;
    __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};
export declare type BudgetOwnerResolvers<ContextType = Context, ParentType = ResolversParentTypes['BudgetOwner']> = {
    __resolveType?: TypeResolveFn<'Business' | 'Department', ParentType, ContextType>;
};
export declare type BusinessResolvers<ContextType = Context, ParentType = ResolversParentTypes['Business']> = {
    budgets?: Resolver<Array<ResolversTypes['Budget']>, ParentType, ContextType>;
    departments?: Resolver<Array<ResolversTypes['Department']>, ParentType, ContextType, RequireFields<BusinessDepartmentsArgs, 'root'>>;
    id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
    name?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
    vendor?: Resolver<Maybe<ResolversTypes['Vendor']>, ParentType, ContextType>;
    __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};
export declare type CategoryResolvers<ContextType = Context, ParentType = ResolversParentTypes['Category']> = {
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
export declare type DeleteEntryPayloadResolvers<ContextType = Context, ParentType = ResolversParentTypes['DeleteEntryPayload']> = {
    deletedEntry?: Resolver<ResolversTypes['Entry'], ParentType, ContextType>;
    __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};
export declare type DeleteEntryRefundPayloadResolvers<ContextType = Context, ParentType = ResolversParentTypes['DeleteEntryRefundPayload']> = {
    deletedEntryRefund?: Resolver<ResolversTypes['EntryRefund'], ParentType, ContextType>;
    __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};
export declare type DepartmentResolvers<ContextType = Context, ParentType = ResolversParentTypes['Department']> = {
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
export declare type DepartmentAncestorResolvers<ContextType = Context, ParentType = ResolversParentTypes['DepartmentAncestor']> = {
    __resolveType?: TypeResolveFn<'Business' | 'Department', ParentType, ContextType>;
};
export declare type EntityResolvers<ContextType = Context, ParentType = ResolversParentTypes['Entity']> = {
    __resolveType?: TypeResolveFn<'Business' | 'Department' | 'Person', ParentType, ContextType>;
};
export declare type EntryResolvers<ContextType = Context, ParentType = ResolversParentTypes['Entry']> = {
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
export declare type EntryDateOfRecordResolvers<ContextType = Context, ParentType = ResolversParentTypes['EntryDateOfRecord']> = {
    date?: Resolver<ResolversTypes['Date'], ParentType, ContextType>;
    overrideFiscalYear?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
    __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};
export declare type EntryItemResolvers<ContextType = Context, ParentType = ResolversParentTypes['EntryItem']> = {
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
export declare type EntryRefundResolvers<ContextType = Context, ParentType = ResolversParentTypes['EntryRefund']> = {
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
export declare type FiscalYearResolvers<ContextType = Context, ParentType = ResolversParentTypes['FiscalYear']> = {
    begin?: Resolver<ResolversTypes['Date'], ParentType, ContextType>;
    end?: Resolver<ResolversTypes['Date'], ParentType, ContextType>;
    id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
    name?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
    __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};
export declare type MutationResolvers<ContextType = Context, ParentType = ResolversParentTypes['Mutation']> = {
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
export declare type PaymentCardResolvers<ContextType = Context, ParentType = ResolversParentTypes['PaymentCard']> = {
    trailingDigits?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
    type?: Resolver<ResolversTypes['PaymentCardType'], ParentType, ContextType>;
    __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};
export declare type PaymentCardInterfaceResolvers<ContextType = Context, ParentType = ResolversParentTypes['PaymentCardInterface']> = {
    __resolveType?: TypeResolveFn<'AccountCard' | 'PaymentCard', ParentType, ContextType>;
    trailingDigits?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
    type?: Resolver<ResolversTypes['PaymentCardType'], ParentType, ContextType>;
};
export declare type PaymentCheckResolvers<ContextType = Context, ParentType = ResolversParentTypes['PaymentCheck']> = {
    checkNumber?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
    __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};
export declare type PaymentCheckInterfaceResolvers<ContextType = Context, ParentType = ResolversParentTypes['PaymentCheckInterface']> = {
    __resolveType?: TypeResolveFn<'AccountCheck' | 'PaymentCheck', ParentType, ContextType>;
    checkNumber?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
};
export declare type PaymentMethodCardResolvers<ContextType = Context, ParentType = ResolversParentTypes['PaymentMethodCard']> = {
    card?: Resolver<ResolversTypes['PaymentCardInterface'], ParentType, ContextType>;
    currency?: Resolver<ResolversTypes['Currency'], ParentType, ContextType>;
    __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};
export declare type PaymentMethodCashResolvers<ContextType = Context, ParentType = ResolversParentTypes['PaymentMethodCash']> = {
    currency?: Resolver<ResolversTypes['Currency'], ParentType, ContextType>;
    __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};
export declare type PaymentMethodCheckResolvers<ContextType = Context, ParentType = ResolversParentTypes['PaymentMethodCheck']> = {
    check?: Resolver<ResolversTypes['PaymentCheckInterface'], ParentType, ContextType>;
    currency?: Resolver<ResolversTypes['Currency'], ParentType, ContextType>;
    __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};
export declare type PaymentMethodCombinationResolvers<ContextType = Context, ParentType = ResolversParentTypes['PaymentMethodCombination']> = {
    currency?: Resolver<ResolversTypes['Currency'], ParentType, ContextType>;
    __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};
export declare type PaymentMethodInterfaceResolvers<ContextType = Context, ParentType = ResolversParentTypes['PaymentMethodInterface']> = {
    __resolveType?: TypeResolveFn<'PaymentMethodCard' | 'PaymentMethodCash' | 'PaymentMethodCheck' | 'PaymentMethodCombination' | 'PaymentMethodOnline' | 'PaymentMethodUnknown', ParentType, ContextType>;
    currency?: Resolver<ResolversTypes['Currency'], ParentType, ContextType>;
};
export declare type PaymentMethodOnlineResolvers<ContextType = Context, ParentType = ResolversParentTypes['PaymentMethodOnline']> = {
    currency?: Resolver<ResolversTypes['Currency'], ParentType, ContextType>;
    __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};
export declare type PaymentMethodUnknownResolvers<ContextType = Context, ParentType = ResolversParentTypes['PaymentMethodUnknown']> = {
    currency?: Resolver<ResolversTypes['Currency'], ParentType, ContextType>;
    __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};
export declare type PersonResolvers<ContextType = Context, ParentType = ResolversParentTypes['Person']> = {
    id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
    name?: Resolver<ResolversTypes['PersonName'], ParentType, ContextType>;
    __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};
export declare type PersonNameResolvers<ContextType = Context, ParentType = ResolversParentTypes['PersonName']> = {
    first?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
    last?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
    __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};
export declare type QueryResolvers<ContextType = Context, ParentType = ResolversParentTypes['Query']> = {
    account?: Resolver<ResolversTypes['AccountInterface'], ParentType, ContextType, RequireFields<QueryAccountArgs, 'id'>>;
    accountCard?: Resolver<ResolversTypes['AccountCard'], ParentType, ContextType, RequireFields<QueryAccountCardArgs, 'id'>>;
    accountCards?: Resolver<Array<ResolversTypes['AccountCard']>, ParentType, ContextType, RequireFields<QueryAccountCardsArgs, never>>;
    accounts?: Resolver<Array<ResolversTypes['AccountInterface']>, ParentType, ContextType, RequireFields<QueryAccountsArgs, never>>;
    alias?: Resolver<Maybe<ResolversTypes['Alias']>, ParentType, ContextType, RequireFields<QueryAliasArgs, 'id'>>;
    aliases?: Resolver<Array<ResolversTypes['Alias']>, ParentType, ContextType, RequireFields<QueryAliasesArgs, never>>;
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
export declare type ReconcileEntriesPayloadResolvers<ContextType = Context, ParentType = ResolversParentTypes['ReconcileEntriesPayload']> = {
    reconciledEntries?: Resolver<Array<ResolversTypes['Entry']>, ParentType, ContextType>;
    reconciledRefunds?: Resolver<Array<ResolversTypes['EntryRefund']>, ParentType, ContextType>;
    __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};
export declare type SourceResolvers<ContextType = Context, ParentType = ResolversParentTypes['Source']> = {
    __resolveType?: TypeResolveFn<'Business' | 'Department' | 'Person', ParentType, ContextType>;
};
export declare type SubscriptionResolvers<ContextType = Context, ParentType = ResolversParentTypes['Subscription']> = {
    entryAdded?: SubscriptionResolver<ResolversTypes['Entry'], "entryAdded", ParentType, ContextType>;
    entryUpdated?: SubscriptionResolver<ResolversTypes['Entry'], "entryUpdated", ParentType, ContextType>;
    entryUpserted?: SubscriptionResolver<ResolversTypes['Entry'], "entryUpserted", ParentType, ContextType>;
};
export declare type UpdateEntryPayloadResolvers<ContextType = Context, ParentType = ResolversParentTypes['UpdateEntryPayload']> = {
    updatedEntry?: Resolver<ResolversTypes['Entry'], ParentType, ContextType>;
    __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};
export declare type UpdateEntryRefundPayloadResolvers<ContextType = Context, ParentType = ResolversParentTypes['UpdateEntryRefundPayload']> = {
    updatedEntryRefund?: Resolver<ResolversTypes['EntryRefund'], ParentType, ContextType>;
    __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};
export declare type UserResolvers<ContextType = Context, ParentType = ResolversParentTypes['User']> = {
    id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
    user?: Resolver<ResolversTypes['Person'], ParentType, ContextType>;
    __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};
export declare type VendorResolvers<ContextType = Context, ParentType = ResolversParentTypes['Vendor']> = {
    approved?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
    vendorId?: Resolver<Maybe<ResolversTypes['ID']>, ParentType, ContextType>;
    __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};
export declare type Resolvers<ContextType = Context> = {
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
    AliasTarget?: AliasTargetResolvers<ContextType>;
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
