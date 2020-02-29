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
const departments_1 = require("./departments");
const nodeResolver_1 = require("./utils/nodeResolver");
const addId = { $addFields: { id: { $toString: "$_id" } } };
exports.businesses = (parent, args, context, info) => __awaiter(void 0, void 0, void 0, function* () {
    const { db } = context;
    const searchByName = args.searchByName ? args.searchByName.trim() : "";
    if (searchByName.length > 0) {
        const nameResults = yield db
            .collection("businesses")
            .aggregate([
            { $match: { name: new RegExp(`(^|\\s)${searchByName}`, "i") } },
            addId
        ])
            .toArray();
        return nameResults;
    }
    const allBusinesses = yield db
        .collection("businesses")
        .aggregate([addId])
        .toArray();
    return allBusinesses;
});
exports.business = (parent, args, context, info) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = args;
    const { db } = context;
    const result = yield db
        .collection("businesses")
        .aggregate([{ $match: { _id: new mongodb_1.ObjectID(id) } }, { $limit: 1 }, addId])
        .toArray();
    return result[0];
});
exports.departments = (parent, args, context, info) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = parent;
    return departments_1.departments({}, { fromParent: id }, context, info);
});
exports.addBusiness = (parent, args, context, info) => __awaiter(void 0, void 0, void 0, function* () {
    const { db } = context;
    const { fields: { name } } = args;
    if (!name.trim()) {
        throw new Error(`Mutation "addBusiness" name.`);
    }
    const { insertedCount, insertedId } = yield db
        .collection("businesses")
        .insertOne({ name, verified: false });
    if (insertedCount === 0) {
        throw new Error(`Mutation "addBusiness" arguments "${JSON.stringify(args)}" failed.`);
    }
    const newBusiness = yield db
        .collection("businesses")
        .aggregate([
        { $match: { _id: new mongodb_1.ObjectID(insertedId) } },
        { $limit: 1 },
        { $addFields: { id: { $toString: "$_id" } } }
    ])
        .toArray();
    return newBusiness[0];
});
exports.Business = {
    budget: nodeResolver_1.nodeFieldResolver,
    departments: exports.departments
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYnVzaW5lc3MuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvcmVzb2x2ZXJzL2J1c2luZXNzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7O0FBQUEscUNBQW1DO0FBT25DLCtDQUFtRTtBQUNuRSx1REFBeUQ7QUFFekQsTUFBTSxLQUFLLEdBQUcsRUFBRSxVQUFVLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxTQUFTLEVBQUUsTUFBTSxFQUFFLEVBQUUsRUFBRSxDQUFDO0FBRS9DLFFBQUEsVUFBVSxHQUFpQyxDQUN0RCxNQUFNLEVBQ04sSUFBSSxFQUNKLE9BQU8sRUFDUCxJQUFJLEVBQ0osRUFBRTtJQUNGLE1BQU0sRUFBRSxFQUFFLEVBQUUsR0FBRyxPQUFPLENBQUM7SUFDdkIsTUFBTSxZQUFZLEdBQUcsSUFBSSxDQUFDLFlBQVksQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxJQUFJLEVBQUUsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDO0lBRXZFLElBQUksWUFBWSxDQUFDLE1BQU0sR0FBRyxDQUFDLEVBQUU7UUFDM0IsTUFBTSxXQUFXLEdBQUcsTUFBTSxFQUFFO2FBQ3pCLFVBQVUsQ0FBQyxZQUFZLENBQUM7YUFDeEIsU0FBUyxDQUFDO1lBQ1QsRUFBRSxNQUFNLEVBQUUsRUFBRSxJQUFJLEVBQUUsSUFBSSxNQUFNLENBQUMsVUFBVSxZQUFZLEVBQUUsRUFBRSxHQUFHLENBQUMsRUFBRSxFQUFFO1lBQy9ELEtBQUs7U0FDTixDQUFDO2FBQ0QsT0FBTyxFQUFFLENBQUM7UUFFYixPQUFPLFdBQVcsQ0FBQztLQUNwQjtJQUVELE1BQU0sYUFBYSxHQUFHLE1BQU0sRUFBRTtTQUMzQixVQUFVLENBQUMsWUFBWSxDQUFDO1NBQ3hCLFNBQVMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDO1NBQ2xCLE9BQU8sRUFBRSxDQUFDO0lBRWIsT0FBTyxhQUFhLENBQUM7QUFDdkIsQ0FBQyxDQUFBLENB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