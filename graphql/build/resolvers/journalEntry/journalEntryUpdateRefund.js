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
const date_fns_1 = require("date-fns");
const DocHistory_1 = require("../utils/DocHistory");
const standIns_1 = require("../utils/standIns");
const journalEntry_1 = require("./journalEntry");
const utils_1 = require("./utils");
const paymentMethodAdd_1 = require("../paymentMethod/paymentMethodAdd");
const paymentMethodUpdate_1 = require("../paymentMethod/paymentMethodUpdate");
const pubSubs_1 = require("./pubSubs");
const NULLISH = Symbol();
const addDate = {
    $addFields: Object.assign({}, DocHistory_1.default.getPresentValues(["date"])),
};
const journalEntryUpdateRefund = (obj, args, context, info) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    const { id, fields, paymentMethodAdd, paymentMethodUpdate } = args;
    const { db, user, nodeMap, pubSub } = context;
    const collection = db.collection("journalEntries");
    const refundId = new mongodb_1.ObjectID(id);
    const docHistory = new DocHistory_1.default({ node: standIns_1.userNodeType, id: user.id });
    const updateBuilder = docHistory.updateHistoricalDoc("refunds.$[refund]");
    let entryId;
    const asyncOps = [
        (() => __awaiter(void 0, void 0, void 0, function* () {
            const [result] = (yield collection
                .aggregate([
                { $match: { "refunds.id": refundId } },
                { $limit: 1 },
                {
                    $project: {
                        entryId: "$_id",
                    },
                },
            ])
                .toArray());
            if (!result) {
                throw new Error(`Refund "${id}" does not exists.`);
            }
            entryId = result.entryId;
        }))(),
    ];
    // Date
    if (fields.date) {
        const date = new Date(fields.date);
        if (!date_fns_1.isValid(date)) {
            throw new Error(`Date "${fields.date}" not a valid ISO 8601 date string.`);
        }
        asyncOps.push((() => __awaiter(void 0, void 0, void 0, function* () {
            const [result] = (yield collection
                .aggregate([
                { $match: { "refunds.id": refundId } },
                { $limit: 1 },
                addDate,
                {
                    $project: {
                        date: true,
                    },
                },
            ])
                .toArray());
            if (result && date < result.date) {
                throw new Error("Refund date cannot be before the entry date.");
            }
            updateBuilder.updateField("date", date);
        }))());
    }
    // Description
    if (fields.description) {
        const description = fields.description.trim();
        if (description) {
            updateBuilder.updateField("description", description);
        }
    }
    // Reconciled
    if ((_a = fields.reconciled, (_a !== null && _a !== void 0 ? _a : NULLISH)) !== NULLISH) {
        updateBuilder.updateField("reconciled", fields.reconciled);
    }
    // Total
    if ((_b = fields.total, (_b !== null && _b !== void 0 ? _b : NULLISH)) !== NULLISH) {
        // Total Cannot be less than or equal to zero
        const totalDecimal = fields.total.num / fields.total.den;
        if (totalDecimal <= 0) {
            throw new Error("Refund total must be greater than 0.");
        }
        const [result] = (yield collection
            .aggregate([
            { $match: { "refunds.id": refundId } },
            utils_1.stages.entryTotal,
            //Excluded the current total from the refund total as it WILL change.
            utils_1.getRefundTotals([refundId]),
            { $project: { entryTotal: true, refundTotal: true } },
        ])
            .toArray());
        if (!result) {
            throw new Error(`Refund "${id}" does not exists.`);
        }
        const { entryTotal, refundTotal } = result;
        // Ensure aggregate refunds do NOT exceed the original transaction amount
        if (entryTotal < refundTotal + totalDecimal) {
            throw new Error("Refunds cannot total more than original transaction amount.");
        }
        updateBuilder.updateField("total", fields.total);
    }
    // Payment method
    if (paymentMethodAdd) {
        // Ensure other checks finish before creating payment method
        asyncOps.push(Promise.all(asyncOps.splice(0)).then(() => __awaiter(void 0, void 0, void 0, function* () {
            const { id: node } = nodeMap.typename.get("PaymentMethod");
            const id = new mongodb_1.ObjectID(yield paymentMethodAdd_1.default(obj, { fields: paymentMethodAdd }, Object.assign(Object.assign({}, context), { ephemeral: Object.assign(Object.assign({}, (context.ephemeral || {})), { docHistoryDate: docHistory.date }) }), info).then(({ id }) => id));
            updateBuilder.updateField("paymentMethod", {
                node: new mongodb_1.ObjectID(node),
                id,
            });
        })));
    }
    else if (paymentMethodUpdate) {
        // Ensure other checks finish before creating updating method
        asyncOps.push(Promise.all(asyncOps.splice(0)).then(() => __awaiter(void 0, void 0, void 0, function* () {
            const id = new mongodb_1.ObjectID(paymentMethodUpdate.id);
            // Update payment method
            yield paymentMethodUpdate_1.default(obj, {
                id: paymentMethodUpdate.id,
                fields: paymentMethodUpdate.fields,
            }, Object.assign(Object.assign({}, context), { ephemeral: Object.assign(Object.assign({}, (context.ephemeral || {})), { docHistoryDate: docHistory.date }) }), info);
            const { id: node } = nodeMap.typename.get("PaymentMethod");
            updateBuilder.updateField("paymentMethod", {
                node: new mongodb_1.ObjectID(node),
                id,
            });
        })));
    }
    else if (fields.paymentMethod) {
        asyncOps.push((() => __awaiter(void 0, void 0, void 0, function* () {
            const id = new mongodb_1.ObjectID(fields.paymentMethod);
            const { collection, id: node } = nodeMap.typename.get("PaymentMethod");
            if (!(yield db
                .collection(collection)
                .findOne({ _id: id }, { projection: { _id: true } }))) {
                throw new Error(`Payment method with id ${id.toHexString()} does not exist.`);
            }
            updateBuilder.updateField("paymentMethod", {
                node: new mongodb_1.ObjectID(node),
                id,
            });
        }))());
    }
    yield Promise.all(asyncOps);
    if (!updateBuilder.hasUpdate) {
        const keys = (() => {
            const obj = {
                date: null,
                description: null,
                paymentMethod: null,
                total: null,
                reconciled: null,
            };
            return Object.keys(obj);
        })();
        throw new Error(`Refund update requires at least one of the following fields: ${keys.join(", ")}".`);
    }
    const { modifiedCount } = yield collection.updateOne({ _id: entryId }, updateBuilder.update(), {
        arrayFilters: [{ "refund.id": refundId }],
    });
    if (modifiedCount === 0) {
        throw new Error(`Failed to update refund: "${JSON.stringify(args)}".`);
    }
    const result = yield journalEntry_1.default(obj, { id: entryId.toHexString() }, context, info);
    pubSub
        .publish(pubSubs_1.JOURNAL_ENTRY_UPSERTED, { journalEntryUpserted: result })
        .catch((error) => console.error(error));
    return result;
});
exports.default = journalEntryUpdateRefund;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiam91cm5hbEVudHJ5VXBkYXRlUmVmdW5kLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL3Jlc29sdmVycy9qb3VybmFsRW50cnkvam91cm5hbEVudHJ5VXBkYXRlUmVmdW5kLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7O0FBQUEscUNBQW1DO0FBQ25DLHVDQUFtQztBQUVuQyxvREFBNkM7QUFDN0MsZ0RBQWlEO0FBTWpELGlEQUEwQztBQUMxQyxtQ0FBa0Q7QUFDbEQsd0VBQXlFO0FBQ3pFLDhFQUErRTtBQUMvRSx1Q0FBbUQ7QUFFbkQsTUFBTSxPQUFPLEdBQUcsTUFBTSxFQUFFLENBQUM7QUFFekIsTUFBTSxPQUFPLEdBQUc7SUFDZCxVQUFVLG9CQUNMLG9CQUFVLENBQUMsZ0JBQWdCLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUN6QztDQUNPLENBQUM7QUFFWCxNQUFNLHdCQUF3QixHQUFrRCxDQUM5RSxHQUFHLEVBQ0gsSUFBSSxFQUNKLE9BQU8sRUFDUCxJQUFJLEVBQ0osRUFBRTs7SUFDRixNQUFNLEVBQUUsRUFBRSxFQUFFLE1BQU0sRUFBRSxnQkFBZ0IsRUFBRSxtQkFBbUIsRUFBRSxHQUFHLElBQUksQ0FBQztJQUVuRSxNQUFNLEVBQUUsRUFBRSxFQUFFLElBQUksRUFBRSxPQUFPLEVBQUUsTUFBTSxFQUFFLEdBQUcsT0FBTyxDQUFDO0lBRTlDLE1BQU0sVUFBVSxHQUFHLEVBQUUsQ0FBQyxVQUFVLENBQUMsZ0JBQWdCLENBQUMsQ0FBQztJQUVuRCxNQUFNLFFBQVEsR0FBRyxJQUFJLGtCQUFRLENBQUMsRUFBRSxDQUFDLENBQUM7SUFFbEMsTUFBTSxVQUFVLEdBQUcsSUFBSSxvQkFBVSxDQUFDLEVBQUUsSUFBSSxFQUFFLHVCQUFZLEVBQUUsRUFBRSxFQUFFLElBQUksQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDO0lBRXZFLE1BQU0sYUFBYSxHQUFHLFVBQVUsQ0FBQyxtQkFBbUIsQ0FB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