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
    const { id, date, paymentMethod: paymentMethodInput, description: descriptionInput, total, reconciled, } = input;
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
    yield accountingDb.updateOne({
        collection: "entries",
        filter: {
            "refunds.id": refundId,
        },
        update: updateBuilder.valueOf(),
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXBkYXRlRW50cnlSZWZ1bmQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvcmVzb2x2ZXJzL2VudHJ5L3VwZGF0ZUVudHJ5UmVmdW5kLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7OztBQUFBLHFDQUFtQztBQUduQyw2REFBK0Q7QUFDL0Qsb0RBQWlFO0FBQ2pFLG9EQUFzRTtBQUN0RSx1REFBa0Q7QUFFbEQsTUFBTSxPQUFPLEdBQUcsTUFBTSxFQUFFLENBQUM7QUFFbEIsTUFBTSxpQkFBaUIsR0FBMkMsQ0FDdkUsQ0FBQyxFQUNELEVBQUUsS0FBSyxFQUFFLEVBQ1QsRUFBRSxXQUFXLEVBQUUsRUFBRSxZQUFZLEVBQUUsRUFBRSxXQUFXLEVBQUUsSUFBSSxFQUFFLEVBQ3BELEVBQUUsQ0FDRixZQUFZLENBQUMsZUFBZSxDQUFDLEdBQVMsRUFBRTtJQUN0QyxNQUFNLCtCQUFhLENBQUMsaUJBQWlCLENBQUM7UUFDcEMsWUFBWTtRQUNaLFdBQVc7UUFDWCxpQkFBaUIsRUFBRSxLQUFLO0tBQ3pCLENBQUMsQ0FBQztJQUVILE1BQU0sRUFDSixFQUFFLEVBQ0YsSUFBSSxFQUNKLGFBQWEsRUFBRSxrQkFBa0IsRUFDakMsV0FBVyxFQUFFLGdCQUFnQixFQUM3QixLQUFLLEVBQ0wsVUFBVSxHQUNYLEdBQUcsS0FBSyxDQUFDO0lBRVYsTUFBTSxXQUFXLEdBQUcsZ0JBQWdCLGFBQWhCLGdCQUFnQix1QkFBaEIsZ0JBQWdCLENBQUUsSUFBSSxFQUFFLENBQUM7SUFFN0MsTUFBTSxRQUFRLEdBQUcsSUFBSSxrQkFBUSxDQUFDLEVBQUUsQ0FBQyxDQUFDO0lBRWxDLE1BQU0sVUFBVSxHQUFHLElBQUksdUJBQVUsQ0FBQyxFQUFFLEVBQUUsRUFBRSxJQUFJLENBQUMsRUFBRSxFQUFFLElBQUksRUFBRSxXQUFXLEVBQUUsQ0FBQyxDQUFDO0lBRXRFLE1BQU0sYUFBYSxHQUFHLElBQUksZ0NBQW1CLENBRzNDO1FBQ0EsVUFBVTtRQUNWLFNBQVMsRUFBRSxJQUFJO1FBQ2YsV0FBVyxFQUFFLFdBQVc7S0FDekIsQ0FBQyxDQUFDO0lBRUgsSUFBSSxJQUFJLEVBQUU7UUFDUixhQUFhLENBQUMscUJBQXFCLENBQUMsTUFBTSxFQUFFLElBQUksQ0FBQyxDQUFDO0tBQ25EO0lBRUQsSUFBSSxrQkFBa0IsRUFBRTtRQUN0QixhQUFhLENBQUMscUJBQXFCLENBQ2pDLGVBQWUsRUFDZixJQUFBLDZDQUE2QixFQUFDO1lBQzVCLG1CQUFtQixFQUFFLGtCQUFrQjtTQUN4QyxDQUFDLENBQ0gsQ0FBQztLQUNIO0lBRUQsSUFBSSxXQUFXLEVBQUU7UUFDZixhQUFhLENBQUMscUJBQXFCLENBQUMsYUFBYSxFQUFFLFdBQVcsQ0FBQyxDQUFDO0tBQ2pFO0lBRUQsSUFBSSxXQUFXLEVBQUU7UUFDZixhQUFhLENBQUMscUJBQXFCLENBQUMsYUFBYSxFQUFFLFdBQVcsQ0FBQyxDQUFDO0tBQ2pFO0lBRUQsSUFBSSxLQUFLLEVBQUU7UUFDVCxhQUFhLENBQUMscUJBQXFCLENBQUMsT0FBTyxFQUFFLElBQUEsa0NBQWtCLEVBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQztLQUN6RTtJQUVELElBQUksQ0FBQyxVQUFVLGFBQVYsVUFBVSxjQUFWLFVBQVUsR0FBSSxPQUFPLENBQUMsS0FBSyxPQUFPLEVBQUU7UUFDdkMsYUFBYSxDQUFDLHFCQUFxQixDQUFDLFlBQVksRUFBRSxVQUFVLENBQUMsQ0FBQztLQUMvRDtJQUVELE1BQU0sWUFBWSxDQUFDLFNBQVMsQ0FBQztRQUMzQixVQUFVLEVBQUUsU0FBUztRQUNyQixNQUFNLEVBQUU7WUFDTixZQUFZLEVBQUUsUUFBUTtTQUN2QjtRQUNELE1BQU0sRUFBRSxhQUFhLENBQUMsT0FBTyxFQUFFO0tBQ2hDLENBQUMsQ0FBQztJQUVILE9BQU87UUFDTCxrQkFBa0IsRUFBRSxNQUFNLFlBQVk7YUFDbkMsT0FBTyxDQUFDO1lBQ1AsVUFBVSxFQUFFLFNBQVM7WUFDckIsTUFBTSxFQUFFLEVBQUUsWUFBWSxFQUFFLFFBQVEsRUFBRTtZQUNsQyxPQUFPLEVBQUU7Z0JBQ1AsVUFBVSxFQUFFO29CQUNWLE9BQU8sRUFBRSxJQUFJO2lCQUNkO2FBQ0Y7WUFDRCxTQUFTLEVBQUUsSUFBSTtTQUNoQixDQUFDO2FBQ0QsSUFBSSxDQUFDLENBQUMsRUFBRSxPQUFPLEVBQUUsRUFBRSxFQUFFLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxDQUFDLEVBQUUsQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQztLQUN4RSxDQUFDO0FBQ0osQ0FBQyxDQUFBLENBQUMsQ0FBQztBQXZGUSxRQUFBLGlCQUFpQixxQkF1RnpCIn0=