"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.business = void 0;
const mongodb_1 = require("mongodb");
const business = (_, { id }, { dataSources: { accountingDb } }) => accountingDb.findOne({
    collection: "businesses",
    filter: { _id: new mongodb_1.ObjectId(id) },
});
exports.business = business;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYnVzaW5lc3MuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvcmVzb2x2ZXJzL2J1c2luZXNzL2J1c2luZXNzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUVBLHFDQUFtQztBQVk1QixNQUFNLFFBQVEsR0FBK0IsQ0FDbEQsQ0FBQyxFQUNELEVBQUUsRUFBRSxFQUFFLEVBQ04sRUFBRSxXQUFXLEVBQUUsRUFBRSxZQUFZLEVBQUUsRUFBRSxFQUNqQyxFQUFFLENBQ0YsWUFBWSxDQUFDLE9BQU8sQ0FBQztJQUNuQixVQUFVLEVBQUUsWUFBWTtJQUN4QixNQUFNLEVBQUUsRUFBRSxHQUFHLEVBQUUsSUFBSSxrQkFBUSxDQUFDLEVBQUUsQ0FBQyxFQUFFO0NBQ2xDLENBQUMsQ0FBQztBQVJRLFFBQUEsUUFBUSxZQVFoQiJ9