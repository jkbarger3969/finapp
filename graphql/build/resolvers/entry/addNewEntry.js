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
const permissions_1 = require("../utils/permissions");
const entryValidators_1 = require("./entryValidators");
const upsertEntrySource_1 = require("./upsertEntrySource");
const addNewEntry = (_, { input }, context) => context.dataSources.accountingDb.withTransaction(() => __awaiter(void 0, void 0, void 0, function* () {
    const { reqDateTime, user, dataSources: { accountingDb }, authService, ipAddress, userAgent } = context;
    // Check permission - only SUPER_ADMIN can add transactions
    yield (0, permissions_1.checkPermission)(context, "ADD_TRANSACTION");
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYWRkTmV3RW50cnkuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvcmVzb2x2ZXJzL2VudHJ5L2FkZE5ld0VudHJ5LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7OztBQUFBLHFDQUFtQztBQUluQyw2REFBK0Q7QUFDL0Qsb0RBQWlFO0FBQ2pFLG9EQUFtRTtBQUNuRSxzREFBdUQ7QUFDdkQsdURBQWtEO0FBQ2xELDJEQUF3RTtBQUVqRSxNQUFNLFdBQVcsR0FBcUMsQ0FDM0QsQ0FBQyxFQUNELEVBQUUsS0FBSyxFQUFFLEVBQ1QsT0FBTyxFQUNQLEVBQUUsQ0FDRixPQUFPLENBQUMsV0FBVyxDQUFDLFlBQVksQ0FBQyxlQUFlLENBQUMsR0FBUyxFQUFFO0lBQzFELE1BQU0sRUFBRSxXQUFXLEVBQUUsSUFBSSxFQUFFLFdBQVcsRUFBRSxFQUFFLFlBQVksRUFBRSxFQUFFLFdBQVcsRUFBRSxTQUFTLEVBQUUsU0FBUyxFQUFFLEdBQUcsT0FBTyxDQUFDO0lBRXhHLDJEQUEyRDtJQUMzRCxNQUFNLElBQUEsNkJBQWUsRUFBQyxPQUFPLEVBQUUsaUJBQWlCLENBQUMsQ0FBQztJQUVsRCwwQkFBMEI7SUFDMUIsTUFBTSwrQkFBYSxDQUFDLFFBQVEsQ0FBQztRQUMzQixRQUFRLEVBQUUsS0FBSztRQUNmLFdBQVc7UUFDWCxZQUFZO0tBQ2IsQ0FBQyxDQUFDO0lBRUgsTUFBTSxFQUNKLElBQUksRUFDSixZQUFZLEVBQ1osVUFBVSxFQUFFLGVBQWUsRUFDM0IsUUFBUSxFQUFFLGFBQWEsRUFDdkIsYUFBYSxFQUFFLGtCQUFrQixFQUNqQyxXQUFXLEVBQUUsZ0JBQWdCLEVBQzdCLEtBQUssRUFBRSxVQUFVLEVBQ2pCLE1BQU0sRUFBRSxXQUFXLEVBQ25CLFVBQVUsRUFBRSxlQUFlLEdBQzVCLEdBQUcsS0FBSyxDQUFDO0lBRVYsTUFBTSxRQUFRLEdBQUcsSUFBSSxrQkFBUSxDQUFDLGFBQWEsQ0FBQyxDQUFDO0lBQzdD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