import Fraction from 'fraction.js';
import { GraphQLResolveInfo, GraphQLScalarType, GraphQLScalarTypeConfig } from 'graphql';
import { BusinessDbRecord, CategoryDbRecord, DepartmentDbRecord, EntryDbRecord, EntryRefundDbRecord, EntryItemDbRecord } from './dataSources/accountingDb/types';
import { Context } from './types';
export declare type Maybe<T> = T | null;
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
    id: Scalars['ID'];
    account: AccountChecking | AccountCreditCard;
    active: Scalars['Boolean'];
    authorizedUsers: Array<Entity>;
    trailingDigits: Scalars['String'];
    type: PaymentCardType;
};
export declare type AccountCardsWhere = {
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
    id: Scalars['ID'];
    accountNumber: Scalars['String'];
    active: Scalars['Boolean'];
    cards: Array<AccountCard>;
    currency: Currency;
    name: Scalars['String'];
    owner: Entity;
};
export declare type AccountCreditCard = AccountInterface & AccountWithCardsInterface & {
    __typename?: 'AccountCreditCard';
    id: Scalars['ID'];
    active: Scalars['Boolean'];
    cards: Array<AccountCard>;
    currency: Currency;
    name: Scalars['String'];
    owner: Entity;
};
export declare type AccountInterface = {
    id: Scalars['ID'];
    active: Scalars['Boolean'];
    currency: Currency;
    name: Scalars['String'];
    owner: Entity;
};
export declare enum AccountType {
    CreditCard = "CREDIT_CARD",
    Checking = "CHECKING"
}
export declare type AccountWithCardsInterface = {
    id: Scalars['ID'];
    active: Scalars['Boolean'];
    cards: Array<AccountCard>;
    currency: Currency;
    name: Scalars['String'];
    owner: Entity;
};
export declare type AccountsWhere = {
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
    target: AliasTarget;
    name: Scalars['String'];
    type: AliasType;
};
export declare type AliasTarget = Category | Department;
export declare enum AliasType {
    Alias = "ALIAS",
    PrefixDescendants = "PREFIX_DESCENDANTS",
    PostfixDescendants = "POSTFIX_DESCENDANTS"
}
export declare type AliasesWhere = {
    id?: Maybe<WhereId>;
    target?: Maybe<WhereNode>;
    name?: Maybe<WhereRegex>;
    type?: Maybe<AliasType>;
    and?: Maybe<Array<AliasesWhere>>;
    or?: Maybe<Array<AliasesWhere>>;
    nor?: Maybe<Array<AliasesWhere>>;
};
export declare type Budget = {
    __typename?: 'Budget';
    id: Scalars['ID'];
    amount: Scalars['Rational'];
    owner: BudgetOwner;
    fiscalYear: FiscalYear;
};
export declare type BudgetOwner = Department | Business;
export declare type BudgetsWhere = {
    id?: Maybe<WhereId>;
    amount?: Maybe<WhereRational>;
    owner?: Maybe<WhereNode>;
    fiscalYear?: Maybe<FiscalYearsWhere>;
    and?: Maybe<Array<BudgetsWhere>>;
    or?: Maybe<Array<BudgetsWhere>>;
    nor?: Maybe<Array<BudgetsWhere>>;
};
export declare type Business = {
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
export declare type BusinessDepartmentsArgs = {
    root?: Maybe<Scalars['Boolean']>;
};
export declare type BusinessesWhere = {
    id?: Maybe<WhereId>;
    name?: Maybe<WhereRegex>;
    and?: Maybe<Array<BusinessesWhere>>;
    or?: Maybe<Array<BusinessesWhere>>;
    nor?: Maybe<Array<BusinessesWhere>>;
};
export declare type CategoriesWhere = {
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
export declare type Category = {
    __typename?: 'Category';
    id: Scalars['ID'];
    name: Scalars['String'];
    type: EntryType;
    parent?: Maybe<Category>;
    children: Array<Category>;
    ancestors: Array<Category>;
    aliases: Array<Alias>;
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
export declare type DepartmentAncestorsArgs = {
    root?: Maybe<DepartmentsWhere>;
};
export declare type DepartmentAncestor = Department | Business;
export declare type DepartmentsWhere = {
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
export declare type EntitiesWhere = {
    businesses?: Maybe<BusinessesWhere>;
    departments?: Maybe<DepartmentsWhere>;
    people?: Maybe<PeopleWhere>;
};
export declare type Entity = Person | Business | Department;
export declare type EntityInput = {
    type: EntityType;
    id: Scalars['ID'];
};
export declare enum EntityType {
    Person = "PERSON",
    Business = "BUSINESS",
    Department = "DEPARTMENT"
}
export declare type EntriesWhere = {
    id?: Maybe<WhereId>;
    refunds?: Maybe<EntryRefundsWhere>;
    items?: Maybe<EntryItemsWhere>;
    type?: Maybe<EntryType>;
    date?: Maybe<WhereDate>;
    dateOfRecord?: Maybe<EntriesWhereDateOfRecord>;
    department?: Maybe<DepartmentsWhere>;
    fiscalYear?: Maybe<FiscalYearsWhere>;
    category?: Maybe<CategoriesWhere>;
    description?: Maybe<WhereRegex>;
    total?: Maybe<WhereRational>;
    source?: Maybe<EntriesWhereSource>;
    reconciled?: Maybe<Scalars['Boolean']>;
    lastUpdate?: Maybe<WhereDate>;
    deleted?: Maybe<Scalars['Boolean']>;
    and?: Maybe<Array<EntriesWhere>>;
    or?: Maybe<Array<EntriesWhere>>;
    nor?: Maybe<Array<EntriesWhere>>;
};
export declare type EntriesWhereDateOfRecord = {
    date?: Maybe<WhereDate>;
    overrideFiscalYear?: Maybe<Scalars['Boolean']>;
};
export declare type EntriesWhereSource = {
    businesses?: Maybe<BusinessesWhere>;
    departments?: Maybe<DepartmentsWhere>;
    people?: Maybe<PeopleWhere>;
};
export declare type Entry = {
    __typename?: 'Entry';
    id: Scalars['ID'];
    category: Category;
    date: Scalars['Date'];
    dateOfRecord?: Maybe<EntryDateOfRecord>;
    deleted: Scalars['Boolean'];
    department: Department;
    description?: Maybe<Scalars['String']>;
    fiscalYear: FiscalYear;
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
    id: Scalars['ID'];
    category?: Maybe<Category>;
    deleted: Scalars['Boolean'];
    department?: Maybe<Department>;
    description?: Maybe<Scalars['String']>;
    lastUpdate: Scalars['Date'];
    total: Scalars['Rational'];
    units: Scalars['Int'];
};
export declare type EntryItemsWhere = {
    id?: Maybe<WhereId>;
    department?: Maybe<DepartmentsWhere>;
    category?: Maybe<CategoriesWhere>;
    units?: Maybe<WhereInt>;
    total?: Maybe<WhereRational>;
    lastUpdate?: Maybe<WhereDate>;
    deleted?: Maybe<Scalars['Boolean']>;
    and?: Maybe<Array<EntryItemsWhere>>;
    or?: Maybe<Array<EntryItemsWhere>>;
    nor?: Maybe<Array<EntryItemsWhere>>;
};
export declare type EntryRefund = {
    __typename?: 'EntryRefund';
    id: Scalars['ID'];
    date: Scalars['Date'];
    deleted: Scalars['Boolean'];
    description?: Maybe<Scalars['String']>;
    /** `Entry` associated with `EntryRefund` */
    entry: Entry;
    lastUpdate: Scalars['Date'];
    paymentMethod: PaymentMethodCard | PaymentMethodCash | PaymentMethodCheck | PaymentMethodCombination | PaymentMethodOnline | PaymentMethodUnknown;
    reconciled: Scalars['Boolean'];
    total: Scalars['Rational'];
};
export declare type EntryRefundsWhere = {
    id?: Maybe<WhereId>;
    date?: Maybe<WhereDate>;
    entry?: Maybe<EntriesWhere>;
    total?: Maybe<WhereRational>;
    reconciled?: Maybe<Scalars['Boolean']>;
    lastUpdate?: Maybe<WhereDate>;
    deleted?: Maybe<Scalars['Boolean']>;
    and?: Maybe<Array<EntryRefundsWhere>>;
    or?: Maybe<Array<EntryRefundsWhere>>;
    nor?: Maybe<Array<EntryRefundsWhere>>;
};
export declare enum EntryType {
    Credit = "CREDIT",
    Debit = "DEBIT"
}
export declare type FiscalYear = {
    __typename?: 'FiscalYear';
    id: Scalars['ID'];
    name: Scalars['String'];
    begin: Scalars['Date'];
    end: Scalars['Date'];
};
export declare type FiscalYearsWhere = {
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
    date?: Maybe<WhereDate>;
    and?: Maybe<Array<FiscalYearsWhere>>;
    or?: Maybe<Array<FiscalYearsWhere>>;
    nor?: Maybe<Array<FiscalYearsWhere>>;
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
    input?: Maybe<ReconcileEntries>;
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
    date: Scalars['Date'];
    dateOfRecord?: Maybe<NewEntryDateOfRecord>;
    department: Scalars['ID'];
    category: Scalars['ID'];
    paymentMethod: UpsertPaymentMethod;
    description?: Maybe<Scalars['String']>;
    total: Scalars['Rational'];
    source: UpsertEntrySource;
    reconciled?: Maybe<Scalars['Boolean']>;
};
/** `NewEntry.dateOfRecord` input. */
export declare type NewEntryDateOfRecord = {
    date: Scalars['Date'];
    overrideFiscalYear: Scalars['Boolean'];
};
export declare type NewEntryRefund = {
    entry: Scalars['ID'];
    date: Scalars['Date'];
    description?: Maybe<Scalars['String']>;
    paymentMethod: UpsertPaymentMethod;
    total: Scalars['Rational'];
    reconciled?: Maybe<Scalars['Boolean']>;
};
export declare type NewPerson = {
    name: PersonNameInput;
    email?: Maybe<Scalars['String']>;
    phone?: Maybe<Scalars['String']>;
};
export declare type NodeInput = {
    type: Scalars['String'];
    id: Scalars['ID'];
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
    Visa = "VISA",
    MasterCard = "MASTER_CARD",
    AmericanExpress = "AMERICAN_EXPRESS",
    Discover = "DISCOVER"
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
    currency: Currency;
    check: AccountCheckInput;
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
    currency: Currency;
    check: AccountCheck | PaymentCheck;
};
export declare type PaymentMethodCheckInput = {
    currency: Currency;
    check: PaymentCheckInput;
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
    Check = "CHECK",
    Cash = "CASH",
    Online = "ONLINE",
    Combination = "COMBINATION",
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
    first?: Maybe<WhereRegex>;
    last?: Maybe<WhereRegex>;
};
export declare type PeopleWhere = {
    id?: Maybe<WhereId>;
    name?: Maybe<PeopleNameWhere>;
    and?: Maybe<Array<PeopleWhere>>;
    or?: Maybe<Array<PeopleWhere>>;
    nor?: Maybe<Array<PeopleWhere>>;
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
    where?: Maybe<AccountCardsWhere>;
};
export declare type QueryAccountsArgs = {
    where?: Maybe<AccountsWhere>;
};
export declare type QueryAliasArgs = {
    id: Scalars['ID'];
};
export declare type QueryAliasesArgs = {
    where?: Maybe<AliasesWhere>;
};
export declare type QueryBudgetArgs = {
    id: Scalars['ID'];
};
export declare type QueryBudgetsArgs = {
    where?: Maybe<BudgetsWhere>;
};
export declare type QueryBusinessArgs = {
    id: Scalars['ID'];
};
export declare type QueryBusinessesArgs = {
    where?: Maybe<BusinessesWhere>;
};
export declare type QueryCategoriesArgs = {
    where?: Maybe<CategoriesWhere>;
};
export declare type QueryCategoryArgs = {
    id: Scalars['ID'];
};
export declare type QueryDepartmentArgs = {
    id: Scalars['ID'];
};
export declare type QueryDepartmentsArgs = {
    where?: Maybe<DepartmentsWhere>;
};
export declare type QueryEntitiesArgs = {
    where: EntitiesWhere;
};
export declare type QueryEntriesArgs = {
    where?: Maybe<EntriesWhere>;
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
    where?: Maybe<EntryRefundsWhere>;
};
export declare type QueryFiscalYearArgs = {
    id: Scalars['ID'];
};
export declare type QueryFiscalYearsArgs = {
    where?: Maybe<FiscalYearsWhere>;
};
export declare type QueryPeopleArgs = {
    where?: Maybe<PeopleWhere>;
};
export declare type QueryPersonArgs = {
    id: Scalars['ID'];
};
export declare type QuerySourcesArgs = {
    searchByName: Scalars['String'];
};
export declare type ReconcileEntries = {
    entries?: Maybe<Array<Maybe<Scalars['ID']>>>;
    refunds?: Maybe<Array<Maybe<Scalars['ID']>>>;
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
export declare type Source = Person | Business | Department;
export declare type Subscription = {
    __typename?: 'Subscription';
    entryAdded: Entry;
    entryUpdated: Entry;
    entryUpserted: Entry;
};
/** Requirers at least ONE optional field. */
export declare type UpdateEntry = {
    id: Scalars['ID'];
    date?: Maybe<Scalars['Date']>;
    dateOfRecord?: Maybe<UpdateEntryDateOfRecord>;
    department?: Maybe<Scalars['ID']>;
    category?: Maybe<Scalars['ID']>;
    paymentMethod?: Maybe<UpsertPaymentMethod>;
    description?: Maybe<Scalars['String']>;
    total?: Maybe<Scalars['Rational']>;
    source?: Maybe<UpsertEntrySource>;
    reconciled?: Maybe<Scalars['Boolean']>;
};
/** `UpdateEntry.dateOfRecord` input.  Fields "date" and "overrideFiscalYear" are mutually exclusive to field "clear".  Requires at least ONE optional field. */
export declare type UpdateEntryDateOfRecord = {
    date?: Maybe<Scalars['Date']>;
    overrideFiscalYear?: Maybe<Scalars['Boolean']>;
    clear?: Maybe<Scalars['Boolean']>;
};
export declare type UpdateEntryPayload = {
    __typename?: 'UpdateEntryPayload';
    updatedEntry: Entry;
};
export declare type UpdateEntryRefund = {
    id: Scalars['ID'];
    date?: Maybe<Scalars['Date']>;
    description?: Maybe<Scalars['String']>;
    paymentMethod?: Maybe<UpsertPaymentMethod>;
    total?: Maybe<Scalars['Rational']>;
    reconciled?: Maybe<Scalars['Boolean']>;
};
export declare type UpdateEntryRefundPayload = {
    __typename?: 'UpdateEntryRefundPayload';
    updatedEntryRefund: EntryRefund;
};
/** `NewEntry.source` and `UpdateEntry.source` input.  Choose ONE field only. */
export declare type UpsertEntrySource = {
    source?: Maybe<EntityInput>;
    business?: Maybe<NewBusiness>;
    person?: Maybe<NewPerson>;
};
/** One field is required and fields are mutually exclusive.. */
export declare type UpsertPaymentMethod = {
    card?: Maybe<PaymentMethodCardInput>;
    accountCard?: Maybe<PaymentMethodAccountCardInput>;
    check?: Maybe<PaymentMethodCheckInput>;
    accountCheck?: Maybe<PaymentMethodAccountCheckInput>;
    cash?: Maybe<PaymentMethodCashInput>;
    online?: Maybe<PaymentMethodOnlineInput>;
    combination?: Maybe<PaymentMethodCombinationInput>;
    unknown?: Maybe<PaymentMethodUnknownInput>;
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
    eq?: Maybe<Scalars['Date']>;
    ne?: Maybe<Scalars['Date']>;
    gt?: Maybe<Scalars['Date']>;
    gte?: Maybe<Scalars['Date']>;
    lt?: Maybe<Scalars['Date']>;
    lte?: Maybe<Scalars['Date']>;
};
export declare type WhereId = {
    eq?: Maybe<Scalars['ID']>;
    ne?: Maybe<Scalars['ID']>;
    in?: Maybe<Array<Scalars['ID']>>;
    nin?: Maybe<Array<Scalars['ID']>>;
};
export declare type WhereInt = {
    eq?: Maybe<Scalars['Int']>;
    ne?: Maybe<Scalars['Int']>;
    gt?: Maybe<Scalars['Int']>;
    gte?: Maybe<Scalars['Int']>;
    lt?: Maybe<Scalars['Int']>;
    lte?: Maybe<Scalars['Int']>;
};
export declare type WhereNode = {
    eq?: Maybe<NodeInput>;
    ne?: Maybe<NodeInput>;
    in?: Maybe<Array<NodeInput>>;
    nin?: Maybe<Array<NodeInput>>;
};
export declare type WhereRational = {
    eq?: Maybe<Scalars['Rational']>;
    ne?: Maybe<Scalars['Rational']>;
    in?: Maybe<Array<Scalars['Rational']>>;
    nin?: Maybe<Array<Scalars['Rational']>>;
    gt?: Maybe<Scalars['Rational']>;
    lt?: Maybe<Scalars['Rational']>;
    gte?: Maybe<Scalars['Rational']>;
    lte?: Maybe<Scalars['Rational']>;
};
export declare type WhereRegex = {
    /**
     * "pattern" argument of the javascript RegExp constructor.
     * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/RegExp/RegExp#parameters
     */
    pattern: Scalars['String'];
    flags?: Maybe<Array<RegexFlags>>;
};
export declare type WhereTreeId = {
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
export declare type ResolverTypeWrapper<T> = Promise<T> | T;
export declare type ResolverWithResolve<TResult, TParent, TContext, TArgs> = {
    resolve: ResolverFn<TResult, TParent, TContext, TArgs>;
};
export declare type Resolver<TResult, TParent = {}, TContext = {}, TArgs = {}> = ResolverFn<TResult, TParent, TContext, TArgs> | ResolverWithResolve<TResult, TParent, TContext, TArgs>;
export declare type ResolverFn<TResult, TParent, TContext, TArgs> = (parent: TParent, args: TArgs, context: TContext, info: GraphQLResolveInfo) => Promise<TResult> | TResult;
export declare type SubscriptionSubscribeFn<TResult, TParent, TContext, TArgs> = (parent: TParent, args: TArgs, context: TContext, info: GraphQLResolveInfo) => AsyncIterator<TResult> | Promise<AsyncIterator<TResult>>;
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
    AccountCard: ResolverTypeWrapper<Omit<AccountCard, 'authorizedUsers'> & {
        authorizedUsers: Array<ResolversTypes['Entity']>;
    }>;
    ID: ResolverTypeWrapper<Scalars['ID']>;
    Boolean: ResolverTypeWrapper<Scalars['Boolean']>;
    String: ResolverTypeWrapper<Scalars['String']>;
    AccountCardsWhere: AccountCardsWhere;
    AccountCheck: ResolverTypeWrapper<AccountCheck>;
    AccountCheckInput: AccountCheckInput;
    AccountChecking: ResolverTypeWrapper<Omit<AccountChecking, 'owner'> & {
        owner: ResolversTypes['Entity'];
    }>;
    AccountCreditCard: ResolverTypeWrapper<Omit<AccountCreditCard, 'owner'> & {
        owner: ResolversTypes['Entity'];
    }>;
    AccountInterface: ResolversTypes['AccountChecking'] | ResolversTypes['AccountCreditCard'];
    AccountType: AccountType;
    AccountWithCardsInterface: ResolversTypes['AccountChecking'] | ResolversTypes['AccountCreditCard'];
    AccountsWhere: AccountsWhere;
    AddNewEntryPayload: ResolverTypeWrapper<Omit<AddNewEntryPayload, 'newEntry'> & {
        newEntry: ResolversTypes['Entry'];
    }>;
    AddNewEntryRefundPayload: ResolverTypeWrapper<Omit<AddNewEntryRefundPayload, 'newEntryRefund'> & {
        newEntryRefund: ResolversTypes['EntryRefund'];
    }>;
    AddNewPersonPayload: ResolverTypeWrapper<AddNewPersonPayload>;
    Alias: ResolverTypeWrapper<Omit<Alias, 'target'> & {
        target: ResolversTypes['AliasTarget'];
    }>;
    AliasTarget: ResolversTypes['Category'] | ResolversTypes['Department'];
    AliasType: AliasType;
    AliasesWhere: AliasesWhere;
    Budget: ResolverTypeWrapper<Omit<Budget, 'owner'> & {
        owner: ResolversTypes['BudgetOwner'];
    }>;
    BudgetOwner: ResolversTypes['Department'] | ResolversTypes['Business'];
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
    DepartmentAncestor: ResolversTypes['Department'] | ResolversTypes['Business'];
    DepartmentsWhere: DepartmentsWhere;
    EntitiesWhere: EntitiesWhere;
    Entity: ResolversTypes['Person'] | ResolversTypes['Business'] | ResolversTypes['Department'];
    EntityInput: EntityInput;
    EntityType: EntityType;
    EntriesWhere: EntriesWhere;
    EntriesWhereDateOfRecord: EntriesWhereDateOfRecord;
    EntriesWhereSource: EntriesWhereSource;
    Entry: ResolverTypeWrapper<EntryDbRecord>;
    EntryDateOfRecord: ResolverTypeWrapper<EntryDateOfRecord>;
    EntryItem: ResolverTypeWrapper<EntryItemDbRecord>;
    Int: ResolverTypeWrapper<Scalars['Int']>;
    EntryItemsWhere: EntryItemsWhere;
    EntryRefund: ResolverTypeWrapper<EntryRefundDbRecord>;
    EntryRefundsWhere: EntryRefundsWhere;
    EntryType: EntryType;
    FiscalYear: ResolverTypeWrapper<FiscalYear>;
    FiscalYearsWhere: FiscalYearsWhere;
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
    Person: ResolverTypeWrapper<Person>;
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
    Source: ResolversTypes['Person'] | ResolversTypes['Business'] | ResolversTypes['Department'];
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
export declare type ResolversParentTypes = {
    AccountCard: Omit<AccountCard, 'authorizedUsers'> & {
        authorizedUsers: Array<ResolversParentTypes['Entity']>;
    };
    ID: Scalars['ID'];
    Boolean: Scalars['Boolean'];
    String: Scalars['String'];
    AccountCardsWhere: AccountCardsWhere;
    AccountCheck: AccountCheck;
    AccountCheckInput: AccountCheckInput;
    AccountChecking: Omit<AccountChecking, 'owner'> & {
        owner: ResolversParentTypes['Entity'];
    };
    AccountCreditCard: Omit<AccountCreditCard, 'owner'> & {
        owner: ResolversParentTypes['Entity'];
    };
    AccountInterface: ResolversParentTypes['AccountChecking'] | ResolversParentTypes['AccountCreditCard'];
    AccountWithCardsInterface: ResolversParentTypes['AccountChecking'] | ResolversParentTypes['AccountCreditCard'];
    AccountsWhere: AccountsWhere;
    AddNewEntryPayload: Omit<AddNewEntryPayload, 'newEntry'> & {
        newEntry: ResolversParentTypes['Entry'];
    };
    AddNewEntryRefundPayload: Omit<AddNewEntryRefundPayload, 'newEntryRefund'> & {
        newEntryRefund: ResolversParentTypes['EntryRefund'];
    };
    AddNewPersonPayload: AddNewPersonPayload;
    Alias: Omit<Alias, 'target'> & {
        target: ResolversParentTypes['AliasTarget'];
    };
    AliasTarget: ResolversParentTypes['Category'] | ResolversParentTypes['Department'];
    AliasesWhere: AliasesWhere;
    Budget: Omit<Budget, 'owner'> & {
        owner: ResolversParentTypes['BudgetOwner'];
    };
    BudgetOwner: ResolversParentTypes['Department'] | ResolversParentTypes['Business'];
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
    DepartmentAncestor: ResolversParentTypes['Department'] | ResolversParentTypes['Business'];
    DepartmentsWhere: DepartmentsWhere;
    EntitiesWhere: EntitiesWhere;
    Entity: ResolversParentTypes['Person'] | ResolversParentTypes['Business'] | ResolversParentTypes['Department'];
    EntityInput: EntityInput;
    EntriesWhere: EntriesWhere;
    EntriesWhereDateOfRecord: EntriesWhereDateOfRecord;
    EntriesWhereSource: EntriesWhereSource;
    Entry: EntryDbRecord;
    EntryDateOfRecord: EntryDateOfRecord;
    EntryItem: EntryItemDbRecord;
    Int: Scalars['Int'];
    EntryItemsWhere: EntryItemsWhere;
    EntryRefund: EntryRefundDbRecord;
    EntryRefundsWhere: EntryRefundsWhere;
    FiscalYear: FiscalYear;
    FiscalYearsWhere: FiscalYearsWhere;
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
    Person: Person;
    PersonName: PersonName;
    PersonNameInput: PersonNameInput;
    Query: {};
    Rational: Scalars['Rational'];
    ReconcileEntries: ReconcileEntries;
    ReconcileEntriesPayload: Omit<ReconcileEntriesPayload, 'reconciledEntries' | 'reconciledRefunds'> & {
        reconciledEntries: Array<ResolversParentTypes['Entry']>;
        reconciledRefunds: Array<ResolversParentTypes['EntryRefund']>;
    };
    Source: ResolversParentTypes['Person'] | ResolversParentTypes['Business'] | ResolversParentTypes['Department'];
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
export declare type AccountCardResolvers<ContextType = Context, ParentType = ResolversParentTypes['AccountCard']> = {
    id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
    account?: Resolver<ResolversTypes['AccountWithCardsInterface'], ParentType, ContextType>;
    active?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
    authorizedUsers?: Resolver<Array<ResolversTypes['Entity']>, ParentType, ContextType>;
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
    id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
    accountNumber?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
    active?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
    cards?: Resolver<Array<ResolversTypes['AccountCard']>, ParentType, ContextType>;
    currency?: Resolver<ResolversTypes['Currency'], ParentType, ContextType>;
    name?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
    owner?: Resolver<ResolversTypes['Entity'], ParentType, ContextType>;
    __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};
export declare type AccountCreditCardResolvers<ContextType = Context, ParentType = ResolversParentTypes['AccountCreditCard']> = {
    id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
    active?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
    cards?: Resolver<Array<ResolversTypes['AccountCard']>, ParentType, ContextType>;
    currency?: Resolver<ResolversTypes['Currency'], ParentType, ContextType>;
    name?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
    owner?: Resolver<ResolversTypes['Entity'], ParentType, ContextType>;
    __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};
export declare type AccountInterfaceResolvers<ContextType = Context, ParentType = ResolversParentTypes['AccountInterface']> = {
    __resolveType?: TypeResolveFn<'AccountChecking' | 'AccountCreditCard', ParentType, ContextType>;
    id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
    active?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
    currency?: Resolver<ResolversTypes['Currency'], ParentType, ContextType>;
    name?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
    owner?: Resolver<ResolversTypes['Entity'], ParentType, ContextType>;
};
export declare type AccountWithCardsInterfaceResolvers<ContextType = Context, ParentType = ResolversParentTypes['AccountWithCardsInterface']> = {
    __resolveType?: TypeResolveFn<'AccountChecking' | 'AccountCreditCard', ParentType, ContextType>;
    id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
    active?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
    cards?: Resolver<Array<ResolversTypes['AccountCard']>, ParentType, ContextType>;
    currency?: Resolver<ResolversTypes['Currency'], ParentType, ContextType>;
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
    target?: Resolver<ResolversTypes['AliasTarget'], ParentType, ContextType>;
    name?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
    type?: Resolver<ResolversTypes['AliasType'], ParentType, ContextType>;
    __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};
export declare type AliasTargetResolvers<ContextType = Context, ParentType = ResolversParentTypes['AliasTarget']> = {
    __resolveType?: TypeResolveFn<'Category' | 'Department', ParentType, ContextType>;
};
export declare type BudgetResolvers<ContextType = Context, ParentType = ResolversParentTypes['Budget']> = {
    id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
    amount?: Resolver<ResolversTypes['Rational'], ParentType, ContextType>;
    owner?: Resolver<ResolversTypes['BudgetOwner'], ParentType, ContextType>;
    fiscalYear?: Resolver<ResolversTypes['FiscalYear'], ParentType, ContextType>;
    __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};
export declare type BudgetOwnerResolvers<ContextType = Context, ParentType = ResolversParentTypes['BudgetOwner']> = {
    __resolveType?: TypeResolveFn<'Department' | 'Business', ParentType, ContextType>;
};
export declare type BusinessResolvers<ContextType = Context, ParentType = ResolversParentTypes['Business']> = {
    id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
    name?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
    budgets?: Resolver<Array<ResolversTypes['Budget']>, ParentType, ContextType>;
    departments?: Resolver<Array<ResolversTypes['Department']>, ParentType, ContextType, RequireFields<BusinessDepartmentsArgs, 'root'>>;
    vendor?: Resolver<Maybe<ResolversTypes['Vendor']>, ParentType, ContextType>;
    __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};
export declare type CategoryResolvers<ContextType = Context, ParentType = ResolversParentTypes['Category']> = {
    id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
    name?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
    type?: Resolver<ResolversTypes['EntryType'], ParentType, ContextType>;
    parent?: Resolver<Maybe<ResolversTypes['Category']>, ParentType, ContextType>;
    children?: Resolver<Array<ResolversTypes['Category']>, ParentType, ContextType>;
    ancestors?: Resolver<Array<ResolversTypes['Category']>, ParentType, ContextType>;
    aliases?: Resolver<Array<ResolversTypes['Alias']>, ParentType, ContextType>;
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
    id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
    name?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
    code?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
    budgets?: Resolver<Array<ResolversTypes['Budget']>, ParentType, ContextType>;
    business?: Resolver<ResolversTypes['Business'], ParentType, ContextType>;
    parent?: Resolver<ResolversTypes['DepartmentAncestor'], ParentType, ContextType>;
    children?: Resolver<Array<ResolversTypes['Department']>, ParentType, ContextType>;
    ancestors?: Resolver<Array<ResolversTypes['DepartmentAncestor']>, ParentType, ContextType, RequireFields<DepartmentAncestorsArgs, never>>;
    descendants?: Resolver<Array<ResolversTypes['Department']>, ParentType, ContextType>;
    virtualRoot?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
    aliases?: Resolver<Array<ResolversTypes['Alias']>, ParentType, ContextType>;
    __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};
export declare type DepartmentAncestorResolvers<ContextType = Context, ParentType = ResolversParentTypes['DepartmentAncestor']> = {
    __resolveType?: TypeResolveFn<'Department' | 'Business', ParentType, ContextType>;
};
export declare type EntityResolvers<ContextType = Context, ParentType = ResolversParentTypes['Entity']> = {
    __resolveType?: TypeResolveFn<'Person' | 'Business' | 'Department', ParentType, ContextType>;
};
export declare type EntryResolvers<ContextType = Context, ParentType = ResolversParentTypes['Entry']> = {
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
export declare type EntryDateOfRecordResolvers<ContextType = Context, ParentType = ResolversParentTypes['EntryDateOfRecord']> = {
    date?: Resolver<ResolversTypes['Date'], ParentType, ContextType>;
    overrideFiscalYear?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
    __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};
export declare type EntryItemResolvers<ContextType = Context, ParentType = ResolversParentTypes['EntryItem']> = {
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
export declare type EntryRefundResolvers<ContextType = Context, ParentType = ResolversParentTypes['EntryRefund']> = {
    id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
    date?: Resolver<ResolversTypes['Date'], ParentType, ContextType>;
    deleted?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
    description?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
    entry?: Resolver<ResolversTypes['Entry'], ParentType, ContextType>;
    lastUpdate?: Resolver<ResolversTypes['Date'], ParentType, ContextType>;
    paymentMethod?: Resolver<ResolversTypes['PaymentMethodInterface'], ParentType, ContextType>;
    reconciled?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
    total?: Resolver<ResolversTypes['Rational'], ParentType, ContextType>;
    __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};
export declare type FiscalYearResolvers<ContextType = Context, ParentType = ResolversParentTypes['FiscalYear']> = {
    id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
    name?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
    begin?: Resolver<ResolversTypes['Date'], ParentType, ContextType>;
    end?: Resolver<ResolversTypes['Date'], ParentType, ContextType>;
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
    currency?: Resolver<ResolversTypes['Currency'], ParentType, ContextType>;
    check?: Resolver<ResolversTypes['PaymentCheckInterface'], ParentType, ContextType>;
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
    entries?: Resolver<Array<ResolversTypes['Entry']>, ParentType, ContextType, RequireFields<QueryEntriesArgs, never>>;
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
    __resolveType?: TypeResolveFn<'Person' | 'Business' | 'Department', ParentType, ContextType>;
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
