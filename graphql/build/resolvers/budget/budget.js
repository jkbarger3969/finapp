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
const budget = (parent, args, context, info) => __awaiter(void 0, void 0, void 0, function* () {
    return ((yield context.db
        .collection("budget")
        .aggregate([{ $match: { _id: new mongodb_1.ObjectId(args.id) } }, mongoUtils_1.addId])
        .toArray())[0] || null);
});
exports.default = budget;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYnVkZ2V0LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL3Jlc29sdmVycy9idWRnZXQvYnVkZ2V0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7O0FBQUEscUNBQW1DO0FBR25DLG9EQUE0QztBQVc1QyxNQUFNLE1BQU0sR0FBNkIsQ0FDdkMsTUFBTSxFQUNOLElBQUksRUFDSixPQUFPLEVBQ1AsSUFBSSxFQUNKLEVBQUU7SUFDRixPQUFPLENBQ0wsQ0FDRSxNQUFNLE9BQU8sQ0FBQyxFQUFFO1NBQ2IsVUFBVSxDQUFDLFFBQVEsQ0FBQztTQUNwQixTQUFTLENBQUMsQ0FBQyxFQUFFLE1BQU0sRUFBRSxFQUFFLEdBQUcsRUFBRSxJQUFJLGtCQUFRLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxFQUFFLEVBQUUsRUFBRSxrQkFBSyxDQUFDLENBQUM7U0FDOUQsT0FBTyxFQUFFLENBQ2IsQ0FBQyxDQUFDLENBQUMsSUFBSSxJQUFJLENBQ2IsQ0FBQztBQUNKLENBQUMsQ0FBQSxDQUFDO0FBRUYsa0JBQWUsTUFBTSxDQUFDIn0=