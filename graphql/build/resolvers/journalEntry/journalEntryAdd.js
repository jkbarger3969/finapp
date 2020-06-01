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
const journalEntryAdd = (obj, args, context, info) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    const { fields: { date: dateString, department: departmentId, type, category: categoryId, source, total: totalR, }, paymentMethodAdd, businessAdd, personAdd, } = args;
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
    const reconciled = (_a = args.fields.reconciled, (_a !== null && _a !== void 0 ? _a : false));
    const description = (_b = args.fields.description, (_b !== null && _b !== void 0 ? _b : "")).trim();
    const { db, user, nodeMap, pubSub } = context;
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
    // Insure doc refs exist and finish insert doc
    const asyncOps = [
        // Department
        (() => __awaiter(void 0, void 0, void 0, function* () {
            const { collection, id: node } = nodeMap.typename.get("Department");
            const id = new mongodb_1.ObjectID(departmentId);
            if (!(yield db
                .collection(collection)
                .findOne({ _id: id }, { projection: { _id: true } }))) {
                throw new Error(`Department with id ${departmentId} does not exist.`);
            }
            docBuilder.addField("department", {
                node: new mongodb_1.ObjectID(node),
                id,
            });
        }))(),
        // Category
        (() => __awaiter(void 0, void 0, void 0, function* () {
            const { collection, id: node } = nodeMap.typename.get("JournalEntryCategory");
            const id = new mongodb_1.ObjectID(categoryId);
            if (!(yield db
                .collection(collection)
                .findOne({ _id: id }, { projection: { _id: true } }))) {
                throw new Error(`Category with id ${categoryId} does not exist.`);
            }
            docBuilder.addField("category", { node: new mongodb_1.ObjectID(node), id });
        }))(),
    ];
    // PaymentMethod
    if (paymentMethodAdd) {
        // Do NOT create new payment method until all other checks pass
        asyncOps.push(Promise.all(asyncOps.splice(0)).then(() => __awaiter(void 0, void 0, void 0, function* () {
            const { id: node } = nodeMap.typename.get("PaymentMethod");
            const id = new mongodb_1.ObjectID(yield paymentMethodAdd_1.default(obj, { fields: paymentMethodAdd }, Object.assign(Object.assign({}, context), { ephemeral: Object.assign(Object.assign({}, (context.ephemeral || {})), { docHistoryDate: docHistory.date }) }), info).then(({ id }) => id));
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
    // Source
    if (businessAdd) {
        // Do NOT create a new business until all other checks pass
        asyncOps.push(Promise.all(asyncOps.splice(0)).then(() => __awaiter(void 0, void 0, void 0, function* () {
            const { node } = utils_1.getSrcCollectionAndNode(db, graphTypes_1.JournalEntrySourceType.Business, nodeMap);
            const { id } = yield business_1.addBusiness(obj, { fields: businessAdd }, context, info);
            docBuilder.addField("source", {
                node,
                id: new mongodb_1.ObjectID(id),
            });
        })));
    }
    else if (personAdd) {
        // Do NOT create a new person until all other checks pass
        asyncOps.push(Promise.all(asyncOps.splice(0)).then(() => __awaiter(void 0, void 0, void 0, function* () {
            const { node } = utils_1.getSrcCollectionAndNode(db, graphTypes_1.JournalEntrySourceType.Person, nodeMap);
            const { id } = yield person_1.addPerson(obj, { fields: personAdd }, context, info);
            docBuilder.addField("source", {
                node,
                id: new mongodb_1.ObjectID(id),
            });
        })));
    }
    else {
        asyncOps.push((() => __awaiter(void 0, void 0, void 0, function* () {
            const { sourceType, id: sourceId } = source;
            const { collection, node } = utils_1.getSrcCollectionAndNode(db, sourceType, nodeMap);
            const id = new mongodb_1.ObjectID(sourceId);
            if (!(yield collection.findOne({ _id: id }, { projection: { _id: true } }))) {
                throw new Error(`Source type "${sourceType}" with id ${sourceId} does not exist.`);
            }
            docBuilder.addField("source", {
                node,
                id,
            });
        }))());
    }
    yield Promise.all(asyncOps);
    const { insertedId, insertedCount } = yield db
        .collection("journalEntries")
        .insertOne(docBuilder.doc());
    if (insertedCount === 0) {
        throw new Error(`Failed to add journal entry: ${JSON.stringify(args, null, 2)}`);
    }
    const [newEntry] = yield db
        .collection("journalEntries")
        .aggregate([
        { $match: { _id: insertedId } },
        utils_1.stages.entryAddFields,
        utils_1.stages.entryTransmutations,
    ])
        .toArray();
    pubSub
        .publish(pubSubs_1.JOURNAL_ENTRY_ADDED, { journalEntryAdded: newEntry })
        .catch((error) => console.error(error));
    pubSub
        .publish(pubSubs_1.JOURNAL_ENTRY_UPSERTED, { journalEntryUpserted: newEntry })
        .catch((error) => console.error(error));
    return newEntry;
});
exports.default = journalEntryAdd;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiam91cm5hbEVudHJ5QWRkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL3Jlc29sdmVycy9qb3VybmFsRW50cnkvam91cm5hbEVudHJ5QWRkLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7O0FBQUEscUNBQW1DO0FBQ25DLGlDQUFpQztBQUVqQyxpREFNMEI7QUFDMUIsd0VBQXlFO0FBQ3pFLG9EQUE2QztBQUM3QyxnREFBaUQ7QUFDakQsbUNBQTBEO0FBQzFELHVDQUF3RTtBQUN4RSwwQ0FBMEM7QUFDMUMsc0NBQXNDO0FBQ3RDLG1EQUEwRDtBQUUxRCxNQUFNLGVBQWUsR0FBeUMsQ0FDNUQsR0FBRyxFQUNILElBQUksRUFDSixPQUFPLEVBQ1AsSUFBSSxFQUNKLEVBQUU7O0lBQ0YsTUFBTSxFQUNKLE1BQU0sRUFBRSxFQUNOLElBQUksRUFBRSxVQUFVLEVBQ2hCLFVBQVUsRUFBRSxZQUFZLEVBQ3hCLElBQUksRUFDSixRQUFRLEVBQUUsVUFBVSxFQUNwQixNQUFNLEVBQ04sS0FBSyxFQUFFLE1BQU0sR0FDZCxFQUNELGdCQUFnQixFQUNoQixXQUFXLEVBQ1gsU0FBUyxHQUNWLEdBQUcsSUFBSSxDQUFDO0lBRVQsTUFBTSxLQUFLLEdBQUcsNkJBQWtCLENBQUMsTUFBTSxDQUFDLENBQUM7SUFFekMsZ0VBQWdFO0lBQ2hFLHNCQUFzQjtJQUN0QixJQUFJLFdBQVcsSUFBSSxTQUFTLEVBQUU7UUFDNUIsTUFBTSxJQUFJLEtBQUssQ0FDYixpRkFBaUYsQ0FDbEYsQ0FBQztLQUNIO0lBRUQsSUFBSSxNQUFNLENBQUMsQ0FBQyxLQUFLLHlCQUFZLENBQUMsR0FBRyxJQUFJLEtBQUssQ0FBQyxDQUFDLEtBQUssQ0FBQyxFQUFFO1FBQ2xELE1BQU0sSUFBSSxLQUFLLENBQUMscUNBQXFDLENBQUMsQ0FBQztLQUN4RDtJQUVELE1BQU0sSUFBSSxHQUFHLE1BQU0sQ0FBQyxVQUFVLEVBQUUsTUFBTSxDQUFDLFFBQVEs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