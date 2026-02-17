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
const deleteEntry = (_, { id }, context) => __awaiter(void 0, void 0, void 0, function* () {
    return context.dataSources.accountingDb.withTransaction(() => __awaiter(void 0, void 0, void 0, function* () {
        var _a, _b, _c, _d;
        const { reqDateTime, user, dataSources: { accountingDb }, authService, ipAddress, userAgent } = context;
        if (!(user === null || user === void 0 ? void 0 : user.id)) {
            throw new Error("Unauthorized: Please log in");
        }
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGVsZXRlRW50cnkuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvcmVzb2x2ZXJzL2VudHJ5L2RlbGV0ZUVudHJ5LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7OztBQUFBLHFDQUFtQztBQUduQyxvREFBc0U7QUFDdEUsdURBQWtEO0FBRTNDLE1BQU0sV0FBVyxHQUFxQyxDQUMzRCxDQUFDLEVBQ0QsRUFBRSxFQUFFLEVBQUUsRUFDTixPQUFPLEVBQ1AsRUFBRTtJQUNGLE9BQUEsT0FBTyxDQUFDLFdBQVcsQ0FBQyxZQUFZLENBQUMsZUFBZSxDQUFDLEdBQVMsRUFBRTs7UUFDMUQsTUFBTSxFQUFFLFdBQVcsRUFBRSxJQUFJLEVBQUUsV0FBVyxFQUFFLEVBQUUsWUFBWSxFQUFFLEVBQUUsV0FBVyxFQUFFLFNBQVMsRUFBRSxTQUFTLEVBQUUsR0FBRyxPQUFPLENBQUM7UUFFeEcsSUFBSSxDQUFDLENBQUEsSUFBSSxhQUFKLElBQUksdUJBQUosSUFBSSxDQUFFLEVBQUUsQ0FBQSxFQUFFO1lBQ2IsTUFBTSxJQUFJLEtBQUssQ0FBQyw2QkFBNkIsQ0FBQyxDQUFDO1NBQ2hEO1FBRUQsTUFBTSxLQUFLLEdBQUcsSUFBSSxrQkFBUSxDQUFDLEVBQUUsQ0FBQyxDQUFDO1FBRS9CLE1BQU0sTUFBTSxHQUFHLEVBQUUsR0FBRyxFQUFFLEtBQUssRUFBVyxDQUFDO1FBRXZDLDhDQUE4QztRQUM5QyxNQUFNLGFBQWEsR0FBRyxNQUFNLFlBQVksQ0FBQyxPQUFPLENBQUM7WUFDL0MsVUFBVSxFQUFFLFNBQVM7WUFDckIsTUFBTTtTQUNQLENBQUMsQ0FBQztRQUVILE1BQU0sT0FBTyxDQUFDLEdBQUcsQ0FBQztZQUNoQiwrQkFBYSxDQUFDLE1BQU0sQ0FBQztnQkFDbkIsS0FBSztnQkFDTCxZQUFZO2FBQ2IsQ0FBQztZQUNGLFlBQVk7aUJBQ1QsT0FBTyxDQUFDO2dCQUNQLFVBQVUsRUFBRSxTQUFTO2dCQUNyQixNQUFNO2dCQUNOLE9BQU8sRUFBRTtvQkFDUCxVQUFVLEVBQUU7d0JBQ1YsT0FBTyxFQUFFLENBQUM7cUJBQ1g7aUJBQ0Y7YUFDRixDQUFDO2lCQUNELElBQUksQ0FBQyxDQUFDLEtBQUssRUFBRSxFQUFFO2dCQUNkLElBQUksQ0FBQyxLQUFLLEVBQUU7b0JBQ1YsT0FBTztpQkFDUjtnQkFDRCxJQUFJLEtBQUssQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxFQUFFO29CQUMxQixNQUFNLElBQUksS0FBSyxDQUFDLGFBQWEsRUFBRSx1QkFBdUIsQ0FBQyxDQUFDO2lCQUN6RDtZQUNILENBQUMsQ0FBQztTQUNMLENBQUMsQ0FBQztRQUVILE1BQU0sVUFBVSxHQUFHLElBQUksdUJBQVUsQ0FBQztZQUNoQyxFQUFFLEVBQUUsSUFBSSxDQUFDLEVBQUU7WUFDWCxJQUFJLEVBQUUsV0FBVztTQUNsQixDQUFDLENBQUM7UUFFSCxNQUFNLE1BQU0sR0FBRyxJQUFJLGdDQUFtQixDQUFnQjtZQUNwRCxVQUFVO1lBQ1YsU0FBUyxFQUFFLElBQUk7U0FDaEIsQ0FBQzthQUNDLHFCQUFxQixDQUFDLFNBQVMsRUFBRSxJQUFJLENBQUM7YUFDdEMsT0FBTyxFQUFFLENBQUM7UUFFYixNQUFNLFlBQVksQ0FBQyxTQUFTLENBQUM7WUFDM0IsVUFBVSxFQUFFLFNBQVM7WUFDckIsTUFBTTtZQUNOLE1BQU07U0FDUCxDQUFDLENBQUM7UUFFSCxrQkFBa0I7UUFDbEIsSUFBSSxXQUFXLEVBQUU7WUFDZixNQUFNLFdBQVcsQ0FBQyxRQUFRLENBQUM7Z0JBQ3pCLE1BQU0sRUFBRSxJQUFJLENBQUMsRUFBRTtnQkFDZixNQUFNLEVBQUUsY0FBYztnQkFDdEIsWUFBWSxFQUFFLE9BQU87Z0JBQ3JCLFVBQVUsRUFBRSxLQUFLO2dCQUNqQixPQUFPLEVBQUU7b0JBQ1AsV0FBVyxFQUFFLENBQUEsTUFBQSxNQUFBLGFBQWEsYUFBYixhQUFhLHVCQUFiLGFBQWEsQ0FBRSxXQUFXLDBDQUFHLENBQUMsQ0FBQywwQ0FBRSxLQUFLLEtBQUksSUFBSTtvQkFDM0QsS0FBSyxFQUFFLENBQUEsTUFBQSxNQUFBLGFBQWEsYUFBYixhQUFhLHVCQUFiLGFBQWEsQ0FBRSxLQUFLLDBDQUFHLENBQUMsQ0FBQywwQ0FBRSxLQUFLLEtBQUksSUFBSTtpQkFDaEQ7Z0JBQ0QsU0FBUztnQkFDVCxTQUFTO2dCQUNULFNBQVMsRUFBRSxJQUFJLElBQUksRUFBRTthQUN0QixDQUFDLENBQUM7U0FDSjtRQUVELE1BQU0sWUFBWSxHQUFHLE1BQU0sWUFBWSxDQUFDLE9BQU8sQ0FBQztZQUM5QyxVQUFVLEVBQUUsU0FBUztZQUNyQixNQUFNO1lBQ04sU0FBUyxFQUFFLElBQUk7U0FDaEIsQ0FBQyxDQUFDO1FBRUgsT0FBTztZQUNMLFlBQVk7U0FDYixDQUFDO0lBQ0osQ0FBQyxDQUFBLENBQUMsQ0FBQTtFQUFBLENBQUM7QUEzRlEsUUFBQSxXQUFXLGVBMkZuQiJ9