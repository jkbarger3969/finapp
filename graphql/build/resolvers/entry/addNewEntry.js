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
exports.addNewEntry = void 0;
const mongodb_1 = require("mongodb");
const mongoRational_1 = require("../../utils/mongoRational");
const paymentMethod_1 = require("../paymentMethod");
const DocHistory_1 = require("../utils/DocHistory");
const entryValidators_1 = require("./entryValidators");
const upsertEntrySource_1 = require("./upsertEntrySource");
const addNewEntry = (_, { input }, { reqDateTime, user, dataSources: { accountingDb }, authService, ipAddress, userAgent }) => accountingDb.withTransaction(() => __awaiter(void 0, void 0, void 0, function* () {
    // validate NewEntry input
    yield entryValidators_1.validateEntry.newEntry({
        newEntry: input,
        reqDateTime,
        accountingDb,
    });
    const { date, dateOfRecord, department: departmentInput, category: categoryInput, paymentMethod: paymentMethodInput, description: descriptionInput, total: totalInput, source: sourceInput, reconciled: reconciledInput, } = input;
    const category = new mongodb_1.ObjectId(categoryInput);
    const department = new mongodb_1.ObjectId(departmentInput);
    const description = descriptionInput === null || descriptionInput === void 0 ? void 0 : descriptionInput.trim();
    const total = (0, mongoRational_1.fractionToRational)(totalInput);
    const reconciled = reconciledInput !== null && reconciledInput !== void 0 ? reconciledInput : false;
    // convert
    const paymentMethod = (0, paymentMethod_1.upsertPaymentMethodToDbRecord)({
        upsertPaymentMethod: paymentMethodInput,
    });
    const source = yield (0, upsertEntrySource_1.upsertEntrySourceToEntityDbRecord)({
        upsertEntrySourceInput: sourceInput,
        accountingDb,
    });
    const docHistory = new DocHistory_1.DocHistory({ by: user.id, date: reqDateTime });
    const newDocBuilder = new DocHistory_1.NewHistoricalDoc({
        docHistory,
        isRootDoc: true,
    })
        .addHistoricalField("category", category)
        .addHistoricalField("date", date)
        .addHistoricalField("deleted", false)
        .addHistoricalField("department", department)
        .addHistoricalField("paymentMethod", paymentMethod)
        .addHistoricalField("reconciled", reconciled)
        .addHistoricalField("source", source)
        .addHistoricalField("total", total);
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
    const { insertedId } = yield accountingDb.insertOne({
        collection: "entries",
        doc: newDocBuilder.valueOf(),
    });
    // Log audit entry
    if (authService) {
        yield authService.logAudit({
            userId: user.id,
            action: "ENTRY_CREATE",
            resourceType: "Entry",
            resourceId: insertedId,
            details: {
                description: description || null,
                total: totalInput,
                department: departmentInput,
                category: categoryInput,
                date: date.toISOString(),
            },
            ipAddress,
            userAgent,
            timestamp: new Date(),
        });
    }
    return {
        newEntry: yield accountingDb.findOne({
            collection: "entries",
            filter: { _id: insertedId },
        }),
    };
}));
exports.addNewEntry = addNewEntry;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYWRkTmV3RW50cnkuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvcmVzb2x2ZXJzL2VudHJ5L2FkZE5ld0VudHJ5LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7OztBQUFBLHFDQUFtQztBQUluQyw2REFBK0Q7QUFDL0Qsb0RBQWlFO0FBQ2pFLG9EQUFtRTtBQUNuRSx1REFBa0Q7QUFDbEQsMkRBQXdFO0FBRWpFLE1BQU0sV0FBVyxHQUFxQyxDQUMzRCxDQUFDLEVBQ0QsRUFBRSxLQUFLLEVBQUUsRUFDVCxFQUFFLFdBQVcsRUFBRSxJQUFJLEVBQUUsV0FBVyxFQUFFLEVBQUUsWUFBWSxFQUFFLEVBQUUsV0FBVyxFQUFFLFNBQVMsRUFBRSxTQUFTLEVBQUUsRUFDdkYsRUFBRSxDQUNGLFlBQVksQ0FBQyxlQUFlLENBQUMsR0FBUyxFQUFFO0lBQ3RDLDBCQUEwQjtJQUMxQixNQUFNLCtCQUFhLENBQUMsUUFBUSxDQUFDO1FBQzNCLFFBQVEsRUFBRSxLQUFLO1FBQ2YsV0FBVztRQUNYLFlBQVk7S0FDYixDQUFDLENBQUM7SUFFSCxNQUFNLEVBQ0osSUFBSSxFQUNKLFlBQVksRUFDWixVQUFVLEVBQUUsZUFBZSxFQUMzQixRQUFRLEVBQUUsYUFBYSxFQUN2QixhQUFhLEVBQUUsa0JBQWtCLEVBQ2pDLFdBQVcsRUFBRSxnQkFBZ0IsRUFDN0IsS0FBSyxFQUFFLFVBQVUsRUFDakIsTUFBTSxFQUFFLFdBQVcsRUFDbkIsVUFBVSxFQUFFLGVBQWUsR0FDNUIsR0FBRyxLQUFLLENBQUM7SUFFVixNQUFNLFFBQVEsR0FBRyxJQUFJLGtCQUFRLENBQUMsYUFBYSxDQUFDLENBQUM7SUFDN0MsTUFBTSxVQUFVLEdBQUcsSUFBSSxrQkFBUSxDQUFDLGVBQWUsQ0FBQyxDQUFDO0lBQ2pELE1BQU0sV0FBVyxHQUFHLGdCQUFnQixhQUFoQixnQkFBZ0IsdUJBQWhCLGdCQUFnQixDQUFFLElBQUksRUFBRSxDQUFDO0lBQzdDLE1B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