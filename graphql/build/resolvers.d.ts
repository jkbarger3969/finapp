declare const resolvers: {
    Upload: import("graphql").GraphQLScalarType<unknown, unknown>;
    AuthUser: {
        id: (parent: import("./services/authService").AuthUser) => string;
        canInviteUsers: (parent: import("./services/authService").AuthUser) => boolean;
        departments: (parent: import("./services/authService").AuthUser, _args: unknown, context: {
            dataSources: unknown;
        } & import("./types").ContextBase) => Promise<import("./services/authService").UserPermission[]>;
        invitedBy: (parent: import("./services/authService").AuthUser, _args: unknown, context: {
            dataSources: unknown;
        } & import("./types").ContextBase) => Promise<import("./services/authService").AuthUser>;
    };
    UserPermission: {
        id: (parent: import("./services/authService").UserPermission) => string;
        user: (parent: import("./services/authService").UserPermission, _args: unknown, context: {
            dataSources: unknown;
        } & import("./types").ContextBase) => Promise<import("./services/authService").AuthUser>;
        department: (parent: import("./services/authService").UserPermission, _args: unknown, context: {
            dataSources: unknown;
        } & import("./types").ContextBase) => Promise<import("mongodb").WithId<import("bson").Document>>;
        grantedBy: (parent: import("./services/authService").UserPermission, _args: unknown, context: {
            dataSources: unknown;
        } & import("./types").ContextBase) => Promise<import("./services/authService").AuthUser>;
    };
    AuditLogEntry: {
        id: (parent: import("./services/authService").AuditLogEntry) => string;
        user: (parent: import("./services/authService").AuditLogEntry, _args: unknown, context: {
            dataSources: unknown;
        } & import("./types").ContextBase) => Promise<import("./services/authService").AuthUser>;
    };
    Entry: {
        attachments?: import("./graphTypes").Resolver<import("./graphTypes").ResolverTypeWrapper<import("./graphTypes").Attachment>[], import("./dataSources/accountingDb/types").EntryDbRecord, {
            dataSources: import("./types").DataSources;
        } & import("./types").ContextBase, Record<PropertyKey, never>>;
        category?: import("./graphTypes").Resolver<import("./graphTypes").ResolverTypeWrapper<import("./dataSources/accountingDb/types").CategoryDbRecord>, import("./dataSources/accountingDb/types").EntryDbRecord, {
            dataSources: import("./types").DataSources;
        } & import("./types").ContextBase, Record<PropertyKey, never>>;
        date?: import("./graphTypes").Resolver<import("./graphTypes").ResolverTypeWrapper<Date>, import("./dataSources/accountingDb/types").EntryDbRecord, {
            dataSources: import("./types").DataSources;
        } & import("./types").ContextBase, Record<PropertyKey, never>>;
        dateOfRecord?: import("./graphTypes").Resolver<import("./graphTypes").ResolverTypeWrapper<import("./graphTypes").EntryDateOfRecord>, import("./dataSources/accountingDb/types").EntryDbRecord, {
            dataSources: import("./types").DataSources;
        } & import("./types").ContextBase, Record<PropertyKey, never>>;
        deleted?: import("./graphTypes").Resolver<import("./graphTypes").ResolverTypeWrapper<boolean>, import("./dataSources/accountingDb/types").EntryDbRecord, {
            dataSources: import("./types").DataSources;
        } & import("./types").ContextBase, Record<PropertyKey, never>>;
        department?: import("./graphTypes").Resolver<import("./graphTypes").ResolverTypeWrapper<import("./dataSources/accountingDb/types").DepartmentDbRecord>, import("./dataSources/accountingDb/types").EntryDbRecord, {
            dataSources: import("./types").DataSources;
        } & import("./types").ContextBase, Record<PropertyKey, never>>;
        description?: import("./graphTypes").Resolver<import("./graphTypes").ResolverTypeWrapper<string>, import("./dataSources/accountingDb/types").EntryDbRecord, {
            dataSources: import("./types").DataSources;
        } & import("./types").ContextBase, Record<PropertyKey, never>>;
        editHistory?: import("./graphTypes").Resolver<import("./graphTypes").ResolverTypeWrapper<import("./graphTypes").EditHistoryEntry>[], import("./dataSources/accountingDb/types").EntryDbRecord, {
            dataSources: import("./types").DataSources;
        } & import("./types").ContextBase, Record<PropertyKey, never>>;
        fiscalYear?: import("./graphTypes").Resolver<import("./graphTypes").ResolverTypeWrapper<import("./dataSources/accountingDb/types").FiscalYearDbRecord>, import("./dataSources/accountingDb/types").EntryDbRecord, {
            dataSources: import("./types").DataSources;
        } & import("./types").ContextBase, Record<PropertyKey, never>>;
        id?: import("./graphTypes").Resolver<import("./graphTypes").ResolverTypeWrapper<string>, import("./dataSources/accountingDb/types").EntryDbRecord, {
            dataSources: import("./types").DataSources;
        } & import("./types").ContextBase, Record<PropertyKey, never>>;
        items?: import("./graphTypes").Resolver<import("./graphTypes").ResolverTypeWrapper<import("./dataSources/accountingDb/types").EntryItemDbRecord>[], import("./dataSources/accountingDb/types").EntryDbRecord, {
            dataSources: import("./types").DataSources;
        } & import("./types").ContextBase, Record<PropertyKey, never>>;
        lastEditedAt?: import("./graphTypes").Resolver<import("./graphTypes").ResolverTypeWrapper<Date>, import("./dataSources/accountingDb/types").EntryDbRecord, {
            dataSources: import("./types").DataSources;
        } & import("./types").ContextBase, Record<PropertyKey, never>>;
        lastEditedBy?: import("./graphTypes").Resolver<import("./graphTypes").ResolverTypeWrapper<string>, import("./dataSources/accountingDb/types").EntryDbRecord, {
            dataSources: import("./types").DataSources;
        } & import("./types").ContextBase, Record<PropertyKey, never>>;
        lastUpdate?: import("./graphTypes").Resolver<import("./graphTypes").ResolverTypeWrapper<Date>, import("./dataSources/accountingDb/types").EntryDbRecord, {
            dataSources: import("./types").DataSources;
        } & import("./types").ContextBase, Record<PropertyKey, never>>;
        paymentMethod?: import("./graphTypes").Resolver<import("./graphTypes").ResolverTypeWrapper<import("./graphTypes").PaymentMethodCash | import("./graphTypes").PaymentMethodCombination | import("./graphTypes").PaymentMethodOnline | import("./graphTypes").PaymentMethodUnknown | (import("./graphTypes").Omit<import("./graphTypes").PaymentMethodCard, "card"> & {
            card: import("./graphTypes").ResolverTypeWrapper<import("./graphTypes").PaymentCard | import("./dataSources/accountingDb/types").PaymentCardDbRecord>;
        }) | (import("./graphTypes").Omit<import("./graphTypes").PaymentMethodCheck, "check"> & {
            check: import("./graphTypes").ResolverTypeWrapper<import("./graphTypes").PaymentCheck | (import("./graphTypes").Omit<import("./graphTypes").AccountCheck, "account"> & {
                account: import("./graphTypes").ResolverTypeWrapper<import("./dataSources/accountingDb/types").AccountDbRecord>;
            })>;
        })>, import("./dataSources/accountingDb/types").EntryDbRecord, {
            dataSources: import("./types").DataSources;
        } & import("./types").ContextBase, Record<PropertyKey, never>>;
        reconciled?: import("./graphTypes").Resolver<import("./graphTypes").ResolverTypeWrapper<boolean>, import("./dataSources/accountingDb/types").EntryDbRecord, {
            dataSources: import("./types").DataSources;
        } & import("./types").ContextBase, Record<PropertyKey, never>>;
        refunds?: import("./graphTypes").Resolver<import("./graphTypes").ResolverTypeWrapper<import("./dataSources/accountingDb/types").EntryRefundDbRecord>[], import("./dataSources/accountingDb/types").EntryDbRecord, {
            dataSources: import("./types").DataSources;
        } & import("./types").ContextBase, Record<PropertyKey, never>>;
        source?: import("./graphTypes").Resolver<import("./graphTypes").ResolverTypeWrapper<import("./dataSources/accountingDb/types").BusinessDbRecord | import("./dataSources/accountingDb/types").DepartmentDbRecord | import("./dataSources/accountingDb/types").PersonDbRecord>, import("./dataSources/accountingDb/types").EntryDbRecord, {
            dataSources: import("./types").DataSources;
        } & import("./types").ContextBase, Record<PropertyKey, never>>;
        total?: import("./graphTypes").Resolver<import("./graphTypes").ResolverTypeWrapper<import("fraction.js").default>, import("./dataSources/accountingDb/types").EntryDbRecord, {
            dataSources: import("./types").DataSources;
        } & import("./types").ContextBase, Record<PropertyKey, never>>;
    };
    Query: {
        me: (_parent: unknown, _args: unknown, context: {
            dataSources: unknown;
        } & import("./types").ContextBase) => Promise<import("./services/authService").AuthUser>;
        users: (_parent: unknown, args: {
            where?: Record<string, unknown>;
        }, context: {
            dataSources: unknown;
        } & import("./types").ContextBase) => Promise<import("./services/authService").AuthUser[]>;
        user: (_parent: unknown, args: {
            id: string;
        }, context: {
            dataSources: unknown;
        } & import("./types").ContextBase) => Promise<import("./services/authService").AuthUser>;
        auditLog: (_parent: unknown, args: {
            where?: Record<string, unknown>;
            limit?: number;
            offset?: number;
        }, context: {
            dataSources: unknown;
        } & import("./types").ContextBase) => Promise<import("./services/authService").AuditLogEntry[]>;
        googleAuthUrl: (_parent: unknown, _args: unknown, context: {
            dataSources: unknown;
        } & import("./types").ContextBase) => {
            url: string;
        };
        account?: import("./graphTypes").Resolver<import("./graphTypes").ResolverTypeWrapper<import("./dataSources/accountingDb/types").AccountDbRecord>, Record<PropertyKey, never>, {
            dataSources: import("./types").DataSources;
        } & import("./types").ContextBase, import("./graphTypes").RequireFields<import("./graphTypes").QueryAccountArgs, "id">>;
        accountCard?: import("./graphTypes").Resolver<import("./graphTypes").ResolverTypeWrapper<import("./dataSources/accountingDb/types").PaymentCardDbRecord>, Record<PropertyKey, never>, {
            dataSources: import("./types").DataSources;
        } & import("./types").ContextBase, import("./graphTypes").RequireFields<import("./graphTypes").QueryAccountCardArgs, "id">>;
        accountCards?: import("./graphTypes").Resolver<import("./graphTypes").ResolverTypeWrapper<import("./dataSources/accountingDb/types").PaymentCardDbRecord>[], Record<PropertyKey, never>, {
            dataSources: import("./types").DataSources;
        } & import("./types").ContextBase, Partial<import("./graphTypes").QueryAccountCardsArgs>>;
        accounts?: import("./graphTypes").Resolver<import("./graphTypes").ResolverTypeWrapper<import("./dataSources/accountingDb/types").AccountDbRecord>[], Record<PropertyKey, never>, {
            dataSources: import("./types").DataSources;
        } & import("./types").ContextBase, Partial<import("./graphTypes").QueryAccountsArgs>>;
        attachment?: import("./graphTypes").Resolver<import("./graphTypes").ResolverTypeWrapper<import("./graphTypes").Attachment>, Record<PropertyKey, never>, {
            dataSources: import("./types").DataSources;
        } & import("./types").ContextBase, import("./graphTypes").RequireFields<import("./graphTypes").QueryAttachmentArgs, "id">>;
        attachments?: import("./graphTypes").Resolver<import("./graphTypes").ResolverTypeWrapper<import("./graphTypes").Attachment>[], Record<PropertyKey, never>, {
            dataSources: import("./types").DataSources;
        } & import("./types").ContextBase, Partial<import("./graphTypes").QueryAttachmentsArgs>>;
        budget?: import("./graphTypes").Resolver<import("./graphTypes").ResolverTypeWrapper<import("./dataSources/accountingDb/types").BudgetDbRecord>, Record<PropertyKey, never>, {
            dataSources: import("./types").DataSources;
        } & import("./types").ContextBase, import("./graphTypes").RequireFields<import("./graphTypes").QueryBudgetArgs, "id">>;
        budgets?: import("./graphTypes").Resolver<import("./graphTypes").ResolverTypeWrapper<import("./dataSources/accountingDb/types").BudgetDbRecord>[], Record<PropertyKey, never>, {
            dataSources: import("./types").DataSources;
        } & import("./types").ContextBase, Partial<import("./graphTypes").QueryBudgetsArgs>>;
        business?: import("./graphTypes").Resolver<import("./graphTypes").ResolverTypeWrapper<import("./dataSources/accountingDb/types").BusinessDbRecord>, Record<PropertyKey, never>, {
            dataSources: import("./types").DataSources;
        } & import("./types").ContextBase, import("./graphTypes").RequireFields<import("./graphTypes").QueryBusinessArgs, "id">>;
        businesses?: import("./graphTypes").Resolver<import("./graphTypes").ResolverTypeWrapper<import("./dataSources/accountingDb/types").BusinessDbRecord>[], Record<PropertyKey, never>, {
            dataSources: import("./types").DataSources;
        } & import("./types").ContextBase, Partial<import("./graphTypes").QueryBusinessesArgs>>;
        categories?: import("./graphTypes").Resolver<import("./graphTypes").ResolverTypeWrapper<import("./dataSources/accountingDb/types").CategoryDbRecord>[], Record<PropertyKey, never>, {
            dataSources: import("./types").DataSources;
        } & import("./types").ContextBase, Partial<import("./graphTypes").QueryCategoriesArgs>>;
        category?: import("./graphTypes").Resolver<import("./graphTypes").ResolverTypeWrapper<import("./dataSources/accountingDb/types").CategoryDbRecord>, Record<PropertyKey, never>, {
            dataSources: import("./types").DataSources;
        } & import("./types").ContextBase, import("./graphTypes").RequireFields<import("./graphTypes").QueryCategoryArgs, "id">>;
        categoryGroups?: import("./graphTypes").Resolver<import("./graphTypes").ResolverTypeWrapper<string>[], Record<PropertyKey, never>, {
            dataSources: import("./types").DataSources;
        } & import("./types").ContextBase, Record<PropertyKey, never>>;
        department?: import("./graphTypes").Resolver<import("./graphTypes").ResolverTypeWrapper<import("./dataSources/accountingDb/types").DepartmentDbRecord>, Record<PropertyKey, never>, {
            dataSources: import("./types").DataSources;
        } & import("./types").ContextBase, import("./graphTypes").RequireFields<import("./graphTypes").QueryDepartmentArgs, "id">>;
        departmentBudgetSummaries?: import("./graphTypes").Resolver<import("./graphTypes").ResolverTypeWrapper<import("./graphTypes").DepartmentBudgetSummary>[], Record<PropertyKey, never>, {
            dataSources: import("./types").DataSources;
        } & import("./types").ContextBase, import("./graphTypes").RequireFields<import("./graphTypes").QueryDepartmentBudgetSummariesArgs, "fiscalYearId">>;
        departments?: import("./graphTypes").Resolver<import("./graphTypes").ResolverTypeWrapper<import("./dataSources/accountingDb/types").DepartmentDbRecord>[], Record<PropertyKey, never>, {
            dataSources: import("./types").DataSources;
        } & import("./types").ContextBase, Partial<import("./graphTypes").QueryDepartmentsArgs>>;
        entities?: import("./graphTypes").Resolver<import("./graphTypes").ResolverTypeWrapper<import("./dataSources/accountingDb/types").BusinessDbRecord | import("./dataSources/accountingDb/types").DepartmentDbRecord | import("./dataSources/accountingDb/types").PersonDbRecord>[], Record<PropertyKey, never>, {
            dataSources: import("./types").DataSources;
        } & import("./types").ContextBase, import("./graphTypes").RequireFields<import("./graphTypes").QueryEntitiesArgs, "where">>;
        entries?: import("./graphTypes").Resolver<import("./graphTypes").ResolverTypeWrapper<import("./dataSources/accountingDb/types").EntryDbRecord>[], Record<PropertyKey, never>, {
            dataSources: import("./types").DataSources;
        } & import("./types").ContextBase, import("./graphTypes").RequireFields<import("./graphTypes").QueryEntriesArgs, "filterRefunds" | "limit" | "offset">>;
        entriesCount?: import("./graphTypes").Resolver<import("./graphTypes").ResolverTypeWrapper<number>, Record<PropertyKey, never>, {
            dataSources: import("./types").DataSources;
        } & import("./types").ContextBase, Partial<import("./graphTypes").QueryEntriesCountArgs>>;
        entriesReport?: import("./graphTypes").Resolver<import("./graphTypes").ResolverTypeWrapper<import("./graphTypes").EntriesReport>, Record<PropertyKey, never>, {
            dataSources: import("./types").DataSources;
        } & import("./types").ContextBase, Partial<import("./graphTypes").QueryEntriesReportArgs>>;
        entriesSummary?: import("./graphTypes").Resolver<import("./graphTypes").ResolverTypeWrapper<import("./graphTypes").EntriesSummary>, Record<PropertyKey, never>, {
            dataSources: import("./types").DataSources;
        } & import("./types").ContextBase, Partial<import("./graphTypes").QueryEntriesSummaryArgs>>;
        entry?: import("./graphTypes").Resolver<import("./graphTypes").ResolverTypeWrapper<import("./dataSources/accountingDb/types").EntryDbRecord>, Record<PropertyKey, never>, {
            dataSources: import("./types").DataSources;
        } & import("./types").ContextBase, import("./graphTypes").RequireFields<import("./graphTypes").QueryEntryArgs, "id">>;
        entryItem?: import("./graphTypes").Resolver<import("./graphTypes").ResolverTypeWrapper<import("./dataSources/accountingDb/types").EntryItemDbRecord>, Record<PropertyKey, never>, {
            dataSources: import("./types").DataSources;
        } & import("./types").ContextBase, import("./graphTypes").RequireFields<import("./graphTypes").QueryEntryItemArgs, "id">>;
        entryRefund?: import("./graphTypes").Resolver<import("./graphTypes").ResolverTypeWrapper<import("./dataSources/accountingDb/types").EntryRefundDbRecord>, Record<PropertyKey, never>, {
            dataSources: import("./types").DataSources;
        } & import("./types").ContextBase, import("./graphTypes").RequireFields<import("./graphTypes").QueryEntryRefundArgs, "id">>;
        entryRefunds?: import("./graphTypes").Resolver<import("./graphTypes").ResolverTypeWrapper<import("./dataSources/accountingDb/types").EntryRefundDbRecord>[], Record<PropertyKey, never>, {
            dataSources: import("./types").DataSources;
        } & import("./types").ContextBase, Partial<import("./graphTypes").QueryEntryRefundsArgs>>;
        exportFiscalYear?: import("./graphTypes").Resolver<import("./graphTypes").ResolverTypeWrapper<import("./graphTypes").Omit<import("./graphTypes").FiscalYearExport, "fiscalYear" | "budgets" | "entries"> & {
            budgets: import("./graphTypes").ResolverTypeWrapper<import("./dataSources/accountingDb/types").BudgetDbRecord>[];
            entries: import("./graphTypes").ResolverTypeWrapper<import("./dataSources/accountingDb/types").EntryDbRecord>[];
            fiscalYear: import("./graphTypes").ResolverTypeWrapper<import("./dataSources/accountingDb/types").FiscalYearDbRecord>;
        }>, Record<PropertyKey, never>, {
            dataSources: import("./types").DataSources;
        } & import("./types").ContextBase, import("./graphTypes").RequireFields<import("./graphTypes").QueryExportFiscalYearArgs, "id">>;
        fiscalYear?: import("./graphTypes").Resolver<import("./graphTypes").ResolverTypeWrapper<import("./dataSources/accountingDb/types").FiscalYearDbRecord>, Record<PropertyKey, never>, {
            dataSources: import("./types").DataSources;
        } & import("./types").ContextBase, import("./graphTypes").RequireFields<import("./graphTypes").QueryFiscalYearArgs, "id">>;
        fiscalYears?: import("./graphTypes").Resolver<import("./graphTypes").ResolverTypeWrapper<import("./dataSources/accountingDb/types").FiscalYearDbRecord>[], Record<PropertyKey, never>, {
            dataSources: import("./types").DataSources;
        } & import("./types").ContextBase, Partial<import("./graphTypes").QueryFiscalYearsArgs>>;
        people?: import("./graphTypes").Resolver<import("./graphTypes").ResolverTypeWrapper<import("./dataSources/accountingDb/types").PersonDbRecord>[], Record<PropertyKey, never>, {
            dataSources: import("./types").DataSources;
        } & import("./types").ContextBase, Partial<import("./graphTypes").QueryPeopleArgs>>;
        person?: import("./graphTypes").Resolver<import("./graphTypes").ResolverTypeWrapper<import("./dataSources/accountingDb/types").PersonDbRecord>, Record<PropertyKey, never>, {
            dataSources: import("./types").DataSources;
        } & import("./types").ContextBase, import("./graphTypes").RequireFields<import("./graphTypes").QueryPersonArgs, "id">>;
        searchEntries?: import("./graphTypes").Resolver<import("./graphTypes").ResolverTypeWrapper<import("./dataSources/accountingDb/types").EntryDbRecord>[], Record<PropertyKey, never>, {
            dataSources: import("./types").DataSources;
        } & import("./types").ContextBase, import("./graphTypes").RequireFields<import("./graphTypes").QuerySearchEntriesArgs, "limit" | "query">>;
        sources?: import("./graphTypes").Resolver<import("./graphTypes").ResolverTypeWrapper<import("./dataSources/accountingDb/types").BusinessDbRecord | import("./dataSources/accountingDb/types").DepartmentDbRecord | import("./dataSources/accountingDb/types").PersonDbRecord>[], Record<PropertyKey, never>, {
            dataSources: import("./types").DataSources;
        } & import("./types").ContextBase, import("./graphTypes").RequireFields<import("./graphTypes").QuerySourcesArgs, "searchByName">>;
    };
    Mutation: {
        googleAuth: (_parent: unknown, args: {
            code: string;
        }, context: {
            dataSources: unknown;
        } & import("./types").ContextBase) => Promise<{
            token: string;
            user: import("./services/authService").AuthUser;
        }>;
        logout: (_parent: unknown, _args: unknown, context: {
            dataSources: unknown;
        } & import("./types").ContextBase) => Promise<boolean>;
        inviteUser: (_parent: unknown, args: {
            input: {
                email: string;
                name: string;
                role?: string;
                canInviteUsers?: boolean;
                permissions?: {
                    departmentId: string;
                    accessLevel: string;
                }[];
            };
        }, context: {
            dataSources: unknown;
        } & import("./types").ContextBase) => Promise<import("./services/authService").AuthUser>;
        updateUser: (_parent: unknown, args: {
            id: string;
            input: {
                name?: string;
                role?: string;
                status?: string;
                canInviteUsers?: boolean;
            };
        }, context: {
            dataSources: unknown;
        } & import("./types").ContextBase) => Promise<import("./services/authService").AuthUser>;
        deleteUser: (_parent: unknown, args: {
            id: string;
        }, context: {
            dataSources: unknown;
        } & import("./types").ContextBase) => Promise<boolean>;
        grantPermission: (_parent: unknown, args: {
            input: {
                userId: string;
                departmentId: string;
                accessLevel: string;
            };
        }, context: {
            dataSources: unknown;
        } & import("./types").ContextBase) => Promise<import("./services/authService").UserPermission>;
        revokePermission: (_parent: unknown, args: {
            input: {
                userId: string;
                departmentId: string;
            };
        }, context: {
            dataSources: unknown;
        } & import("./types").ContextBase) => Promise<boolean>;
        addNewBusiness?: import("./graphTypes").Resolver<import("./graphTypes").ResolverTypeWrapper<import("./dataSources/accountingDb/types").BusinessDbRecord>, Record<PropertyKey, never>, {
            dataSources: import("./types").DataSources;
        } & import("./types").ContextBase, import("./graphTypes").RequireFields<import("./graphTypes").MutationAddNewBusinessArgs, "input">>;
        addNewEntry?: import("./graphTypes").Resolver<import("./graphTypes").ResolverTypeWrapper<import("./graphTypes").Omit<import("./graphTypes").AddNewEntryPayload, "newEntry"> & {
            newEntry: import("./graphTypes").ResolverTypeWrapper<import("./dataSources/accountingDb/types").EntryDbRecord>;
        }>, Record<PropertyKey, never>, {
            dataSources: import("./types").DataSources;
        } & import("./types").ContextBase, import("./graphTypes").RequireFields<import("./graphTypes").MutationAddNewEntryArgs, "input">>;
        addNewEntryRefund?: import("./graphTypes").Resolver<import("./graphTypes").ResolverTypeWrapper<import("./graphTypes").Omit<import("./graphTypes").AddNewEntryRefundPayload, "newEntryRefund"> & {
            newEntryRefund: import("./graphTypes").ResolverTypeWrapper<import("./dataSources/accountingDb/types").EntryRefundDbRecord>;
        }>, Record<PropertyKey, never>, {
            dataSources: import("./types").DataSources;
        } & import("./types").ContextBase, import("./graphTypes").RequireFields<import("./graphTypes").MutationAddNewEntryRefundArgs, "input">>;
        addNewPerson?: import("./graphTypes").Resolver<import("./graphTypes").ResolverTypeWrapper<import("./graphTypes").Omit<import("./graphTypes").AddNewPersonPayload, "newPerson"> & {
            newPerson: import("./graphTypes").ResolverTypeWrapper<import("./dataSources/accountingDb/types").PersonDbRecord>;
        }>, Record<PropertyKey, never>, {
            dataSources: import("./types").DataSources;
        } & import("./types").ContextBase, import("./graphTypes").RequireFields<import("./graphTypes").MutationAddNewPersonArgs, "input">>;
        archiveFiscalYear?: import("./graphTypes").Resolver<import("./graphTypes").ResolverTypeWrapper<import("./graphTypes").Omit<import("./graphTypes").ArchiveFiscalYearPayload, "fiscalYear"> & {
            fiscalYear: import("./graphTypes").ResolverTypeWrapper<import("./dataSources/accountingDb/types").FiscalYearDbRecord>;
        }>, Record<PropertyKey, never>, {
            dataSources: import("./types").DataSources;
        } & import("./types").ContextBase, import("./graphTypes").RequireFields<import("./graphTypes").MutationArchiveFiscalYearArgs, "id">>;
        createAccountCard?: import("./graphTypes").Resolver<import("./graphTypes").ResolverTypeWrapper<import("./dataSources/accountingDb/types").PaymentCardDbRecord>, Record<PropertyKey, never>, {
            dataSources: import("./types").DataSources;
        } & import("./types").ContextBase, import("./graphTypes").RequireFields<import("./graphTypes").MutationCreateAccountCardArgs, "input">>;
        createFiscalYear?: import("./graphTypes").Resolver<import("./graphTypes").ResolverTypeWrapper<import("./graphTypes").Omit<import("./graphTypes").CreateFiscalYearPayload, "fiscalYear"> & {
            fiscalYear: import("./graphTypes").ResolverTypeWrapper<import("./dataSources/accountingDb/types").FiscalYearDbRecord>;
        }>, Record<PropertyKey, never>, {
            dataSources: import("./types").DataSources;
        } & import("./types").ContextBase, import("./graphTypes").RequireFields<import("./graphTypes").MutationCreateFiscalYearArgs, "input">>;
        deleteAccountCard?: import("./graphTypes").Resolver<import("./graphTypes").ResolverTypeWrapper<boolean>, Record<PropertyKey, never>, {
            dataSources: import("./types").DataSources;
        } & import("./types").ContextBase, import("./graphTypes").RequireFields<import("./graphTypes").MutationDeleteAccountCardArgs, "id">>;
        deleteAttachment?: import("./graphTypes").Resolver<import("./graphTypes").ResolverTypeWrapper<import("./graphTypes").Omit<import("./graphTypes").DeleteAttachmentPayload, "deletedAttachment"> & {
            deletedAttachment: import("./graphTypes").ResolverTypeWrapper<import("./graphTypes").Attachment>;
        }>, Record<PropertyKey, never>, {
            dataSources: import("./types").DataSources;
        } & import("./types").ContextBase, import("./graphTypes").RequireFields<import("./graphTypes").MutationDeleteAttachmentArgs, "id">>;
        deleteBudget?: import("./graphTypes").Resolver<import("./graphTypes").ResolverTypeWrapper<import("./graphTypes").DeleteBudgetResult>, Record<PropertyKey, never>, {
            dataSources: import("./types").DataSources;
        } & import("./types").ContextBase, import("./graphTypes").RequireFields<import("./graphTypes").MutationDeleteBudgetArgs, "input">>;
        deleteEntry?: import("./graphTypes").Resolver<import("./graphTypes").ResolverTypeWrapper<import("./graphTypes").Omit<import("./graphTypes").DeleteEntryPayload, "deletedEntry"> & {
            deletedEntry: import("./graphTypes").ResolverTypeWrapper<import("./dataSources/accountingDb/types").EntryDbRecord>;
        }>, Record<PropertyKey, never>, {
            dataSources: import("./types").DataSources;
        } & import("./types").ContextBase, import("./graphTypes").RequireFields<import("./graphTypes").MutationDeleteEntryArgs, "id">>;
        deleteEntryRefund?: import("./graphTypes").Resolver<import("./graphTypes").ResolverTypeWrapper<import("./graphTypes").Omit<import("./graphTypes").DeleteEntryRefundPayload, "deletedEntryRefund"> & {
            deletedEntryRefund: import("./graphTypes").ResolverTypeWrapper<import("./dataSources/accountingDb/types").EntryRefundDbRecord>;
        }>, Record<PropertyKey, never>, {
            dataSources: import("./types").DataSources;
        } & import("./types").ContextBase, import("./graphTypes").RequireFields<import("./graphTypes").MutationDeleteEntryRefundArgs, "id">>;
        deleteFiscalYear?: import("./graphTypes").Resolver<import("./graphTypes").ResolverTypeWrapper<import("./graphTypes").DeleteFiscalYearPayload>, Record<PropertyKey, never>, {
            dataSources: import("./types").DataSources;
        } & import("./types").ContextBase, import("./graphTypes").RequireFields<import("./graphTypes").MutationDeleteFiscalYearArgs, "id">>;
        reconcileEntries?: import("./graphTypes").Resolver<import("./graphTypes").ResolverTypeWrapper<import("./graphTypes").Omit<import("./graphTypes").ReconcileEntriesPayload, "reconciledEntries" | "reconciledRefunds"> & {
            reconciledEntries: import("./graphTypes").ResolverTypeWrapper<import("./dataSources/accountingDb/types").EntryDbRecord>[];
            reconciledRefunds: import("./graphTypes").ResolverTypeWrapper<import("./dataSources/accountingDb/types").EntryRefundDbRecord>[];
        }>, Record<PropertyKey, never>, {
            dataSources: import("./types").DataSources;
        } & import("./types").ContextBase, Partial<import("./graphTypes").MutationReconcileEntriesArgs>>;
        restoreFiscalYear?: import("./graphTypes").Resolver<import("./graphTypes").ResolverTypeWrapper<import("./graphTypes").Omit<import("./graphTypes").RestoreFiscalYearPayload, "fiscalYear"> & {
            fiscalYear: import("./graphTypes").ResolverTypeWrapper<import("./dataSources/accountingDb/types").FiscalYearDbRecord>;
        }>, Record<PropertyKey, never>, {
            dataSources: import("./types").DataSources;
        } & import("./types").ContextBase, import("./graphTypes").RequireFields<import("./graphTypes").MutationRestoreFiscalYearArgs, "id">>;
        updateAccountCard?: import("./graphTypes").Resolver<import("./graphTypes").ResolverTypeWrapper<import("./dataSources/accountingDb/types").PaymentCardDbRecord>, Record<PropertyKey, never>, {
            dataSources: import("./types").DataSources;
        } & import("./types").ContextBase, import("./graphTypes").RequireFields<import("./graphTypes").MutationUpdateAccountCardArgs, "input" | "id">>;
        updateBusiness?: import("./graphTypes").Resolver<import("./graphTypes").ResolverTypeWrapper<import("./graphTypes").Omit<import("./graphTypes").UpdateBusinessPayload, "business"> & {
            business: import("./graphTypes").ResolverTypeWrapper<import("./dataSources/accountingDb/types").BusinessDbRecord>;
        }>, Record<PropertyKey, never>, {
            dataSources: import("./types").DataSources;
        } & import("./types").ContextBase, import("./graphTypes").RequireFields<import("./graphTypes").MutationUpdateBusinessArgs, "input" | "id">>;
        updateCategory?: import("./graphTypes").Resolver<import("./graphTypes").ResolverTypeWrapper<import("./graphTypes").Omit<import("./graphTypes").UpdateCategoryPayload, "category"> & {
            category: import("./graphTypes").ResolverTypeWrapper<import("./dataSources/accountingDb/types").CategoryDbRecord>;
        }>, Record<PropertyKey, never>, {
            dataSources: import("./types").DataSources;
        } & import("./types").ContextBase, import("./graphTypes").RequireFields<import("./graphTypes").MutationUpdateCategoryArgs, "input" | "id">>;
        updateEntry?: import("./graphTypes").Resolver<import("./graphTypes").ResolverTypeWrapper<import("./graphTypes").Omit<import("./graphTypes").UpdateEntryPayload, "updatedEntry"> & {
            updatedEntry: import("./graphTypes").ResolverTypeWrapper<import("./dataSources/accountingDb/types").EntryDbRecord>;
        }>, Record<PropertyKey, never>, {
            dataSources: import("./types").DataSources;
        } & import("./types").ContextBase, import("./graphTypes").RequireFields<import("./graphTypes").MutationUpdateEntryArgs, "input">>;
        updateEntryRefund?: import("./graphTypes").Resolver<import("./graphTypes").ResolverTypeWrapper<import("./graphTypes").Omit<import("./graphTypes").UpdateEntryRefundPayload, "updatedEntryRefund"> & {
            updatedEntryRefund: import("./graphTypes").ResolverTypeWrapper<import("./dataSources/accountingDb/types").EntryRefundDbRecord>;
        }>, Record<PropertyKey, never>, {
            dataSources: import("./types").DataSources;
        } & import("./types").ContextBase, import("./graphTypes").RequireFields<import("./graphTypes").MutationUpdateEntryRefundArgs, "input">>;
        updatePerson?: import("./graphTypes").Resolver<import("./graphTypes").ResolverTypeWrapper<import("./graphTypes").Omit<import("./graphTypes").UpdatePersonPayload, "person"> & {
            person: import("./graphTypes").ResolverTypeWrapper<import("./dataSources/accountingDb/types").PersonDbRecord>;
        }>, Record<PropertyKey, never>, {
            dataSources: import("./types").DataSources;
        } & import("./types").ContextBase, import("./graphTypes").RequireFields<import("./graphTypes").MutationUpdatePersonArgs, "input" | "id">>;
        uploadReceipt?: import("./graphTypes").Resolver<import("./graphTypes").ResolverTypeWrapper<import("./graphTypes").Omit<import("./graphTypes").UploadReceiptPayload, "attachment"> & {
            attachment: import("./graphTypes").ResolverTypeWrapper<import("./graphTypes").Attachment>;
        }>, Record<PropertyKey, never>, {
            dataSources: import("./types").DataSources;
        } & import("./types").ContextBase, import("./graphTypes").RequireFields<import("./graphTypes").MutationUploadReceiptArgs, "entryId" | "file">>;
        upsertBudget?: import("./graphTypes").Resolver<import("./graphTypes").ResolverTypeWrapper<import("./graphTypes").Omit<import("./graphTypes").UpsertBudgetResult, "budget"> & {
            budget: import("./graphTypes").ResolverTypeWrapper<import("./dataSources/accountingDb/types").BudgetDbRecord>;
        }>, Record<PropertyKey, never>, {
            dataSources: import("./types").DataSources;
        } & import("./types").ContextBase, import("./graphTypes").RequireFields<import("./graphTypes").MutationUpsertBudgetArgs, "input">>;
    };
    AccountCard?: import("./graphTypes").AccountCardResolvers<{
        dataSources: import("./types").DataSources;
    } & import("./types").ContextBase, import("./dataSources/accountingDb/types").PaymentCardDbRecord>;
    AccountCheck?: import("./graphTypes").AccountCheckResolvers<{
        dataSources: import("./types").DataSources;
    } & import("./types").ContextBase, import("./graphTypes").Omit<import("./graphTypes").AccountCheck, "account"> & {
        account: import("./dataSources/accountingDb/types").AccountDbRecord;
    }>;
    AccountChecking?: import("./graphTypes").AccountCheckingResolvers<{
        dataSources: import("./types").DataSources;
    } & import("./types").ContextBase, import("./dataSources/accountingDb/types").AccountDbRecord>;
    AccountCreditCard?: import("./graphTypes").AccountCreditCardResolvers<{
        dataSources: import("./types").DataSources;
    } & import("./types").ContextBase, import("./graphTypes").Omit<import("./graphTypes").AccountCreditCard, "cards" | "owner"> & {
        cards: import("./dataSources/accountingDb/types").PaymentCardDbRecord[];
        owner: import("./dataSources/accountingDb/types").BusinessDbRecord | import("./dataSources/accountingDb/types").DepartmentDbRecord | import("./dataSources/accountingDb/types").PersonDbRecord;
    }>;
    AccountInterface?: import("./graphTypes").AccountInterfaceResolvers<{
        dataSources: import("./types").DataSources;
    } & import("./types").ContextBase, import("./dataSources/accountingDb/types").AccountDbRecord>;
    AccountWithCardsInterface?: import("./graphTypes").AccountWithCardsInterfaceResolvers<{
        dataSources: import("./types").DataSources;
    } & import("./types").ContextBase, import("./dataSources/accountingDb/types").AccountDbRecord>;
    AddNewEntryPayload?: import("./graphTypes").AddNewEntryPayloadResolvers<{
        dataSources: import("./types").DataSources;
    } & import("./types").ContextBase, import("./graphTypes").Omit<import("./graphTypes").AddNewEntryPayload, "newEntry"> & {
        newEntry: import("./dataSources/accountingDb/types").EntryDbRecord;
    }>;
    AddNewEntryRefundPayload?: import("./graphTypes").AddNewEntryRefundPayloadResolvers<{
        dataSources: import("./types").DataSources;
    } & import("./types").ContextBase, import("./graphTypes").Omit<import("./graphTypes").AddNewEntryRefundPayload, "newEntryRefund"> & {
        newEntryRefund: import("./dataSources/accountingDb/types").EntryRefundDbRecord;
    }>;
    AddNewPersonPayload?: import("./graphTypes").AddNewPersonPayloadResolvers<{
        dataSources: import("./types").DataSources;
    } & import("./types").ContextBase, import("./graphTypes").Omit<import("./graphTypes").AddNewPersonPayload, "newPerson"> & {
        newPerson: import("./dataSources/accountingDb/types").PersonDbRecord;
    }>;
    Alias?: import("./graphTypes").AliasResolvers<{
        dataSources: import("./types").DataSources;
    } & import("./types").ContextBase, import("./dataSources/accountingDb/types").AliasTypeDbRecord>;
    Aliasable?: import("./graphTypes").AliasableResolvers<{
        dataSources: import("./types").DataSources;
    } & import("./types").ContextBase, import("./dataSources/accountingDb/types").PaymentCardDbRecord>;
    ArchiveFiscalYearPayload?: import("./graphTypes").ArchiveFiscalYearPayloadResolvers<{
        dataSources: import("./types").DataSources;
    } & import("./types").ContextBase, import("./graphTypes").Omit<import("./graphTypes").ArchiveFiscalYearPayload, "fiscalYear"> & {
        fiscalYear: import("./dataSources/accountingDb/types").FiscalYearDbRecord;
    }>;
    Attachment?: import("./graphTypes").AttachmentResolvers<{
        dataSources: import("./types").DataSources;
    } & import("./types").ContextBase, import("./graphTypes").Attachment>;
    AuthPayload?: import("./graphTypes").AuthPayloadResolvers<{
        dataSources: import("./types").DataSources;
    } & import("./types").ContextBase, import("./graphTypes").Omit<import("./graphTypes").AuthPayload, "user"> & {
        user: import("./graphTypes").Omit<import("./graphTypes").AuthUser, "departments" | "invitedBy"> & {
            departments: (import("./graphTypes").Omit<import("./graphTypes").UserPermission, "department" | "user" | "grantedBy"> & {
                department: import("./dataSources/accountingDb/types").DepartmentDbRecord;
                grantedBy: import("./graphTypes").Omit<import("./graphTypes").AuthUser, "departments" | "invitedBy"> & any;
                user: import("./graphTypes").Omit<import("./graphTypes").AuthUser, "departments" | "invitedBy"> & any;
            })[];
            invitedBy?: import("./graphTypes").Omit<import("./graphTypes").AuthUser, "departments" | "invitedBy"> & any;
        };
    }>;
    Budget?: import("./graphTypes").BudgetResolvers<{
        dataSources: import("./types").DataSources;
    } & import("./types").ContextBase, import("./dataSources/accountingDb/types").BudgetDbRecord>;
    BudgetOwner?: import("./graphTypes").BudgetOwnerResolvers<{
        dataSources: import("./types").DataSources;
    } & import("./types").ContextBase, import("./dataSources/accountingDb/types").BusinessDbRecord | import("./dataSources/accountingDb/types").DepartmentDbRecord>;
    Business?: import("./graphTypes").BusinessResolvers<{
        dataSources: import("./types").DataSources;
    } & import("./types").ContextBase, import("./dataSources/accountingDb/types").BusinessDbRecord>;
    Category?: import("./graphTypes").CategoryResolvers<{
        dataSources: import("./types").DataSources;
    } & import("./types").ContextBase, import("./dataSources/accountingDb/types").CategoryDbRecord>;
    CreateFiscalYearPayload?: import("./graphTypes").CreateFiscalYearPayloadResolvers<{
        dataSources: import("./types").DataSources;
    } & import("./types").ContextBase, import("./graphTypes").Omit<import("./graphTypes").CreateFiscalYearPayload, "fiscalYear"> & {
        fiscalYear: import("./dataSources/accountingDb/types").FiscalYearDbRecord;
    }>;
    Date?: import("graphql").GraphQLScalarType<unknown, unknown>;
    DeleteAttachmentPayload?: import("./graphTypes").DeleteAttachmentPayloadResolvers<{
        dataSources: import("./types").DataSources;
    } & import("./types").ContextBase, import("./graphTypes").Omit<import("./graphTypes").DeleteAttachmentPayload, "deletedAttachment"> & {
        deletedAttachment: import("./graphTypes").Attachment;
    }>;
    DeleteBudgetResult?: import("./graphTypes").DeleteBudgetResultResolvers<{
        dataSources: import("./types").DataSources;
    } & import("./types").ContextBase, import("./graphTypes").DeleteBudgetResult>;
    DeleteEntryPayload?: import("./graphTypes").DeleteEntryPayloadResolvers<{
        dataSources: import("./types").DataSources;
    } & import("./types").ContextBase, import("./graphTypes").Omit<import("./graphTypes").DeleteEntryPayload, "deletedEntry"> & {
        deletedEntry: import("./dataSources/accountingDb/types").EntryDbRecord;
    }>;
    DeleteEntryRefundPayload?: import("./graphTypes").DeleteEntryRefundPayloadResolvers<{
        dataSources: import("./types").DataSources;
    } & import("./types").ContextBase, import("./graphTypes").Omit<import("./graphTypes").DeleteEntryRefundPayload, "deletedEntryRefund"> & {
        deletedEntryRefund: import("./dataSources/accountingDb/types").EntryRefundDbRecord;
    }>;
    DeleteFiscalYearPayload?: import("./graphTypes").DeleteFiscalYearPayloadResolvers<{
        dataSources: import("./types").DataSources;
    } & import("./types").ContextBase, import("./graphTypes").DeleteFiscalYearPayload>;
    Department?: import("./graphTypes").DepartmentResolvers<{
        dataSources: import("./types").DataSources;
    } & import("./types").ContextBase, import("./dataSources/accountingDb/types").DepartmentDbRecord>;
    DepartmentAncestor?: import("./graphTypes").DepartmentAncestorResolvers<{
        dataSources: import("./types").DataSources;
    } & import("./types").ContextBase, import("./dataSources/accountingDb/types").BusinessDbRecord | import("./dataSources/accountingDb/types").DepartmentDbRecord>;
    DepartmentBudgetSummary?: import("./graphTypes").DepartmentBudgetSummaryResolvers<{
        dataSources: import("./types").DataSources;
    } & import("./types").ContextBase, import("./graphTypes").DepartmentBudgetSummary>;
    EditHistoryEntry?: import("./graphTypes").EditHistoryEntryResolvers<{
        dataSources: import("./types").DataSources;
    } & import("./types").ContextBase, import("./graphTypes").EditHistoryEntry>;
    Entity?: import("./graphTypes").EntityResolvers<{
        dataSources: import("./types").DataSources;
    } & import("./types").ContextBase, import("./dataSources/accountingDb/types").BusinessDbRecord | import("./dataSources/accountingDb/types").DepartmentDbRecord | import("./dataSources/accountingDb/types").PersonDbRecord>;
    EntriesReport?: import("./graphTypes").EntriesReportResolvers<{
        dataSources: import("./types").DataSources;
    } & import("./types").ContextBase, import("./graphTypes").EntriesReport>;
    EntriesSummary?: import("./graphTypes").EntriesSummaryResolvers<{
        dataSources: import("./types").DataSources;
    } & import("./types").ContextBase, import("./graphTypes").EntriesSummary>;
    EntryDateOfRecord?: import("./graphTypes").EntryDateOfRecordResolvers<{
        dataSources: import("./types").DataSources;
    } & import("./types").ContextBase, import("./graphTypes").EntryDateOfRecord>;
    EntryItem?: import("./graphTypes").EntryItemResolvers<{
        dataSources: import("./types").DataSources;
    } & import("./types").ContextBase, import("./dataSources/accountingDb/types").EntryItemDbRecord>;
    EntryRefund?: import("./graphTypes").EntryRefundResolvers<{
        dataSources: import("./types").DataSources;
    } & import("./types").ContextBase, import("./dataSources/accountingDb/types").EntryRefundDbRecord>;
    FiscalYear?: import("./graphTypes").FiscalYearResolvers<{
        dataSources: import("./types").DataSources;
    } & import("./types").ContextBase, import("./dataSources/accountingDb/types").FiscalYearDbRecord>;
    FiscalYearExport?: import("./graphTypes").FiscalYearExportResolvers<{
        dataSources: import("./types").DataSources;
    } & import("./types").ContextBase, import("./graphTypes").Omit<import("./graphTypes").FiscalYearExport, "fiscalYear" | "budgets" | "entries"> & {
        budgets: import("./dataSources/accountingDb/types").BudgetDbRecord[];
        entries: import("./dataSources/accountingDb/types").EntryDbRecord[];
        fiscalYear: import("./dataSources/accountingDb/types").FiscalYearDbRecord;
    }>;
    GoogleAuthUrl?: import("./graphTypes").GoogleAuthUrlResolvers<{
        dataSources: import("./types").DataSources;
    } & import("./types").ContextBase, import("./graphTypes").GoogleAuthUrl>;
    JSON?: import("graphql").GraphQLScalarType<unknown, unknown>;
    PaymentCard?: import("./graphTypes").PaymentCardResolvers<{
        dataSources: import("./types").DataSources;
    } & import("./types").ContextBase, import("./graphTypes").PaymentCard>;
    PaymentCardInterface?: import("./graphTypes").PaymentCardInterfaceResolvers<{
        dataSources: import("./types").DataSources;
    } & import("./types").ContextBase, import("./graphTypes").PaymentCard | import("./dataSources/accountingDb/types").PaymentCardDbRecord>;
    PaymentCheck?: import("./graphTypes").PaymentCheckResolvers<{
        dataSources: import("./types").DataSources;
    } & import("./types").ContextBase, import("./graphTypes").PaymentCheck>;
    PaymentCheckInterface?: import("./graphTypes").PaymentCheckInterfaceResolvers<{
        dataSources: import("./types").DataSources;
    } & import("./types").ContextBase, import("./graphTypes").PaymentCheck | (import("./graphTypes").Omit<import("./graphTypes").AccountCheck, "account"> & {
        account: import("./dataSources/accountingDb/types").AccountDbRecord;
    })>;
    PaymentMethodCard?: import("./graphTypes").PaymentMethodCardResolvers<{
        dataSources: import("./types").DataSources;
    } & import("./types").ContextBase, import("./graphTypes").Omit<import("./graphTypes").PaymentMethodCard, "card"> & {
        card: import("./graphTypes").PaymentCard | import("./dataSources/accountingDb/types").PaymentCardDbRecord;
    }>;
    PaymentMethodCash?: import("./graphTypes").PaymentMethodCashResolvers<{
        dataSources: import("./types").DataSources;
    } & import("./types").ContextBase, import("./graphTypes").PaymentMethodCash>;
    PaymentMethodCheck?: import("./graphTypes").PaymentMethodCheckResolvers<{
        dataSources: import("./types").DataSources;
    } & import("./types").ContextBase, import("./graphTypes").Omit<import("./graphTypes").PaymentMethodCheck, "check"> & {
        check: import("./graphTypes").PaymentCheck | (import("./graphTypes").Omit<import("./graphTypes").AccountCheck, "account"> & {
            account: import("./dataSources/accountingDb/types").AccountDbRecord;
        });
    }>;
    PaymentMethodCombination?: import("./graphTypes").PaymentMethodCombinationResolvers<{
        dataSources: import("./types").DataSources;
    } & import("./types").ContextBase, import("./graphTypes").PaymentMethodCombination>;
    PaymentMethodInterface?: import("./graphTypes").PaymentMethodInterfaceResolvers<{
        dataSources: import("./types").DataSources;
    } & import("./types").ContextBase, import("./graphTypes").PaymentMethodCash | import("./graphTypes").PaymentMethodCombination | import("./graphTypes").PaymentMethodOnline | import("./graphTypes").PaymentMethodUnknown | (import("./graphTypes").Omit<import("./graphTypes").PaymentMethodCard, "card"> & {
        card: import("./graphTypes").PaymentCard | import("./dataSources/accountingDb/types").PaymentCardDbRecord;
    }) | (import("./graphTypes").Omit<import("./graphTypes").PaymentMethodCheck, "check"> & {
        check: import("./graphTypes").PaymentCheck | (import("./graphTypes").Omit<import("./graphTypes").AccountCheck, "account"> & {
            account: import("./dataSources/accountingDb/types").AccountDbRecord;
        });
    })>;
    PaymentMethodOnline?: import("./graphTypes").PaymentMethodOnlineResolvers<{
        dataSources: import("./types").DataSources;
    } & import("./types").ContextBase, import("./graphTypes").PaymentMethodOnline>;
    PaymentMethodUnknown?: import("./graphTypes").PaymentMethodUnknownResolvers<{
        dataSources: import("./types").DataSources;
    } & import("./types").ContextBase, import("./graphTypes").PaymentMethodUnknown>;
    Person?: import("./graphTypes").PersonResolvers<{
        dataSources: import("./types").DataSources;
    } & import("./types").ContextBase, import("./dataSources/accountingDb/types").PersonDbRecord>;
    PersonName?: import("./graphTypes").PersonNameResolvers<{
        dataSources: import("./types").DataSources;
    } & import("./types").ContextBase, import("./graphTypes").PersonName>;
    Rational?: import("graphql").GraphQLScalarType<unknown, unknown>;
    ReconcileEntriesPayload?: import("./graphTypes").ReconcileEntriesPayloadResolvers<{
        dataSources: import("./types").DataSources;
    } & import("./types").ContextBase, import("./graphTypes").Omit<import("./graphTypes").ReconcileEntriesPayload, "reconciledEntries" | "reconciledRefunds"> & {
        reconciledEntries: import("./dataSources/accountingDb/types").EntryDbRecord[];
        reconciledRefunds: import("./dataSources/accountingDb/types").EntryRefundDbRecord[];
    }>;
    RestoreFiscalYearPayload?: import("./graphTypes").RestoreFiscalYearPayloadResolvers<{
        dataSources: import("./types").DataSources;
    } & import("./types").ContextBase, import("./graphTypes").Omit<import("./graphTypes").RestoreFiscalYearPayload, "fiscalYear"> & {
        fiscalYear: import("./dataSources/accountingDb/types").FiscalYearDbRecord;
    }>;
    Source?: import("./graphTypes").SourceResolvers<{
        dataSources: import("./types").DataSources;
    } & import("./types").ContextBase, import("./dataSources/accountingDb/types").BusinessDbRecord | import("./dataSources/accountingDb/types").DepartmentDbRecord | import("./dataSources/accountingDb/types").PersonDbRecord>;
    Subscription?: import("./graphTypes").SubscriptionResolvers<{
        dataSources: import("./types").DataSources;
    } & import("./types").ContextBase, Record<PropertyKey, never>>;
    UpdateBusinessPayload?: import("./graphTypes").UpdateBusinessPayloadResolvers<{
        dataSources: import("./types").DataSources;
    } & import("./types").ContextBase, import("./graphTypes").Omit<import("./graphTypes").UpdateBusinessPayload, "business"> & {
        business: import("./dataSources/accountingDb/types").BusinessDbRecord;
    }>;
    UpdateCategoryPayload?: import("./graphTypes").UpdateCategoryPayloadResolvers<{
        dataSources: import("./types").DataSources;
    } & import("./types").ContextBase, import("./graphTypes").Omit<import("./graphTypes").UpdateCategoryPayload, "category"> & {
        category: import("./dataSources/accountingDb/types").CategoryDbRecord;
    }>;
    UpdateEntryPayload?: import("./graphTypes").UpdateEntryPayloadResolvers<{
        dataSources: import("./types").DataSources;
    } & import("./types").ContextBase, import("./graphTypes").Omit<import("./graphTypes").UpdateEntryPayload, "updatedEntry"> & {
        updatedEntry: import("./dataSources/accountingDb/types").EntryDbRecord;
    }>;
    UpdateEntryRefundPayload?: import("./graphTypes").UpdateEntryRefundPayloadResolvers<{
        dataSources: import("./types").DataSources;
    } & import("./types").ContextBase, import("./graphTypes").Omit<import("./graphTypes").UpdateEntryRefundPayload, "updatedEntryRefund"> & {
        updatedEntryRefund: import("./dataSources/accountingDb/types").EntryRefundDbRecord;
    }>;
    UpdatePersonPayload?: import("./graphTypes").UpdatePersonPayloadResolvers<{
        dataSources: import("./types").DataSources;
    } & import("./types").ContextBase, import("./graphTypes").Omit<import("./graphTypes").UpdatePersonPayload, "person"> & {
        person: import("./dataSources/accountingDb/types").PersonDbRecord;
    }>;
    UploadReceiptPayload?: import("./graphTypes").UploadReceiptPayloadResolvers<{
        dataSources: import("./types").DataSources;
    } & import("./types").ContextBase, import("./graphTypes").Omit<import("./graphTypes").UploadReceiptPayload, "attachment"> & {
        attachment: import("./graphTypes").Attachment;
    }>;
    UpsertBudgetResult?: import("./graphTypes").UpsertBudgetResultResolvers<{
        dataSources: import("./types").DataSources;
    } & import("./types").ContextBase, import("./graphTypes").Omit<import("./graphTypes").UpsertBudgetResult, "budget"> & {
        budget: import("./dataSources/accountingDb/types").BudgetDbRecord;
    }>;
    User?: import("./graphTypes").UserResolvers<{
        dataSources: import("./types").DataSources;
    } & import("./types").ContextBase, import("./graphTypes").Omit<import("./graphTypes").User, "user"> & {
        user: import("./dataSources/accountingDb/types").PersonDbRecord;
    }>;
    Vendor?: import("./graphTypes").VendorResolvers<{
        dataSources: import("./types").DataSources;
    } & import("./types").ContextBase, import("./graphTypes").Vendor>;
};
export default resolvers;
