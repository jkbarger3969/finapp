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
exports.addNewEntryRefund = void 0;
const mongodb_1 = require("mongodb");
const mongoRational_1 = require("../../utils/mongoRational");
const paymentMethod_1 = require("../paymentMethod");
const DocHistory_1 = require("../utils/DocHistory");
const mongoUtils_1 = require("../utils/mongoUtils");
const entryValidators_1 = require("./entryValidators");
const addNewEntryRefund = (_, { input }, context) => context.dataSources.accountingDb.withTransaction(() => __awaiter(void 0, void 0, void 0, function* () {
    const { dataSources: { accountingDb }, reqDateTime, user, authService, ipAddress, userAgent } = context;
    if (!(user === null || user === void 0 ? void 0 : user.id)) {
        throw new Error("Unauthorized: Please log in");
    }
    yield entryValidators_1.validateEntry.newEntryRefund({
        newEntryRefund: input,
        reqDateTime,
        accountingDb,
    });
    const { entry, date, dateOfRecord, paymentMethod: paymentMethodInput, description: descriptionInput, total: totalInput, reconciled, } = input;
    const entryId = new mongodb_1.ObjectId(entry);
    // convert
    const paymentMethod = (0, paymentMethod_1.upsertPaymentMethodToDbRecord)({
        upsertPaymentMethod: paymentMethodInput,
    });
    const description = descriptionInput === null || descriptionInput === void 0 ? void 0 : descriptionInput.trim();
    const total = (0, mongoRational_1.fractionToRational)(totalInput);
    const docHistory = new DocHistory_1.DocHistory({ by: user.id, date: reqDateTime });
    const refundId = yield (0, mongoUtils_1.getUniqueId)("refunds.id", accountingDb.db.collection("entries"));
    const newDocBuilder = new DocHistory_1.NewHistoricalDoc({
        docHistory,
        isRootDoc: true,
    })
        .addFieldValued("id", refundId)
        .addHistoricalField("date", date)
        .addHistoricalField("deleted", false)
        .addHistoricalField("paymentMethod", paymentMethod)
        .addHistoricalField("total", total)
        .addHistoricalField("reconciled", reconciled !== null && reconciled !== void 0 ? reconciled : false);
    if (description) {
        newDocBuilder.addHistoricalField("description", description);
    }
    if (dateOfRecord) {
        const { date, overrideFiscalYear } = dateOfRecord;
        const dateOfRecordDoc = new DocHistory_1.NewHistoricalDoc({
            docHistory,
            isRootDoc: false,
        })
            .addHistoricalField("date", date)
            .addHistoricalField("overrideFiscalYear", overrideFiscalYear)
            .valueOf();
        newDocBuilder.addFieldValued("dateOfRecord", dateOfRecordDoc);
    }
    yield accountingDb.updateOne({
        collection: "entries",
        filter: { _id: entryId },
        update: {
            $push: {
                refunds: newDocBuilder.valueOf(),
            },
        },
    });
    // Log audit entry
    if (authService) {
        yield authService.logAudit({
            userId: user.id,
            action: "REFUND_CREATE",
            resourceType: "Refund",
            resourceId: refundId,
            details: {
                entryId: entry,
                description: description || null,
                total: totalInput,
                date: date.toISOString(),
            },
            ipAddress,
            userAgent,
            timestamp: new Date(),
        });
    }
    return {
        newEntryRefund: yield accountingDb
            .findOne({
            collection: "entries",
            filter: { "refunds.id": refundId },
            options: {
                projection: {
                    refunds: true,
                },
            },
        })
            .then(({ refunds }) => refunds.find(({ id }) => id.equals(refundId))),
    };
}));
exports.addNewEntryRefund = addNewEntryRefund;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYWRkTmV3RW50cnlSZWZ1bmQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvcmVzb2x2ZXJzL2VudHJ5L2FkZE5ld0VudHJ5UmVmdW5kLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7OztBQUFBLHFDQUFtQztBQUduQyw2REFBK0Q7QUFDL0Qsb0RBQWlFO0FBQ2pFLG9EQUFtRTtBQUNuRSxvREFBa0Q7QUFDbEQsdURBQWtEO0FBRTNDLE1BQU0saUJBQWlCLEdBQTJDLENBQ3ZFLENBQUMsRUFDRCxFQUFFLEtBQUssRUFBRSxFQUNULE9BQU8sRUFDUCxFQUFFLENBQ0YsT0FBTyxDQUFDLFdBQVcsQ0FBQyxZQUFZLENBQUMsZUFBZSxDQUFDLEdBQVMsRUFBRTtJQUMxRCxNQUFNLEVBQUUsV0FBVyxFQUFFLEVBQUUsWUFBWSxFQUFFLEVBQUUsV0FBVyxFQUFFLElBQUksRUFBRSxXQUFXLEVBQUUsU0FBUyxFQUFFLFNBQVMsRUFBRSxHQUFHLE9BQU8sQ0FBQztJQUV4RyxJQUFJLENBQUMsQ0FBQSxJQUFJLGFBQUosSUFBSSx1QkFBSixJQUFJLENBQUUsRUFBRSxDQUFBLEVBQUU7UUFDYixNQUFNLElBQUksS0FBSyxDQUFDLDZCQUE2QixDQUFDLENBQUM7S0FDaEQ7SUFFRCxNQUFNLCtCQUFhLENBQUMsY0FBYyxDQUFDO1FBQ2pDLGNBQWMsRUFBRSxLQUFLO1FBQ3JCLFdBQVc7UUFDWCxZQUFZO0tBQ2IsQ0FBQyxDQUFDO0lBRUgsTUFBTSxFQUNKLEtBQUssRUFDTCxJQUFJLEVBQ0osWUFBWSxFQUNaLGFBQWEsRUFBRSxrQkFBa0IsRUFDakMsV0FBVyxFQUFFLGdCQUFnQixFQUM3QixLQUFLLEVBQUUsVUFBVSxFQUNqQixVQUFVLEdBQ1gsR0FBRyxLQUFLLENBQUM7SUFDVixNQUFNLE9BQU8sR0FBRyxJQUFJLGtCQUFRLENBQUMsS0FBSyxDQUFDLENBQUM7SUFFcEMsVUFBVTtJQUNWLE1BQU0sYUFBYSxHQUFHLElB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