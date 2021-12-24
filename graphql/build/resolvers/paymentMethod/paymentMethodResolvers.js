"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentMethodCard = exports.PaymentMethodInterface = exports.PaymentCheckInterface = exports.PaymentCard = exports.PaymentCardInterface = void 0;
const mongodb_1 = require("mongodb");
const gqlEnums_1 = require("../utils/gqlEnums");
const queryUtils_1 = require("../utils/queryUtils");
// Payment Card
exports.PaymentCardInterface = {
    __resolveType: ({ __typename }) => __typename,
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicGF5bWVudE1ldGhvZFJlc29sdmVycy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9yZXNvbHZlcnMvcGF5bWVudE1ldGhvZC9wYXltZW50TWV0aG9kUmVzb2x2ZXJzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUFBLHFDQUFtQztBQVduQyxnREFBcUQ7QUFDckQsb0RBQWtEO0FBb0NsRCxlQUFlO0FBQ0YsUUFBQSxvQkFBb0IsR0FBa0M7SUFDakUsYUFBYSxFQUFFLENBQUMsRUFBRSxVQUFVLEVBQUUsRUFBRSxFQUFFLENBQUMsVUFBVTtJQUM3QyxJQUFJLEVBQUUsQ0FBQyxFQUFFLElBQUksRUFBRSxFQUFFLEVBQUUsQ0FBQyxJQUFBLDJCQUFnQixFQUFrQixJQUFJLENBQUM7Q0FDNUQsQ0FBQztBQUVXLFFBQUEsV0FBVyxHQUF5Qiw0QkFBb0IsQ0FBQztBQUV0RSxpQkFBaUI7QUFDakIsTUFBTSw2QkFBNkIsR0FHL0I7SUFDRixhQUFhLEVBQUUsQ0FBQyxHQUFHLEVBQUUsRUFBRSxDQUFDLENBQUMsU0FBUyxJQUFJLEdBQUcsQ0FBQyxDQUFDLENBQUMsY0FBYyxDQUFDLENBQUMsQ0FBQyxjQUFjLENBQUM7Q0FDN0UsQ0FBQztBQUVXLFFBQUEscUJBQXFCLEdBQ2hDLDZCQUEwRSxDQUFDO0FBRTdFLGlCQUFpQjtBQUNqQixNQUFNLDhCQUE4QixHQUdoQztJQUNGLGFBQWEsRUFBRSxDQUFDLEVBQUUsSUFBSSxFQUFFLEVBQUUsRUFBRSxDQUMxQixnQkFBZ0IsSUFBSSxFQU1NO0NBQzdCLENBQUM7QUFFVyxRQUFBLHNCQUFzQixHQUNqQyw4QkFBNEUsQ0FBQztBQUUvRSxNQUFNLHlCQUF5QixHQUczQjtJQUNGLElBQUksRUFBRSxDQUFDLEVBQUUsSUFBSSxFQUFFLEVBQUUsQ0FBQyxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxDQUM1QixJQUFJLFlBQVksa0JBQVE7UUFDdEIsQ0FBQyxDQUFDLElBQUEsd0JBQVcsRUFDVCxhQUFhLEVBQ2IsRUFBRSxDQUFDLFVBQVUsQ0FBQyxjQUFjLENBQUMsQ0FBQyxPQUFPLENBQUMsRUFBRSxHQUFHLEVBQUUsSUFBSSxFQUFFLENBQUMsQ0FDckQ7UUFDSCxDQUFDLENBQUUsZ0JBQUUsVUFBVSxFQUFFLGFBQWEsSUFBSyxJQUFJLENBQVU7Q0FDdEQsQ0FBQztBQUVXLFFBQUEsaUJBQWlCLEdBQzVCLHlCQUFrRSxDQUFDIn0=