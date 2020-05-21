import { GraphQLResolveInfo } from 'graphql';
import { Context } from './types';
export type Maybe<T> = T | null;
export type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>;
export type RequireFields<T, K extends keyof T> = { [X in Exclude<keyof T, K>]?: T[X] } & { [P in K]-?: NonNullable<T[P]> };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: string;
  String: string;
  Boolean: boolean;
  Int: number;
  Float: number;
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
  department?: Maybe<JournalEntriesWhereDepartment>;
  reconciled?: Maybe<Scalars['Boolean']>;
  deleted?: Maybe<Scalars['Boolean']>;
  lastUpdate?: Maybe<JournalEntriesWhereLastUpdate>;
  lastUpdateRefund?: Maybe<JournalEntriesWhereLastUpdate>;
  or?: Maybe<Array<Maybe<JournalEntiresWhereInput>>>;
  and?: Maybe<Array<Maybe<JournalEntiresWhereInput>>>;
};

/** Where */
export type JournalEntriesWhereDepartment = {
  eq?: Maybe<Scalars['ID']>;
  ne?: Maybe<Scalars['ID']>;
  in?: Maybe<Array<Maybe<Scalars['ID']>>>;
  nin?: Maybe<Array<Maybe<Scalars['ID']>>>;
  matchDecedentTree?: Maybe<Scalars['Boolean']>;
};

