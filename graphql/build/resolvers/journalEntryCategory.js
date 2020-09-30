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
const graphTypes_1 = require("../graphTypes");
const nodeResolver_1 = require("./utils/nodeResolver");
const addId = { $addFields: { id: { $toString: "$_id" } } };
exports.journalEntryCategories = (parent, args, context, info) => __awaiter(void 0, void 0, void 0, function* () {
    const { db } = context;
    const results = yield db
        .collection("journalEntryCategories")
        .aggregate([addId])
        .toArray();
    return results;
});
exports.journalEntryCategory = (parent, args, context, info) => __awaiter(void 0, void 0, void 0, function* () {
    const { db } = context;
    const { id } = args;
    const result = yield db
        .collection("journalEntryCategories")
        .aggregate([{ $match: { _id: new mongodb_1.ObjectId(id) } }, addId])
        .toArray();
    return result[0];
});
exports.ancestors = (parent, args, context, info) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const { db, nodeMap } = context;
    const id = (_a = parent) === null || _a === void 0 ? void 0 : _a.id;
    if (!id) {
        return [];
    }
    // Currently only ONE type
    // const parentNodeType = nodeMap.id.get(node.toString());
    const results = yield db
        .collection("journalEntryCategories")
        .aggregate([
        { $match: { _id: new mongodb_1.ObjectId(id) } },
        {
            $graphLookup: {
                from: "journalEntryCategories",
                startWith: "$parent.id",
                connectFromField: "parent.id",
                connectToField: "_id",
                as: "ancestors",
            },
        },
        {
            $unwind: {
                path: "$ancestors",
                preserveNullAndEmptyArrays: false,
            },
        },
        { $replaceRoot: { newRoot: "$ancestors" } },
        { $addFields: { __typename: "JournalEntryCategory" } },
        { $addFields: { id: { $toString: "$_id" } } },
    ])
        .toArray();
    return results;
});
const children = (parent, args, context, info) => __awaiter(void 0, void 0, void 0, function* () {
    var _b;
    const { db, nodeMap } = context;
    const id = (_b = parent) === null || _b === void 0 ? void 0 : _b.id;
    if (!id) {
        return [];
    }
    const results = yield db
        .collection("journalEntryCategories")
        .aggregate([
        { $match: { "parent.id": new mongodb_1.ObjectId(id) } },
        { $addFields: { id: { $toString: "$_id" } } },
    ])
        .toArray();
    return results;
});
exports.type = (parent, args, context, info) => {
    return parent.type === "credit"
        ? graphTypes_1.JournalEntryType.Credit
        : graphTypes_1.JournalEntryType.Debit;
};
exports.JournalEntryCategory = {
    parent: nodeResolver_1.nodeFieldResolver,
    type: exports.type,
    ancestors: exports.ancestors,
    children,
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiam91cm5hbEVudHJ5Q2F0ZWdvcnkuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvcmVzb2x2ZXJzL2pvdXJuYWxFbnRyeUNhdGVnb3J5LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7O0FBQUEscUNBQW1DO0FBRW5DLDhDQUl1QjtBQUN2Qix1REFBeUQ7QUFFekQsTUFBTSxLQUFLLEdBQUcsRUFBRSxVQUFVLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxTQUFTLEVBQUUsTUFBTSxFQUFFLEVBQUUsRUFBRSxDQUFDO0FBRS9DLFFBQUEsc0JBQXNCLEdBQTZDLENBQzlFLE1BQU0sRUFDTixJQUFJLEVBQ0osT0FBTyxFQUNQLElBQUksRUFDSixFQUFFO0lBQ0YsTUFBTSxFQUFFLEVBQUUsRUFBRSxHQUFHLE9BQU8sQ0FBQztJQUV2QixNQUFNLE9BQU8sR0FBRyxNQUFNLEVBQUU7U0FDckIsVUFBVSxDQUFDLHdCQUF3QixDQUFDO1NBQ3BDLFNBQVMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDO1NBQ2xCLE9BQU8sRUFBRSxDQUFDO0lBRWIsT0FBTyxPQUFPLENBQUM7QUFDakIsQ0FBQyxDQUFBLENBQUM7QUFFVyxRQUFBLG9CQUFvQixHQUEyQyxDQUMxRSxNQUFNLEVBQ04sSUFBSSxFQUNKLE9BQU8sRUFDUCxJQUFJLEVBQ0osRUFBRTtJQUNGLE1BQU0sRUFBRSxFQUFFLEVBQUUsR0FBRyxPQUFPLENBQUM7SUFFdkIsTUFBTSxFQUFFLEVBQUUsRUFBRSxHQUFHLElBQUksQ0FBQztJQUVwQixNQUFNLE1BQU0sR0FBRyxNQUFNLEVBQUU7U0FDcEIsVUFBVSxDQUFDLHdCQUF3QixDQUFDO1NBQ3BDLFNBQVMsQ0FBQyxDQUFDLEVBQUUsTUFBTSxFQUFFLEVBQUUsR0FBRyxFQUFFLElBQUksa0JBQVEsQ0FBQyxFQUFFLENBQUMsRUFBRSxFQUFFLEVBQUUsS0FBSyxDQUFDLENBQUM7U0FDekQsT0FBTyxFQUFFLENBQUM7SUFF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