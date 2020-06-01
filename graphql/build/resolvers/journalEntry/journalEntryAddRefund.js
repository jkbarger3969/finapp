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
const mongodb_1 = require("mongodb");
const fraction_js_1 = require("fraction.js");
const date_fns_1 = require("date-fns");
const DocHistory_1 = require("../utils/DocHistory");
const standIns_1 = require("../utils/standIns");
const graphTypes_1 = require("../../graphTypes");
const journalEntry_1 = require("./journalEntry");
const mongoUtils_1 = require("../utils/mongoUtils");
const utils_1 = require("./utils");
const paymentMethodAdd_1 = require("../paymentMethod/paymentMethodAdd");
const pubSubs_1 = require("./pubSubs");
const rational_1 = require("../../utils/rational");
const addDate = {
    $addFields: Object.assign({}, DocHistory_1.default.getPresentValues(["date"])),
};
const journalEntryAddRefund = (doc, args, context, info) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    const { id, fields: { date: dateStr, total: totalR }, paymentMethodAdd, } = args;
    const total = rational_1.rationalToFraction(totalR);
    const reconciled = (_a = args.fields.reconciled, (_a !== null && _a !== void 0 ? _a : false));
    const description = (_b = args.fields.description, (_b !== null && _b !== void 0 ? _b : "")).trim();
    // Total Cannot be less than or equal to zero
    if (totalR.s === graphTypes_1.RationalSign.Neg || totalR.n === 0) {
        throw new Error("Entry total must be greater than 0.");
    }
    const date = new Date(dateStr);
    if (!date_fns_1.isValid(date)) {
        throw new Error(`Date "${dateStr}" not a valid ISO 8601 date string.`);
    }
    const { db, user, nodeMap, pubSub } = context;
    const docHistory = new DocHistory_1.default({ node: standIns_1.userNodeType, id: user.id });
    const collection = db.collection("journalEntries");
    const srcEntryId = new mongodb_1.ObjectID(id);
    const docBuilder = docHistory.newHistoricalDoc(true).addFields([
        ["date", date],
        ["total", total],
        ["reconciled", reconciled],
        ["deleted", false],
    ]);
    if (description) {
        docBuilder.addField("description", description);
    }
    let refundId;
    const asyncOps = [
        // Ensure source entry exists, max refund totals are not exceeded, and
        // that refund date is after entry date
        (() => __awaiter(void 0, void 0, void 0, function* () {
            const [srcEntryState] = (yield collection
                .aggregate([
                { $match: { _id: srcEntryId } },
                addDate,
                utils_1.stages.entryTotal,
                utils_1.stages.refundTotals,
                {
                    $project: {
                        date: true,
                        entryTotal: true,
                        refundTotals: true,
                    },
                },
            ])
                .toArray());
            if (!srcEntryState) {
                throw new Error(`Journal entry "${id}" does not exist.`);
            }
            const entryDate = srcEntryState.date;
            const entryTotal = new fraction_js_1.default(srcEntryState.entryTotal);
            const refundTotal = srcEntryState.refundTotals.reduce((refundTotal, total) => refundTotal.add(total), new fraction_js_1.default(0));
            // Ensure aggregate refunds do NOT exceed the original transaction amount
            if (entryTotal.compare(refundTotal.add(total)) < 0) {
                throw new Error("Refunds cannot total more than original transaction amount.");
            }
            if (date < entryDate) {
                throw new Error("Refund date cannot be before the entry date.");
            }
        }))(),
        // Generate refund ID
        (() => __awaiter(void 0, void 0, void 0, function* () {
            refundId = yield mongoUtils_1.getUniqueId("refunds.id", collection);
        }))(),
    ];
    if (paymentMethodAdd) {
        // Do NOT create new payment method until all other checks pass
        asyncOps.push(Promise.all(asyncOps.splice(0)).then(() => __awaiter(void 0, void 0, void 0, function* () {
            const { id: node } = nodeMap.typename.get("PaymentMethod");
            const id = new mongodb_1.ObjectID(yield paymentMethodAdd_1.default(doc, { fields: paymentMethodAdd }, Object.assign(Object.assign({}, context), { ephemeral: Object.assign(Object.assign({}, (context.ephemeral || {})), { docHistoryDate: docHistory.date }) }), info).then(({ id }) => id));
            docBuilder.addField("paymentMethod", {
                node: new mongodb_1.ObjectID(node),
                id,
            });
        })));
    }
    else {
        // Ensure payment method exists.
        asyncOps.push((() => __awaiter(void 0, void 0, void 0, function* () {
            const { collection, id: node } = nodeMap.typename.get("PaymentMethod");
            const id = new mongodb_1.ObjectID(args.fields.paymentMethod);
            if (!(yield db
                .collection(collection)
                .findOne({ _id: id }, { projection: { _id: true } }))) {
                throw new Error(`Payment method with id ${id.toHexString()} does not exist.`);
            }
            docBuilder.addField("paymentMethod", {
                node: new mongodb_1.ObjectID(node),
                id,
            });
        }))());
    }
    yield Promise.all(asyncOps);
    const { modifiedCount } = yield collection.updateOne({ _id: srcEntryId }, {
        $push: {
            refunds: Object.assign({ id: refundId }, docBuilder.doc()),
        },
    });
    if (modifiedCount === 0) {
        throw new Error(`Failed to add refund entry: "${JSON.stringify(args, null, 2)}".`);
    }
    const result = yield journalEntry_1.default(doc, { id }, context, info);
    pubSub
        .publish(pubSubs_1.JOURNAL_ENTRY_UPSERTED, { journalEntryUpserted: result })
        .catch((error) => console.error(error));
    return result;
});
exports.default = journalEntryAddRefund;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiam91cm5hbEVudHJ5QWRkUmVmdW5kLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL3Jlc29sdmVycy9qb3VybmFsRW50cnkvam91cm5hbEVudHJ5QWRkUmVmdW5kLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7O0FBQUEscUNBQW1DO0FBQ25DLDZDQUFtQztBQUNuQyx1Q0FBbUM7QUFFbkMsb0RBQTZDO0FBQzdDLGdEQUFpRDtBQUNqRCxpREFJMEI7QUFDMUIsaURBQTBDO0FBQzFDLG9EQUFrRDtBQUNsRCxtQ0FBaUM7QUFDakMsd0VBQXlFO0FBQ3pFLHVDQUFtRDtBQUNuRCxtREFBMEQ7QUFFMUQsTUFBTSxPQUFPLEdBQUc7SUFDZCxVQUFVLG9CQUNMLG9CQUFVLENBQUMsZ0JBQWdCLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUN6QztDQUNPLENBQUM7QUFFWCxNQUFNLHFCQUFxQixHQUErQyxDQUN4RSxHQUFHLEVBQ0gsSUFBSSxFQUNKLE9BQU8sRUFDUCxJQUFJLEVBQ0osRUFBRTs7SUFDRixNQUFNLEVBQ0osRUFBRSxFQUNGLE1BQU0sRUFBRSxFQUFFLElBQUksRUFBRSxPQUFPLEVBQUUsS0FBSyxFQUFFLE1BQU0sRUFBRSxFQUN4QyxnQkFBZ0IsR0FDakIsR0FBRyxJQUFJLENBQUM7SUFFVCxNQUFNLEtBQUssR0FBRyw2QkFBa0IsQ0FBQyxNQUFNLENBQUMsQ0FBQztJQUV6QyxNQUFNLFVBQVUsU0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDLFVBQVUsdUNBQUksS0FBSyxFQUFBLENBQUM7SUFFbkQsTUFBTSxXQUFXLEdBQUcsTUFBQyxJQUFJLENBQUMsTUFBTSxDQUFDLFdBQVcsdUNBQUksRUFBRSxFQUFDLENBQUMsSUFBSSxFQUFFLENBQUM7SUFFM0QsNkNBQTZDO0lBQzdDLElBQUksTUFBTSxDQUFDLENBQUMsS0FBSyx5QkFBWSxDQUFDLEdBQUcsSUFBSSxNQUFNLENBQUMsQ0FBQyxLQUFLLENB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