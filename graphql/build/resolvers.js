"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const budget_1 = require("./resolvers/budget");
const business_1 = require("./resolvers/business");
const departments_1 = require("./resolvers/departments");
const journalEntry_1 = require("./resolvers/journalEntry");
const journalEntrySource_1 = require("./resolvers/journalEntrySource");
const journalEntryCategory_1 = require("./resolvers/journalEntryCategory");
const paymentMethod_1 = require("./resolvers/paymentMethod");
const person_1 = require("./resolvers/person");
const user_1 = require("./resolvers/user");
const resolvers = {
    Budget: budget_1.Budget,
    Business: business_1.Business,
    Department: departments_1.Department,
    JournalEntry: journalEntry_1.JournalEntry,
    PaymentMethod: paymentMethod_1.PaymentMethod,
    JournalEntryCategory: journalEntryCategory_1.JournalEntryCategory,
    User: user_1.User,
    Query: {
        businesses: business_1.businesses,
        business: business_1.business,
        budgets: budget_1.budgets,
        journalEntries: journalEntry_1.journalEntries,
        journalEntrySources: journalEntrySource_1.journalEntrySources,
        journalEntryCategories: journalEntryCategory_1.journalEntryCategories,
        journalEntryCategory: journalEntryCategory_1.journalEntryCategory,
        departments: departments_1.departments,
        department: departments_1.department,
        paymentMethods: paymentMethod_1.paymentMethods,
        people: person_1.people,
    },
    Mutation: {
        addJournalEntry: journalEntry_1.addJournalEntry,
        updateJournalEntry: journalEntry_1.updateJournalEntry,
        addPerson: person_1.addPerson,
        addBusiness: business_1.addBusiness
    },
    Subscription: {
        journalEntryAdded: journalEntry_1.journalEntryAdded,
        journalEntryUpdated: journalEntry_1.journalEntryUpdated
    }
};
exports.default = resolvers;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVzb2x2ZXJzLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vc3JjL3Jlc29sdmVycy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUNBLCtDQUFtRDtBQUNuRCxtREFBaUY7QUFDakYseURBQTRFO0FBQzVFLDJEQUVrQztBQUNsQyx1RUFBbUU7QUFDbkUsMkVBQzBDO0FBQzFDLDZEQUF3RTtBQUN4RSwrQ0FBcUQ7QUFDckQsMkNBQXNDO0FBRXRDLE1BQU0sU0FBUyxHQUFhO0lBQzFCLE1BQU0sRUFBTixlQUFNO0lBQ04sUUFBUSxFQUFSLG1CQUFRO0lBQ1IsVUFBVSxFQUFWLHdCQUFVO0lBQ1YsWUFBWSxFQUFaLDJCQUFZO0lBQ1osYUFBYSxFQUFiLDZCQUFhO0lBQ2Isb0JBQW9CLEVBQXBCLDJDQUFvQjtJQUNwQixJQUFJLEVBQUosV0FBSTtJQUNKLEtBQUssRUFBRTtRQUNMLFVBQVUsRUFBVixxQkFBVTtRQUNWLFFBQVEsRUFBUixtQkFBUTtRQUNSLE9BQU8sRUFBUCxnQkFBTztRQUNQLGNBQWMsRUFBZCw2QkFBYztRQUNkLG1CQUFtQixFQUFuQix3Q0FBbUI7UUFDbkIsc0JBQXNCLEVBQXRCLDZDQUFzQjtRQUN0QixvQkFBb0IsRUFBcEIsMkNBQW9CO1FBQ3BCLFdBQVcsRUFBWCx5QkFBVztRQUNYLFVBQVUsRUFBVix3QkFBVTtRQUNWLGNBQWMsRUFBZCw4QkFBYztRQUNkLE1BQU0sRUFBTixlQUFNO0tBQ1A7SUFDRCxRQUFRLEVBQUM7UUFDUCxlQUFlLEVBQWYsOEJBQWU7UUFDZixrQkFBa0IsRUFBbEIsaUNBQWtCO1FBQ2xCLFNBQVMsRUFBVCxrQkFBUztRQUNULFdBQVcsRUFBWCxzQkFBVztLQUNaO0lBQ0QsWUFBWSxFQUFDO1FBQ1gsaUJBQWlCLEVBQWpCLGdDQUFpQjtRQUNqQixtQkFBbUIsRUFBbkIsa0NBQW1CO0tBQ3BCO0NBQ0YsQ0FBQztBQUVGLGtCQUFlLFNBQVMsQ0FBQyJ9