"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.alias = void 0;
const mongodb_1 = require("mongodb");
const alias = (_, { id }, { db }) => db.collection("aliases").findOne({ _id: new mongodb_1.ObjectId(id) });
exports.alias = alias;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYWxpYXMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvcmVzb2x2ZXJzL2FsaWFzL2FsaWFzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUFBLHFDQUFtQztBQUk1QixNQUFNLEtBQUssR0FBNEIsQ0FBQyxDQUFDLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsQ0FDbEUsRUFBRSxDQUFDLFVBQVUsQ0FBQyxTQUFTLENBQUMsQ0FBQyxPQUFPLENBQUMsRUFBRSxHQUFHLEVBQUUsSUFBSSxrQkFBUSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQVEsQ0FBQztBQUR4RCxRQUFBLEtBQUssU0FDbUQifQ==