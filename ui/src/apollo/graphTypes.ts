import { GraphQLResolveInfo, GraphQLScalarType, GraphQLScalarTypeConfig } from 'graphql';
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
  /** The `Upload` scalar type represents a file upload. */
  Upload: any,
};


export type Budget = {
   __typename?: 'Budget',
  id: Scalars['ID'],
  budget: Rational,
  owner: BudgetOwner,
};

export type BudgetOwner = Department | Business;

export type Business = {
   __typename?: 'Business',
  id: Scalars['ID'],
  name: Scalars['String'],
  budget?: Maybe<Budget>,
  departments?: Maybe<Array<Department>>,
};

export enum CacheControlScope {
  Public = 'PUBLIC',
  Private = 'PRIVATE'
}

export type Department = {
   __typename?: 'Department',
  id: Scalars['ID'],
  name: Scalars['String'],
  code?: Maybe<Scalars['String']>,
  budget?: Maybe<Budget>,
  business: Business,
  parent: DepartmentAncestor,
  ancestors: Array<DepartmentAncestor>,
};

export type DepartmentAddFields = {
  name: Scalars['String'],
};

export type DepartmentAncestor = Department | Business;

export enum JournalEntriesColumn {
  Department = 'DEPARTMENT',
  Type = 'TYPE',
  /** ROOT_TYPE */
  PaymentMethod = 'PAYMENT_METHOD',
  Total = 'TOTAL',
  Date = 'DATE',
  Source = 'SOURCE'
}

export type JournalEntriesRes = {
   __typename?: 'JournalEntriesRes',
  totalCount: Scalars['Int'],
  entries: Array<JournalEntry>,
};

export type JournalEntriesSortByInput = {
  column: JournalEntriesColumn,
  direction?: Maybe<SortDirection>,
};

export type JournalEntry = {
   __typename?: 'JournalEntry',
  id: Scalars['ID'],
  date: Scalars['String'],
  department: Department,
  type: JournalEntryType,
  paymentMethod: PaymentMethod,
  total: Rational,
  source: JournalEntrySource,
};