export type JournalEntriesWhereLastUpdate = {
  gt?: Maybe<Scalars['String']>;
  lt?: Maybe<Scalars['String']>;
  gte?: Maybe<Scalars['String']>;
  lte?: Maybe<Scalars['String']>;
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
  total: Rational;
  lastUpdate: Scalars['String'];
  deleted: Scalars['Boolean'];
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

export type JournEntryItemUpsertResult = {
   __typename?: 'JournEntryItemUpsertResult';
  journalEntryItem: JournalEntryItem;
  journalEntry: JournalEntry;
};

export type Mutation = {
   __typename?: 'Mutation';
  addBusiness: Business;
  addPerson: Person;
  journalEntryAdd: JournalEntry;
  journalEntryAddItem: JournEntryItemUpsertResult;
  journalEntryAddRefund: JournalEntry;
  journalEntryDelete: JournalEntry;
  journalEntryDeleteItem: JournEntryItemUpsertResult;
  journalEntryDeleteRefund: JournalEntry;
  journalEntryUpdate: JournalEntry;
  journalEntryUpdateItem: JournEntryItemUpsertResult;
  journalEntryUpdateRefund: JournalEntry;
  paymentMethodAdd: PaymentMethod;
  paymentMethodUpdate: PaymentMethod;
};


export type MutationAddBusinessArgs = {
  fields: BusinessAddFields;
};


export type MutationAddPersonArgs = {
  fields: PersonAddFields;
};


export type MutationJournalEntryAddArgs = {
  fields: JournalEntryAddFields;
  paymentMethodAdd?: Maybe<PaymentMethodAddFields>;
  personAdd?: Maybe<PersonAddFields>;
  businessAdd?: Maybe<BusinessAddFields>;
};


export type MutationJournalEntryAddItemArgs = {
  id: Scalars['ID'];
  fields: JournalEntryAddItemFields;
};


export type MutationJournalEntryAddRefundArgs = {
  id: Scalars['ID'];
  fields: JournalEntryAddRefundFields;
  paymentMethodAdd?: Maybe<PaymentMethodAddFields>;
};


export type MutationJournalEntryDeleteArgs = {
  id: Scalars['ID'];
};


export type MutationJournalEntryDeleteItemArgs = {
  id: Scalars['ID'];
};


export type MutationJournalEntryDeleteRefundArgs = {
  id: Scalars['ID'];
};


export type MutationJournalEntryUpdateArgs = {
  id: Scalars['ID'];
  fields: JournalEntryUpdateFields;
  paymentMethodAdd?: Maybe<PaymentMethodAddFields>;
  paymentMethodUpdate?: Maybe<JournalEntryUpdatePaymentMethod>;
  personAdd?: Maybe<PersonAddFields>;
  businessAdd?: Maybe<BusinessAddFields>;
};


export type MutationJournalEntryUpdateItemArgs = {
  id: Scalars['ID'];
  fields: JournalEntryUpdateItemFields;
};


export type MutationJournalEntryUpdateRefundArgs = {
  id: Scalars['ID'];
  fields: JournalEntryUpdateRefundFields;
  paymentMethodAdd?: Maybe<PaymentMethodAddFields>;
  paymentMethodUpdate?: Maybe<JournalEntryUpdatePaymentMethod>;
};


export type MutationPaymentMethodAddArgs = {
  fields: PaymentMethodAddFields;
};


export type MutationPaymentMethodUpdateArgs = {
  id: Scalars['ID'];
  fields: PaymentMethodUpdateFields;
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
  num: Scalars['Int'];
  den: Scalars['Int'];
};

export type RationalInput = {
  num: Scalars['Int'];
  den: Scalars['Int'];
};

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

export type WhereRegexInput = {
  pattern: Scalars['String'];
  flags?: Maybe<Scalars['String']>;
};



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

export type isTypeOfResolverFn<T = {}> = (obj: T, info: GraphQLResolveInfo) => boolean | Promise<boolean>;

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
  Query: ResolverTypeWrapper<{}>,
  ID: ResolverTypeWrapper<Scalars['ID']>,
  Budget: ResolverTypeWrapper<Omit<Budget, 'owner'> & { owner: ResolversTypes['BudgetOwner'] }>,
  Rational: ResolverTypeWrapper<Rational>,
  Int: ResolverTypeWrapper<Scalars['Int']>,
  BudgetOwner: ResolversTypes['Department'] | ResolversTypes['Business'],
  Department: ResolverTypeWrapper<Omit<Department, 'parent' | 'ancestors'> & { parent: ResolversTypes['DepartmentAncestor'], ancestors: Array<ResolversTypes['DepartmentAncestor']> }>,
  String: ResolverTypeWrapper<Scalars['String']>,
  Business: ResolverTypeWrapper<Business>,
  Vendor: ResolverTypeWrapper<Vendor>,
  Boolean: ResolverTypeWrapper<Scalars['Boolean']>,
  DepartmentAncestor: ResolversTypes['Department'] | ResolversTypes['Business'],
  JournalEntiresWhereInput: JournalEntiresWhereInput,
  JournalEntriesWhereDepartment: JournalEntriesWhereDepartment,
  JournalEntriesWhereLastUpdate: JournalEntriesWhereLastUpdate,
  JournalEntry: ResolverTypeWrapper<Omit<JournalEntry, 'source'> & { source: ResolversTypes['JournalEntrySource'] }>,
  JournalEntryRefund: ResolverTypeWrapper<JournalEntryRefund>,
  PaymentMethod: ResolverTypeWrapper<PaymentMethod>,
  PaymentMethodAuthorization: ResolverTypeWrapper<Omit<PaymentMethodAuthorization, 'entity'> & { entity?: Maybe<ResolversTypes['PaymentMethodAuthorizedEntity']> }>,
  PaymentMethodAuthorizedEntity: ResolversTypes['Person'] | ResolversTypes['Business'] | ResolversTypes['Department'],
  Person: ResolverTypeWrapper<Person>,
  PersonName: ResolverTypeWrapper<PersonName>,
  JournalEntryItem: ResolverTypeWrapper<JournalEntryItem>,
  JournalEntryCategory: ResolverTypeWrapper<JournalEntryCategory>,
  JournalEntryType: JournalEntryType,
  JournalEntrySource: ResolversTypes['Person'] | ResolversTypes['Business'] | ResolversTypes['Department'],
  JournalEntryCategoryWhereInput: JournalEntryCategoryWhereInput,
  JournalEntryCategoryWhereNameInput: JournalEntryCategoryWhereNameInput,
  JournalEntryCategoryWhereTypeInput: JournalEntryCategoryWhereTypeInput,
  JournalEntryCategoryWhereParentInput: JournalEntryCategoryWhereParentInput,
  PaymentMethodWhereInput: PaymentMethodWhereInput,
  PaymentMethodWhereRefIdInput: PaymentMethodWhereRefIdInput,
  PaymentMethodWhereNameInput: PaymentMethodWhereNameInput,
  PaymentMethodWhereParentInput: PaymentMethodWhereParentInput,
  PersonNameInput: PersonNameInput,
  Mutation: ResolverTypeWrapper<{}>,
  BusinessAddFields: BusinessAddFields,
  PersonAddFields: PersonAddFields,
  JournalEntryAddFields: JournalEntryAddFields,
  RationalInput: RationalInput,
  JournalEntrySourceInput: JournalEntrySourceInput,
  JournalEntrySourceType: JournalEntrySourceType,
  PaymentMethodAddFields: PaymentMethodAddFields,
  JournalEntryAddItemFields: JournalEntryAddItemFields,
  JournEntryItemUpsertResult: ResolverTypeWrapper<JournEntryItemUpsertResult>,
  JournalEntryAddRefundFields: JournalEntryAddRefundFields,
  JournalEntryUpdateFields: JournalEntryUpdateFields,
  JournalEntryUpdatePaymentMethod: JournalEntryUpdatePaymentMethod,
  PaymentMethodUpdateFields: PaymentMethodUpdateFields,
  JournalEntryUpdateItemFields: JournalEntryUpdateItemFields,
  JournalEntryUpdateRefundFields: JournalEntryUpdateRefundFields,
  Subscription: ResolverTypeWrapper<{}>,
  DepartmentAddFields: DepartmentAddFields,
  SortDirection: SortDirection,
  FilterType: FilterType,
  PaginateInput: PaginateInput,
  ByIdFilter: ByIdFilter,
  WhereRegexInput: WhereRegexInput,
  User: ResolverTypeWrapper<User>,
};

