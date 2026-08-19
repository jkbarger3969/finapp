"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const account_1 = require("./resolvers/account");
const budget_1 = require("./resolvers/budget");
const business_1 = require("./resolvers/business");
const department_1 = require("./resolvers/department");
const departmentBudgetSummaries_1 = require("./resolvers/department/departmentBudgetSummaries");
const entity_1 = require("./resolvers/entity");
const entry_1 = require("./resolvers/entry");
const paymentMethod_1 = require("./resolvers/paymentMethod");
const entrySource_1 = require("./resolvers/entrySource");
const index_1 = require("./resolvers/category/index");
const person_1 = require("./resolvers/person");
const fiscalYear_1 = require("./resolvers/fiscalYear");
const user_1 = require("./resolvers/user");
const attachment_1 = require("./resolvers/attachment");
const authResolvers_1 = require("./resolvers/auth/authResolvers");
const scalars_1 = require("./resolvers/scalars");
const alias_1 = require("./resolvers/alias");
const initialResolvers = {
    AccountInterface: account_1.AccountInterface,
    AccountWithCardsInterface: account_1.AccountWithCardsInterface,
    AccountCard: account_1.AccountCard,
    AccountCheck: account_1.AccountCheck,
    AccountChecking: account_1.AccountChecking,
    AccountCreditCard: account_1.AccountCreditCard,
    Alias: alias_1.Alias,
    Date: scalars_1.dateScalar,
    Rational: scalars_1.rationalScalar,
    JSON: scalars_1.jsonScalar,
    Budget: budget_1.Budget,
    BudgetOwner: budget_1.BudgetOwner,
    Business: business_1.Business,
    Department: department_1.Department,
    DepartmentAncestor: department_1.DepartmentAncestor,
    Entity: entity_1.Entity,
    Entry: entry_1.Entry,
    EntryRefund: entry_1.EntryRefund,
    EntryItem: entry_1.EntryItem,
    FiscalYear: fiscalYear_1.FiscalYear,
    PaymentCardInterface: paymentMethod_1.PaymentCardInterface,
    PaymentCard: paymentMethod_1.PaymentCard,
    PaymentCheckInterface: paymentMethod_1.PaymentCheckInterface,
    PaymentMethodInterface: paymentMethod_1.PaymentMethodInterface,
    PaymentMethodCard: paymentMethod_1.PaymentMethodCard,
    Person: person_1.Person,
    Category: index_1.Category,
    User: user_1.User,
    Query: {
        account: account_1.account,
        accounts: account_1.accounts,
        accountCard: account_1.accountCard,
        accountCards: account_1.accountCards,
        budget: budget_1.budget,
        businesses: business_1.businesses,
        business: business_1.business,
        budgets: budget_1.budgets,
        entities: entity_1.entities,
        entry: entry_1.entry,
        entryRefund: entry_1.entryRefund,
        entries: entry_1.entries,
        searchEntries: entry_1.searchEntries,
        entriesCount: entry_1.entriesCount,
        entriesSummary: entry_1.entriesSummary,
        entriesReport: entry_1.entriesReport,
        entriesChartData: entry_1.entriesChartData,
        unreconciledCount: entry_1.unreconciledCount,
        entryRefunds: entry_1.entryRefunds,
        sources: entrySource_1.sources,
        categories: index_1.categories,
        category: index_1.category,
        categoryGroups: index_1.categoryGroups,
        departments: department_1.departments,
        department: department_1.department,
        departmentBudgetSummaries: departmentBudgetSummaries_1.departmentBudgetSummaries,
        person: person_1.person,
        people: person_1.people,
        fiscalYear: fiscalYear_1.fiscalYear,
        fiscalYears: fiscalYear_1.fiscalYears,
        exportFiscalYear: fiscalYear_1.exportFiscalYear,
    },
    Mutation: {
        addNewEntry: entry_1.addNewEntry,
        addNewEntryRefund: entry_1.addNewEntryRefund,
        deleteEntry: entry_1.deleteEntry,
        deleteEntryRefund: entry_1.deleteEntryRefund,
        updateEntry: entry_1.updateEntry,
        updateEntryRefund: entry_1.updateEntryRefund,
        reconcileEntries: entry_1.reconcileEntries,
        createAccountCard: account_1.createAccountCard,
        updateAccountCard: account_1.updateAccountCard,
        deleteAccountCard: account_1.deleteAccountCard,
        upsertBudget: budget_1.upsertBudget,
        deleteBudget: budget_1.deleteBudget,
        createFiscalYear: fiscalYear_1.createFiscalYear,
        archiveFiscalYear: fiscalYear_1.archiveFiscalYear,
        restoreFiscalYear: fiscalYear_1.restoreFiscalYear,
        deleteFiscalYear: fiscalYear_1.deleteFiscalYear,
        updateCategory: index_1.updateCategory,
        updatePerson: person_1.updatePerson,
        updateBusiness: business_1.updateBusiness,
    },
    Subscription: {
    // entryUpserted,
    },
};
const resolvers = Object.assign(Object.assign({}, initialResolvers), { Upload: attachment_1.attachmentResolvers.Upload, AuthUser: authResolvers_1.authResolvers.AuthUser, UserPermission: authResolvers_1.authResolvers.UserPermission, AuditLogEntry: authResolvers_1.authResolvers.AuditLogEntry, Entry: Object.assign(Object.assign({}, initialResolvers.Entry), attachment_1.attachmentResolvers.Entry), Query: Object.assign(Object.assign({}, initialResolvers.Query), authResolvers_1.authResolvers.Query), Mutation: Object.assign(Object.assign(Object.assign({}, initialResolvers.Mutation), attachment_1.attachmentResolvers.Mutation), authResolvers_1.authResolvers.Mutation) });
exports.default = resolvers;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVzb2x2ZXJzLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vc3JjL3Jlc29sdmVycy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUNBLGlEQWM2QjtBQUM3QiwrQ0FBc0c7QUFDdEcsbURBQXNGO0FBQ3RGLHVEQUtnQztBQUNoQyxnR0FBNkY7QUFDN0YsK0NBQXNEO0FBQ3RELDZDQXFCMkI7QUFDM0IsNkRBTW1DO0FBQ25DLHlEQUFrRDtBQUNsRCxzREFBNEc7QUFDNUcsK0NBQTBFO0FBQzFFLHVEQUF5SztBQUN6SywyQ0FBd0M7QUFDeEMsdURBQTZEO0FBQzdELGtFQUErRDtBQUUvRCxpREFBNkU7QUFDN0UsNkNBQTBDO0FBRTFDLE1BQU0sZ0JBQWdCLEdBQWM7SUFDbEMsZ0JBQWdCLEVBQWhCLDBCQUFnQjtJQUNoQix5QkFBeUIsRUFBekIsbUNBQXlCO0lBQ3pCLFdBQVcsRUFBWCxxQkFBVztJQUNYLFlBQVksRUFBWixzQkFBWTtJQUNaLGVBQWUsRUFBZix5QkFBZTtJQUNmLGlCQUFpQixFQUFqQiwyQkFBaUI7SUFDakIsS0FBSyxFQUFMLGFBQUs7SUFDTCxJQUFJLEVBQUUsb0JBQVU7SUFDaEIsUUFBUSxFQUFFLHdCQUFjO0lBQ3hCLElBQUksRUFBRSxvQkFBVTtJQUNoQixNQUFNLEVBQU4sZUFBTTtJQUNOLFdBQVcsRUFBWCxvQkFBVztJQUNYLFFBQVEsRUFBUixtQkFBUTtJQUNSLFVBQVUsRUFBVix1QkFBVTtJQUNWLGtCQUFrQixFQUFsQiwrQkFBa0I7SUFDbEIsTUFBTSxFQUFOLGVBQU07SUFDTixLQUFLLEVBQUwsYUFBSztJQUNMLFdBQVcsRUFBWCxtQkFBVztJQUNYLFNBQVMsRUFBVCxpQkFBUztJQUNULFVBQVUsRUFBVix1QkFBVTtJQUNWLG9CQUFvQixFQUFwQixvQ0FBb0I7SUFDcEIsV0FBVyxFQUFYLDJCQUFXO0lBQ1gscUJBQXFCLEVBQXJCLHFDQUFxQjtJQUNyQixzQkFBc0IsRUFBdEIsc0NBQXNCO0lBQ3RCLGlC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