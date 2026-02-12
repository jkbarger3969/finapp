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
const deleteEntry = (_, { id }, { reqDateTime, user, dataSources: { accountingDb }, authService, ipAddress, userAgent }) => __awaiter(void 0, void 0, void 0, function* () {
    return accountingDb.withTransaction(() => __awaiter(void 0, void 0, void 0, function* () {
        var _a, _b, _c, _d;
        const entry = new mongodb_1.ObjectId(id);
        const filter = { _id: entry };
        // Get entry details before deletion for audit
        const existingEntry = yield accountingDb.findOne({
            collection: "entries",
            filter,
        });
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
        // Log audit entry
        if (authService) {
            yield authService.logAudit({
                userId: user.id,
                action: "ENTRY_DELETE",
                resourceType: "Entry",
                resourceId: entry,
                details: {
                    description: ((_b = (_a = existingEntry === null || existingEntry === void 0 ? void 0 : existingEntry.description) === null || _a === void 0 ? void 0 : _a[0]) === null || _b === void 0 ? void 0 : _b.value) || null,
                    total: ((_d = (_c = existingEntry === null || existingEntry === void 0 ? void 0 : existingEntry.total) === null || _c === void 0 ? void 0 : _c[0]) === null || _d === void 0 ? void 0 : _d.value) || null,
                },
                ipAddress,
                userAgent,
                timestamp: new Date(),
            });
        }
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGVsZXRlRW50cnkuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvcmVzb2x2ZXJzL2VudHJ5L2RlbGV0ZUVudHJ5LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7OztBQUFBLHFDQUFtQztBQUduQyxvREFBc0U7QUFDdEUsdURBQWtEO0FBRTNDLE1BQU0sV0FBVyxHQUFxQyxDQUMzRCxDQUFDLEVBQ0QsRUFBRSxFQUFFLEVBQUUsRUFDTixFQUFFLFdBQVcsRUFBRSxJQUFJLEVBQUUsV0FBVyxFQUFFLEVBQUUsWUFBWSxFQUFFLEVBQUUsV0FBVyxFQUFFLFNBQVMsRUFBRSxTQUFTLEVBQUUsRUFDdkYsRUFBRTtJQUNGLE9BQUEsWUFBWSxDQUFDLGVBQWUsQ0FBQyxHQUFTLEVBQUU7O1FBQ3RDLE1BQU0sS0FBSyxHQUFHLElBQUksa0JBQVEsQ0FBQyxFQUFFLENBQUMsQ0FBQztRQUUvQixNQUFNLE1BQU0sR0FBRyxFQUFFLEdBQUcsRUFBRSxLQUFLLEVBQVcsQ0FBQztRQUV2Qyw4Q0FBOEM7UUFDOUMsTUFBTSxhQUFhLEdBQUcsTUFBTSxZQUFZLENBQUMsT0FBTyxDQUFDO1lBQy9DLFVBQVUsRUFBRSxTQUFTO1lBQ3JCLE1BQU07U0FDUCxDQUFDLENBQUM7UUFFSCxNQUFNLE9BQU8sQ0FBQyxHQUFHLENBQUM7WUFDaEIsK0JBQWEsQ0FBQyxNQUFNLENBQUM7Z0JBQ25CLEtBQUs7Z0JBQ0wsWUFBWTthQUNiLENBQUM7WUFDRixZQUFZO2lCQUNULE9BQU8sQ0FBQztnQkFDUCxVQUFVLEVBQUUsU0FBUztnQkFDckIsTUFBTTtnQkFDTixPQUFPLEVBQUU7b0JBQ1AsVUFBVSxFQUFFO3dCQUNWLE9BQU8sRUFBRSxDQUFDO3FCQUNYO2lCQUNGO2FBQ0YsQ0FBQztpQkFDRCxJQUFJLENBQUMsQ0FBQyxLQUFLLEVBQUUsRUFBRTtnQkFDZCxJQUFJLENBQUMsS0FBSyxFQUFFO29CQUNWLE9BQU87aUJBQ1I7Z0JBQ0QsSUFBSSxLQUFLLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssRUFBRTtvQkFDMUIsTUFBTSxJQUFJLEtBQUssQ0FBQyxhQUFhLEVBQUUsdUJBQXVCLENBQUMsQ0FBQztpQkFDekQ7WUFDSCxDQUFDLENBQUM7U0FDTCxDQUFDLENBQUM7UUFFSCxNQUFNLFVBQVUsR0FBRyxJQUFJLHVCQUFVLENBQUM7WUFDaEMsRUFBRSxFQUFFLElBQUksQ0FBQyxFQUFFO1lBQ1gsSUFBSSxFQUFFLFdBQVc7U0FDbEIsQ0FBQyxDQUFDO1FBRUgsTUFBTSxNQUFNLEdBQUcsSUFBSSxnQ0FBbUIsQ0FBZ0I7WUFDcEQsVUFBVTtZQUNWLFNBQVMsRUFBRSxJQUFJO1NBQ2hCLENBQUM7YUFDQyxxQkFBcUIsQ0FBQyxTQUFTLEVBQUUsSUFBSSxDQUFDO2FBQ3RDLE9BQU8sRUFBRSxDQUFDO1FBRWIsTUFBTSxZQUFZLENBQUMsU0FBUyxDQUFDO1lBQzNCLFVBQVUsRUFBRSxTQUFTO1lBQ3JCLE1BQU07WUFDTixNQUFNO1NBQ1AsQ0FBQyxDQUFDO1FBRUgsa0JBQWtCO1FBQ2xCLElBQUksV0FBVyxFQUFFO1lBQ2YsTUFBTSxXQUFXLENBQUMsUUFBUSxDQUFDO2dCQUN6QixNQUFNLEVBQUUsSUFBSSxDQUFDLEVBQUU7Z0JBQ2YsTUFBTSxFQUFFLGNBQWM7Z0JBQ3RCLFlBQVksRUFBRSxPQUFPO2dCQUNyQixVQUFVLEVBQUUsS0FBSztnQkFDakIsT0FBTyxFQUFFO29CQUNQLFdBQVcsRUFBRSxDQUFBLE1BQUEsTUFBQSxhQUFhLGFBQWIsYUFBYSx1QkFBYixhQUFhLENBQUUsV0FBVywwQ0FBRyxDQUFDLENBQUMsMENBQUUsS0FBSyxLQUFJLElBQUk7b0JBQzNELEtBQUssRUFBRSxDQUFBLE1BQUEsTUFBQSxhQUFhLGFBQWIsYUFBYSx1QkFBYixhQUFhLENBQUUsS0FBSywwQ0FBRyxDQUFDLENBQUMsMENBQUUsS0FBSyxLQUFJLElBQUk7aUJBQ2hEO2dCQUNELFNBQVM7Z0JBQ1QsU0FBUztnQkFDVCxTQUFTLEVBQUUsSUFBSSxJQUFJLEVBQUU7YUFDdEIsQ0FBQyxDQUFDO1NBQ0o7UUFFRCxNQUFNLFlBQVksR0FBRyxNQUFNLFlBQVksQ0FBQyxPQUFPLENBQUM7WUFDOUMsVUFBVSxFQUFFLFNBQVM7WUFDckIsTUFBTTtZQUNOLFNBQVMsRUFBRSxJQUFJO1NBQ2hCLENBQUMsQ0FBQztRQUVILE9BQU87WUFDTCxZQUFZO1NBQ2IsQ0FBQztJQUNKLENBQUMsQ0FBQSxDQUFDLENBQUE7RUFBQSxDQUFDO0FBckZRLFFBQUEsV0FBVyxlQXFGbkIifQ==