import { GraphQLResolveInfo } from 'graphql';
import { Context } from './types';
export type Maybe<T> = T | null;
export type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>;
export type RequireFields<T, K extends keyof T> = { [X in Exclude<keyof T, K>]?: T[X] } & { [P in K]-?: NonNullable<T[P]> };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: string,
  String: string,
  Boolean: boolean,
  Int: number,
  Float: number,
};

export type Budget = {
   __typename?: 'Budget',
  id: Scalars['ID'],
  amount: Rational,
  owner: BudgetOwner,
};

export type BudgetOwner = Department | Business;

export type Business = {
   __typename?: 'Business',
  id: Scalars['ID'],
  name: Scalars['String'],
  budget?: Maybe<Budget>,
  departments?: Maybe<Array<Department>>,
  vendor?: Maybe<Vendor>,
};

export type BusinessAddFields = {
  name: Scalars['String'],
};

export type ByIdFilter = {
  eq?: Maybe<Scalars['ID']>,
};

export type Department = {
   __typename?: 'Department',
  id: Scalars['ID'],
  name: Scalars['String'],
  code?: Maybe<Scalars['String']>,
  budget?: Maybe<Budget>,
  business: Business,
  parent: DepartmentAncestor,
  ancestors: Array<DepartmentAncestor>,
  descendants: Array<Department>,
  virtualRoot?: Maybe<Scalars['Boolean']>,
};

export type DepartmentAddFields = {
  name: Scalars['String'],
};

export type DepartmentAncestor = Department | Business;

export enum FilterType {
  Include = 'INCLUDE',
  Exclude = 'EXCLUDE'
}

export type JournalEntiresWhereInput = {
  department?: Maybe<JournalEntriesWhereDepartment>,
  reconciled?: Maybe<Scalars['Boolean']>,
  deleted?: Maybe<Scalars['Boolean']>,
  lastUpdate?: Maybe<JournalEntriesWhereLastUpdate>,
  or?: Maybe<Array<Maybe<JournalEntiresWhereInput>>>,
  and?: Maybe<Array<Maybe<JournalEntiresWhereInput>>>,
};

export type JournalEntriesRes = {
   __typename?: 'JournalEntriesRes',
  totalCount: Scalars['Int'],
  entries: Array<JournalEntry>,
};

export type JournalEntriesWhereDepartment = {
  eq?: Maybe<Scalars['ID']>,
  ne?: Maybe<Scalars['ID']>,
  in?: Maybe<Array<Maybe<Scalars['ID']>>>,
  nin?: Maybe<Array<Maybe<Scalars['ID']>>>,
  includeDescendants?: Maybe<Scalars['Boolean']>,
};

export type JournalEntriesWhereLastUpdate = {
  gt?: Maybe<Scalars['String']>,
  lt?: Maybe<Scalars['String']>,
  gte?: Maybe<Scalars['String']>,
  lte?: Maybe<Scalars['String']>,
};

export type JournalEntry = {
   __typename?: 'JournalEntry',
  id: Scalars['ID'],
  type: JournalEntryType,
  date: Scalars['String'],
  department: Department,
  category: JournalEntryCategory,
  paymentMethod: PaymentMethod,
  description?: Maybe<Scalars['String']>,
  total: Rational,
  source: JournalEntrySource,
  reconciled: Scalars['Boolean'],
  lastUpdate: Scalars['String'],
  deleted: Scalars['Boolean'],
};

export type JournalEntryAddedRes = {
   __typename?: 'JournalEntryAddedRes',
  totalCount: Scalars['Int'],
  index: Scalars['Int'],
  entry: JournalEntry,
};

export type JournalEntryAddFields = {
  date: Scalars['String'],
  department: Scalars['ID'],
  type: JournalEntryType,
  category: Scalars['ID'],
  paymentMethod: Scalars['ID'],
  description?: Maybe<Scalars['String']>,
  total: RationalInput,
  source: JournalEntrySourceInput,
  reconciled?: Maybe<Scalars['Boolean']>,
};

export type JournalEntryCategory = {
   __typename?: 'JournalEntryCategory',
  id: Scalars['ID'],
  name: Scalars['String'],
  type: JournalEntryType,
  parent?: Maybe<JournalEntryCategory>,
  ancestors: Array<JournalEntryCategory>,
};

