"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.entry = void 0;
const mongodb_1 = require("mongodb");
const entry = (_, { id }, { db }) => db.collection("entries").findOne({ _id: new mongodb_1.ObjectId(id) });
exports.entry = entry;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZW50cnkuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvcmVzb2x2ZXJzL2VudHJ5L2VudHJ5LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUFBLHFDQUFtQztBQUc1QixNQUFNLEtBQUssR0FBK0MsQ0FDL0QsQ0FBQyxFQUNELEVBQUUsRUFBRSxFQUFFLEVBQ04sRUFBRSxFQUFFLEVBQUUsRUFDTixFQUFFLENBQUMsRUFBRSxDQUFDLFVBQVUsQ0FBQyxTQUFTLENBQUMsQ0FBQyxPQUFPLENBQUMsRUFBRSxHQUFHLEVBQUUsSUFBSSxrQkFBUSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQztBQUpwRCxRQUFBLEtBQUssU0FJK0MifQ==