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
const mongodb_1 = require("mongodb");
const mongoUtils_1 = require("../utils/mongoUtils");
const business = (parent, args, context, info) => __awaiter(void 0, void 0, void 0, function* () {
    return ((yield context.db
        .collection("businesses")
        .aggregate([{ $match: { _id: new mongodb_1.ObjectId(args.id) } }, mongoUtils_1.addId])
        .toArray())[0] || null);
});
exports.default = business;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYnVzaW5lc3MuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvcmVzb2x2ZXJzL2J1c2luZXNzL2J1c2luZXNzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7O0FBRUEscUNBQW1DO0FBQ25DLG9EQUE0QztBQVk1QyxNQUFNLFFBQVEsR0FBK0IsQ0FDM0MsTUFBTSxFQUNOLElBQUksRUFDSixPQUFPLEVBQ1AsSUFBSSxFQUNKLEVBQUU7SUFDRixPQUFPLENBQ0wsQ0FDRSxNQUFNLE9BQU8sQ0FBQyxFQUFFO1NBQ2IsVUFBVSxDQUFDLFlBQVksQ0FBQztTQUN4QixTQUFTLENBQUMsQ0FBQyxFQUFFLE1BQU0sRUFBRSxFQUFFLEdBQUcsRUFBRSxJQUFJLGtCQUFRLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxFQUFFLEVBQUUsRUFBRSxrQkFBSyxDQUFDLENBQUM7U0FDOUQsT0FBTyxFQUFFLENBQ2IsQ0FBQyxDQUFDLENBQUMsSUFBSSxJQUFJLENBQ2IsQ0FBQztBQUNKLENBQUMsQ0FBQSxDQUFDO0FBRUYsa0JBQWUsUUFBUSxDQUFDIn0=