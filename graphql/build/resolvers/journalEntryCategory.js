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
exports.JournalEntryCategory = exports.type = exports.ancestors = exports.journalEntryCategory = exports.journalEntryCategories = void 0;
const mongodb_1 = require("mongodb");
const graphTypes_1 = require("../graphTypes");
const nodeResolver_1 = require("./utils/nodeResolver");
const addId = { $addFields: { id: { $toString: "$_id" } } };
const journalEntryCategories = (parent, args, context, info) => __awaiter(void 0, void 0, void 0, function* () {
    const { db } = context;
    const results = yield db
        .collection("journalEntryCategories")
        .aggregate([addId])
        .toArray();
    return results;
});
exports.journalEntryCategories = journalEntryCategories;
const journalEntryCategory = (parent, args, context, info) => __awaiter(void 0, void 0, void 0, function* () {
    const { db } = context;
    const { id } = args;
    const result = yield db
        .collection("journalEntryCategories")
        .aggregate([{ $match: { _id: new mongodb_1.ObjectId(id) } }, addId])
        .toArray();
    return result[0];
});
exports.journalEntryCategory = journalEntryCategory;
const ancestors = (parent, args, context, info) => __awaiter(void 0, void 0, void 0, function* () {
    const { db, nodeMap } = context;
    const id = parent === null || parent === void 0 ? void 0 : parent.id;
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
exports.ancestors = ancestors;
const children = (parent, args, context, info) => __awaiter(void 0, void 0, void 0, function* () {
    const { db, nodeMap } = context;
    const id = parent === null || parent === void 0 ? void 0 : parent.id;
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
const type = (parent, args, context, info) => {
    return parent.type === "credit"
        ? graphTypes_1.JournalEntryType.Credit
        : graphTypes_1.JournalEntryType.Debit;
};
exports.type = type;
exports.JournalEntryCategory = {
    parent: nodeResolver_1.nodeFieldResolver,
    type: exports.type,
    ancestors: exports.ancestors,
    children,
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiam91cm5hbEVudHJ5Q2F0ZWdvcnkuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvcmVzb2x2ZXJzL2pvdXJuYWxFbnRyeUNhdGVnb3J5LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7OztBQUFBLHFDQUFtQztBQUVuQyw4Q0FJdUI7QUFDdkIsdURBQXlEO0FBRXpELE1BQU0sS0FBSyxHQUFHLEVBQUUsVUFBVSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsU0FBUyxFQUFFLE1BQU0sRUFBRSxFQUFFLEVBQUUsQ0FBQztBQUVyRCxNQUFNLHNCQUFzQixHQUE2QyxDQUM5RSxNQUFNLEVBQ04sSUFBSSxFQUNKLE9BQU8sRUFDUCxJQUFJLEVBQ0osRUFBRTtJQUNGLE1BQU0sRUFBRSxFQUFFLEVBQUUsR0FBRyxPQUFPLENBQUM7SUFFdkIsTUFBTSxPQUFPLEdBQUcsTUFBTSxFQUFFO1NBQ3JCLFVBQVUsQ0FBQyx3QkFBd0IsQ0FBQztTQUNwQyxTQUFTLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQztTQUNsQixPQUFPLEVBQUUsQ0FBQztJQUViLE9BQU8sT0FBTyxDQUFDO0FBQ2pCLENBQUMsQ0FBQSxDQUFDO0FBZFcsUUFBQSxzQkFBc0IsMEJBY2pDO0FBRUssTUFBTSxvQkFBb0IsR0FBMkMsQ0FDMUUsTUFBTSxFQUNOLElBQUksRUFDSixPQUFPLEVBQ1AsSUFBSSxFQUNKLEVBQUU7SUFDRixNQUFNLEVBQUUsRUFBRSxFQUFFLEdBQUcsT0FBTyxDQUFDO0lBRXZCLE1BQU0sRUFBRSxFQUFFLEVBQUUsR0FBRyxJQUFJLENBQUM7SUFFcEIsTUFBTSxNQUFNLEdBQUcsTUFBTSxFQUFFO1NBQ3BCLFVBQVUsQ0FBQyx3QkFBd0IsQ0FBQztTQUNwQyxTQUFTLENBQUMsQ0FBQyxFQUFFLE1BQU0sRUFBRSxFQUFFLEdBQUcsRUFBRSxJQUFJLGtCQUFRLENBQUMsRUFBRSxDQUFDLEVBQUUsRUFBRSxFQUFFLEtBQUssQ0FBQyxDQUFD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