/** Mapping between all available schema types and the resolvers parents */
export type ResolversParentTypes = {
  Query: {},
  ID: Scalars['ID'],
  Budget: Omit<Budget, 'owner'> & { owner: ResolversParentTypes['BudgetOwner'] },
  Rational: Rational,
  Int: Scalars['Int'],
  BudgetOwner: ResolversParentTypes['Department'] | ResolversParentTypes['Business'],
  Department: Omit<Department, 'parent' | 'ancestors'> & { parent: ResolversParentTypes['DepartmentAncestor'], ancestors: Array<ResolversParentTypes['DepartmentAncestor']> },
  String: Scalars['String'],
  Business: Business,
  Vendor: Vendor,
  Boolean: Scalars['Boolean'],
  DepartmentAncestor: ResolversParentTypes['Department'] | ResolversParentTypes['Business'],
  JournalEntiresWhereInput: JournalEntiresWhereInput,
  JournalEntriesWhereDepartment: JournalEntriesWhereDepartment,
  JournalEntriesWhereLastUpdate: JournalEntriesWhereLastUpdate,
  JournalEntry: Omit<JournalEntry, 'source'> & { source: ResolversParentTypes['JournalEntrySource'] },
  JournalEntryRefund: JournalEntryRefund,
  PaymentMethod: PaymentMethod,
  PaymentMethodAuthorization: Omit<PaymentMethodAuthorization, 'entity'> & { entity?: Maybe<ResolversParentTypes['PaymentMethodAuthorizedEntity']> },
  PaymentMethodAuthorizedEntity: ResolversParentTypes['Person'] | ResolversParentTypes['Business'] | ResolversParentTypes['Department'],
  Person: Person,
  PersonName: PersonName,
  JournalEntryItem: JournalEntryItem,
  JournalEntryCategory: JournalEntryCategory,
  JournalEntryType: JournalEntryType,
  JournalEntrySource: ResolversParentTypes['Person'] | ResolversParentTypes['Business'] | ResolversParentTypes['Department'],
  JournalEntryCategoryWhereInput: JournalEntryCategoryWhereInput,
  JournalEntryCategoryWhereNameInput: JournalEntryCategoryWhereNameInput,
  JournalEntryCategoryWhereTypeInput: JournalEntryCategoryWhereTypeInput,
  JournalEntryCategoryWhereParentInput: JournalEntryCategoryWhereParentInput,
  PaymentMethodWhereInput: PaymentMethodWhereInput,
  PaymentMethodWhereRefIdInput: PaymentMethodWhereRefIdInput,
  PaymentMethodWhereNameInput: PaymentMethodWhereNameInput,
  PaymentMethodWhereParentInput: PaymentMethodWhereParentInput,
  PersonNameInput: PersonNameInput,
  Mutation: {},
  BusinessAddFields: BusinessAddFields,
  PersonAddFields: PersonAddFields,
  JournalEntryAddFields: JournalEntryAddFields,
  RationalInput: RationalInput,
  JournalEntrySourceInput: JournalEntrySourceInput,
  JournalEntrySourceType: JournalEntrySourceType,
  PaymentMethodAddFields: PaymentMethodAddFields,
  JournalEntryAddItemFields: JournalEntryAddItemFields,
  JournEntryItemUpsertResult: JournEntryItemUpsertResult,
  JournalEntryAddRefundFields: JournalEntryAddRefundFields,
  JournalEntryUpdateFields: JournalEntryUpdateFields,
  JournalEntryUpdatePaymentMethod: JournalEntryUpdatePaymentMethod,
  PaymentMethodUpdateFields: PaymentMethodUpdateFields,
  JournalEntryUpdateItemFields: JournalEntryUpdateItemFields,
  JournalEntryUpdateRefundFields: JournalEntryUpdateRefundFields,
  Subscription: {},
  DepartmentAddFields: DepartmentAddFields,
  SortDirection: SortDirection,
  FilterType: FilterType,
  PaginateInput: PaginateInput,
  ByIdFilter: ByIdFilter,
  WhereRegexInput: WhereRegexInput,
  User: User,
};

