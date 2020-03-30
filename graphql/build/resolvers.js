"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const budget_1 = require("./resolvers/budget");
const business_1 = require("./resolvers/business");
const departments_1 = require("./resolvers/departments");
const journalEntry_1 = require("./resolvers/journalEntry");
const journalEntries_1 = require("./resolvers/journalEntry/journalEntries");
const journalEntry_2 = require("./resolvers/journalEntry/journalEntry");
const journalEntryAdd_1 = require("./resolvers/journalEntry/journalEntryAdd");
const journalEntryUpdate_1 = require("./resolvers/journalEntry/journalEntryUpdate");
const JournalEntryResolver_1 = require("./resolvers/journalEntry/JournalEntryResolver");
const journalEntrySource_1 = require("./resolvers/journalEntrySource");
const journalEntryCategory_1 = require("./resolvers/journalEntryCategory");
const paymentMethods_1 = require("./resolvers/paymentMethod/paymentMethods");
const paymentMethod_1 = require("./resolvers/paymentMethod/paymentMethod");
const paymentMethodAdd_1 = require("./resolvers/paymentMethod/paymentMethodAdd");
const paymentMethodUpdate_1 = require("./resolvers/paymentMethod/paymentMethodUpdate");
const PaymehtMethodResolver_1 = require("./resolvers/paymentMethod/PaymehtMethodResolver");
const person_1 = require("./resolvers/person");
const user_1 = require("./resolvers/user");
const resolvers = {
    Budget: budget_1.Budget,
    Business: business_1.Business,
    Department: departments_1.Department,
    JournalEntry: JournalEntryResolver_1.default,
    PaymentMethod: PaymehtMethodResolver_1.default,
    JournalEntryCategory: journalEntryCategory_1.JournalEntryCategory,
    User: user_1.User,
    Query: {
        businesses: business_1.businesses,
        business: business_1.business,
        budgets: budget_1.budgets,
        journalEntry: journalEntry_2.default,
        journalEntries: journalEntries_1.default,
        journalEntrySources: journalEntrySource_1.journalEntrySources,
        journalEntryCategories: journalEntryCategory_1.journalEntryCategories,
        journalEntryCategory: journalEntryCategory_1.journalEntryCategory,
        departments: departments_1.departments,
        department: departments_1.department,
        paymentMethods: paymentMethods_1.default,
        paymentMethod: paymentMethod_1.default,
        people: person_1.people
    },
    Mutation: {
        journalEntryAdd: journalEntryAdd_1.default,
        journalEntryUpdate: journalEntryUpdate_1.default,
        journalEntryDelete: journalEntry_1.journalEntryDelete,
        addPerson: person_1.addPerson,
        addBusiness: business_1.addBusiness,
        paymentMethodAdd: paymentMethodAdd_1.default,
        paymentMethodUpdate: paymentMethodUpdate_1.default
    },
    Subscription: {
        journalEntryAdded: journalEntry_1.journalEntryAdded,
        journalEntryUpdated: journalEntry_1.journalEntryUpdated
    }
};
exports.default = resolvers;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVzb2x2ZXJzLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vc3JjL3Jlc29sdmVycy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUNBLCtDQUFxRDtBQUNyRCxtREFLOEI7QUFDOUIseURBQThFO0FBQzlFLDJEQUlrQztBQUNsQyw0RUFBcUU7QUFDckUsd0VBQWlFO0FBQ2pFLDhFQUF1RTtBQUN2RSxvRkFBNkU7QUFDN0Usd0ZBQXlFO0FBQ3pFLHVFQUFxRTtBQUNyRSwyRUFJMEM7QUFDMUMsNkVBQXNFO0FBQ3RFLDJFQUFvRTtBQUNwRSxpRkFBMEU7QUFDMUUsdUZBQWdGO0FBQ2hGLDJGQUE0RTtBQUM1RSwrQ0FBdUQ7QUFDdkQsMkNBQXdDO0FBRXhDLE1BQU0sU0FBUyxHQUFjO0lBQzNCLE1BQU0sRUFBTixlQUFNO0lBQ04sUUFBUSxFQUFSLG1CQUFRO0lBQ1IsVUFBVSxFQUFWLHdCQUFVO0lBQ1YsWUFBWSxFQUFaLDhCQUFZO0lBQ1osYUFBYSxFQUFiLCtCQUFhO0lBQ2Isb0JBQW9CLEVBQXBCLDJDQUFvQjtJQUNwQixJQUFJLEVBQUosV0FBSTtJQUNKLEtBQUssRUFBRTtRQUNMLFVBQVUsRUFBVixxQkFBVTtRQUNWLFFBQVEsRUFBUixtQkFBUTtRQUNSLE9BQU8sRUFBUCxnQkFBTztRQUNQLFlBQVksRUFBWixzQkFBWTtRQUNaLGNBQWMsRUFBZCx3QkFBYztRQUNkLG1CQUFtQixFQUFuQix3Q0FBbUI7UUFDbkIsc0JBQXNCLEVBQXRCLDZDQUFzQjtRQUN0QixvQkFBb0IsRUFBcEIsMkNBQW9CO1FBQ3BCLFdBQVcsRUFBWCx5QkFBVztRQUNYLFVBQVUsRUFBVix3QkFBVTtRQUNWLGNBQWMsRUFBZCx3QkFBYztRQUNkLGFBQWEsRUFBYix1QkFBYTtRQUNiLE1BQU0sRUFBTixlQUFNO0tBQ1A7SUFDRCxRQUFRLEVBQUU7UUFDUixlQUFlLEVBQWYseUJBQWU7UUFDZixrQkFBa0IsRUFBbEIsNEJBQWtCO1FBQ2xCLGtCQUFrQixFQUFsQixpQ0FBa0I7UUFDbEIsU0FBUyxFQUFULGtCQUFTO1FBQ1QsV0FBVyxFQUFYLHNCQUFXO1FBQ1gsZ0JBQWdCLEVBQWhCLDBCQUFnQjtRQUNoQixtQkFBbUIsRUFBbkIsNkJBQW1CO0tBQ3BCO0lBQ0QsWUFBWSxFQUFFO1FBQ1osaUJBQWlCLEVBQWpCLGdDQUFpQjtRQUNqQixtQkFBbUIsRUFBbkIsa0NBQW1CO0tBQ3BCO0NBQ0YsQ0FBQztBQUVGLGtCQUFlLFNBQVMsQ0FBQyJ9