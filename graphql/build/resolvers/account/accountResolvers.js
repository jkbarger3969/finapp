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
const alias_1 = require("../alias");
const AccountCardResolver = Object.assign({ id: ({ _id }) => _id.toString(), account: ({ account }, _, { dataSources: { accountingDb } }) => accountingDb.findOne({
        collection: "accounts",
        filter: { _id: account },
    }), active: ({ account, active }, _, { dataSources: { accountingDb } }) => __awaiter(void 0, void 0, void 0, function* () {
        if (!active ||
            // If the linked account is NOT active all CARDS are NOT active.
            !(yield accountingDb.findOne({
                collection: "accounts",
                filter: { _id: account },
            })).active) {
            return false;
        }
        else {
            return active;
        }
    }), authorizedUsers: ({ authorizedUsers }, _, { db }) => (0, entity_1.getEntities)(authorizedUsers, db), type: ({ type }) => (0, gqlEnums_1.serializeGQLEnum)(type) }, (0, alias_1.getAliasableResolvers)("AccountCard"));
exports.AccountCard = AccountCardResolver;
const AccountCheckResolver = {
    account: ({ account }, _, { dataSources: { accountingDb } }) => accountingDb.findOne({
        collection: "accounts",
        filter: { _id: account },
    }),
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
    cards: ({ _id }, _, { dataSources: { accountingDb } }) => accountingDb.find({
        collection: "paymentCards",
        filter: { account: _id },
    }),
    owner: ({ owner }, _, { db }) => (0, entity_1.getEntity)(owner, db),
};
exports.AccountCreditCard = AccountCreditCardResolver;
const AccountCheckingResolver = {
    id: ({ _id }) => _id.toString(),
    cards: ({ _id }, _, { dataSources: { accountingDb } }) => accountingDb.find({
        collection: "paymentCards",
        filter: { account: _id },
    }),
    owner: ({ owner }, _, { db }) => (0, entity_1.getEntity)(owner, db),
};
exports.AccountChecking = AccountCheckingResolver;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYWNjb3VudFJlc29sdmVycy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9yZXNvbHZlcnMvYWNjb3VudC9hY2NvdW50UmVzb2x2ZXJzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7OztBQWFBLHNDQUFtRTtBQUNuRSxnREFBcUQ7QUFDckQsb0NBQWlEO0FBb0NqRCxNQUFNLG1CQUFtQixtQkFFckIsRUFBRSxFQUFFLENBQUMsRUFBRSxHQUFHLEVBQUUsRUFBRSxFQUFFLENBQUMsR0FBRyxDQUFDLFFBQVEsRUFBRSxFQUMvQixPQUFPLEVBQUUsQ0FBQyxFQUFFLE9BQU8sRUFBRSxFQUFFLENBQUMsRUFBRSxFQUFFLFdBQVcsRUFBRSxFQUFFLFlBQVksRUFBRSxFQUFFLEVBQUUsRUFBRSxDQUM3RCxZQUFZLENBQUMsT0FBTyxDQUFDO1FBQ25CLFVBQVUsRUFBRSxVQUFVO1FBQ3RCLE1BQU0sRUFBRSxFQUFFLEdBQUcsRUFBRSxPQUFPLEVBQUU7S0FDekIsQ0FBQyxFQUNKLE1BQU0sRUFBRSxDQUNOLEVBQUUsT0FBTyxFQUFFLE1BQU0sRUFBRSxFQUNuQixDQUFDLEVBQ0QsRUFBRSxXQUFXLEVBQUUsRUFBRSxZQUFZLEVBQUUsRUFBRSxFQUNqQyxFQUFFO1FBQ0YsSUFDRSxDQUFDLE1BQU07WUFDUCxnRUFBZ0U7WUFDaEUsQ0FBQyxDQUNDLE1BQU0sWUFBWSxDQUFDLE9BQU8sQ0FBQztnQkFDekIsVUFBVSxFQUFFLFVBQVU7Z0JBQ3RCLE1BQU0sRUFBRSxFQUFFLEdBQUcsRUFBRSxPQUFPLEVBQUU7YUFDekIsQ0FBQyxDQUNILENBQUMsTUFBTSxFQUNSO1lBQ0EsT0FBTyxLQUFLLENBQUM7U0FDZDthQUFNO1lBQ0wsT0FBTyxNQUFNLENBQUM7U0FDZjtJQUNILENBQUMsQ0FBQSxFQUNELGVBQWUsRUFBRSxDQUFDLEVBQUUsZUFBZSxFQUFFLEVBQUUsQ0FBQyxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFB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