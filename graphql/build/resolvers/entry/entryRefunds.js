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
const departmentAccess_1 = require("../utils/departmentAccess");
const entries_1 = require("./entries");
const entryRefunds = (_, { where, entriesWhere }, context) => __awaiter(void 0, void 0, void 0, function* () {
    const { dataSources: { accountingDb }, authService, user } = context;
    const pipeline = [];
    const entriesCollect = accountingDb.getCollection("entries");
    const permittedDeptIds = yield (0, departmentAccess_1.getAccessibleDeptIdsWithDescendants)({
        authService,
        userId: user === null || user === void 0 ? void 0 : user.id,
        db: accountingDb.db,
    });
    if (permittedDeptIds) {
        if (permittedDeptIds.length === 0) {
            return [];
        }
        pipeline.push({
            $match: {
                "department.0.value": { $in: permittedDeptIds },
            },
        });
    }
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZW50cnlSZWZ1bmRzLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL3Jlc29sdmVycy9lbnRyeS9lbnRyeVJlZnVuZHMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7O0FBS0EsZ0VBQWdGO0FBQ2hGLHVDQUE0RDtBQUVyRCxNQUFNLFlBQVksR0FBbUMsQ0FDMUQsQ0FBQyxFQUNELEVBQUUsS0FBSyxFQUFFLFlBQVksRUFBRSxFQUN2QixPQUFPLEVBQ1AsRUFBRTtJQUNGLE1BQU0sRUFBRSxXQUFXLEVBQUUsRUFBRSxZQUFZLEVBQUUsRUFBRSxXQUFXLEVBQUUsSUFBSSxFQUFFLEdBQUcsT0FBa0IsQ0FBQztJQUVoRixNQUFNLFFBQVEsR0FBYSxFQUFFLENBQUM7SUFFOUIsTUFBTSxjQUFjLEdBQUcsWUFBWSxDQUFDLGFBQWEsQ0FBQyxTQUFTLENBQUMsQ0FBQztJQUU3RCxNQUFNLGdCQUFnQixHQUFHLE1BQU0sSUFBQSxzREFBbUMsRUFBQztRQUNqRSxXQUFXO1FBQ1gsTUFBTSxFQUFFLElBQUksYUFBSixJQUFJLHVCQUFKLElBQUksQ0FBRSxFQUFFO1FBQ2hCLEVBQUUsRUFBRSxZQUFZLENBQUMsRUFBRTtLQUNwQixDQUFDLENBQUM7SUFFSCxJQUFJLGdCQUFnQixFQUFFO1FBQ3BCLElBQUksZ0JBQWdCLENBQUMsTUFBTSxLQUFLLENBQUMsRUFBRTtZQUNqQyxPQUFPLEVBQUUsQ0FBQztTQUNYO1FBRUQsUUFBUSxDQUFDLElBQUksQ0FBQztZQUNaLE1BQU0sRUFBRTtnQkFDTixvQkFBb0IsRUFBRSxFQUFFLEdBQUcsRUFBRSxnQkFBZ0IsRUFBRTthQUNoRDtTQUNGLENBQUMsQ0FBQztLQUNKO0lBRUQsSUFBSSxZQUFZLEVBQUU7UUFDaEIsTUFBTSxRQUFRLEdBQUcsQ0FDZixNQUFNLGNBQWM7YUFDakIsSUFBSSxDQUFDLE1BQU0sSUFBQSxzQkFBWSxFQUFDLFlBQVksRUFBRSxZQUFZLENBQUMsRUFBRSxDQUFDLEVBQUU7WUFDdkQsVUFBVSxFQUFFLEVBQUUsR0FBRyxFQUFFLElBQUksRUFBRTtTQUMxQixDQUFDO2FBQ0QsT0FBTyxFQUFFLENBQ2IsQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFFLEdBQUcsRUFBRSxFQUFFLEVBQUUsQ0FBQyxHQUFHLENBQUMsQ0FBQztRQUV4QixRQUFRLENBQUMsSUFBSSxDQUFDO1lBQ1osTUFBTSxFQUFFO2dCQUNOLEdBQUcsRUFBRTtvQkFDSCxHQUFHLEVBQUUsUUFBUTtpQkFDZDthQUNGO1NBQ0YsQ0FBQyxDQUFDO0tBQ0o7SUFFRCxRQUFRLENBQUMsSUFBSSxDQUFDLEVBQUUsT0FBTyxFQUFFLFVBQVUsRUFBRSxDQUFDLENBQUM7SUFFdkMsSUFBSSxLQUFLLEVBQUU7UUFDVCxRQUFRLENBQUMsSUFBSSxDQUFDLEVBQUUsTUFBTSxFQUFFLE1BQU0sSUFBQSwyQkFBaUIsRUFBQyxLQUFLLEVBQUUsWUFBWSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQztLQUM1RTtJQUVELFFBQVEsQ0FBQyxJQUFJLENBQUM7UUFDWixZQUFZLEVBQUUsRUFBRSxPQUFPLEVBQUUsVUFBVSxFQUFFO0tBQ3RDLENBQUMsQ0FBQztJQUVILE9BQU8sY0FBYyxDQUFDLFNBQVMsQ0FBQyxRQUFRLENBQUMsQ0FBQyxPQUFPLEVBRWhELENBQUM7QUFDSixDQUFDLENBQUEsQ0FBQztBQTVEVyxRQUFBLFlBQVksZ0JBNER2QiJ9