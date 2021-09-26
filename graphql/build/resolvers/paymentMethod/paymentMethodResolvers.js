"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentMethodCard = exports.PaymentMethodInterface = exports.PaymentCheckInterface = exports.PaymentCardInterface = void 0;
const mongodb_1 = require("mongodb");
const gqlEnums_1 = require("../utils/gqlEnums");
const queryUtils_1 = require("../utils/queryUtils");
// Payment Card
exports.PaymentCardInterface = {
    __resolveType: ({ __typename }) => __typename,
    type: ({ type }) => (0, gqlEnums_1.deserializeGQLEnum)(type),
};
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicGF5bWVudE1ldGhvZFJlc29sdmVycy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9yZXNvbHZlcnMvcGF5bWVudE1ldGhvZC9wYXltZW50TWV0aG9kUmVzb2x2ZXJzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUFBLHFDQUFtQztBQVduQyxnREFBdUQ7QUFDdkQsb0RBQWtEO0FBb0NsRCxlQUFlO0FBQ0YsUUFBQSxvQkFBb0IsR0FBa0M7SUFDakUsYUFBYSxFQUFFLENBQUMsRUFBRSxVQUFVLEVBQUUsRUFBRSxFQUFFLENBQUMsVUFBVTtJQUM3QyxJQUFJLEVBQUUsQ0FBQyxFQUFFLElBQUksRUFBRSxFQUFFLEVBQUUsQ0FBQyxJQUFBLDZCQUFrQixFQUFrQixJQUFJLENBQUM7Q0FDOUQsQ0FBQztBQUVGLGlCQUFpQjtBQUNqQixNQUFNLDZCQUE2QixHQUcvQjtJQUNGLGFBQWEsRUFBRSxDQUFDLEdBQUcsRUFBRSxFQUFFLENBQUMsQ0FBQyxTQUFTLElBQUksR0FBRyxDQUFDLENBQUMsQ0FBQyxjQUFjLENBQUMsQ0FBQyxDQUFDLGNBQWMsQ0FBQztDQUM3RSxDQUFDO0FBRVcsUUFBQSxxQkFBcUIsR0FDaEMsNkJBQTBFLENBQUM7QUFFN0UsaUJBQWlCO0FBQ2pCLE1BQU0sOEJBQThCLEdBR2hDO0lBQ0YsYUFBYSxFQUFFLENBQUMsRUFBRSxJQUFJLEVBQUUsRUFBRSxFQUFFLENBQzFCLGdCQUFnQixJQUFJLEVBTU07Q0FDN0IsQ0FBQztBQUVXLFFBQUEsc0JBQXNCLEdBQ2pDLDhCQUE0RSxDQUFDO0FBRS9FLE1BQU0seUJBQXlCLEdBRzNCO0lBQ0YsSUFBSSxFQUFFLENBQUMsRUFBRSxJQUFJLEVBQUUsRUFBRSxDQUFDLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLENBQzVCLElBQUksWUFBWSxrQkFBUTtRQUN0QixDQUFDLENBQUMsSUFBQSx3QkFBVyxFQUNULGFBQWEsRUFDYixFQUFFLENBQUMsVUFBVSxDQUFDLGNBQWMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxFQUFFLEdBQUcsRUFBRSxJQUFJLEVBQUUsQ0FBQyxDQUNyRDtRQUNILENBQUMsQ0FBRSxnQkFBRSxVQUFVLEVBQUUsYUFBYSxJQUFLLElBQUksQ0FBVTtDQUN0RCxDQUFDO0FBRVcsUUFBQSxpQkFBaUIsR0FDNUIseUJBQWtFLENBQUMifQ==