export type JournalEntrySource = Person | Business | Department;

export type JournalEntrySourceInput = {
  sourceType: JournalEntrySourceType,
  id: Scalars['ID'],
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
  date?: Maybe<Scalars['String']>,
  department?: Maybe<Scalars['ID']>,
  type?: Maybe<JournalEntryType>,
  category?: Maybe<Scalars['ID']>,
  paymentMethod?: Maybe<Scalars['ID']>,
  description?: Maybe<Scalars['String']>,
  total?: Maybe<RationalInput>,
  source?: Maybe<JournalEntrySourceInput>,
  reconciled?: Maybe<Scalars['Boolean']>,
};

export type Mutation = {
   __typename?: 'Mutation',
  addBusiness: Business,
  journalEntryUpdate: JournalEntry,
  journalEntryAdd: JournalEntry,
  journalEntryDelete: JournalEntry,
  addPerson: Person,
};


export type MutationAddBusinessArgs = {
  fields: BusinessAddFields
};


export type MutationJournalEntryUpdateArgs = {
  id: Scalars['ID'],
  fields: JournalEntryUpdateFields
};


export type MutationJournalEntryAddArgs = {
  fields: JournalEntryAddFields
};


export type MutationJournalEntryDeleteArgs = {
  id: Scalars['ID']
};


export type MutationAddPersonArgs = {
  fields: PersonAddFields
};

export type PaginateInput = {
  skip: Scalars['Int'],
  limit: Scalars['Int'],
};

export type PaymentMethod = {
   __typename?: 'PaymentMethod',
  id: Scalars['ID'],
  active: Scalars['Boolean'],
  method: Scalars['String'],
  parent?: Maybe<PaymentMethod>,
  ancestors: Array<PaymentMethod>,
};

export type Person = {
   __typename?: 'Person',
  id: Scalars['ID'],
  name: PersonName,
};

export type PersonAddFields = {
  name: PersonNameInput,
};

export type PersonName = {
   __typename?: 'PersonName',
  first: Scalars['String'],
  last: Scalars['String'],
};

export type PersonNameInput = {
  first: Scalars['String'],
  last: Scalars['String'],
};

export type Query = {
   __typename?: 'Query',
  budgets: Array<Budget>,
  budget: Budget,
  businesses: Array<Business>,
  business: Business,
  departments: Array<Department>,
  department?: Maybe<Department>,
  journalEntries: Array<JournalEntry>,
  journalEntryCategories: Array<JournalEntryCategory>,
  journalEntryCategory: JournalEntryCategory,
  journalEntrySources: Array<JournalEntrySource>,
  paymentMethods: Array<PaymentMethod>,
  people: Array<Person>,
};


export type QueryBudgetArgs = {
  id: Scalars['ID']
};


export type QueryBusinessesArgs = {
  searchByName?: Maybe<Scalars['String']>
};


export type QueryBusinessArgs = {
  id: Scalars['ID']
};


export type QueryDepartmentsArgs = {
  fromParent?: Maybe<Scalars['ID']>,
  searchByName?: Maybe<Scalars['String']>
};


export type QueryDepartmentArgs = {
  id: Scalars['ID']
};


export type QueryJournalEntriesArgs = {
  where?: Maybe<JournalEntiresWhereInput>
};


export type QueryJournalEntryCategoryArgs = {
  id: Scalars['ID']
};


export type QueryJournalEntrySourcesArgs = {
  searchByName: Scalars['String']
};


export type QueryPeopleArgs = {
  searchByName?: Maybe<PersonNameInput>
};

export type Rational = {
   __typename?: 'Rational',
  num: Scalars['Int'],
  den: Scalars['Int'],
};

export type RationalInput = {
  num: Scalars['Int'],
  den: Scalars['Int'],
};

export enum SortDirection {
  Asc = 'ASC',
  Desc = 'DESC'
}

export type Subscription = {
   __typename?: 'Subscription',
  journalEntryAdded: JournalEntry,
  journalEntryUpdated: JournalEntry,
};

export type User = {
   __typename?: 'User',
  id: Scalars['ID'],
  user: Person,
};

export type Vendor = {
   __typename?: 'Vendor',
  approved: Scalars['Boolean'],
  vendorId?: Maybe<Scalars['ID']>,
};



export type ResolverTypeWrapper<T> = Promise<T> | T;

