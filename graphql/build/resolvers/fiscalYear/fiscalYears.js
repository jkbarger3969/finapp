"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.fiscalYears = exports.whereFiscalYear = void 0;
const iterableFns_1 = require("../../utils/iterableFns");
const queryUtils_1 = require("../utils/queryUtils");
const whereFiscalYear = (fiscalYearWhere) => {
    const filterQuery = {};
    for (const whereKey of (0, iterableFns_1.iterateOwnKeys)(fiscalYearWhere)) {
        switch (whereKey) {
            case "id":
                filterQuery["_id"] = (0, queryUtils_1.whereId)(fiscalYearWhere[whereKey]);
                break;
            case "name":
                filterQuery["name"] = (0, queryUtils_1.whereRegex)(fiscalYearWhere[whereKey]);
                break;
            case "archived":
                if (fiscalYearWhere[whereKey] === true) {
                    filterQuery["archived"] = true;
                }
                else if (fiscalYearWhere[whereKey] === false) {
                    filterQuery["$or"] = [
                        { archived: { $exists: false } },
                        { archived: false }
                    ];
                }
                break;
            case "date":
                if (!("$and" in filterQuery)) {
                    filterQuery.$and = [];
                }
                for (const [dateKey, date] of (0, iterableFns_1.iterateOwnKeyValues)(fiscalYearWhere[whereKey])) {
                    switch (dateKey) {
                        case "eq":
                            filterQuery.$and.push({
                                begin: { $lte: date },
                                end: { $gt: date },
                            });
                            break;
                        case "ne":
                            filterQuery.$and.push({
                                $or: [{ begin: { $gt: date } }, { end: { $lte: date } }],
                            });
                            break;
                        case "gt":
                            filterQuery.$and.push({
                                begin: { $gt: date },
                            });
                            break;
                        case "gte":
                            filterQuery.$and.push({
                                end: { $gt: date },
                            });
                            break;
                        case "lt":
                            filterQuery.$and.push({
                                end: { $lte: date },
                            });
                            break;
                        case "lte":
                            filterQuery.$and.push({
                                begin: { $lte: date },
                            });
                            break;
                    }
                }
                break;
            case "and":
                if (!("$and" in filterQuery)) {
                    filterQuery.$and = [];
                }
                filterQuery.$and.push(...fiscalYearWhere[whereKey].map((where) => (0, exports.whereFiscalYear)(where)));
                break;
            case "or":
                filterQuery.$or = fiscalYearWhere[whereKey].map((where) => (0, exports.whereFiscalYear)(where));
                break;
            case "nor":
                filterQuery.$nor = fiscalYearWhere[whereKey].map((where) => (0, exports.whereFiscalYear)(where));
                break;
        }
    }
    return filterQuery;
};
exports.whereFiscalYear = whereFiscalYear;
const fiscalYears = (_, { where }, { dataSources: { accountingDb } }) => accountingDb.find({
    collection: "fiscalYears",
    filter: where ? (0, exports.whereFiscalYear)(where) : {},
});
exports.fiscalYears = fiscalYears;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZmlzY2FsWWVhcnMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvcmVzb2x2ZXJzL2Zpc2NhbFllYXIvZmlzY2FsWWVhcnMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBR0EseURBQThFO0FBRTlFLG9EQUEwRDtBQUVuRCxNQUFNLGVBQWUsR0FBRyxDQUM3QixlQUFpQyxFQUNYLEVBQUU7SUFDeEIsTUFBTSxXQUFXLEdBQXFCLEVBQUUsQ0FBQztJQUV6QyxLQUFLLE1BQU0sUUFBUSxJQUFJLElBQUEsNEJBQWMsRUFBQyxlQUFlLENBQUMsRUFBRTtRQUN0RCxRQUFRLFFBQVEsRUFBRTtZQUNoQixLQUFLLElBQUk7Z0JBQ1AsV0FBVyxDQUFDLEtBQUssQ0FBQyxHQUFHLElBQUEsb0JBQU8sRUFBQyxlQUFlLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQztnQkFDeEQsTUFBTTtZQUNSLEtBQUssTUFBTTtnQkFDVCxXQUFXLENBQUMsTUFBTSxDQUFDLEdBQUcsSUFBQSx1QkFBVSxFQUFDLGVBQWUsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDO2dCQUM1RCxNQUFNO1lBQ1IsS0FBSyxVQUFVO2dCQUNiLElBQUksZUFBZSxDQUFDLFFBQVEsQ0FBQyxLQUFLLElBQUksRUFBRTtvQkFDdEMsV0FBVyxDQUFDLFVBQVUsQ0FBQyxHQUFHLElBQUksQ0FBQztpQkFDaEM7cUJBQU0sSUFBSSxlQUFlLENBQUMsUUFBUSxDQUFDLEtBQUssS0FBSyxFQUFFO29CQUM5QyxXQUFXLENBQUMsS0FBSyxDQUFDLEdBQUc7d0JBQ25CLEVBQUUsUUFBUSxFQUFFLEVBQUUsT0FBTyxFQUFFLEtBQUssRUFBRSxFQUFFO3dCQUNoQyxFQUFFLFFBQVEsRUFBRSxLQUFLLEVBQUU7cUJBQ3BCLENBQUM7aUJBQ0g7Z0JBQ0QsTUFBTTtZQUNSLEtBQUssTUFBTTtnQkFDVCxJQUFJLENBQUMsQ0FBQyxNQUFNLElBQUksV0FBVyxDQUFDLEVBQUU7b0JBQzVCLFdB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