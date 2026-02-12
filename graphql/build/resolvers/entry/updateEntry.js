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
const updateEntry = (_, { input }, { reqDateTime, user, dataSources: { accountingDb }, authService, ipAddress, userAgent }) => __awaiter(void 0, void 0, void 0, function* () {
    return accountingDb.withTransaction(() => __awaiter(void 0, void 0, void 0, function* () {
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXBkYXRlRW50cnkuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvcmVzb2x2ZXJzL2VudHJ5L3VwZGF0ZUVudHJ5LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7OztBQUNBLHFDQUFtQztBQUluQyw2REFBK0Q7QUFDL0Qsb0RBQWlFO0FBQ2pFLG9EQUFzRTtBQUN0RSx1REFBa0Q7QUFDbEQsMkRBQXdFO0FBRXhFLE1BQU0sT0FBTyxHQUFHLE1BQU0sRUFBRSxDQUFDO0FBRWxCLE1BQU0sV0FBVyxHQUFxQyxDQUMzRCxDQUFDLEVBQ0QsRUFBRSxLQUFLLEVBQUUsRUFDVCxFQUFFLFdBQVcsRUFBRSxJQUFJLEVBQUUsV0FBVyxFQUFFLEVBQUUsWUFBWSxFQUFFLEVBQUUsV0FBVyxFQUFFLFNBQVMsRUFBRSxTQUFTLEVBQUUsRUFDdkYsRUFBRTtJQUNGLE9BQUEsWUFBWSxDQUFDLGVBQWUsQ0FBQyxHQUFTLEVBQUU7UUFDdEMsTUFBTSwrQkFBYSxDQUFDLFdBQVcsQ0FBQztZQUM5QixXQUFXLEVBQUUsS0FBSztZQUNsQixXQUFXO1lBQ1gsWUFBWTtTQUNiLENBQUMsQ0FBQztRQUVILE1BQU0sRUFDSixFQUFFLEVBQ0YsSUFBSSxFQUNKLFlBQVksRUFDWixVQUFVLEVBQUUsZUFBZSxFQUMzQixRQUFRLEVBQUUsYUFBYSxFQUN2QixhQUFhLEVBQUUsa0JBQWtCLEVBQ2pDLFdBQVcsRUFBRSxnQkFBZ0IsRUFDN0IsS0FBSyxFQUNMLE1BQU0sRUFBRSxXQUFXLEVBQ25CLFVBQVUsR0FDWCxHQUFHLEtBQUssQ0FBQztRQUVWLE1BQU0sT0FBTyxHQUFHLElBQUksa0JBQVEsQ0FBQyxFQUFFLENBQUMsQ0FBQztRQUVqQywwQ0FBMEM7UUFDMUMsTUFBTSxhQUFhLEdBQUcsTUFBTSxZQUFZLENBQUMsT0FBTyxDQUFDO1lBQy9DLFVBQVUsRUFBRSxTQUFTO1lBQ3JCLE1BQU0sRUFBRSxFQUFFLEdBQUcsRUFBRSxPQUFPLEVB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