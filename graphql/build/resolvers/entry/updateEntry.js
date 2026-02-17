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
const entryValidators_1 = require("./entryValidators");
const upsertEntrySource_1 = require("./upsertEntrySource");
const NULLISH = Symbol();
const updateEntry = (_, { input }, context) => __awaiter(void 0, void 0, void 0, function* () {
    return context.dataSources.accountingDb.withTransaction(() => __awaiter(void 0, void 0, void 0, function* () {
        const { reqDateTime, user, dataSources: { accountingDb }, authService, ipAddress, userAgent } = context;
        if (!(user === null || user === void 0 ? void 0 : user.id)) {
            throw new Error("Unauthorized: Please log in");
        }
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXBkYXRlRW50cnkuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvcmVzb2x2ZXJzL2VudHJ5L3VwZGF0ZUVudHJ5LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7OztBQUNBLHFDQUFtQztBQUluQyw2REFBK0Q7QUFDL0Qsb0RBQWlFO0FBQ2pFLG9EQUFzRTtBQUN0RSx1REFBa0Q7QUFDbEQsMkRBQXdFO0FBRXhFLE1BQU0sT0FBTyxHQUFHLE1BQU0sRUFBRSxDQUFDO0FBRWxCLE1BQU0sV0FBVyxHQUFxQyxDQUMzRCxDQUFDLEVBQ0QsRUFBRSxLQUFLLEVBQUUsRUFDVCxPQUFPLEVBQ1AsRUFBRTtJQUNGLE9BQUEsT0FBTyxDQUFDLFdBQVcsQ0FBQyxZQUFZLENBQUMsZUFBZSxDQUFDLEdBQVMsRUFBRTtRQUMxRCxNQUFNLEVBQUUsV0FBVyxFQUFFLElBQUksRUFBRSxXQUFXLEVBQUUsRUFBRSxZQUFZLEVBQUUsRUFBRSxXQUFXLEVBQUUsU0FBUyxFQUFFLFNBQVMsRUFBRSxHQUFHLE9BQU8sQ0FBQztRQUV4RyxJQUFJLENBQUMsQ0FBQSxJQUFJLGFBQUosSUFBSSx1QkFBSixJQUFJLENBQUUsRUFBRSxDQUFBLEVBQUU7WUFDYixNQUFNLElBQUksS0FBSyxDQUFDLDZCQUE2QixDQUFDLENBQUM7U0FDaEQ7UUFFRCxNQUFNLCtCQUFhLENBQUMsV0FBVyxDQUFDO1lBQzlCLFdBQVcsRUFBRSxLQUFLO1lBQ2xCLFdBQVc7WUFDWCxZQUFZO1NBQ2IsQ0FBQyxDQUFDO1FBRUgsTUFBTSxFQUNKLEVBQUUsRUFDRixJQUFJLEVBQ0osWUFBWSxFQUNaLFVBQVUsRUFBRSxlQUFlLEVBQzNCLFFBQVEsRUFBRSxhQUFhLEVBQ3ZCLGFBQWEsRUFBRSxrQkFBa0IsRUFDakMsV0FBVyxFQUFFLGdCQUFnQixFQUM3QixLQUFLLEVBQ0wsTUFBTSxFQUFFLFdBQVcsRUFDbkIsVUFBVSxHQUNYLEdBQUcsS0FBSyxDQUFDO1FBRVYs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