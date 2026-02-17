import Fraction from 'fraction.js';
import { GraphQLResolveInfo, GraphQLScalarType, GraphQLScalarTypeConfig } from 'graphql';
import { PaymentCardDbRecord, AccountDbRecord, BudgetDbRecord, BusinessDbRecord, CategoryDbRecord, DepartmentDbRecord, EntryDbRecord, EntryRefundDbRecord, EntryItemDbRecord, FiscalYearDbRecord, AliasTypeDbRecord, PersonDbRecord } from './dataSources/accountingDb/types';
import { Context } from './types';
export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type MakeEmpty<T extends { [key: string]: unknown }, K extends keyof T> = { [_ in K]?: never };
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
export type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>;
export type RequireFields<T, K extends keyof T> = Omit<T, K> & { [P in K]-?: NonNullable<T[P]> };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string; }
  String: { input: string; output: string; }
  Boolean: { input: boolean; output: boolean; }
  Int: { input: number; output: number; }
  Float: { input: number; output: number; }
  /** ISO 8601 */
  Date: { input: Date; output: Date; }
  /** The JSON scalar type represents JSON values as specified by [ECMA-404](http://www.ecma-international.org/publications/files/ECMA-ST/ECMA-404.pdf). */
  JSON: { input: any; output: any; }
  Rational: { input: Fraction; output: Fraction; }
  /**
   * The Upload scalar type represents a file upload.
   * Used with graphql-upload for handling multipart file uploads.
   */
  Upload: { input: any; output: any; }
};

export enum AccessLevel {
  Edit = 'EDIT',
  View = 'VIEW'
}

export type AccountCard = Aliasable & PaymentCardInterface & {
  __typename?: 'AccountCard';
  account: AccountChecking | AccountCreditCard;
  active: Scalars['Boolean']['output'];
  aliases: Array<Alias>;
  authorizedUsers: Array<Entity>;
  id: Scalars['ID']['output'];
  trailingDigits: Scalars['String']['output'];
  type: PaymentCardType;
};


export type AccountCardAliasesArgs = {
  where?: InputMaybe<AliasesWhere>;
};