export type ResolverFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => Promise<TResult> | TResult;

export type Resolver<TResult, TParent = {}, TContext = {}, TArgs = {}> = ResolverFn<TResult, TParent, TContext, TArgs>;

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
) => Maybe<TTypes>;

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
  Budget: ResolverTypeWrapper<Omit<Budget, 'owner'> & { owner: ResolversTypes['BudgetOwner'] }>,
  ID: ResolverTypeWrapper<Scalars['ID']>,
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
  JournalEntryType: JournalEntryType,
  JournalEntryCategory: ResolverTypeWrapper<JournalEntryCategory>,
  PaymentMethod: ResolverTypeWrapper<PaymentMethod>,
  JournalEntrySource: ResolversTypes['Person'] | ResolversTypes['Business'] | ResolversTypes['Department'],
  Person: ResolverTypeWrapper<Person>,
  PersonName: ResolverTypeWrapper<PersonName>,
  PersonNameInput: PersonNameInput,
  Mutation: ResolverTypeWrapper<{}>,
  BusinessAddFields: BusinessAddFields,
  JournalEntryUpdateFields: JournalEntryUpdateFields,
  RationalInput: RationalInput,
  JournalEntrySourceInput: JournalEntrySourceInput,
  JournalEntrySourceType: JournalEntrySourceType,
  JournalEntryAddFields: JournalEntryAddFields,
  PersonAddFields: PersonAddFields,
  Subscription: ResolverTypeWrapper<{}>,
  DepartmentAddFields: DepartmentAddFields,
  JournalEntriesRes: ResolverTypeWrapper<JournalEntriesRes>,
  JournalEntryAddedRes: ResolverTypeWrapper<JournalEntryAddedRes>,
  SortDirection: SortDirection,
  FilterType: FilterType,
  PaginateInput: PaginateInput,
  ByIdFilter: ByIdFilter,
  User: ResolverTypeWrapper<User>,
};

/** Mapping between all available schema types and the resolvers parents */
export type ResolversParentTypes = {
  Query: {},
  Budget: Omit<Budget, 'owner'> & { owner: ResolversParentTypes['BudgetOwner'] },
  ID: Scalars['ID'],
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
  JournalEntryType: JournalEntryType,
  JournalEntryCategory: JournalEntryCategory,
  PaymentMethod: PaymentMethod,
  JournalEntrySource: ResolversParentTypes['Person'] | ResolversParentTypes['Business'] | ResolversParentTypes['Department'],
  Person: Person,
  PersonName: PersonName,
  PersonNameInput: PersonNameInput,
  Mutation: {},
  BusinessAddFields: BusinessAddFields,
  JournalEntryUpdateFields: JournalEntryUpdateFields,
  RationalInput: RationalInput,
  JournalEntrySourceInput: JournalEntrySourceInput,
  JournalEntrySourceType: JournalEntrySourceType,
  JournalEntryAddFields: JournalEntryAddFields,
  PersonAddFields: PersonAddFields,
  Subscription: {},
  DepartmentAddFields: DepartmentAddFields,
  JournalEntriesRes: JournalEntriesRes,
  JournalEntryAddedRes: JournalEntryAddedRes,
  SortDirection: SortDirection,
  FilterType: FilterType,
  PaginateInput: PaginateInput,
  ByIdFilter: ByIdFilter,
  User: User,
};

export type BudgetResolvers<ContextType = Context, ParentType extends ResolversParentTypes['Budget'] = ResolversParentTypes['Budget']> = {
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>,
  amount?: Resolver<ResolversTypes['Rational'], ParentType, ContextType>,
  owner?: Resolver<ResolversTypes['BudgetOwner'], ParentType, ContextType>,
};

export type BudgetOwnerResolvers<ContextType = Context, ParentType extends ResolversParentTypes['BudgetOwner'] = ResolversParentTypes['BudgetOwner']> = {
  __resolveType: TypeResolveFn<'Department' | 'Business', ParentType, ContextType>
};

export type BusinessResolvers<ContextType = Context, ParentType extends ResolversParentTypes['Business'] = ResolversParentTypes['Business']> = {
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>,
  name?: Resolver<ResolversTypes['String'], ParentType, ContextType>,
  budget?: Resolver<Maybe<ResolversTypes['Budget']>, ParentType, ContextType>,
  departments?: Resolver<Maybe<Array<ResolversTypes['Department']>>, ParentType, ContextType>,
  vendor?: Resolver<Maybe<ResolversTypes['Vendor']>, ParentType, ContextType>,
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
};

