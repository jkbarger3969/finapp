"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const budget_1 = require("./resolvers/budget");
const business_1 = require("./resolvers/business");
const departments_1 = require("./resolvers/departments");
const journalEntry_1 = require("./resolvers/journalEntry");
const journalEntries_1 = require("./resolvers/journalEntry/journalEntries");
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
        journalEntries: journalEntries_1.default,
        journalEntrySources: journalEntrySource_1.journalEntrySources,
        journalEntryCategories: journalEntryCategory_1.journalEntryCategories,
        journalEntryCategory: journalEntryCategory_1.journalEntryCategory,
        departments: departments_1.departments,
        department: departments_1.department,
        paymentMethods: paymentMethod_1.paymentMethods,
        people: person_1.people,
    },
    Mutation: {
        journalEntryAdd: journalEntry_1.journalEntryAdd,
        journalEntryUpdate: journalEntry_1.journalEntryUpdate,
        addPerson: person_1.addPerson,
        addBusiness: business_1.addBusiness
    },
    Subscription: {
        journalEntryAdded: journalEntry_1.journalEntryAdded,
        journalEntryUpdated: journalEntry_1.journalEntryUpdated
    }
};
exports.default = resolvers;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVzb2x2ZXJzLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vc3JjL3Jlc29sdmVycy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUNBLCtDQUFtRDtBQUNuRCxtREFBaUY7QUFDakYseURBQTRFO0FBQzVFLDJEQUVrQztBQUNsQyw0RUFBcUU7QUFDckUsdUVBQW1FO0FBQ25FLDJFQUMwQztBQUMxQyw2REFBd0U7QUFDeEUsK0NBQXFEO0FBQ3JELDJDQUFzQztBQUV0QyxNQUFNLFNBQVMsR0FBYTtJQUMxQixNQUFNLEVBQU4sZUFBTTtJQUNOLFFBQVEsRUFBUixtQkFBUTtJQUNSLFVBQVUsRUFBVix3QkFBVTtJQUNWLFlBQVksRUFBWiwyQkFBWTtJQUNaLGFBQWEsRUFBYiw2QkFBYTtJQUNiLG9CQUFvQixFQUFwQiwyQ0FBb0I7SUFDcEIsSUFBSSxFQUFKLFdBQUk7SUFDSixLQUFLLEVBQUU7UUFDTCxVQUFVLEVBQVYscUJBQVU7UUFDVixRQUFRLEVBQVIsbUJBQVE7UUFDUixPQUFPLEVBQVAsZ0JBQU87UUFDUCxjQUFjLEVBQWQsd0JBQWM7UUFDZCxtQkFBbUIsRUFBbkIsd0NBQW1CO1FBQ25CLHNCQUFzQixFQUF0Qiw2Q0FBc0I7UUFDdEIsb0JBQW9CLEVBQXBCLDJDQUFvQjtRQUNwQixXQUFXLEVBQVgseUJBQVc7UUFDWCxVQUFVLEVBQVYsd0JBQVU7UUFDVixjQUFjLEVBQWQsOEJBQWM7UUFDZCxNQUFNLEVBQU4sZUFBTTtLQUNQO0lBQ0QsUUFBUSxFQUFDO1FBQ1AsZUFBZSxFQUFmLDhCQUFlO1FBQ2Ysa0JBQWtCLEVBQWxCLGlDQUFrQjtRQUNsQixTQUFTLEVBQVQsa0JBQVM7UUFDVCxXQUFXLEVBQVgsc0JBQVc7S0FDWjtJQUNELFlBQVksRUFBQztRQUNYLGlCQUFpQixFQUFqQixnQ0FBaUI7UUFDakIsbUJBQW1CLEVBQW5CLGtDQUFtQjtLQUNwQjtDQUNGLENBQUM7QUFFRixrQkFBZSxTQUFTLENBQUMifQ==