"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const budget_1 = require("./resolvers/budget");
const business_1 = require("./resolvers/business");
const departments_1 = require("./resolvers/departments");
const journalEntry_1 = require("./resolvers/journalEntry");
const journalEntries_1 = require("./resolvers/journalEntry/journalEntries");
const journalEntry_2 = require("./resolvers/journalEntry/journalEntry");
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
        journalEntry: journalEntry_2.default,
        journalEntries: journalEntries_1.default,
        journalEntrySources: journalEntrySource_1.journalEntrySources,
        journalEntryCategories: journalEntryCategory_1.journalEntryCategories,
        journalEntryCategory: journalEntryCategory_1.journalEntryCategory,
        departments: departments_1.departments,
        department: departments_1.department,
        paymentMethods: paymentMethod_1.paymentMethods,
        people: person_1.people
    },
    Mutation: {
        journalEntryAdd: journalEntry_1.journalEntryAdd,
        journalEntryUpdate: journalEntry_1.journalEntryUpdate,
        journalEntryDelete: journalEntry_1.journalEntryDelete,
        addPerson: person_1.addPerson,
        addBusiness: business_1.addBusiness
    },
    Subscription: {
        journalEntryAdded: journalEntry_1.journalEntryAdded,
        journalEntryUpdated: journalEntry_1.journalEntryUpdated
    }
};
exports.default = resolvers;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVzb2x2ZXJzLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vc3JjL3Jlc29sdmVycy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUNBLCtDQUFxRDtBQUNyRCxtREFLOEI7QUFDOUIseURBQThFO0FBQzlFLDJEQU9rQztBQUNsQyw0RUFBcUU7QUFDckUsd0VBQWlFO0FBQ2pFLHVFQUFxRTtBQUNyRSwyRUFJMEM7QUFDMUMsNkRBQTBFO0FBQzFFLCtDQUF1RDtBQUN2RCwyQ0FBd0M7QUFFeEMsTUFBTSxTQUFTLEdBQWM7SUFDM0IsTUFBTSxFQUFOLGVBQU07SUFDTixRQUFRLEVBQVIsbUJBQVE7SUFDUixVQUFVLEVBQVYsd0JBQVU7SUFDVixZQUFZLEVBQVosMkJBQVk7SUFDWixhQUFhLEVBQWIsNkJBQWE7SUFDYixvQkFBb0IsRUFBcEIsMkNBQW9CO0lBQ3BCLElBQUksRUFBSixXQUFJO0lBQ0osS0FBSyxFQUFFO1FBQ0wsVUFBVSxFQUFWLHFCQUFVO1FBQ1YsUUFBUSxFQUFSLG1CQUFRO1FBQ1IsT0FBTyxFQUFQLGdCQUFPO1FBQ1AsWUFBWSxFQUFaLHNCQUFZO1FBQ1osY0FBYyxFQUFkLHdCQUFjO1FBQ2QsbUJBQW1CLEVBQW5CLHdDQUFtQjtRQUNuQixzQkFBc0IsRUFBdEIsNkNBQXNCO1FBQ3RCLG9CQUFvQixFQUFwQiwyQ0FBb0I7UUFDcEIsV0FBVyxFQUFYLHlCQUFXO1FBQ1gsVUFBVSxFQUFWLHdCQUFVO1FBQ1YsY0FBYyxFQUFkLDhCQUFjO1FBQ2QsTUFBTSxFQUFOLGVBQU07S0FDUDtJQUNELFFBQVEsRUFBRTtRQUNSLGVBQWUsRUFBZiw4QkFBZTtRQUNmLGtCQUFrQixFQUFsQixpQ0FBa0I7UUFDbEIsa0JBQWtCLEVBQWxCLGlDQUFrQjtRQUNsQixTQUFTLEVBQVQsa0JBQVM7UUFDVCxXQUFXLEVBQVgsc0JBQVc7S0FDWjtJQUNELFlBQVksRUFBRTtRQUNaLGlCQUFpQixFQUFqQixnQ0FBaUI7UUFDakIsbUJBQW1CLEVBQW5CLGtDQUFtQjtLQUNwQjtDQUNGLENBQUM7QUFFRixrQkFBZSxTQUFTLENBQUMifQ==