export type DepartmentAncestorResolvers<ContextType = Context, ParentType extends ResolversParentTypes['DepartmentAncestor'] = ResolversParentTypes['DepartmentAncestor']> = {
  __resolveType: TypeResolveFn<'Department' | 'Business', ParentType, ContextType>
};

export type JournalEntriesResResolvers<ContextType = Context, ParentType extends ResolversParentTypes['JournalEntriesRes'] = ResolversParentTypes['JournalEntriesRes']> = {
  totalCount?: Resolver<ResolversTypes['Int'], ParentType, ContextType>,
  entries?: Resolver<Array<ResolversTypes['JournalEntry']>, ParentType, ContextType>,
};

export type JournalEntryResolvers<ContextType = Context, ParentType extends ResolversParentTypes['JournalEntry'] = ResolversParentTypes['JournalEntry']> = {
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>,
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
};

export type JournalEntryAddedResResolvers<ContextType = Context, ParentType extends ResolversParentTypes['JournalEntryAddedRes'] = ResolversParentTypes['JournalEntryAddedRes']> = {
  totalCount?: Resolver<ResolversTypes['Int'], ParentType, ContextType>,
  index?: Resolver<ResolversTypes['Int'], ParentType, ContextType>,
  entry?: Resolver<ResolversTypes['JournalEntry'], ParentType, ContextType>,
};

export type JournalEntryCategoryResolvers<ContextType = Context, ParentType extends ResolversParentTypes['JournalEntryCategory'] = ResolversParentTypes['JournalEntryCategory']> = {
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>,
  name?: Resolver<ResolversTypes['String'], ParentType, ContextType>,
  type?: Resolver<ResolversTypes['JournalEntryType'], ParentType, ContextType>,
  parent?: Resolver<Maybe<ResolversTypes['JournalEntryCategory']>, ParentType, ContextType>,
  ancestors?: Resolver<Array<ResolversTypes['JournalEntryCategory']>, ParentType, ContextType>,
};

export type JournalEntrySourceResolvers<ContextType = Context, ParentType extends ResolversParentTypes['JournalEntrySource'] = ResolversParentTypes['JournalEntrySource']> = {
  __resolveType: TypeResolveFn<'Person' | 'Business' | 'Department', ParentType, ContextType>
};

export type MutationResolvers<ContextType = Context, ParentType extends ResolversParentTypes['Mutation'] = ResolversParentTypes['Mutation']> = {
  addBusiness?: Resolver<ResolversTypes['Business'], ParentType, ContextType, RequireFields<MutationAddBusinessArgs, 'fields'>>,
  journalEntryUpdate?: Resolver<ResolversTypes['JournalEntry'], ParentType, ContextType, RequireFields<MutationJournalEntryUpdateArgs, 'id' | 'fields'>>,
  journalEntryAdd?: Resolver<ResolversTypes['JournalEntry'], ParentType, ContextType, RequireFields<MutationJournalEntryAddArgs, 'fields'>>,
  journalEntryDelete?: Resolver<ResolversTypes['JournalEntry'], ParentType, ContextType, RequireFields<MutationJournalEntryDeleteArgs, 'id'>>,
  addPerson?: Resolver<ResolversTypes['Person'], ParentType, ContextType, RequireFields<MutationAddPersonArgs, 'fields'>>,
};

export type PaymentMethodResolvers<ContextType = Context, ParentType extends ResolversParentTypes['PaymentMethod'] = ResolversParentTypes['PaymentMethod']> = {
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>,
  active?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>,
  method?: Resolver<ResolversTypes['String'], ParentType, ContextType>,
  parent?: Resolver<Maybe<ResolversTypes['PaymentMethod']>, ParentType, ContextType>,
  ancestors?: Resolver<Array<ResolversTypes['PaymentMethod']>, ParentType, ContextType>,
};

export type PersonResolvers<ContextType = Context, ParentType extends ResolversParentTypes['Person'] = ResolversParentTypes['Person']> = {
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>,
  name?: Resolver<ResolversTypes['PersonName'], ParentType, ContextType>,
};

