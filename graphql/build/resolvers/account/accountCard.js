"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.accountCard = void 0;
const mongodb_1 = require("mongodb");
const accountCard = (_, { id }, { db }) => {
    return db.collection("paymentCards").findOne({ _id: new mongodb_1.ObjectId(id) });
};
exports.accountCard = accountCard;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYWNjb3VudENhcmQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvcmVzb2x2ZXJzL2FjY291bnQvYWNjb3VudENhcmQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBQUEscUNBQW1DO0FBSTVCLE1BQU0sV0FBVyxHQUFrQyxDQUN4RCxDQUFDLEVBQ0QsRUFBRSxFQUFFLEVBQUUsRUFDTixFQUFFLEVBQUUsRUFBRSxFQUNOLEVBQUU7SUFDRixPQUFPLEVBQUUsQ0FBQyxVQUFVLENBQUMsY0FBYyxDQUFDLENBQUMsT0FBTyxDQUFDLEVBQUUsR0FBRyxFQUFFLElBQUksa0JBQVEsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUM7QUFDMUUsQ0FBQyxDQUFDO0FBTlcsUUFBQSxXQUFXLGVBTXRCIn0=