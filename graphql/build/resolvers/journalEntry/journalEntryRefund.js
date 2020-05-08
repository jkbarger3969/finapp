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
const utils_1 = require("./utils");
const addFields = {
    $addFields: {
        refunds: utils_1.stages.entryAddFields.$addFields.refunds,
    },
};
const transmutateFields = {
    $addFields: {
        refunds: utils_1.stages.entryTransmutations.$addFields.refunds,
    },
};
const journalEntryRefund = (obj, args, context, info) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = args;
    const { db } = context;
    const refundId = new mongodb_1.ObjectID(id);
    const [refundEntry] = yield db
        .collection("journalEntries")
        .aggregate([
        { $match: { "refunds.id": refundId } },
        { $limit: 1 },
        {
            $project: {
                refunds: {
                    $filter: {
                        input: "$refunds",
                        as: "refund",
                        cond: { $eq: ["$$refund.id", refundId] },
                    },
                },
            },
        },
        addFields,
        transmutateFields,
        { $unwind: "$refunds" },
        { $replaceRoot: { newRoot: "$refunds" } },
    ])
        .toArray();
    return refundEntry;
});
exports.default = journalEntryRefund;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiam91cm5hbEVudHJ5UmVmdW5kLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL3Jlc29sdmVycy9qb3VybmFsRW50cnkvam91cm5hbEVudHJ5UmVmdW5kLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7O0FBQUEscUNBQW1DO0FBR25DLG1DQUFpQztBQUVqQyxNQUFNLFNBQVMsR0FBRztJQUNoQixVQUFVLEVBQUU7UUFDVixPQUFPLEVBQUUsY0FBTSxDQUFDLGNBQWMsQ0FBQyxVQUFVLENBQUMsT0FBTztLQUNsRDtDQUNPLENBQUM7QUFDWCxNQUFNLGlCQUFpQixHQUFHO0lBQ3hCLFVBQVUsRUFBRTtRQUNWLE9BQU8sRUFBRSxjQUFNLENBQUMsbUJBQW1CLENBQUMsVUFBVSxDQUFDLE9BQU87S0FDdkQ7Q0FDTyxDQUFDO0FBRVgsTUFBTSxrQkFBa0IsR0FBeUMsQ0FDL0QsR0FBRyxFQUNILElBQUksRUFDSixPQUFPLEVBQ1AsSUFBSSxFQUNKLEVBQUU7SUFDRixNQUFNLEVBQUUsRUFBRSxFQUFFLEdBQUcsSUFBSSxDQUFDO0lBRXBCLE1BQU0sRUFBRSxFQUFFLEVBQUUsR0FBRyxPQUFPLENBQUM7SUFFdkIsTUFBTSxRQUFRLEdBQUcsSUFBSSxrQkFBUSxDQUFDLEVBQUUsQ0FBQyxDQUFDO0lBRWxDLE1BQU0sQ0FBQyxXQUFXLENBQUMsR0FBRyxNQUFNLEVBQUU7U0FDM0IsVUFBVSxDQUFDLGdCQUFnQixDQUFDO1NBQzVCLFNBQVMsQ0FBQztRQUNULEVBQUUsTUFBTSxFQUFFLEVBQUUsWUFBWSxFQUFFLFFBQVEsRUFBRSxFQUFFO1FBQ3RDLEVBQUUsTUFBTSxFQUFFLENBQUMsRUFBRTtRQUNiO1lBQ0UsUUFBUSxFQUFFO2dCQUNSLE9BQU8sRUFBRTtvQkFDUCxPQUFPLEVBQUU7d0JBQ1AsS0FBSyxFQUFFLFVBQVU7d0JBQ2pCLEVBQUUsRUFBRSxRQUFRO3dCQUNaLElBQUksRUFBRSxFQUFFLEdBQUcsRUFBRSxDQUFDLGFBQWEsRUFBRSxRQUFRLENBQUMsRUFBRTtxQkFDekM7aUJBQ0Y7YUFDRjtTQUNGO1FBQ0QsU0FBUztRQUNULGlCQUFpQjtRQUNqQixFQUFFLE9BQU8sRUFBRSxVQUFVLEVBQUU7UUFDdkIsRUFBRSxZQUFZLEVBQUUsRUFBRSxPQUFPLEVBQUUsVUFBVSxFQUFFLEVBQUU7S0FDMUMsQ0FBQztTQUNELE9BQU8sRUFBRSxDQUFDO0lBRWIsT0FBTyxXQUFXLENBQUM7QUFDckIsQ0FBQyxDQUFBLENBQUM7QUFFRixrQkFBZSxrQkFBa0IsQ0FBQyJ9