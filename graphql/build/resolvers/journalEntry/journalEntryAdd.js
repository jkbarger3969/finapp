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
const journalEntryAdd = (obj, args, context, info) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    const { fields: { date: dateString, department: departmentId, type, category: categoryId, source, total, }, paymentMethodAdd, businessAdd, personAdd, } = args;
    // "businessAdd" and "personAdd" are mutually exclusive, gql has
    // no concept of this.
    if (businessAdd && personAdd) {
        throw new Error(`"businessAdd" and "personAdd" are mutually exclusive source creation arguments.`);
    }
    const totalDecimal = total.num / total.den;
    if (totalDecimal <= 0) {
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiam91cm5hbEVudHJ5QWRkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL3Jlc29sdmVycy9qb3VybmFsRW50cnkvam91cm5hbEVudHJ5QWRkLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7O0FBQUEscUNBQW1DO0FBQ25DLGlDQUFpQztBQUVqQyxpREFLMEI7QUFDMUIsd0VBQXlFO0FBQ3pFLG9EQUE2QztBQUM3QyxnREFBaUQ7QUFDakQsbUNBQTBEO0FBQzFELHVDQUF3RTtBQUN4RSwwQ0FBMEM7QUFDMUMsc0NBQXNDO0FBRXRDLE1BQU0sZUFBZSxHQUF5QyxDQUM1RCxHQUFHLEVBQ0gsSUFBSSxFQUNKLE9BQU8sRUFDUCxJQUFJLEVBQ0osRUFBRTs7SUFDRixNQUFNLEVBQ0osTUFBTSxFQUFFLEVBQ04sSUFBSSxFQUFFLFVBQVUsRUFDaEIsVUFBVSxFQUFFLFlBQVksRUFDeEIsSUFBSSxFQUNKLFFBQVEsRUFBRSxVQUFVLEVBQ3BCLE1BQU0sRUFDTixLQUFLLEdBQ04sRUFDRCxnQkFBZ0IsRUFDaEIsV0FBVyxFQUNYLFNBQVMsR0FDVixHQUFHLElBQUksQ0FBQztJQUVULGdFQUFnRTtJQUNoRSxzQkFBc0I7SUFDdEIsSUFBSSxXQUFXLElBQUksU0FBUyxFQUFFO1FBQzVCLE1BQU0sSUFBSSxLQUFLLENBQ2IsaUZBQWlGLENBQ2xGLENBQUM7S0FDSDtJQUVELE1BQU0sWUFBWSxHQUFHLEtBQUssQ0FBQyxHQUFHLEdBQUcsS0FBSyxDQUFDLEdBQUcsQ0FBQztJQUUzQyxJQUFJLFlBQVksSUFBSSxDQUFDLEVBQUU7UUFDckIsTUFBTSxJQUFJLEtBQUssQ0FBQyxxQ0FBcUMsQ0FBQyxDQUFDO0tBQ3hEO0lBRUQsTUFBTSxJQUFJLEdBQUcsTUFBTSxDQUFDLFVBQVUsRUFBRSxNQUFNLENBQUMsUUFBUSxDQUFDLENBQUM7SUFDakQsSUFBSSxDQUFDLElBQUksQ0FBQyxPQUFPLEVBQUUsRUFBRTtRQUNuQixNQUFN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