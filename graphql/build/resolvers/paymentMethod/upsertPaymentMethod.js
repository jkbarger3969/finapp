"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.upsertPaymentMethodToDbRecord = void 0;
const change_case_1 = require("change-case");
const mongodb_1 = require("mongodb");
const upsertPaymentMethodToDbRecord = ({ upsertPaymentMethod, }) => {
    const [field] = Object.keys(upsertPaymentMethod);
    switch (field) {
        case "accountCard": {
            const { currency, card: cardId } = upsertPaymentMethod[field];
            const card = new mongodb_1.ObjectId(cardId);
            const payMethod = {
                currency,
                type: "Card",
                card,
            };
            return payMethod;
        }
        case "accountCheck": {
            const { currency, check: { account: accountId, checkNumber }, } = upsertPaymentMethod[field];
            const account = new mongodb_1.ObjectId(accountId);
            const payMethod = {
                currency,
                type: "Check",
                check: {
                    account,
                    checkNumber,
                },
            };
            return payMethod;
        }
        case "card": {
            const { currency, card: { trailingDigits, type }, } = upsertPaymentMethod[field];
            const payMethod = {
                currency,
                type: "Card",
                card: {
                    trailingDigits,
                    type: (0, change_case_1.pascalCase)(type),
                },
            };
            return payMethod;
        }
        case "check": {
            const { currency, check: { checkNumber }, } = upsertPaymentMethod[field];
            const payMethod = {
                currency,
                type: "Check",
                check: {
                    checkNumber,
                },
            };
            return payMethod;
        }
        case "cash":
        case "combination":
        case "online":
        case "unknown": {
            const { currency } = upsertPaymentMethod[field];
            const payMethod = {
                currency,
                type: (0, change_case_1.pascalCase)(field),
            };
            return payMethod;
        }
    }
};
exports.upsertPaymentMethodToDbRecord = upsertPaymentMethodToDbRecord;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXBzZXJ0UGF5bWVudE1ldGhvZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9yZXNvbHZlcnMvcGF5bWVudE1ldGhvZC91cHNlcnRQYXltZW50TWV0aG9kLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUNBLDZDQUF5QztBQUN6QyxxQ0FBbUM7QUFVNUIsTUFBTSw2QkFBNkIsR0FBRyxDQUFDLEVBQzVDLG1CQUFtQixHQUdwQixFQUF5QixFQUFFO0lBQzFCLE1BQU0sQ0FBQyxLQUFLLENBQUMsR0FBRyxNQUFNLENBQUMsSUFBSSxDQUFDLG1CQUFtQixDQUU5QyxDQUFDO0lBRUYsUUFBUSxLQUFLLEVBQUU7UUFDYixLQUFLLGFBQWEsQ0FBQyxDQUFDO1lBQ2xCLE1BQU0sRUFBRSxRQUFRLEVBQUUsSUFBSSxFQUFFLE1BQU0sRUFBRSxHQUFHLG1CQUFtQixDQUFDLEtBQUssQ0FBQyxDQUFDO1lBQzlELE1BQU0sSUFBSSxHQUFHLElBQUksa0JBQVEsQ0FBQyxNQUFNLENBQUMsQ0FBQztZQUNsQyxNQUFNLFNBQVMsR0FBOEI7Z0JBQzNDLFFBQVE7Z0JBQ1IsSUFBSSxFQUFFLE1BQU07Z0JBQ1osSUFBSTthQUNMLENBQUM7WUFDRixPQUFPLFNBQVMsQ0FBQztTQUNsQjtRQUNELEtBQUssY0FBYyxDQUFDLENBQUM7WUFDbkIsTUFBTSxFQUNKLFFBQVEsRUFDUixLQUFLLEVBQUUsRUFBRSxPQUFPLEVBQUUsU0FBUyxFQUFFLFdBQVcsRUFBRSxHQUMzQyxHQUFHLG1CQUFtQixDQUFDLEtBQUssQ0FBQyxDQUFDO1lBQy9CLE1BQU0sT0FBTyxHQUFHLElBQUksa0JBQVEsQ0FBQyxTQUFTLENBQUMsQ0FBQztZQUV4QyxNQUFNLFNBQVMsR0FBK0I7Z0JBQzVDLFFBQVE7Z0JBQ1IsSUFBSSxFQUFFLE9BQU87Z0JBQ2IsS0FBSyxFQUFFO29CQUNMLE9BQU87b0JBQ1AsV0FBVztpQkFDWjthQUNGLENBQUM7WUFFRixPQUFPLFNBQVMsQ0FBQztTQUNsQjtRQUNELEtBQUssTUFBTSxDQUFDLENBQUM7WUFDWCxNQUFNLEVBQ0osUUFBUSxFQUNSLElBQUksRUFBRSxFQUFFLGNBQWMsRUFBRSxJQUFJLEVBQUUsR0FDL0IsR0FBRyxtQkFBbUIsQ0FBQyxLQUFLLENBQUMsQ0FBQztZQUMvQixNQUFNLFNBQVMsR0FBOEI7Z0JBQzNDLFFBQVE7Z0JBQ1IsSUFBSSxFQUFFLE1BQU07Z0JBQ1osSUFBSSxFQUFFO29CQUNKLGNBQWM7b0JBQ2QsSUFBSSxFQUFFLElBQUEsd0JBQVUsRUFBQyxJQUFJLENBQTRCO2lCQUNsRDthQUNGLENBQUM7WUFFRixPQUFPLFNBQVMsQ0FBQztTQUNsQjtRQUNELEtBQUssT0FBTyxDQUFDLENBQUM7WUFDWixNQUFNLEVBQ0osUUFBUSxFQUNSLEtBQUssRUFBRSxFQUFFLFdBQVcsRUFBRSxHQUN2QixHQUFHLG1CQUFtQixDQUFDLEtBQUssQ0FBQyxDQUFDO1lBQy9CLE1BQU0sU0FBUyxHQUErQjtnQkFDNUMsUUFBUTtnQkFDUixJQUFJLEVBQUUsT0FBTztnQkFDYixLQUFLLEVBQUU7b0JBQ0wsV0FBVztpQkFDWjthQUNGLENBQUM7WUFFRixPQUFPLFNBQVMsQ0FBQztTQUNsQjtRQUVELEtBQUssTUFBTSxDQUFDO1FBQ1osS0FBSyxhQUFhLENBQUM7UUFDbkIsS0FBSyxRQUFRLENBQUM7UUFDZCxLQUFLLFNBQVMsQ0FBQyxDQUFDO1lBQ2QsTUFBTSxFQUFFLFFBQVEsRUFBRSxHQUFHLG1CQUFtQixDQUFDLEtBQUssQ0FBQyxDQUFDO1lBQ2hELE1BQU0sU0FBUyxHQUFrQztnQkFDL0MsUUFBUTtnQkFDUixJQUFJLEVBQUUsSUFBQSx3QkFBVSxFQUFDLEtBQUssQ0FBMEM7YUFDakUsQ0FBQztZQUNGLE9BQU8sU0FBUyxDQUFDO1NBQ2xCO0tBQ0Y7QUFDSCxDQUFDLENBQUM7QUFsRlcsUUFBQSw2QkFBNkIsaUNBa0Z4QyJ9