"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.aliases = void 0;
const change_case_1 = require("change-case");
const iterableFns_1 = require("../../utils/iterableFns");
const queryUtils_1 = require("../utils/queryUtils");
const whereAliases = (aliasesWhere) => {
    const filterQuery = {};
    for (const whereKey of (0, iterableFns_1.iterateOwnKeys)(aliasesWhere)) {
        switch (whereKey) {
            case "id":
                filterQuery["_id"] = (0, queryUtils_1.whereId)(aliasesWhere[whereKey]);
                break;
            case "target":
                {
                    const $and = (0, queryUtils_1.whereNode)(aliasesWhere[whereKey], "target");
                    if (!("$and" in filterQuery)) {
                        filterQuery.$and = [];
                    }
                    filterQuery.$and.push(...$and);
                }
                break;
            case "name":
                filterQuery["name"] = (0, queryUtils_1.whereRegex)(aliasesWhere[whereKey]);
                break;
            case "type":
                filterQuery["type"] = (0, change_case_1.pascalCase)(aliasesWhere[whereKey]);
                break;
            case "and":
                if (!("$and" in filterQuery)) {
                    filterQuery.$and = [];
                }
                filterQuery.$and.push(...aliasesWhere[whereKey].map((where) => whereAliases(where)));
                break;
            case "or":
                if (!("$or" in filterQuery)) {
                    filterQuery.$or = [];
                }
                filterQuery.$or.push(...aliasesWhere[whereKey].map((where) => whereAliases(where)));
                break;
            case "nor":
                if (!("$nor" in filterQuery)) {
                    filterQuery.$nor = [];
                }
                filterQuery.$nor.push(...aliasesWhere[whereKey].map((where) => whereAliases(where)));
                break;
        }
    }
    return filterQuery;
};
const aliases = (_, { where }, { db }) => {
    const query = where ? whereAliases(where) : {};
    return db.collection("aliases").find(query).toArray();
};
exports.aliases = aliases;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYWxpYXNlcy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9yZXNvbHZlcnMvYWxpYXMvYWxpYXNlcy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFDQSw2Q0FBeUM7QUFHekMseURBQXlEO0FBQ3pELG9EQUFxRTtBQUVyRSxNQUFNLFlBQVksR0FBRyxDQUFDLFlBQTBCLEVBQXdCLEVBQUU7SUFDeEUsTUFBTSxXQUFXLEdBQXlCLEVBQUUsQ0FBQztJQUU3QyxLQUFLLE1BQU0sUUFBUSxJQUFJLElBQUEsNEJBQWMsRUFBQyxZQUFZLENBQUMsRUFBRTtRQUNuRCxRQUFRLFFBQVEsRUFBRTtZQUNoQixLQUFLLElBQUk7Z0JBQ1AsV0FBVyxDQUFDLEtBQUssQ0FBQyxHQUFHLElBQUEsb0JBQU8sRUFBQyxZQUFZLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQztnQkFDckQsTUFBTTtZQUNSLEtBQUssUUFBUTtnQkFDWDtvQkFDRSxNQUFNLElBQUksR0FBRyxJQUFBLHNCQUFTLEVBQUMsWUFBWSxDQUFDLFFBQVEsQ0FBQyxFQUFFLFFBQVEsQ0FBQyxDQUFDO29CQUV6RCxJQUFJLENBQUMsQ0FBQyxNQUFNLElBQUksV0FBVyxDQUFDLEVBQUU7d0JBQzVCLFdBQVcsQ0FBQyxJQUFJLEdBQUcsRUFBRSxDQUFDO3FCQUN2QjtvQkFFRCxXQUFXLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxHQUFHLElBQUksQ0FBQyxDQUFDO2lCQUNoQztnQkFFRCxNQUFNO1lBQ1IsS0FBSyxNQUFNO2dCQUNULFdBQVcsQ0FBQyxNQUFNLENBQUMsR0FBRyxJQUFBLHVCQUFVLEVBQUMsWUFBWSxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUM7Z0JBQ3pELE1BQU07WUFDUixLQUFLLE1BQU07Z0JBQ1QsV0FBVyxDQUFDLE1BQU0sQ0FBQyxHQUFHLElBQUEsd0JBQVUsRUFBQyxZQUFZLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQztnQkFDekQsTUFBTTtZQUNSLEtBQUssS0FBSztnQkFDUixJQUFJLENBQUMsQ0FBQyxNQUFNLElBQUksV0FBVyxDQUFDLEVBQUU7b0JBQzVCLFdBQVcsQ0FBQyxJQUFJLEdBQUcsRUFBRSxDQUFDO2lCQUN2QjtnQkFFRCxXQUFXLENBQUMsSUFBSSxDQUFDLElBQUksQ0FDbkIsR0FBRyxZQUFZLENBQUMsUUFBUSxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsS0FBSyxFQUFFLEVBQUUsQ0FBQyxZQUFZLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FDOUQsQ0FBQztnQkFFRixNQUFNO1lBQ1IsS0FBSyxJQUFJO2dCQUNQLElBQUksQ0FBQyxDQUFDLEtBQUssSUFBSSxXQUFXLENBQUMsRUFBRTtvQkFDM0IsV0FBVyxDQUFDLEdBQUcsR0FBRyxFQUFFLENBQUM7aUJBQ3RCO2dCQUVELFdBQVcsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUNsQixHQUFHLFlBQVksQ0FBQyxRQUFRLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxLQUFLLEVBQUUsRUFBRSxDQUFDLFlBQVksQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUM5RCxDQUFDO2dCQUVGLE1BQU07WUFDUixLQUFLLEtBQUs7Z0JBQ1IsSUFBSSxDQUFDLENBQUMsTUFBTSxJQUFJLFdBQVcsQ0FBQyxFQUFFO29CQUM1QixXQUFXLENBQUMsSUFBSSxHQUFHLEVBQUUsQ0FBQztpQkFDdkI7Z0JBRUQsV0FBVyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQ25CLEdBQUcsWUFBWSxDQUFDLFFBQVEsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEtBQUssRUFBRSxFQUFFLENBQUMsWUFBWSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQzlELENBQUM7Z0JBRUYsTUFBTTtTQUNUO0tBQ0Y7SUFFRCxPQUFPLFdBQVcsQ0FBQztBQUNyQixDQUFDLENBQUM7QUFFSyxNQUFNLE9BQU8sR0FBOEIsQ0FBQyxDQUFDLEVBQUUsRUFBRSxLQUFLLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUU7SUFDekUsTUFBTSxLQUFLLEdBQUcsS0FBSyxDQUFDLENBQUMsQ0FBQyxZQUFZLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQztJQUUvQyxPQUFPLEVBQUUsQ0FBQyxVQUFVLENBQUMsU0FBUyxDQUFDLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLE9BQU8sRUFBRSxDQUFDO0FBQ3hELENBQUMsQ0FBQztBQUpXLFFBQUEsT0FBTyxXQUlsQiJ9