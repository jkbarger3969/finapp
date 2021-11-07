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
const updateEntryRefund = (_, { input }, { dataSources: { accountingDb }, reqDateTime, user }) => accountingDb.withTransaction(() => __awaiter(void 0, void 0, void 0, function* () {
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
    if (date) {
        updateBuilder.updateHistoricalField("date", date);
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
    if (paymentMethodInput) {
        updateBuilder.updateHistoricalField("paymentMethod", (0, paymentMethod_1.upsertPaymentMethodToDbRecord)({
            upsertPaymentMethod: paymentMethodInput,
        }));
    }
    if (description) {
        updateBuilder.updateHistoricalField("description", description);
    }
    if (description) {
        updateBuilder.updateHistoricalField("description", description);
    }
    if (total) {
        updateBuilder.updateHistoricalField("total", (0, mongoRational_1.fractionToRational)(total));
    }
    if ((reconciled !== null && reconciled !== void 0 ? reconciled : NULLISH) !== NULLISH) {
        updateBuilder.updateHistoricalField("reconciled", reconciled);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXBkYXRlRW50cnlSZWZ1bmQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvcmVzb2x2ZXJzL2VudHJ5L3VwZGF0ZUVudHJ5UmVmdW5kLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7OztBQUFBLHFDQUFtQztBQUluQyw2REFBK0Q7QUFDL0Qsb0RBQWlFO0FBQ2pFLG9EQUFzRTtBQUN0RSx1REFBa0Q7QUFFbEQsTUFBTSxPQUFPLEdBQUcsTUFBTSxFQUFFLENBQUM7QUFFbEIsTUFBTSxpQkFBaUIsR0FBMkMsQ0FDdkUsQ0FBQyxFQUNELEVBQUUsS0FBSyxFQUFFLEVBQ1QsRUFBRSxXQUFXLEVBQUUsRUFBRSxZQUFZLEVBQUUsRUFBRSxXQUFXLEVBQUUsSUFBSSxFQUFFLEVBQ3BELEVBQUUsQ0FDRixZQUFZLENBQUMsZUFBZSxDQUFDLEdBQVMsRUFBRTtJQUN0QyxNQUFNLCtCQUFhLENBQUMsaUJBQWlCLENBQUM7UUFDcEMsWUFBWTtRQUNaLFdBQVc7UUFDWCxpQkFBaUIsRUFBRSxLQUFLO0tBQ3pCLENBQUMsQ0FBQztJQUVILE1BQU0sRUFDSixFQUFFLEVBQ0YsSUFBSSxFQUNKLFlBQVksRUFDWixhQUFhLEVBQUUsa0JBQWtCLEVBQ2pDLFdBQVcsRUFBRSxnQkFBZ0IsRUFDN0IsS0FBSyxFQUNMLFVBQVUsR0FDWCxHQUFHLEtBQUssQ0FBQztJQUVWLE1BQU0sV0FBVyxHQUFHLGdCQUFnQixhQUFoQixnQkFBZ0IsdUJBQWhCLGdCQUFnQixDQUFFLElBQUksRUFBRSxDQUFDO0lBRTdDLE1BQU0sUUFBUSxHQUFHLElBQUksa0JBQVEsQ0FBQyxFQUFFLENBQUMsQ0FBQztJQUVsQyxNQUFNLFVBQVUsR0FBRyxJQUFJLHVCQUFVLENBQUMsRUFBRSxFQUFFLEVBQUUsSUFBSSxDQUFDLEVBQUUsRUFBRSxJQUFJLEVBQUUsV0FBVyxFQUFFLENBQUMsQ0FBQztJQUV0RSxNQUFNLGFBQWEsR0FBRyxJQUFJLGdDQUFtQixD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