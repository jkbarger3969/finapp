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
const user_1 = require("./resolvers/user");
const resolvers = {
    Budget: budget_1.Budget,
    Business: business_1.Business,
    Department: departments_1.Department,
    JournalEntry: JournalEntryResolver_1.default,
    JournalEntryRefund: JournalEntryRefundResolver_1.default,
    JournalEntryItem: JournalEntryItemResolver_1.default,
    PaymentMethod: PaymehtMethodResolver_1.default,
    JournalEntryCategory: journalEntryCategory_1.JournalEntryCategory,
    User: user_1.User,
    Query: {
        businesses: business_1.businesses,
        business: business_1.business,
        budgets: budget_1.budgets,
        journalEntry: journalEntry_2.default,
        journalEntryRefund: journalEntryRefund_1.default,
        journalEntryItem: journalEntryItem_1.default,
        journalEntries: journalEntries_1.default,
        journalEntrySources: journalEntrySource_1.journalEntrySources,
        journalEntryCategories: journalEntryCategories_1.default,
        journalEntryCategory: journalEntryCategory_1.journalEntryCategory,
        departments: departments_1.departments,
        department: departments_1.department,
        paymentMethods: paymentMethods_1.default,
        paymentMethod: paymentMethod_1.default,
        people: person_1.people,
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVzb2x2ZXJzLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vc3JjL3Jlc29sdmVycy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUNBLCtDQUFxRDtBQUNyRCxtREFLOEI7QUFDOUIseURBQThFO0FBQzlFLDJEQUlrQztBQUNsQyw0RUFBcUU7QUFDckUsd0VBQWlFO0FBQ2pFLDhFQUF1RTtBQUN2RSxvRkFBNkU7QUFDN0Usb0ZBQTZFO0FBQzdFLDBGQUFtRjtBQUNuRixnR0FBeUY7QUFDekYsZ0dBQXlGO0FBQ3pGLHNGQUErRTtBQUMvRSw0RkFBcUY7QUFDckYsNEZBQXFGO0FBQ3JGLGdGQUF5RTtBQUN6RSx3RkFBeUU7QUFDekUsb0dBQXFGO0FBQ3JGLGdHQUFpRjtBQUNqRix3RkFBaUY7QUFDakYsdUVBQXFFO0FBQ3JFLDJFQUkwQztBQUMxQyxvR0FBNkY7QUFDN0YsNkVBQXNFO0FBQ3RFLDJFQUFvRTtBQUNwRSxpRkFBMEU7QUFDMUUsdUZBQWdGO0FBQ2hGLDJGQUE0RTtBQUM1RSwrQ0FBdUQ7QUFDdkQsMkNBQXdDO0FBRXhDLE1BQU0sU0FBUyxHQUFjO0lBQzNCLE1BQU0sRUFBTixlQUFNO0lBQ04sUUFBUSxFQUFSLG1CQUFRO0lBQ1IsVUFBVSxFQUFWLHdCQUFVO0lBQ1YsWUFBWSxFQUFaLDhCQUFZO0lBQ1osa0JBQWtCLEVBQWxCLG9DQUFrQjtJQUNsQixnQkFBZ0IsRUFBaEIsa0NBQWdCO0lBQ2hCLGFBQWEsRUFBYiwrQkFBYTtJQUNiLG9CQUFvQixFQUFwQiwyQ0FBb0I7SUFDcEIsSUFBSSxFQUFKLFdBQUk7SUFDSixLQUFLLEVBQUU7UUFDTCxVQUFVLEVBQVYscUJBQVU7UUFDVixRQUFRLEVBQVIsbUJBQVE7UUFDUixPQUFPLEVBQVAsZ0JBQU87UUFDUCxZQUFZLEVBQVosc0JBQVk7UUFDWixrQkFBa0IsRUFBbEIsNEJBQWtCO1FBQ2xCLGdCQUFnQixFQUFoQiwwQkFBZ0I7UUFDaEIsY0FBYyxFQUFkLHdCQUFjO1FBQ2QsbUJBQW1CLEVBQW5CLHdDQUFtQjtRQUNuQixzQkFBc0IsRUFBdEIsZ0NBQXNCO1FBQ3RCLG9CQUFvQixFQUFwQiwyQ0FBb0I7UUFDcEIsV0FBVyxFQUFYLHlCQUFXO1FBQ1gsVUFBVSxFQUFWLHdCQUFVO1FBQ1YsY0FBYyxFQUFkLHdCQUFjO1FBQ2QsYUFBYSxFQUFiLHVCQUFhO1FBQ2IsTUFBTSxFQUFOLGVBQU07S0FDUDtJQUNELFFBQVEsRUFBRTtRQUNSLGVBQWUsRUFBZix5QkFBZTtRQUNmLGtCQUFrQixFQUFsQiw0QkFBa0I7UUFDbEIsa0JBQWtCLEVBQWxCLGlDQUFrQjtRQUNsQixxQkFBcUIsRUFBckIsK0JBQXFCO1FBQ3JCLHdCQUF3QixFQUF4QixrQ0FBd0I7UUFDeEIsd0JBQXdCLEVBQXhCLGtDQUF3QjtRQUN4QixtQkFBbUIsRUFBbkIsNkJBQW1CO1FBQ25CLHNCQUFzQixFQUF0QixnQ0FBc0I7UUFDdEIsc0JBQXNCLEVBQXRCLGdDQUFzQjtRQUN0QixTQUFTLEVBQVQsa0JBQVM7UUFDVCxXQUFXLEVBQVgsc0JBQVc7UUFDWCxnQkFBZ0IsRUFBaEIsMEJBQWdCO1FBQ2hCLG1CQUFtQixFQUFuQiw2QkFBbUI7S0FDcEI7SUFDRCxZQUFZLEVBQUU7UUFDWixpQkFBaUIsRUFBakIsZ0NBQWlCO1FBQ2pCLG1CQUFtQixFQUFuQixrQ0FBbUI7UUFDbkIsb0JBQW9CLEVBQXBCLDhCQUFvQjtLQUNyQjtDQUNGLENBQUM7QUFFRixrQkFBZSxTQUFTLENBQUMifQ==