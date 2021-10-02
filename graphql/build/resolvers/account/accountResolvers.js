"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AccountChecking = exports.AccountCreditCard = exports.AccountWithCardsInterface = exports.AccountInterface = exports.AccountCheck = exports.AccountCard = void 0;
const snake_case_1 = require("snake-case");
const entity_1 = require("../entity");
const AccountCardResolver = {
    id: ({ _id }) => _id.toString(),
    account: ({ account }, _, { db }) => db.collection("accounts").findOne({ _id: account }),
    active: ({ account, active }, _, { db }) => __awaiter(void 0, void 0, void 0, function* () {
        if (!active ||
            // If the linked account is NOT active all CARDS are NOT active.
            !(yield db
                .collection("accounts")
                .findOne({ _id: account })).active) {
            return false;
        }
        else {
            return active;
        }
    }),
    authorizedUsers: ({ authorizedUsers }, _, { db }) => (0, entity_1.getEntities)(authorizedUsers, db),
    type: ({ type }) => (0, snake_case_1.snakeCase)(type).toUpperCase(),
};
exports.AccountCard = AccountCardResolver;
const AccountCheckResolver = {
    account: ({ account }, _, { db }) => db.collection("accounts").findOne({ _id: account }),
};
exports.AccountCheck = AccountCheckResolver;
const AccountInterfaceResolver = {
    __resolveType: ({ accountType }) => `Account${accountType}`,
};
exports.AccountInterface = AccountInterfaceResolver;
const AccountWithCardsInterfaceResolver = {
    __resolveType: ({ accountType }) => `Account${accountType}`,
};
exports.AccountWithCardsInterface = AccountWithCardsInterfaceResolver;
const AccountCreditCardResolver = {
    id: ({ _id }) => _id.toString(),
    cards: ({ cards }, _, { db }) => cards
        ? db
            .collection("paymentCards")
            .find({ _id: { $in: cards } })
            .toArray()
        : [],
    owner: ({ owner }, _, { db }) => (0, entity_1.getEntity)(owner, db),
};
exports.AccountCreditCard = AccountCreditCardResolver;
const AccountCheckingResolver = {
    id: ({ _id }) => _id.toString(),
    cards: ({ cards }, _, { db }) => cards
        ? db
            .collection("paymentCards")
            .find({ _id: { $in: cards } })
            .toArray()
        : [],
    owner: ({ owner }, _, { db }) => (0, entity_1.getEntity)(owner, db),
};
exports.AccountChecking = AccountCheckingResolver;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYWNjb3VudFJlc29sdmVycy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9yZXNvbHZlcnMvYWNjb3VudC9hY2NvdW50UmVzb2x2ZXJzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7OztBQVlBLDJDQUF1QztBQUV2QyxzQ0FBbUU7QUFvQ25FLE1BQU0sbUJBQW1CLEdBQ3ZCO0lBQ0UsRUFBRSxFQUFFLENBQUMsRUFBRSxHQUFHLEVBQUUsRUFBRSxFQUFFLENBQUMsR0FBRyxDQUFDLFFBQVEsRUFBRTtJQUMvQixPQUFPLEVBQUUsQ0FBQyxFQUFFLE9BQU8sRUFBRSxFQUFFLENBQUMsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsQ0FDbEMsRUFBRSxDQUFDLFVBQVUsQ0FBQyxVQUFVLENBQUMsQ0FBQyxPQUFPLENBQUMsRUFBRSxHQUFHLEVBQUUsT0FBTyxFQUFFLENBQUM7SUFDckQsTUFBTSxFQUFFLENBQU8sRUFBRSxPQUFPLEVBQUUsTUFBTSxFQUFFLEVBQUUsQ0FBQyxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRTtRQUMvQyxJQUNFLENBQUMsTUFBTTtZQUNQLGdFQUFnRTtZQUNoRSxDQUFDLENBQ0MsTUFBTSxFQUFFO2lCQUNMLFVBQVUsQ0FBa0IsVUFBVSxDQUFDO2lCQUN2QyxPQUFPLENBQUMsRUFBRSxHQUFHLEVBQUUsT0FBTyxFQUFFLENBQUMsQ0FDN0IsQ0FBQyxNQUFNLEVBQ1I7WUFDQSxPQUFPLEtBQUssQ0FBQztTQUNkO2FBQU07WUFDTCxPQUFPLE1BQU0sQ0FBQztTQUNmO0lBQ0gsQ0FBQyxDQUFBO0lBQ0QsZUFBZSxFQUFFLENBQUMsRUFBRSxlQUFlLEVBQUUsRUFBRSxDQUFDLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLENBQ2xELElBQUEsb0JBQVcsRUFBQyxlQUFlLEVBQUUsRUFBRSxDQUFDO0lBQ2xDLElBQUksRUFBRSxDQUFDLEVBQUUsSUFBSSxFQUFFLEVB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