export type BudgetResolvers<ContextType = Context, ParentType extends ResolversParentTypes['Budget'] = ResolversParentTypes['Budget']> = {
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>,
  amount?: Resolver<ResolversTypes['Rational'], ParentType, ContextType>,
  owner?: Resolver<ResolversTypes['BudgetOwner'], ParentType, ContextType>,
  __isTypeOf?: isTypeOfResolverFn<ParentType>,
};

export type BudgetOwnerResolvers<ContextType = Context, ParentType extends ResolversParentTypes['BudgetOwner'] = ResolversParentTypes['BudgetOwner']> = {
  __resolveType: TypeResolveFn<'Department' | 'Business', ParentType, ContextType>
};

export type BusinessResolvers<ContextType = Context, ParentType extends ResolversParentTypes['Business'] = ResolversParentTypes['Business']> = {
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>,
  name?: Resolver<ResolversTypes['String'], ParentType, ContextType>,
  budget?: Resolver<Maybe<ResolversTypes['Budget']>, ParentType, ContextType>,
  departments?: Resolver<Array<ResolversTypes['Department']>, ParentType, ContextType>,
  vendor?: Resolver<Maybe<ResolversTypes['Vendor']>, ParentType, ContextType>,
  __isTypeOf?: isTypeOfResolverFn<ParentType>,
};

export type DepartmentResolvers<ContextType = Context, ParentType extends ResolversParentTypes['Department'] = ResolversParentTypes['Department']> = {
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>,
  name?: Resolver<ResolversTypes['String'], ParentType, ContextType>,
  code?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>,
  budget?: Resolver<Maybe<ResolversTypes['Budget']>, ParentType, ContextType>,
  business?: Resolver<ResolversTypes['Business'], ParentType, ContextType>,
  parent?: Resolver<ResolversTypes['DepartmentAncestor'], ParentType, ContextType>,
  ancestors?: Resolver<Array<ResolversTypes['DepartmentAncestor']>, ParentType, ContextType>,
  descendants?: Resolver<Array<ResolversTypes['Department']>, ParentType, ContextType>,
  virtualRoot?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>,
  __isTypeOf?: isTypeOfResolverFn<ParentType>,
};

