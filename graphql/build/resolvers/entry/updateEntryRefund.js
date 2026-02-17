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
const permissions_1 = require("../utils/permissions");
const entryValidators_1 = require("./entryValidators");
const NULLISH = Symbol();
const updateEntryRefund = (_, { input }, context) => context.dataSources.accountingDb.withTransaction(() => __awaiter(void 0, void 0, void 0, function* () {
    const { dataSources: { accountingDb }, reqDateTime, user, authService, ipAddress, userAgent } = context;
    // Check permission - only SUPER_ADMIN can edit refunds
    yield (0, permissions_1.checkPermission)(context, "EDIT_TRANSACTION");
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXBkYXRlRW50cnlSZWZ1bmQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvcmVzb2x2ZXJzL2VudHJ5L3VwZGF0ZUVudHJ5UmVmdW5kLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7OztBQUFBLHFDQUFtQztBQUluQyw2REFBK0Q7QUFDL0Qsb0RBQWlFO0FBQ2pFLG9EQUFzRTtBQUN0RSxzREFBdUQ7QUFDdkQsdURBQWtEO0FBRWxELE1BQU0sT0FBTyxHQUFHLE1BQU0sRUFBRSxDQUFDO0FBRWxCLE1BQU0saUJBQWlCLEdBQTJDLENBQ3ZFLENBQUMsRUFDRCxFQUFFLEtBQUssRUFBRSxFQUNULE9BQU8sRUFDUCxFQUFFLENBQ0YsT0FBTyxDQUFDLFdBQVcsQ0FBQyxZQUFZLENBQUMsZUFBZSxDQUFDLEdBQVMsRUFBRTtJQUMxRCxNQUFNLEVBQUUsV0FBVyxFQUFFLEVBQUUsWUFBWSxFQUFFLEVBQUUsV0FBVyxFQUFFLElBQUksRUFBRSxXQUFXLEVBQUUsU0FBUyxFQUFFLFNBQVMsRUFBRSxHQUFHLE9BQU8sQ0FBQztJQUV4Ryx1REFBdUQ7SUFDdkQsTUFBTSxJQUFBLDZCQUFlLEVBQUMsT0FBTyxFQUFFLGtCQUFrQixDQUFDLENBQUM7SUFFbkQsTUFBTSwrQkFBYSxDQUFDLGlCQUFpQixDQUFDO1FBQ3BDLFlBQVk7UUFDWixXQUFXO1FBQ1gsaUJBQWlCLEVBQUUsS0FBSztLQUN6QixDQUFDLENBQUM7SUFFSCxNQUFNLEVBQ0osRUFBRSxFQUNGLElBQUksRUFDSixZQUFZLEVBQ1osYUFBYSxFQUFFLGtCQUFrQixFQUNqQyxXQUFXLEVBQUUsZ0JBQWdCLEVBQzdCLEtBQUssRUFDTCxVQUFVLEdBQ1gsR0FBRyxLQUFLLENBQUM7SUFFVixNQUFNLFdBQVcsR0FBRyxnQkFBZ0IsYUFBaEIsZ0JBQWdCLHVCQUFoQixnQkFBZ0IsQ0FBRSxJQUFJLEVBQUUsQ0FBQztJQUU3QyxNQUFNLFFBQVEsR0FBRyxJQUFJLGtC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