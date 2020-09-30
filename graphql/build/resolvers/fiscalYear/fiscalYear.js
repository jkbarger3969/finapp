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
const utils_1 = require("./utils");
const fiscalYear = (parent, args, context, info) => __awaiter(void 0, void 0, void 0, function* () {
    return ((yield context.db
        .collection("fiscalYears")
        .aggregate([
        { $match: { _id: new mongodb_1.ObjectId(args.id) } },
        mongoUtils_1.addId,
        utils_1.transmutationStage,
    ])
        .toArray())[0] || null);
});
exports.default = fiscalYear;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZmlzY2FsWWVhci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9yZXNvbHZlcnMvZmlzY2FsWWVhci9maXNjYWxZZWFyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7O0FBQUEscUNBQW1DO0FBR25DLG9EQUE0QztBQUM1QyxtQ0FBNkM7QUFFN0MsTUFBTSxVQUFVLEdBQWlDLENBQy9DLE1BQU0sRUFDTixJQUFJLEVBQ0osT0FBTyxFQUNQLElBQUksRUFDSixFQUFFO0lBQ0YsT0FBTyxDQUNMLENBQ0UsTUFBTSxPQUFPLENBQUMsRUFBRTtTQUNiLFVBQVUsQ0FBQyxhQUFhLENBQUM7U0FDekIsU0FBUyxDQUFDO1FBQ1QsRUFBRSxNQUFNLEVBQUUsRUFBRSxHQUFHLEVBQUUsSUFBSSxrQkFBUSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsRUFBRSxFQUFFO1FBQzFDLGtCQUFLO1FBQ0wsMEJBQWtCO0tBQ25CLENBQUM7U0FDRCxPQUFPLEVBQUUsQ0FDYixDQUFDLENBQUMsQ0FBQyxJQUFJLElBQUksQ0FDYixDQUFDO0FBQ0osQ0FBQyxDQUFBLENBQUM7QUFFRixrQkFBZSxVQUFVLENBQUMifQ==