export type DepartmentAncestorResolvers<ContextType = Context, ParentType extends ResolversParentTypes['DepartmentAncestor'] = ResolversParentTypes['DepartmentAncestor']> = {
  __resolveType: TypeResolveFn<'Department' | 'Business', ParentType, ContextType>
};

export type JournalEntryResolvers<ContextType = Context, ParentType extends ResolversParentTypes['JournalEntry'] = ResolversParentTypes['JournalEntry']> = {
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>,
  refunds?: Resolver<Array<ResolversTypes['JournalEntryRefund']>, ParentType, ContextType>,
  items?: Resolver<Array<ResolversTypes['JournalEntryItem']>, ParentType, ContextType>,
  type?: Resolver<ResolversTypes['JournalEntryType'], ParentType, ContextType>,
  date?: Resolver<ResolversTypes['String'], ParentType, ContextType>,
  department?: Resolver<ResolversTypes['Department'], ParentType, ContextType>,
  category?: Resolver<ResolversTypes['JournalEntryCategory'], ParentType, ContextType>,
  paymentMethod?: Resolver<ResolversTypes['PaymentMethod'], ParentType, ContextType>,
  description?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>,
  total?: Resolver<ResolversTypes['Rational'], ParentType, ContextType>,
  source?: Resolver<ResolversTypes['JournalEntrySource'], ParentType, ContextType>,
  reconciled?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>,
  lastUpdate?: Resolver<ResolversTypes['String'], ParentType, ContextType>,
  deleted?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>,
  __isTypeOf?: isTypeOfResolverFn<ParentType>,
};

export type JournalEntryCategoryResolvers<ContextType = Context, ParentType extends ResolversParentTypes['JournalEntryCategory'] = ResolversParentTypes['JournalEntryCategory']> = {
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>,
  name?: Resolver<ResolversTypes['String'], ParentType, ContextType>,
  type?: Resolver<ResolversTypes['JournalEntryType'], ParentType, ContextType>,
  parent?: Resolver<Maybe<ResolversTypes['JournalEntryCategory']>, ParentType, ContextType>,
  ancestors?: Resolver<Array<ResolversTypes['JournalEntryCategory']>, ParentType, ContextType>,
  children?: Resolver<Array<ResolversTypes['JournalEntryCategory']>, ParentType, ContextType>,
  __isTypeOf?: isTypeOfResolverFn<ParentType>,
};

export type JournalEntryItemResolvers<ContextType = Context, ParentType extends ResolversParentTypes['JournalEntryItem'] = ResolversParentTypes['JournalEntryItem']> = {
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>,
  department?: Resolver<Maybe<ResolversTypes['Department']>, ParentType, ContextType>,
  category?: Resolver<Maybe<ResolversTypes['JournalEntryCategory']>, ParentType, ContextType>,
  description?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>,
  total?: Resolver<ResolversTypes['Rational'], ParentType, ContextType>,
  lastUpdate?: Resolver<ResolversTypes['String'], ParentType, ContextType>,
  deleted?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>,
  __isTypeOf?: isTypeOfResolverFn<ParentType>,
};

export type JournalEntryRefundResolvers<ContextType = Context, ParentType extends ResolversParentTypes['JournalEntryRefund'] = ResolversParentTypes['JournalEntryRefund']> = {
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>,
  date?: Resolver<ResolversTypes['String'], ParentType, ContextType>,
  description?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>,
  paymentMethod?: Resolver<ResolversTypes['PaymentMethod'], ParentType, ContextType>,
  total?: Resolver<ResolversTypes['Rational'], ParentType, ContextType>,
  reconciled?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>,
  lastUpdate?: Resolver<ResolversTypes['String'], ParentType, ContextType>,
  deleted?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>,
  __isTypeOf?: isTypeOfResolverFn<ParentType>,
};

