"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.category = void 0;
const mongodb_1 = require("mongodb");
const category = (_, { id }, { dataSources: { accountingDb } }) => __awaiter(void 0, void 0, void 0, function* () {
    return accountingDb.findOne({
        collection: "categories",
        filter: { _id: new mongodb_1.ObjectId(id) },
    });
});
exports.category = category;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2F0ZWdvcnkuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvcmVzb2x2ZXJzL2NhdGVnb3J5L2NhdGVnb3J5LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7OztBQUFBLHFDQUFtQztBQUc1QixNQUFNLFFBQVEsR0FBa0QsQ0FDckUsQ0FBQyxFQUNELEVBQUUsRUFBRSxFQUFFLEVBQ04sRUFBRSxXQUFXLEVBQUUsRUFBRSxZQUFZLEVBQUUsRUFBRSxFQUNqQyxFQUFFO0lBQ0YsT0FBQSxZQUFZLENBQUMsT0FBTyxDQUFDO1FBQ25CLFVBQVUsRUFBRSxZQUFZO1FBQ3hCLE1BQU0sRUFBRSxFQUFFLEdBQUcsRUFBRSxJQUFJLGtCQUFRLENBQUMsRUFBRSxDQUFDLEVBQUU7S0FDbEMsQ0FBQyxDQUFBO0VBQUEsQ0FBQztBQVJRLFFBQUEsUUFBUSxZQVFoQiJ9