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
exports.updateEntry = void 0;
const mongodb_1 = require("mongodb");
const mongoRational_1 = require("../../utils/mongoRational");
const paymentMethod_1 = require("../paymentMethod");
const DocHistory_1 = require("../utils/DocHistory");
const permissions_1 = require("../utils/permissions");
const entryValidators_1 = require("./entryValidators");
const upsertEntrySource_1 = require("./upsertEntrySource");
const NULLISH = Symbol();
const updateEntry = (_, { input }, context) => __awaiter(void 0, void 0, void 0, function* () {
    return context.dataSources.accountingDb.withTransaction(() => __awaiter(void 0, void 0, void 0, function* () {
        const { reqDateTime, user, dataSources: { accountingDb }, authService, ipAddress, userAgent } = context;
        // Check permission - only SUPER_ADMIN can edit transactions
        yield (0, permissions_1.checkPermission)(context, "EDIT_TRANSACTION");
        yield entryValidators_1.validateEntry.updateEntry({
            updateEntry: input,
            reqDateTime,
            accountingDb,
        });
        const { id, date, dateOfRecord, department: departmentInput, category: categoryInput, paymentMethod: paymentMethodInput, description: descriptionInput, total, source: sourceInput, reconciled, } = input;
        const entryId = new mongodb_1.ObjectId(id);
        // Get existing entry for audit comparison
        const existingEntry = yield accountingDb.findOne({
            collection: "entries",
            filter: { _id: entryId },
        });
        const docHistory = new DocHistory_1.DocHistory({ by: user.id, date: reqDateTime });
        const updateBuilder = new DocHistory_1.UpdateHistoricalDoc({
            docHistory,
            isRootDoc: true,
        });
        const changedFields = [];
        if (date) {
            updateBuilder.updateHistoricalField("date", date);
            changedFields.push("date");
        }
        const dateOfRecordUpdateBuilder = new DocHistory_1.UpdateHistoricalDoc({
            docHistory,
            isRootDoc: false,
            fieldPrefix: "dateOfRecord",
        });
        if (dateOfRecord === null || dateOfRecord === void 0 ? void 0 : dateOfRecord.clear) {
            dateOfRecordUpdateBuilder
                .updateHistoricalField("date", null)
                .updateHistoricalField("overrideFiscalYear", null);
            changedFields.push("dateOfRecord");
        }
        else if (dateOfRecord) {
            const { date, overrideFiscalYear } = dateOfRecord;
            if (dateOfRecord.date) {
                dateOfRecordUpdateBuilder.updateHistoricalField("date", date);
                changedFields.push("dateOfRecord.date");
            }
            if ((overrideFiscalYear !== null && overrideFiscalYear !== void 0 ? overrideFiscalYear : NULLISH) !== NULLISH) {
                dateOfRecordUpdateBuilder.updateHistoricalField("overrideFiscalYear", overrideFiscalYear);
                changedFields.push("dateOfRecord.overrideFiscalYear");
            }
        }
        if (departmentInput) {
            const department = new mongodb_1.ObjectId(departmentInput);
            updateBuilder.updateHistoricalField("department", department);
            changedFields.push("department");
        }
        const category = categoryInput ? new mongodb_1.ObjectId(categoryInput) : null;
        if (category) {
            updateBuilder.updateHistoricalField("category", category);
            changedFields.push("category");
        }
        const paymentMethod = paymentMethodInput
            ? (0, paymentMethod_1.upsertPaymentMethodToDbRecord)({
                upsertPaymentMethod: paymentMethodInput,
            })
            : null;
        if (paymentMethod) {
            updateBuilder.updateHistoricalField("paymentMethod", paymentMethod);
            changedFields.push("paymentMethod");
        }
        const description = descriptionInput === null || descriptionInput === void 0 ? void 0 : descriptionInput.trim();
        if (description) {
            updateBuilder.updateHistoricalField("description", description);
            changedFields.push("description");
        }
        if (total) {
            updateBuilder.updateHistoricalField("total", (0, mongoRational_1.fractionToRational)(total));
            changedFields.push("total");
        }
        if (sourceInput) {
            const source = yield (0, upsertEntrySource_1.upsertEntrySourceToEntityDbRecord)({
                upsertEntrySourceInput: sourceInput,
                accountingDb,
            });
            updateBuilder.updateHistoricalField("source", source);
            changedFields.push("source");
        }
        if ((reconciled !== null && reconciled !== void 0 ? reconciled : NULLISH) !== NULLISH) {
            updateBuilder.updateHistoricalField("reconciled", reconciled);
            changedFields.push("reconciled");
        }
        const entryUpdate = updateBuilder.valueOf();
        const dateOfRecordUpdate = dateOfRecordUpdateBuilder.valueOf();
        const update = {};
        if ((entryUpdate === null || entryUpdate === void 0 ? void 0 : entryUpdate.$set) || (dateOfRecordUpdate === null || dateOfRecordUpdate === void 0 ? void 0 : dateOfRecordUpdate.$set)) {
            update.$set = Object.assign(Object.assign({}, entryUpdate === null || entryUpdate === void 0 ? void 0 : entryUpdate.$set), dateOfRecordUpdate === null || dateOfRecordUpdate === void 0 ? void 0 : dateOfRecordUpdate.$set);
        }
        if ((entryUpdate === null || entryUpdate === void 0 ? void 0 : entryUpdate.$push) || (dateOfRecordUpdate === null || dateOfRecordUpdate === void 0 ? void 0 : dateOfRecordUpdate.$push)) {
            update.$push = Object.assign(Object.assign({}, entryUpdate === null || entryUpdate === void 0 ? void 0 : entryUpdate.$push), dateOfRecordUpdate === null || dateOfRecordUpdate === void 0 ? void 0 : dateOfRecordUpdate.$push);
        }
        yield accountingDb.updateOne({
            collection: "entries",
            filter: { _id: entryId },
            update,
        });
        // Log audit entry
        if (authService && changedFields.length > 0) {
            yield authService.logAudit({
                userId: user.id,
                action: "ENTRY_UPDATE",
                resourceType: "Entry",
                resourceId: entryId,
                details: {
                    changedFields,
                    changes: input,
                },
                ipAddress,
                userAgent,
                timestamp: new Date(),
            });
        }
        return {
            updatedEntry: yield accountingDb.findOne({
                collection: "entries",
                filter: {
                    _id: entryId,
                },
                skipCache: true,
            }),
        };
    }));
});
exports.updateEntry = updateEntry;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXBkYXRlRW50cnkuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvcmVzb2x2ZXJzL2VudHJ5L3VwZGF0ZUVudHJ5LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7OztBQUNBLHFDQUFtQztBQUluQyw2REFBK0Q7QUFDL0Qsb0RBQWlFO0FBQ2pFLG9EQUFzRTtBQUN0RSxzREFBdUQ7QUFDdkQsdURBQWtEO0FBQ2xELDJEQUF3RTtBQUV4RSxNQUFNLE9BQU8sR0FBRyxNQUFNLEVBQUUsQ0FBQztBQUVsQixNQUFNLFdBQVcsR0FBcUMsQ0FDM0QsQ0FBQyxFQUNELEVBQUUsS0FBSyxFQUFFLEVBQ1QsT0FBTyxFQUNQLEVBQUU7SUFDRixPQUFBLE9BQU8sQ0FBQyxXQUFXLENBQUMsWUFBWSxDQUFDLGVBQWUsQ0FBQyxHQUFTLEVBQUU7UUFDMUQsTUFBTSxFQUFFLFdBQVcsRUFBRSxJQUFJLEVBQUUsV0FBVyxFQUFFLEVBQUUsWUFBWSxFQUFFLEVBQUUsV0FBVyxFQUFFLFNBQVMsRUFBRSxTQUFTLEVBQUUsR0FBRyxPQUFPLENBQUM7UUFFeEcsNERBQTREO1FBQzVELE1BQU0sSUFBQSw2QkFBZSxFQUFDLE9BQU8sRUFBRSxrQkFBa0IsQ0FBQyxDQUFDO1FBRW5ELE1BQU0sK0JBQWEsQ0FBQyxXQUFXLENBQUM7WUFDOUIsV0FBVyxFQUFFLEtBQUs7WUFDbEIsV0FBVztZQUNYLFlBQVk7U0FDYixDQUFDLENBQUM7UUFFSCxNQUFNLEVBQ0osRUFBRSxFQUNGLElBQUksRUFDSixZQUFZLEVBQ1osVUFBVSxFQUFFLGVBQWUsRUFDM0IsUUFBUSxFQUFFLGFBQWEsRUFDdkIsYUFBYSxFQUFFLGtCQUFrQixFQUNqQyxXQUFXLEVBQUUsZ0JBQWdCLEVBQzdCLEtBQUssRUFDTCxNQUFNLEVBQUUsV0FBVyxFQUNuQixVQUFVLEdBQ1gsR0FBRyxLQUFLLENBQUM7UUFFVixNQUFNLE9BQU8sR0FBRyxJQUFJLGtCQUFRLENBQUMsRUFB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