export type JournalEntrySourceResolvers<ContextType = Context, ParentType extends ResolversParentTypes['JournalEntrySource'] = ResolversParentTypes['JournalEntrySource']> = {
  __resolveType: TypeResolveFn<'Person' | 'Business' | 'Department', ParentType, ContextType>
};

export type JournEntryItemUpsertResultResolvers<ContextType = Context, ParentType extends ResolversParentTypes['JournEntryItemUpsertResult'] = ResolversParentTypes['JournEntryItemUpsertResult']> = {
  journalEntryItem?: Resolver<ResolversTypes['JournalEntryItem'], ParentType, ContextType>,
  journalEntry?: Resolver<ResolversTypes['JournalEntry'], ParentType, ContextType>,
  __isTypeOf?: isTypeOfResolverFn<ParentType>,
};

export type MutationResolvers<ContextType = Context, ParentType extends ResolversParentTypes['Mutation'] = ResolversParentTypes['Mutation']> = {
  addBusiness?: Resolver<ResolversTypes['Business'], ParentType, ContextType, RequireFields<MutationAddBusinessArgs, 'fields'>>,
  addPerson?: Resolver<ResolversTypes['Person'], ParentType, ContextType, RequireFields<MutationAddPersonArgs, 'fields'>>,
  journalEntryAdd?: Resolver<ResolversTypes['JournalEntry'], ParentType, ContextType, RequireFields<MutationJournalEntryAddArgs, 'fields'>>,
  journalEntryAddItem?: Resolver<ResolversTypes['JournEntryItemUpsertResult'], ParentType, ContextType, RequireFields<MutationJournalEntryAddItemArgs, 'id' | 'fields'>>,
  journalEntryAddRefund?: Resolver<ResolversTypes['JournalEntry'], ParentType, ContextType, RequireFields<MutationJournalEntryAddRefundArgs, 'id' | 'fields'>>,
  journalEntryDelete?: Resolver<ResolversTypes['JournalEntry'], ParentType, ContextType, RequireFields<MutationJournalEntryDeleteArgs, 'id'>>,
  journalEntryDeleteItem?: Resolver<ResolversTypes['JournEntryItemUpsertResult'], ParentType, ContextType, RequireFields<MutationJournalEntryDeleteItemArgs, 'id'>>,
  journalEntryDeleteRefund?: Resolver<ResolversTypes['JournalEntry'], ParentType, ContextType, RequireFields<MutationJournalEntryDeleteRefundArgs, 'id'>>,
  journalEntryUpdate?: Resolver<ResolversTypes['JournalEntry'], ParentType, ContextType, RequireFields<MutationJournalEntryUpdateArgs, 'id' | 'fields'>>,
  journalEntryUpdateItem?: Resolver<ResolversTypes['JournEntryItemUpsertResult'], ParentType, ContextType, RequireFields<MutationJournalEntryUpdateItemArgs, 'id' | 'fields'>>,
  journalEntryUpdateRefund?: Resolver<ResolversTypes['JournalEntry'], ParentType, ContextType, RequireFields<MutationJournalEntryUpdateRefundArgs, 'id' | 'fields'>>,
  paymentMethodAdd?: Resolver<ResolversTypes['PaymentMethod'], ParentType, ContextType, RequireFields<MutationPaymentMethodAddArgs, 'fields'>>,
  paymentMethodUpdate?: Resolver<ResolversTypes['PaymentMethod'], ParentType, ContextType, RequireFields<MutationPaymentMethodUpdateArgs, 'id' | 'fields'>>,
};

export type PaymentMethodResolvers<ContextType = Context, ParentType extends ResolversParentTypes['PaymentMethod'] = ResolversParentTypes['PaymentMethod']> = {
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>,
  active?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>,
  refId?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>,
  name?: Resolver<ResolversTypes['String'], ParentType, ContextType>,
  parent?: Resolver<Maybe<ResolversTypes['PaymentMethod']>, ParentType, ContextType>,
  ancestors?: Resolver<Array<ResolversTypes['PaymentMethod']>, ParentType, ContextType>,
  children?: Resolver<Array<ResolversTypes['PaymentMethod']>, ParentType, ContextType>,
  allowChildren?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>,
  authorization?: Resolver<Array<ResolversTypes['PaymentMethodAuthorization']>, ParentType, ContextType>,
  __isTypeOf?: isTypeOfResolverFn<ParentType>,
};

