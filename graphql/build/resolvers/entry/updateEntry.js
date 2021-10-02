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
const updateEntry = (_, { input }, { reqDateTime, user, dataSources: { accountingDb } }) => __awaiter(void 0, void 0, void 0, function* () {
    return accountingDb.withTransaction(() => __awaiter(void 0, void 0, void 0, function* () {
        yield entryValidators_1.validateEntry.updateEntry({
            updateEntry: input,
            reqDateTime,
            accountingDb,
        });
        const { id, date, dateOfRecord, department: departmentInput, category: categoryInput, paymentMethod: paymentMethodInput, description: descriptionInput, total, source: sourceInput, reconciled, } = input;
        const entryId = new mongodb_1.ObjectId(id);
        const docHistory = new DocHistory_1.DocHistory({ by: user.id, date: reqDateTime });
        const updateBuilder = new DocHistory_1.UpdateHistoricalDoc({
            docHistory,
            isRootDoc: true,
        });
        if (date) {
            updateBuilder.updateHistoricalField("date", date);
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
        }
        else if (dateOfRecord) {
            const { date, overrideFiscalYear } = dateOfRecord;
            if (dateOfRecord.date) {
                dateOfRecordUpdateBuilder.updateHistoricalField("date", date);
            }
            if ((overrideFiscalYear !== null && overrideFiscalYear !== void 0 ? overrideFiscalYear : NULLISH) !== NULLISH) {
                dateOfRecordUpdateBuilder.updateHistoricalField("overrideFiscalYear", overrideFiscalYear);
            }
        }
        if (departmentInput) {
            const department = new mongodb_1.ObjectId(departmentInput);
            updateBuilder.updateHistoricalField("department", department);
        }
        const category = categoryInput ? new mongodb_1.ObjectId(categoryInput) : null;
        if (category) {
            updateBuilder.updateHistoricalField("category", category);
        }
        const paymentMethod = paymentMethodInput
            ? (0, paymentMethod_1.upsertPaymentMethodToDbRecord)({
                upsertPaymentMethod: paymentMethodInput,
            })
            : null;
        if (paymentMethod) {
            updateBuilder.updateHistoricalField("paymentMethod", paymentMethod);
        }
        const description = descriptionInput === null || descriptionInput === void 0 ? void 0 : descriptionInput.trim();
        if (description) {
            updateBuilder.updateHistoricalField("description", description);
        }
        if (total) {
            updateBuilder.updateHistoricalField("total", (0, mongoRational_1.fractionToRational)(total));
        }
        if (sourceInput) {
            const source = yield (0, upsertEntrySource_1.upsertEntrySourceToEntityDbRecord)({
                upsertEntrySourceInput: sourceInput,
                accountingDb,
            });
            updateBuilder.updateHistoricalField("source", source);
        }
        if ((reconciled !== null && reconciled !== void 0 ? reconciled : NULLISH) !== NULLISH) {
            updateBuilder.updateHistoricalField("reconciled", reconciled);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXBkYXRlRW50cnkuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvcmVzb2x2ZXJzL2VudHJ5L3VwZGF0ZUVudHJ5LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7OztBQUNBLHFDQUFtQztBQUluQyw2REFBK0Q7QUFDL0Qsb0RBQWlFO0FBQ2pFLG9EQUFzRTtBQUN0RSx1REFBa0Q7QUFDbEQsMkRBQXdFO0FBRXhFLE1BQU0sT0FBTyxHQUFHLE1BQU0sRUFBRSxDQUFDO0FBRWxCLE1BQU0sV0FBVyxHQUFxQyxDQUMzRCxDQUFDLEVBQ0QsRUFBRSxLQUFLLEVBQUUsRUFDVCxFQUFFLFdBQVcsRUFBRSxJQUFJLEVBQUUsV0FBVyxFQUFFLEVBQUUsWUFBWSxFQUFFLEVBQUUsRUFDcEQsRUFBRTtJQUNGLE9BQUEsWUFBWSxDQUFDLGVBQWUsQ0FBQyxHQUFTLEVBQUU7UUFDdEMsTUFBTSwrQkFBYSxDQUFDLFdBQVcsQ0FBQztZQUM5QixXQUFXLEVBQUUsS0FBSztZQUNsQixXQUFXO1lBQ1gsWUFBWTtTQUNiLENBQUMsQ0FBQztRQUVILE1BQU0sRUFDSixFQUFFLEVBQ0YsSUFBSSxFQUNKLFlBQVksRUFDWixVQUFVLEVBQUUsZUFBZSxFQUMzQixRQUFRLEVBQUUsYUFBYSxFQUN2QixhQUFhLEVBQUUsa0JBQWtCLEVBQ2pDLFdBQVcsRUFBRSxnQkFBZ0IsRUFDN0IsS0FBSyxFQUNMLE1BQU0sRUFBRSxXQUFXLEVBQ25CLFVBQVUsR0FDWCxHQUFHLEtBQUssQ0FBQztRQUVWLE1BQU0sT0FBTyxHQUFHLElBQUksa0JBQVEsQ0FBQyxFQUFFLENBQUMsQ0FBQztRQUVqQyxNQUFNLFVBQVUsR0FBRyxJQUFJLHVCQUFVLENBQUMsRUFBRSxFQUFFLEVBQUUsSUFBSSxDQUFDLEVBQUUsRUFBRSxJQUFJLEVBQUUsV0FBVyxFQUFFLENBQUMsQ0FBQztRQUV0RSxNQUFNLGFBQWEsR0FBRyxJQUFJLGdDQUFtQixDQUFnQjtZQUMzRCxV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