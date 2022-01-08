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
exports.accountCards = exports.whereAccountCards = void 0;
const change_case_1 = require("change-case");
const iterableFns_1 = require("../../utils/iterableFns");
const queryUtils_1 = require("../utils/queryUtils");
const entity_1 = require("../entity");
const accounts_1 = require("./accounts");
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
                    const result = (0, accounts_1.whereAccounts)(accountCardsWhere[whereKey], db);
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
            : { account: { $exists: true } },
    });
});
exports.accountCards = accountCards;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYWNjb3VudENhcmRzLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL3Jlc29sdmVycy9hY2NvdW50L2FjY291bnRDYXJkcy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7QUFDQSw2Q0FBeUM7QUFHekMseURBQXlEO0FBQ3pELG9EQUEwRDtBQUMxRCxzQ0FBMEM7QUFDMUMseUNBQTJDO0FBRXBDLE1BQU0saUJBQWlCLEdBQUcsQ0FDL0IsaUJBQW9DLEVBQ3BDLEVBQU0sRUFDTixFQUFFO0lBQ0YsTUFBTSxXQUFXLEdBQXFCO1FBQ3BDLElBQUksRUFBRSxDQUFDLEVBQUUsT0FBTyxFQUFFLEVBQUUsT0FBTyxFQUFFLElBQUksRUFBRSxFQUFFLENBQUM7S0FDdkMsQ0FBQztJQUVGLE1BQU0sUUFBUSxHQUFvQixFQUFFLENBQUM7SUFFckMsS0FBSyxNQUFNLFFBQVEsSUFBSSxJQUFBLDRCQUFjLEVBQUMsaUJBQWlCLENBQUMsRUFBRTtRQUN4RCxRQUFRLFFBQVEsRUFBRTtZQUNoQixLQUFLLElBQUk7Z0JBQ1AsV0FBVyxDQUFDLEtBQUssQ0FBQyxHQUFHLElBQUEsb0JBQU8sRUFBQyxpQkFBaUIsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDO2dCQUMxRCxNQUFNO1lBQ1IsS0FBSyxTQUFTO2dCQUNaLFFBQVEsQ0FBQyxJQUFJLENBQ1gsQ0FBQyxHQUFTLEVBQUU7b0JBQ1YsTUFBTSxNQUFNLEdBQUcsSUFBQSx3QkFBYSxFQUFDLGlCQUFpQixDQUFDLFFBQVEsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDO29CQUU5RCxNQUFNLE9BQU8sR0FBRyxDQUNkLE1BQU0sRUFBRTt5QkFDTCxVQUFVLENBQUMsVUFBVSxDQUFDO3lCQUN0QixJQUFJLENBQ0gsTUFBTSxZQUFZLE9BQU8sQ0FBQyxDQUFDLENBQUMsTUFBTSxNQUFNLENBQUMsQ0FBQyxDQUFDLE1BQU0sRUFDakQ7d0JBQ0UsVUFBVSxFQUFFOzRCQUNWLEdBQUcs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