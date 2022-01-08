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
exports.budgets = exports.whereBudgets = void 0;
const iterableFns_1 = require("../../utils/iterableFns");
const fiscalYear_1 = require("../fiscalYear");
const queryUtils_1 = require("../utils/queryUtils");
const whereBudgets = (budgetWhere, db) => {
    const filterQuery = {};
    const promises = [];
    for (const whereKey of (0, iterableFns_1.iterateOwnKeys)(budgetWhere)) {
        switch (whereKey) {
            case "id":
                filterQuery["_id"] = (0, queryUtils_1.whereId)(budgetWhere[whereKey]);
                break;
            case "amount":
                {
                    const $and = (0, queryUtils_1.whereRational)("$amount", budgetWhere[whereKey]);
                    if ("$and" in filterQuery) {
                        filterQuery.$and.push(...$and);
                    }
                    else {
                        filterQuery.$and = $and;
                    }
                }
                break;
            case "owner":
                if (!("$and" in filterQuery)) {
                    filterQuery.$and = [];
                }
                filterQuery.$and.push(...(0, queryUtils_1.whereNode)(budgetWhere[whereKey], "owner"));
                break;
            case "fiscalYear":
                promises.push((() => __awaiter(void 0, void 0, void 0, function* () {
                    const query = (0, fiscalYear_1.whereFiscalYear)(budgetWhere[whereKey]);
                    const $in = (yield db
                        .collection("fiscalYears")
                        .find(query, {
                        projection: {
                            _id: true,
                        },
                    })
                        .toArray()).map(({ _id }) => _id);
                    filterQuery["fiscalYear"] = { $in };
                }))());
                break;
            case "and":
                {
                    let hasPromise = false;
                    const $and = budgetWhere[whereKey].map((where) => {
                        const result = (0, exports.whereBudgets)(where, db);
                        if (result instanceof Promise) {
                            hasPromise = true;
                        }
                        return result;
                    });
                    if (hasPromise) {
                        promises.push(Promise.all($and).then(($and) => {
                            if ("$and" in filterQuery) {
                                filterQuery.$and.push(...$and);
                            }
                            else {
                                filterQuery.$and = $and;
                            }
                        }));
                    }
                    else {
                        if ("$and" in filterQuery) {
                            filterQuery.$and.push(...$and);
                        }
                        else {
                            filterQuery.$and = $and;
                        }
                    }
                }
                break;
            case "or":
                {
                    let hasPromise = false;
                    const $or = budgetWhere[whereKey].map((where) => {
                        const result = (0, exports.whereBudgets)(where, db);
                        if (result instanceof Promise) {
                            hasPromise = true;
                        }
                        return result;
                    });
                    if (hasPromise) {
                        promises.push(Promise.all($or).then(($or) => {
                            if ("$or" in filterQuery) {
                                filterQuery.$or.push(...$or);
                            }
                            else {
                                filterQuery.$or = $or;
                            }
                        }));
                    }
                    else {
                        if ("$or" in filterQuery) {
                            filterQuery.$or.push(...$or);
                        }
                        else {
                            filterQuery.$or = $or;
                        }
                    }
                }
                break;
            case "nor":
                {
                    let hasPromise = false;
                    const $nor = budgetWhere[whereKey].map((where) => {
                        const result = (0, exports.whereBudgets)(where, db);
                        if (result instanceof Promise) {
                            hasPromise = true;
                        }
                        return result;
                    });
                    if (hasPromise) {
                        promises.push(Promise.all($nor).then(($nor) => {
                            if ("$nor" in filterQuery) {
                                filterQuery.$nor.push(...$nor);
                            }
                            else {
                                filterQuery.$nor = $nor;
                            }
                        }));
                    }
                    else {
                        if ("$nor" in filterQuery) {
                            filterQuery.$nor.push(...$nor);
                        }
                        else {
                            filterQuery.$nor = $nor;
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
exports.whereBudgets = whereBudgets;
const budgets = (_, { where }, { dataSources: { accountingDb } }) => __awaiter(void 0, void 0, void 0, function* () {
    return accountingDb.find({
        collection: "budgets",
        filter: where ? yield (0, exports.whereBudgets)(where, accountingDb.db) : {},
    });
});
exports.budgets = budgets;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYnVkZ2V0cy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9yZXNvbHZlcnMvYnVkZ2V0L2J1ZGdldHMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7O0FBR0EseURBQXlEO0FBQ3pELDhDQUFnRDtBQUNoRCxvREFBd0U7QUFFakUsTUFBTSxZQUFZLEdBQUcsQ0FDMUIsV0FBeUIsRUFDekIsRUFBTSxFQUNnRCxFQUFFO0lBQ3hELE1BQU0sV0FBVyxHQUFxQixFQUFFLENBQUM7SUFFekMsTUFBTSxRQUFRLEdBQW9CLEVBQUUsQ0FBQztJQUVyQyxLQUFLLE1BQU0sUUFBUSxJQUFJLElBQUEsNEJBQWMsRUFBQyxXQUFXLENBQUMsRUFBRTtRQUNsRCxRQUFRLFFBQVEsRUFBRTtZQUNoQixLQUFLLElBQUk7Z0JBQ1AsV0FBVyxDQUFDLEtBQUssQ0FBQyxHQUFHLElBQUEsb0JBQU8sRUFBQyxXQUFXLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQztnQkFDcEQsTUFBTTtZQUNSLEtBQUssUUFBUTtnQkFDWDtvQkFDRSxNQUFNLElBQUksR0FBRyxJQUFBLDBCQUFhLEVBQUMsU0FBUyxFQUFFLFdBQVcsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDO29CQUU3RCxJQUFJLE1BQU0sSUFBSSxXQUFXLEVBQUU7d0JBQ3pCLFdBQVcsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLEdBQUcsSUFBSSxDQUFDLENBQUM7cUJBQ2hDO3lCQUFNO3dCQUNMLFdBQVcsQ0FBQyxJQUFJLEdBQUcsSUFBSSxDQUFDO3FCQUN6QjtpQkFDRjtnQkFDRCxNQUFNO1lBQ1IsS0FBSyxPQUFPO2dCQUNWLElBQUksQ0FBQyxDQUFDLE1BQU0sSUFBSSxXQUFXLENBQUMsRUFBRTtvQkFDNUIsV0FBVyxDQUFDLElBQUksR0FBRyxFQUFFLENBQUM7aUJBQ3ZCO2dCQUNELFdBQVcsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLEdBQUcsSUFBQSxzQkFBUyxFQUFDLFdBQVcsQ0FBQyxRQUFRLENBQUMsRUFBRSxPQUFPLENBQUMsQ0FBQyxDQUFDO2dCQUVwRSxNQUFNO1lBQ1IsS0FBSyxZQUFZO2dCQUNmLFFBQVEsQ0FBQyxJQUFJLENBQ1gsQ0FBQyxHQUFTLEVBQUU7b0JBQ1YsTUFBTSxLQUFLLEdBQUcsSUFBQSw0QkFBZSxFQUFDLFdBQVcsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDO29CQUVyRCxNQUFNLEdBQUcsR0FBRyxDQUNWLE1BQU0sRUFBRTt5QkFDTCxVQUFVLENBQW9CLGFBQWEsQ0FBQzt5QkFDNUMsSUFBSSxDQUFDLEtBQUssRUFBRTt3QkFDWCxVQUFVLEVBQUU7NEJBQ1YsR0FBRyxFQUFFLElBQUk7eUJBQ1Y7cUJBQ0YsQ0FBQzt5QkFDRCxPQUFPLEVBQUUsQ0FDYixDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQUUsR0FBRyxFQUFFLEVBQUUsRUFBRSxDQUFDLEdBQUcsQ0FBQyxDQUFDO29CQUV4QixXQUFXLENBQUMsWUFBWSxDQUFDLEdBQUcsRUFBRSxHQUFHLEVBQUUsQ0FBQztnQkFDdEMsQ0FBQyxDQUFBLENBQUMsRUFBRSxDQUNMLENBQUM7Z0JBRUYsTUFBTTtZQUNSLEtBQUssS0FBSztnQkFDUjtvQkFDRSxJQUFJLFVBQVUsR0FBRyxLQUFLLENBQUM7b0JBQ3ZCLE1BQU0sSUFBSSxHQUNSLFdBQVcsQ0FBQyxRQUFRLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxLQUFLLEVBQUUsRUFBRTt3QkFDbEMsTUFBTSxNQUFNLEdBQUcsSUFBQSxvQkFBWSxFQUFDLEtBQUssRUFBRSxFQUFFLENBQUMsQ0FBQzt3QkFDdkMsSUFBSSxNQUFNLFlBQVksT0FBTyxFQUFFOzRCQUM3QixVQUFVLEdBQUcsSUFBSSxDQUFDO3lCQUNuQjt3QkFDRCxPQUFPLE1BQU0sQ0FBQztvQkFDaEIsQ0FBQyxDQUFDLENBQUM7b0JBRUwsSUFBSSxVQUFVLEVBQUU7d0JBQ2QsUUFBUSxDQUFDLElBQUksQ0FDWCxPQUFPLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLElBQUksRUFBRSxFQUFFOzRCQUM5QixJQUFJLE1BQU0sSUFBSSxXQUFXLEVBQUU7Z0NBQ3pCLFdBQVcsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLEdBQUcsSUFBSSxDQUFDLENBQUM7NkJBQ2hDO2lDQUFNO2dDQUNMLFdBQVcsQ0FBQyxJQUFJLEdBQUcsSUFBSSxDQUFDOzZCQUN6Qjt3QkFDSCxDQUFDLENBQUMsQ0FDSCxDQUFDO3FCQUNIO3lCQUFNO3dCQUNMLElBQUksTUFBTSxJQUFJLFdBQVcsRUFBRTs0QkFDekIsV0FBVyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsR0FBSSxJQUErQixDQUFDLENBQUM7eUJBQzVEOzZCQUFNOzRCQUNMLFdBQVcsQ0FBQyxJQUFJLEdBQUcsSUFBOEIsQ0FBQzt5QkFDbkQ7cUJBQ0Y7aUJBQ0Y7Z0JBQ0QsTUFBTTtZQUNSLEtBQUssSUFBSTtnQkFDUDtvQkFDRSxJQUFJLFVBQVUsR0FBRyxLQUFLLENBQUM7b0JBQ3ZCLE1BQU0sR0FBRyxHQUNQLFdBQVcsQ0FBQyxRQUFRLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxLQUFLLEVBQUUsRUFBRTt3QkFDbEMsTUFBTSxNQUFNLEdBQUcsSUFBQSxvQkFBWSxFQUFDLEtBQUssRUFBRSxFQUFFLENBQUMsQ0FBQzt3QkFDdkMsSUFBSSxNQUFNLFlBQVksT0FBTyxFQUFFOzRCQUM3QixVQUFVLEdBQUcsSUFBSSxDQUFDO3lCQUNuQjt3QkFDRCxPQUFPLE1BQU0sQ0FBQztvQkFDaEIsQ0FBQyxDQUFDLENBQUM7b0JBRUwsSUFBSSxVQUFVLEVBQUU7d0JBQ2QsUUFBUSxDQUFDLElBQUksQ0FDWCxPQUFPLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLEdBQUcsRUFBRSxFQUFFOzRCQUM1QixJQUFJLEtBQUssSUFBSSxXQUFXLEVBQUU7Z0NBQ3hCLFdBQVcsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLEdBQUcsR0FBRyxDQUFDLENBQUM7NkJBQzlCO2lDQUFNO2dDQUNMLFdBQVcsQ0FBQyxHQUFHLEdBQUcsR0FBRyxDQUFDOzZCQUN2Qjt3QkFDSCxDQUFDLENBQUMsQ0FDSCxDQUFDO3FCQUNIO3lCQUFNO3dCQUNMLElBQUksS0FBSyxJQUFJLFdBQVcsRUFBRTs0QkFDeEIsV0FBVyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsR0FBSSxHQUE4QixDQUFDLENBQUM7eUJBQzFEOzZCQUFNOzRCQUNMLFdBQVcsQ0FBQyxHQUFHLEdBQUcsR0FBNkIsQ0FBQzt5QkFDakQ7cUJBQ0Y7aUJBQ0Y7Z0JBQ0QsTUFBTTtZQUNSLEtBQUssS0FBSztnQkFDUjtvQkFDRSxJQUFJLFVBQVUsR0FBRyxLQUFLLENBQUM7b0JBQ3ZCLE1BQU0sSUFBSSxHQUNSLFdBQVcsQ0FBQyxRQUFRLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxLQUFLLEVBQUUsRUFBRTt3QkFDbEMsTUFBTSxNQUFNLEdBQUcsSUFBQSxvQkFBWSxFQUFDLEtBQUssRUFBRSxFQUFFLENBQUMsQ0FBQzt3QkFDdkMsSUFBSSxNQUFNLFlBQVksT0FBTyxFQUFFOzRCQUM3QixVQUFVLEdBQUcsSUFBSSxDQUFDO3lCQUNuQjt3QkFDRCxPQUFPLE1BQU0sQ0FBQztvQkFDaEIsQ0FBQyxDQUFDLENBQUM7b0JBRUwsSUFBSSxVQUFVLEVBQUU7d0JBQ2QsUUFBUSxDQUFDLElBQUksQ0FDWCxPQUFPLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLElBQUksRUFBRSxFQUFFOzRCQUM5QixJQUFJLE1BQU0sSUFBSSxXQUFXLEVBQUU7Z0NBQ3pCLFdBQVcsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLEdBQUcsSUFBSSxDQUFDLENBQUM7NkJBQ2hDO2lDQUFNO2dDQUNMLFdBQVcsQ0FBQyxJQUFJLEdBQUcsSUFBSSxDQUFDOzZCQUN6Qjt3QkFDSCxDQUFDLENBQUMsQ0FDSCxDQUFDO3FCQUNIO3lCQUFNO3dCQUNMLElBQUksTUFBTSxJQUFJLFdBQVcsRUFBRTs0QkFDekIsV0FBVyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsR0FBSSxJQUErQixDQUFDLENBQUM7eUJBQzVEOzZCQUFNOzRCQUNMLFdBQVcsQ0FBQyxJQUFJLEdBQUcsSUFBOEIsQ0FBQzt5QkFDbkQ7cUJBQ0Y7aUJBQ0Y7Z0JBQ0QsTUFBTTtTQUNUO0tBQ0Y7SUFFRCxJQUFJLFFBQVEsQ0FBQyxNQUFNLEVBQUU7UUFDbkIsT0FBTyxPQUFPLENBQUMsR0FBRyxDQUFDLFFBQVEsQ0FBQyxDQUFDLElBQUksQ0FBQyxHQUFHLEVBQUUsQ0FBQyxXQUFXLENBQUMsQ0FBQztLQUN0RDtJQUVELE9BQU8sV0FBVyxDQUFDO0FBQ3JCLENBQUMsQ0FBQztBQXpKVyxRQUFBLFlBQVksZ0JBeUp2QjtBQUVLLE1BQU0sT0FBTyxHQUE4QixDQUNoRCxDQUFDLEVBQ0QsRUFBRSxLQUFLLEVBQUUsRUFDVCxFQUFFLFdBQVcsRUFBRSxFQUFFLFlBQVksRUFBRSxFQUFFLEVBQ2pDLEVBQUU7SUFDRixPQUFBLFlBQVksQ0FBQyxJQUFJLENBQUM7UUFDaEIsVUFBVSxFQUFFLFNBQVM7UUFDckIsTUFBTSxFQUFFLEtBQUssQ0FBQyxDQUFDLENBQUMsTUFBTSxJQUFBLG9CQUFZLEVBQUMsS0FBSyxFQUFFLFlBQVksQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRTtLQUNoRSxDQUFDLENBQUE7RUFBQSxDQUFDO0FBUlEsUUFBQSxPQUFPLFdBUWYifQ==