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
    const results = yield db.collection("journalEntryCategories")
        .aggregate([addId]).toArray();
    return results;
});
exports.journalEntryCategory = (parent, args, context, info) => __awaiter(void 0, void 0, void 0, function* () {
    const { db } = context;
    const { id } = args;
    const result = yield db.collection("journalEntryCategories").aggregate([
        { $match: { _id: new mongodb_1.ObjectID(id) } },
        addId
    ]).toArray();
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
    const results = yield db.collection('journalEntryCategories').aggregate([
        { $match: { _id: new mongodb_1.ObjectID(id) } },
        { $graphLookup: {
                from: "journalEntryCategories",
                startWith: "$parent.id",
                connectFromField: "parent.id",
                connectToField: "_id",
                as: "ancestors"
            } },
        { $unwind: {
                path: "$ancestors",
                preserveNullAndEmptyArrays: false
            } },
        { $replaceRoot: { newRoot: "$ancestors" } },
        { $addFields: { __typename: "JournalEntryCategory" } },
        { $addFields: { id: { $toString: "$_id" } } }
    ]).toArray();
    return results;
});
exports.type = (parent, args, context, info) => {
    return parent.type === "credit" ? graphTypes_1.JournalEntryType.Credit :
        graphTypes_1.JournalEntryType.Debit;
};
exports.JournalEntryCategory = {
    parent: nodeResolver_1.nodeFieldResolver,
    type: exports.type,
    ancestors: exports.ancestors
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiam91cm5hbEVudHJ5Q2F0ZWdvcnkuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvcmVzb2x2ZXJzL2pvdXJuYWxFbnRyeUNhdGVnb3J5LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7O0FBQUEscUNBQWlDO0FBRWpDLDhDQUN1QjtBQUN2Qix1REFBdUQ7QUFJdkQsTUFBTSxLQUFLLEdBQUcsRUFBQyxVQUFVLEVBQUUsRUFBQyxFQUFFLEVBQUMsRUFBQyxTQUFTLEVBQUUsTUFBTSxFQUFDLEVBQUMsRUFBQyxDQUFDO0FBRXhDLFFBQUEsc0JBQXNCLEdBQ2pDLENBQU8sTUFBTSxFQUFFLElBQUksRUFBRSxPQUFPLEVBQUUsSUFBSSxFQUFFLEVBQUU7SUFHdEMsTUFBTSxFQUFDLEVBQUUsRUFBQyxHQUFHLE9BQU8sQ0FBQztJQUVyQixNQUFNLE9BQU8sR0FBRyxNQUFNLEVBQUUsQ0FBQyxVQUFVLENBQUMsd0JBQXdCLENBQUM7U0FDMUQsU0FBUyxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxPQUFPLEVBQUUsQ0FBQztJQUVoQyxPQUFPLE9BQU8sQ0FBQztBQUVqQixDQUFDLENBQUEsQ0FBQTtBQUVZLFFBQUEsb0JBQW9CLEdBQy9CLENBQU8sTUFBTSxFQUFFLElBQUksRUFBRSxPQUFPLEVBQUUsSUFBSSxFQUFFLEVBQUU7SUFHdEMsTUFBTSxFQUFDLEVBQUUsRUFBQyxHQUFHLE9BQU8sQ0FBQztJQUVyQixNQUFNLEVBQUMsRUFBRSxFQUFDLEdBQUcsSUFBSSxDQUFDO0lBRWxCLE1BQU0sTUFBTSxHQUFHLE1BQU0sRUFBRSxDQUFDLFVBQVUsQ0FBQyx3QkFBd0IsQ0FBQyxDQUFDLFNBQVMsQ0FBQztRQUNyRSxFQUFDLE1BQU0sRUFBQyxFQUFDLEdBQUcsRUFBQyxJQUFJLGtCQUFRLENBQUMsRUFBRSxDQUFDLEVBQUMsRUFBQztRQUMvQixLQUFLO0tBQ04sQ0FBQyxDQUFDLE9BQU8sRUFBRSxDQUFDO0lBRWIsT0FBTyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFFbkIsQ0FBQyxDQUFBLENBQUE7QUFFWSxRQUFBLFNBQVMsR0FDcEIsQ0FBTyxNQUFNLEVBQUUsSUFBSSxFQUFFLE9BQU8sRUFBRSxJQUFJLEVBQUUsRUFBRTs7SUFHdEMsTUFBTSxFQUFDLEVBQUUsRUFBRSxPQUFPLEVBQUMsR0FBRyxPQUFPLENBQUM7SUFDOUIsTUFBTSxFQUFFLFNBQUcsTUFBTSwwQ0FBRSxFQUFFLENBQUM7SUFFdEIsSUFBRyxDQUFDLEVBQUUsRUFBRTtRQUNOLE9BQU8sRUFBRSxDQUFDO0tBQ1g7SUFFRCwwQkFBMEI7SUFDMUIsMERBQTBEO0lBRTFELE1BQU0sT0FBTyxHQUFJLE1BQU0sRUFBRSxDQUFDLFVBQVUsQ0FBQyx3QkFBd0IsQ0FBQyxDQUFDLFNBQVMsQ0FBQztRQUN2RSxFQUFDLE1BQU0sRUFBQyxFQUFDLEdBQUcsRUFBQyxJQUFJLGtCQUFRLENBQUMsRUFBRSxDQUFDLEVBQUMsRUFBQztRQUMvQixFQUFDLFlBQVksRUFBRTtnQkFDYixJQUFJLEVBQUUsd0JBQXdCO2dCQUM5QixTQUFTLEVBQUUsWUFBWTtnQkFDdkIsZ0JBQWdCLEVBQUUsV0FBVztnQkFDN0IsY0FBYyxFQUFFLEtBQUs7Z0JBQ3JCLEVBQUUsRUFBRSxXQUFXO2FBQ2hCLEVBQUM7UUFDRixFQUFDLE9BQU8sRUFBRTtnQkFDUixJQUFJLEVBQUUsWUFBWTtnQkFDbEIsMEJBQTBCLEVBQUUsS0FBSzthQUNsQyxFQUFDO1FBQ0YsRUFBQyxZQUFZLEVBQUUsRUFBRSxPQUFPLEVBQUUsWUFBWSxFQUFFLEVBQUM7UUFDekMsRUFBQyxVQUFVLEVBQUMsRUFBQyxVQUFVLEVBQUMsc0JBQXNCLEVBQUMsRUFBQztRQUNoRCxFQUFDLFVBQVUsRUFBQyxFQUFDLEVBQUUsRUFBQyxFQUFDLFNBQVMsRUFBQyxNQUFNLEVBQUMsRUFBQyxFQUFDO0tBQ3JDLENBQUMsQ0FBQyxPQUFPLEVBQUUsQ0FBQztJQUdiLE9BQU8sT0FBTyxDQUFDO0FBRWpCLENBQUMsQ0FBQSxDQUFBO0FBRVksUUFBQSxJQUFJLEdBQ2YsQ0FBQyxNQUFNLEVBQUUsSUFBSSxFQUFFLE9BQU8sRUFBRSxJQUFJLEVBQUUsRUFBRTtJQUVoQyxPQUFRLE1BQWMsQ0FBQyxJQUFJLEtBQUssUUFBUSxDQUFDLENBQUMsQ0FBQyw2QkFBZ0IsQ0FBQyxNQUFNLENBQUMsQ0FBQztRQUNsRSw2QkFBZ0IsQ0FBQyxLQUFLLENBQUM7QUFDM0IsQ0FBQyxDQUFBO0FBRVksUUFBQSxvQkFBb0IsR0FBaUM7SUFDaEUsTUFBTSxFQUFDLGdDQUFpQjtJQUN4QixJQUFJLEVBQUosWUFBSTtJQUNKLFNBQVMsRUFBVCxpQkFBUztDQUNWLENBQUEifQ==