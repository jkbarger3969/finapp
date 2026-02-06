"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentMethodCard = exports.PaymentMethodInterface = exports.PaymentCheckInterface = exports.PaymentCard = exports.PaymentCardInterface = void 0;
const mongodb_1 = require("mongodb");
const gqlEnums_1 = require("../utils/gqlEnums");
const queryUtils_1 = require("../utils/queryUtils");
// Payment Card
exports.PaymentCardInterface = {
    __resolveType: (card) => ("account" in card ? "AccountCard" : "PaymentCard"),
    type: ({ type }) => (0, gqlEnums_1.serializeGQLEnum)(type),
};
exports.PaymentCard = exports.PaymentCardInterface;
//  Payment Check
const PaymentCheckInterfaceResolver = {
    __resolveType: (doc) => ("account" in doc ? "AccountCheck" : "PaymentCheck"),
};
exports.PaymentCheckInterface = PaymentCheckInterfaceResolver;
// Payment Method
const PaymentMethodInterfaceResolver = {
    __resolveType: ({ type }) => `PaymentMethod${type}`,
};
exports.PaymentMethodInterface = PaymentMethodInterfaceResolver;
const PaymentMethodCardResolver = {
    card: ({ card }, _, { db }) => card instanceof mongodb_1.ObjectId
        ? (0, queryUtils_1.addTypename)("AccountCard", db.collection("paymentCards").findOne({ _id: card }))
        : Object.assign({ __typename: "PaymentCard" }, card),
};
exports.PaymentMethodCard = PaymentMethodCardResolver;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicGF5bWVudE1ldGhvZFJlc29sdmVycy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9yZXNvbHZlcnMvcGF5bWVudE1ldGhvZC9wYXltZW50TWV0aG9kUmVzb2x2ZXJzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUFBLHFDQUFtQztBQVduQyxnREFBcUQ7QUFDckQsb0RBQWtEO0FBb0NsRCxlQUFlO0FBQ0YsUUFBQSxvQkFBb0IsR0FBUTtJQUN2QyxhQUFhLEVBQUUsQ0FBQyxJQUFTLEVBQUUsRUFBRSxDQUFDLENBQUMsU0FBUyxJQUFJLElBQUksQ0FBQyxDQUFDLENBQUMsYUFBYSxDQUFDLENBQUMsQ0FBQyxhQUFhLENBQUM7SUFDakYsSUFBSSxFQUFFLENBQUMsRUFBRSxJQUFJLEVBQU8sRUFBRSxFQUFFLENBQUMsSUFBQSwyQkFBZ0IsRUFBa0IsSUFBSSxDQUFDO0NBQ2pFLENBQUM7QUFFVyxRQUFBLFdBQVcsR0FBeUIsNEJBQW9CLENBQUM7QUFFdEUsaUJBQWlCO0FBQ2pCLE1BQU0sNkJBQTZCLEdBRy9CO0lBQ0YsYUFBYSxFQUFFLENBQUMsR0FBRyxFQUFFLEVBQUUsQ0FBQyxDQUFDLFNBQVMsSUFBSSxHQUFHLENBQUMsQ0FBQyxDQUFDLGNBQWMsQ0FBQyxDQUFDLENBQUMsY0FBYyxDQUFDO0NBQzdFLENBQUM7QUFFVyxRQUFBLHFCQUFxQixHQUNoQyw2QkFBMEUsQ0FBQztBQUU3RSxpQkFBaUI7QUFDakIsTUFBTSw4QkFBOEIsR0FHaEM7SUFDRixhQUFhLEVBQUUsQ0FBQyxFQUFFLElBQUksRUFBRSxFQUFFLEVBQUUsQ0FDMUIsZ0JBQWdCLElBQUksRUFNSTtDQUMzQixDQUFDO0FBRVcsUUFBQSxzQkFBc0IsR0FDakMsOEJBQTRFLENBQUM7QUFFL0UsTUFBTSx5QkFBeUIsR0FHM0I7SUFDRixJQUFJLEVBQUUsQ0FBQyxFQUFFLElBQUksRUFBRSxFQUFFLENBQUMsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsQ0FDNUIsSUFBSSxZQUFZLGtCQUFRO1FBQ3RCLENBQUMsQ0FBQyxJQUFBLHdCQUFXLEVBQ1gsYUFBYSxFQUNiLEVBQUUsQ0FBQyxVQUFVLENBQUMsY0FBYyxDQUFDLENBQUMsT0FBTyxDQUFDLEVBQUUsR0FBRyxFQUFFLElBQUksRUFBRSxDQUFDLENBQ3JEO1FBQ0QsQ0FBQyxDQUFFLGdCQUFFLFVBQVUsRUFBRSxhQUFhLElBQUssSUFBSSxDQUFVO0NBQ3RELENBQUM7QUFFVyxRQUFBLGlCQUFpQixHQUM1Qix5QkFBa0UsQ0FBQyJ9