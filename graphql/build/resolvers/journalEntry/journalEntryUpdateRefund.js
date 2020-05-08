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
        const refundTotalEx = utils_1.getRefundTotals([refundId]);
        const [result] = (yield collection
            .aggregate([
            { $match: { "refunds.id": refundId } },
            utils_1.stages.entryTotal,
            //Excluded the current total from the refund total as it WILL change.
            refundTotalEx,
            // getRefundTotals([refundId]),
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