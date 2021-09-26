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
            case "date":
                if (!("$and" in exports.fiscalYears)) {
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
                if (!("$and" in exports.fiscalYears)) {
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
const fiscalYears = (_, { where }, { db }) => {
    const query = where ? (0, exports.whereFiscalYear)(where) : {};
    return db.collection("fiscalYears").find(query).toArray();
};
exports.fiscalYears = fiscalYears;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZmlzY2FsWWVhcnMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvcmVzb2x2ZXJzL2Zpc2NhbFllYXIvZmlzY2FsWWVhcnMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBR0EseURBQThFO0FBRTlFLG9EQUEwRDtBQUVuRCxNQUFNLGVBQWUsR0FBRyxDQUM3QixlQUFpQyxFQUNYLEVBQUU7SUFDeEIsTUFBTSxXQUFXLEdBQXlCLEVBQUUsQ0FBQztJQUU3QyxLQUFLLE1BQU0sUUFBUSxJQUFJLElBQUEsNEJBQWMsRUFBQyxlQUFlLENBQUMsRUFBRTtRQUN0RCxRQUFRLFFBQVEsRUFBRTtZQUNoQixLQUFLLElBQUk7Z0JBQ1AsV0FBVyxDQUFDLEtBQUssQ0FBQyxHQUFHLElBQUEsb0JBQU8sRUFBQyxlQUFlLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQztnQkFDeEQsTUFBTTtZQUNSLEtBQUssTUFBTTtnQkFDVCxXQUFXLENBQUMsTUFBTSxDQUFDLEdBQUcsSUFBQSx1QkFBVSxFQUFDLGVBQWUsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDO2dCQUM1RCxNQUFNO1lBQ1IsS0FBSyxNQUFNO2dCQUNULElBQUksQ0FBQyxDQUFDLE1BQU0sSUFBSSxtQkFBVyxDQUFDLEVBQUU7b0JBQzVCLFdBQVcsQ0FBQyxJQUFJLEdBQUcsRUFBRSxDQUFDO2lCQUN2QjtnQkFFRCxLQUFLLE1BQU0sQ0FBQyxPQUFPLEVBQUUsSUFBSSxDQUFDLElBQUksSUFBQSxpQ0FBbUIsRUFDL0MsZUFBZSxDQUFDLFFBQVEsQ0FBQyxDQUMxQixFQUFFO29CQUNELFFBQVEsT0FBTyxFQUFFO3dCQUNmLEtBQUssSUFBSTs0QkFDUCxXQUFXLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQztnQ0FDcEIsS0FBSyxFQUFFLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRTtnQ0FDckIsR0FBRyxFQUFFLEVBQUUsR0FBRyxFQUFFLElBQUksRUFBRTs2QkFDbkIsQ0FBQyxD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