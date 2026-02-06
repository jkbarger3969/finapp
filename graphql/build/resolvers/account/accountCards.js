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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteAccountCard = exports.updateAccountCard = exports.createAccountCard = exports.accountCards = exports.whereAccountCards = void 0;
const mongodb_1 = require("mongodb");
const change_case_1 = require("change-case");
const iterableFns_1 = require("../../utils/iterableFns");
const queryUtils_1 = require("../utils/queryUtils");
const entity_1 = require("../entity");
const whereAccountCards = (accountCardsWhere, db) => {
    const filterQuery = {
        $and: [{ account: { $exists: true } }],
    };
    const promises = [];
    for (const whereKey of (0, iterableFns_1.iterateOwnKeys)(accountCardsWhere)) {
        switch (whereKey) {
            case "id":
                filterQuery["_id"] = (0, queryUtils_1.whereId)(accountCardsWhere[whereKey]);
                break;
            case "account":
                promises.push((() => __awaiter(void 0, void 0, void 0, function* () {
                    // eslint-disable-next-line @typescript-eslint/no-var-requires
                    const { whereAccounts } = require("./accounts");
                    const result = whereAccounts(accountCardsWhere[whereKey], db);
                    const results = (yield db
                        .collection("accounts")
                        .find(result instanceof Promise ? yield result : result, {
                        projection: {
                            _id: true,
                        },
                    })
                        .toArray()).map(({ _id }) => _id);
                    if (results.length) {
                        filterQuery["account"] = {
                            $in: results,
                        };
                    }
                }))());
                break;
            case "active":
                filterQuery["active"] = accountCardsWhere[whereKey];
                break;
            case "authorizedUsers":
                promises.push((() => __awaiter(void 0, void 0, void 0, function* () {
                    const { businesses, departments, people } = yield (0, entity_1.whereEntities)(accountCardsWhere[whereKey], db);
                    if (businesses) {
                        if (!("$or" in filterQuery)) {
                            filterQuery.$or = [];
                        }
                        filterQuery.$or.push({
                            "authorizedUsers.type": "Business",
                            "authorizedUsers.id": { $in: businesses },
                        });
                    }
                    if (departments) {
                        if (!("$or" in filterQuery)) {
                            filterQuery.$or = [];
                        }
                        filterQuery.$or.push({
                            "authorizedUsers.type": "Department",
                            "authorizedUsers.id": { $in: departments },
                        });
                    }
                    if (people) {
                        if (!("$or" in filterQuery)) {
                            filterQuery.$or = [];
                        }
                        filterQuery.$or.push({
                            "authorizedUsers.type": "Person",
                            "authorizedUsers.id": { $in: people },
                        });
                    }
                }))());
                break;
            case "trailingDigits":
                filterQuery["trailingDigits"] = (0, queryUtils_1.whereRegex)(accountCardsWhere[whereKey]);
                break;
            case "type":
                filterQuery["type"] = (0, change_case_1.pascalCase)(accountCardsWhere[whereKey]);
                break;
            case "and":
                {
                    if (!("$and" in filterQuery)) {
                        filterQuery.$and = [];
                    }
                    const $and = filterQuery.$and;
                    for (const where of accountCardsWhere[whereKey]) {
                        const result = (0, exports.whereAccountCards)(where, db);
                        if (result instanceof Promise) {
                            promises.push(result.then((result) => {
                                $and.push(result);
                            }));
                        }
                        else {
                            $and.push(result);
                        }
                    }
                }
                break;
            case "or":
                {
                    if (!("$or" in filterQuery)) {
                        filterQuery.$or = [];
                    }
                    const $or = filterQuery.$or;
                    for (const where of accountCardsWhere[whereKey]) {
                        const result = (0, exports.whereAccountCards)(where, db);
                        if (result instanceof Promise) {
                            promises.push(result.then((result) => {
                                $or.push(result);
                            }));
                        }
                        else {
                            $or.push(result);
                        }
                    }
                }
                break;
            case "nor":
                {
                    if (!("$nor" in filterQuery)) {
                        filterQuery.$nor = [];
                    }
                    const $nor = filterQuery.$nor;
                    for (const where of accountCardsWhere[whereKey]) {
                        const result = (0, exports.whereAccountCards)(where, db);
                        if (result instanceof Promise) {
                            promises.push(result.then((result) => {
                                $nor.push(result);
                            }));
                        }
                        else {
                            $nor.push(result);
                        }
                    }
                }
                break;
        }
    }
    if (promises.length) {
        return Promise.all(promises).then(() => filterQuery);
    }
    return filterQuery;
};
exports.whereAccountCards = whereAccountCards;
const accountCards = (_, { where }, { dataSources: { accountingDb } }) => __awaiter(void 0, void 0, void 0, function* () {
    return accountingDb.find({
        collection: "paymentCards",
        filter: where
            ? yield (0, exports.whereAccountCards)(where, accountingDb.db)
            : {},
    });
});
exports.accountCards = accountCards;
const createAccountCard = (_, { input }, { dataSources: { accountingDb } }) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    console.log("createAccountCard input:", JSON.stringify(input, null, 2));
    const { accountId } = input, rest = __rest(input, ["accountId"]);
    try {
        const result = yield accountingDb.insertOne({
            collection: "paymentCards",
            doc: Object.assign(Object.assign({ account: new mongodb_1.ObjectId(accountId) }, rest), { active: (_a = input.active) !== null && _a !== void 0 ? _a : true }),
        });
        console.log("createAccountCard result:", result);
        // Fetch and return the created document to match AccountCard type
        const created = yield accountingDb.findOne({
            collection: "paymentCards",
            filter: { _id: result.insertedId },
        });
        console.log("createAccountCard created doc:", created);
        return created;
    }
    catch (e) {
        console.error("createAccountCard ERROR:", e);
        throw e;
    }
});
exports.createAccountCard = createAccountCard;
const updateAccountCard = (_, { id, input }, { dataSources: { accountingDb } }) => __awaiter(void 0, void 0, void 0, function* () {
    console.log("updateAccountCard id:", id, "input:", input);
    yield accountingDb.updateOne({
        collection: "paymentCards",
        filter: { _id: new mongodb_1.ObjectId(id) },
        update: {
            $set: input,
        },
    });
    return accountingDb.findOne({
        collection: "paymentCards",
        filter: { _id: new mongodb_1.ObjectId(id) },
    });
});
exports.updateAccountCard = updateAccountCard;
const deleteAccountCard = (_, { id }, { dataSources: { accountingDb } }) => __awaiter(void 0, void 0, void 0, function* () {
    console.log("deleteAccountCard id:", id);
    try {
        yield accountingDb.updateOne({
            collection: "paymentCards",
            filter: { _id: new mongodb_1.ObjectId(id) },
            update: {
                $set: { active: false },
            },
        });
        return true;
    }
    catch (e) {
        console.error("deleteAccountCard ERROR:", e);
        throw e;
    }
});
exports.deleteAccountCard = deleteAccountCard;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYWNjb3VudENhcmRzLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL3Jlc29sdmVycy9hY2NvdW50L2FjY291bnRDYXJkcy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUFBLHFDQUE4RDtBQUM5RCw2Q0FBeUM7QUFHekMseURBQXlEO0FBQ3pELG9EQUEwRDtBQUMxRCxzQ0FBMEM7QUFFbkMsTUFBTSxpQkFBaUIsR0FBRyxDQUMvQixpQkFBb0MsRUFDcEMsRUFBTSxFQUNOLEVBQUU7SUFDRixNQUFNLFdBQVcsR0FBcUI7UUFDcEMsSUFBSSxFQUFFLENBQUMsRUFBRSxPQUFPLEVBQUUsRUFBRSxPQUFPLEVBQUUsSUFBSSxFQUFFLEVBQUUsQ0FBQztLQUN2QyxDQUFDO0lBRUYsTUFBTSxRQUFRLEdBQW9CLEVBQUUsQ0FBQztJQUVyQyxLQUFLLE1BQU0sUUFBUSxJQUFJLElBQUEsNEJBQWMsRUFBQyxpQkFBaUIsQ0FBQyxFQUFFO1FBQ3hELFFBQVEsUUFBUSxFQUFFO1lBQ2hCLEtBQUssSUFBSTtnQkFDUCxXQUFXLENBQUMsS0FBSyxDQUFDLEdBQUcsSUFBQSxvQkFBTyxFQUFDLGlCQUFpQixDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUM7Z0JBQzFELE1BQU07WUFDUixLQUFLLFNBQVM7Z0JBQ1osUUFBUSxDQUFDLElBQUksQ0FDWCxDQUFDLEdBQVMsRUFBRTtvQkFDViw4REFBOEQ7b0JBQzlELE1BQU0sRUFBRSxhQUFhLEVBQUUsR0FBRyxPQUFPLENBQUMsWUFBWSxDQUFDLENBQUM7b0JBQ2hELE1BQU0sTUFBTSxHQUFHLGFBQWEsQ0FBQyxpQkFBaUIsQ0FBQyxRQUFRLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQztvQkFHOUQsTUFBTSxPQUFPLEdBQUcsQ0FDZCxNQUFNLEVBQUU7eUJBQ0wsVUFBVSxDQUFDLFVBQVUsQ0FBQzt5QkFDdEIsSUFBSSxDQUNILE1BQU0sWUFBWSxPQUFPLENB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