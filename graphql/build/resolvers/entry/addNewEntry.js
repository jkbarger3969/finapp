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
const addNewEntry = (_, { input }, context) => context.dataSources.accountingDb.withTransaction(() => __awaiter(void 0, void 0, void 0, function* () {
    const { reqDateTime, user, dataSources: { accountingDb }, authService, ipAddress, userAgent } = context;
    if (!(user === null || user === void 0 ? void 0 : user.id)) {
        throw new Error("Unauthorized: Please log in");
    }
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYWRkTmV3RW50cnkuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvcmVzb2x2ZXJzL2VudHJ5L2FkZE5ld0VudHJ5LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7OztBQUFBLHFDQUFtQztBQUluQyw2REFBK0Q7QUFDL0Qsb0RBQWlFO0FBQ2pFLG9EQUFtRTtBQUNuRSx1REFBa0Q7QUFDbEQsMkRBQXdFO0FBRWpFLE1BQU0sV0FBVyxHQUFxQyxDQUMzRCxDQUFDLEVBQ0QsRUFBRSxLQUFLLEVBQUUsRUFDVCxPQUFPLEVBQ1AsRUFBRSxDQUNGLE9BQU8sQ0FBQyxXQUFXLENBQUMsWUFBWSxDQUFDLGVBQWUsQ0FBQyxHQUFTLEVBQUU7SUFDMUQsTUFBTSxFQUFFLFdBQVcsRUFBRSxJQUFJLEVBQUUsV0FBVyxFQUFFLEVBQUUsWUFBWSxFQUFFLEVBQUUsV0FBVyxFQUFFLFNBQVMsRUFBRSxTQUFTLEVBQUUsR0FBRyxPQUFPLENBQUM7SUFFeEcsSUFBSSxDQUFDLENBQUEsSUFBSSxhQUFKLElBQUksdUJBQUosSUFBSSxDQUFFLEVBQUUsQ0FBQSxFQUFFO1FBQ2IsTUFBTSxJQUFJLEtBQUssQ0FBQyw2QkFBNkIsQ0FBQyxDQUFDO0tBQ2hEO0lBRUQsMEJBQTBCO0lBQzFCLE1BQU0sK0JBQWEsQ0FBQyxRQUFRLENBQUM7UUFDM0IsUUFBUSxFQUFFLEtBQUs7UUFDZixXQUFXO1FBQ1gsWUFBWTtLQUNiLENBQUMsQ0FBQztJQUVILE1BQU0sRUFDSixJQUFJLEVBQ0osWUFBWSxFQUNaLFVBQVUsRUFBRSxlQUFlLEVBQzNCLFFBQVEsRUFBRSxhQUFhLEVBQ3ZCLGFBQWEsRUFBRSxrQkFBa0IsRUFDakMsV0FBVyxFQUFFLGdCQUFnQixFQUM3QixLQUFLLEVBQUUsVUFBVSxFQUNqQixNQUFNLEVBQUUsV0FBVyxFQUNuQixVQUFVLEVBQUUsZUFBZSxHQUM1QixHQUFHLEtBQUssQ0FBQztJQUVWLE1BQU0sUUFBUSxHQUFHLElB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