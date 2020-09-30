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
        items: utils_1.stages.entryAddFields.$addFields.items,
    },
};
const transmutateFields = {
    $addFields: {
        items: utils_1.stages.entryTransmutations.$addFields.items,
    },
};
const journalEntryItem = (obj, args, context, info) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = args;
    const { db } = context;
    const itemId = new mongodb_1.ObjectId(id);
    const [itemEntry] = yield db
        .collection("journalEntries")
        .aggregate([
        { $match: { "items.id": itemId } },
        { $limit: 1 },
        {
            $project: {
                items: {
                    $filter: {
                        input: "$items",
                        as: "item",
                        cond: { $eq: ["$$item.id", itemId] },
                    },
                },
            },
        },
        addFields,
        transmutateFields,
        { $unwind: "$items" },
        { $replaceRoot: { newRoot: "$items" } },
    ])
        .toArray();
    return itemEntry;
});
exports.default = journalEntryItem;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiam91cm5hbEVudHJ5SXRlbS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9yZXNvbHZlcnMvam91cm5hbEVudHJ5L2pvdXJuYWxFbnRyeUl0ZW0udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7QUFBQSxxQ0FBbUM7QUFHbkMsbUNBQWlDO0FBRWpDLE1BQU0sU0FBUyxHQUFHO0lBQ2hCLFVBQVUsRUFBRTtRQUNWLEtBQUssRUFBRSxjQUFNLENBQUMsY0FBYyxDQUFDLFVBQVUsQ0FBQyxLQUFLO0tBQzlDO0NBQ08sQ0FBQztBQUNYLE1BQU0saUJBQWlCLEdBQUc7SUFDeEIsVUFBVSxFQUFFO1FBQ1YsS0FBSyxFQUFFLGNBQU0sQ0FBQyxtQkFBbUIsQ0FBQyxVQUFVLENBQUMsS0FBSztLQUNuRDtDQUNPLENBQUM7QUFFWCxNQUFNLGdCQUFnQixHQUF1QyxDQUMzRCxHQUFHLEVBQ0gsSUFBSSxFQUNKLE9BQU8sRUFDUCxJQUFJLEVBQ0osRUFBRTtJQUNGLE1BQU0sRUFBRSxFQUFFLEVBQUUsR0FBRyxJQUFJLENBQUM7SUFFcEIsTUFBTSxFQUFFLEVBQUUsRUFBRSxHQUFHLE9BQU8sQ0FBQztJQUV2QixNQUFNLE1BQU0sR0FBRyxJQUFJLGtCQUFRLENBQUMsRUFBRSxDQUFDLENBQUM7SUFFaEMsTUFBTSxDQUFDLFNBQVMsQ0FBQyxHQUFHLE1BQU0sRUFBRTtTQUN6QixVQUFVLENBQUMsZ0JBQWdCLENBQUM7U0FDNUIsU0FBUyxDQUFDO1FBQ1QsRUFBRSxNQUFNLEVBQUUsRUFBRSxVQUFVLEVBQUUsTUFBTSxFQUFFLEVBQUU7UUFDbEMsRUFBRSxNQUFNLEVBQUUsQ0FBQyxFQUFFO1FBQ2I7WUFDRSxRQUFRLEVBQUU7Z0JBQ1IsS0FBSyxFQUFFO29CQUNMLE9BQU8sRUFBRTt3QkFDUCxLQUFLLEVBQUUsUUFBUTt3QkFDZixFQUFFLEVBQUUsTUFBTTt3QkFDVixJQUFJLEVBQUUsRUFBRSxHQUFHLEVBQUUsQ0FBQyxXQUFXLEVBQUUsTUFBTSxDQUFDLEVBQUU7cUJBQ3JDO2lCQUNGO2FBQ0Y7U0FDRjtRQUNELFNBQVM7UUFDVCxpQkFBaUI7UUFDakIsRUFBRSxPQUFPLEVBQUUsUUFBUSxFQUFFO1FBQ3JCLEVBQUUsWUFBWSxFQUFFLEVBQUUsT0FBTyxFQUFFLFFBQVEsRUFBRSxFQUFFO0tBQ3hDLENBQUM7U0FDRCxPQUFPLEVBQUUsQ0FBQztJQUViLE9BQU8sU0FBUyxDQUFDO0FBQ25CLENBQUMsQ0FBQSxDQUFDO0FBRUYsa0JBQWUsZ0JBQWdCLENBQUMifQ==