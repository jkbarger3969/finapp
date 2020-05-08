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
const graphTypes_1 = require("../../graphTypes");
const paymentMethodAdd_1 = require("../paymentMethod/paymentMethodAdd");
const paymentMethodUpdate_1 = require("../paymentMethod/paymentMethodUpdate");
const DocHistory_1 = require("../utils/DocHistory");
const standIns_1 = require("../utils/standIns");
const utils_1 = require("./utils");
const pubSubs_1 = require("./pubSubs");
const business_1 = require("../business");
const person_1 = require("../person");
const NULLISH = Symbol();
const addDate = {
    $addFields: Object.assign({}, DocHistory_1.default.getPresentValues(["date"])),
};
const journalEntryUpdate = (obj, args, context, info) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const { id, fields: { date: dateString, department: departmentId, type, category: categoryId, paymentMethod: paymentMethodId, source, description, total, reconciled, }, paymentMethodAdd, paymentMethodUpdate, personAdd, businessAdd, } = args;
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
            if (result && date > result.refundDate) {
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
    if (total) {
        const totalDecimal = total.num / total.den;
        if (totalDecimal <= 0) {
            throw new Error("Entry total must be greater than 0.");
        }
        asyncOps.push((() => __awaiter(void 0, void 0, void 0, function* () {
            const [{ refundTotal }] = (yield db
                .collection("journalEntries")
                .aggregate([
                { $match: { _id: new mongodb_1.ObjectID(id) } },
                utils_1.stages.refundTotal,
            ])
                .toArray());
            if (totalDecimal < refundTotal) {
                throw new Error("Entry total cannot be less than entry's total refunds.");
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiam91cm5hbEVudHJ5VXBkYXRlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL3Jlc29sdmVycy9qb3VybmFsRW50cnkvam91cm5hbEVudHJ5VXBkYXRlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7O0FBQUEscUNBQW1DO0FBRW5DLHVDQUFtQztBQUVuQyxpREFLMEI7QUFDMUIsd0VBQXlFO0FBQ3pFLDhFQUErRTtBQUMvRSxvREFBNkM7QUFDN0MsZ0RBQWlEO0FBQ2pELG1DQUEwRDtBQUMxRCx1Q0FBMEU7QUFDMUUsMENBQTBDO0FBQzFDLHNDQUFzQztBQUV0QyxNQUFNLE9BQU8sR0FBRyxNQUFNLEVBQUUsQ0FBQztBQUV6QixNQUFNLE9BQU8sR0FBRztJQUNkLFVBQVUsb0JBQ0wsb0JBQVUsQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQ3pDO0NBQ08sQ0FBQztBQUVYLE1BQU0sa0JBQWtCLEdBQTRDLENBQ2xFLEdBQUcsRUFDSCxJQUFJLEVBQ0osT0FBTyxFQUNQLElBQUksRUFDSixFQUFFOztJQUNGLE1BQU0sRUFDSixFQUFFLEVBQ0YsTUFBTSxFQUFFLEVBQ04sSUFBSSxFQUFFLFVBQVUsRUFDaEIsVUFBVSxFQUFFLFlBQVksRUFDeEIsSUFBSSxFQUNKLFFBQVEsRUFBRSxVQUFVLEVBQ3BCLGFBQWEsRUFBRSxlQUFlLEVBQzlCLE1BQU0sRUFDTixXQUFXLEVBQ1gsS0FBSyxFQUNMLFVBQVUsR0FDWCxFQUNELGdCQUFnQixFQUNoQixtQkFBbUIsRUFDbkIsU0FBUyxFQUNULFdBQVcsR0FDWixHQUFHLElBQUksQ0FBQztJQUVULDJFQUEyRTtJQUMzRSwwQkFBMEI7SUFDMUIsSUFBSSxnQkFBZ0IsSUFBSSxtQkFBbUIsRUFBRTtRQUMzQyxNQUFNLElBQUksS0FBSyxDQUNiLGdGQUFnRixDQUNqRixDQUFDO0tBQ0g7SUFFRCxnRUFBZ0U7SUFDaEUsc0JBQXNCO0lBQ3RCLElBQUks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