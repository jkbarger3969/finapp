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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiam91cm5hbEVudHJ5Q2F0ZWdvcnkuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvcmVzb2x2ZXJzL2pvdXJuYWxFbnRyeUNhdGVnb3J5LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7OztBQUFBLHFDQUFtQztBQUVuQyw4Q0FJdUI7QUFDdkIsdURBQXlEO0FBRXpELE1BQU0sS0FBSyxHQUFHLEVBQUUsVUFBVSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsU0FBUyxFQUFFLE1BQU0sRUFBRSxFQUFFLEVBQUUsQ0FBQztBQUUvQyxRQUFBLHNCQUFzQixHQUE2QyxDQUM5RSxNQUFNLEVBQ04sSUFBSSxFQUNKLE9BQU8sRUFDUCxJQUFJLEVBQ0osRUFBRTtJQUNGLE1BQU0sRUFBRSxFQUFFLEVBQUUsR0FBRyxPQUFPLENBQUM7SUFFdkIsTUFBTSxPQUFPLEdBQUcsTUFBTSxFQUFFO1NBQ3JCLFVBQVUsQ0FBQyx3QkFBd0IsQ0FBQztTQUNwQyxTQUFTLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQztTQUNsQixPQUFPLEVBQUUsQ0FBQztJQUViLE9BQU8sT0FBTyxDQUFDO0FBQ2pCLENBQUMsQ0FBQSxDQUFDO0FBRVcsUUFBQSxvQkFBb0IsR0FBMkMsQ0FDMUUsTUFBTSxFQUNOLElBQUksRUFDSixPQUFPLEVBQ1AsSUFBSSxFQUNKLEVBQUU7SUFDRixNQUFNLEVBQUUsRUFBRSxFQUFFLEdBQUcsT0FBTyxDQUFDO0lBRXZCLE1BQU0sRUFBRSxFQUFFLEVBQUUsR0FBRyxJQUFJLENBQUM7SUFFcEIsTUFBTSxNQUFNLEdBQUcsTUFBTSxFQUFFO1NBQ3BCLFVBQVUsQ0FBQyx3QkFBd0IsQ0FBQztTQUNwQyxTQUFTLENBQUMsQ0FBQyxFQUFFLE1BQU0sRUFBRSxFQUFFLEdBQUcsRUFBRSxJQUFJLGtCQUFRLENBQUMsRUFBRSxDQUFDLEVBQUUsRUFBRSxFQUFFLEtBQUssQ0FBQyxDQUFDO1NBQ3pELE9BQU8sRUFBRSxDQUFDO0lBRWIsT0FBTyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDbkIsQ0FBQyxDQUFBLENBQUM7QUFFVyxRQUFBLFNBQVMsR0FBK0MsQ0FDbkUsTUFBTSxFQUNOLElBQUksRUFDSixPQUFPLEVBQ1AsSUFBSSxFQUNKLEVBQUU7SUFDRixNQUFNLEVBQUUsRUFBRSxFQUFFLE9BQU8sRUFBRSxHQUFHLE9BQU8sQ0FBQztJQUNoQyxNQUFNLEVBQUUsR0FBRyxNQUFNLGFBQU4sTUFBTSx1QkFBTixNQUFNLENBQUUsRUFBRSxDQUFDO0lBRXRCLElBQUksQ0FBQyxFQUFFLEVBQUU7UUFDUCxPQUFPLEVBQUUsQ0FBQztLQUNYO0lBRUQsMEJBQTBCO0lBQzFCLDBEQUEwRDtJQUUxRCxNQUFNLE9BQU8sR0FBRyxNQUFNLEVBQUU7U0FDckIsVUFBVSxDQUFDLHdCQUF3QixDQUFDO1NBQ3BDLFNBQVMsQ0FBQztRQUNULEVBQUUsTUFBTSxFQUFFLEVBQUUsR0FBRyxFQUFFLElBQUksa0JBQVEsQ0FBQyxFQUFFLENBQUMsRUFBRSxFQUFFO1FBQ3JDO1lBQ0UsWUFBWSxFQUFFO2dCQUNaLElBQUksRUFBRSx3QkFBd0I7Z0JBQzlCLFNBQVMsRUFBRSxZQUFZO2dCQUN2QixnQkFBZ0IsRUFBRSxXQUFXO2dCQUM3QixjQUFjLEVBQUUsS0FBSztnQkFDckIsRUFBRSxFQUFFLFdBQVc7YUFDaEI7U0FDRjtRQUNEO1lBQ0UsT0FBTyxFQUFFO2dCQUNQLElBQUksRUFBRSxZQUFZO2dCQUNsQiwwQkFBMEIsRUFBRSxLQUFLO2FBQ2xDO1NBQ0Y7UUFDRCxFQUFFLFlBQVksRUFBRSxFQUFFLE9BQU8sRUFBRSxZQUFZLEVBQUUsRUFBRTtRQUMzQyxFQUFFLFVBQVUsRUFBRSxFQUFFLFVBQVUsRUFBRSxzQkFBc0IsRUFBRSxFQUFFO1FBQ3RELEVBQUUsVUFBVSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsU0FBUyxFQUFFLE1BQU0sRUFBRSxFQUFFLEVBQUU7S0FDOUMsQ0FBQztTQUNELE9BQU8sRUFBRSxDQUFDO0lBRWIsT0FBTyxPQUFPLENBQUM7QUFDakIsQ0FBQyxDQUFBLENBQUM7QUFFRixNQUFNLFFBQVEsR0FBOEMsQ0FDMUQsTUFBTSxFQUNOLElBQUksRUFDSixPQUFPLEVBQ1AsSUFBSSxFQUNKLEVBQUU7SUFDRixNQUFNLEVBQUUsRUFBRSxFQUFFLE9BQU8sRUFBRSxHQUFHLE9BQU8sQ0FBQztJQUNoQyxNQUFNLEVBQUUsR0FBRyxNQUFNLGFBQU4sTUFBTSx1QkFBTixNQUFNLENBQUUsRUFBRSxDQUFDO0lBRXRCLElBQUksQ0FBQyxFQUFFLEVBQUU7UUFDUCxPQUFPLEVBQUUsQ0FBQztLQUNYO0lBRUQsTUFBTSxPQUFPLEdBQUcsTUFBTSxFQUFFO1NBQ3JCLFVBQVUsQ0FBQyx3QkFBd0IsQ0FBQztTQUNwQyxTQUFTLENBQUM7UUFDVCxFQUFFLE1BQU0sRUFBRSxFQUFFLFdBQVcsRUFBRSxJQUFJLGtCQUFRLENBQUMsRUFBRSxDQUFDLEVBQUUsRUFBRTtRQUM3QyxFQUFFLFVBQVUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLFNBQVMsRUFBRSxNQUFNLEVBQUUsRUFBRSxFQUFFO0tBQzlDLENBQUM7U0FDRCxPQUFPLEVBQUUsQ0FBQztJQUViLE9BQU8sT0FBTyxDQUFDO0FBQ2pCLENBQUMsQ0FBQSxDQUFDO0FBRVcsUUFBQSxJQUFJLEdBQTBDLENBQ3pELE1BQU0sRUFDTixJQUFJLEVBQ0osT0FBTyxFQUNQLElBQUksRUFDSixFQUFFO0lBQ0YsT0FBUSxNQUFjLENBQUMsSUFBSSxLQUFLLFFBQVE7UUFDdEMsQ0FBQyxDQUFDLDZCQUFnQixDQUFDLE1BQU07UUFDekIsQ0FBQyxDQUFDLDZCQUFnQixDQUFDLEtBQUssQ0FBQztBQUM3QixDQUFDLENBQUM7QUFFVyxRQUFBLG9CQUFvQixHQUFrQztJQUNqRSxNQUFNLEVBQUUsZ0NBQWlCO0lBQ3pCLElBQUksRUFBSixZQUFJO0lBQ0osU0FBUyxFQUFULGlCQUFTO0lBQ1QsUUFBUTtDQUNULENBQUMifQ==