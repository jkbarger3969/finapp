"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const alias_1 = require("./resolvers/alias");
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
const scalars_1 = require("./resolvers/scalars");
const resolvers = {
    AccountInterface: account_1.AccountInterface,
    AccountWithCardsInterface: account_1.AccountWithCardsInterface,
    AccountCard: account_1.AccountCard,
    AccountCheck: account_1.AccountCheck,
    AccountChecking: account_1.AccountChecking,
    AccountCreditCard: account_1.AccountCreditCard,
    Alias: alias_1.Alias,
    AliasTarget: alias_1.AliasTarget,
    Date: scalars_1.dateScalar,
    Rational: scalars_1.rationalScalar,
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
        alias: alias_1.alias,
        aliases: alias_1.aliases,
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
    },
    Mutation: {
        addNewEntry: entry_1.addNewEntry,
        addNewEntryRefund: entry_1.addNewEntryRefund,
        deleteEntry: entry_1.deleteEntry,
        deleteEntryRefund: entry_1.deleteEntryRefund,
        updateEntry: entry_1.updateEntry,
        updateEntryRefund: entry_1.updateEntryRefund,
        reconcileEntries: entry_1.reconcileEntries,
    },
    Subscription: {
    // entryUpserted,
    },
};
exports.default = resolvers;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVzb2x2ZXJzLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vc3JjL3Jlc29sdmVycy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUNBLDZDQUF1RTtBQUN2RSxpREFXNkI7QUFDN0IsK0NBQTBFO0FBQzFFLG1EQUFzRTtBQUN0RSx1REFLZ0M7QUFDaEMsK0NBQXNEO0FBQ3RELDZDQWUyQjtBQUMzQiw2REFLbUM7QUFDbkMseURBQWtEO0FBQ2xELHNEQUE0RTtBQUM1RSwrQ0FBNEQ7QUFDNUQsdURBQTZFO0FBQzdFLDJDQUF3QztBQUV4QyxpREFBaUU7QUFFakUsTUFBTSxTQUFTLEdBQWM7SUFDM0IsZ0JBQWdCLEVBQWhCLDBCQUFnQjtJQUNoQix5QkFBeUIsRUFBekIsbUNBQXlCO0lBQ3pCLFdBQVcsRUFBWCxxQkFBVztJQUNYLFlBQVksRUFBWixzQkFBWTtJQUNaLGVBQWUsRUFBZix5QkFBZTtJQUNmLGlCQUFpQixFQUFqQiwyQkFBaUI7SUFDakIsS0FBSyxFQUFMLGFBQUs7SUFDTCxXQUFXLEVBQVgsbUJBQVc7SUFDWCxJQUFJLEVBQUUsb0JBQVU7SUFDaEIsUUFBUSxFQUFFLHdCQUFjO0lBQ3hCLE1BQU0sRUFBTixlQUFNO0lBQ04sV0FBVyxFQUFYLG9CQUFXO0lBQ1gsUUFBUSxFQUFSLG1CQUFRO0lBQ1IsVUFBVSxFQUFWLHVCQUFVO0lBQ1Ysa0JBQWtCLEVBQWxCLCtCQUFrQjtJQUNsQixNQUFNLEVBQU4sZUFBTTtJQUNOLEtBQUssRUFBTCxhQUFLO0lBQ0wsV0FBVyxFQUFYLG1CQUFXO0lBQ1gsU0FBUyxFQUFULGlCQUFTO0lBQ1QsVUFBVSxFQUFWLHVCQUFVO0lBQ1Ysb0JBQW9CLEVBQXBCLG9DQUFvQjtJQUNwQixxQkFBcUIsRUFBckIscUNBQXFCO0lBQ3JCLHNCQUFzQixFQUF0QixzQ0FBc0I7SUFDdEIsaUJBQWlCLEVBQWpCLGlDQUFpQjtJQUNqQixNQUFNLEVBQU4sZUFBTTtJQUNOLFFBQVEsRUFBUixnQkFBUTtJQUNSLElBQUksRUFBSixXQUFJO0lBQ0osS0FBSyxFQUFFO1FBQ0wsT0FBTyxFQUFQLGlCQUFPO1FBQ1AsUUFBUSxFQUFSLGtCQUFRO1FBQ1IsV0FBVyxFQUFYLHFCQUFXO1FBQ1gsWUFBWSxFQUFaLHNCQUFZO1FBQ1osS0FBSyxFQUFMLGFBQUs7UUFDTCxPQUFPLEVBQVAsZUFBTztRQUNQLE1BQU0sRUFBTixlQUFNO1FBQ04sVUFBVSxFQUFWLHFCQUFVO1FBQ1YsUUFBUSxFQUFSLG1CQUFRO1FBQ1IsT0FBTyxFQUFQLGdCQUFPO1FBQ1AsUUFBUSxFQUFSLGlCQUFRO1FBQ1IsS0FBSyxFQUFMLGFBQUs7UUFDTCxXQUFXLEVBQVgsbUJBQVc7UUFDWCxPQUFPLEVBQVAsZUFBTztRQUNQLFlBQVksRUFBWixvQkFBWTtRQUNaLE9BQU8sRUFBUCxxQkFBTztRQUNQLFVBQVUsRUFBVixrQkFBVTtRQUNWLFFBQVEsRUFBUixnQkFBUTtRQUNSLFdBQVcsRUFBWCx3QkFBVztRQUNYLFVBQVUsRUFBVix1QkFBVTtRQUNWLE1BQU0sRUFBTixlQUFNO1FBQ04sTUFBTSxFQUFOLGVBQU07UUFDTixVQUFVLEVBQVYsdUJBQVU7UUFDVixXQUFXLEVBQVgsd0JBQVc7S0FDWjtJQUNELFFBQVEsRUFBRTtRQUNSLFdBQVcsRUFBWCxtQkFBVztRQUNYLGlCQUFpQixFQUFqQix5QkFBaUI7UUFDakIsV0FBVyxFQUFYLG1CQUFXO1FBQ1gsaUJBQWlCLEVBQWpCLHlCQUFpQjtRQUNqQixXQUFXLEVBQVgsbUJBQVc7UUFDWCxpQkFBaUIsRUFBakIseUJBQWlCO1FBQ2pCLGdCQUFnQixFQUFoQix3QkFBZ0I7S0FDakI7SUFDRCxZQUFZLEVBQUU7SUFDWixpQkFBaUI7S0FDbEI7Q0FDRixDQUFDO0FBRUYsa0JBQWUsU0FBUyxDQUFDIn0=