export type PersonNameResolvers<ContextType = Context, ParentType extends ResolversParentTypes['PersonName'] = ResolversParentTypes['PersonName']> = {
  first?: Resolver<ResolversTypes['String'], ParentType, ContextType>,
  last?: Resolver<ResolversTypes['String'], ParentType, ContextType>,
};

export type QueryResolvers<ContextType = Context, ParentType extends ResolversParentTypes['Query'] = ResolversParentTypes['Query']> = {
  budgets?: Resolver<Array<ResolversTypes['Budget']>, ParentType, ContextType>,
  budget?: Resolver<ResolversTypes['Budget'], ParentType, ContextType, RequireFields<QueryBudgetArgs, 'id'>>,
  businesses?: Resolver<Array<ResolversTypes['Business']>, ParentType, ContextType, QueryBusinessesArgs>,
  business?: Resolver<ResolversTypes['Business'], ParentType, ContextType, RequireFields<QueryBusinessArgs, 'id'>>,
  departments?: Resolver<Array<ResolversTypes['Department']>, ParentType, ContextType, QueryDepartmentsArgs>,
  department?: Resolver<Maybe<ResolversTypes['Department']>, ParentType, ContextType, RequireFields<QueryDepartmentArgs, 'id'>>,
  journalEntries?: Resolver<Array<ResolversTypes['JournalEntry']>, ParentType, ContextType, QueryJournalEntriesArgs>,
  journalEntryCategories?: Resolver<Array<ResolversTypes['JournalEntryCategory']>, ParentType, ContextType>,
  journalEntryCategory?: Resolver<ResolversTypes['JournalEntryCategory'], ParentType, ContextType, RequireFields<QueryJournalEntryCategoryArgs, 'id'>>,
  journalEntrySources?: Resolver<Array<ResolversTypes['JournalEntrySource']>, ParentType, ContextType, RequireFields<QueryJournalEntrySourcesArgs, 'searchByName'>>,
  paymentMethods?: Resolver<Array<ResolversTypes['PaymentMethod']>, ParentType, ContextType>,
  people?: Resolver<Array<ResolversTypes['Person']>, ParentType, ContextType, QueryPeopleArgs>,
};

export type RationalResolvers<ContextType = Context, ParentType extends ResolversParentTypes['Rational'] = ResolversParentTypes['Rational']> = {
  num?: Resolver<ResolversTypes['Int'], ParentType, ContextType>,
  den?: Resolver<ResolversTypes['Int'], ParentType, ContextType>,
};

export type SubscriptionResolvers<ContextType = Context, ParentType extends ResolversParentTypes['Subscription'] = ResolversParentTypes['Subscription']> = {
  journalEntryAdded?: SubscriptionResolver<ResolversTypes['JournalEntry'], "journalEntryAdded", ParentType, ContextType>,
  journalEntryUpdated?: SubscriptionResolver<ResolversTypes['JournalEntry'], "journalEntryUpdated", ParentType, ContextType>,
};

export type UserResolvers<ContextType = Context, ParentType extends ResolversParentTypes['User'] = ResolversParentTypes['User']> = {
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>,
  user?: Resolver<ResolversTypes['Person'], ParentType, ContextType>,
};

export type VendorResolvers<ContextType = Context, ParentType extends ResolversParentTypes['Vendor'] = ResolversParentTypes['Vendor']> = {
  approved?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>,
  vendorId?: Resolver<Maybe<ResolversTypes['ID']>, ParentType, ContextType>,
};

export type Resolvers<ContextType = Context> = {
  Budget?: BudgetResolvers<ContextType>,
  BudgetOwner?: BudgetOwnerResolvers,
  Business?: BusinessResolvers<ContextType>,
  Department?: DepartmentResolvers<ContextType>,
  DepartmentAncestor?: DepartmentAncestorResolvers,
  JournalEntriesRes?: JournalEntriesResResolvers<ContextType>,
  JournalEntry?: JournalEntryResolvers<ContextType>,
  JournalEntryAddedRes?: JournalEntryAddedResResolvers<ContextType>,
  JournalEntryCategory?: JournalEntryCategoryResolvers<ContextType>,
  JournalEntrySource?: JournalEntrySourceResolvers,
  Mutation?: MutationResolvers<ContextType>,
  PaymentMethod?: PaymentMethodResolvers<ContextType>,
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
