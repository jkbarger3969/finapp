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
exports.deleteEntry = void 0;
const mongodb_1 = require("mongodb");
const DocHistory_1 = require("../utils/DocHistory");
const entryValidators_1 = require("./entryValidators");
const deleteEntry = (_, { id }, { reqDateTime, user, dataSources: { accountingDb } }) => __awaiter(void 0, void 0, void 0, function* () {
    return accountingDb.withTransaction(() => __awaiter(void 0, void 0, void 0, function* () {
        const entry = new mongodb_1.ObjectId(id);
        const filter = { _id: entry };
        yield Promise.all([
            entryValidators_1.validateEntry.exists({
                entry,
                accountingDb,
            }),
            accountingDb
                .findOne({
                collection: "entries",
                filter,
                options: {
                    projection: {
                        deleted: 1,
                    },
                },
            })
                .then((entry) => {
                if (!entry) {
                    return;
                }
                if (entry.deleted[0].value) {
                    throw new Error(`Entry id "${id}" is already deleted.`);
                }
            }),
        ]);
        const docHistory = new DocHistory_1.DocHistory({
            by: user.id,
            date: reqDateTime,
        });
        const update = new DocHistory_1.UpdateHistoricalDoc({
            docHistory,
            isRootDoc: true,
        })
            .updateHistoricalField("deleted", true)
            .valueOf();
        yield accountingDb.updateOne({
            collection: "entries",
            filter,
            update,
        });
        const deletedEntry = yield accountingDb.findOne({
            collection: "entries",
            filter,
            skipCache: true,
        });
        return {
            deletedEntry,
        };
    }));
});
exports.deleteEntry = deleteEntry;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGVsZXRlRW50cnkuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvcmVzb2x2ZXJzL2VudHJ5L2RlbGV0ZUVudHJ5LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7OztBQUFBLHFDQUFtQztBQUduQyxvREFBc0U7QUFDdEUsdURBQWtEO0FBRTNDLE1BQU0sV0FBVyxHQUFxQyxDQUMzRCxDQUFDLEVBQ0QsRUFBRSxFQUFFLEVBQUUsRUFDTixFQUFFLFdBQVcsRUFBRSxJQUFJLEVBQUUsV0FBVyxFQUFFLEVBQUUsWUFBWSxFQUFFLEVBQUUsRUFDcEQsRUFBRTtJQUNGLE9BQUEsWUFBWSxDQUFDLGVBQWUsQ0FBQyxHQUFTLEVBQUU7UUFDdEMsTUFBTSxLQUFLLEdBQUcsSUFBSSxrQkFBUSxDQUFDLEVBQUUsQ0FBQyxDQUFDO1FBRS9CLE1BQU0sTUFBTSxHQUFHLEVBQUUsR0FBRyxFQUFFLEtBQUssRUFBVyxDQUFDO1FBRXZDLE1BQU0sT0FBTyxDQUFDLEdBQUcsQ0FBQztZQUNoQiwrQkFBYSxDQUFDLE1BQU0sQ0FBQztnQkFDbkIsS0FBSztnQkFDTCxZQUFZO2FBQ2IsQ0FBQztZQUNGLFlBQVk7aUJBQ1QsT0FBTyxDQUFDO2dCQUNQLFVBQVUsRUFBRSxTQUFTO2dCQUNyQixNQUFNO2dCQUNOLE9BQU8sRUFBRTtvQkFDUCxVQUFVLEVBQUU7d0JBQ1YsT0FBTyxFQUFFLENBQUM7cUJBQ1g7aUJBQ0Y7YUFDRixDQUFDO2lCQUNELElBQUksQ0FBQyxDQUFDLEtBQUssRUFBRSxFQUFFO2dCQUNkLElBQUksQ0FBQyxLQUFLLEVBQUU7b0JBQ1YsT0FBTztpQkFDUjtnQkFDRCxJQUFJLEtBQUssQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxFQUFFO29CQUMxQixNQUFNLElBQUksS0FBSyxDQUFDLGFBQWEsRUFBRSx1QkFBdUIsQ0FBQyxDQUFDO2lCQUN6RDtZQUNILENBQUMsQ0FBQztTQUNMLENBQUMsQ0FBQztRQUVILE1BQU0sVUFBVSxHQUFHLElBQUksdUJBQVUsQ0FBQztZQUNoQyxFQUFFLEVBQUUsSUFBSSxDQUFDLEVBQUU7WUFDWCxJQUFJLEVBQUUsV0FBVztTQUNsQixDQUFDLENBQUM7UUFFSCxNQUFNLE1BQU0sR0FBRyxJQUFJLGdDQUFtQixDQUFnQjtZQUNwRCxVQUFVO1lBQ1YsU0FBUyxFQUFFLElBQUk7U0FDaEIsQ0FBQzthQUNDLHFCQUFxQixDQUFDLFNBQVMsRUFBRSxJQUFJLENBQUM7YUFDdEMsT0FBTyxFQUFFLENBQUM7UUFFYixNQUFNLFlBQVksQ0FBQyxTQUFTLENBQUM7WUFDM0IsVUFBVSxFQUFFLFNBQVM7WUFDckIsTUFBTTtZQUNOLE1BQU07U0FDUCxDQUFDLENBQUM7UUFFSCxNQUFNLFlBQVksR0FBRyxNQUFNLFlBQVksQ0FBQyxPQUFPLENBQUM7WUFDOUMsVUFBVSxFQUFFLFNBQVM7WUFDckIsTUFBTTtZQUNOLFNBQVMsRUFBRSxJQUFJO1NBQ2hCLENBQUMsQ0FBQztRQUVILE9BQU87WUFDTCxZQUFZO1NBQ2IsQ0FBQztJQUNKLENBQUMsQ0FBQSxDQUFDLENBQUE7RUFBQSxDQUFDO0FBOURRLFFBQUEsV0FBVyxlQThEbkIifQ==