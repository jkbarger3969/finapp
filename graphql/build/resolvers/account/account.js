"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.account = void 0;
const mongodb_1 = require("mongodb");
const account = (_, { id }, { dataSources: { accountingDb } }) => {
    return accountingDb.findOne({
        collection: "accounts",
        filter: { _id: new mongodb_1.ObjectId(id) },
    });
    // .collection("accounts").findOne({ _id: new ObjectId(id) });
};
exports.account = account;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYWNjb3VudC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9yZXNvbHZlcnMvYWNjb3VudC9hY2NvdW50LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUFBLHFDQUFtQztBQUk1QixNQUFNLE9BQU8sR0FBOEIsQ0FDaEQsQ0FBQyxFQUNELEVBQUUsRUFBRSxFQUFFLEVBQ04sRUFBRSxXQUFXLEVBQUUsRUFBRSxZQUFZLEVBQUUsRUFBRSxFQUNqQyxFQUFFO0lBQ0YsT0FBTyxZQUFZLENBQUMsT0FBTyxDQUFDO1FBQzFCLFVBQVUsRUFBRSxVQUFVO1FBQ3RCLE1BQU0sRUFBRSxFQUFFLEdBQUcsRUFBRSxJQUFJLGtCQUFRLENBQUMsRUFBRSxDQUFDLEVBQUU7S0FDbEMsQ0FBQyxDQUFDO0lBQ0gsOERBQThEO0FBQ2hFLENBQUMsQ0FBQztBQVZXLFFBQUEsT0FBTyxXQVVsQiJ9