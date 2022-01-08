"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.fiscalYear = void 0;
const mongodb_1 = require("mongodb");
const fiscalYear = (_, { id }, { dataSources: { accountingDb } }) => accountingDb.findOne({
    collection: "fiscalYears",
    filter: { _id: new mongodb_1.ObjectId(id) },
});
exports.fiscalYear = fiscalYear;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZmlzY2FsWWVhci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9yZXNvbHZlcnMvZmlzY2FsWWVhci9maXNjYWxZZWFyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUFBLHFDQUFtQztBQUk1QixNQUFNLFVBQVUsR0FBaUMsQ0FDdEQsQ0FBQyxFQUNELEVBQUUsRUFBRSxFQUFFLEVBQ04sRUFBRSxXQUFXLEVBQUUsRUFBRSxZQUFZLEVBQUUsRUFBRSxFQUNqQyxFQUFFLENBQ0YsWUFBWSxDQUFDLE9BQU8sQ0FBQztJQUNuQixVQUFVLEVBQUUsYUFBYTtJQUN6QixNQUFNLEVBQUUsRUFBRSxHQUFHLEVBQUUsSUFBSSxrQkFBUSxDQUFDLEVBQUUsQ0FBQyxFQUFFO0NBQ2xDLENBQUMsQ0FBQztBQVJRLFFBQUEsVUFBVSxjQVFsQiJ9