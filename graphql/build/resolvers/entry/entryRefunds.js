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
exports.entryRefunds = void 0;
const entries_1 = require("./entries");
const entryRefunds = (_, { where, entriesWhere }, { dataSources: { accountingDb } }) => __awaiter(void 0, void 0, void 0, function* () {
    const pipeline = [];
    const entriesCollect = accountingDb.getCollection("entries");
    if (entriesWhere) {
        const entryIds = (yield entriesCollect
            .find(yield (0, entries_1.whereEntries)(entriesWhere, accountingDb.db), {
            projection: { _id: true },
        })
            .toArray()).map(({ _id }) => _id);
        pipeline.push({
            $match: {
                _id: {
                    $in: entryIds,
                },
            },
        });
    }
    pipeline.push({ $unwind: "$refunds" });
    if (where) {
        pipeline.push({ $match: yield (0, entries_1.whereEntryRefunds)(where, accountingDb.db) });
    }
    pipeline.push({
        $replaceRoot: { newRoot: "$refunds" },
    });
    return entriesCollect.aggregate(pipeline).toArray();
});
exports.entryRefunds = entryRefunds;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZW50cnlSZWZ1bmRzLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL3Jlc29sdmVycy9lbnRyeS9lbnRyeVJlZnVuZHMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7O0FBSUEsdUNBQTREO0FBRXJELE1BQU0sWUFBWSxHQUFtQyxDQUMxRCxDQUFDLEVBQ0QsRUFBRSxLQUFLLEVBQUUsWUFBWSxFQUFFLEVBQ3ZCLEVBQUUsV0FBVyxFQUFFLEVBQUUsWUFBWSxFQUFFLEVBQUUsRUFDakMsRUFBRTtJQUNGLE1BQU0sUUFBUSxHQUFhLEVBQUUsQ0FBQztJQUU5QixNQUFNLGNBQWMsR0FBRyxZQUFZLENBQUMsYUFBYSxDQUFDLFNBQVMsQ0FBQyxDQUFDO0lBRTdELElBQUksWUFBWSxFQUFFO1FBQ2hCLE1BQU0sUUFBUSxHQUFHLENBQ2YsTUFBTSxjQUFjO2FBQ2pCLElBQUksQ0FBQyxNQUFNLElBQUEsc0JBQVksRUFBQyxZQUFZLEVBQUUsWUFBWSxDQUFDLEVBQUUsQ0FBQyxFQUFFO1lBQ3ZELFVBQVUsRUFBRSxFQUFFLEdBQUcsRUFBRSxJQUFJLEVBQUU7U0FDMUIsQ0FBQzthQUNELE9BQU8sRUFBRSxDQUNiLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRSxHQUFHLEVBQUUsRUFBRSxFQUFFLENBQUMsR0FBRyxDQUFDLENBQUM7UUFFeEIsUUFBUSxDQUFDLElBQUksQ0FBQztZQUNaLE1BQU0sRUFBRTtnQkFDTixHQUFHLEVBQUU7b0JBQ0gsR0FBRyxFQUFFLFFBQVE7aUJBQ2Q7YUFDRjtTQUNGLENBQUMsQ0FBQztLQUNKO0lBRUQsUUFBUSxDQUFDLElBQUksQ0FBQyxFQUFFLE9BQU8sRUFBRSxVQUFVLEVBQUUsQ0FBQyxDQUFDO0lBRXZDLElBQUksS0FBSyxFQUFFO1FBQ1QsUUFBUSxDQUFDLElBQUksQ0FBQyxFQUFFLE1BQU0sRUFBRSxNQUFNLElBQUEsMkJBQWlCLEVBQUMsS0FBSyxFQUFFLFlBQVksQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUM7S0FDNUU7SUFFRCxRQUFRLENBQUMsSUFBSSxDQUFDO1FBQ1osWUFBWSxFQUFFLEVBQUUsT0FBTyxFQUFFLFVBQVUsRUFBRTtLQUN0QyxDQUFDLENBQUM7SUFFSCxPQUFPLGNBQWMsQ0FBQyxTQUFTLENBQUMsUUFBUSxDQUFDLENBQUMsT0FBTyxFQUVoRCxDQUFDO0FBQ0osQ0FBQyxDQUFBLENBQUM7QUF4Q1csUUFBQSxZQUFZLGdCQXdDdkIifQ==