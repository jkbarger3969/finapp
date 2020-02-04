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
        const nameResults = yield db.collection("businesses")
            .aggregate([
            { $match: { name: new RegExp(`(^|\\s)${searchByName}`, "i") } },
            addId
        ]).toArray();
        return nameResults;
    }
    const allBusinesses = yield db.collection("businesses")
        .aggregate([addId]).toArray();
    return allBusinesses;
});
exports.business = (parent, args, context, info) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = args;
    const { db } = context;
    const result = yield db.collection("businesses").aggregate([
        { $match: { _id: new mongodb_1.ObjectID(id) } },
        { $limit: 1 },
        addId
    ]).toArray();
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
    const { insertedCount, insertedId } = yield db.collection("businesses").insertOne({ name, verified: false });
    if (insertedCount === 0) {
        throw new Error(`Mutation "addBusiness" arguments "${JSON.stringify(args)}" failed.`);
    }
    const newBusiness = yield db.collection("businesses").aggregate([
        { $match: { _id: new mongodb_1.ObjectID(insertedId) } },
        { $limit: 1 },
        { $addFields: { id: { $toString: "$_id" } } }
    ]).toArray();
    return newBusiness[0];
});
exports.Business = {
    budget: nodeResolver_1.nodeFieldResolver,
    departments: exports.departments
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYnVzaW5lc3MuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvcmVzb2x2ZXJzL2J1c2luZXNzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7O0FBQUEscUNBQWlDO0FBSWpDLCtDQUFpRTtBQUNqRSx1REFBdUQ7QUFFdkQsTUFBTSxLQUFLLEdBQUcsRUFBQyxVQUFVLEVBQUUsRUFBQyxFQUFFLEVBQUMsRUFBQyxTQUFTLEVBQUUsTUFBTSxFQUFDLEVBQUMsRUFBQyxDQUFDO0FBRXhDLFFBQUEsVUFBVSxHQUNyQixDQUFPLE1BQU0sRUFBRSxJQUFJLEVBQUUsT0FBTyxFQUFFLElBQUksRUFBRSxFQUFFO0lBR3RDLE1BQU0sRUFBQyxFQUFFLEVBQUMsR0FBRyxPQUFPLENBQUM7SUFDckIsTUFBTSxZQUFZLEdBQUcsSUFBSSxDQUFDLFlBQVksQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxJQUFJLEVBQUUsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDO0lBRXZFLElBQUcsWUFBWSxDQUFDLE1BQU0sR0FBRyxDQUFDLEVBQUU7UUFFMUIsTUFBTSxXQUFXLEdBQUcsTUFBTSxFQUFFLENBQUMsVUFBVSxDQUFDLFlBQVksQ0FBQzthQUNsRCxTQUFTLENBQUM7WUFDVCxFQUFDLE1BQU0sRUFBQyxFQUFDLElBQUksRUFBQyxJQUFJLE1BQU0sQ0FBQyxVQUFVLFlBQVksRUFBRSxFQUFDLEdBQUcsQ0FBQyxFQUFDLEVBQUM7WUFDeEQsS0FBSztTQUNOLENBQUMsQ0FBQyxPQUFPLEVBQUUsQ0FBQztRQUVmLE9BQU8sV0FBVyxDQUFDO0tBRXBCO0lBRUQsTUFBTSxhQUFhLEdBQUcsTUFBTSxFQUFFLENBQUMsVUFBVSxDQUFDLFlBQVksQ0FBQztTQUNwRCxTQUFTLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLE9BQU8sRUFBRSxDQUFDO0lBRWhDLE9BQU8sYUFBYSxDQUFDO0FBRXZCLENBQUMsQ0FBQSxDQUFB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