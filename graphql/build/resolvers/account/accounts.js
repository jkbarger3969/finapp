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
                filterQuery["accountType"] = (0, gqlEnums_1.deserializeGQLEnum)(accountsWhere[whereKey]);
                break;
            case "active":
                filterQuery["active"] = accountsWhere[whereKey];
                break;
            case "cards":
                promises.push((() => __awaiter(void 0, void 0, void 0, function* () {
                    // eslint-disable-next-line @typescript-eslint/no-var-requires
                    const { whereAccountCards } = require("./accountCards");
                    const result = whereAccountCards(accountsWhere[whereKey], db);
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
const accounts = (_, { where }, { db, dataSources: { accountingDb } }) => __awaiter(void 0, void 0, void 0, function* () {
    return accountingDb.find({
        collection: "accounts",
        filter: where ? yield (0, exports.whereAccounts)(where, db) : {},
    });
});
exports.accounts = accounts;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYWNjb3VudHMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvcmVzb2x2ZXJzL2FjY291bnQvYWNjb3VudHMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7O0FBR0EseURBQXlEO0FBQ3pELHNDQUEwQztBQUMxQyxnREFBdUQ7QUFDdkQsb0RBQTBEO0FBR25ELE1BQU0sYUFBYSxHQUFHLENBQUMsYUFBNEIsRUFBRSxFQUFNLEVBQUUsRUFBRTtJQUNwRSxNQUFNLFdBQVcsR0FBcUIsRUFBRSxDQUFDO0lBRXpDLE1BQU0sUUFBUSxHQUFvQixFQUFFLENBQUM7SUFFckMsS0FBSyxNQUFNLFFBQVEsSUFBSSxJQUFBLDRCQUFjLEVBQUMsYUFBYSxDQUFDLEVBQUU7UUFDcEQsUUFBUSxRQUFRLEVBQUU7WUFDaEIsS0FBSyxJQUFJO2dCQUNQLFdBQVcsQ0FBQyxLQUFLLENBQUMsR0FBRyxJQUFBLG9CQUFPLEVBQUMsYUFBYSxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUM7Z0JBQ3RELE1BQU07WUFDUixLQUFLLGVBQWU7Z0JBQ2xCLFdBQVcsQ0FBQyxlQUFlLENBQUMsR0FBRyxJQUFBLHVCQUFVLEVBQUMsYUFBYSxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUM7Z0JBQ25FLE1BQU07WUFDUixLQUFLLGFBQWE7Z0JBQ2hCLFdBQVcsQ0FBQyxhQUFhLENBQUMsR0FBRyxJQUFBLDZCQUFrQixFQUM3QyxhQUFhLENBQUMsUUFBUSxDQUFDLENBQ3hCLENBQUM7Z0JBQ0YsTUFBTTtZQUNSLEtBQUssUUFBUTtnQkFDWCxXQUFXLENBQUMsUUFBUSxDQUFDLEdBQUcsYUFBYSxDQUFDLFFBQVEsQ0FBQyxDQUFDO2dCQUNoRCxNQUFNO1lBQ1IsS0FBSyxPQUFPO2dCQUNWLFFBQVEsQ0FBQyxJQUFJLENBQ1gsQ0FBQyxHQUFTLEVBQUU7b0JBQ1YsOERBQThEO29CQUM5RCxNQUFNLEVBQUUsaUJBQWlCLEVBQUUsR0FBRyxPQUFPLENBQUMs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