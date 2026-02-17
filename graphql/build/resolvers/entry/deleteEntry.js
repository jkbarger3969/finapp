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
const permissions_1 = require("../utils/permissions");
const entryValidators_1 = require("./entryValidators");
const deleteEntry = (_, { id }, context) => __awaiter(void 0, void 0, void 0, function* () {
    return context.dataSources.accountingDb.withTransaction(() => __awaiter(void 0, void 0, void 0, function* () {
        var _a, _b, _c, _d;
        const { reqDateTime, user, dataSources: { accountingDb }, authService, ipAddress, userAgent } = context;
        // Check permission - only SUPER_ADMIN can delete transactions
        yield (0, permissions_1.checkPermission)(context, "DELETE_TRANSACTION");
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGVsZXRlRW50cnkuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvcmVzb2x2ZXJzL2VudHJ5L2RlbGV0ZUVudHJ5LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7OztBQUFBLHFDQUFtQztBQUduQyxvREFBc0U7QUFDdEUsc0RBQXVEO0FBQ3ZELHVEQUFrRDtBQUUzQyxNQUFNLFdBQVcsR0FBcUMsQ0FDM0QsQ0FBQyxFQUNELEVBQUUsRUFBRSxFQUFFLEVBQ04sT0FBTyxFQUNQLEVBQUU7SUFDRixPQUFBLE9BQU8sQ0FBQyxXQUFXLENBQUMsWUFBWSxDQUFDLGVBQWUsQ0FBQyxHQUFTLEVBQUU7O1FBQzFELE1BQU0sRUFBRSxXQUFXLEVBQUUsSUFBSSxFQUFFLFdBQVcsRUFBRSxFQUFFLFlBQVksRUFBRSxFQUFFLFdBQVcsRUFBRSxTQUFTLEVBQUUsU0FBUyxFQUFFLEdBQUcsT0FBTyxDQUFDO1FBRXhHLDhEQUE4RDtRQUM5RCxNQUFNLElBQUEsNkJBQWUsRUFBQyxPQUFPLEVBQUUsb0JBQW9CLENBQUMsQ0FBQztRQUVyRCxNQUFNLEtBQUssR0FBRyxJQUFJLGtCQUFRLENBQUMsRUFBRSxDQUFDLENBQUM7UUFFL0IsTUFBTSxNQUFNLEdBQUcsRUFBRSxHQUFHLEVBQUUsS0FBSyxFQUFXLENBQUM7UUFFdkMsOENBQThDO1FBQzlDLE1BQU0sYUFBYSxHQUFHLE1BQU0sWUFBWSxDQUFDLE9BQU8sQ0FBQztZQUMvQyxVQUFVLEVBQUUsU0FBUztZQUNyQixNQUFNO1NBQ1AsQ0FBQyxDQUFDO1FBRUgsTUFBTSxPQUFPLENBQUMsR0FBRyxDQUFDO1lBQ2hCLCtCQUFhLENBQUMsTUFBTSxDQUFDO2dCQUNuQixLQUFLO2dCQUNMLFlBQVk7YUFDYixDQUFDO1lBQ0YsWUFBWTtpQkFDVCxPQUFPLENBQUM7Z0JBQ1AsVUFBVSxFQUFFLFNBQVM7Z0JBQ3JCLE1BQU07Z0JBQ04sT0FBTyxFQUFFO29CQUNQLFVBQVUsRUFBRTt3QkFDVixPQUFPLEVBQUUsQ0FBQztxQkFDWDtpQkFDRjthQUNGLENBQUM7aUJBQ0QsSUFBSSxDQUFDLENBQUMsS0FBSyxFQUFFLEVBQUU7Z0JBQ2QsSUFBSSxDQUFDLEtBQUssRUFBRTtvQkFDVixPQUFPO2lCQUNSO2dCQUNELElBQUksS0FBSyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLEVBQUU7b0JBQzFCLE1BQU0sSUFBSSxLQUFLLENBQUMsYUFBYSxFQUFFLHVCQUF1QixDQUFDLENBQUM7aUJBQ3pEO1lBQ0gsQ0FBQyxDQUFDO1NBQ0wsQ0FBQyxDQUFDO1FBRUgsTUFBTSxVQUFVLEdBQUcsSUFBSSx1QkFBVSxDQUFDO1lBQ2hDLEVBQUUsRUFBRSxJQUFJLENBQUMsRUFBRTtZQUNYLElBQUksRUFBRSxXQUFXO1NBQ2xCLENBQUMsQ0FBQztRQUVILE1BQU0sTUFBTSxHQUFHLElBQUksZ0NBQW1CLENBQWdCO1lBQ3BELFVBQVU7WUFDVixTQUFTLEVBQUUsSUFBSTtTQUNoQixDQUFDO2FBQ0MscUJBQXFCLENBQUMsU0FBUyxFQUFFLElBQUksQ0FBQzthQUN0QyxPQUFPLEVBQUUsQ0FBQztRQUViLE1BQU0sWUFBWSxDQUFDLFNBQVMsQ0FBQztZQUMzQixVQUFVLEVBQUUsU0FBUztZQUNyQixNQUFNO1lBQ04sTUFBTTtTQUNQLENBQUMsQ0FBQztRQUVILGtCQUFrQjtRQUNsQixJQUFJLFdBQVcsRUFBRTtZQUNmLE1BQU0sV0FBVyxDQUFDLFFBQVEsQ0FBQztnQkFDekIsTUFBTSxFQUFFLElBQUksQ0FBQyxFQUFFO2dCQUNmLE1BQU0sRUFBRSxjQUFjO2dCQUN0QixZQUFZLEVBQUUsT0FBTztnQkFDckIsVUFBVSxFQUFFLEtBQUs7Z0JBQ2pCLE9BQU8sRUFBRTtvQkFDUCxXQUFXLEVBQUUsQ0FBQSxNQUFBLE1BQUEsYUFBYSxhQUFiLGFBQWEsdUJBQWIsYUFBYSxDQUFFLFdBQVcsMENBQUcsQ0FBQyxDQUFDLDBDQUFFLEtBQUssS0FBSSxJQUFJO29CQUMzRCxLQUFLLEVBQUUsQ0FBQSxNQUFBLE1BQUEsYUFBYSxhQUFiLGFBQWEsdUJBQWIsYUFBYSxDQUFFLEtBQUssMENBQUcsQ0FBQyxDQUFDLDBDQUFFLEtBQUssS0FBSSxJQUFJO2lCQUNoRDtnQkFDRCxTQUFTO2dCQUNULFNBQVM7Z0JBQ1QsU0FBUyxFQUFFLElBQUksSUFBSSxFQUFFO2FBQ3RCLENBQUMsQ0FBQztTQUNKO1FBRUQsTUFBTSxZQUFZLEdBQUcsTUFBTSxZQUFZLENBQUMsT0FBTyxDQUFDO1lBQzlDLFVBQVUsRUFBRSxTQUFTO1lBQ3JCLE1BQU07WUFDTixTQUFTLEVBQUUsSUFBSTtTQUNoQixDQUFDLENBQUM7UUFFSCxPQUFPO1lBQ0wsWUFBWTtTQUNiLENBQUM7SUFDSixDQUFDLENBQUEsQ0FBQyxDQUFBO0VBQUEsQ0FBQztBQTFGUSxRQUFBLFdBQVcsZUEwRm5CIn0=