export type PaymentMethodAuthorizationResolvers<ContextType = Context, ParentType extends ResolversParentTypes['PaymentMethodAuthorization'] = ResolversParentTypes['PaymentMethodAuthorization']> = {
  owner?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>,
  entity?: Resolver<Maybe<ResolversTypes['PaymentMethodAuthorizedEntity']>, ParentType, ContextType>,
  __isTypeOf?: isTypeOfResolverFn<ParentType>,
};

export type PaymentMethodAuthorizedEntityResolvers<ContextType = Context, ParentType extends ResolversParentTypes['PaymentMethodAuthorizedEntity'] = ResolversParentTypes['PaymentMethodAuthorizedEntity']> = {
  __resolveType: TypeResolveFn<'Person' | 'Business' | 'Department', ParentType, ContextType>
};

export type PersonResolvers<ContextType = Context, ParentType extends ResolversParentTypes['Person'] = ResolversParentTypes['Person']> = {
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>,
  name?: Resolver<ResolversTypes['PersonName'], ParentType, ContextType>,
  __isTypeOf?: isTypeOfResolverFn<ParentType>,
};

export type PersonNameResolvers<ContextType = Context, ParentType extends ResolversParentTypes['PersonName'] = ResolversParentTypes['PersonName']> = {
  first?: Resolver<ResolversTypes['String'], ParentType, ContextType>,
  last?: Resolver<ResolversTypes['String'], ParentType, ContextType>,
  __isTypeOf?: isTypeOfResolverFn<ParentType>,
};

export type QueryResolvers<ContextType = Context, ParentType extends ResolversParentTypes['Query'] = ResolversParentTypes['Query']> = {
  budget?: Resolver<ResolversTypes['Budget'], ParentType, ContextType, RequireFields<QueryBudgetArgs, 'id'>>,
  budgets?: Resolver<Array<ResolversTypes['Budget']>, ParentType, ContextType>,
  business?: Resolver<ResolversTypes['Business'], ParentType, ContextType, RequireFields<QueryBusinessArgs, 'id'>>,
  businesses?: Resolver<Array<ResolversTypes['Business']>, ParentType, ContextType, RequireFields<QueryBusinessesArgs, never>>,
  department?: Resolver<Maybe<ResolversTypes['Department']>, ParentType, ContextType, RequireFields<QueryDepartmentArgs, 'id'>>,
  departments?: Resolver<Array<ResolversTypes['Department']>, ParentType, ContextType, RequireFields<QueryDepartmentsArgs, never>>,
  journalEntries?: Resolver<Array<ResolversTypes['JournalEntry']>, ParentType, ContextType, RequireFields<QueryJournalEntriesArgs, never>>,
  journalEntry?: Resolver<Maybe<ResolversTypes['JournalEntry']>, ParentType, ContextType, RequireFields<QueryJournalEntryArgs, 'id'>>,
  journalEntryCategories?: Resolver<Array<ResolversTypes['JournalEntryCategory']>, ParentType, ContextType, RequireFields<QueryJournalEntryCategoriesArgs, never>>,
  journalEntryCategory?: Resolver<ResolversTypes['JournalEntryCategory'], ParentType, ContextType, RequireFields<QueryJournalEntryCategoryArgs, 'id'>>,
  journalEntryItem?: Resolver<Maybe<ResolversTypes['JournalEntryItem']>, ParentType, ContextType, RequireFields<QueryJournalEntryItemArgs, 'id'>>,
  journalEntryRefund?: Resolver<Maybe<ResolversTypes['JournalEntryRefund']>, ParentType, ContextType, RequireFields<QueryJournalEntryRefundArgs, 'id'>>,
  journalEntrySources?: Resolver<Array<ResolversTypes['JournalEntrySource']>, ParentType, ContextType, RequireFields<QueryJournalEntrySourcesArgs, 'searchByName'>>,
  paymentMethod?: Resolver<Maybe<ResolversTypes['PaymentMethod']>, ParentType, ContextType, RequireFields<QueryPaymentMethodArgs, 'id'>>,
  paymentMethods?: Resolver<Array<ResolversTypes['PaymentMethod']>, ParentType, ContextType, RequireFields<QueryPaymentMethodsArgs, never>>,
  people?: Resolver<Array<ResolversTypes['Person']>, ParentType, ContextType, RequireFields<QueryPeopleArgs, never>>,
};

