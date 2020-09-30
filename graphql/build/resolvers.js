"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// import { Budget, budgets } from "./resolvers/budget";
const budget_1 = require("./resolvers/budget/budget");
const budgets_1 = require("./resolvers/budget/budgets");
const BudgetResolvers_1 = require("./resolvers/budget/BudgetResolvers");
const business_1 = require("./resolvers/business");
const business_2 = require("./resolvers/business/business");
const businesses_1 = require("./resolvers/business/businesses");
const BusinessResolvers_1 = require("./resolvers/business/BusinessResolvers");
// import { Department, departments, department } from "./resolvers/departments";
const department_1 = require("./resolvers/department/department");
const departments_1 = require("./resolvers/department/departments");
const DepartmentResolvers_1 = require("./resolvers/department/DepartmentResolvers");
const journalEntry_1 = require("./resolvers/journalEntry");
const journalEntries_1 = require("./resolvers/journalEntry/journalEntries");
const journalEntry_2 = require("./resolvers/journalEntry/journalEntry");
const journalEntryAdd_1 = require("./resolvers/journalEntry/journalEntryAdd");
const journalEntryUpdate_1 = require("./resolvers/journalEntry/journalEntryUpdate");
const journalEntryRefund_1 = require("./resolvers/journalEntry/journalEntryRefund");
const journalEntryAddRefund_1 = require("./resolvers/journalEntry/journalEntryAddRefund");
const journalEntryUpdateRefund_1 = require("./resolvers/journalEntry/journalEntryUpdateRefund");
const journalEntryDeleteRefund_1 = require("./resolvers/journalEntry/journalEntryDeleteRefund");
const journalEntryAddItem_1 = require("./resolvers/journalEntry/journalEntryAddItem");
const journalEntryUpdateItem_1 = require("./resolvers/journalEntry/journalEntryUpdateItem");
const journalEntryDeleteItem_1 = require("./resolvers/journalEntry/journalEntryDeleteItem");
const journalEntryItem_1 = require("./resolvers/journalEntry/journalEntryItem");
const JournalEntryResolver_1 = require("./resolvers/journalEntry/JournalEntryResolver");
const JournalEntryRefundResolver_1 = require("./resolvers/journalEntry/JournalEntryRefundResolver");
const JournalEntryItemResolver_1 = require("./resolvers/journalEntry/JournalEntryItemResolver");
const journalEntryUpserted_1 = require("./resolvers/journalEntry/journalEntryUpserted");
const journalEntrySource_1 = require("./resolvers/journalEntrySource");
const journalEntryCategory_1 = require("./resolvers/journalEntryCategory");
const journalEntryCategories_1 = require("./resolvers/journalEntryCategory/journalEntryCategories");
const paymentMethods_1 = require("./resolvers/paymentMethod/paymentMethods");
const paymentMethod_1 = require("./resolvers/paymentMethod/paymentMethod");
const paymentMethodAdd_1 = require("./resolvers/paymentMethod/paymentMethodAdd");
const paymentMethodUpdate_1 = require("./resolvers/paymentMethod/paymentMethodUpdate");
const PaymehtMethodResolver_1 = require("./resolvers/paymentMethod/PaymehtMethodResolver");
const person_1 = require("./resolvers/person");
const people_1 = require("./resolvers/person/people");
const person_2 = require("./resolvers/person/person");
const fiscalYear_1 = require("./resolvers/fiscalYear/fiscalYear");
const fiscalYears_1 = require("./resolvers/fiscalYear/fiscalYears");
const user_1 = require("./resolvers/user");
const resolvers = {
    Budget: BudgetResolvers_1.default,
    Business: BusinessResolvers_1.default,
    Department: DepartmentResolvers_1.default,
    JournalEntry: JournalEntryResolver_1.default,
    JournalEntryRefund: JournalEntryRefundResolver_1.default,
    JournalEntryItem: JournalEntryItemResolver_1.default,
    PaymentMethod: PaymehtMethodResolver_1.default,
    JournalEntryCategory: journalEntryCategory_1.JournalEntryCategory,
    User: user_1.User,
    Query: {
        budget: budget_1.default,
        businesses: businesses_1.default,
        business: business_2.default,
        budgets: budgets_1.default,
        journalEntry: journalEntry_2.default,
        journalEntryRefund: journalEntryRefund_1.default,
        journalEntryItem: journalEntryItem_1.default,
        journalEntries: journalEntries_1.default,
        journalEntrySources: journalEntrySource_1.journalEntrySources,
        journalEntryCategories: journalEntryCategories_1.default,
        journalEntryCategory: journalEntryCategory_1.journalEntryCategory,
        departments: departments_1.default,
        department: department_1.default,
        paymentMethods: paymentMethods_1.default,
        paymentMethod: paymentMethod_1.default,
        person: person_2.default,
        people: people_1.default,
        fiscalYear: fiscalYear_1.default,
        fiscalYears: fiscalYears_1.default,
    },
    Mutation: {
        journalEntryAdd: journalEntryAdd_1.default,
        journalEntryUpdate: journalEntryUpdate_1.default,
        journalEntryDelete: journalEntry_1.journalEntryDelete,
        journalEntryAddRefund: journalEntryAddRefund_1.default,
        journalEntryUpdateRefund: journalEntryUpdateRefund_1.default,
        journalEntryDeleteRefund: journalEntryDeleteRefund_1.default,
        journalEntryAddItem: journalEntryAddItem_1.default,
        journalEntryUpdateItem: journalEntryUpdateItem_1.default,
        journalEntryDeleteItem: journalEntryDeleteItem_1.default,
        addPerson: person_1.addPerson,
        addBusiness: business_1.addBusiness,
        paymentMethodAdd: paymentMethodAdd_1.default,
        paymentMethodUpdate: paymentMethodUpdate_1.default,
    },
    Subscription: {
        journalEntryAdded: journalEntry_1.journalEntryAdded,
        journalEntryUpdated: journalEntry_1.journalEntryUpdated,
        journalEntryUpserted: journalEntryUpserted_1.default,
    },
};
exports.default = resolvers;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVzb2x2ZXJzLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vc3JjL3Jlc29sdmVycy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUNBLHdEQUF3RDtBQUN4RCxzREFBK0M7QUFDL0Msd0RBQWlEO0FBQ2pELHdFQUF3RDtBQUN4RCxtREFBbUQ7QUFDbkQsNERBQXFEO0FBQ3JELGdFQUF5RDtBQUN6RCw4RUFBOEQ7QUFDOUQsaUZBQWlGO0FBQ2pGLGtFQUEyRDtBQUMzRCxvRUFBNkQ7QUFDN0Qsb0ZBQW9FO0FBQ3BFLDJEQUlrQztBQUNsQyw0RUFBcUU7QUFDckUsd0VBQWlFO0FBQ2pFLDhFQUF1RTtBQUN2RSxvRkFBNkU7QUFDN0Usb0ZBQTZFO0FBQzdFLDBGQUFtRjtBQUNuRixnR0FBeUY7QUFDekYsZ0dBQXlGO0FBQ3pGLHNGQUErRTtBQUMvRSw0RkFBcUY7QUFDckYsNEZBQXFGO0FBQ3JGLGdGQUF5RTtBQUN6RSx3RkFBeUU7QUFDekUsb0dBQXFGO0FBQ3JGLGdHQUFpRjtBQUNqRix3RkFBaUY7QUFDakYsdUVBQXFFO0FBQ3JFLDJFQUkwQztBQUMxQyxvR0FBNkY7QUFDN0YsNkVBQXNFO0FBQ3RFLDJFQUFvRTtBQUNwRSxpRkFBMEU7QUFDMUUsdUZBQWdGO0FBQ2hGLDJGQUE0RTtBQUM1RSwrQ0FBK0M7QUFDL0Msc0RBQStDO0FBQy9DLHNEQUErQztBQUMvQyxrRUFBMkQ7QUFDM0Qsb0VBQTZEO0FBQzdELDJDQUF3QztBQUV4QyxNQUFNLFNBQVMsR0FBYztJQUMzQixNQUFNLEVBQU4seUJBQU07SUFDTixRQUFRLEVBQVIsMkJBQVE7SUFDUixVQUFVLEVBQVYsNkJBQVU7SUFDVixZQUFZLEVBQVosOEJBQVk7SUFDWixrQkFBa0IsRUFBbEIsb0NBQWtCO0lBQ2xCLGdCQUFnQixFQUFoQixrQ0FBZ0I7SUFDaEIsYUFBYSxFQUFiLCtCQUFhO0lBQ2Isb0JBQW9CLEVBQXBCLDJDQUFvQjtJQUNwQixJQUFJLEVBQUosV0FBSTtJQUNKLEtBQUssRUFBRTtRQUNMLE1BQU0sRUFBTixnQkFBTTtRQUNOLFVBQVUsRUFBVixvQkFBVTtRQUNWLFFBQVEsRUFBUixrQkFBUTtRQUNSLE9BQU8sRUFBUCxpQkFBTztRQUNQLFlBQVksRUFBWixzQkFBWTtRQUNaLGtCQUFrQixFQUFsQiw0QkFBa0I7UUFDbEIsZ0JBQWdCLEVBQWhCLDBCQUFnQjtRQUNoQixjQUFjLEVBQWQsd0JBQWM7UUFDZCxtQkFBbUIsRUFBbkIsd0NBQW1CO1FBQ25CLHNCQUFzQixFQUF0QixnQ0FBc0I7UUFDdEIsb0JBQW9CLEVBQXBCLDJDQUFvQjtRQUNwQixXQUFXLEVBQVgscUJBQVc7UUFDWCxVQUFVLEVBQVYsb0JBQVU7UUFDVixjQUFjLEVBQWQsd0JBQWM7UUFDZCxhQUFhLEVBQWIsdUJBQWE7UUFDYixNQUFNLEVBQU4sZ0JBQU07UUFDTixNQUFNLEVBQU4sZ0JBQU07UUFDTixVQUFVLEVBQVYsb0JBQVU7UUFDVixXQUFXLEVBQVgscUJBQVc7S0FDWjtJQUNELFFBQVEsRUFBRTtRQUNSLGVBQWUsRUFBZix5QkFBZTtRQUNmLGtCQUFrQixFQUFsQiw0QkFBa0I7UUFDbEIsa0JBQWtCLEVBQWxCLGlDQUFrQjtRQUNsQixxQkFBcUIsRUFBckIsK0JBQXFCO1FBQ3JCLHdCQUF3QixFQUF4QixrQ0FBd0I7UUFDeEIsd0JBQXdCLEVBQXhCLGtDQUF3QjtRQUN4QixtQkFBbUIsRUFBbkIsNkJBQW1CO1FBQ25CLHNCQUFzQixFQUF0QixnQ0FBc0I7UUFDdEIsc0JBQXNCLEVBQXRCLGdDQUFzQjtRQUN0QixTQUFTLEVBQVQsa0JBQVM7UUFDVCxXQUFXLEVBQVgsc0JBQVc7UUFDWCxnQkFBZ0IsRUFBaEIsMEJBQWdCO1FBQ2hCLG1CQUFtQixFQUFuQiw2QkFBbUI7S0FDcEI7SUFDRCxZQUFZLEVBQUU7UUFDWixpQkFBaUIsRUFBakIsZ0NBQWlCO1FBQ2pCLG1CQUFtQixFQUFuQixrQ0FBbUI7UUFDbkIsb0JBQW9CLEVBQXBCLDhCQUFvQjtLQUNyQjtDQUNGLENBQUM7QUFFRixrQkFBZSxTQUFTLENBQUMifQ==