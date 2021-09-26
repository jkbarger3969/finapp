"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.account = void 0;
const mongodb_1 = require("mongodb");
const account = (_, { id }, { db }) => {
    return db.collection("accounts").findOne({ _id: new mongodb_1.ObjectId(id) });
};
exports.account = account;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYWNjb3VudC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9yZXNvbHZlcnMvYWNjb3VudC9hY2NvdW50LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUFBLHFDQUFtQztBQUk1QixNQUFNLE9BQU8sR0FBOEIsQ0FBQyxDQUFDLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUU7SUFDdEUsT0FBTyxFQUFFLENBQUMsVUFBVSxDQUFDLFVBQVUsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxFQUFFLEdBQUcsRUFBRSxJQUFJLGtCQUFRLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDO0FBQ3RFLENBQUMsQ0FBQztBQUZXLFFBQUEsT0FBTyxXQUVsQiJ9