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
const graphTypes_1 = require("../../graphTypes");
const paymentMethodAdd_1 = require("../paymentMethod/paymentMethodAdd");
const paymentMethodUpdate_1 = require("../paymentMethod/paymentMethodUpdate");
const DocHistory_1 = require("../utils/DocHistory");
const standIns_1 = require("../utils/standIns");
const utils_1 = require("./utils");
const pubSubs_1 = require("./pubSubs");
const business_1 = require("../business");
const person_1 = require("../person");
const rational_1 = require("../../utils/rational");
const NULLISH = Symbol();
const addDate = {
    $addFields: Object.assign({}, DocHistory_1.default.getPresentValues(["date"])),
};
const journalEntryUpdate = (obj, args, context, info) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const { id, fields: { date: dateString, department: departmentId, type, category: categoryId, paymentMethod: paymentMethodId, source, description, total: totalR, reconciled, }, paymentMethodAdd, paymentMethodUpdate, personAdd, businessAdd, } = args;
    // "paymentMethodAdd" and "paymentMethodUpdate" are mutually exclusive, gql
    // has no concept of this.
    if (paymentMethodAdd && paymentMethodUpdate) {
        throw new Error(`"paymentMethodAdd" and "paymentMethodUpdate" are mutually exclusive arguments.`);
    }
    // "businessAdd" and "personAdd" are mutually exclusive, gql has
    // no concept of this.
    if (personAdd && businessAdd) {
        throw new Error(`"businessAdd" and "personAdd" are mutually exclusive source creation arguments.`);
    }
    const { db, nodeMap, user, pubSub } = context;
    const entryId = new mongodb_1.ObjectID(id);
    // Async validations
    // All async validation are run at once instead of in series.
    const asyncOps = [
        (() => __awaiter(void 0, void 0, void 0, function* () {
            const [{ count } = { count: 0 }] = (yield db
                .collection("journalEntries")
                .aggregate([{ $match: { _id: entryId } }, { $count: "count" }])
                .toArray());
            if (count === 0) {
                throw Error(`Journal entry "${id}" does not exist.`);
            }
        }))(),
    ];
    const docHistory = new DocHistory_1.default({ node: standIns_1.userNodeType, id: user.id });
    const updateBuilder = docHistory.updateHistoricalDoc();
    // Date
    if (dateString) {
        const date = new Date(dateString);
        if (!date_fns_1.isValid(date)) {
            throw new Error(`Date "${dateString}" not a valid ISO 8601 date string.`);
        }
        asyncOps.push((() => __awaiter(void 0, void 0, void 0, function* () {
            const [result] = (yield db
                .collection("journalEntries")
                .aggregate([
                { $match: { _id: entryId } },
                { $limit: 1 },
                {
                    $project: {
                        refundDate: {
                            $reduce: {
                                input: "$refunds",
                                initialValue: docHistory.date,
                                in: {
                                    $min: [
                                        "$$value",
                                        DocHistory_1.default.getPresentValueExpression("date", {
                                            asVar: "this",
                                            defaultValue: docHistory.date,
                                        }),
                                    ],
                                },
                            },
                        },
                    },
                },
            ])
                .toArray());
            if (result && result.refundDate && date > result.refundDate) {
                throw new Error("Entry date can not be greater than the earliest refund date.");
            }
            updateBuilder.updateField("date", date);
        }))());
    }
    // Type
    if (((type !== null && type !== void 0 ? type : NULLISH)) !== NULLISH) {
        updateBuilder.updateField("type", type);
    }
    // Description
    if ((_a = description) === null || _a === void 0 ? void 0 : _a.trim()) {
        updateBuilder.updateField("description", description);
    }
    // Total
    if (totalR) {
        if (totalR.s === graphTypes_1.RationalSign.Neg || totalR.n === 0) {
            throw new Error("Entry total must be greater than 0.");
        }
        const total = rational_1.rationalToFraction(totalR);
        asyncOps.push(
        // Check that new total is not less than refunds and items
        (() => __awaiter(void 0, void 0, void 0, function* () {
            const [result] = (yield db
                .collection("journalEntries")
                .aggregate([
                { $match: { _id: new mongodb_1.ObjectID(id) } },
                utils_1.stages.refundTotals,
                utils_1.stages.itemTotals,
            ])
                .toArray());
            if (!result) {
                return;
            }
            const refundTotal = result.refundTotals.reduce((refundTotal, total) => refundTotal.add(total), new fraction_js_1.default(0));
            const itemTotal = result.itemTotals.reduce((itemTotal, total) => itemTotal.add(total), new fraction_js_1.default(0));
            if (total.compare(refundTotal) < 0) {
                throw new Error("Entry total cannot be less than entry's total refunds.");
            }
            if (total.compare(itemTotal) < 0) {
                throw new Error("Entry total cannot be less than entry's total items.");
            }
            updateBuilder.updateField("total", total);
        }))());
    }
    // Reconciled
    if (((reconciled !== null && reconciled !== void 0 ? reconciled : NULLISH)) !== NULLISH) {
        updateBuilder.updateField("reconciled", reconciled);
    }
    // Department
    if (departmentId) {
        asyncOps.push((() => __awaiter(void 0, void 0, void 0, function* () {
            const { collection, id: node } = nodeMap.typename.get("Department");
            const id = new mongodb_1.ObjectID(departmentId);
            if (!(yield db
                .collection(collection)
                .findOne({ _id: id }, { projection: { _id: true } }))) {
                throw new Error(`Department with id ${departmentId} does not exist.`);
            }
            updateBuilder.updateField("department", {
                node: new mongodb_1.ObjectID(node),
                id,
            });
        }))());
    }
    // Category
    if (categoryId) {
        asyncOps.push((() => __awaiter(void 0, void 0, void 0, function* () {
            const { collection, id: node } = nodeMap.typename.get("JournalEntryCategory");
            const id = new mongodb_1.ObjectID(categoryId);
            if (!(yield db
                .collection(collection)
                .findOne({ _id: id }, { projection: { _id: true } }))) {
                throw new Error(`Category with id ${categoryId} does not exist.`);
            }
            updateBuilder.updateField("category", {
                node: new mongodb_1.ObjectID(node),
                id,
            });
        }))());
    }
    // Source
    if (businessAdd) {
        // Do NOT create a new business until all other checks pass
        asyncOps.push(Promise.all(asyncOps.splice(0)).then(() => __awaiter(void 0, void 0, void 0, function* () {
            const { id } = yield business_1.addBusiness(obj, { fields: businessAdd }, context, info);
            const { node } = utils_1.getSrcCollectionAndNode(db, graphTypes_1.JournalEntrySourceType.Business, nodeMap);
            updateBuilder.updateField("source", {
                node,
                id: new mongodb_1.ObjectID(id),
            });
        })));
    }
    else if (personAdd) {
        // Do NOT create a new person until all other checks pass
        asyncOps.push(Promise.all(asyncOps.splice(0)).then(() => __awaiter(void 0, void 0, void 0, function* () {
            const { id } = yield person_1.addPerson(obj, { fields: personAdd }, context, info);
            const { node } = utils_1.getSrcCollectionAndNode(db, graphTypes_1.JournalEntrySourceType.Person, nodeMap);
            updateBuilder.updateField("source", {
                node,
                id: new mongodb_1.ObjectID(id),
            });
        })));
    }
    else if (source) {
        const { id: sourceId, sourceType } = source;
        asyncOps.push((() => __awaiter(void 0, void 0, void 0, function* () {
            const { collection, node } = utils_1.getSrcCollectionAndNode(db, sourceType, nodeMap);
            const id = new mongodb_1.ObjectID(sourceId);
            if (!(yield collection.findOne({ _id: id }, { projection: { _id: true } }))) {
                throw new Error(`Source type "${sourceType}" with id ${sourceId} does not exist.`);
            }
            updateBuilder.updateField("source", {
                node,
                id,
            });
        }))());
    }
    // Payment method
    if (paymentMethodAdd) {
        // Ensure other checks finish before creating payment method
        asyncOps.push(Promise.all(asyncOps.splice(0)).then(() => __awaiter(void 0, void 0, void 0, function* () {
            // Add payment method
            const id = new mongodb_1.ObjectID(yield paymentMethodAdd_1.default(obj, { fields: paymentMethodAdd }, Object.assign(Object.assign({}, context), { ephemeral: Object.assign(Object.assign({}, (context.ephemeral || {})), { docHistoryDate: docHistory.date }) }), info).then(({ id }) => id));
            const { id: node } = nodeMap.typename.get("PaymentMethod");
            updateBuilder.updateField("paymentMethod", {
                node: new mongodb_1.ObjectID(node),
                id,
            });
        })));
    }
    else if (paymentMethodUpdate) {
        // Ensure other checks finish before updating payment method
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
    else if (paymentMethodId) {
        asyncOps.push((() => __awaiter(void 0, void 0, void 0, function* () {
            const id = new mongodb_1.ObjectID(paymentMethodId);
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
                department: null,
                type: null,
                category: null,
                paymentMethod: null,
                description: null,
                total: null,
                source: null,
                reconciled: null,
            };
            return Object.keys(obj);
        })();
        throw new Error(`Entry update requires at least one of the following fields: ${keys.join(", ")}".`);
    }
    const _id = new mongodb_1.ObjectID(id);
    const { modifiedCount } = yield db
        .collection("journalEntries")
        .updateOne({ _id }, updateBuilder.update());
    if (modifiedCount === 0) {
        throw new Error(`Failed to update entry: "${JSON.stringify(args)}".`);
    }
    const [updatedDoc] = yield db
        .collection("journalEntries")
        .aggregate([
        { $match: { _id } },
        utils_1.stages.entryAddFields,
        utils_1.stages.entryTransmutations,
    ])
        .toArray();
    pubSub
        .publish(pubSubs_1.JOURNAL_ENTRY_UPDATED, {
        journalEntryUpdated: updatedDoc,
    })
        .catch((error) => console.error(error));
    pubSub
        .publish(pubSubs_1.JOURNAL_ENTRY_UPSERTED, { journalEntryUpserted: updatedDoc })
        .catch((error) => console.error(error));
    return updatedDoc;
});
exports.default = journalEntryUpdate;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiam91cm5hbEVudHJ5VXBkYXRlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL3Jlc29sdmVycy9qb3VybmFsRW50cnkvam91cm5hbEVudHJ5VXBkYXRlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7O0FBQUEscUNBQW1DO0FBQ25DLDZDQUFtQztBQUNuQyx1Q0FBbUM7QUFFbkMsaURBTTBCO0FBQzFCLHdFQUF5RTtBQUN6RSw4RUFBK0U7QUFDL0Usb0RBQTZDO0FBQzdDLGdEQUFpRDtBQUNqRCxtQ0FBMEQ7QUFDMUQsdUNBQTBFO0FBQzFFLDBDQUEwQztBQUMxQyxzQ0FBc0M7QUFDdEMsbURBQTBEO0FBRTFELE1BQU0sT0FBTyxHQUFHLE1BQU0sRUFBRSxDQUFDO0FBRXpCLE1BQU0sT0FBTyxHQUFHO0lBQ2QsVUFBVSxvQkFDTCxvQkFBVSxDQUFDLGdCQUFnQixDQUFDLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FDekM7Q0FDTyxDQUFDO0FBRVgsTUFBTSxrQkFBa0IsR0FBNEMsQ0FDbEUsR0FBRyxFQUNILElBQUksRUFDSixPQUFPLEVBQ1AsSUFBSSxFQUNKLEVBQUU7O0lBQ0YsTUFBTSxFQUNKLEVBQUUsRUFDRixNQUFNLEVBQUUsRUFDTixJQUFJLEVBQUUsVUFBVSxFQUNoQixVQUFVLEVBQUUsWUFBWSxFQUN4QixJQUFJLEVBQ0osUUFBUSxFQUFFLFVBQVUsRUFDcEIsYUFBYSxFQUFFLGVBQWUsRUFDOUIsTUFBTSxFQUNOLFdBQVcsRUFDWCxLQUFLLEVBQUUsTUFBTSxFQUNiLFVBQVUsR0FDWCxFQUNELGdCQUFnQixFQUNoQixtQkFBbUIsRUFDbkIsU0FBUyxFQUNULFdBQVcsR0FDWixHQUFHLElBQUksQ0FBQztJQUVULDJFQUEyRTtJQUMzRSwwQkFBMEI7SUFDMUIsSUFBSSxnQkFBZ0IsSUFBSSxtQkFBbUIsRUFBRTtRQUMzQyxNQUFNLElBQUksS0FBSyxDQUNiLGdGQUFnRixDQUNqRixDQUFDO0tBQ0g7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