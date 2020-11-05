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
const rational_1 = require("../../utils/rational");
const iterableFns_1 = require("../../utils/iterableFns");
const mongoRational_1 = require("../../utils/mongoRational");
const FilterQueryUtility_1 = require("../utils/FilterQueryUtility");
const NULLISH = Symbol();
const addDate = {
    $addFields: Object.assign({}, DocHistory_1.default.getPresentValues(["date"])),
};
const journalEntryUpdate = (obj, args, context, info) => new Promise((resolve, reject) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const { client, db, nodeMap, user, pubSub } = context;
    const session = ((_a = context.ephemeral) === null || _a === void 0 ? void 0 : _a.session) || client.startSession();
    const resolver = iterableFns_1.generatorInit(function* () {
        try {
            // generatorInit calls 1st next. On 2nd next capture update doc
            const updatedDoc = yield;
            yield; // Pause
            // on 3rd next resolve with the update doc and run pubSubs
            resolve(updatedDoc);
            pubSub
                .publish(pubSubs_1.JOURNAL_ENTRY_UPDATED, {
                journalEntryUpdated: updatedDoc,
            })
                .catch((error) => console.error(error));
            pubSub
                .publish(pubSubs_1.JOURNAL_ENTRY_UPSERTED, { journalEntryUpserted: updatedDoc })
                .catch((error) => console.error(error));
        }
        catch (error) {
            // on throw reject with error.
            reject(error);
        }
    });
    const entryId = new mongodb_1.ObjectId(args.id);
    try {
        yield session.withTransaction(() => __awaiter(void 0, void 0, void 0, function* () {
            var _b, _c;
            const { id, fields: { date: dateString, dateOfRecord, department: departmentId, type, category: categoryId, paymentMethod: paymentMethodId, source, description, total: totalR, reconciled, }, paymentMethodAdd, paymentMethodUpdate, personAdd, businessAdd, } = args;
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
            const docHistory = new DocHistory_1.default({ node: standIns_1.userNodeType, id: user.id });
            const updateBuilder = docHistory.updateHistoricalDoc();
            // Pre condition entry exists.
            const filterQuery = new FilterQueryUtility_1.default("_id", entryId, `Journal entry "${id}" does not exist.`);
            // Date
            if (dateString) {
                const date = new Date(dateString);
                if (!date_fns_1.isValid(date)) {
                    throw new Error(`Date "${dateString}" not a valid ISO 8601 date string.`);
                }
                updateBuilder.updateField("date", date);
                // Validate against refund dates
                filterQuery.addCondition("$expr", {
                    $lte: [
                        date,
                        {
                            $reduce: {
                                input: {
                                    $filter: {
                                        input: "$refunds",
                                        cond: {
                                            $not: DocHistory_1.default.getPresentValueExpression("deleted", {
                                                asVar: "this",
                                                defaultValue: true,
                                            }),
                                        },
                                    },
                                },
                                initialValue: "$$NOW",
                                in: {
                                    $min: [
                                        "$$value",
                                        DocHistory_1.default.getPresentValueExpression("date", {
                                            asVar: "this",
                                            defaultValue: "$$NOW",
                                        }),
                                    ],
                                },
                            },
                        },
                    ],
                }, "Entry date can not be greater than the earliest refund date.");
            }
            // Date of Record
            if (dateOfRecord) {
                if (Object.keys(dateOfRecord).length === 0) {
                    throw new Error(`Updating date of record requires one of the following fields: ${[
                        ...iterableFns_1.iterateOwnKeys({
                            date: "",
                            overrideFiscalYear: true,
                            clear: false,
                        }),
                    ].join(", ")}`);
                }
                const dateString = (_b = dateOfRecord === null || dateOfRecord === void 0 ? void 0 : dateOfRecord.date) === null || _b === void 0 ? void 0 : _b.trim();
                if (dateOfRecord.clear) {
                    filterQuery.addCondition("$expr", {
                        $ne: [
                            DocHistory_1.default.getPresentValueExpression("dateOfRecord.date", {
                                defaultValue: null,
                            }),
                            null,
                        ],
                    }, "Date of record must NOT be null, to clear.");
                    updateBuilder.updateField("dateOfRecord.date", null);
                    updateBuilder.updateField("dateOfRecord.overrideFiscalYear", null);
                }
                else {
                    // Ignore all dateOfRecord fields if clear is true
                    if (dateString) {
                        const date = new Date(dateString);
                        if (!date_fns_1.isValid(date)) {
                            throw new Error(`Date of record "${dateString}" not a valid ISO 8601 date string.`);
                        }
                        updateBuilder.updateField("dateOfRecord.date", date);
                    }
                    else {
                        filterQuery.addCondition("$expr", {
                            $ne: [
                                DocHistory_1.default.getPresentValueExpression("dateOfRecord.date"),
                                null,
                            ],
                        }, "Date of record's date value is required.");
                    }
                    // overrideFiscalYear must already be set if other dateOfRecord fields.
                    if (((_c = dateOfRecord === null || dateOfRecord === void 0 ? void 0 : dateOfRecord.overrideFiscalYear) !== null && _c !== void 0 ? _c : NULLISH) === NULLISH) {
                        filterQuery.addCondition("$expr", {
                            $ne: [
                                DocHistory_1.default.getPresentValueExpression("dateOfRecord.overrideFiscalYear"),
                                null,
                            ],
                        }, "Date of record's fiscal year override value is required.");
                    }
                    else {
                        updateBuilder.updateField("dateOfRecord.overrideFiscalYear", dateOfRecord.overrideFiscalYear);
                    }
                }
            }
            // Type
            if ((type !== null && type !== void 0 ? type : NULLISH) !== NULLISH) {
                updateBuilder.updateField("type", type);
            }
            // Description
            if (description === null || description === void 0 ? void 0 : description.trim()) {
                updateBuilder.updateField("description", description);
            }
            // Total
            if (totalR) {
                if (totalR.s === graphTypes_1.RationalSign.Neg || totalR.n === 0) {
                    throw new Error("Entry total must be greater than 0.");
                }
                const total = rational_1.rationalToFraction(totalR);
                updateBuilder.updateField("total", total);
                // Total cannot be less than refunds.
                filterQuery.addCondition("$expr", {
                    $let: {
                        vars: {
                            totalRefunds: {
                                $reduce: {
                                    input: {
                                        $filter: {
                                            input: "$refunds",
                                            as: "refund",
                                            cond: {
                                                $not: DocHistory_1.default.getPresentValueExpression("deleted", {
                                                    asVar: "refund",
                                                    defaultValue: true,
                                                }),
                                            },
                                        },
                                    },
                                    initialValue: {
                                        s: 1,
                                        n: 0,
                                        d: 1,
                                    },
                                    in: {
                                        $let: {
                                            vars: {
                                                refundTotal: DocHistory_1.default.getPresentValueExpression("total", {
                                                    asVar: "this",
                                                    defaultValue: {
                                                        s: 1,
                                                        n: 0,
                                                        d: 1,
                                                    },
                                                }),
                                            },
                                            in: mongoRational_1.addRational("$value", "$refundTotal"),
                                        },
                                    },
                                },
                            },
                        },
                        in: {
                            $cond: {
                                // Ensure refunds have a total greater than zero
                                if: {
                                    $gt: ["$$totalRefunds.n", 0],
                                },
                                then: mongoRational_1.rationalComparison(total, "$gte", "$totalRefunds"),
                                else: true,
                            },
                        },
                    },
                }, "Entry total cannot be less than entry's total refunds.");
                // Total cannot be less than items.
                filterQuery.addCondition("$expr", {
                    $let: {
                        vars: {
                            totalItems: {
                                $reduce: {
                                    input: {
                                        $filter: {
                                            input: "$items",
                                            as: "item",
                                            cond: {
                                                $not: DocHistory_1.default.getPresentValueExpression("deleted", {
                                                    asVar: "item",
                                                    defaultValue: true,
                                                }),
                                            },
                                        },
                                    },
                                    initialValue: {
                                        s: 1,
                                        n: 0,
                                        d: 1,
                                    },
                                    in: {
                                        $let: {
                                            vars: {
                                                itemTotal: DocHistory_1.default.getPresentValueExpression("total", {
                                                    asVar: "this",
                                                    defaultValue: {
                                                        s: 1,
                                                        n: 0,
                                                        d: 1,
                                                    },
                                                }),
                                            },
                                            in: mongoRational_1.addRational("$value", "$itemTotal"),
                                        },
                                    },
                                },
                            },
                        },
                        in: {
                            $cond: {
                                // Ensure Items have a total greater than zero
                                if: {
                                    $gt: ["$$totalItems.n", 0],
                                },
                                then: mongoRational_1.rationalComparison(total, "$gte", "$totalItems"),
                                else: true,
                            },
                        },
                    },
                }, "Entry total cannot be less than entry's total items.");
            }
            // Reconciled
            if ((reconciled !== null && reconciled !== void 0 ? reconciled : NULLISH) !== NULLISH) {
                updateBuilder.updateField("reconciled", reconciled);
            }
            // Async validation and new documents
            yield Promise.allSettled([
                // Department
                (() => __awaiter(void 0, void 0, void 0, function* () {
                    if (departmentId) {
                        const { collection, id: node } = nodeMap.typename.get("Department");
                        const id = new mongodb_1.ObjectId(departmentId);
                        if (0 ===
                            (yield db
                                .collection(collection)
                                .countDocuments({ _id: id }, { session }))) {
                            throw new Error(`Department with id "${departmentId}" does not exist.`);
                        }
                        updateBuilder.updateField("department", {
                            node: new mongodb_1.ObjectId(node),
                            id,
                        });
                    }
                }))(),
                // Category
                (() => __awaiter(void 0, void 0, void 0, function* () {
                    if (categoryId) {
                        const { collection, id: node } = nodeMap.typename.get("JournalEntryCategory");
                        const id = new mongodb_1.ObjectId(categoryId);
                        const result = yield db
                            .collection(collection)
                            .findOne({ _id: id }, {
                            projection: {
                                type: true,
                            },
                        });
                        if (!result) {
                            throw new Error(`Category with id "${categoryId}" does not exist.`);
                        }
                        const catType = result.type === "credit"
                            ? graphTypes_1.JournalEntryType.Credit
                            : graphTypes_1.JournalEntryType.Debit;
                        // Category must match transaction type.
                        if ((type !== null && type !== void 0 ? type : NULLISH) === NULLISH) {
                            filterQuery.addCondition("$expr", {
                                $eq: [
                                    DocHistory_1.default.getPresentValueExpression("type"),
                                    result.type,
                                ],
                            }, `Category with id "${categoryId}" and type "${catType}" is incompatible with entry type "${catType === graphTypes_1.JournalEntryType.Credit
                                ? graphTypes_1.JournalEntryType.Debit
                                : graphTypes_1.JournalEntryType.Credit}".`);
                        }
                        else {
                            if (catType !== type) {
                                throw new Error(`Category with id "${categoryId}" and type "${catType}" is incompatible with entry type "${type}".`);
                            }
                        }
                        updateBuilder.updateField("category", {
                            node: new mongodb_1.ObjectId(node),
                            id,
                        });
                    }
                }))(),
                // Source
                (() => __awaiter(void 0, void 0, void 0, function* () {
                    if (businessAdd) {
                        const { id } = yield business_1.addBusiness(obj, { fields: businessAdd }, Object.assign(Object.assign({}, context), { ephemeral: { session } }), info);
                        const { node } = utils_1.getSrcCollectionAndNode(db, graphTypes_1.JournalEntrySourceType.Business, nodeMap);
                        updateBuilder.updateField("source", {
                            node,
                            id: new mongodb_1.ObjectId(id),
                        });
                    }
                    else if (personAdd) {
                        const { id } = yield person_1.addPerson(obj, { fields: personAdd }, Object.assign(Object.assign({}, context), { ephemeral: { session } }), info);
                        const { node } = utils_1.getSrcCollectionAndNode(db, graphTypes_1.JournalEntrySourceType.Person, nodeMap);
                        updateBuilder.updateField("source", {
                            node,
                            id: new mongodb_1.ObjectId(id),
                        });
                    }
                    else if (source) {
                        const { id: sourceId, sourceType } = source;
                        const { collection, node } = utils_1.getSrcCollectionAndNode(db, sourceType, nodeMap);
                        const id = new mongodb_1.ObjectId(sourceId);
                        if (0 ===
                            (yield collection.countDocuments({ _id: id }, { session }))) {
                            throw new Error(`Source type "${sourceType}" with id "${sourceId}" does not exist.`);
                        }
                        updateBuilder.updateField("source", {
                            node,
                            id,
                        });
                    }
                }))(),
                // Payment Method
                (() => __awaiter(void 0, void 0, void 0, function* () {
                    if (paymentMethodAdd) {
                        // Ensure other checks finish before creating payment method
                        // Add payment method
                        const { id } = yield paymentMethodAdd_1.default(obj, { fields: paymentMethodAdd }, Object.assign(Object.assign({}, context), { ephemeral: Object.assign(Object.assign({}, (context.ephemeral || {})), { docHistoryDate: docHistory.date, session }) }), info);
                        const { id: node } = nodeMap.typename.get("PaymentMethod");
                        updateBuilder.updateField("paymentMethod", {
                            node: new mongodb_1.ObjectId(node),
                            id: new mongodb_1.ObjectId(id),
                        });
                    }
                    else if (paymentMethodUpdate) {
                        // Ensure other checks finish before updating payment method
                        const id = new mongodb_1.ObjectId(paymentMethodUpdate.id);
                        // Update payment method
                        yield paymentMethodUpdate_1.default(obj, {
                            id: paymentMethodUpdate.id,
                            fields: paymentMethodUpdate.fields,
                        }, Object.assign(Object.assign({}, context), { ephemeral: Object.assign(Object.assign({}, (context.ephemeral || {})), { docHistoryDate: docHistory.date, session }) }), info);
                        const { id: node } = nodeMap.typename.get("PaymentMethod");
                        updateBuilder.updateField("paymentMethod", {
                            node: new mongodb_1.ObjectId(node),
                            id,
                        });
                    }
                    else if (paymentMethodId) {
                        const id = new mongodb_1.ObjectId(paymentMethodId);
                        const { collection, id: node } = nodeMap.typename.get("PaymentMethod");
                        if (0 ===
                            (yield db
                                .collection(collection)
                                .countDocuments({ _id: id }, { session }))) {
                            throw new Error(`Payment method with id "${paymentMethodId}" does not exist.`);
                        }
                        updateBuilder.updateField("paymentMethod", {
                            node: new mongodb_1.ObjectId(node),
                            id,
                        });
                    }
                }))(),
            ]).then((results) => {
                const errorMsgs = results.reduce((errorMsgs, result) => {
                    if (result.status === "rejected") {
                        errorMsgs.push(result.reason instanceof Error
                            ? result.reason.message
                            : `${result.reason}`);
                    }
                    return errorMsgs;
                }, []);
                if (errorMsgs.length > 0) {
                    return Promise.reject(new Error(errorMsgs.join("\n")));
                }
            });
            if (!updateBuilder.hasUpdate) {
                const keys = (() => {
                    const obj = {
                        date: null,
                        dateOfRecord: null,
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
            const updateFilter = filterQuery.filterQuery();
            const { modifiedCount, matchedCount } = yield db
                .collection("journalEntries")
                .updateOne(updateFilter, Object.assign({}, updateBuilder.update()), { session });
            if (matchedCount === 0) {
                const reasons = yield filterQuery.explainFailed(db.collection("journalEntries"));
                if (reasons.length > 0) {
                    throw new Error(reasons.map((e) => e.message).join("\n"));
                }
                else {
                    throw new Error(`Unknown Failure.  Failed to update entry: "${JSON.stringify(args)}".`);
                }
            }
            if (modifiedCount === 0) {
                throw new Error(`Failed to update entry: "${JSON.stringify(args)}".`);
            }
            const [updatedDoc] = yield db
                .collection("journalEntries")
                .aggregate([
                { $match: { _id: entryId } },
                utils_1.stages.entryAddFields,
                utils_1.stages.entryTransmutations,
            ], { session })
                .toArray();
            resolver.next(updatedDoc);
        }));
    }
    catch (e) {
        resolver.throw(e);
    }
    finally {
        resolver.next();
        session.endSession();
    }
}));
exports.default = journalEntryUpdate;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiam91cm5hbEVudHJ5VXBkYXRlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL3Jlc29sdmVycy9qb3VybmFsRW50cnkvam91cm5hbEVudHJ5VXBkYXRlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7O0FBQUEscUNBQW1DO0FBRW5DLHVDQUFtQztBQUVuQyxpREFPMEI7QUFDMUIsd0VBQXlFO0FBQ3pFLDhFQUErRTtBQUMvRSxvREFBNkM7QUFDN0MsZ0RBQWlEO0FBQ2pELG1DQUEwRDtBQUMxRCx1Q0FBMEU7QUFDMUUsMENBQTBDO0FBQzFDLHNDQUFzQztBQUN0QyxtREFBMEQ7QUFDMUQseURBQXdFO0FBQ3hFLDZEQUltQztBQUNuQyxvRUFBNkQ7QUFFN0QsTUFBTSxPQUFPLEdBQUcsTUFBTSxFQUFFLENBQUM7QUFFekIsTUFBTSxPQUFPLEdBQUc7SUFDZCxVQUFVLG9CQUNMLG9CQUFVLENBQUMsZ0JBQWdCLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUN6QztDQUNPLENBQUM7QUFFWCxNQUFNLGtCQUFrQixHQUE0QyxDQUNsRSxHQUFHLEVBQ0gsSUFBSSxFQUNKLE9BQU8sRUFDUCxJQUFJLEVBQ0osRUFBRSxDQUNGLElBQUksT0FBTyxDQUFDLENBQU8sT0FBTyxFQUFFLE1BQU0sRUFBRSxFQUFFOztJQUNwQyxNQUFNLEVBQUUsTUFBTSxFQUFFLEVBQUUsRUFBRSxPQUFPLEVBQUUsSUFBSSxFQUFFLE1BQU0sRUFBRSxHQUFHLE9BQU8sQ0FBQztJQUV0RCxNQUFNLE9BQU8sR0FBRyxPQUFBLE9BQU8sQ0FBQyxTQUFTLDBDQUFFLE9BQU8sS0FBSSxNQUFNLENBQUMsWUFBWSxFQUFFLENBQUM7SUFFcEUsTUFBTSxRQUFRLEdBQUcsMkJBQWEsQ0FBbUIsUUFBUSxDQUFDO1FBQ3hELElBQUk7WUFDRiwrREFBK0Q7WUFDL0QsTUFBTSxVQUFVLEdBQUcsS0FBSyxDQUFDO1lBQ3pCLEtBQUssQ0FBQyxDQUFDLFFB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