export type JournalEntryAddFields = {
  date: Scalars['String'],
  department: Scalars['ID'],
  type: Scalars['ID'],
  paymentMethod: Scalars['ID'],
  total: RationalInput,
  source: JournalEntrySourceInput,
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

export type JournalEntryType = {
   __typename?: 'JournalEntryType',
  id: Scalars['ID'],
  type: Scalars['String'],
  parent?: Maybe<JournalEntryType>,
  ancestors: Array<JournalEntryType>,
};

export type JournalEntryUpdateFields = {
  date?: Maybe<Scalars['String']>,
  department?: Maybe<Scalars['ID']>,
  type?: Maybe<Scalars['ID']>,
  paymentMethod?: Maybe<Scalars['ID']>,
  total?: Maybe<RationalInput>,
  source?: Maybe<JournalEntrySourceInput>,
};

export type Lc_JournalEntryUpsert = {
   __typename?: 'LC_JournalEntryUpsert',
  id: Scalars['ID'],
  valid: Scalars['Boolean'],
  type: Lc_JournalEntryUpsertType,
  submitStatus: Lc_JournalEntryUpsertSubmitStatus,
  submitError?: Maybe<Scalars['String']>,
  inputValues: Lc_JournalEntryUpsertInputValues,
  inputErrors: Lc_JournalEntryUpsertInputErrors,
  fields: Lc_JournalEntryUpsertFields,
};

export type Lc_JournalEntryUpsertFields = {
   __typename?: 'LC_JournalEntryUpsertFields',
  id?: Maybe<Scalars['ID']>,
  date?: Maybe<Scalars['String']>,
  department: Array<Scalars['ID']>,
  type?: Maybe<Scalars['ID']>,
  paymentMethod?: Maybe<Scalars['ID']>,
  total?: Maybe<Rational>,
  source: Array<Lc_JournalEntryUpsertSource>,
};

export type Lc_JournalEntryUpsertInputErrors = {
   __typename?: 'LC_JournalEntryUpsertInputErrors',
  dateError?: Maybe<Scalars['String']>,
  deptError?: Maybe<Scalars['String']>,
  typeError?: Maybe<Scalars['String']>,
  payMethodError?: Maybe<Scalars['String']>,
  totalError?: Maybe<Scalars['String']>,
  srcError?: Maybe<Scalars['String']>,
};

export type Lc_JournalEntryUpsertInputValues = {
   __typename?: 'LC_JournalEntryUpsertInputValues',
  deptInput?: Maybe<Scalars['String']>,
  totalInput?: Maybe<Scalars['String']>,
  srcInput?: Maybe<Scalars['String']>,
  srcType?: Maybe<JournalEntrySourceType>,
};

export type Lc_JournalEntryUpsertSource = {
   __typename?: 'LC_JournalEntryUpsertSource',
  sourceType: JournalEntrySourceType,
  id: Scalars['ID'],
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
   __typename?: 'Mutation',
  updateJournalEntry: JournalEntry,
  addJournalEntry: JournalEntry,
  addPerson: Person,
};


export type MutationUpdateJournalEntryArgs = {
  id: Scalars['ID'],
  fields: JournalEntryUpdateFields
};


export type MutationAddJournalEntryArgs = {
  fields: JournalEntryAddFields
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
  lc_journalEntryUpserts: Array<Lc_JournalEntryUpsert>,
  budgets: Array<Budget>,
  budget: Budget,
  businesses: Array<Business>,
  business: Business,
  departments: Array<Department>,
  department: Department,
  journalEntries: JournalEntriesRes,
  journalEntrySources: Array<JournalEntrySource>,
  journalEntryTypes: Array<JournalEntryType>,
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
  paginate: PaginateInput,
  sortBy?: Maybe<Array<JournalEntriesSortByInput>>
};


export type QueryJournalEntrySourcesArgs = {
  searchByName: Scalars['String']
};


export type QueryJournalEntryTypesArgs = {
  from?: Maybe<Scalars['ID']>
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


export type User = {
   __typename?: 'User',
  id: Scalars['ID'],
  user: Person,
};

export type AddEntryInputsQueryVariables = {};


export type AddEntryInputsQuery = { __typename?: 'Query', lc_journalEntryUpserts: Array<{ __typename?: 'LC_JournalEntryUpsert', fields: { __typename?: 'LC_JournalEntryUpsertFields', id: Maybe<string> } }> };

export type JournalEntry_1Fragment = { __typename: 'JournalEntry', id: string, date: string, department: { __typename: 'Department', id: string, name: string, ancestors: Array<{ __typename: 'Department', id: string, deptName: string } | { __typename: 'Business', id: string, bizName: string }> }, type: { __typename: 'JournalEntryType', id: string, type: string, ancestors: Array<{ __typename: 'JournalEntryType', id: string, type: string }> }, paymentMethod: { __typename: 'PaymentMethod', id: string, method: string }, source: { __typename: 'Person', id: string, name: { __typename?: 'PersonName', first: string, last: string } } | { __typename: 'Business', id: string, bizName: string } | { __typename: 'Department', id: string, deptName: string }, total: { __typename?: 'Rational', num: number, den: number } };

export type JournalEntries_1QueryVariables = {
  paginate: PaginateInput,
  sortBy?: Maybe<Array<JournalEntriesSortByInput>>
};


export type JournalEntries_1Query = { __typename?: 'Query', journalEntries: { __typename?: 'JournalEntriesRes', totalCount: number, entries: Array<(
      { __typename?: 'JournalEntry' }
      & JournalEntry_1Fragment
    )> } };

export type DeptInputOpts_1QueryVariables = {
  fromParent?: Maybe<Scalars['ID']>
};


export type DeptInputOpts_1Query = { __typename?: 'Query', deptOpts: Array<(
    { __typename?: 'Department' }
    & DeptInputOptsDept_1Fragment
  )> };

export type DeptInputOptsDept_1Fragment = { __typename: 'Department', id: string, name: string, parent: { __typename: 'Department', id: string } | { __typename: 'Business', id: string } };

export type Lc_JournalEntryUpsert_1Fragment = { __typename: 'LC_JournalEntryUpsert', id: string, valid: boolean, type: Lc_JournalEntryUpsertType, submitStatus: Lc_JournalEntryUpsertSubmitStatus, submitError: Maybe<string>, inputValues: { __typename?: 'LC_JournalEntryUpsertInputValues', deptInput: Maybe<string>, totalInput: Maybe<string>, srcInput: Maybe<string>, srcType: Maybe<JournalEntrySourceType> }, inputErrors: { __typename?: 'LC_JournalEntryUpsertInputErrors', dateError: Maybe<string>, deptError: Maybe<string>, typeError: Maybe<string>, payMethodError: Maybe<string>, totalError: Maybe<string>, srcError: Maybe<string> }, fields: { __typename?: 'LC_JournalEntryUpsertFields', id: Maybe<string>, date: Maybe<string>, department: Array<string>, type: Maybe<string>, paymentMethod: Maybe<string>, total: Maybe<{ __typename?: 'Rational', num: number, den: number }>, source: Array<{ __typename?: 'LC_JournalEntryUpsertSource', sourceType: JournalEntrySourceType, id: string }> } };

export type Lc_JournalEntryUpserts_1QueryVariables = {};


export type Lc_JournalEntryUpserts_1Query = { __typename?: 'Query', lc_journalEntryUpserts: Array<(
    { __typename?: 'LC_JournalEntryUpsert' }
    & Lc_JournalEntryUpsert_1Fragment
  )> };

export type AddJournalEntry_1MutationVariables = {
  fields: JournalEntryAddFields
};


export type AddJournalEntry_1Mutation = { __typename?: 'Mutation', addJournalEntry: { __typename: 'JournalEntry', id: string } };

export type UpdateJournalEntry_1MutationVariables = {
  id: Scalars['ID'],
  fields: JournalEntryUpdateFields
};


export type UpdateJournalEntry_1Mutation = { __typename?: 'Mutation', updateJournalEntry: { __typename: 'JournalEntry', id: string } };

export type PayMethodInput_1QueryVariables = {};


export type PayMethodInput_1Query = { __typename?: 'Query', paymentMethods: Array<{ __typename: 'PaymentMethod', id: string, method: string }> };

export type BusinessSrcOptsInput_1QueryVariables = {
  searchByName: Scalars['String']
};


export type BusinessSrcOptsInput_1Query = { __typename?: 'Query', bizOpts: Array<(
    { __typename?: 'Business' }
    & BusinessSrcBizOpts_1Fragment
  )> };

export type BusinessSrcBizOpts_1Fragment = { __typename: 'Business', id: string, name: string, deptOpts: Maybe<Array<(
    { __typename?: 'Department' }
    & BusinessSrcDeptOpts_1Fragment
  )>> };

export type BusinessSrcDeptOpts_1Fragment = { __typename: 'Department', id: string, name: string, parent: { __typename: 'Department', id: string } | { __typename: 'Business', id: string } };

export type PersonSrcOpt_1Fragment = { __typename: 'Person', id: string, name: { __typename?: 'PersonName', first: string, last: string } };

export type PeopleSrcOpts_1QueryVariables = {
  searchByName: PersonNameInput
};


export type PeopleSrcOpts_1Query = { __typename?: 'Query', people: Array<(
    { __typename?: 'Person' }
    & PersonSrcOpt_1Fragment
  )> };

export type TypeInput_1QueryVariables = {};


export type TypeInput_1Query = { __typename?: 'Query', journalEntryTypes: Array<{ __typename: 'JournalEntryType', id: string, type: string }> };

export type AddPerson_1MutationVariables = {
  fields: PersonAddFields
};


export type AddPerson_1Mutation = { __typename?: 'Mutation', addPerson: { __typename: 'Person', id: string, name: { __typename?: 'PersonName', first: string, last: string } } };

export type AddJournalEntry_2MutationVariables = {
  fields: JournalEntryAddFields
};


export type AddJournalEntry_2Mutation = { __typename?: 'Mutation', addJournalEntry: { __typename: 'JournalEntry', id: string } };



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
  LC_JournalEntryUpsert: ResolverTypeWrapper<Lc_JournalEntryUpsert>,
  ID: ResolverTypeWrapper<Scalars['ID']>,
  Boolean: ResolverTypeWrapper<Scalars['Boolean']>,
  LC_JournalEntryUpsertType: Lc_JournalEntryUpsertType,
  LC_JournalEntryUpsertSubmitStatus: Lc_JournalEntryUpsertSubmitStatus,
  String: ResolverTypeWrapper<Scalars['String']>,
  LC_JournalEntryUpsertInputValues: ResolverTypeWrapper<Lc_JournalEntryUpsertInputValues>,
  JournalEntrySourceType: JournalEntrySourceType,
  LC_JournalEntryUpsertInputErrors: ResolverTypeWrapper<Lc_JournalEntryUpsertInputErrors>,
  LC_JournalEntryUpsertFields: ResolverTypeWrapper<Lc_JournalEntryUpsertFields>,
  Rational: ResolverTypeWrapper<Rational>,
  Int: ResolverTypeWrapper<Scalars['Int']>,
  LC_JournalEntryUpsertSource: ResolverTypeWrapper<Lc_JournalEntryUpsertSource>,
  Budget: ResolverTypeWrapper<Omit<Budget, 'owner'> & { owner: ResolversTypes['BudgetOwner'] }>,
  BudgetOwner: ResolversTypes['Department'] | ResolversTypes['Business'],
  Department: ResolverTypeWrapper<Omit<Department, 'parent' | 'ancestors'> & { parent: ResolversTypes['DepartmentAncestor'], ancestors: Array<ResolversTypes['DepartmentAncestor']> }>,
  Business: ResolverTypeWrapper<Business>,
  DepartmentAncestor: ResolversTypes['Department'] | ResolversTypes['Business'],
  PaginateInput: PaginateInput,
  JournalEntriesSortByInput: JournalEntriesSortByInput,
  JournalEntriesColumn: JournalEntriesColumn,
  SortDirection: SortDirection,
  JournalEntriesRes: ResolverTypeWrapper<JournalEntriesRes>,
  JournalEntry: ResolverTypeWrapper<Omit<JournalEntry, 'source'> & { source: ResolversTypes['JournalEntrySource'] }>,
  JournalEntryType: ResolverTypeWrapper<JournalEntryType>,
  PaymentMethod: ResolverTypeWrapper<PaymentMethod>,
  JournalEntrySource: ResolversTypes['Person'] | ResolversTypes['Business'] | ResolversTypes['Department'],
  Person: ResolverTypeWrapper<Person>,
  PersonName: ResolverTypeWrapper<PersonName>,
  PersonNameInput: PersonNameInput,
  Mutation: ResolverTypeWrapper<{}>,
  JournalEntryUpdateFields: JournalEntryUpdateFields,
  RationalInput: RationalInput,
  JournalEntrySourceInput: JournalEntrySourceInput,
  JournalEntryAddFields: JournalEntryAddFields,
  PersonAddFields: PersonAddFields,
  CacheControlScope: CacheControlScope,
  DepartmentAddFields: DepartmentAddFields,
  Upload: ResolverTypeWrapper<Scalars['Upload']>,
  User: ResolverTypeWrapper<User>,
};

/** Mapping between all available schema types and the resolvers parents */
export type ResolversParentTypes = {
  Query: {},
  LC_JournalEntryUpsert: Lc_JournalEntryUpsert,
  ID: Scalars['ID'],
  Boolean: Scalars['Boolean'],
  LC_JournalEntryUpsertType: Lc_JournalEntryUpsertType,
  LC_JournalEntryUpsertSubmitStatus: Lc_JournalEntryUpsertSubmitStatus,
  String: Scalars['String'],
  LC_JournalEntryUpsertInputValues: Lc_JournalEntryUpsertInputValues,
  JournalEntrySourceType: JournalEntrySourceType,
  LC_JournalEntryUpsertInputErrors: Lc_JournalEntryUpsertInputErrors,
  LC_JournalEntryUpsertFields: Lc_JournalEntryUpsertFields,
  Rational: Rational,
  Int: Scalars['Int'],
  LC_JournalEntryUpsertSource: Lc_JournalEntryUpsertSource,
  Budget: Omit<Budget, 'owner'> & { owner: ResolversParentTypes['BudgetOwner'] },
  BudgetOwner: ResolversParentTypes['Department'] | ResolversParentTypes['Business'],
  Department: Omit<Department, 'parent' | 'ancestors'> & { parent: ResolversParentTypes['DepartmentAncestor'], ancestors: Array<ResolversParentTypes['DepartmentAncestor']> },
  Business: Business,
  DepartmentAncestor: ResolversParentTypes['Department'] | ResolversParentTypes['Business'],
  PaginateInput: PaginateInput,
  JournalEntriesSortByInput: JournalEntriesSortByInput,
  JournalEntriesColumn: JournalEntriesColumn,
  SortDirection: SortDirection,
  JournalEntriesRes: JournalEntriesRes,
  JournalEntry: Omit<JournalEntry, 'source'> & { source: ResolversParentTypes['JournalEntrySource'] },
  JournalEntryType: JournalEntryType,
  PaymentMethod: PaymentMethod,
  JournalEntrySource: ResolversParentTypes['Person'] | ResolversParentTypes['Business'] | ResolversParentTypes['Department'],
  Person: Person,
  PersonName: PersonName,
  PersonNameInput: PersonNameInput,
  Mutation: {},
  JournalEntryUpdateFields: JournalEntryUpdateFields,
  RationalInput: RationalInput,
  JournalEntrySourceInput: JournalEntrySourceInput,
  JournalEntryAddFields: JournalEntryAddFields,
  PersonAddFields: PersonAddFields,
  CacheControlScope: CacheControlScope,
  DepartmentAddFields: DepartmentAddFields,
  Upload: Scalars['Upload'],
  User: User,
};

export type CacheControlDirectiveResolver<Result, Parent, ContextType = Context, Args = {   maxAge?: Maybe<Maybe<Scalars['Int']>>,
  scope?: Maybe<Maybe<CacheControlScope>> }> = DirectiveResolverFn<Result, Parent, ContextType, Args>;

export type BudgetResolvers<ContextType = Context, ParentType extends ResolversParentTypes['Budget'] = ResolversParentTypes['Budget']> = {
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>,
  budget?: Resolver<ResolversTypes['Rational'], ParentType, ContextType>,
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
};

export type DepartmentResolvers<ContextType = Context, ParentType extends ResolversParentTypes['Department'] = ResolversParentTypes['Department']> = {
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>,
  name?: Resolver<ResolversTypes['String'], ParentType, ContextType>,
  code?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>,
  budget?: Resolver<Maybe<ResolversTypes['Budget']>, ParentType, ContextType>,
  business?: Resolver<ResolversTypes['Business'], ParentType, ContextType>,
  parent?: Resolver<ResolversTypes['DepartmentAncestor'], ParentType, ContextType>,
  ancestors?: Resolver<Array<ResolversTypes['DepartmentAncestor']>, ParentType, ContextType>,
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
  date?: Resolver<ResolversTypes['String'], ParentType, ContextType>,
  department?: Resolver<ResolversTypes['Department'], ParentType, ContextType>,
  type?: Resolver<ResolversTypes['JournalEntryType'], ParentType, ContextType>,
  paymentMethod?: Resolver<ResolversTypes['PaymentMethod'], ParentType, ContextType>,
  total?: Resolver<ResolversTypes['Rational'], ParentType, ContextType>,
  source?: Resolver<ResolversTypes['JournalEntrySource'], ParentType, ContextType>,
};

export type JournalEntrySourceResolvers<ContextType = Context, ParentType extends ResolversParentTypes['JournalEntrySource'] = ResolversParentTypes['JournalEntrySource']> = {
  __resolveType: TypeResolveFn<'Person' | 'Business' | 'Department', ParentType, ContextType>
};

export type JournalEntryTypeResolvers<ContextType = Context, ParentType extends ResolversParentTypes['JournalEntryType'] = ResolversParentTypes['JournalEntryType']> = {
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>,
  type?: Resolver<ResolversTypes['String'], ParentType, ContextType>,
  parent?: Resolver<Maybe<ResolversTypes['JournalEntryType']>, ParentType, ContextType>,
  ancestors?: Resolver<Array<ResolversTypes['JournalEntryType']>, ParentType, ContextType>,
};

export type Lc_JournalEntryUpsertResolvers<ContextType = Context, ParentType extends ResolversParentTypes['LC_JournalEntryUpsert'] = ResolversParentTypes['LC_JournalEntryUpsert']> = {
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>,
  valid?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>,
  type?: Resolver<ResolversTypes['LC_JournalEntryUpsertType'], ParentType, ContextType>,
  submitStatus?: Resolver<ResolversTypes['LC_JournalEntryUpsertSubmitStatus'], ParentType, ContextType>,
  submitError?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>,
  inputValues?: Resolver<ResolversTypes['LC_JournalEntryUpsertInputValues'], ParentType, ContextType>,
  inputErrors?: Resolver<ResolversTypes['LC_JournalEntryUpsertInputErrors'], ParentType, ContextType>,
  fields?: Resolver<ResolversTypes['LC_JournalEntryUpsertFields'], ParentType, ContextType>,
};

export type Lc_JournalEntryUpsertFieldsResolvers<ContextType = Context, ParentType extends ResolversParentTypes['LC_JournalEntryUpsertFields'] = ResolversParentTypes['LC_JournalEntryUpsertFields']> = {
  id?: Resolver<Maybe<ResolversTypes['ID']>, ParentType, ContextType>,
  date?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>,
  department?: Resolver<Array<ResolversTypes['ID']>, ParentType, ContextType>,
  type?: Resolver<Maybe<ResolversTypes['ID']>, ParentType, ContextType>,
  paymentMethod?: Resolver<Maybe<ResolversTypes['ID']>, ParentType, ContextType>,
  total?: Resolver<Maybe<ResolversTypes['Rational']>, ParentType, ContextType>,
  source?: Resolver<Array<ResolversTypes['LC_JournalEntryUpsertSource']>, ParentType, ContextType>,
};

export type Lc_JournalEntryUpsertInputErrorsResolvers<ContextType = Context, ParentType extends ResolversParentTypes['LC_JournalEntryUpsertInputErrors'] = ResolversParentTypes['LC_JournalEntryUpsertInputErrors']> = {
  dateError?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>,
  deptError?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>,
  typeError?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>,
  payMethodError?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>,
  totalError?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>,
  srcError?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>,
};

export type Lc_JournalEntryUpsertInputValuesResolvers<ContextType = Context, ParentType extends ResolversParentTypes['LC_JournalEntryUpsertInputValues'] = ResolversParentTypes['LC_JournalEntryUpsertInputValues']> = {
  deptInput?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>,
  totalInput?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>,
  srcInput?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>,
  srcType?: Resolver<Maybe<ResolversTypes['JournalEntrySourceType']>, ParentType, ContextType>,
};

export type Lc_JournalEntryUpsertSourceResolvers<ContextType = Context, ParentType extends ResolversParentTypes['LC_JournalEntryUpsertSource'] = ResolversParentTypes['LC_JournalEntryUpsertSource']> = {
  sourceType?: Resolver<ResolversTypes['JournalEntrySourceType'], ParentType, ContextType>,
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>,
};

export type MutationResolvers<ContextType = Context, ParentType extends ResolversParentTypes['Mutation'] = ResolversParentTypes['Mutation']> = {
  updateJournalEntry?: Resolver<ResolversTypes['JournalEntry'], ParentType, ContextType, RequireFields<MutationUpdateJournalEntryArgs, 'id' | 'fields'>>,
  addJournalEntry?: Resolver<ResolversTypes['JournalEntry'], ParentType, ContextType, RequireFields<MutationAddJournalEntryArgs, 'fields'>>,
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
  lc_journalEntryUpserts?: Resolver<Array<ResolversTypes['LC_JournalEntryUpsert']>, ParentType, ContextType>,
  budgets?: Resolver<Array<ResolversTypes['Budget']>, ParentType, ContextType>,
  budget?: Resolver<ResolversTypes['Budget'], ParentType, ContextType, RequireFields<QueryBudgetArgs, 'id'>>,
  businesses?: Resolver<Array<ResolversTypes['Business']>, ParentType, ContextType, QueryBusinessesArgs>,
  business?: Resolver<ResolversTypes['Business'], ParentType, ContextType, RequireFields<QueryBusinessArgs, 'id'>>,
  departments?: Resolver<Array<ResolversTypes['Department']>, ParentType, ContextType, QueryDepartmentsArgs>,
  department?: Resolver<ResolversTypes['Department'], ParentType, ContextType, RequireFields<QueryDepartmentArgs, 'id'>>,
  journalEntries?: Resolver<ResolversTypes['JournalEntriesRes'], ParentType, ContextType, RequireFields<QueryJournalEntriesArgs, 'paginate'>>,
  journalEntrySources?: Resolver<Array<ResolversTypes['JournalEntrySource']>, ParentType, ContextType, RequireFields<QueryJournalEntrySourcesArgs, 'searchByName'>>,
  journalEntryTypes?: Resolver<Array<ResolversTypes['JournalEntryType']>, ParentType, ContextType, QueryJournalEntryTypesArgs>,
  paymentMethods?: Resolver<Array<ResolversTypes['PaymentMethod']>, ParentType, ContextType>,
  people?: Resolver<Array<ResolversTypes['Person']>, ParentType, ContextType, QueryPeopleArgs>,
};

export type RationalResolvers<ContextType = Context, ParentType extends ResolversParentTypes['Rational'] = ResolversParentTypes['Rational']> = {
  num?: Resolver<ResolversTypes['Int'], ParentType, ContextType>,
  den?: Resolver<ResolversTypes['Int'], ParentType, ContextType>,
};

export interface UploadScalarConfig extends GraphQLScalarTypeConfig<ResolversTypes['Upload'], any> {
  name: 'Upload'
}

export type UserResolvers<ContextType = Context, ParentType extends ResolversParentTypes['User'] = ResolversParentTypes['User']> = {
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>,
  user?: Resolver<ResolversTypes['Person'], ParentType, ContextType>,
};

export type Resolvers<ContextType = Context> = {
  Budget?: BudgetResolvers<ContextType>,
  BudgetOwner?: BudgetOwnerResolvers,
  Business?: BusinessResolvers<ContextType>,
  Department?: DepartmentResolvers<ContextType>,
  DepartmentAncestor?: DepartmentAncestorResolvers,
  JournalEntriesRes?: JournalEntriesResResolvers<ContextType>,
  JournalEntry?: JournalEntryResolvers<ContextType>,
  JournalEntrySource?: JournalEntrySourceResolvers,
  JournalEntryType?: JournalEntryTypeResolvers<ContextType>,
  LC_JournalEntryUpsert?: Lc_JournalEntryUpsertResolvers<ContextType>,
  LC_JournalEntryUpsertFields?: Lc_JournalEntryUpsertFieldsResolvers<ContextType>,
  LC_JournalEntryUpsertInputErrors?: Lc_JournalEntryUpsertInputErrorsResolvers<ContextType>,
  LC_JournalEntryUpsertInputValues?: Lc_JournalEntryUpsertInputValuesResolvers<ContextType>,
  LC_JournalEntryUpsertSource?: Lc_JournalEntryUpsertSourceResolvers<ContextType>,
  Mutation?: MutationResolvers<ContextType>,
  PaymentMethod?: PaymentMethodResolvers<ContextType>,
  Person?: PersonResolvers<ContextType>,
  PersonName?: PersonNameResolvers<ContextType>,
  Query?: QueryResolvers<ContextType>,
  Rational?: RationalResolvers<ContextType>,
  Upload?: GraphQLScalarType,
  User?: UserResolvers<ContextType>,
};


/**
 * @deprecated
 * Use "Resolvers" root object instead. If you wish to get "IResolvers", add "typesPrefix: I" to your config.
*/
export type IResolvers<ContextType = Context> = Resolvers<ContextType>;
export type DirectiveResolvers<ContextType = Context> = {
  cacheControl?: CacheControlDirectiveResolver<any, any, ContextType>,
};


/**
* @deprecated
* Use "DirectiveResolvers" root object instead. If you wish to get "IDirectiveResolvers", add "typesPrefix: I" to your config.
*/
export type IDirectiveResolvers<ContextType = Context> = DirectiveResolvers<ContextType>;