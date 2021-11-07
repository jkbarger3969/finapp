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
const addNewEntryRefund = (_, { input }, { dataSources: { accountingDb }, reqDateTime, user }) => accountingDb.withTransaction(() => __awaiter(void 0, void 0, void 0, function* () {
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYWRkTmV3RW50cnlSZWZ1bmQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvcmVzb2x2ZXJzL2VudHJ5L2FkZE5ld0VudHJ5UmVmdW5kLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7OztBQUFBLHFDQUFtQztBQUduQyw2REFBK0Q7QUFDL0Qsb0RBQWlFO0FBQ2pFLG9EQUFtRTtBQUNuRSxvREFBa0Q7QUFDbEQsdURBQWtEO0FBRTNDLE1BQU0saUJBQWlCLEdBQTJDLENBQ3ZFLENBQUMsRUFDRCxFQUFFLEtBQUssRUFBRSxFQUNULEVBQUUsV0FBVyxFQUFFLEVBQUUsWUFBWSxFQUFFLEVBQUUsV0FBVyxFQUFFLElBQUksRUFBRSxFQUNwRCxFQUFFLENBQ0YsWUFBWSxDQUFDLGVBQWUsQ0FBQyxHQUFTLEVBQUU7SUFDdEMsTUFBTSwrQkFBYSxDQUFDLGNBQWMsQ0FBQztRQUNqQyxjQUFjLEVBQUUsS0FBSztRQUNyQixXQUFXO1FBQ1gsWUFBWTtLQUNiLENBQUMsQ0FBQztJQUVILE1BQU0sRUFDSixLQUFLLEVBQ0wsSUFBSSxFQUNKLFlBQVksRUFDWixhQUFhLEVBQUUsa0JBQWtCLEVBQ2pDLFdBQVcsRUFBRSxnQkFBZ0IsRUFDN0IsS0FBSyxFQUFFLFVBQVUsRUFDakIsVUFBVSxHQUNYLEdBQUcsS0FBSyxDQUFDO0lBQ1YsTUFBTSxPQUFPLEdBQUcsSUFBSSxrQkFBUSxDQUFDLEtBQUssQ0FBQyxDQUFDO0lBRXBDLFVBQVU7SUFDVixNQUFNLGFBQWEsR0FBRyxJQUFBLDZDQUE2QixFQUFDO1FBQ2xELG1CQUFtQixFQUFFLGtCQUFrQjtLQUN4QyxDQUFDLENBQUM7SUFDSCxNQUFNLFdBQVcsR0FBRyxnQkFBZ0IsYUFBaEIsZ0JBQWdCLHVCQUFoQixnQkFBZ0IsQ0FBRSxJQUFJLEVBQUUsQ0FBQztJQUM3QyxNQUFNLEtBQUssR0FBRyxJQUFBLGtDQUFrQixFQUFDLFVBQVUsQ0FBQyxDQUFDO0lBRTdDLE1BQU0s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