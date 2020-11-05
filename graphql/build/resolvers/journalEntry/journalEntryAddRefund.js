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
    const reconciled = (_a = args.fields.reconciled) !== null && _a !== void 0 ? _a : false;
    const description = ((_b = args.fields.description) !== null && _b !== void 0 ? _b : "").trim();
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
    const srcEntryId = new mongodb_1.ObjectId(id);
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
            const id = new mongodb_1.ObjectId(yield paymentMethodAdd_1.default(doc, { fields: paymentMethodAdd }, Object.assign(Object.assign({}, context), { ephemeral: Object.assign(Object.assign({}, (context.ephemeral || {})), { docHistoryDate: docHistory.date }) }), info).then(({ id }) => id));
            docBuilder.addField("paymentMethod", {
                node: new mongodb_1.ObjectId(node),
                id,
            });
        })));
    }
    else {
        // Ensure payment method exists.
        asyncOps.push((() => __awaiter(void 0, void 0, void 0, function* () {
            const { collection, id: node } = nodeMap.typename.get("PaymentMethod");
            const id = new mongodb_1.ObjectId(args.fields.paymentMethod);
            if (!(yield db
                .collection(collection)
                .findOne({ _id: id }, { projection: { _id: true } }))) {
                throw new Error(`Payment method with id ${id.toHexString()} does not exist.`);
            }
            docBuilder.addField("paymentMethod", {
                node: new mongodb_1.ObjectId(node),
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiam91cm5hbEVudHJ5QWRkUmVmdW5kLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL3Jlc29sdmVycy9qb3VybmFsRW50cnkvam91cm5hbEVudHJ5QWRkUmVmdW5kLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7O0FBQUEscUNBQW1DO0FBQ25DLDZDQUFtQztBQUNuQyx1Q0FBbUM7QUFFbkMsb0RBQTZDO0FBQzdDLGdEQUFpRDtBQUNqRCxpREFJMEI7QUFDMUIsaURBQTBDO0FBQzFDLG9EQUFrRDtBQUNsRCxtQ0FBaUM7QUFDakMsd0VBQXlFO0FBQ3pFLHVDQUFtRDtBQUNuRCxtREFBMEQ7QUFFMUQsTUFBTSxPQUFPLEdBQUc7SUFDZCxVQUFVLG9CQUNMLG9CQUFVLENBQUMsZ0JBQWdCLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUN6QztDQUNPLENBQUM7QUFFWCxNQUFNLHFCQUFxQixHQUErQyxDQUN4RSxHQUFHLEVBQ0gsSUFBSSxFQUNKLE9BQU8sRUFDUCxJQUFJLEVBQ0osRUFBRTs7SUFDRixNQUFNLEVBQ0osRUFBRSxFQUNGLE1BQU0sRUFBRSxFQUFFLElBQUksRUFBRSxPQUFPLEVBQUUsS0FBSyxFQUFFLE1BQU0sRUFBRSxFQUN4QyxnQkFBZ0IsR0FDakIsR0FBRyxJQUFJLENBQUM7SUFFVCxNQUFNLEtBQUssR0FBRyw2QkFBa0IsQ0FBQyxNQUFNLENBQUMsQ0FBQztJQUV6QyxNQUFNLFVBQVUsU0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDLFVBQVUsbUNBQUksS0FBSyxDQUFDO0lBRW5ELE1BQU0sV0FBVyxHQUFHLE9BQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxXQUFXLG1DQUFJLEVBQUUsQ0FBQyxDQUFDLElBQUksRUFBRSxDQUFDO0lBRTNELDZDQUE2QztJQUM3QyxJQUFJLE1BQU0sQ0FBQyxDQUFDLEtBQUsseUJBQVksQ0FBQyxHQUFHLElBQUksTUFBTSxDQUFDLENBQUMsS0FBSyxDQUFDLEVB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