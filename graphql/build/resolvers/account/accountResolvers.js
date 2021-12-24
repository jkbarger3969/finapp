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
const entity_1 = require("../entity");
const gqlEnums_1 = require("../utils/gqlEnums");
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
    type: ({ type }) => (0, gqlEnums_1.serializeGQLEnum)(type),
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYWNjb3VudFJlc29sdmVycy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9yZXNvbHZlcnMvYWNjb3VudC9hY2NvdW50UmVzb2x2ZXJzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7OztBQWFBLHNDQUFtRTtBQUNuRSxnREFBcUQ7QUFvQ3JELE1BQU0sbUJBQW1CLEdBQ3ZCO0lBQ0UsRUFBRSxFQUFFLENBQUMsRUFBRSxHQUFHLEVBQUUsRUFBRSxFQUFFLENBQUMsR0FBRyxDQUFDLFFBQVEsRUFBRTtJQUMvQixPQUFPLEVBQUUsQ0FBQyxFQUFFLE9BQU8sRUFBRSxFQUFFLENBQUMsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsQ0FDbEMsRUFBRSxDQUFDLFVBQVUsQ0FBQyxVQUFVLENBQUMsQ0FBQyxPQUFPLENBQUMsRUFBRSxHQUFHLEVBQUUsT0FBTyxFQUFFLENBQUM7SUFDckQsTUFBTSxFQUFFLENBQU8sRUFBRSxPQUFPLEVBQUUsTUFBTSxFQUFFLEVBQUUsQ0FBQyxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRTtRQUMvQyxJQUNFLENBQUMsTUFBTTtZQUNQLGdFQUFnRTtZQUNoRSxDQUFDLENBQ0MsTUFBTSxFQUFFO2lCQUNMLFVBQVUsQ0FBa0IsVUFBVSxDQUFDO2lCQUN2QyxPQUFPLENBQUMsRUFBRSxHQUFHLEVBQUUsT0FBTyxFQUFFLENBQUMsQ0FDN0IsQ0FBQyxNQUFNLEVBQ1I7WUFDQSxPQUFPLEtBQUssQ0FBQztTQUNkO2FBQU07WUFDTCxPQUFPLE1BQU0sQ0FBQztTQUNmO0lBQ0gsQ0FBQyxDQUFBO0lBQ0QsZUFBZSxFQUFFLENBQUMsRUFBRSxlQUFlLEVBQUUsRUFBRSxDQUFDLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLENBQ2xELElBQUEsb0JBQVcsRUFBQyxlQUFlLEVBQUUsRUFBRSxDQUFDO0lBQ2xDLElBQUksRUFBRSxDQUFDLEVBQUUsSUFBSSxFQUFFLEVB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