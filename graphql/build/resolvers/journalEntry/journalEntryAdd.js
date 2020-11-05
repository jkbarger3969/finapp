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
const moment = require("moment");
const graphTypes_1 = require("../../graphTypes");
const paymentMethodAdd_1 = require("../paymentMethod/paymentMethodAdd");
const DocHistory_1 = require("../utils/DocHistory");
const standIns_1 = require("../utils/standIns");
const utils_1 = require("./utils");
const pubSubs_1 = require("./pubSubs");
const business_1 = require("../business");
const person_1 = require("../person");
const rational_1 = require("../../utils/rational");
const iterableFns_1 = require("../../utils/iterableFns");
const date_fns_1 = require("date-fns");
const journalEntryAdd = (obj, args, context, info) => new Promise((resolve, reject) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const { client, db, nodeMap, user, pubSub } = context;
    const session = ((_a = context.ephemeral) === null || _a === void 0 ? void 0 : _a.session) || client.startSession();
    const resolver = iterableFns_1.generatorInit(function* () {
        try {
            // generatorInit calls 1st next. On 2nd next capture update doc
            const newEntry = yield;
            yield; // Pause
            // on 3rd next resolve with the update doc and run pubSubs
            resolve(newEntry);
            pubSub
                .publish(pubSubs_1.JOURNAL_ENTRY_ADDED, { journalEntryAdded: newEntry })
                .catch((error) => console.error(error));
            pubSub
                .publish(pubSubs_1.JOURNAL_ENTRY_UPSERTED, { journalEntryUpserted: newEntry })
                .catch((error) => console.error(error));
        }
        catch (error) {
            // on throw reject with error.
            reject(error);
        }
    });
    try {
        yield session.withTransaction(() => __awaiter(void 0, void 0, void 0, function* () {
            var _b, _c;
            const { fields: { date: dateString, dateOfRecord, department: departmentId, type, category: categoryId, source, total: totalR, }, paymentMethodAdd, businessAdd, personAdd, } = args;
            const total = rational_1.rationalToFraction(totalR);
            // "businessAdd" and "personAdd" are mutually exclusive, gql has
            // no concept of this.
            if (businessAdd && personAdd) {
                throw new Error(`"businessAdd" and "personAdd" are mutually exclusive source creation arguments.`);
            }
            if (totalR.s === graphTypes_1.RationalSign.Neg || total.n === 0) {
                throw new Error("Entry total must be greater than 0.");
            }
            const date = moment(dateString, moment.ISO_8601);
            if (!date.isValid()) {
                throw new Error(`Date "${dateString}" not a valid ISO 8601 date string.`);
            }
            const reconciled = (_b = args.fields.reconciled) !== null && _b !== void 0 ? _b : false;
            const description = ((_c = args.fields.description) !== null && _c !== void 0 ? _c : "").trim();
            const docHistory = new DocHistory_1.default({ node: standIns_1.userNodeType, id: user.id });
            //Start building insert doc
            const docBuilder = docHistory
                .newHistoricalDoc(true)
                .addField("date", date.toDate())
                .addField("total", total)
                .addField("type", type === graphTypes_1.JournalEntryType.Credit ? "credit" : "debit")
                .addField("deleted", false)
                .addField("reconciled", reconciled);
            if (description) {
                docBuilder.addField("description", description);
            }
            if (dateOfRecord) {
                const date = new Date(dateOfRecord.date);
                if (!date_fns_1.isValid(date)) {
                    throw new Error(`Date of record "${dateOfRecord.date}" not a valid ISO 8601 date string.`);
                }
                docBuilder.addNonHistoricalFieldValue("dateOfRecord", docHistory
                    .newHistoricalDoc(false)
                    .addField("date", date)
                    .addField("overrideFiscalYear", dateOfRecord.overrideFiscalYear)
                    .doc());
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
                        docBuilder.addField("department", {
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
                        if (catType !== type) {
                            throw new Error(`Category with id "${categoryId}" and type "${catType}" is incompatible with entry type "${type}".`);
                        }
                        docBuilder.addField("category", { node: new mongodb_1.ObjectId(node), id });
                    }
                }))(),
                // Source
                (() => __awaiter(void 0, void 0, void 0, function* () {
                    if (businessAdd) {
                        const { id } = yield business_1.addBusiness(obj, { fields: businessAdd }, Object.assign(Object.assign({}, context), { ephemeral: { session } }), info);
                        const { node } = utils_1.getSrcCollectionAndNode(db, graphTypes_1.JournalEntrySourceType.Business, nodeMap);
                        docBuilder.addField("source", {
                            node,
                            id: new mongodb_1.ObjectId(id),
                        });
                    }
                    else if (personAdd) {
                        const { id } = yield person_1.addPerson(obj, { fields: personAdd }, Object.assign(Object.assign({}, context), { ephemeral: { session } }), info);
                        const { node } = utils_1.getSrcCollectionAndNode(db, graphTypes_1.JournalEntrySourceType.Person, nodeMap);
                        docBuilder.addField("source", {
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
                        docBuilder.addField("source", {
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
                        docBuilder.addField("paymentMethod", {
                            node: new mongodb_1.ObjectId(node),
                            id,
                        });
                    }
                    else {
                        const id = new mongodb_1.ObjectId(args.fields.paymentMethod);
                        const { collection, id: node } = nodeMap.typename.get("PaymentMethod");
                        if (0 ===
                            (yield db
                                .collection(collection)
                                .countDocuments({ _id: id }, { session }))) {
                            throw new Error(`Payment method with id "${args.fields.paymentMethod}" does not exist.`);
                        }
                        docBuilder.addField("paymentMethod", {
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
            const { insertedId, insertedCount } = yield db
                .collection("journalEntries")
                .insertOne(docBuilder.doc(), { session });
            if (insertedCount === 0) {
                throw new Error(`Failed to add journal entry: ${JSON.stringify(args, null, 2)}`);
            }
            const [newEntry] = yield db
                .collection("journalEntries")
                .aggregate([
                { $match: { _id: insertedId } },
                utils_1.stages.entryAddFields,
                utils_1.stages.entryTransmutations,
            ], { session })
                .toArray();
            resolver.next(newEntry);
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
exports.default = journalEntryAdd;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiam91cm5hbEVudHJ5QWRkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL3Jlc29sdmVycy9qb3VybmFsRW50cnkvam91cm5hbEVudHJ5QWRkLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7O0FBQUEscUNBQW1DO0FBQ25DLGlDQUFpQztBQUVqQyxpREFLMEI7QUFDMUIsd0VBQXlFO0FBQ3pFLG9EQUE2QztBQUM3QyxnREFBaUQ7QUFDakQsbUNBQXFFO0FBQ3JFLHVDQUF3RTtBQUN4RSwwQ0FBMEM7QUFDMUMsc0NBQXNDO0FBQ3RDLG1EQUEwRDtBQUMxRCx5REFBd0Q7QUFDeEQsdUNBQW1DO0FBRW5DLE1BQU0sZUFBZSxHQUF5QyxDQUM1RCxHQUFHLEVBQ0gsSUFBSSxFQUNKLE9BQU8sRUFDUCxJQUFJLEVBQ0osRUFBRSxDQUNGLElBQUksT0FBTyxDQUFDLENBQU8sT0FBTyxFQUFFLE1BQU0sRUFBRSxFQUFFOztJQUNwQyxNQUFNLEVBQUUsTUFBTSxFQUFFLEVBQUUsRUFBRSxPQUFPLEVBQUUsSUFBSSxFQUFFLE1BQU0sRUFBRSxHQUFHLE9BQU8sQ0FBQztJQUV0RCxNQUFNLE9BQU8sR0FBRyxPQUFBLE9BQU8sQ0FBQyxTQUFTLDBDQUFFLE9BQU8sS0FBSSxNQUFNLENBQUMsWUFBWSxFQUFFLENBQUM7SUFFcEUsTUFBTSxRQUFRLEdBQUcsMkJBQWEsQ0FBbUIsUUFBUSxDQUFDO1FBQ3hELElBQUk7WUFDRiwrREFBK0Q7WUFDL0QsTUFBTSxRQUFRLEdBQUcsS0FBSyxDQUFDO1lBQ3ZCLEtBQUssQ0FBQyxDQUFDLFFBQVE7WUFDZiwwREFBMEQ7WUFDMUQsT0FBTyxDQUFDLFFBQVEsQ0FBQyxDQUFDO1lBQ2xCLE1BQU07aUJBQ0gsT0FBTyxDQUFDLDZCQUFtQixFQUFFLEVBQUUsaUJBQWlCLEVBQUUsUUFBUSxFQUFFLENBQUM7aUJBQzdELEtBQUssQ0FBQyxDQUFDLEtBQUssRUFBRSxFQUFFLENBQUMsT0FBTyxD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