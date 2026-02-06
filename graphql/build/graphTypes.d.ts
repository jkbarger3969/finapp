import Fraction from 'fraction.js';
import { GraphQLResolveInfo, GraphQLScalarType, GraphQLScalarTypeConfig } from 'graphql';
import { PaymentCardDbRecord, AccountDbRecord, BudgetDbRecord, BusinessDbRecord, CategoryDbRecord, DepartmentDbRecord, EntryDbRecord, EntryRefundDbRecord, EntryItemDbRecord, FiscalYearDbRecord, AliasTypeDbRecord, PersonDbRecord } from './dataSources/accountingDb/types';
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
export declare type MakeEmpty<T extends {
    [key: string]: unknown;
}, K extends keyof T> = {
    [_ in K]?: never;
};
export declare type Incremental<T> = T | {
    [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never;
};
export declare type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>;
export declare type RequireFields<T, K extends keyof T> = Omit<T, K> & {
    [P in K]-?: NonNullable<T[P]>;
};
/** All built-in and custom scalars, mapped to their actual values */
export declare type Scalars = {
    ID: {
        input: string;
        output: string;
    };
    String: {
        input: string;
        output: string;
    };
    Boolean: {
        input: boolean;
        output: boolean;
    };
    Int: {
        input: number;
        output: number;
    };
    Float: {
        input: number;
        output: number;
    };
    /** ISO 8601 */
    Date: {
        input: Date;
        output: Date;
    };
    /** The JSON scalar type represents JSON values as specified by [ECMA-404](http://www.ecma-international.org/publications/files/ECMA-ST/ECMA-404.pdf). */
    JSON: {
        input: any;
        output: any;
    };
    Rational: {
        input: Fraction;
        output: Fraction;
    };
    /**
     * The Upload scalar type represents a file upload.
     * Used with graphql-upload for handling multipart file uploads.
     */
    Upload: {
        input: any;
        output: any;
    };
};
export declare type AccountCard = Aliasable & PaymentCardInterface & {
    __typename?: 'AccountCard';
    account: AccountChecking | AccountCreditCard;
    active: Scalars['Boolean']['output'];
    aliases: Array<Alias>;
    authorizedUsers: Array<Entity>;
    id: Scalars['ID']['output'];
    trailingDigits: Scalars['String']['output'];
    type: PaymentCardType;
};
export declare type AccountCardAliasesArgs = {
    where?: InputMaybe<AliasesWhere>;
};
export declare type AccountCardsWhere = {
    account?: InputMaybe<AccountsWhere>;
    active?: InputMaybe<Scalars['Boolean']['input']>;
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
    checkNumber: Scalars['String']['output'];
};
export declare type AccountCheckInput = {
    /** id of AccountChecking */
    account: Scalars['ID']['input'];
    checkNumber: Scalars['String']['input'];
};
export declare type AccountChecking = AccountInterface & AccountWithCardsInterface & {
    __typename?: 'AccountChecking';
    accountNumber: Scalars['String']['output'];
    active: Scalars['Boolean']['output'];
    cards: Array<AccountCard>;
    currency: Currency;
    id: Scalars['ID']['output'];
    name: Scalars['String']['output'];
    owner: Entity;
};
export declare type AccountCreditCard = AccountInterface & AccountWithCardsInterface & {
    __typename?: 'AccountCreditCard';
    active: Scalars['Boolean']['output'];
    cards: Array<AccountCard>;
    currency: Currency;
    id: Scalars['ID']['output'];
    name: Scalars['String']['output'];
    owner: Entity;
};
export declare type AccountInterface = {
    active: Scalars['Boolean']['output'];
    currency: Currency;
    id: Scalars['ID']['output'];
    name: Scalars['String']['output'];
    owner: Entity;
};
export declare enum AccountType {
    Checking = "CHECKING",
    CreditCard = "CREDIT_CARD"
}
export declare type AccountWithCardsInterface = {
    active: Scalars['Boolean']['output'];
    cards: Array<AccountCard>;
    currency: Currency;
    id: Scalars['ID']['output'];
    name: Scalars['String']['output'];
    owner: Entity;
};
export declare type AccountsWhere = {
    accountNumber?: InputMaybe<WhereRegex>;
    accountType?: InputMaybe<AccountType>;
    active?: InputMaybe<Scalars['Boolean']['input']>;
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
    id: Scalars['ID']['output'];
    name: Scalars['String']['output'];
};
export declare type Aliasable = {
    aliases: Array<Alias>;
};
export declare type AliasableAliasesArgs = {
    where?: InputMaybe<AliasesWhere>;
};
export declare type AliasesWhere = {
    id?: InputMaybe<WhereId>;
};
/**
 * Attachment represents a file (receipt, document, etc.) attached to an Entry.
 * Files are stored in Google Cloud Storage.
 */
export declare type Attachment = {
    __typename?: 'Attachment';
    /** Whether this attachment has been deleted */
    deleted: Scalars['Boolean']['output'];
    /** File size in bytes */
    fileSize: Scalars['Int']['output'];
    filename: Scalars['String']['output'];
    /** GCS bucket name where the file is stored */
    gcsBucket: Scalars['String']['output'];
    /** Path within the GCS bucket */
    gcsPath: Scalars['String']['output'];
    /** Google Cloud Storage URL for accessing the file */
    gcsUrl: Scalars['String']['output'];
    id: Scalars['ID']['output'];
    /** MIME type of the file (e.g., image/jpeg, application/pdf) */
    mimeType: Scalars['String']['output'];
    /** Optional thumbnail URL for image previews */
    thumbnailUrl?: Maybe<Scalars['String']['output']>;
    /** When the file was uploaded */
    uploadedAt: Scalars['Date']['output'];
    /** Email of the user who uploaded the file */
    uploadedBy: Scalars['String']['output'];
};
export declare type AttachmentsWhere = {
    and?: InputMaybe<Array<AttachmentsWhere>>;
    deleted?: InputMaybe<Scalars['Boolean']['input']>;
    filename?: InputMaybe<WhereRegex>;
    id?: InputMaybe<WhereId>;
    mimeType?: InputMaybe<WhereRegex>;
    nor?: InputMaybe<Array<AttachmentsWhere>>;
    or?: InputMaybe<Array<AttachmentsWhere>>;
    uploadedAt?: InputMaybe<WhereDate>;
    uploadedBy?: InputMaybe<WhereRegex>;
};
export declare type Budget = {
    __typename?: 'Budget';
    amount: Scalars['Rational']['output'];
    fiscalYear: FiscalYear;
    id: Scalars['ID']['output'];
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
    id: Scalars['ID']['output'];
    name: Scalars['String']['output'];
    vendor?: Maybe<Vendor>;
};
export declare type BusinessDepartmentsArgs = {
    root?: InputMaybe<Scalars['Boolean']['input']>;
};
export declare type BusinessesWhere = {
    and?: InputMaybe<Array<BusinessesWhere>>;
    id?: InputMaybe<WhereId>;
    name?: InputMaybe<WhereRegex>;
    nor?: InputMaybe<Array<BusinessesWhere>>;
    or?: InputMaybe<Array<BusinessesWhere>>;
};
export declare type CategoriesWhere = {
    active?: InputMaybe<Scalars['Boolean']['input']>;
    and?: InputMaybe<Array<CategoriesWhere>>;
    id?: InputMaybe<WhereTreeId>;
    name?: InputMaybe<WhereRegex>;
    nor?: InputMaybe<Array<CategoriesWhere>>;
    or?: InputMaybe<Array<CategoriesWhere>>;
    parent?: InputMaybe<WhereId>;
    /** Root Categories i.e. NO parent. */
    root?: InputMaybe<Scalars['Boolean']['input']>;
    type?: InputMaybe<EntryType>;
};
export declare type Category = {
    __typename?: 'Category';
    active: Scalars['Boolean']['output'];
    aliases: Array<Alias>;
    ancestors: Array<Category>;
    children: Array<Category>;
    id: Scalars['ID']['output'];
    name: Scalars['String']['output'];
    parent?: Maybe<Category>;
    type: EntryType;
};
export declare type CreateAccountCardInput = {
    accountId: Scalars['ID']['input'];
    active?: InputMaybe<Scalars['Boolean']['input']>;
    trailingDigits: Scalars['String']['input'];
    type: PaymentCardType;
};
export declare enum Currency {
    Usd = "USD"
}
export declare type DeleteAttachmentPayload = {
    __typename?: 'DeleteAttachmentPayload';
    deletedAttachment: Attachment;
};
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
    code?: Maybe<Scalars['String']['output']>;
    descendants: Array<Department>;
    disable: Array<FiscalYear>;
    id: Scalars['ID']['output'];
    name: Scalars['String']['output'];
    parent?: Maybe<DepartmentAncestor>;
    virtualRoot?: Maybe<Scalars['Boolean']['output']>;
};
export declare type DepartmentAncestorsArgs = {
    root?: InputMaybe<DepartmentsWhere>;
};
export declare type DepartmentAncestor = Business | Department;
export declare type DepartmentsWhere = {
    and?: InputMaybe<Array<DepartmentsWhere>>;
    /** Matches all departments that are a decedents of the business. */
    business?: InputMaybe<Scalars['ID']['input']>;
    code?: InputMaybe<Scalars['String']['input']>;
    id?: InputMaybe<WhereTreeId>;
    name?: InputMaybe<WhereRegex>;
    nor?: InputMaybe<Array<DepartmentsWhere>>;
    or?: InputMaybe<Array<DepartmentsWhere>>;
    parent?: InputMaybe<WhereNode>;
};
export declare type EditHistoryEntry = {
    __typename?: 'EditHistoryEntry';
    changes: Scalars['JSON']['output'];
    editedAt: Scalars['Date']['output'];
    editedBy: Scalars['String']['output'];
    id: Scalars['ID']['output'];
};
export declare type EntitiesWhere = {
    businesses?: InputMaybe<BusinessesWhere>;
    departments?: InputMaybe<DepartmentsWhere>;
    people?: InputMaybe<PeopleWhere>;
};
export declare type Entity = Business | Department | Person;
export declare type EntityInput = {
    id: Scalars['ID']['input'];
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
    deleted?: InputMaybe<Scalars['Boolean']['input']>;
    department?: InputMaybe<DepartmentsWhere>;
    description?: InputMaybe<WhereRegex>;
    fiscalYear?: InputMaybe<FiscalYearsWhere>;
    id?: InputMaybe<WhereId>;
    items?: InputMaybe<EntryItemsWhere>;
    lastUpdate?: InputMaybe<WhereDate>;
    nor?: InputMaybe<Array<EntriesWhere>>;
    or?: InputMaybe<Array<EntriesWhere>>;
    reconciled?: InputMaybe<Scalars['Boolean']['input']>;
    refunds?: InputMaybe<EntryRefundsWhere>;
    source?: InputMaybe<EntriesWhereSource>;
    total?: InputMaybe<WhereRational>;
    type?: InputMaybe<EntryType>;
};
export declare type EntriesWhereDateOfRecord = {
    date?: InputMaybe<WhereDate>;
    overrideFiscalYear?: InputMaybe<Scalars['Boolean']['input']>;
};
export declare type EntriesWhereSource = {
    businesses?: InputMaybe<BusinessesWhere>;
    departments?: InputMaybe<DepartmentsWhere>;
    people?: InputMaybe<PeopleWhere>;
};
export declare type Entry = {
    __typename?: 'Entry';
    /** File attachments (receipts, documents, etc.) associated with this entry */
    attachments: Array<Attachment>;
    category: Category;
    date: Scalars['Date']['output'];
    dateOfRecord?: Maybe<EntryDateOfRecord>;
    deleted: Scalars['Boolean']['output'];
    department: Department;
    description?: Maybe<Scalars['String']['output']>;
    /** Audit log of changes made to this entry */
    editHistory: Array<EditHistoryEntry>;
    fiscalYear: FiscalYear;
    id: Scalars['ID']['output'];
    items: Array<EntryItem>;
    lastEditedAt?: Maybe<Scalars['Date']['output']>;
    lastEditedBy?: Maybe<Scalars['String']['output']>;
    lastUpdate: Scalars['Date']['output'];
    paymentMethod: PaymentMethodCard | PaymentMethodCash | PaymentMethodCheck | PaymentMethodCombination | PaymentMethodOnline | PaymentMethodUnknown;
    reconciled: Scalars['Boolean']['output'];
    refunds: Array<EntryRefund>;
    source: Entity;
    total: Scalars['Rational']['output'];
};
/** `Entry.source` value. */
export declare type EntryDateOfRecord = {
    __typename?: 'EntryDateOfRecord';
    date: Scalars['Date']['output'];
    overrideFiscalYear: Scalars['Boolean']['output'];
};
export declare type EntryItem = {
    __typename?: 'EntryItem';
    category?: Maybe<Category>;
    deleted: Scalars['Boolean']['output'];
    department?: Maybe<Department>;
    description?: Maybe<Scalars['String']['output']>;
    id: Scalars['ID']['output'];
    lastUpdate: Scalars['Date']['output'];
    total: Scalars['Rational']['output'];
    units: Scalars['Int']['output'];
};
export declare type EntryItemsWhere = {
    and?: InputMaybe<Array<EntryItemsWhere>>;
    category?: InputMaybe<CategoriesWhere>;
    deleted?: InputMaybe<Scalars['Boolean']['input']>;
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
    date: Scalars['Date']['output'];
    dateOfRecord?: Maybe<EntryDateOfRecord>;
    deleted: Scalars['Boolean']['output'];
    description?: Maybe<Scalars['String']['output']>;
    /** `Entry` associated with `EntryRefund` */
    entry: Entry;
    fiscalYear: FiscalYear;
    id: Scalars['ID']['output'];
    lastUpdate: Scalars['Date']['output'];
    paymentMethod: PaymentMethodCard | PaymentMethodCash | PaymentMethodCheck | PaymentMethodCombination | PaymentMethodOnline | PaymentMethodUnknown;
    reconciled: Scalars['Boolean']['output'];
    total: Scalars['Rational']['output'];
};
export declare type EntryRefundsWhere = {
    and?: InputMaybe<Array<EntryRefundsWhere>>;
    date?: InputMaybe<WhereDate>;
    dateOfRecord?: InputMaybe<EntriesWhereDateOfRecord>;
    deleted?: InputMaybe<Scalars['Boolean']['input']>;
    fiscalYear?: InputMaybe<FiscalYearsWhere>;
    id?: InputMaybe<WhereId>;
    lastUpdate?: InputMaybe<WhereDate>;
    nor?: InputMaybe<Array<EntryRefundsWhere>>;
    or?: InputMaybe<Array<EntryRefundsWhere>>;
    reconciled?: InputMaybe<Scalars['Boolean']['input']>;
    total?: InputMaybe<WhereRational>;
};
export declare enum EntryType {
    Credit = "CREDIT",
    Debit = "DEBIT"
}
export declare type FiscalYear = {
    __typename?: 'FiscalYear';
    begin: Scalars['Date']['output'];
    end: Scalars['Date']['output'];
    id: Scalars['ID']['output'];
    name: Scalars['String']['output'];
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
    createAccountCard: AccountCard;
    deleteAccountCard: Scalars['Boolean']['output'];
    /**
     * Delete an attachment from an entry.
     * This marks the attachment as deleted and removes it from GCS.
     */
    deleteAttachment: DeleteAttachmentPayload;
    deleteEntry: DeleteEntryPayload;
    deleteEntryRefund: DeleteEntryRefundPayload;
    reconcileEntries: ReconcileEntriesPayload;
    updateAccountCard: AccountCard;
    updateEntry: UpdateEntryPayload;
    updateEntryRefund: UpdateEntryRefundPayload;
    /**
     * Upload a receipt file to an entry.
     * The file will be stored in Google Cloud Storage.
     */
    uploadReceipt: UploadReceiptPayload;
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
export declare type MutationCreateAccountCardArgs = {
    input: CreateAccountCardInput;
};
export declare type MutationDeleteAccountCardArgs = {
    id: Scalars['ID']['input'];
};
export declare type MutationDeleteAttachmentArgs = {
    id: Scalars['ID']['input'];
};
export declare type MutationDeleteEntryArgs = {
    id: Scalars['ID']['input'];
};
export declare type MutationDeleteEntryRefundArgs = {
    id: Scalars['ID']['input'];
};
export declare type MutationReconcileEntriesArgs = {
    input?: InputMaybe<ReconcileEntries>;
};
export declare type MutationUpdateAccountCardArgs = {
    id: Scalars['ID']['input'];
    input: UpdateAccountCardInput;
};
export declare type MutationUpdateEntryArgs = {
    input: UpdateEntry;
};
export declare type MutationUpdateEntryRefundArgs = {
    input: UpdateEntryRefund;
};
export declare type MutationUploadReceiptArgs = {
    entryId: Scalars['ID']['input'];
    file: Scalars['Upload']['input'];
};
export declare type NewAlias = {
    name: Scalars['String']['input'];
    type: Scalars['String']['input'];
};
export declare type NewBusiness = {
    name: Scalars['String']['input'];
};
export declare type NewEntry = {
    category: Scalars['ID']['input'];
    date: Scalars['Date']['input'];
    dateOfRecord?: InputMaybe<NewEntryDateOfRecord>;
    department: Scalars['ID']['input'];
    description?: InputMaybe<Scalars['String']['input']>;
    paymentMethod: UpsertPaymentMethod;
    reconciled?: InputMaybe<Scalars['Boolean']['input']>;
    source: UpsertEntrySource;
    total: Scalars['Rational']['input'];
};
/** `NewEntry.dateOfRecord` input. */
export declare type NewEntryDateOfRecord = {
    date: Scalars['Date']['input'];
    overrideFiscalYear: Scalars['Boolean']['input'];
};
export declare type NewEntryRefund = {
    date: Scalars['Date']['input'];
    dateOfRecord?: InputMaybe<NewEntryDateOfRecord>;
    description?: InputMaybe<Scalars['String']['input']>;
    entry: Scalars['ID']['input'];
    paymentMethod: UpsertPaymentMethod;
    reconciled?: InputMaybe<Scalars['Boolean']['input']>;
    total: Scalars['Rational']['input'];
};
export declare type NewPerson = {
    email?: InputMaybe<Scalars['String']['input']>;
    name: PersonNameInput;
    phone?: InputMaybe<Scalars['String']['input']>;
};
export declare type NodeInput = {
    id: Scalars['ID']['input'];
    type: Scalars['String']['input'];
};
export declare type PaymentCard = PaymentCardInterface & {
    __typename?: 'PaymentCard';
    trailingDigits: Scalars['String']['output'];
    type: PaymentCardType;
};
export declare type PaymentCardInput = {
    trailingDigits: Scalars['String']['input'];
    type: PaymentCardType;
};
export declare type PaymentCardInterface = {
    trailingDigits: Scalars['String']['output'];
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
    checkNumber: Scalars['String']['output'];
};
export declare type PaymentCheckInput = {
    checkNumber: Scalars['String']['input'];
};
export declare type PaymentCheckInterface = {
    checkNumber: Scalars['String']['output'];
};
export declare type PaymentMethodAccountCardInput = {
    /** id from AccountCard */
    card: Scalars['ID']['input'];
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
    email?: Maybe<Scalars['String']['output']>;
    id: Scalars['ID']['output'];
    name: PersonName;
    phone?: Maybe<Scalars['String']['output']>;
};
export declare type PersonName = {
    __typename?: 'PersonName';
    first: Scalars['String']['output'];
    last: Scalars['String']['output'];
};
export declare type PersonNameInput = {
    first: Scalars['String']['input'];
    last: Scalars['String']['input'];
};
export declare type Query = {
    __typename?: 'Query';
    account: AccountChecking | AccountCreditCard;
    accountCard: AccountCard;
    accountCards: Array<AccountCard>;
    accounts: Array<AccountChecking | AccountCreditCard>;
    attachment?: Maybe<Attachment>;
    attachments: Array<Attachment>;
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
    id: Scalars['ID']['input'];
};
export declare type QueryAccountCardArgs = {
    id: Scalars['ID']['input'];
};
export declare type QueryAccountCardsArgs = {
    where?: InputMaybe<AccountCardsWhere>;
};
export declare type QueryAccountsArgs = {
    where?: InputMaybe<AccountsWhere>;
};
export declare type QueryAttachmentArgs = {
    id: Scalars['ID']['input'];
};
export declare type QueryAttachmentsArgs = {
    where?: InputMaybe<AttachmentsWhere>;
};
export declare type QueryBudgetArgs = {
    id: Scalars['ID']['input'];
};
export declare type QueryBudgetsArgs = {
    where?: InputMaybe<BudgetsWhere>;
};
export declare type QueryBusinessArgs = {
    id: Scalars['ID']['input'];
};
export declare type QueryBusinessesArgs = {
    where?: InputMaybe<BusinessesWhere>;
};
export declare type QueryCategoriesArgs = {
    where?: InputMaybe<CategoriesWhere>;
};
export declare type QueryCategoryArgs = {
    id: Scalars['ID']['input'];
};
export declare type QueryDepartmentArgs = {
    id: Scalars['ID']['input'];
};
export declare type QueryDepartmentsArgs = {
    where?: InputMaybe<DepartmentsWhere>;
};
export declare type QueryEntitiesArgs = {
    where: EntitiesWhere;
};
export declare type QueryEntriesArgs = {
    filterRefunds?: InputMaybe<Scalars['Boolean']['input']>;
    where?: InputMaybe<EntriesWhere>;
};
export declare type QueryEntryArgs = {
    id: Scalars['ID']['input'];
};
export declare type QueryEntryItemArgs = {
    id: Scalars['ID']['input'];
};
export declare type QueryEntryRefundArgs = {
    id: Scalars['ID']['input'];
};
export declare type QueryEntryRefundsArgs = {
    entriesWhere?: InputMaybe<EntriesWhere>;
    where?: InputMaybe<EntryRefundsWhere>;
};
export declare type QueryFiscalYearArgs = {
    id: Scalars['ID']['input'];
};
export declare type QueryFiscalYearsArgs = {
    where?: InputMaybe<FiscalYearsWhere>;
};
export declare type QueryPeopleArgs = {
    where?: InputMaybe<PeopleWhere>;
};
export declare type QueryPersonArgs = {
    id: Scalars['ID']['input'];
};
export declare type QuerySourcesArgs = {
    searchByName: Scalars['String']['input'];
};
export declare type ReconcileEntries = {
    entries?: InputMaybe<Array<InputMaybe<Scalars['ID']['input']>>>;
    refunds?: InputMaybe<Array<InputMaybe<Scalars['ID']['input']>>>;
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
export declare type UpdateAccountCardInput = {
    active?: InputMaybe<Scalars['Boolean']['input']>;
    trailingDigits?: InputMaybe<Scalars['String']['input']>;
    type?: InputMaybe<PaymentCardType>;
};
/** Requirers at least ONE optional field. */
export declare type UpdateEntry = {
    category?: InputMaybe<Scalars['ID']['input']>;
    date?: InputMaybe<Scalars['Date']['input']>;
    dateOfRecord?: InputMaybe<UpdateEntryDateOfRecord>;
    department?: InputMaybe<Scalars['ID']['input']>;
    description?: InputMaybe<Scalars['String']['input']>;
    id: Scalars['ID']['input'];
    paymentMethod?: InputMaybe<UpsertPaymentMethod>;
    reconciled?: InputMaybe<Scalars['Boolean']['input']>;
    source?: InputMaybe<UpsertEntrySource>;
    total?: InputMaybe<Scalars['Rational']['input']>;
};
/** `UpdateEntry.dateOfRecord` input.  Fields "date" and "overrideFiscalYear" are mutually exclusive to field "clear".  Requires at least ONE optional field. */
export declare type UpdateEntryDateOfRecord = {
    clear?: InputMaybe<Scalars['Boolean']['input']>;
    date?: InputMaybe<Scalars['Date']['input']>;
    overrideFiscalYear?: InputMaybe<Scalars['Boolean']['input']>;
};
export declare type UpdateEntryPayload = {
    __typename?: 'UpdateEntryPayload';
    updatedEntry: Entry;
};
export declare type UpdateEntryRefund = {
    date?: InputMaybe<Scalars['Date']['input']>;
    dateOfRecord?: InputMaybe<UpdateEntryDateOfRecord>;
    description?: InputMaybe<Scalars['String']['input']>;
    id: Scalars['ID']['input'];
    paymentMethod?: InputMaybe<UpsertPaymentMethod>;
    reconciled?: InputMaybe<Scalars['Boolean']['input']>;
    total?: InputMaybe<Scalars['Rational']['input']>;
};
export declare type UpdateEntryRefundPayload = {
    __typename?: 'UpdateEntryRefundPayload';
    updatedEntryRefund: EntryRefund;
};
export declare type UploadReceiptPayload = {
    __typename?: 'UploadReceiptPayload';
    attachment: Attachment;
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
    id: Scalars['ID']['output'];
    user: Person;
};
export declare type Vendor = {
    __typename?: 'Vendor';
    approved: Scalars['Boolean']['output'];
    vendorId?: Maybe<Scalars['ID']['output']>;
};
export declare type WhereDate = {
    eq?: InputMaybe<Scalars['Date']['input']>;
    gt?: InputMaybe<Scalars['Date']['input']>;
    gte?: InputMaybe<Scalars['Date']['input']>;
    lt?: InputMaybe<Scalars['Date']['input']>;
    lte?: InputMaybe<Scalars['Date']['input']>;
    ne?: InputMaybe<Scalars['Date']['input']>;
};
export declare type WhereId = {
    eq?: InputMaybe<Scalars['ID']['input']>;
    in?: InputMaybe<Array<Scalars['ID']['input']>>;
    ne?: InputMaybe<Scalars['ID']['input']>;
    nin?: InputMaybe<Array<Scalars['ID']['input']>>;
};
export declare type WhereInt = {
    eq?: InputMaybe<Scalars['Int']['input']>;
    gt?: InputMaybe<Scalars['Int']['input']>;
    gte?: InputMaybe<Scalars['Int']['input']>;
    lt?: InputMaybe<Scalars['Int']['input']>;
    lte?: InputMaybe<Scalars['Int']['input']>;
    ne?: InputMaybe<Scalars['Int']['input']>;
};
export declare type WhereNode = {
    eq?: InputMaybe<NodeInput>;
    in?: InputMaybe<Array<NodeInput>>;
    ne?: InputMaybe<NodeInput>;
    nin?: InputMaybe<Array<NodeInput>>;
};
export declare type WhereRational = {
    eq?: InputMaybe<Scalars['Rational']['input']>;
    gt?: InputMaybe<Scalars['Rational']['input']>;
    gte?: InputMaybe<Scalars['Rational']['input']>;
    in?: InputMaybe<Array<Scalars['Rational']['input']>>;
    lt?: InputMaybe<Scalars['Rational']['input']>;
    lte?: InputMaybe<Scalars['Rational']['input']>;
    ne?: InputMaybe<Scalars['Rational']['input']>;
    nin?: InputMaybe<Array<Scalars['Rational']['input']>>;
};
export declare type WhereRegex = {
    flags?: InputMaybe<Array<RegexFlags>>;
    /**
     * "pattern" argument of the javascript RegExp constructor.
     * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/RegExp/RegExp#parameters
     */
    pattern: Scalars['String']['input'];
};
export declare type WhereTreeId = {
    eq?: InputMaybe<Scalars['ID']['input']>;
    /** Range operators will match descendants and ancestors in the tree. */
    gt?: InputMaybe<Scalars['ID']['input']>;
    gte?: InputMaybe<Scalars['ID']['input']>;
    in?: InputMaybe<Array<Scalars['ID']['input']>>;
    lt?: InputMaybe<Scalars['ID']['input']>;
    lte?: InputMaybe<Scalars['ID']['input']>;
    ne?: InputMaybe<Scalars['ID']['input']>;
    nin?: InputMaybe<Array<Scalars['ID']['input']>>;
};
export declare type ResolverTypeWrapper<T> = Promise<T> | T;
export declare type ResolverWithResolve<TResult, TParent, TContext, TArgs> = {
    resolve: ResolverFn<TResult, TParent, TContext, TArgs>;
};
export declare type Resolver<TResult, TParent = Record<PropertyKey, never>, TContext = Record<PropertyKey, never>, TArgs = Record<PropertyKey, never>> = ResolverFn<TResult, TParent, TContext, TArgs> | ResolverWithResolve<TResult, TParent, TContext, TArgs>;
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
export declare type SubscriptionResolver<TResult, TKey extends string, TParent = Record<PropertyKey, never>, TContext = Record<PropertyKey, never>, TArgs = Record<PropertyKey, never>> = ((...args: any[]) => SubscriptionObject<TResult, TKey, TParent, TContext, TArgs>) | SubscriptionObject<TResult, TKey, TParent, TContext, TArgs>;
export declare type TypeResolveFn<TTypes, TParent = Record<PropertyKey, never>, TContext = Record<PropertyKey, never>> = (parent: TParent, context: TContext, info: GraphQLResolveInfo) => Maybe<TTypes> | Promise<Maybe<TTypes>>;
export declare type IsTypeOfResolverFn<T = Record<PropertyKey, never>, TContext = Record<PropertyKey, never>> = (obj: T, context: TContext, info: GraphQLResolveInfo) => boolean | Promise<boolean>;
export declare type NextResolverFn<T> = () => Promise<T>;
export declare type DirectiveResolverFn<TResult = Record<PropertyKey, never>, TParent = Record<PropertyKey, never>, TContext = Record<PropertyKey, never>, TArgs = Record<PropertyKey, never>> = (next: NextResolverFn<TResult>, parent: TParent, args: TArgs, context: TContext, info: GraphQLResolveInfo) => TResult | Promise<TResult>;
/** Mapping of union types */
export declare type ResolversUnionTypes<_RefType extends Record<string, unknown>> = {
    BudgetOwner: (BusinessDbRecord) | (DepartmentDbRecord);
    DepartmentAncestor: (BusinessDbRecord) | (DepartmentDbRecord);
    Entity: (BusinessDbRecord) | (DepartmentDbRecord) | (PersonDbRecord);
    Source: (BusinessDbRecord) | (DepartmentDbRecord) | (PersonDbRecord);
};
/** Mapping of interface types */
export declare type ResolversInterfaceTypes<_RefType extends Record<string, unknown>> = {
    AccountInterface: (AccountDbRecord) | (Omit<AccountCreditCard, 'cards' | 'owner'> & {
        cards: Array<_RefType['AccountCard']>;
        owner: _RefType['Entity'];
    });
    AccountWithCardsInterface: (AccountDbRecord) | (Omit<AccountCreditCard, 'cards' | 'owner'> & {
        cards: Array<_RefType['AccountCard']>;
        owner: _RefType['Entity'];
    });
    Aliasable: (PaymentCardDbRecord);
    PaymentCardInterface: (PaymentCardDbRecord) | (PaymentCard);
    PaymentCheckInterface: (Omit<AccountCheck, 'account'> & {
        account: _RefType['AccountChecking'];
    }) | (PaymentCheck);
    PaymentMethodInterface: (Omit<PaymentMethodCard, 'card'> & {
        card: _RefType['PaymentCardInterface'];
    }) | (PaymentMethodCash) | (Omit<PaymentMethodCheck, 'check'> & {
        check: _RefType['PaymentCheckInterface'];
    }) | (PaymentMethodCombination) | (PaymentMethodOnline) | (PaymentMethodUnknown);
};
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
    Alias: ResolverTypeWrapper<AliasTypeDbRecord>;
    Aliasable: ResolverTypeWrapper<ResolversInterfaceTypes<ResolversTypes>['Aliasable']>;
    AliasesWhere: AliasesWhere;
    Attachment: ResolverTypeWrapper<Attachment>;
    AttachmentsWhere: AttachmentsWhere;
    Boolean: ResolverTypeWrapper<Scalars['Boolean']['output']>;
    Budget: ResolverTypeWrapper<BudgetDbRecord>;
    BudgetOwner: ResolverTypeWrapper<ResolversUnionTypes<ResolversTypes>['BudgetOwner']>;
    BudgetsWhere: BudgetsWhere;
    Business: ResolverTypeWrapper<BusinessDbRecord>;
    BusinessesWhere: BusinessesWhere;
    CategoriesWhere: CategoriesWhere;
    Category: ResolverTypeWrapper<CategoryDbRecord>;
    CreateAccountCardInput: CreateAccountCardInput;
    Currency: Currency;
    Date: ResolverTypeWrapper<Scalars['Date']['output']>;
    DeleteAttachmentPayload: ResolverTypeWrapper<Omit<DeleteAttachmentPayload, 'deletedAttachment'> & {
        deletedAttachment: ResolversTypes['Attachment'];
    }>;
    DeleteEntryPayload: ResolverTypeWrapper<Omit<DeleteEntryPayload, 'deletedEntry'> & {
        deletedEntry: ResolversTypes['Entry'];
    }>;
    DeleteEntryRefundPayload: ResolverTypeWrapper<Omit<DeleteEntryRefundPayload, 'deletedEntryRefund'> & {
        deletedEntryRefund: ResolversTypes['EntryRefund'];
    }>;
    Department: ResolverTypeWrapper<DepartmentDbRecord>;
    DepartmentAncestor: ResolverTypeWrapper<ResolversUnionTypes<ResolversTypes>['DepartmentAncestor']>;
    DepartmentsWhere: DepartmentsWhere;
    EditHistoryEntry: ResolverTypeWrapper<EditHistoryEntry>;
    EntitiesWhere: EntitiesWhere;
    Entity: ResolverTypeWrapper<ResolversUnionTypes<ResolversTypes>['Entity']>;
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
    ID: ResolverTypeWrapper<Scalars['ID']['output']>;
    Int: ResolverTypeWrapper<Scalars['Int']['output']>;
    JSON: ResolverTypeWrapper<Scalars['JSON']['output']>;
    Mutation: ResolverTypeWrapper<Record<PropertyKey, never>>;
    NewAlias: NewAlias;
    NewBusiness: NewBusiness;
    NewEntry: NewEntry;
    NewEntryDateOfRecord: NewEntryDateOfRecord;
    NewEntryRefund: ResolverTypeWrapper<EntryRefundDbRecord>;
    NewPerson: NewPerson;
    NodeInput: NodeInput;
    PaymentCard: ResolverTypeWrapper<PaymentCard>;
    PaymentCardInput: PaymentCardInput;
    PaymentCardInterface: ResolverTypeWrapper<ResolversInterfaceTypes<ResolversTypes>['PaymentCardInterface']>;
    PaymentCardType: PaymentCardType;
    PaymentCheck: ResolverTypeWrapper<PaymentCheck>;
    PaymentCheckInput: PaymentCheckInput;
    PaymentCheckInterface: ResolverTypeWrapper<ResolversInterfaceTypes<ResolversTypes>['PaymentCheckInterface']>;
    PaymentMethodAccountCardInput: PaymentMethodAccountCardInput;
    PaymentMethodAccountCheckInput: PaymentMethodAccountCheckInput;
    PaymentMethodCard: ResolverTypeWrapper<Omit<PaymentMethodCard, 'card'> & {
        card: ResolversTypes['PaymentCardInterface'];
    }>;
    PaymentMethodCardInput: PaymentMethodCardInput;
    PaymentMethodCash: ResolverTypeWrapper<PaymentMethodCash>;
    PaymentMethodCashInput: PaymentMethodCashInput;
    PaymentMethodCheck: ResolverTypeWrapper<Omit<PaymentMethodCheck, 'check'> & {
        check: ResolversTypes['PaymentCheckInterface'];
    }>;
    PaymentMethodCheckInput: PaymentMethodCheckInput;
    PaymentMethodCombination: ResolverTypeWrapper<PaymentMethodCombination>;
    PaymentMethodCombinationInput: PaymentMethodCombinationInput;
    PaymentMethodInterface: ResolverTypeWrapper<ResolversInterfaceTypes<ResolversTypes>['PaymentMethodInterface']>;
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
    Query: ResolverTypeWrapper<Record<PropertyKey, never>>;
    Rational: ResolverTypeWrapper<Scalars['Rational']['output']>;
    ReconcileEntries: ReconcileEntries;
    ReconcileEntriesPayload: ResolverTypeWrapper<Omit<ReconcileEntriesPayload, 'reconciledEntries' | 'reconciledRefunds'> & {
        reconciledEntries: Array<ResolversTypes['Entry']>;
        reconciledRefunds: Array<ResolversTypes['EntryRefund']>;
    }>;
    RegexFlags: RegexFlags;
    Source: ResolverTypeWrapper<ResolversUnionTypes<ResolversTypes>['Source']>;
    String: ResolverTypeWrapper<Scalars['String']['output']>;
    Subscription: ResolverTypeWrapper<Record<PropertyKey, never>>;
    UpdateAccountCardInput: UpdateAccountCardInput;
    UpdateEntry: UpdateEntry;
    UpdateEntryDateOfRecord: UpdateEntryDateOfRecord;
    UpdateEntryPayload: ResolverTypeWrapper<Omit<UpdateEntryPayload, 'updatedEntry'> & {
        updatedEntry: ResolversTypes['Entry'];
    }>;
    UpdateEntryRefund: UpdateEntryRefund;
    UpdateEntryRefundPayload: ResolverTypeWrapper<Omit<UpdateEntryRefundPayload, 'updatedEntryRefund'> & {
        updatedEntryRefund: ResolversTypes['EntryRefund'];
    }>;
    Upload: ResolverTypeWrapper<Scalars['Upload']['output']>;
    UploadReceiptPayload: ResolverTypeWrapper<Omit<UploadReceiptPayload, 'attachment'> & {
        attachment: ResolversTypes['Attachment'];
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
    Alias: AliasTypeDbRecord;
    Aliasable: ResolversInterfaceTypes<ResolversParentTypes>['Aliasable'];
    AliasesWhere: AliasesWhere;
    Attachment: Attachment;
    AttachmentsWhere: AttachmentsWhere;
    Boolean: Scalars['Boolean']['output'];
    Budget: BudgetDbRecord;
    BudgetOwner: ResolversUnionTypes<ResolversParentTypes>['BudgetOwner'];
    BudgetsWhere: BudgetsWhere;
    Business: BusinessDbRecord;
    BusinessesWhere: BusinessesWhere;
    CategoriesWhere: CategoriesWhere;
    Category: CategoryDbRecord;
    CreateAccountCardInput: CreateAccountCardInput;
    Date: Scalars['Date']['output'];
    DeleteAttachmentPayload: Omit<DeleteAttachmentPayload, 'deletedAttachment'> & {
        deletedAttachment: ResolversParentTypes['Attachment'];
    };
    DeleteEntryPayload: Omit<DeleteEntryPayload, 'deletedEntry'> & {
        deletedEntry: ResolversParentTypes['Entry'];
    };
    DeleteEntryRefundPayload: Omit<DeleteEntryRefundPayload, 'deletedEntryRefund'> & {
        deletedEntryRefund: ResolversParentTypes['EntryRefund'];
    };
    Department: DepartmentDbRecord;
    DepartmentAncestor: ResolversUnionTypes<ResolversParentTypes>['DepartmentAncestor'];
    DepartmentsWhere: DepartmentsWhere;
    EditHistoryEntry: EditHistoryEntry;
    EntitiesWhere: EntitiesWhere;
    Entity: ResolversUnionTypes<ResolversParentTypes>['Entity'];
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
    ID: Scalars['ID']['output'];
    Int: Scalars['Int']['output'];
    JSON: Scalars['JSON']['output'];
    Mutation: Record<PropertyKey, never>;
    NewAlias: NewAlias;
    NewBusiness: NewBusiness;
    NewEntry: NewEntry;
    NewEntryDateOfRecord: NewEntryDateOfRecord;
    NewEntryRefund: EntryRefundDbRecord;
    NewPerson: NewPerson;
    NodeInput: NodeInput;
    PaymentCard: PaymentCard;
    PaymentCardInput: PaymentCardInput;
    PaymentCardInterface: ResolversInterfaceTypes<ResolversParentTypes>['PaymentCardInterface'];
    PaymentCheck: PaymentCheck;
    PaymentCheckInput: PaymentCheckInput;
    PaymentCheckInterface: ResolversInterfaceTypes<ResolversParentTypes>['PaymentCheckInterface'];
    PaymentMethodAccountCardInput: PaymentMethodAccountCardInput;
    PaymentMethodAccountCheckInput: PaymentMethodAccountCheckInput;
    PaymentMethodCard: Omit<PaymentMethodCard, 'card'> & {
        card: ResolversParentTypes['PaymentCardInterface'];
    };
    PaymentMethodCardInput: PaymentMethodCardInput;
    PaymentMethodCash: PaymentMethodCash;
    PaymentMethodCashInput: PaymentMethodCashInput;
    PaymentMethodCheck: Omit<PaymentMethodCheck, 'check'> & {
        check: ResolversParentTypes['PaymentCheckInterface'];
    };
    PaymentMethodCheckInput: PaymentMethodCheckInput;
    PaymentMethodCombination: PaymentMethodCombination;
    PaymentMethodCombinationInput: PaymentMethodCombinationInput;
    PaymentMethodInterface: ResolversInterfaceTypes<ResolversParentTypes>['PaymentMethodInterface'];
    PaymentMethodOnline: PaymentMethodOnline;
    PaymentMethodOnlineInput: PaymentMethodOnlineInput;
    PaymentMethodUnknown: PaymentMethodUnknown;
    PaymentMethodUnknownInput: PaymentMethodUnknownInput;
    PeopleNameWhere: PeopleNameWhere;
    PeopleWhere: PeopleWhere;
    Person: PersonDbRecord;
    PersonName: PersonName;
    PersonNameInput: PersonNameInput;
    Query: Record<PropertyKey, never>;
    Rational: Scalars['Rational']['output'];
    ReconcileEntries: ReconcileEntries;
    ReconcileEntriesPayload: Omit<ReconcileEntriesPayload, 'reconciledEntries' | 'reconciledRefunds'> & {
        reconciledEntries: Array<ResolversParentTypes['Entry']>;
        reconciledRefunds: Array<ResolversParentTypes['EntryRefund']>;
    };
    Source: ResolversUnionTypes<ResolversParentTypes>['Source'];
    String: Scalars['String']['output'];
    Subscription: Record<PropertyKey, never>;
    UpdateAccountCardInput: UpdateAccountCardInput;
    UpdateEntry: UpdateEntry;
    UpdateEntryDateOfRecord: UpdateEntryDateOfRecord;
    UpdateEntryPayload: Omit<UpdateEntryPayload, 'updatedEntry'> & {
        updatedEntry: ResolversParentTypes['Entry'];
    };
    UpdateEntryRefund: UpdateEntryRefund;
    UpdateEntryRefundPayload: Omit<UpdateEntryRefundPayload, 'updatedEntryRefund'> & {
        updatedEntryRefund: ResolversParentTypes['EntryRefund'];
    };
    Upload: Scalars['Upload']['output'];
    UploadReceiptPayload: Omit<UploadReceiptPayload, 'attachment'> & {
        attachment: ResolversParentTypes['Attachment'];
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
    aliases?: Resolver<Array<ResolversTypes['Alias']>, ParentType, ContextType, Partial<AccountCardAliasesArgs>>;
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
};
export declare type AccountWithCardsInterfaceResolvers<ContextType = Context, ParentType = ResolversParentTypes['AccountWithCardsInterface']> = {
    __resolveType?: TypeResolveFn<'AccountChecking' | 'AccountCreditCard', ParentType, ContextType>;
};
export declare type AddNewEntryPayloadResolvers<ContextType = Context, ParentType = ResolversParentTypes['AddNewEntryPayload']> = {
    newEntry?: Resolver<ResolversTypes['Entry'], ParentType, ContextType>;
};
export declare type AddNewEntryRefundPayloadResolvers<ContextType = Context, ParentType = ResolversParentTypes['AddNewEntryRefundPayload']> = {
    newEntryRefund?: Resolver<ResolversTypes['EntryRefund'], ParentType, ContextType>;
};
export declare type AddNewPersonPayloadResolvers<ContextType = Context, ParentType = ResolversParentTypes['AddNewPersonPayload']> = {
    newPerson?: Resolver<ResolversTypes['Person'], ParentType, ContextType>;
};
export declare type AliasResolvers<ContextType = Context, ParentType = ResolversParentTypes['Alias']> = {
    id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
    name?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
};
export declare type AliasableResolvers<ContextType = Context, ParentType = ResolversParentTypes['Aliasable']> = {
    __resolveType?: TypeResolveFn<'AccountCard', ParentType, ContextType>;
};
export declare type AttachmentResolvers<ContextType = Context, ParentType = ResolversParentTypes['Attachment']> = {
    deleted?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
    fileSize?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
    filename?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
    gcsBucket?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
    gcsPath?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
    gcsUrl?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
    id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
    mimeType?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
    thumbnailUrl?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
    uploadedAt?: Resolver<ResolversTypes['Date'], ParentType, ContextType>;
    uploadedBy?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
};
export declare type BudgetResolvers<ContextType = Context, ParentType = ResolversParentTypes['Budget']> = {
    amount?: Resolver<ResolversTypes['Rational'], ParentType, ContextType>;
    fiscalYear?: Resolver<ResolversTypes['FiscalYear'], ParentType, ContextType>;
    id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
    owner?: Resolver<ResolversTypes['BudgetOwner'], ParentType, ContextType>;
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
};
export interface DateScalarConfig extends GraphQLScalarTypeConfig<ResolversTypes['Date'], any> {
    name: 'Date';
}
export declare type DeleteAttachmentPayloadResolvers<ContextType = Context, ParentType = ResolversParentTypes['DeleteAttachmentPayload']> = {
    deletedAttachment?: Resolver<ResolversTypes['Attachment'], ParentType, ContextType>;
};
export declare type DeleteEntryPayloadResolvers<ContextType = Context, ParentType = ResolversParentTypes['DeleteEntryPayload']> = {
    deletedEntry?: Resolver<ResolversTypes['Entry'], ParentType, ContextType>;
};
export declare type DeleteEntryRefundPayloadResolvers<ContextType = Context, ParentType = ResolversParentTypes['DeleteEntryRefundPayload']> = {
    deletedEntryRefund?: Resolver<ResolversTypes['EntryRefund'], ParentType, ContextType>;
};
export declare type DepartmentResolvers<ContextType = Context, ParentType = ResolversParentTypes['Department']> = {
    aliases?: Resolver<Array<ResolversTypes['Alias']>, ParentType, ContextType>;
    ancestors?: Resolver<Array<ResolversTypes['DepartmentAncestor']>, ParentType, ContextType, Partial<DepartmentAncestorsArgs>>;
    budgets?: Resolver<Array<ResolversTypes['Budget']>, ParentType, ContextType>;
    business?: Resolver<ResolversTypes['Business'], ParentType, ContextType>;
    children?: Resolver<Array<ResolversTypes['Department']>, ParentType, ContextType>;
    code?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
    descendants?: Resolver<Array<ResolversTypes['Department']>, ParentType, ContextType>;
    disable?: Resolver<Array<ResolversTypes['FiscalYear']>, ParentType, ContextType>;
    id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
    name?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
    parent?: Resolver<Maybe<ResolversTypes['DepartmentAncestor']>, ParentType, ContextType>;
    virtualRoot?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
    __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};
export declare type DepartmentAncestorResolvers<ContextType = Context, ParentType = ResolversParentTypes['DepartmentAncestor']> = {
    __resolveType?: TypeResolveFn<'Business' | 'Department', ParentType, ContextType>;
};
export declare type EditHistoryEntryResolvers<ContextType = Context, ParentType = ResolversParentTypes['EditHistoryEntry']> = {
    changes?: Resolver<ResolversTypes['JSON'], ParentType, ContextType>;
    editedAt?: Resolver<ResolversTypes['Date'], ParentType, ContextType>;
    editedBy?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
    id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
};
export declare type EntityResolvers<ContextType = Context, ParentType = ResolversParentTypes['Entity']> = {
    __resolveType?: TypeResolveFn<'Business' | 'Department' | 'Person', ParentType, ContextType>;
};
export declare type EntryResolvers<ContextType = Context, ParentType = ResolversParentTypes['Entry']> = {
    attachments?: Resolver<Array<ResolversTypes['Attachment']>, ParentType, ContextType>;
    category?: Resolver<ResolversTypes['Category'], ParentType, ContextType>;
    date?: Resolver<ResolversTypes['Date'], ParentType, ContextType>;
    dateOfRecord?: Resolver<Maybe<ResolversTypes['EntryDateOfRecord']>, ParentType, ContextType>;
    deleted?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
    department?: Resolver<ResolversTypes['Department'], ParentType, ContextType>;
    description?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
    editHistory?: Resolver<Array<ResolversTypes['EditHistoryEntry']>, ParentType, ContextType>;
    fiscalYear?: Resolver<ResolversTypes['FiscalYear'], ParentType, ContextType>;
    id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
    items?: Resolver<Array<ResolversTypes['EntryItem']>, ParentType, ContextType>;
    lastEditedAt?: Resolver<Maybe<ResolversTypes['Date']>, ParentType, ContextType>;
    lastEditedBy?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
    lastUpdate?: Resolver<ResolversTypes['Date'], ParentType, ContextType>;
    paymentMethod?: Resolver<ResolversTypes['PaymentMethodInterface'], ParentType, ContextType>;
    reconciled?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
    refunds?: Resolver<Array<ResolversTypes['EntryRefund']>, ParentType, ContextType>;
    source?: Resolver<ResolversTypes['Entity'], ParentType, ContextType>;
    total?: Resolver<ResolversTypes['Rational'], ParentType, ContextType>;
};
export declare type EntryDateOfRecordResolvers<ContextType = Context, ParentType = ResolversParentTypes['EntryDateOfRecord']> = {
    date?: Resolver<ResolversTypes['Date'], ParentType, ContextType>;
    overrideFiscalYear?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
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
};
export declare type FiscalYearResolvers<ContextType = Context, ParentType = ResolversParentTypes['FiscalYear']> = {
    begin?: Resolver<ResolversTypes['Date'], ParentType, ContextType>;
    end?: Resolver<ResolversTypes['Date'], ParentType, ContextType>;
    id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
    name?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
};
export interface JsonScalarConfig extends GraphQLScalarTypeConfig<ResolversTypes['JSON'], any> {
    name: 'JSON';
}
export declare type MutationResolvers<ContextType = Context, ParentType = ResolversParentTypes['Mutation']> = {
    addNewBusiness?: Resolver<ResolversTypes['Business'], ParentType, ContextType, RequireFields<MutationAddNewBusinessArgs, 'input'>>;
    addNewEntry?: Resolver<ResolversTypes['AddNewEntryPayload'], ParentType, ContextType, RequireFields<MutationAddNewEntryArgs, 'input'>>;
    addNewEntryRefund?: Resolver<ResolversTypes['AddNewEntryRefundPayload'], ParentType, ContextType, RequireFields<MutationAddNewEntryRefundArgs, 'input'>>;
    addNewPerson?: Resolver<ResolversTypes['AddNewPersonPayload'], ParentType, ContextType, RequireFields<MutationAddNewPersonArgs, 'input'>>;
    createAccountCard?: Resolver<ResolversTypes['AccountCard'], ParentType, ContextType, RequireFields<MutationCreateAccountCardArgs, 'input'>>;
    deleteAccountCard?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType, RequireFields<MutationDeleteAccountCardArgs, 'id'>>;
    deleteAttachment?: Resolver<ResolversTypes['DeleteAttachmentPayload'], ParentType, ContextType, RequireFields<MutationDeleteAttachmentArgs, 'id'>>;
    deleteEntry?: Resolver<ResolversTypes['DeleteEntryPayload'], ParentType, ContextType, RequireFields<MutationDeleteEntryArgs, 'id'>>;
    deleteEntryRefund?: Resolver<ResolversTypes['DeleteEntryRefundPayload'], ParentType, ContextType, RequireFields<MutationDeleteEntryRefundArgs, 'id'>>;
    reconcileEntries?: Resolver<ResolversTypes['ReconcileEntriesPayload'], ParentType, ContextType, Partial<MutationReconcileEntriesArgs>>;
    updateAccountCard?: Resolver<ResolversTypes['AccountCard'], ParentType, ContextType, RequireFields<MutationUpdateAccountCardArgs, 'id' | 'input'>>;
    updateEntry?: Resolver<ResolversTypes['UpdateEntryPayload'], ParentType, ContextType, RequireFields<MutationUpdateEntryArgs, 'input'>>;
    updateEntryRefund?: Resolver<ResolversTypes['UpdateEntryRefundPayload'], ParentType, ContextType, RequireFields<MutationUpdateEntryRefundArgs, 'input'>>;
    uploadReceipt?: Resolver<ResolversTypes['UploadReceiptPayload'], ParentType, ContextType, RequireFields<MutationUploadReceiptArgs, 'entryId' | 'file'>>;
};
export declare type PaymentCardResolvers<ContextType = Context, ParentType = ResolversParentTypes['PaymentCard']> = {
    trailingDigits?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
    type?: Resolver<ResolversTypes['PaymentCardType'], ParentType, ContextType>;
    __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};
export declare type PaymentCardInterfaceResolvers<ContextType = Context, ParentType = ResolversParentTypes['PaymentCardInterface']> = {
    __resolveType?: TypeResolveFn<'AccountCard' | 'PaymentCard', ParentType, ContextType>;
};
export declare type PaymentCheckResolvers<ContextType = Context, ParentType = ResolversParentTypes['PaymentCheck']> = {
    checkNumber?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
    __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};
export declare type PaymentCheckInterfaceResolvers<ContextType = Context, ParentType = ResolversParentTypes['PaymentCheckInterface']> = {
    __resolveType?: TypeResolveFn<'AccountCheck' | 'PaymentCheck', ParentType, ContextType>;
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
    email?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
    id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
    name?: Resolver<ResolversTypes['PersonName'], ParentType, ContextType>;
    phone?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
    __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};
export declare type PersonNameResolvers<ContextType = Context, ParentType = ResolversParentTypes['PersonName']> = {
    first?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
    last?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
};
export declare type QueryResolvers<ContextType = Context, ParentType = ResolversParentTypes['Query']> = {
    account?: Resolver<ResolversTypes['AccountInterface'], ParentType, ContextType, RequireFields<QueryAccountArgs, 'id'>>;
    accountCard?: Resolver<ResolversTypes['AccountCard'], ParentType, ContextType, RequireFields<QueryAccountCardArgs, 'id'>>;
    accountCards?: Resolver<Array<ResolversTypes['AccountCard']>, ParentType, ContextType, Partial<QueryAccountCardsArgs>>;
    accounts?: Resolver<Array<ResolversTypes['AccountInterface']>, ParentType, ContextType, Partial<QueryAccountsArgs>>;
    attachment?: Resolver<Maybe<ResolversTypes['Attachment']>, ParentType, ContextType, RequireFields<QueryAttachmentArgs, 'id'>>;
    attachments?: Resolver<Array<ResolversTypes['Attachment']>, ParentType, ContextType, Partial<QueryAttachmentsArgs>>;
    budget?: Resolver<ResolversTypes['Budget'], ParentType, ContextType, RequireFields<QueryBudgetArgs, 'id'>>;
    budgets?: Resolver<Array<ResolversTypes['Budget']>, ParentType, ContextType, Partial<QueryBudgetsArgs>>;
    business?: Resolver<ResolversTypes['Business'], ParentType, ContextType, RequireFields<QueryBusinessArgs, 'id'>>;
    businesses?: Resolver<Array<ResolversTypes['Business']>, ParentType, ContextType, Partial<QueryBusinessesArgs>>;
    categories?: Resolver<Array<ResolversTypes['Category']>, ParentType, ContextType, Partial<QueryCategoriesArgs>>;
    category?: Resolver<ResolversTypes['Category'], ParentType, ContextType, RequireFields<QueryCategoryArgs, 'id'>>;
    department?: Resolver<ResolversTypes['Department'], ParentType, ContextType, RequireFields<QueryDepartmentArgs, 'id'>>;
    departments?: Resolver<Array<ResolversTypes['Department']>, ParentType, ContextType, Partial<QueryDepartmentsArgs>>;
    entities?: Resolver<Array<ResolversTypes['Entity']>, ParentType, ContextType, RequireFields<QueryEntitiesArgs, 'where'>>;
    entries?: Resolver<Array<ResolversTypes['Entry']>, ParentType, ContextType, RequireFields<QueryEntriesArgs, 'filterRefunds'>>;
    entry?: Resolver<Maybe<ResolversTypes['Entry']>, ParentType, ContextType, RequireFields<QueryEntryArgs, 'id'>>;
    entryItem?: Resolver<Maybe<ResolversTypes['EntryItem']>, ParentType, ContextType, RequireFields<QueryEntryItemArgs, 'id'>>;
    entryRefund?: Resolver<Maybe<ResolversTypes['EntryRefund']>, ParentType, ContextType, RequireFields<QueryEntryRefundArgs, 'id'>>;
    entryRefunds?: Resolver<Array<ResolversTypes['EntryRefund']>, ParentType, ContextType, Partial<QueryEntryRefundsArgs>>;
    fiscalYear?: Resolver<ResolversTypes['FiscalYear'], ParentType, ContextType, RequireFields<QueryFiscalYearArgs, 'id'>>;
    fiscalYears?: Resolver<Array<ResolversTypes['FiscalYear']>, ParentType, ContextType, Partial<QueryFiscalYearsArgs>>;
    people?: Resolver<Array<ResolversTypes['Person']>, ParentType, ContextType, Partial<QueryPeopleArgs>>;
    person?: Resolver<ResolversTypes['Person'], ParentType, ContextType, RequireFields<QueryPersonArgs, 'id'>>;
    sources?: Resolver<Array<ResolversTypes['Source']>, ParentType, ContextType, RequireFields<QuerySourcesArgs, 'searchByName'>>;
};
export interface RationalScalarConfig extends GraphQLScalarTypeConfig<ResolversTypes['Rational'], any> {
    name: 'Rational';
}
export declare type ReconcileEntriesPayloadResolvers<ContextType = Context, ParentType = ResolversParentTypes['ReconcileEntriesPayload']> = {
    reconciledEntries?: Resolver<Array<ResolversTypes['Entry']>, ParentType, ContextType>;
    reconciledRefunds?: Resolver<Array<ResolversTypes['EntryRefund']>, ParentType, ContextType>;
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
};
export declare type UpdateEntryRefundPayloadResolvers<ContextType = Context, ParentType = ResolversParentTypes['UpdateEntryRefundPayload']> = {
    updatedEntryRefund?: Resolver<ResolversTypes['EntryRefund'], ParentType, ContextType>;
};
export interface UploadScalarConfig extends GraphQLScalarTypeConfig<ResolversTypes['Upload'], any> {
    name: 'Upload';
}
export declare type UploadReceiptPayloadResolvers<ContextType = Context, ParentType = ResolversParentTypes['UploadReceiptPayload']> = {
    attachment?: Resolver<ResolversTypes['Attachment'], ParentType, ContextType>;
};
export declare type UserResolvers<ContextType = Context, ParentType = ResolversParentTypes['User']> = {
    id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
    user?: Resolver<ResolversTypes['Person'], ParentType, ContextType>;
};
export declare type VendorResolvers<ContextType = Context, ParentType = ResolversParentTypes['Vendor']> = {
    approved?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
    vendorId?: Resolver<Maybe<ResolversTypes['ID']>, ParentType, ContextType>;
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
    Aliasable?: AliasableResolvers<ContextType>;
    Attachment?: AttachmentResolvers<ContextType>;
    Budget?: BudgetResolvers<ContextType>;
    BudgetOwner?: BudgetOwnerResolvers<ContextType>;
    Business?: BusinessResolvers<ContextType>;
    Category?: CategoryResolvers<ContextType>;
    Date?: GraphQLScalarType;
    DeleteAttachmentPayload?: DeleteAttachmentPayloadResolvers<ContextType>;
    DeleteEntryPayload?: DeleteEntryPayloadResolvers<ContextType>;
    DeleteEntryRefundPayload?: DeleteEntryRefundPayloadResolvers<ContextType>;
    Department?: DepartmentResolvers<ContextType>;
    DepartmentAncestor?: DepartmentAncestorResolvers<ContextType>;
    EditHistoryEntry?: EditHistoryEntryResolvers<ContextType>;
    Entity?: EntityResolvers<ContextType>;
    Entry?: EntryResolvers<ContextType>;
    EntryDateOfRecord?: EntryDateOfRecordResolvers<ContextType>;
    EntryItem?: EntryItemResolvers<ContextType>;
    EntryRefund?: EntryRefundResolvers<ContextType>;
    FiscalYear?: FiscalYearResolvers<ContextType>;
    JSON?: GraphQLScalarType;
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
    Upload?: GraphQLScalarType;
    UploadReceiptPayload?: UploadReceiptPayloadResolvers<ContextType>;
    User?: UserResolvers<ContextType>;
    Vendor?: VendorResolvers<ContextType>;
};