export type AccountCardsWhere = {
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

export type AccountCheck = PaymentCheckInterface & {
  __typename?: 'AccountCheck';
  account: AccountChecking;
  checkNumber: Scalars['String']['output'];
};

export type AccountCheckInput = {
  /** id of AccountChecking */
  account: Scalars['ID']['input'];
  checkNumber: Scalars['String']['input'];
};

export type AccountChecking = AccountInterface & AccountWithCardsInterface & {
  __typename?: 'AccountChecking';
  accountNumber: Scalars['String']['output'];
  active: Scalars['Boolean']['output'];
  cards: Array<AccountCard>;
  currency: Currency;
  id: Scalars['ID']['output'];
  name: Scalars['String']['output'];
  owner: Entity;
};

export type AccountCreditCard = AccountInterface & AccountWithCardsInterface & {
  __typename?: 'AccountCreditCard';
  active: Scalars['Boolean']['output'];
  cards: Array<AccountCard>;
  currency: Currency;
  id: Scalars['ID']['output'];
  name: Scalars['String']['output'];
  owner: Entity;
};

export type AccountInterface = {
  active: Scalars['Boolean']['output'];
  currency: Currency;
  id: Scalars['ID']['output'];
  name: Scalars['String']['output'];
  owner: Entity;
};

export enum AccountType {
  Checking = 'CHECKING',
  CreditCard = 'CREDIT_CARD'
}

export type AccountWithCardsInterface = {
  active: Scalars['Boolean']['output'];
  cards: Array<AccountCard>;
  currency: Currency;
  id: Scalars['ID']['output'];
  name: Scalars['String']['output'];
  owner: Entity;
};

export type AccountsWhere = {
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
  id: Scalars['ID']['output'];
  name: Scalars['String']['output'];
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

export type ArchiveFiscalYearPayload = {
  __typename?: 'ArchiveFiscalYearPayload';
  budgetsArchived: Scalars['Int']['output'];
  entriesArchived: Scalars['Int']['output'];
  fiscalYear: FiscalYear;
};

/**
 * Attachment represents a file (receipt, document, etc.) attached to an Entry.
 * Files are stored on the filesystem (QNAP NAS mount).
 */
export type Attachment = {
  __typename?: 'Attachment';
  /** Whether this attachment has been deleted */
  deleted: Scalars['Boolean']['output'];
  /** Relative path from storage root (e.g., "2024/02/timestamp-file.pdf") */
  filePath: Scalars['String']['output'];
  /** File size in bytes */
  fileSize: Scalars['Int']['output'];
  filename: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  /** MIME type of the file (e.g., image/jpeg, application/pdf) */
  mimeType: Scalars['String']['output'];
  /** Optional thumbnail URL for image previews */
  thumbnailUrl?: Maybe<Scalars['String']['output']>;
  /** When the file was uploaded */
  uploadedAt: Scalars['Date']['output'];
  /** Email of the user who uploaded the file */
  uploadedBy: Scalars['String']['output'];
  /** Public URL for downloading the file */
  url: Scalars['String']['output'];
};

export type AttachmentsWhere = {
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

export enum AuditAction {
  EntryCreate = 'ENTRY_CREATE',
  EntryDelete = 'ENTRY_DELETE',
  EntryUpdate = 'ENTRY_UPDATE',
  FiscalYearArchive = 'FISCAL_YEAR_ARCHIVE',
  FiscalYearDelete = 'FISCAL_YEAR_DELETE',
  FiscalYearRestore = 'FISCAL_YEAR_RESTORE',
  Login = 'LOGIN',
  Logout = 'LOGOUT',
  PermissionGrant = 'PERMISSION_GRANT',
  PermissionRevoke = 'PERMISSION_REVOKE',
  ReceiptDelete = 'RECEIPT_DELETE',
  ReceiptUpload = 'RECEIPT_UPLOAD',
  Reconcile = 'RECONCILE',
  RefundCreate = 'REFUND_CREATE',
  RefundDelete = 'REFUND_DELETE',
  RefundUpdate = 'REFUND_UPDATE',
  UserDelete = 'USER_DELETE',
  UserDisable = 'USER_DISABLE',
  UserInvite = 'USER_INVITE',
  UserUpdate = 'USER_UPDATE'
}

export type AuditLogEntry = {
  __typename?: 'AuditLogEntry';
  action: AuditAction;
  details?: Maybe<Scalars['JSON']['output']>;
  id: Scalars['ID']['output'];
  ipAddress?: Maybe<Scalars['String']['output']>;
  resourceId?: Maybe<Scalars['ID']['output']>;
  resourceType?: Maybe<Scalars['String']['output']>;
  timestamp: Scalars['Date']['output'];
  user: AuthUser;
  userAgent?: Maybe<Scalars['String']['output']>;
};

export type AuditLogWhere = {
  action?: InputMaybe<AuditAction>;
  resourceId?: InputMaybe<WhereId>;
  resourceType?: InputMaybe<Scalars['String']['input']>;
  timestamp?: InputMaybe<WhereDate>;
  userId?: InputMaybe<WhereId>;
};

export type AuthPayload = {
  __typename?: 'AuthPayload';
  token: Scalars['String']['output'];
  user: AuthUser;
};

export type AuthUser = {
  __typename?: 'AuthUser';
  canInviteUsers: Scalars['Boolean']['output'];
  createdAt: Scalars['Date']['output'];
  departments: Array<UserPermission>;
  email: Scalars['String']['output'];
  googleId?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  invitedAt?: Maybe<Scalars['Date']['output']>;
  invitedBy?: Maybe<AuthUser>;
  lastLoginAt?: Maybe<Scalars['Date']['output']>;
  name: Scalars['String']['output'];
  picture?: Maybe<Scalars['String']['output']>;
  role: UserRole;
  status: UserStatus;
};

export type Budget = {
  __typename?: 'Budget';
  amount: Scalars['Rational']['output'];
  fiscalYear: FiscalYear;
  id: Scalars['ID']['output'];
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
  hidden?: Maybe<Scalars['Boolean']['output']>;
  id: Scalars['ID']['output'];
  name: Scalars['String']['output'];
  vendor?: Maybe<Vendor>;
};


export type BusinessDepartmentsArgs = {
  root?: InputMaybe<Scalars['Boolean']['input']>;
};

export type BusinessesWhere = {
  and?: InputMaybe<Array<BusinessesWhere>>;
  hidden?: InputMaybe<Scalars['Boolean']['input']>;
  id?: InputMaybe<WhereId>;
  name?: InputMaybe<WhereRegex>;
  nor?: InputMaybe<Array<BusinessesWhere>>;
  or?: InputMaybe<Array<BusinessesWhere>>;
};

export type CategoriesWhere = {
  active?: InputMaybe<Scalars['Boolean']['input']>;
  and?: InputMaybe<Array<CategoriesWhere>>;
  groupName?: InputMaybe<WhereRegex>;
  hidden?: InputMaybe<Scalars['Boolean']['input']>;
  id?: InputMaybe<WhereTreeId>;
  name?: InputMaybe<WhereRegex>;
  nor?: InputMaybe<Array<CategoriesWhere>>;
  or?: InputMaybe<Array<CategoriesWhere>>;
  parent?: InputMaybe<WhereId>;
  /** Root Categories i.e. NO parent. */
  root?: InputMaybe<Scalars['Boolean']['input']>;
  type?: InputMaybe<EntryType>;
};

export type Category = {
  __typename?: 'Category';
  accountNumber?: Maybe<Scalars['String']['output']>;
  active: Scalars['Boolean']['output'];
  aliases: Array<Alias>;
  ancestors: Array<Category>;
  children: Array<Category>;
  displayName: Scalars['String']['output'];
  groupName?: Maybe<Scalars['String']['output']>;
  hidden?: Maybe<Scalars['Boolean']['output']>;
  id: Scalars['ID']['output'];
  name: Scalars['String']['output'];
  parent?: Maybe<Category>;
  sortOrder?: Maybe<Scalars['Int']['output']>;
  type: EntryType;
};

export type CreateAccountCardInput = {
  accountId: Scalars['ID']['input'];
  active?: InputMaybe<Scalars['Boolean']['input']>;
  trailingDigits: Scalars['String']['input'];
  type: PaymentCardType;
};

export type CreateFiscalYearInput = {
  begin: Scalars['Date']['input'];
  end: Scalars['Date']['input'];
  name: Scalars['String']['input'];
};

export type CreateFiscalYearPayload = {
  __typename?: 'CreateFiscalYearPayload';
  fiscalYear: FiscalYear;
};

export enum Currency {
  Usd = 'USD'
}

export type DeleteAttachmentPayload = {
  __typename?: 'DeleteAttachmentPayload';
  deletedAttachment: Attachment;
};

export type DeleteBudgetInput = {
  id: Scalars['ID']['input'];
};

export type DeleteBudgetResult = {
  __typename?: 'DeleteBudgetResult';
  deletedId: Scalars['ID']['output'];
};

export type DeleteEntryPayload = {
  __typename?: 'DeleteEntryPayload';
  deletedEntry: Entry;
};

export type DeleteEntryRefundPayload = {
  __typename?: 'DeleteEntryRefundPayload';
  deletedEntryRefund: EntryRefund;
};

export type DeleteFiscalYearPayload = {
  __typename?: 'DeleteFiscalYearPayload';
  budgetsDeleted: Scalars['Int']['output'];
  entriesDeleted: Scalars['Int']['output'];
  success: Scalars['Boolean']['output'];
};

export type Department = {
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


export type DepartmentAncestorsArgs = {
  root?: InputMaybe<DepartmentsWhere>;
};

export type DepartmentAncestor = Business | Department;

export type DepartmentsWhere = {
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

export type EditHistoryEntry = {
  __typename?: 'EditHistoryEntry';
  changes: Scalars['JSON']['output'];
  editedAt: Scalars['Date']['output'];
  editedBy: Scalars['String']['output'];
  id: Scalars['ID']['output'];
};

export type EntitiesWhere = {
  businesses?: InputMaybe<BusinessesWhere>;
  departments?: InputMaybe<DepartmentsWhere>;
  people?: InputMaybe<PeopleWhere>;
};

export type Entity = Business | Department | Person;

export type EntityInput = {
  id: Scalars['ID']['input'];
  type: EntityType;
};

export enum EntityType {
  Business = 'BUSINESS',
  Department = 'DEPARTMENT',
  Person = 'PERSON'
}

export type EntriesSummary = {
  __typename?: 'EntriesSummary';
  balance: Scalars['Float']['output'];
  count: Scalars['Int']['output'];
};

export type EntriesWhere = {
  and?: InputMaybe<Array<EntriesWhere>>;
  category?: InputMaybe<CategoriesWhere>;
  date?: InputMaybe<WhereDate>;
  dateOfRecord?: InputMaybe<EntriesWhereDateOfRecord>;
  deleted?: InputMaybe<Scalars['Boolean']['input']>;
  department?: InputMaybe<DepartmentsWhere>;
  description?: InputMaybe<WhereRegex>;
  fiscalYear?: InputMaybe<FiscalYearsWhere>;
  hasRefunds?: InputMaybe<Scalars['Boolean']['input']>;
  id?: InputMaybe<WhereId>;
  items?: InputMaybe<EntryItemsWhere>;
  lastUpdate?: InputMaybe<WhereDate>;
  nor?: InputMaybe<Array<EntriesWhere>>;
  or?: InputMaybe<Array<EntriesWhere>>;
  paymentMethodType?: InputMaybe<PaymentMethodType>;
  reconciled?: InputMaybe<Scalars['Boolean']['input']>;
  refunds?: InputMaybe<EntryRefundsWhere>;
  source?: InputMaybe<EntriesWhereSource>;
  total?: InputMaybe<WhereRational>;
  type?: InputMaybe<EntryType>;
};

export type EntriesWhereDateOfRecord = {
  date?: InputMaybe<WhereDate>;
  overrideFiscalYear?: InputMaybe<Scalars['Boolean']['input']>;
};

export type EntriesWhereSource = {
  businesses?: InputMaybe<BusinessesWhere>;
  departments?: InputMaybe<DepartmentsWhere>;
  people?: InputMaybe<PeopleWhere>;
};

export type Entry = {
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
export type EntryDateOfRecord = {
  __typename?: 'EntryDateOfRecord';
  date: Scalars['Date']['output'];
  overrideFiscalYear: Scalars['Boolean']['output'];
};

export type EntryItem = {
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

export type EntryItemsWhere = {
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

export type EntryRefund = {
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

export type EntryRefundsWhere = {
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

export enum EntryType {
  Credit = 'CREDIT',
  Debit = 'DEBIT'
}

export type FiscalYear = {
  __typename?: 'FiscalYear';
  archived?: Maybe<Scalars['Boolean']['output']>;
  archivedAt?: Maybe<Scalars['Date']['output']>;
  archivedBy?: Maybe<AuthUser>;
  begin: Scalars['Date']['output'];
  end: Scalars['Date']['output'];
  id: Scalars['ID']['output'];
  name: Scalars['String']['output'];
};

export type FiscalYearExport = {
  __typename?: 'FiscalYearExport';
  budgets: Array<Budget>;
  entries: Array<Entry>;
  exportedAt: Scalars['Date']['output'];
  fiscalYear: FiscalYear;
};

export type FiscalYearsWhere = {
  and?: InputMaybe<Array<FiscalYearsWhere>>;
  archived?: InputMaybe<Scalars['Boolean']['input']>;
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

export type GoogleAuthUrl = {
  __typename?: 'GoogleAuthUrl';
  url: Scalars['String']['output'];
};

export type GrantPermissionInput = {
  accessLevel: AccessLevel;
  departmentId: Scalars['ID']['input'];
  userId: Scalars['ID']['input'];
};

export type InviteUserInput = {
  canInviteUsers?: InputMaybe<Scalars['Boolean']['input']>;
  email: Scalars['String']['input'];
  name: Scalars['String']['input'];
  permissions?: InputMaybe<Array<InviteUserPermissionInput>>;
  role?: InputMaybe<UserRole>;
};

export type InviteUserPermissionInput = {
  accessLevel: AccessLevel;
  departmentId: Scalars['ID']['input'];
};

export type Mutation = {
  __typename?: 'Mutation';
  addNewBusiness: Business;
  addNewEntry: AddNewEntryPayload;
  addNewEntryRefund: AddNewEntryRefundPayload;
  addNewPerson: AddNewPersonPayload;
  archiveFiscalYear: ArchiveFiscalYearPayload;
  createAccountCard: AccountCard;
  createFiscalYear: CreateFiscalYearPayload;
  deleteAccountCard: Scalars['Boolean']['output'];
  /**
   * Delete an attachment from an entry.
   * This marks the attachment as deleted in the database.
   */
  deleteAttachment: DeleteAttachmentPayload;
  deleteBudget: DeleteBudgetResult;
  deleteEntry: DeleteEntryPayload;
  deleteEntryRefund: DeleteEntryRefundPayload;
  deleteFiscalYear: DeleteFiscalYearPayload;
  deleteUser: Scalars['Boolean']['output'];
  googleAuth: AuthPayload;
  grantPermission: UserPermission;
  inviteUser: AuthUser;
  logout: Scalars['Boolean']['output'];
  reconcileEntries: ReconcileEntriesPayload;
  restoreFiscalYear: RestoreFiscalYearPayload;
  revokePermission: Scalars['Boolean']['output'];
  updateAccountCard: AccountCard;
  updateBusiness: UpdateBusinessPayload;
  updateCategory: UpdateCategoryPayload;
  updateEntry: UpdateEntryPayload;
  updateEntryRefund: UpdateEntryRefundPayload;
  updatePerson: UpdatePersonPayload;
  updateUser: AuthUser;
  /**
   * Upload a receipt file to an entry.
   * The file will be stored on the filesystem (QNAP NAS).
   */
  uploadReceipt: UploadReceiptPayload;
  upsertBudget: UpsertBudgetResult;
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


export type MutationArchiveFiscalYearArgs = {
  id: Scalars['ID']['input'];
};


export type MutationCreateAccountCardArgs = {
  input: CreateAccountCardInput;
};


export type MutationCreateFiscalYearArgs = {
  input: CreateFiscalYearInput;
};


export type MutationDeleteAccountCardArgs = {
  id: Scalars['ID']['input'];
};


export type MutationDeleteAttachmentArgs = {
  id: Scalars['ID']['input'];
};


export type MutationDeleteBudgetArgs = {
  input: DeleteBudgetInput;
};


export type MutationDeleteEntryArgs = {
  id: Scalars['ID']['input'];
};


export type MutationDeleteEntryRefundArgs = {
  id: Scalars['ID']['input'];
};


export type MutationDeleteFiscalYearArgs = {
  id: Scalars['ID']['input'];
};


export type MutationDeleteUserArgs = {
  id: Scalars['ID']['input'];
};


export type MutationGoogleAuthArgs = {
  code: Scalars['String']['input'];
};


export type MutationGrantPermissionArgs = {
  input: GrantPermissionInput;
};


export type MutationInviteUserArgs = {
  input: InviteUserInput;
};


export type MutationReconcileEntriesArgs = {
  input?: InputMaybe<ReconcileEntries>;
};


export type MutationRestoreFiscalYearArgs = {
  id: Scalars['ID']['input'];
};


export type MutationRevokePermissionArgs = {
  input: RevokePermissionInput;
};


export type MutationUpdateAccountCardArgs = {
  id: Scalars['ID']['input'];
  input: UpdateAccountCardInput;
};


export type MutationUpdateBusinessArgs = {
  id: Scalars['ID']['input'];
  input: UpdateBusinessInput;
};


export type MutationUpdateCategoryArgs = {
  id: Scalars['ID']['input'];
  input: UpdateCategoryInput;
};


export type MutationUpdateEntryArgs = {
  input: UpdateEntry;
};


export type MutationUpdateEntryRefundArgs = {
  input: UpdateEntryRefund;
};


export type MutationUpdatePersonArgs = {
  id: Scalars['ID']['input'];
  input: UpdatePersonInput;
};


export type MutationUpdateUserArgs = {
  id: Scalars['ID']['input'];
  input: UpdateUserInput;
};


export type MutationUploadReceiptArgs = {
  entryId: Scalars['ID']['input'];
  file: Scalars['Upload']['input'];
};


export type MutationUpsertBudgetArgs = {
  input: UpsertBudget;
};

export type NewAlias = {
  name: Scalars['String']['input'];
  type: Scalars['String']['input'];
};

export type NewBusiness = {
  name: Scalars['String']['input'];
};

export type NewEntry = {
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
export type NewEntryDateOfRecord = {
  date: Scalars['Date']['input'];
  overrideFiscalYear: Scalars['Boolean']['input'];
};

export type NewEntryRefund = {
  date: Scalars['Date']['input'];
  dateOfRecord?: InputMaybe<NewEntryDateOfRecord>;
  description?: InputMaybe<Scalars['String']['input']>;
  entry: Scalars['ID']['input'];
  paymentMethod: UpsertPaymentMethod;
  reconciled?: InputMaybe<Scalars['Boolean']['input']>;
  total: Scalars['Rational']['input'];
};

export type NewPerson = {
  email?: InputMaybe<Scalars['String']['input']>;
  name: PersonNameInput;
  phone?: InputMaybe<Scalars['String']['input']>;
};

export type NodeInput = {
  id: Scalars['ID']['input'];
  type: Scalars['String']['input'];
};

export type PaymentCard = PaymentCardInterface & {
  __typename?: 'PaymentCard';
  trailingDigits: Scalars['String']['output'];
  type: PaymentCardType;
};

export type PaymentCardInput = {
  trailingDigits: Scalars['String']['input'];
  type: PaymentCardType;
};

export type PaymentCardInterface = {
  trailingDigits: Scalars['String']['output'];
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
  checkNumber: Scalars['String']['output'];
};

export type PaymentCheckInput = {
  checkNumber: Scalars['String']['input'];
};

export type PaymentCheckInterface = {
  checkNumber: Scalars['String']['output'];
};

export type PaymentMethodAccountCardInput = {
  /** id from AccountCard */
  card: Scalars['ID']['input'];
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
  hidden?: InputMaybe<Scalars['Boolean']['input']>;
  id?: InputMaybe<WhereId>;
  name?: InputMaybe<PeopleNameWhere>;
  nor?: InputMaybe<Array<PeopleWhere>>;
  or?: InputMaybe<Array<PeopleWhere>>;
};

export type Person = {
  __typename?: 'Person';
  email?: Maybe<Scalars['String']['output']>;
  hidden?: Maybe<Scalars['Boolean']['output']>;
  id: Scalars['ID']['output'];
  name: PersonName;
  phone?: Maybe<Scalars['String']['output']>;
};

export type PersonName = {
  __typename?: 'PersonName';
  first: Scalars['String']['output'];
  last: Scalars['String']['output'];
};

export type PersonNameInput = {
  first: Scalars['String']['input'];
  last: Scalars['String']['input'];
};

export type Query = {
  __typename?: 'Query';
  account: AccountChecking | AccountCreditCard;
  accountCard: AccountCard;
  accountCards: Array<AccountCard>;
  accounts: Array<AccountChecking | AccountCreditCard>;
  attachment?: Maybe<Attachment>;
  attachments: Array<Attachment>;
  auditLog: Array<AuditLogEntry>;
  budget: Budget;
  budgets: Array<Budget>;
  business: Business;
  businesses: Array<Business>;
  categories: Array<Category>;
  category: Category;
  categoryGroups: Array<Scalars['String']['output']>;
  department: Department;
  departments: Array<Department>;
  entities: Array<Entity>;
  /**
   * filterRefunds: filter refunds against `where` argument by mapping the refund onto it's entry and running the `EntriesWhere` filter.
   * NOTE: A `EntryRefund` is a subset of an `Entry`.  Excludes `EntriesWhere.refunds` in refund matching.
   */
  entries: Array<Entry>;
  entriesCount: Scalars['Int']['output'];
  entriesSummary: EntriesSummary;
  entry?: Maybe<Entry>;
  entryItem?: Maybe<EntryItem>;
  entryRefund?: Maybe<EntryRefund>;
  entryRefunds: Array<EntryRefund>;
  exportFiscalYear: FiscalYearExport;
  fiscalYear: FiscalYear;
  fiscalYears: Array<FiscalYear>;
  googleAuthUrl: GoogleAuthUrl;
  me?: Maybe<AuthUser>;
  people: Array<Person>;
  person: Person;
  /** Search entries by description, category, department, or amount. */
  searchEntries: Array<Entry>;
  sources: Array<Source>;
  user?: Maybe<AuthUser>;
  users: Array<AuthUser>;
};


export type QueryAccountArgs = {
  id: Scalars['ID']['input'];
};


export type QueryAccountCardArgs = {
  id: Scalars['ID']['input'];
};


export type QueryAccountCardsArgs = {
  where?: InputMaybe<AccountCardsWhere>;
};


export type QueryAccountsArgs = {
  where?: InputMaybe<AccountsWhere>;
};


export type QueryAttachmentArgs = {
  id: Scalars['ID']['input'];
};


export type QueryAttachmentsArgs = {
  where?: InputMaybe<AttachmentsWhere>;
};


export type QueryAuditLogArgs = {
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  where?: InputMaybe<AuditLogWhere>;
};


export type QueryBudgetArgs = {
  id: Scalars['ID']['input'];
};


export type QueryBudgetsArgs = {
  where?: InputMaybe<BudgetsWhere>;
};


export type QueryBusinessArgs = {
  id: Scalars['ID']['input'];
};


export type QueryBusinessesArgs = {
  where?: InputMaybe<BusinessesWhere>;
};


export type QueryCategoriesArgs = {
  where?: InputMaybe<CategoriesWhere>;
};


export type QueryCategoryArgs = {
  id: Scalars['ID']['input'];
};


export type QueryDepartmentArgs = {
  id: Scalars['ID']['input'];
};


export type QueryDepartmentsArgs = {
  where?: InputMaybe<DepartmentsWhere>;
};


export type QueryEntitiesArgs = {
  where: EntitiesWhere;
};


export type QueryEntriesArgs = {
  filterRefunds?: InputMaybe<Scalars['Boolean']['input']>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  where?: InputMaybe<EntriesWhere>;
};


export type QueryEntriesCountArgs = {
  filterRefunds?: InputMaybe<Scalars['Boolean']['input']>;
  where?: InputMaybe<EntriesWhere>;
};


export type QueryEntriesSummaryArgs = {
  where?: InputMaybe<EntriesWhere>;
};


export type QueryEntryArgs = {
  id: Scalars['ID']['input'];
};


export type QueryEntryItemArgs = {
  id: Scalars['ID']['input'];
};


export type QueryEntryRefundArgs = {
  id: Scalars['ID']['input'];
};


export type QueryEntryRefundsArgs = {
  entriesWhere?: InputMaybe<EntriesWhere>;
  where?: InputMaybe<EntryRefundsWhere>;
};


export type QueryExportFiscalYearArgs = {
  id: Scalars['ID']['input'];
};


export type QueryFiscalYearArgs = {
  id: Scalars['ID']['input'];
};


export type QueryFiscalYearsArgs = {
  where?: InputMaybe<FiscalYearsWhere>;
};


export type QueryPeopleArgs = {
  where?: InputMaybe<PeopleWhere>;
};


export type QueryPersonArgs = {
  id: Scalars['ID']['input'];
};


export type QuerySearchEntriesArgs = {
  limit?: InputMaybe<Scalars['Int']['input']>;
  query: Scalars['String']['input'];
};


export type QuerySourcesArgs = {
  searchByName: Scalars['String']['input'];
};


export type QueryUserArgs = {
  id: Scalars['ID']['input'];
};


export type QueryUsersArgs = {
  where?: InputMaybe<UsersWhere>;
};

export type ReconcileEntries = {
  entries?: InputMaybe<Array<InputMaybe<Scalars['ID']['input']>>>;
  refunds?: InputMaybe<Array<InputMaybe<Scalars['ID']['input']>>>;
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

export type RestoreFiscalYearPayload = {
  __typename?: 'RestoreFiscalYearPayload';
  budgetsRestored: Scalars['Int']['output'];
  entriesRestored: Scalars['Int']['output'];
  fiscalYear: FiscalYear;
};

export type RevokePermissionInput = {
  departmentId: Scalars['ID']['input'];
  userId: Scalars['ID']['input'];
};

export type Source = Business | Department | Person;

export type Subscription = {
  __typename?: 'Subscription';
  entryAdded: Entry;
  entryUpdated: Entry;
  entryUpserted: Entry;
};

export type UpdateAccountCardInput = {
  active?: InputMaybe<Scalars['Boolean']['input']>;
  trailingDigits?: InputMaybe<Scalars['String']['input']>;
  type?: InputMaybe<PaymentCardType>;
};

export type UpdateBusinessInput = {
  hidden?: InputMaybe<Scalars['Boolean']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
};

export type UpdateBusinessPayload = {
  __typename?: 'UpdateBusinessPayload';
  business: Business;
};

export type UpdateCategoryInput = {
  displayName?: InputMaybe<Scalars['String']['input']>;
  groupName?: InputMaybe<Scalars['String']['input']>;
  hidden?: InputMaybe<Scalars['Boolean']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  sortOrder?: InputMaybe<Scalars['Int']['input']>;
};

export type UpdateCategoryPayload = {
  __typename?: 'UpdateCategoryPayload';
  category: Category;
};

/** Requirers at least ONE optional field. */
export type UpdateEntry = {
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
export type UpdateEntryDateOfRecord = {
  clear?: InputMaybe<Scalars['Boolean']['input']>;
  date?: InputMaybe<Scalars['Date']['input']>;
  overrideFiscalYear?: InputMaybe<Scalars['Boolean']['input']>;
};

export type UpdateEntryPayload = {
  __typename?: 'UpdateEntryPayload';
  updatedEntry: Entry;
};

export type UpdateEntryRefund = {
  date?: InputMaybe<Scalars['Date']['input']>;
  dateOfRecord?: InputMaybe<UpdateEntryDateOfRecord>;
  description?: InputMaybe<Scalars['String']['input']>;
  id: Scalars['ID']['input'];
  paymentMethod?: InputMaybe<UpsertPaymentMethod>;
  reconciled?: InputMaybe<Scalars['Boolean']['input']>;
  total?: InputMaybe<Scalars['Rational']['input']>;
};

export type UpdateEntryRefundPayload = {
  __typename?: 'UpdateEntryRefundPayload';
  updatedEntryRefund: EntryRefund;
};

export type UpdatePersonInput = {
  email?: InputMaybe<Scalars['String']['input']>;
  hidden?: InputMaybe<Scalars['Boolean']['input']>;
  name?: InputMaybe<PersonNameInput>;
  phone?: InputMaybe<Scalars['String']['input']>;
};

export type UpdatePersonPayload = {
  __typename?: 'UpdatePersonPayload';
  person: Person;
};

export type UpdateUserInput = {
  canInviteUsers?: InputMaybe<Scalars['Boolean']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  role?: InputMaybe<UserRole>;
  status?: InputMaybe<UserStatus>;
};

export type UploadReceiptPayload = {
  __typename?: 'UploadReceiptPayload';
  attachment: Attachment;
};

export type UpsertBudget = {
  amount: Scalars['Rational']['input'];
  fiscalYear: Scalars['ID']['input'];
  id?: InputMaybe<Scalars['ID']['input']>;
  owner: NodeInput;
};

export type UpsertBudgetResult = {
  __typename?: 'UpsertBudgetResult';
  budget: Budget;
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
  id: Scalars['ID']['output'];
  user: Person;
};

export type UserPermission = {
  __typename?: 'UserPermission';
  accessLevel: AccessLevel;
  department: Department;
  grantedAt: Scalars['Date']['output'];
  grantedBy: AuthUser;
  id: Scalars['ID']['output'];
  user: AuthUser;
};

export enum UserRole {
  SuperAdmin = 'SUPER_ADMIN',
  User = 'USER'
}

export enum UserStatus {
  Active = 'ACTIVE',
  Disabled = 'DISABLED',
  Invited = 'INVITED'
}

export type UsersWhere = {
  email?: InputMaybe<WhereRegex>;
  id?: InputMaybe<WhereId>;
  role?: InputMaybe<UserRole>;
  status?: InputMaybe<UserStatus>;
};

export type Vendor = {
  __typename?: 'Vendor';
  approved: Scalars['Boolean']['output'];
  vendorId?: Maybe<Scalars['ID']['output']>;
};

export type WhereDate = {
  eq?: InputMaybe<Scalars['Date']['input']>;
  gt?: InputMaybe<Scalars['Date']['input']>;
  gte?: InputMaybe<Scalars['Date']['input']>;
  lt?: InputMaybe<Scalars['Date']['input']>;
  lte?: InputMaybe<Scalars['Date']['input']>;
  ne?: InputMaybe<Scalars['Date']['input']>;
};

export type WhereId = {
  eq?: InputMaybe<Scalars['ID']['input']>;
  in?: InputMaybe<Array<Scalars['ID']['input']>>;
  ne?: InputMaybe<Scalars['ID']['input']>;
  nin?: InputMaybe<Array<Scalars['ID']['input']>>;
};

export type WhereInt = {
  eq?: InputMaybe<Scalars['Int']['input']>;
  gt?: InputMaybe<Scalars['Int']['input']>;
  gte?: InputMaybe<Scalars['Int']['input']>;
  lt?: InputMaybe<Scalars['Int']['input']>;
  lte?: InputMaybe<Scalars['Int']['input']>;
  ne?: InputMaybe<Scalars['Int']['input']>;
};

export type WhereNode = {
  eq?: InputMaybe<NodeInput>;
  in?: InputMaybe<Array<NodeInput>>;
  ne?: InputMaybe<NodeInput>;
  nin?: InputMaybe<Array<NodeInput>>;
};

export type WhereRational = {
  eq?: InputMaybe<Scalars['Rational']['input']>;
  gt?: InputMaybe<Scalars['Rational']['input']>;
  gte?: InputMaybe<Scalars['Rational']['input']>;
  in?: InputMaybe<Array<Scalars['Rational']['input']>>;
  lt?: InputMaybe<Scalars['Rational']['input']>;
  lte?: InputMaybe<Scalars['Rational']['input']>;
  ne?: InputMaybe<Scalars['Rational']['input']>;
  nin?: InputMaybe<Array<Scalars['Rational']['input']>>;
};

export type WhereRegex = {
  flags?: InputMaybe<Array<RegexFlags>>;
  /**
   * "pattern" argument of the javascript RegExp constructor.
   * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/RegExp/RegExp#parameters
   */
  pattern: Scalars['String']['input'];
};

export type WhereTreeId = {
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



export type ResolverTypeWrapper<T> = Promise<T> | T;


export type ResolverWithResolve<TResult, TParent, TContext, TArgs> = {
  resolve: ResolverFn<TResult, TParent, TContext, TArgs>;
};
export type Resolver<TResult, TParent = Record<PropertyKey, never>, TContext = Record<PropertyKey, never>, TArgs = Record<PropertyKey, never>> = ResolverFn<TResult, TParent, TContext, TArgs> | ResolverWithResolve<TResult, TParent, TContext, TArgs>;

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

export type SubscriptionResolver<TResult, TKey extends string, TParent = Record<PropertyKey, never>, TContext = Record<PropertyKey, never>, TArgs = Record<PropertyKey, never>> =
  | ((...args: any[]) => SubscriptionObject<TResult, TKey, TParent, TContext, TArgs>)
  | SubscriptionObject<TResult, TKey, TParent, TContext, TArgs>;

export type TypeResolveFn<TTypes, TParent = Record<PropertyKey, never>, TContext = Record<PropertyKey, never>> = (
  parent: TParent,
  context: TContext,
  info: GraphQLResolveInfo
) => Maybe<TTypes> | Promise<Maybe<TTypes>>;

export type IsTypeOfResolverFn<T = Record<PropertyKey, never>, TContext = Record<PropertyKey, never>> = (obj: T, context: TContext, info: GraphQLResolveInfo) => boolean | Promise<boolean>;

export type NextResolverFn<T> = () => Promise<T>;

export type DirectiveResolverFn<TResult = Record<PropertyKey, never>, TParent = Record<PropertyKey, never>, TContext = Record<PropertyKey, never>, TArgs = Record<PropertyKey, never>> = (
  next: NextResolverFn<TResult>,
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => TResult | Promise<TResult>;



/** Mapping of union types */
export type ResolversUnionTypes<_RefType extends Record<string, unknown>> = {
  BudgetOwner:
    | ( BusinessDbRecord )
    | ( DepartmentDbRecord )
  ;
  DepartmentAncestor:
    | ( BusinessDbRecord )
    | ( DepartmentDbRecord )
  ;
  Entity:
    | ( BusinessDbRecord )
    | ( DepartmentDbRecord )
    | ( PersonDbRecord )
  ;
  Source:
    | ( BusinessDbRecord )
    | ( DepartmentDbRecord )
    | ( PersonDbRecord )
  ;
};

/** Mapping of interface types */
export type ResolversInterfaceTypes<_RefType extends Record<string, unknown>> = {
  AccountInterface:
    | ( AccountDbRecord )
    | ( Omit<AccountCreditCard, 'cards' | 'owner'> & { cards: Array<_RefType['AccountCard']>, owner: _RefType['Entity'] } )
  ;
  AccountWithCardsInterface:
    | ( AccountDbRecord )
    | ( Omit<AccountCreditCard, 'cards' | 'owner'> & { cards: Array<_RefType['AccountCard']>, owner: _RefType['Entity'] } )
  ;
  Aliasable: ( PaymentCardDbRecord );
  PaymentCardInterface:
    | ( PaymentCardDbRecord )
    | ( PaymentCard )
  ;
  PaymentCheckInterface:
    | ( Omit<AccountCheck, 'account'> & { account: _RefType['AccountChecking'] } )
    | ( PaymentCheck )
  ;
  PaymentMethodInterface:
    | ( Omit<PaymentMethodCard, 'card'> & { card: _RefType['PaymentCardInterface'] } )
    | ( PaymentMethodCash )
    | ( Omit<PaymentMethodCheck, 'check'> & { check: _RefType['PaymentCheckInterface'] } )
    | ( PaymentMethodCombination )
    | ( PaymentMethodOnline )
    | ( PaymentMethodUnknown )
  ;
};

/** Mapping between all available schema types and the resolvers types */
export type ResolversTypes = {
  AccessLevel: AccessLevel;
  AccountCard: ResolverTypeWrapper<PaymentCardDbRecord>;
  AccountCardsWhere: AccountCardsWhere;
  AccountCheck: ResolverTypeWrapper<Omit<AccountCheck, 'account'> & { account: ResolversTypes['AccountChecking'] }>;
  AccountCheckInput: AccountCheckInput;
  AccountChecking: ResolverTypeWrapper<AccountDbRecord>;
  AccountCreditCard: ResolverTypeWrapper<Omit<AccountCreditCard, 'cards' | 'owner'> & { cards: Array<ResolversTypes['AccountCard']>, owner: ResolversTypes['Entity'] }>;
  AccountInterface: ResolverTypeWrapper<AccountDbRecord>;
  AccountType: AccountType;
  AccountWithCardsInterface: ResolverTypeWrapper<AccountDbRecord>;
  AccountsWhere: AccountsWhere;
  AddNewEntryPayload: ResolverTypeWrapper<Omit<AddNewEntryPayload, 'newEntry'> & { newEntry: ResolversTypes['Entry'] }>;
  AddNewEntryRefundPayload: ResolverTypeWrapper<Omit<AddNewEntryRefundPayload, 'newEntryRefund'> & { newEntryRefund: ResolversTypes['EntryRefund'] }>;
  AddNewPersonPayload: ResolverTypeWrapper<Omit<AddNewPersonPayload, 'newPerson'> & { newPerson: ResolversTypes['Person'] }>;
  Alias: ResolverTypeWrapper<AliasTypeDbRecord>;
  Aliasable: ResolverTypeWrapper<ResolversInterfaceTypes<ResolversTypes>['Aliasable']>;
  AliasesWhere: AliasesWhere;
  ArchiveFiscalYearPayload: ResolverTypeWrapper<Omit<ArchiveFiscalYearPayload, 'fiscalYear'> & { fiscalYear: ResolversTypes['FiscalYear'] }>;
  Attachment: ResolverTypeWrapper<Attachment>;
  AttachmentsWhere: AttachmentsWhere;
  AuditAction: AuditAction;
  AuditLogEntry: ResolverTypeWrapper<Omit<AuditLogEntry, 'user'> & { user: ResolversTypes['AuthUser'] }>;
  AuditLogWhere: AuditLogWhere;
  AuthPayload: ResolverTypeWrapper<Omit<AuthPayload, 'user'> & { user: ResolversTypes['AuthUser'] }>;
  AuthUser: ResolverTypeWrapper<Omit<AuthUser, 'departments' | 'invitedBy'> & { departments: Array<ResolversTypes['UserPermission']>, invitedBy?: Maybe<ResolversTypes['AuthUser']> }>;
  Boolean: ResolverTypeWrapper<Scalars['Boolean']['output']>;
  Budget: ResolverTypeWrapper<BudgetDbRecord>;
  BudgetOwner: ResolverTypeWrapper<ResolversUnionTypes<ResolversTypes>['BudgetOwner']>;
  BudgetsWhere: BudgetsWhere;
  Business: ResolverTypeWrapper<BusinessDbRecord>;
  BusinessesWhere: BusinessesWhere;
  CategoriesWhere: CategoriesWhere;
  Category: ResolverTypeWrapper<CategoryDbRecord>;
  CreateAccountCardInput: CreateAccountCardInput;
  CreateFiscalYearInput: CreateFiscalYearInput;
  CreateFiscalYearPayload: ResolverTypeWrapper<Omit<CreateFiscalYearPayload, 'fiscalYear'> & { fiscalYear: ResolversTypes['FiscalYear'] }>;
  Currency: Currency;
  Date: ResolverTypeWrapper<Scalars['Date']['output']>;
  DeleteAttachmentPayload: ResolverTypeWrapper<Omit<DeleteAttachmentPayload, 'deletedAttachment'> & { deletedAttachment: ResolversTypes['Attachment'] }>;
  DeleteBudgetInput: DeleteBudgetInput;
  DeleteBudgetResult: ResolverTypeWrapper<DeleteBudgetResult>;
  DeleteEntryPayload: ResolverTypeWrapper<Omit<DeleteEntryPayload, 'deletedEntry'> & { deletedEntry: ResolversTypes['Entry'] }>;
  DeleteEntryRefundPayload: ResolverTypeWrapper<Omit<DeleteEntryRefundPayload, 'deletedEntryRefund'> & { deletedEntryRefund: ResolversTypes['EntryRefund'] }>;
  DeleteFiscalYearPayload: ResolverTypeWrapper<DeleteFiscalYearPayload>;
  Department: ResolverTypeWrapper<DepartmentDbRecord>;
  DepartmentAncestor: ResolverTypeWrapper<ResolversUnionTypes<ResolversTypes>['DepartmentAncestor']>;
  DepartmentsWhere: DepartmentsWhere;
  EditHistoryEntry: ResolverTypeWrapper<EditHistoryEntry>;
  EntitiesWhere: EntitiesWhere;
  Entity: ResolverTypeWrapper<ResolversUnionTypes<ResolversTypes>['Entity']>;
  EntityInput: EntityInput;
  EntityType: EntityType;
  EntriesSummary: ResolverTypeWrapper<EntriesSummary>;
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
  FiscalYearExport: ResolverTypeWrapper<Omit<FiscalYearExport, 'budgets' | 'entries' | 'fiscalYear'> & { budgets: Array<ResolversTypes['Budget']>, entries: Array<ResolversTypes['Entry']>, fiscalYear: ResolversTypes['FiscalYear'] }>;
  FiscalYearsWhere: FiscalYearsWhere;
  Float: ResolverTypeWrapper<Scalars['Float']['output']>;
  GoogleAuthUrl: ResolverTypeWrapper<GoogleAuthUrl>;
  GrantPermissionInput: GrantPermissionInput;
  ID: ResolverTypeWrapper<Scalars['ID']['output']>;
  Int: ResolverTypeWrapper<Scalars['Int']['output']>;
  InviteUserInput: InviteUserInput;
  InviteUserPermissionInput: InviteUserPermissionInput;
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
  PaymentMethodCard: ResolverTypeWrapper<Omit<PaymentMethodCard, 'card'> & { card: ResolversTypes['PaymentCardInterface'] }>;
  PaymentMethodCardInput: PaymentMethodCardInput;
  PaymentMethodCash: ResolverTypeWrapper<PaymentMethodCash>;
  PaymentMethodCashInput: PaymentMethodCashInput;
  PaymentMethodCheck: ResolverTypeWrapper<Omit<PaymentMethodCheck, 'check'> & { check: ResolversTypes['PaymentCheckInterface'] }>;
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
  ReconcileEntriesPayload: ResolverTypeWrapper<Omit<ReconcileEntriesPayload, 'reconciledEntries' | 'reconciledRefunds'> & { reconciledEntries: Array<ResolversTypes['Entry']>, reconciledRefunds: Array<ResolversTypes['EntryRefund']> }>;
  RegexFlags: RegexFlags;
  RestoreFiscalYearPayload: ResolverTypeWrapper<Omit<RestoreFiscalYearPayload, 'fiscalYear'> & { fiscalYear: ResolversTypes['FiscalYear'] }>;
  RevokePermissionInput: RevokePermissionInput;
  Source: ResolverTypeWrapper<ResolversUnionTypes<ResolversTypes>['Source']>;
  String: ResolverTypeWrapper<Scalars['String']['output']>;
  Subscription: ResolverTypeWrapper<Record<PropertyKey, never>>;
  UpdateAccountCardInput: UpdateAccountCardInput;
  UpdateBusinessInput: UpdateBusinessInput;
  UpdateBusinessPayload: ResolverTypeWrapper<Omit<UpdateBusinessPayload, 'business'> & { business: ResolversTypes['Business'] }>;
  UpdateCategoryInput: UpdateCategoryInput;
  UpdateCategoryPayload: ResolverTypeWrapper<Omit<UpdateCategoryPayload, 'category'> & { category: ResolversTypes['Category'] }>;
  UpdateEntry: UpdateEntry;
  UpdateEntryDateOfRecord: UpdateEntryDateOfRecord;
  UpdateEntryPayload: ResolverTypeWrapper<Omit<UpdateEntryPayload, 'updatedEntry'> & { updatedEntry: ResolversTypes['Entry'] }>;
  UpdateEntryRefund: UpdateEntryRefund;
  UpdateEntryRefundPayload: ResolverTypeWrapper<Omit<UpdateEntryRefundPayload, 'updatedEntryRefund'> & { updatedEntryRefund: ResolversTypes['EntryRefund'] }>;
  UpdatePersonInput: UpdatePersonInput;
  UpdatePersonPayload: ResolverTypeWrapper<Omit<UpdatePersonPayload, 'person'> & { person: ResolversTypes['Person'] }>;
  UpdateUserInput: UpdateUserInput;
  Upload: ResolverTypeWrapper<Scalars['Upload']['output']>;
  UploadReceiptPayload: ResolverTypeWrapper<Omit<UploadReceiptPayload, 'attachment'> & { attachment: ResolversTypes['Attachment'] }>;
  UpsertBudget: UpsertBudget;
  UpsertBudgetResult: ResolverTypeWrapper<Omit<UpsertBudgetResult, 'budget'> & { budget: ResolversTypes['Budget'] }>;
  UpsertEntrySource: UpsertEntrySource;
  UpsertPaymentMethod: UpsertPaymentMethod;
  User: ResolverTypeWrapper<Omit<User, 'user'> & { user: ResolversTypes['Person'] }>;
  UserPermission: ResolverTypeWrapper<Omit<UserPermission, 'department' | 'grantedBy' | 'user'> & { department: ResolversTypes['Department'], grantedBy: ResolversTypes['AuthUser'], user: ResolversTypes['AuthUser'] }>;
  UserRole: UserRole;
  UserStatus: UserStatus;
  UsersWhere: UsersWhere;
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
  AccountCard: PaymentCardDbRecord;
  AccountCardsWhere: AccountCardsWhere;
  AccountCheck: Omit<AccountCheck, 'account'> & { account: ResolversParentTypes['AccountChecking'] };
  AccountCheckInput: AccountCheckInput;
  AccountChecking: AccountDbRecord;
  AccountCreditCard: Omit<AccountCreditCard, 'cards' | 'owner'> & { cards: Array<ResolversParentTypes['AccountCard']>, owner: ResolversParentTypes['Entity'] };
  AccountInterface: AccountDbRecord;
  AccountWithCardsInterface: AccountDbRecord;
  AccountsWhere: AccountsWhere;
  AddNewEntryPayload: Omit<AddNewEntryPayload, 'newEntry'> & { newEntry: ResolversParentTypes['Entry'] };
  AddNewEntryRefundPayload: Omit<AddNewEntryRefundPayload, 'newEntryRefund'> & { newEntryRefund: ResolversParentTypes['EntryRefund'] };
  AddNewPersonPayload: Omit<AddNewPersonPayload, 'newPerson'> & { newPerson: ResolversParentTypes['Person'] };
  Alias: AliasTypeDbRecord;
  Aliasable: ResolversInterfaceTypes<ResolversParentTypes>['Aliasable'];
  AliasesWhere: AliasesWhere;
  ArchiveFiscalYearPayload: Omit<ArchiveFiscalYearPayload, 'fiscalYear'> & { fiscalYear: ResolversParentTypes['FiscalYear'] };
  Attachment: Attachment;
  AttachmentsWhere: AttachmentsWhere;
  AuditLogEntry: Omit<AuditLogEntry, 'user'> & { user: ResolversParentTypes['AuthUser'] };
  AuditLogWhere: AuditLogWhere;
  AuthPayload: Omit<AuthPayload, 'user'> & { user: ResolversParentTypes['AuthUser'] };
  AuthUser: Omit<AuthUser, 'departments' | 'invitedBy'> & { departments: Array<ResolversParentTypes['UserPermission']>, invitedBy?: Maybe<ResolversParentTypes['AuthUser']> };
  Boolean: Scalars['Boolean']['output'];
  Budget: BudgetDbRecord;
  BudgetOwner: ResolversUnionTypes<ResolversParentTypes>['BudgetOwner'];
  BudgetsWhere: BudgetsWhere;
  Business: BusinessDbRecord;
  BusinessesWhere: BusinessesWhere;
  CategoriesWhere: CategoriesWhere;
  Category: CategoryDbRecord;
  CreateAccountCardInput: CreateAccountCardInput;
  CreateFiscalYearInput: CreateFiscalYearInput;
  CreateFiscalYearPayload: Omit<CreateFiscalYearPayload, 'fiscalYear'> & { fiscalYear: ResolversParentTypes['FiscalYear'] };
  Date: Scalars['Date']['output'];
  DeleteAttachmentPayload: Omit<DeleteAttachmentPayload, 'deletedAttachment'> & { deletedAttachment: ResolversParentTypes['Attachment'] };
  DeleteBudgetInput: DeleteBudgetInput;
  DeleteBudgetResult: DeleteBudgetResult;
  DeleteEntryPayload: Omit<DeleteEntryPayload, 'deletedEntry'> & { deletedEntry: ResolversParentTypes['Entry'] };
  DeleteEntryRefundPayload: Omit<DeleteEntryRefundPayload, 'deletedEntryRefund'> & { deletedEntryRefund: ResolversParentTypes['EntryRefund'] };
  DeleteFiscalYearPayload: DeleteFiscalYearPayload;
  Department: DepartmentDbRecord;
  DepartmentAncestor: ResolversUnionTypes<ResolversParentTypes>['DepartmentAncestor'];
  DepartmentsWhere: DepartmentsWhere;
  EditHistoryEntry: EditHistoryEntry;
  EntitiesWhere: EntitiesWhere;
  Entity: ResolversUnionTypes<ResolversParentTypes>['Entity'];
  EntityInput: EntityInput;
  EntriesSummary: EntriesSummary;
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
  FiscalYearExport: Omit<FiscalYearExport, 'budgets' | 'entries' | 'fiscalYear'> & { budgets: Array<ResolversParentTypes['Budget']>, entries: Array<ResolversParentTypes['Entry']>, fiscalYear: ResolversParentTypes['FiscalYear'] };
  FiscalYearsWhere: FiscalYearsWhere;
  Float: Scalars['Float']['output'];
  GoogleAuthUrl: GoogleAuthUrl;
  GrantPermissionInput: GrantPermissionInput;
  ID: Scalars['ID']['output'];
  Int: Scalars['Int']['output'];
  InviteUserInput: InviteUserInput;
  InviteUserPermissionInput: InviteUserPermissionInput;
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
  PaymentMethodCard: Omit<PaymentMethodCard, 'card'> & { card: ResolversParentTypes['PaymentCardInterface'] };
  PaymentMethodCardInput: PaymentMethodCardInput;
  PaymentMethodCash: PaymentMethodCash;
  PaymentMethodCashInput: PaymentMethodCashInput;
  PaymentMethodCheck: Omit<PaymentMethodCheck, 'check'> & { check: ResolversParentTypes['PaymentCheckInterface'] };
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
  ReconcileEntriesPayload: Omit<ReconcileEntriesPayload, 'reconciledEntries' | 'reconciledRefunds'> & { reconciledEntries: Array<ResolversParentTypes['Entry']>, reconciledRefunds: Array<ResolversParentTypes['EntryRefund']> };
  RestoreFiscalYearPayload: Omit<RestoreFiscalYearPayload, 'fiscalYear'> & { fiscalYear: ResolversParentTypes['FiscalYear'] };
  RevokePermissionInput: RevokePermissionInput;
  Source: ResolversUnionTypes<ResolversParentTypes>['Source'];
  String: Scalars['String']['output'];
  Subscription: Record<PropertyKey, never>;
  UpdateAccountCardInput: UpdateAccountCardInput;
  UpdateBusinessInput: UpdateBusinessInput;
  UpdateBusinessPayload: Omit<UpdateBusinessPayload, 'business'> & { business: ResolversParentTypes['Business'] };
  UpdateCategoryInput: UpdateCategoryInput;
  UpdateCategoryPayload: Omit<UpdateCategoryPayload, 'category'> & { category: ResolversParentTypes['Category'] };
  UpdateEntry: UpdateEntry;
  UpdateEntryDateOfRecord: UpdateEntryDateOfRecord;
  UpdateEntryPayload: Omit<UpdateEntryPayload, 'updatedEntry'> & { updatedEntry: ResolversParentTypes['Entry'] };
  UpdateEntryRefund: UpdateEntryRefund;
  UpdateEntryRefundPayload: Omit<UpdateEntryRefundPayload, 'updatedEntryRefund'> & { updatedEntryRefund: ResolversParentTypes['EntryRefund'] };
  UpdatePersonInput: UpdatePersonInput;
  UpdatePersonPayload: Omit<UpdatePersonPayload, 'person'> & { person: ResolversParentTypes['Person'] };
  UpdateUserInput: UpdateUserInput;
  Upload: Scalars['Upload']['output'];
  UploadReceiptPayload: Omit<UploadReceiptPayload, 'attachment'> & { attachment: ResolversParentTypes['Attachment'] };
  UpsertBudget: UpsertBudget;
  UpsertBudgetResult: Omit<UpsertBudgetResult, 'budget'> & { budget: ResolversParentTypes['Budget'] };
  UpsertEntrySource: UpsertEntrySource;
  UpsertPaymentMethod: UpsertPaymentMethod;
  User: Omit<User, 'user'> & { user: ResolversParentTypes['Person'] };
  UserPermission: Omit<UserPermission, 'department' | 'grantedBy' | 'user'> & { department: ResolversParentTypes['Department'], grantedBy: ResolversParentTypes['AuthUser'], user: ResolversParentTypes['AuthUser'] };
  UsersWhere: UsersWhere;
  Vendor: Vendor;
  WhereDate: WhereDate;
  WhereId: WhereId;
  WhereInt: WhereInt;
  WhereNode: WhereNode;
  WhereRational: WhereRational;
  WhereRegex: WhereRegex;
  WhereTreeId: WhereTreeId;
};

export type AccountCardResolvers<ContextType = Context, ParentType = ResolversParentTypes['AccountCard']> = {
  account?: Resolver<ResolversTypes['AccountWithCardsInterface'], ParentType, ContextType>;
  active?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  aliases?: Resolver<Array<ResolversTypes['Alias']>, ParentType, ContextType, Partial<AccountCardAliasesArgs>>;
  authorizedUsers?: Resolver<Array<ResolversTypes['Entity']>, ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  trailingDigits?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  type?: Resolver<ResolversTypes['PaymentCardType'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type AccountCheckResolvers<ContextType = Context, ParentType = ResolversParentTypes['AccountCheck']> = {
  account?: Resolver<ResolversTypes['AccountChecking'], ParentType, ContextType>;
  checkNumber?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type AccountCheckingResolvers<ContextType = Context, ParentType = ResolversParentTypes['AccountChecking']> = {
  accountNumber?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  active?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  cards?: Resolver<Array<ResolversTypes['AccountCard']>, ParentType, ContextType>;
  currency?: Resolver<ResolversTypes['Currency'], ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  name?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  owner?: Resolver<ResolversTypes['Entity'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type AccountCreditCardResolvers<ContextType = Context, ParentType = ResolversParentTypes['AccountCreditCard']> = {
  active?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  cards?: Resolver<Array<ResolversTypes['AccountCard']>, ParentType, ContextType>;
  currency?: Resolver<ResolversTypes['Currency'], ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  name?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  owner?: Resolver<ResolversTypes['Entity'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type AccountInterfaceResolvers<ContextType = Context, ParentType = ResolversParentTypes['AccountInterface']> = {
  __resolveType?: TypeResolveFn<'AccountChecking' | 'AccountCreditCard', ParentType, ContextType>;
};

export type AccountWithCardsInterfaceResolvers<ContextType = Context, ParentType = ResolversParentTypes['AccountWithCardsInterface']> = {
  __resolveType?: TypeResolveFn<'AccountChecking' | 'AccountCreditCard', ParentType, ContextType>;
};

export type AddNewEntryPayloadResolvers<ContextType = Context, ParentType = ResolversParentTypes['AddNewEntryPayload']> = {
  newEntry?: Resolver<ResolversTypes['Entry'], ParentType, ContextType>;
};

export type AddNewEntryRefundPayloadResolvers<ContextType = Context, ParentType = ResolversParentTypes['AddNewEntryRefundPayload']> = {
  newEntryRefund?: Resolver<ResolversTypes['EntryRefund'], ParentType, ContextType>;
};

export type AddNewPersonPayloadResolvers<ContextType = Context, ParentType = ResolversParentTypes['AddNewPersonPayload']> = {
  newPerson?: Resolver<ResolversTypes['Person'], ParentType, ContextType>;
};

export type AliasResolvers<ContextType = Context, ParentType = ResolversParentTypes['Alias']> = {
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  name?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
};

export type AliasableResolvers<ContextType = Context, ParentType = ResolversParentTypes['Aliasable']> = {
  __resolveType?: TypeResolveFn<'AccountCard', ParentType, ContextType>;
};

export type ArchiveFiscalYearPayloadResolvers<ContextType = Context, ParentType = ResolversParentTypes['ArchiveFiscalYearPayload']> = {
  budgetsArchived?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  entriesArchived?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  fiscalYear?: Resolver<ResolversTypes['FiscalYear'], ParentType, ContextType>;
};

export type AttachmentResolvers<ContextType = Context, ParentType = ResolversParentTypes['Attachment']> = {
  deleted?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  filePath?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  fileSize?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  filename?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  mimeType?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  thumbnailUrl?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  uploadedAt?: Resolver<ResolversTypes['Date'], ParentType, ContextType>;
  uploadedBy?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  url?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
};

export type AuditLogEntryResolvers<ContextType = Context, ParentType = ResolversParentTypes['AuditLogEntry']> = {
  action?: Resolver<ResolversTypes['AuditAction'], ParentType, ContextType>;
  details?: Resolver<Maybe<ResolversTypes['JSON']>, ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  ipAddress?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  resourceId?: Resolver<Maybe<ResolversTypes['ID']>, ParentType, ContextType>;
  resourceType?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  timestamp?: Resolver<ResolversTypes['Date'], ParentType, ContextType>;
  user?: Resolver<ResolversTypes['AuthUser'], ParentType, ContextType>;
  userAgent?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
};

export type AuthPayloadResolvers<ContextType = Context, ParentType = ResolversParentTypes['AuthPayload']> = {
  token?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  user?: Resolver<ResolversTypes['AuthUser'], ParentType, ContextType>;
};

export type AuthUserResolvers<ContextType = Context, ParentType = ResolversParentTypes['AuthUser']> = {
  canInviteUsers?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  createdAt?: Resolver<ResolversTypes['Date'], ParentType, ContextType>;
  departments?: Resolver<Array<ResolversTypes['UserPermission']>, ParentType, ContextType>;
  email?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  googleId?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  invitedAt?: Resolver<Maybe<ResolversTypes['Date']>, ParentType, ContextType>;
  invitedBy?: Resolver<Maybe<ResolversTypes['AuthUser']>, ParentType, ContextType>;
  lastLoginAt?: Resolver<Maybe<ResolversTypes['Date']>, ParentType, ContextType>;
  name?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  picture?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  role?: Resolver<ResolversTypes['UserRole'], ParentType, ContextType>;
  status?: Resolver<ResolversTypes['UserStatus'], ParentType, ContextType>;
};

export type BudgetResolvers<ContextType = Context, ParentType = ResolversParentTypes['Budget']> = {
  amount?: Resolver<ResolversTypes['Rational'], ParentType, ContextType>;
  fiscalYear?: Resolver<ResolversTypes['FiscalYear'], ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  owner?: Resolver<ResolversTypes['BudgetOwner'], ParentType, ContextType>;
};

export type BudgetOwnerResolvers<ContextType = Context, ParentType = ResolversParentTypes['BudgetOwner']> = {
  __resolveType?: TypeResolveFn<'Business' | 'Department', ParentType, ContextType>;
};

export type BusinessResolvers<ContextType = Context, ParentType = ResolversParentTypes['Business']> = {
  budgets?: Resolver<Array<ResolversTypes['Budget']>, ParentType, ContextType>;
  departments?: Resolver<Array<ResolversTypes['Department']>, ParentType, ContextType, RequireFields<BusinessDepartmentsArgs, 'root'>>;
  hidden?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  name?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  vendor?: Resolver<Maybe<ResolversTypes['Vendor']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type CategoryResolvers<ContextType = Context, ParentType = ResolversParentTypes['Category']> = {
  accountNumber?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  active?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  aliases?: Resolver<Array<ResolversTypes['Alias']>, ParentType, ContextType>;
  ancestors?: Resolver<Array<ResolversTypes['Category']>, ParentType, ContextType>;
  children?: Resolver<Array<ResolversTypes['Category']>, ParentType, ContextType>;
  displayName?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  groupName?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  hidden?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  name?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  parent?: Resolver<Maybe<ResolversTypes['Category']>, ParentType, ContextType>;
  sortOrder?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  type?: Resolver<ResolversTypes['EntryType'], ParentType, ContextType>;
};

export type CreateFiscalYearPayloadResolvers<ContextType = Context, ParentType = ResolversParentTypes['CreateFiscalYearPayload']> = {
  fiscalYear?: Resolver<ResolversTypes['FiscalYear'], ParentType, ContextType>;
};

export interface DateScalarConfig extends GraphQLScalarTypeConfig<ResolversTypes['Date'], any> {
  name: 'Date';
}

export type DeleteAttachmentPayloadResolvers<ContextType = Context, ParentType = ResolversParentTypes['DeleteAttachmentPayload']> = {
  deletedAttachment?: Resolver<ResolversTypes['Attachment'], ParentType, ContextType>;
};

export type DeleteBudgetResultResolvers<ContextType = Context, ParentType = ResolversParentTypes['DeleteBudgetResult']> = {
  deletedId?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
};

export type DeleteEntryPayloadResolvers<ContextType = Context, ParentType = ResolversParentTypes['DeleteEntryPayload']> = {
  deletedEntry?: Resolver<ResolversTypes['Entry'], ParentType, ContextType>;
};

export type DeleteEntryRefundPayloadResolvers<ContextType = Context, ParentType = ResolversParentTypes['DeleteEntryRefundPayload']> = {
  deletedEntryRefund?: Resolver<ResolversTypes['EntryRefund'], ParentType, ContextType>;
};

export type DeleteFiscalYearPayloadResolvers<ContextType = Context, ParentType = ResolversParentTypes['DeleteFiscalYearPayload']> = {
  budgetsDeleted?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  entriesDeleted?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  success?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
};

export type DepartmentResolvers<ContextType = Context, ParentType = ResolversParentTypes['Department']> = {
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

export type DepartmentAncestorResolvers<ContextType = Context, ParentType = ResolversParentTypes['DepartmentAncestor']> = {
  __resolveType?: TypeResolveFn<'Business' | 'Department', ParentType, ContextType>;
};

export type EditHistoryEntryResolvers<ContextType = Context, ParentType = ResolversParentTypes['EditHistoryEntry']> = {
  changes?: Resolver<ResolversTypes['JSON'], ParentType, ContextType>;
  editedAt?: Resolver<ResolversTypes['Date'], ParentType, ContextType>;
  editedBy?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
};

export type EntityResolvers<ContextType = Context, ParentType = ResolversParentTypes['Entity']> = {
  __resolveType?: TypeResolveFn<'Business' | 'Department' | 'Person', ParentType, ContextType>;
};

export type EntriesSummaryResolvers<ContextType = Context, ParentType = ResolversParentTypes['EntriesSummary']> = {
  balance?: Resolver<ResolversTypes['Float'], ParentType, ContextType>;
  count?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
};

export type EntryResolvers<ContextType = Context, ParentType = ResolversParentTypes['Entry']> = {
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

export type EntryDateOfRecordResolvers<ContextType = Context, ParentType = ResolversParentTypes['EntryDateOfRecord']> = {
  date?: Resolver<ResolversTypes['Date'], ParentType, ContextType>;
  overrideFiscalYear?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
};

export type EntryItemResolvers<ContextType = Context, ParentType = ResolversParentTypes['EntryItem']> = {
  category?: Resolver<Maybe<ResolversTypes['Category']>, ParentType, ContextType>;
  deleted?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  department?: Resolver<Maybe<ResolversTypes['Department']>, ParentType, ContextType>;
  description?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  lastUpdate?: Resolver<ResolversTypes['Date'], ParentType, ContextType>;
  total?: Resolver<ResolversTypes['Rational'], ParentType, ContextType>;
  units?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
};

export type EntryRefundResolvers<ContextType = Context, ParentType = ResolversParentTypes['EntryRefund']> = {
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

export type FiscalYearResolvers<ContextType = Context, ParentType = ResolversParentTypes['FiscalYear']> = {
  archived?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  archivedAt?: Resolver<Maybe<ResolversTypes['Date']>, ParentType, ContextType>;
  archivedBy?: Resolver<Maybe<ResolversTypes['AuthUser']>, ParentType, ContextType>;
  begin?: Resolver<ResolversTypes['Date'], ParentType, ContextType>;
  end?: Resolver<ResolversTypes['Date'], ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  name?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
};

export type FiscalYearExportResolvers<ContextType = Context, ParentType = ResolversParentTypes['FiscalYearExport']> = {
  budgets?: Resolver<Array<ResolversTypes['Budget']>, ParentType, ContextType>;
  entries?: Resolver<Array<ResolversTypes['Entry']>, ParentType, ContextType>;
  exportedAt?: Resolver<ResolversTypes['Date'], ParentType, ContextType>;
  fiscalYear?: Resolver<ResolversTypes['FiscalYear'], ParentType, ContextType>;
};

export type GoogleAuthUrlResolvers<ContextType = Context, ParentType = ResolversParentTypes['GoogleAuthUrl']> = {
  url?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
};

export interface JsonScalarConfig extends GraphQLScalarTypeConfig<ResolversTypes['JSON'], any> {
  name: 'JSON';
}

export type MutationResolvers<ContextType = Context, ParentType = ResolversParentTypes['Mutation']> = {
  addNewBusiness?: Resolver<ResolversTypes['Business'], ParentType, ContextType, RequireFields<MutationAddNewBusinessArgs, 'input'>>;
  addNewEntry?: Resolver<ResolversTypes['AddNewEntryPayload'], ParentType, ContextType, RequireFields<MutationAddNewEntryArgs, 'input'>>;
  addNewEntryRefund?: Resolver<ResolversTypes['AddNewEntryRefundPayload'], ParentType, ContextType, RequireFields<MutationAddNewEntryRefundArgs, 'input'>>;
  addNewPerson?: Resolver<ResolversTypes['AddNewPersonPayload'], ParentType, ContextType, RequireFields<MutationAddNewPersonArgs, 'input'>>;
  archiveFiscalYear?: Resolver<ResolversTypes['ArchiveFiscalYearPayload'], ParentType, ContextType, RequireFields<MutationArchiveFiscalYearArgs, 'id'>>;
  createAccountCard?: Resolver<ResolversTypes['AccountCard'], ParentType, ContextType, RequireFields<MutationCreateAccountCardArgs, 'input'>>;
  createFiscalYear?: Resolver<ResolversTypes['CreateFiscalYearPayload'], ParentType, ContextType, RequireFields<MutationCreateFiscalYearArgs, 'input'>>;
  deleteAccountCard?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType, RequireFields<MutationDeleteAccountCardArgs, 'id'>>;
  deleteAttachment?: Resolver<ResolversTypes['DeleteAttachmentPayload'], ParentType, ContextType, RequireFields<MutationDeleteAttachmentArgs, 'id'>>;
  deleteBudget?: Resolver<ResolversTypes['DeleteBudgetResult'], ParentType, ContextType, RequireFields<MutationDeleteBudgetArgs, 'input'>>;
  deleteEntry?: Resolver<ResolversTypes['DeleteEntryPayload'], ParentType, ContextType, RequireFields<MutationDeleteEntryArgs, 'id'>>;
  deleteEntryRefund?: Resolver<ResolversTypes['DeleteEntryRefundPayload'], ParentType, ContextType, RequireFields<MutationDeleteEntryRefundArgs, 'id'>>;
  deleteFiscalYear?: Resolver<ResolversTypes['DeleteFiscalYearPayload'], ParentType, ContextType, RequireFields<MutationDeleteFiscalYearArgs, 'id'>>;
  deleteUser?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType, RequireFields<MutationDeleteUserArgs, 'id'>>;
  googleAuth?: Resolver<ResolversTypes['AuthPayload'], ParentType, ContextType, RequireFields<MutationGoogleAuthArgs, 'code'>>;
  grantPermission?: Resolver<ResolversTypes['UserPermission'], ParentType, ContextType, RequireFields<MutationGrantPermissionArgs, 'input'>>;
  inviteUser?: Resolver<ResolversTypes['AuthUser'], ParentType, ContextType, RequireFields<MutationInviteUserArgs, 'input'>>;
  logout?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  reconcileEntries?: Resolver<ResolversTypes['ReconcileEntriesPayload'], ParentType, ContextType, Partial<MutationReconcileEntriesArgs>>;
  restoreFiscalYear?: Resolver<ResolversTypes['RestoreFiscalYearPayload'], ParentType, ContextType, RequireFields<MutationRestoreFiscalYearArgs, 'id'>>;
  revokePermission?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType, RequireFields<MutationRevokePermissionArgs, 'input'>>;
  updateAccountCard?: Resolver<ResolversTypes['AccountCard'], ParentType, ContextType, RequireFields<MutationUpdateAccountCardArgs, 'id' | 'input'>>;
  updateBusiness?: Resolver<ResolversTypes['UpdateBusinessPayload'], ParentType, ContextType, RequireFields<MutationUpdateBusinessArgs, 'id' | 'input'>>;
  updateCategory?: Resolver<ResolversTypes['UpdateCategoryPayload'], ParentType, ContextType, RequireFields<MutationUpdateCategoryArgs, 'id' | 'input'>>;
  updateEntry?: Resolver<ResolversTypes['UpdateEntryPayload'], ParentType, ContextType, RequireFields<MutationUpdateEntryArgs, 'input'>>;
  updateEntryRefund?: Resolver<ResolversTypes['UpdateEntryRefundPayload'], ParentType, ContextType, RequireFields<MutationUpdateEntryRefundArgs, 'input'>>;
  updatePerson?: Resolver<ResolversTypes['UpdatePersonPayload'], ParentType, ContextType, RequireFields<MutationUpdatePersonArgs, 'id' | 'input'>>;
  updateUser?: Resolver<ResolversTypes['AuthUser'], ParentType, ContextType, RequireFields<MutationUpdateUserArgs, 'id' | 'input'>>;
  uploadReceipt?: Resolver<ResolversTypes['UploadReceiptPayload'], ParentType, ContextType, RequireFields<MutationUploadReceiptArgs, 'entryId' | 'file'>>;
  upsertBudget?: Resolver<ResolversTypes['UpsertBudgetResult'], ParentType, ContextType, RequireFields<MutationUpsertBudgetArgs, 'input'>>;
};

export type PaymentCardResolvers<ContextType = Context, ParentType = ResolversParentTypes['PaymentCard']> = {
  trailingDigits?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  type?: Resolver<ResolversTypes['PaymentCardType'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type PaymentCardInterfaceResolvers<ContextType = Context, ParentType = ResolversParentTypes['PaymentCardInterface']> = {
  __resolveType?: TypeResolveFn<'AccountCard' | 'PaymentCard', ParentType, ContextType>;
};

export type PaymentCheckResolvers<ContextType = Context, ParentType = ResolversParentTypes['PaymentCheck']> = {
  checkNumber?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type PaymentCheckInterfaceResolvers<ContextType = Context, ParentType = ResolversParentTypes['PaymentCheckInterface']> = {
  __resolveType?: TypeResolveFn<'AccountCheck' | 'PaymentCheck', ParentType, ContextType>;
};

export type PaymentMethodCardResolvers<ContextType = Context, ParentType = ResolversParentTypes['PaymentMethodCard']> = {
  card?: Resolver<ResolversTypes['PaymentCardInterface'], ParentType, ContextType>;
  currency?: Resolver<ResolversTypes['Currency'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type PaymentMethodCashResolvers<ContextType = Context, ParentType = ResolversParentTypes['PaymentMethodCash']> = {
  currency?: Resolver<ResolversTypes['Currency'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type PaymentMethodCheckResolvers<ContextType = Context, ParentType = ResolversParentTypes['PaymentMethodCheck']> = {
  check?: Resolver<ResolversTypes['PaymentCheckInterface'], ParentType, ContextType>;
  currency?: Resolver<ResolversTypes['Currency'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type PaymentMethodCombinationResolvers<ContextType = Context, ParentType = ResolversParentTypes['PaymentMethodCombination']> = {
  currency?: Resolver<ResolversTypes['Currency'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type PaymentMethodInterfaceResolvers<ContextType = Context, ParentType = ResolversParentTypes['PaymentMethodInterface']> = {
  __resolveType?: TypeResolveFn<'PaymentMethodCard' | 'PaymentMethodCash' | 'PaymentMethodCheck' | 'PaymentMethodCombination' | 'PaymentMethodOnline' | 'PaymentMethodUnknown', ParentType, ContextType>;
};

export type PaymentMethodOnlineResolvers<ContextType = Context, ParentType = ResolversParentTypes['PaymentMethodOnline']> = {
  currency?: Resolver<ResolversTypes['Currency'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type PaymentMethodUnknownResolvers<ContextType = Context, ParentType = ResolversParentTypes['PaymentMethodUnknown']> = {
  currency?: Resolver<ResolversTypes['Currency'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type PersonResolvers<ContextType = Context, ParentType = ResolversParentTypes['Person']> = {
  email?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  hidden?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  name?: Resolver<ResolversTypes['PersonName'], ParentType, ContextType>;
  phone?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type PersonNameResolvers<ContextType = Context, ParentType = ResolversParentTypes['PersonName']> = {
  first?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  last?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
};

export type QueryResolvers<ContextType = Context, ParentType = ResolversParentTypes['Query']> = {
  account?: Resolver<ResolversTypes['AccountInterface'], ParentType, ContextType, RequireFields<QueryAccountArgs, 'id'>>;
  accountCard?: Resolver<ResolversTypes['AccountCard'], ParentType, ContextType, RequireFields<QueryAccountCardArgs, 'id'>>;
  accountCards?: Resolver<Array<ResolversTypes['AccountCard']>, ParentType, ContextType, Partial<QueryAccountCardsArgs>>;
  accounts?: Resolver<Array<ResolversTypes['AccountInterface']>, ParentType, ContextType, Partial<QueryAccountsArgs>>;
  attachment?: Resolver<Maybe<ResolversTypes['Attachment']>, ParentType, ContextType, RequireFields<QueryAttachmentArgs, 'id'>>;
  attachments?: Resolver<Array<ResolversTypes['Attachment']>, ParentType, ContextType, Partial<QueryAttachmentsArgs>>;
  auditLog?: Resolver<Array<ResolversTypes['AuditLogEntry']>, ParentType, ContextType, Partial<QueryAuditLogArgs>>;
  budget?: Resolver<ResolversTypes['Budget'], ParentType, ContextType, RequireFields<QueryBudgetArgs, 'id'>>;
  budgets?: Resolver<Array<ResolversTypes['Budget']>, ParentType, ContextType, Partial<QueryBudgetsArgs>>;
  business?: Resolver<ResolversTypes['Business'], ParentType, ContextType, RequireFields<QueryBusinessArgs, 'id'>>;
  businesses?: Resolver<Array<ResolversTypes['Business']>, ParentType, ContextType, Partial<QueryBusinessesArgs>>;
  categories?: Resolver<Array<ResolversTypes['Category']>, ParentType, ContextType, Partial<QueryCategoriesArgs>>;
  category?: Resolver<ResolversTypes['Category'], ParentType, ContextType, RequireFields<QueryCategoryArgs, 'id'>>;
  categoryGroups?: Resolver<Array<ResolversTypes['String']>, ParentType, ContextType>;
  department?: Resolver<ResolversTypes['Department'], ParentType, ContextType, RequireFields<QueryDepartmentArgs, 'id'>>;
  departments?: Resolver<Array<ResolversTypes['Department']>, ParentType, ContextType, Partial<QueryDepartmentsArgs>>;
  entities?: Resolver<Array<ResolversTypes['Entity']>, ParentType, ContextType, RequireFields<QueryEntitiesArgs, 'where'>>;
  entries?: Resolver<Array<ResolversTypes['Entry']>, ParentType, ContextType, RequireFields<QueryEntriesArgs, 'filterRefunds' | 'limit' | 'offset'>>;
  entriesCount?: Resolver<ResolversTypes['Int'], ParentType, ContextType, Partial<QueryEntriesCountArgs>>;
  entriesSummary?: Resolver<ResolversTypes['EntriesSummary'], ParentType, ContextType, Partial<QueryEntriesSummaryArgs>>;
  entry?: Resolver<Maybe<ResolversTypes['Entry']>, ParentType, ContextType, RequireFields<QueryEntryArgs, 'id'>>;
  entryItem?: Resolver<Maybe<ResolversTypes['EntryItem']>, ParentType, ContextType, RequireFields<QueryEntryItemArgs, 'id'>>;
  entryRefund?: Resolver<Maybe<ResolversTypes['EntryRefund']>, ParentType, ContextType, RequireFields<QueryEntryRefundArgs, 'id'>>;
  entryRefunds?: Resolver<Array<ResolversTypes['EntryRefund']>, ParentType, ContextType, Partial<QueryEntryRefundsArgs>>;
  exportFiscalYear?: Resolver<ResolversTypes['FiscalYearExport'], ParentType, ContextType, RequireFields<QueryExportFiscalYearArgs, 'id'>>;
  fiscalYear?: Resolver<ResolversTypes['FiscalYear'], ParentType, ContextType, RequireFields<QueryFiscalYearArgs, 'id'>>;
  fiscalYears?: Resolver<Array<ResolversTypes['FiscalYear']>, ParentType, ContextType, Partial<QueryFiscalYearsArgs>>;
  googleAuthUrl?: Resolver<ResolversTypes['GoogleAuthUrl'], ParentType, ContextType>;
  me?: Resolver<Maybe<ResolversTypes['AuthUser']>, ParentType, ContextType>;
  people?: Resolver<Array<ResolversTypes['Person']>, ParentType, ContextType, Partial<QueryPeopleArgs>>;
  person?: Resolver<ResolversTypes['Person'], ParentType, ContextType, RequireFields<QueryPersonArgs, 'id'>>;
  searchEntries?: Resolver<Array<ResolversTypes['Entry']>, ParentType, ContextType, RequireFields<QuerySearchEntriesArgs, 'limit' | 'query'>>;
  sources?: Resolver<Array<ResolversTypes['Source']>, ParentType, ContextType, RequireFields<QuerySourcesArgs, 'searchByName'>>;
  user?: Resolver<Maybe<ResolversTypes['AuthUser']>, ParentType, ContextType, RequireFields<QueryUserArgs, 'id'>>;
  users?: Resolver<Array<ResolversTypes['AuthUser']>, ParentType, ContextType, Partial<QueryUsersArgs>>;
};

export interface RationalScalarConfig extends GraphQLScalarTypeConfig<ResolversTypes['Rational'], any> {
  name: 'Rational';
}

export type ReconcileEntriesPayloadResolvers<ContextType = Context, ParentType = ResolversParentTypes['ReconcileEntriesPayload']> = {
  reconciledEntries?: Resolver<Array<ResolversTypes['Entry']>, ParentType, ContextType>;
  reconciledRefunds?: Resolver<Array<ResolversTypes['EntryRefund']>, ParentType, ContextType>;
};

export type RestoreFiscalYearPayloadResolvers<ContextType = Context, ParentType = ResolversParentTypes['RestoreFiscalYearPayload']> = {
  budgetsRestored?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  entriesRestored?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  fiscalYear?: Resolver<ResolversTypes['FiscalYear'], ParentType, ContextType>;
};

export type SourceResolvers<ContextType = Context, ParentType = ResolversParentTypes['Source']> = {
  __resolveType?: TypeResolveFn<'Business' | 'Department' | 'Person', ParentType, ContextType>;
};

export type SubscriptionResolvers<ContextType = Context, ParentType = ResolversParentTypes['Subscription']> = {
  entryAdded?: SubscriptionResolver<ResolversTypes['Entry'], "entryAdded", ParentType, ContextType>;
  entryUpdated?: SubscriptionResolver<ResolversTypes['Entry'], "entryUpdated", ParentType, ContextType>;
  entryUpserted?: SubscriptionResolver<ResolversTypes['Entry'], "entryUpserted", ParentType, ContextType>;
};

export type UpdateBusinessPayloadResolvers<ContextType = Context, ParentType = ResolversParentTypes['UpdateBusinessPayload']> = {
  business?: Resolver<ResolversTypes['Business'], ParentType, ContextType>;
};

export type UpdateCategoryPayloadResolvers<ContextType = Context, ParentType = ResolversParentTypes['UpdateCategoryPayload']> = {
  category?: Resolver<ResolversTypes['Category'], ParentType, ContextType>;
};

export type UpdateEntryPayloadResolvers<ContextType = Context, ParentType = ResolversParentTypes['UpdateEntryPayload']> = {
  updatedEntry?: Resolver<ResolversTypes['Entry'], ParentType, ContextType>;
};

export type UpdateEntryRefundPayloadResolvers<ContextType = Context, ParentType = ResolversParentTypes['UpdateEntryRefundPayload']> = {
  updatedEntryRefund?: Resolver<ResolversTypes['EntryRefund'], ParentType, ContextType>;
};

export type UpdatePersonPayloadResolvers<ContextType = Context, ParentType = ResolversParentTypes['UpdatePersonPayload']> = {
  person?: Resolver<ResolversTypes['Person'], ParentType, ContextType>;
};

export interface UploadScalarConfig extends GraphQLScalarTypeConfig<ResolversTypes['Upload'], any> {
  name: 'Upload';
}

export type UploadReceiptPayloadResolvers<ContextType = Context, ParentType = ResolversParentTypes['UploadReceiptPayload']> = {
  attachment?: Resolver<ResolversTypes['Attachment'], ParentType, ContextType>;
};

export type UpsertBudgetResultResolvers<ContextType = Context, ParentType = ResolversParentTypes['UpsertBudgetResult']> = {
  budget?: Resolver<ResolversTypes['Budget'], ParentType, ContextType>;
};

export type UserResolvers<ContextType = Context, ParentType = ResolversParentTypes['User']> = {
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  user?: Resolver<ResolversTypes['Person'], ParentType, ContextType>;
};

export type UserPermissionResolvers<ContextType = Context, ParentType = ResolversParentTypes['UserPermission']> = {
  accessLevel?: Resolver<ResolversTypes['AccessLevel'], ParentType, ContextType>;
  department?: Resolver<ResolversTypes['Department'], ParentType, ContextType>;
  grantedAt?: Resolver<ResolversTypes['Date'], ParentType, ContextType>;
  grantedBy?: Resolver<ResolversTypes['AuthUser'], ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  user?: Resolver<ResolversTypes['AuthUser'], ParentType, ContextType>;
};

export type VendorResolvers<ContextType = Context, ParentType = ResolversParentTypes['Vendor']> = {
  approved?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  vendorId?: Resolver<Maybe<ResolversTypes['ID']>, ParentType, ContextType>;
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
  ArchiveFiscalYearPayload?: ArchiveFiscalYearPayloadResolvers<ContextType>;
  Attachment?: AttachmentResolvers<ContextType>;
  AuditLogEntry?: AuditLogEntryResolvers<ContextType>;
  AuthPayload?: AuthPayloadResolvers<ContextType>;
  AuthUser?: AuthUserResolvers<ContextType>;
  Budget?: BudgetResolvers<ContextType>;
  BudgetOwner?: BudgetOwnerResolvers<ContextType>;
  Business?: BusinessResolvers<ContextType>;
  Category?: CategoryResolvers<ContextType>;
  CreateFiscalYearPayload?: CreateFiscalYearPayloadResolvers<ContextType>;
  Date?: GraphQLScalarType;
  DeleteAttachmentPayload?: DeleteAttachmentPayloadResolvers<ContextType>;
  DeleteBudgetResult?: DeleteBudgetResultResolvers<ContextType>;
  DeleteEntryPayload?: DeleteEntryPayloadResolvers<ContextType>;
  DeleteEntryRefundPayload?: DeleteEntryRefundPayloadResolvers<ContextType>;
  DeleteFiscalYearPayload?: DeleteFiscalYearPayloadResolvers<ContextType>;
  Department?: DepartmentResolvers<ContextType>;
  DepartmentAncestor?: DepartmentAncestorResolvers<ContextType>;
  EditHistoryEntry?: EditHistoryEntryResolvers<ContextType>;
  Entity?: EntityResolvers<ContextType>;
  EntriesSummary?: EntriesSummaryResolvers<ContextType>;
  Entry?: EntryResolvers<ContextType>;
  EntryDateOfRecord?: EntryDateOfRecordResolvers<ContextType>;
  EntryItem?: EntryItemResolvers<ContextType>;
  EntryRefund?: EntryRefundResolvers<ContextType>;
  FiscalYear?: FiscalYearResolvers<ContextType>;
  FiscalYearExport?: FiscalYearExportResolvers<ContextType>;
  GoogleAuthUrl?: GoogleAuthUrlResolvers<ContextType>;
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
  RestoreFiscalYearPayload?: RestoreFiscalYearPayloadResolvers<ContextType>;
  Source?: SourceResolvers<ContextType>;
  Subscription?: SubscriptionResolvers<ContextType>;
  UpdateBusinessPayload?: UpdateBusinessPayloadResolvers<ContextType>;
  UpdateCategoryPayload?: UpdateCategoryPayloadResolvers<ContextType>;
  UpdateEntryPayload?: UpdateEntryPayloadResolvers<ContextType>;
  UpdateEntryRefundPayload?: UpdateEntryRefundPayloadResolvers<ContextType>;
  UpdatePersonPayload?: UpdatePersonPayloadResolvers<ContextType>;
  Upload?: GraphQLScalarType;
  UploadReceiptPayload?: UploadReceiptPayloadResolvers<ContextType>;
  UpsertBudgetResult?: UpsertBudgetResultResolvers<ContextType>;
  User?: UserResolvers<ContextType>;
  UserPermission?: UserPermissionResolvers<ContextType>;
  Vendor?: VendorResolvers<ContextType>;
};

