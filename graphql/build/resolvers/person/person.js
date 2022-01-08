"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.person = void 0;
const mongodb_1 = require("mongodb");
const person = (_, { id }, { dataSources: { accountingDb } }) => accountingDb.findOne({
    collection: "people",
    filter: { _id: new mongodb_1.ObjectId(id) },
});
exports.person = person;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicGVyc29uLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL3Jlc29sdmVycy9wZXJzb24vcGVyc29uLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUFBLHFDQUFtQztBQUc1QixNQUFNLE1BQU0sR0FBNkIsQ0FDOUMsQ0FBQyxFQUNELEVBQUUsRUFBRSxFQUFFLEVBQ04sRUFBRSxXQUFXLEVBQUUsRUFBRSxZQUFZLEVBQUUsRUFBRSxFQUNqQyxFQUFFLENBQ0YsWUFBWSxDQUFDLE9BQU8sQ0FBQztJQUNuQixVQUFVLEVBQUUsUUFBUTtJQUNwQixNQUFNLEVBQUUsRUFBRSxHQUFHLEVBQUUsSUFBSSxrQkFBUSxDQUFDLEVBQUUsQ0FBQyxFQUFFO0NBQ2xDLENBQUMsQ0FBQztBQVJRLFFBQUEsTUFBTSxVQVFkIn0=