"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const account_1 = require("./resolvers/account");
const budget_1 = require("./resolvers/budget");
const business_1 = require("./resolvers/business");
const department_1 = require("./resolvers/department");
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
        entryRefunds: entry_1.entryRefunds,
        sources: entrySource_1.sources,
        categories: index_1.categories,
        category: index_1.category,
        departments: department_1.departments,
        department: department_1.department,
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
    },
    Subscription: {
    // entryUpserted,
    },
};
const resolvers = Object.assign(Object.assign({}, initialResolvers), { Upload: attachment_1.attachmentResolvers.Upload, AuthUser: authResolvers_1.authResolvers.AuthUser, UserPermission: authResolvers_1.authResolvers.UserPermission, AuditLogEntry: authResolvers_1.authResolvers.AuditLogEntry, Entry: Object.assign(Object.assign({}, initialResolvers.Entry), attachment_1.attachmentResolvers.Entry), Query: Object.assign(Object.assign({}, initialResolvers.Query), authResolvers_1.authResolvers.Query), Mutation: Object.assign(Object.assign(Object.assign({}, initialResolvers.Mutation), attachment_1.attachmentResolvers.Mutation), authResolvers_1.authResolvers.Mutation) });
exports.default = resolvers;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVzb2x2ZXJzLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vc3JjL3Jlc29sdmVycy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUNBLGlEQWM2QjtBQUM3QiwrQ0FBc0c7QUFDdEcsbURBQXNFO0FBQ3RFLHVEQUtnQztBQUNoQywrQ0FBc0Q7QUFDdEQsNkNBaUIyQjtBQUMzQiw2REFNbUM7QUFDbkMseURBQWtEO0FBQ2xELHNEQUE0RTtBQUM1RSwrQ0FBNEQ7QUFDNUQsdURBQXlLO0FBQ3pLLDJDQUF3QztBQUN4Qyx1REFBNkQ7QUFDN0Qsa0VBQStEO0FBRS9ELGlEQUE2RTtBQUM3RSw2Q0FBMEM7QUFFMUMsTUFBTSxnQkFBZ0IsR0FBYztJQUNsQyxnQkFBZ0IsRUFBaEIsMEJBQWdCO0lBQ2hCLHlCQUF5QixFQUF6QixtQ0FBeUI7SUFDekIsV0FBVyxFQUFYLHFCQUFXO0lBQ1gsWUFBWSxFQUFaLHNCQUFZO0lBQ1osZUFBZSxFQUFmLHlCQUFlO0lBQ2YsaUJBQWlCLEVBQWpCLDJCQUFpQjtJQUNqQixLQUFLLEVBQUwsYUFBSztJQUNMLElBQUksRUFBRSxvQkFBVTtJQUNoQixRQUFRLEVBQUUsd0JBQWM7SUFDeEIsSUFBSSxFQUFFLG9CQUFVO0lBQ2hCLE1BQU0sRUFBTixlQUFNO0lBQ04sV0FBVyxFQUFYLG9CQUFXO0lBQ1gsUUFBUSxFQUFSLG1CQUFRO0lBQ1IsVUFBVSxFQUFWLHVCQUFVO0lBQ1Ysa0JBQWtCLEVBQWxCLCtCQUFrQjtJQUNsQixNQUFNLEVBQU4sZUFBTTtJQUNOLEtBQUssRUFBTCxhQUFLO0lBQ0wsV0FBVyxFQUFYLG1CQUFXO0lBQ1gsU0FBUyxFQUFULGlCQUFTO0lBQ1QsVUFBVSxFQUFWLHVCQUFVO0lBQ1Ysb0JBQW9CLEVBQXBCLG9DQUFvQjtJQUNwQixXQUFXLEVBQVgsMkJBQVc7SUFDWCxxQkFBcUIsRUFBckIscUNBQXFCO0lBQ3JCLHNCQUFzQixFQUF0QixzQ0FBc0I7SUFDdEIsaUJBQWlCLEVBQWpCLGlDQUFpQjtJQUNqQixNQUFNLEVBQU4sZUFBTTtJQUNOLFFBQVEsRUFBUixnQkFBUTtJQUNSLElBQUksRUFBSixXQUFJO0lBQ0osS0FBSyxFQUFFO1FBQ0wsT0FBTyxFQUFQLGlCQUFPO1FBQ1AsUUFBUSxFQUFSLGtCQUFRO1FBQ1IsV0FBVyxFQUFYLHFCQUFXO1FBQ1gsWUFBWSxFQUFaLHNCQUFZO1FBQ1osTUFBTSxFQUFOLGVBQU07UUFDTixVQUFVLEVBQVYscUJBQVU7UUFDVixRQUFRLEVBQVIsbUJBQVE7UUFDUixPQUFPLEVBQVAsZ0JBQU87UUFDUCxRQUFRLEVBQVIsaUJBQVE7UUFDUixLQUFLLEVBQUwsYUFBSztRQUNMLFdBQVcsRUFBWCxtQkFBVztRQUNYLE9BQU8sRUFBUCxlQUFPO1FBQ1AsYUFBYSxFQUFiLHFCQUFhO1FBQ2IsWUFBWSxFQUFaLG9CQUFZO1FBQ1osWUFBWSxFQUFaLG9CQUFZO1FBQ1osT0FBTyxFQUFQLHFCQUFPO1FBQ1AsVUFBVSxFQUFWLGtCQUFVO1FBQ1YsUUFBUSxFQUFSLGdCQUFRO1FBQ1IsV0FBVyxFQUFYLHdCQUFXO1FBQ1gsVUFBVSxFQUFWLHVCQUFVO1FBQ1YsTUFBTSxFQUFOLGVBQU07UUFDTixNQUFNLEVBQU4sZUFBTTtRQUNOLFVBQVUsRUFBVix1QkFBVTtRQUNWLFdBQVcsRUFBWCx3QkFBVztRQUNYLGdCQUFnQixFQUFoQiw2QkFBZ0I7S0FDakI7SUFDRCxRQUFRLEVBQUU7UUFDUixXQUFXLEVBQVgsbUJBQVc7UUFDWCxpQkFBaUIsRUFBakIseUJBQWlCO1FBQ2pCLFdBQVcsRUFBWCxtQkFBVztRQUNYLGlCQUFpQixFQUFqQix5QkFBaUI7UUFDakIsV0FBVyxFQUFYLG1CQUFXO1FBQ1gsaUJBQWlCLEVBQWpCLHlCQUFpQjtRQUNqQixnQkFBZ0IsRUFBaEIsd0JBQWdCO1FBQ2hCLGlCQUFpQixFQUFFLDJCQUF3QjtRQUMzQyxpQkFBaUIsRUFBRSwyQkFBd0I7UUFDM0MsaUJBQWlCLEVBQUUsMkJBQXdCO1FBQzNDLFlBQVksRUFBWixxQkFBWTtRQUNaLFlBQVksRUFBWixxQkFBWTtRQUNaLGdCQUFnQixFQUFoQiw2QkFBZ0I7UUFDaEIsaUJBQWlCLEVBQWpCLDhCQUFpQjtRQUNqQixpQkFBaUIsRUFBakIsOEJBQWlCO1FBQ2pCLGdCQUFnQixFQUFoQiw2QkFBZ0I7S0FDakI7SUFDRCxZQUFZLEVBQUU7SUFDWixpQkFBaUI7S0FDbEI7Q0FDRixDQUFDO0FBRUYsTUFBTSxTQUFTLG1DQUNWLGdCQUFnQixLQUNuQixNQUFNLEVBQUUsZ0NBQW1CLENBQUMsTUFBTSxFQUNsQyxRQUFRLEVBQUUsNkJBQWEsQ0FBQyxRQUFRLEVBQ2hDLGNBQWMsRUFBRSw2QkFBYSxDQUFDLGNBQWMsRUFDNUMsYUFBYSxFQUFFLDZCQUFhLENBQUMsYUFBYSxFQUMxQyxLQUFLLGtDQUNBLGdCQUFnQixDQUFDLEtBQUssR0FDdEIsZ0NBQW1CLENBQUMsS0FBSyxHQUU5QixLQUFLLGtDQUNBLGdCQUFnQixDQUFDLEtBQUssR0FDdEIsNkJBQWEsQ0FBQyxLQUFLLEdBRXhCLFFBQVEsZ0RBQ0gsZ0JBQWdCLENBQUMsUUFBUSxHQUN6QixnQ0FBbUIsQ0FBQyxRQUFRLEdBQzVCLDZCQUFhLENBQUMsUUFBUSxJQUU1QixDQUFDO0FBRUYsa0JBQWUsU0FBUyxDQUFDIn0=