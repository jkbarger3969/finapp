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
exports.updateEntryRefund = void 0;
const mongodb_1 = require("mongodb");
const mongoRational_1 = require("../../utils/mongoRational");
const paymentMethod_1 = require("../paymentMethod");
const DocHistory_1 = require("../utils/DocHistory");
const entryValidators_1 = require("./entryValidators");
const NULLISH = Symbol();
const updateEntryRefund = (_, { input }, context) => context.dataSources.accountingDb.withTransaction(() => __awaiter(void 0, void 0, void 0, function* () {
    const { dataSources: { accountingDb }, reqDateTime, user, authService, ipAddress, userAgent } = context;
    if (!(user === null || user === void 0 ? void 0 : user.id)) {
        throw new Error("Unauthorized: Please log in");
    }
    yield entryValidators_1.validateEntry.updateEntryRefund({
        accountingDb,
        reqDateTime,
        updateEntryRefund: input,
    });
    const { id, date, dateOfRecord, paymentMethod: paymentMethodInput, description: descriptionInput, total, reconciled, } = input;
    const description = descriptionInput === null || descriptionInput === void 0 ? void 0 : descriptionInput.trim();
    const refundId = new mongodb_1.ObjectId(id);
    const docHistory = new DocHistory_1.DocHistory({ by: user.id, date: reqDateTime });
    const updateBuilder = new DocHistory_1.UpdateHistoricalDoc({
        docHistory,
        isRootDoc: true,
        fieldPrefix: "refunds.$",
    });
    const changedFields = [];
    if (date) {
        updateBuilder.updateHistoricalField("date", date);
        changedFields.push("date");
    }
    const dateOfRecordUpdateBuilder = new DocHistory_1.UpdateHistoricalDoc({
        docHistory,
        isRootDoc: false,
        fieldPrefix: "refunds.$.dateOfRecord",
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
    if (paymentMethodInput) {
        updateBuilder.updateHistoricalField("paymentMethod", (0, paymentMethod_1.upsertPaymentMethodToDbRecord)({
            upsertPaymentMethod: paymentMethodInput,
        }));
        changedFields.push("paymentMethod");
    }
    if (description) {
        updateBuilder.updateHistoricalField("description", description);
        changedFields.push("description");
    }
    if (total) {
        updateBuilder.updateHistoricalField("total", (0, mongoRational_1.fractionToRational)(total));
        changedFields.push("total");
    }
    if ((reconciled !== null && reconciled !== void 0 ? reconciled : NULLISH) !== NULLISH) {
        updateBuilder.updateHistoricalField("reconciled", reconciled);
        changedFields.push("reconciled");
    }
    const entryRefundUpdate = updateBuilder.valueOf();
    const dateOfRecordUpdate = dateOfRecordUpdateBuilder.valueOf();
    const update = {};
    if ((entryRefundUpdate === null || entryRefundUpdate === void 0 ? void 0 : entryRefundUpdate.$set) || (dateOfRecordUpdate === null || dateOfRecordUpdate === void 0 ? void 0 : dateOfRecordUpdate.$set)) {
        update.$set = Object.assign(Object.assign({}, entryRefundUpdate === null || entryRefundUpdate === void 0 ? void 0 : entryRefundUpdate.$set), dateOfRecordUpdate === null || dateOfRecordUpdate === void 0 ? void 0 : dateOfRecordUpdate.$set);
    }
    if ((entryRefundUpdate === null || entryRefundUpdate === void 0 ? void 0 : entryRefundUpdate.$push) || (dateOfRecordUpdate === null || dateOfRecordUpdate === void 0 ? void 0 : dateOfRecordUpdate.$push)) {
        update.$push = Object.assign(Object.assign({}, entryRefundUpdate === null || entryRefundUpdate === void 0 ? void 0 : entryRefundUpdate.$push), dateOfRecordUpdate === null || dateOfRecordUpdate === void 0 ? void 0 : dateOfRecordUpdate.$push);
    }
    yield accountingDb.updateOne({
        collection: "entries",
        filter: {
            "refunds.id": refundId,
        },
        update,
    });
    // Log audit entry
    if (authService && changedFields.length > 0) {
        yield authService.logAudit({
            userId: user.id,
            action: "REFUND_UPDATE",
            resourceType: "Refund",
            resourceId: refundId,
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
        updatedEntryRefund: yield accountingDb
            .findOne({
            collection: "entries",
            filter: { "refunds.id": refundId },
            options: {
                projection: {
                    refunds: true,
                },
            },
            skipCache: true,
        })
            .then(({ refunds }) => refunds.find(({ id }) => id.equals(refundId))),
    };
}));
exports.updateEntryRefund = updateEntryRefund;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXBkYXRlRW50cnlSZWZ1bmQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvcmVzb2x2ZXJzL2VudHJ5L3VwZGF0ZUVudHJ5UmVmdW5kLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7OztBQUFBLHFDQUFtQztBQUluQyw2REFBK0Q7QUFDL0Qsb0RBQWlFO0FBQ2pFLG9EQUFzRTtBQUN0RSx1REFBa0Q7QUFFbEQsTUFBTSxPQUFPLEdBQUcsTUFBTSxFQUFFLENBQUM7QUFFbEIsTUFBTSxpQkFBaUIsR0FBMkMsQ0FDdkUsQ0FBQyxFQUNELEVBQUUsS0FBSyxFQUFFLEVBQ1QsT0FBTyxFQUNQLEVBQUUsQ0FDRixPQUFPLENBQUMsV0FBVyxDQUFDLFlBQVksQ0FBQyxlQUFlLENBQUMsR0FBUyxFQUFFO0lBQzFELE1BQU0sRUFBRSxXQUFXLEVBQUUsRUFBRSxZQUFZLEVBQUUsRUFBRSxXQUFXLEVBQUUsSUFBSSxFQUFFLFdBQVcsRUFBRSxTQUFTLEVBQUUsU0FBUyxFQUFFLEdBQUcsT0FBTyxDQUFDO0lBRXhHLElBQUksQ0FBQyxDQUFBLElBQUksYUFBSixJQUFJLHVCQUFKLElBQUksQ0FBRSxFQUFFLENBQUEsRUFBRTtRQUNiLE1BQU0sSUFBSSxLQUFLLENBQUMsNkJBQTZCLENBQUMsQ0FBQztLQUNoRDtJQUVELE1BQU0sK0JBQWEsQ0FBQyxpQkFBaUIsQ0FBQztRQUNwQyxZQUFZO1FBQ1osV0FBVztRQUNYLGlCQUFpQixFQUFFLEtBQUs7S0FDekIsQ0FBQyxDQUFDO0lBRUgsTUFBTSxFQUNKLEVBQUUsRUFDRixJQUFJLEVBQ0osWUFBWSxFQUNaLGFBQWEsRUFBRSxrQkFBa0IsRUFDakMsV0FBVyxFQUFFLGdCQUFnQixFQUM3QixLQUFLLEVBQ0wsVUFBVSxHQUNYLEdBQUcsS0FBSyxDQUFDO0lBRVYsTUFBTSxXQUFXLEdBQUcsZ0JBQWdCLGFBQWhCLGdCQUFnQix1QkFBaEIsZ0JBQWdCLENBQUUsSUFBSSxFQUFF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