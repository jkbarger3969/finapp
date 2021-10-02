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
exports.accounts = exports.whereAccounts = void 0;
const iterableFns_1 = require("../../utils/iterableFns");
const entity_1 = require("../entity");
const gqlEnums_1 = require("../utils/gqlEnums");
const queryUtils_1 = require("../utils/queryUtils");
const accountCards_1 = require("./accountCards");
const whereAccounts = (accountsWhere, db) => {
    const filterQuery = {};
    const promises = [];
    for (const whereKey of (0, iterableFns_1.iterateOwnKeys)(accountsWhere)) {
        switch (whereKey) {
            case "id":
                filterQuery["_id"] = (0, queryUtils_1.whereId)(accountsWhere[whereKey]);
                break;
            case "accountNumber":
                filterQuery["accountNumber"] = (0, queryUtils_1.whereRegex)(accountsWhere[whereKey]);
                break;
            case "accountType":
                filterQuery["accountType"] = (0, gqlEnums_1.serializeGQLEnum)(accountsWhere[whereKey]);
                break;
            case "active":
                filterQuery["active"] = accountsWhere[whereKey];
                break;
            case "cards":
                promises.push((() => __awaiter(void 0, void 0, void 0, function* () {
                    const result = (0, accountCards_1.whereAccountCards)(accountsWhere[whereKey], db);
                    const query = result instanceof Promise ? yield result : result;
                    const results = (yield db
                        .collection("paymentCards")
                        .find(query)
                        .toArray()).map(({ _id }) => _id);
                    if (results.length) {
                        filterQuery["cards"] = { $elemMatch: { $in: results } };
                    }
                }))());
                break;
            case "name":
                filterQuery["name"] = (0, queryUtils_1.whereRegex)(accountsWhere[whereKey]);
                break;
            case "owner":
                promises.push((() => __awaiter(void 0, void 0, void 0, function* () {
                    const { businesses, departments, people } = yield (0, entity_1.whereEntities)(accountsWhere[whereKey], db);
                    if (businesses) {
                        if (!("$or" in filterQuery)) {
                            filterQuery.$or = [];
                        }
                        filterQuery.$or.push({
                            "owner.type": "Business",
                            "owner.id": { $in: businesses },
                        });
                    }
                    if (departments) {
                        if (!("$or" in filterQuery)) {
                            filterQuery.$or = [];
                        }
                        filterQuery.$or.push({
                            "owner.type": "Department",
                            "owner.id": { $in: departments },
                        });
                    }
                    if (people) {
                        if (!("$or" in filterQuery)) {
                            filterQuery.$or = [];
                        }
                        filterQuery.$or.push({
                            "owner.type": "Person",
                            "owner.id": { $in: people },
                        });
                    }
                }))());
                break;
            case "and":
                {
                    if (!("$and" in filterQuery)) {
                        filterQuery.$and = [];
                    }
                    const $and = filterQuery.$and;
                    for (const where of accountsWhere[whereKey]) {
                        const result = (0, exports.whereAccounts)(where, db);
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
                    for (const where of accountsWhere[whereKey]) {
                        const result = (0, exports.whereAccounts)(where, db);
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
                    for (const where of accountsWhere[whereKey]) {
                        const result = (0, exports.whereAccounts)(where, db);
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
exports.whereAccounts = whereAccounts;
const accounts = (_, { where }, { db }) => {
    const query = where ? (0, exports.whereAccounts)(where, db) : {};
    if (query instanceof Promise) {
        return query.then((query) => db.collection("accounts").find(query).toArray());
    }
    return db.collection("accounts").find(query).toArray();
};
exports.accounts = accounts;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYWNjb3VudHMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvcmVzb2x2ZXJzL2FjY291bnQvYWNjb3VudHMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7O0FBR0EseURBQXlEO0FBQ3pELHNDQUEwQztBQUMxQyxnREFBcUQ7QUFDckQsb0RBQTBEO0FBQzFELGlEQUFtRDtBQUU1QyxNQUFNLGFBQWEsR0FBRyxDQUFDLGFBQTRCLEVBQUUsRUFBTSxFQUFFLEVBQUU7SUFDcEUsTUFBTSxXQUFXLEdBQXlCLEVBQUUsQ0FBQztJQUU3QyxNQUFNLFFBQVEsR0FBb0IsRUFBRSxDQUFDO0lBRXJDLEtBQUssTUFBTSxRQUFRLElBQUksSUFBQSw0QkFBYyxFQUFDLGFBQWEsQ0FBQyxFQUFFO1FBQ3BELFFBQVEsUUFBUSxFQUFFO1lBQ2hCLEtBQUssSUFBSTtnQkFDUCxXQUFXLENBQUMsS0FBSyxDQUFDLEdBQUcsSUFBQSxvQkFBTyxFQUFDLGFBQWEsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDO2dCQUN0RCxNQUFNO1lBQ1IsS0FBSyxlQUFlO2dCQUNsQixXQUFXLENBQUMsZUFBZSxDQUFDLEdBQUcsSUFBQSx1QkFBVSxFQUFDLGFBQWEsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDO2dCQUNuRSxNQUFNO1lBQ1IsS0FBSyxhQUFhO2dCQUNoQixXQUFXLENBQUMsYUFBYSxDQUFDLEdBQUcsSUFBQSwyQkFBZ0IsRUFBQyxhQUFhLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQztnQkFDdkUsTUFBTTtZQUNSLEtBQUssUUFBUTtnQkFDWCxXQUFXLENBQUMsUUFBUSxDQUFDLEdBQUcsYUFBYSxDQUFDLFFBQVEsQ0FBQyxDQUFDO2dCQUNoRCxNQUFNO1lBQ1IsS0FBSyxPQUFPO2dCQUNWLFFBQVEsQ0FBQyxJQUFJLENBQ1gsQ0FBQyxHQUFTLEVBQUU7b0JBQ1YsTUFBTSxNQUFNLEdBQUcsSUFBQSxnQ0FBaUIsRUFBQyxhQUFhLENB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