export type RationalResolvers<ContextType = Context, ParentType extends ResolversParentTypes['Rational'] = ResolversParentTypes['Rational']> = {
  num?: Resolver<ResolversTypes['Int'], ParentType, ContextType>,
  den?: Resolver<ResolversTypes['Int'], ParentType, ContextType>,
  __isTypeOf?: isTypeOfResolverFn<ParentType>,
};

export type SubscriptionResolvers<ContextType = Context, ParentType extends ResolversParentTypes['Subscription'] = ResolversParentTypes['Subscription']> = {
  journalEntryAdded?: SubscriptionResolver<ResolversTypes['JournalEntry'], "journalEntryAdded", ParentType, ContextType>,
  journalEntryUpdated?: SubscriptionResolver<ResolversTypes['JournalEntry'], "journalEntryUpdated", ParentType, ContextType>,
  journalEntryUpserted?: SubscriptionResolver<ResolversTypes['JournalEntry'], "journalEntryUpserted", ParentType, ContextType>,
};

export type UserResolvers<ContextType = Context, ParentType extends ResolversParentTypes['User'] = ResolversParentTypes['User']> = {
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>,
  user?: Resolver<ResolversTypes['Person'], ParentType, ContextType>,
  __isTypeOf?: isTypeOfResolverFn<ParentType>,
};

export type VendorResolvers<ContextType = Context, ParentType extends ResolversParentTypes['Vendor'] = ResolversParentTypes['Vendor']> = {
  approved?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>,
  vendorId?: Resolver<Maybe<ResolversTypes['ID']>, ParentType, ContextType>,
  __isTypeOf?: isTypeOfResolverFn<ParentType>,
};

export type Resolvers<ContextType = Context> = {
  Budget?: BudgetResolvers<ContextType>,
  BudgetOwner?: BudgetOwnerResolvers,
  Business?: BusinessResolvers<ContextType>,
  Department?: DepartmentResolvers<ContextType>,
  DepartmentAncestor?: DepartmentAncestorResolvers,
  JournalEntry?: JournalEntryResolvers<ContextType>,
  JournalEntryCategory?: JournalEntryCategoryResolvers<ContextType>,
  JournalEntryItem?: JournalEntryItemResolvers<ContextType>,
  JournalEntryRefund?: JournalEntryRefundResolvers<ContextType>,
  JournalEntrySource?: JournalEntrySourceResolvers,
  JournEntryItemUpsertResult?: JournEntryItemUpsertResultResolvers<ContextType>,
  Mutation?: MutationResolvers<ContextType>,
  PaymentMethod?: PaymentMethodResolvers<ContextType>,
  PaymentMethodAuthorization?: PaymentMethodAuthorizationResolvers<ContextType>,
  PaymentMethodAuthorizedEntity?: PaymentMethodAuthorizedEntityResolvers,
  Person?: PersonResolvers<ContextType>,
  PersonName?: PersonNameResolvers<ContextType>,
  Query?: QueryResolvers<ContextType>,
  Rational?: RationalResolvers<ContextType>,
  Subscription?: SubscriptionResolvers<ContextType>,
  User?: UserResolvers<ContextType>,
  Vendor?: VendorResolvers<ContextType>,
};


/**
 * @deprecated
 * Use "Resolvers" root object instead. If you wish to get "IResolvers", add "typesPrefix: I" to your config.
*/
export type IResolvers<ContextType = Context> = Resolvers<ContextType>;
