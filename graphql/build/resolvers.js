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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVzb2x2ZXJzLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vc3JjL3Jlc29sdmVycy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUNBLGlEQWM2QjtBQUM3QiwrQ0FBc0c7QUFDdEcsbURBQXNFO0FBQ3RFLHVEQUtnQztBQUNoQywrQ0FBc0Q7QUFDdEQsNkNBZTJCO0FBQzNCLDZEQU1tQztBQUNuQyx5REFBa0Q7QUFDbEQsc0RBQTRFO0FBQzVFLCtDQUE0RDtBQUM1RCx1REFBeUs7QUFDekssMkNBQXdDO0FBQ3hDLHVEQUE2RDtBQUM3RCxrRUFBK0Q7QUFFL0QsaURBQTZFO0FBQzdFLDZDQUEwQztBQUUxQyxNQUFNLGdCQUFnQixHQUFjO0lBQ2xDLGdCQUFnQixFQUFoQiwwQkFBZ0I7SUFDaEIseUJBQXlCLEVBQXpCLG1DQUF5QjtJQUN6QixXQUFXLEVBQVgscUJBQVc7SUFDWCxZQUFZLEVBQVosc0JBQVk7SUFDWixlQUFlLEVBQWYseUJBQWU7SUFDZixpQkFBaUIsRUFBakIsMkJBQWlCO0lBQ2pCLEtBQUssRUFBTCxhQUFLO0lBQ0wsSUFBSSxFQUFFLG9CQUFVO0lBQ2hCLFFBQVEsRUFBRSx3QkFBYztJQUN4QixJQUFJLEVBQUUsb0JBQVU7SUFDaEIsTUFBTSxFQUFOLGVBQU07SUFDTixXQUFXLEVBQVgsb0JBQVc7SUFDWCxRQUFRLEVBQVIsbUJBQVE7SUFDUixVQUFVLEVBQVYsdUJBQVU7SUFDVixrQkFBa0IsRUFBbEIsK0JBQWtCO0lBQ2xCLE1BQU0sRUFBTixlQUFNO0lBQ04sS0FBSyxFQUFMLGFBQUs7SUFDTCxXQUFXLEVBQVgsbUJBQVc7SUFDWCxTQUFTLEVBQVQsaUJBQVM7SUFDVCxVQUFVLEVBQVYsdUJBQVU7SUFDVixvQkFBb0IsRUFBcEIsb0NBQW9CO0lBQ3BCLFdBQVcsRUFBWCwyQkFBVztJQUNYLHFCQUFxQixFQUFyQixxQ0FBcUI7SUFDckIsc0JBQXNCLEVBQXRCLHNDQUFzQjtJQUN0QixpQkFBaUIsRUFBakIsaUNBQWlCO0lBQ2pCLE1BQU0sRUFBTixlQUFNO0lBQ04sUUFBUSxFQUFSLGdCQUFRO0lBQ1IsSUFBSSxFQUFKLFdBQUk7SUFDSixLQUFLLEVBQUU7UUFDTCxPQUFPLEVBQVAsaUJBQU87UUFDUCxRQUFRLEVBQVIsa0JBQVE7UUFDUixXQUFXLEVBQVgscUJBQVc7UUFDWCxZQUFZLEVBQVosc0JBQVk7UUFDWixNQUFNLEVBQU4sZUFBTTtRQUNOLFVBQVUsRUFBVixxQkFBVTtRQUNWLFFBQVEsRUFBUixtQkFBUTtRQUNSLE9BQU8sRUFBUCxnQkFBTztRQUNQLFFBQVEsRUFBUixpQkFBUTtRQUNSLEtBQUssRUFBTCxhQUFLO1FBQ0wsV0FBVyxFQUFYLG1CQUFXO1FBQ1gsT0FBTyxFQUFQLGVBQU87UUFDUCxZQUFZLEVBQVosb0JBQVk7UUFDWixPQUFPLEVBQVAscUJBQU87UUFDUCxVQUFVLEVBQVYsa0JBQVU7UUFDVixRQUFRLEVBQVIsZ0JBQVE7UUFDUixXQUFXLEVBQVgsd0JBQVc7UUFDWCxVQUFVLEVBQVYsdUJBQVU7UUFDVixNQUFNLEVBQU4sZUFBTTtRQUNOLE1BQU0sRUFBTixlQUFNO1FBQ04sVUFBVSxFQUFWLHVCQUFVO1FBQ1YsV0FBVyxFQUFYLHdCQUFXO1FBQ1gsZ0JBQWdCLEVBQWhCLDZCQUFnQjtLQUNqQjtJQUNELFFBQVEsRUFBRTtRQUNSLFdBQVcsRUFBWCxtQkFBVztRQUNYLGlCQUFpQixFQUFqQix5QkFBaUI7UUFDakIsV0FBVyxFQUFYLG1CQUFXO1FBQ1gsaUJBQWlCLEVBQWpCLHlCQUFpQjtRQUNqQixXQUFXLEVBQVgsbUJBQVc7UUFDWCxpQkFBaUIsRUFBakIseUJBQWlCO1FBQ2pCLGdCQUFnQixFQUFoQix3QkFBZ0I7UUFDaEIsaUJBQWlCLEVBQUUsMkJBQXdCO1FBQzNDLGlCQUFpQixFQUFFLDJCQUF3QjtRQUMzQyxpQkFBaUIsRUFBRSwyQkFBd0I7UUFDM0MsWUFBWSxFQUFaLHFCQUFZO1FBQ1osWUFBWSxFQUFaLHFCQUFZO1FBQ1osZ0JBQWdCLEVBQWhCLDZCQUFnQjtRQUNoQixpQkFBaUIsRUFBakIsOEJBQWlCO1FBQ2pCLGlCQUFpQixFQUFqQiw4QkFBaUI7UUFDakIsZ0JBQWdCLEVBQWhCLDZCQUFnQjtLQUNqQjtJQUNELFlBQVksRUFBRTtJQUNaLGlCQUFpQjtLQUNsQjtDQUNGLENBQUM7QUFFRixNQUFNLFNBQVMsbUNBQ1YsZ0JBQWdCLEtBQ25CLE1BQU0sRUFBRSxnQ0FBbUIsQ0FBQyxNQUFNLEVBQ2xDLFFBQVEsRUFBRSw2QkFBYSxDQUFDLFFBQVEsRUFDaEMsY0FBYyxFQUFFLDZCQUFhLENBQUMsY0FBYyxFQUM1QyxhQUFhLEVBQUUsNkJBQWEsQ0FBQyxhQUFhLEVBQzFDLEtBQUssa0NBQ0EsZ0JBQWdCLENBQUMsS0FBSyxHQUN0QixnQ0FBbUIsQ0FBQyxLQUFLLEdBRTlCLEtBQUssa0NBQ0EsZ0JBQWdCLENBQUMsS0FBSyxHQUN0Qiw2QkFBYSxDQUFDLEtBQUssR0FFeEIsUUFBUSxnREFDSCxnQkFBZ0IsQ0FBQyxRQUFRLEdBQ3pCLGdDQUFtQixDQUFDLFFBQVEsR0FDNUIsNkJBQWEsQ0FBQyxRQUFRLElBRTVCLENBQUM7QUFFRixrQkFBZSxTQUFTLENBQUMifQ==