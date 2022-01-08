"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.people = exports.wherePeople = void 0;
const iterableFns_1 = require("../../utils/iterableFns");
const queryUtils_1 = require("../utils/queryUtils");
const wherePeople = (peopleWhere) => {
    const filterQuery = {};
    for (const whereKey of (0, iterableFns_1.iterateOwnKeys)(peopleWhere)) {
        switch (whereKey) {
            case "id":
                filterQuery["_id"] = (0, queryUtils_1.whereId)(peopleWhere[whereKey]);
                break;
            case "name":
                for (const name of (0, iterableFns_1.iterateOwnKeys)(peopleWhere[whereKey])) {
                    switch (name) {
                        case "first":
                            filterQuery["name.first"] = (0, queryUtils_1.whereRegex)(peopleWhere[whereKey][name]);
                            break;
                        case "last":
                            filterQuery["name.last"] = (0, queryUtils_1.whereRegex)(peopleWhere[whereKey][name]);
                            break;
                    }
                }
                break;
            case "and":
                filterQuery.$and = peopleWhere[whereKey].map((where) => (0, exports.wherePeople)(where));
                break;
            case "or":
                filterQuery.$or = peopleWhere[whereKey].map((where) => (0, exports.wherePeople)(where));
                break;
            case "nor":
                filterQuery.$nor = peopleWhere[whereKey].map((where) => (0, exports.wherePeople)(where));
                break;
        }
    }
    return filterQuery;
};
exports.wherePeople = wherePeople;
const people = (_, { where }, { dataSources: { accountingDb } }) => accountingDb.find({
    collection: "people",
    filter: where ? (0, exports.wherePeople)(where) : {},
});
exports.people = people;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicGVvcGxlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL3Jlc29sdmVycy9wZXJzb24vcGVvcGxlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUVBLHlEQUF5RDtBQUN6RCxvREFBMEQ7QUFFbkQsTUFBTSxXQUFXLEdBQUcsQ0FBQyxXQUF3QixFQUF3QixFQUFFO0lBQzVFLE1BQU0sV0FBVyxHQUFxQixFQUFFLENBQUM7SUFFekMsS0FBSyxNQUFNLFFBQVEsSUFBSSxJQUFBLDRCQUFjLEVBQUMsV0FBVyxDQUFDLEVBQUU7UUFDbEQsUUFBUSxRQUFRLEVBQUU7WUFDaEIsS0FBSyxJQUFJO2dCQUNQLFdBQVcsQ0FBQyxLQUFLLENBQUMsR0FBRyxJQUFBLG9CQUFPLEVBQUMsV0FBVyxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUM7Z0JBQ3BELE1BQU07WUFDUixLQUFLLE1BQU07Z0JBQ1QsS0FBSyxNQUFNLElBQUksSUFBSSxJQUFBLDRCQUFjLEVBQUMsV0FBVyxDQUFDLFFBQVEsQ0FBQyxDQUFDLEVBQUU7b0JBQ3hELFFBQVEsSUFBSSxFQUFFO3dCQUNaLEtBQUssT0FBTzs0QkFDVixXQUFXLENBQUMsWUFBWSxDQUFDLEdBQUcsSUFBQSx1QkFBVSxFQUNwQyxXQUFXLENBQUMsUUFBUSxDQUFDLENBQUMsSUFBSSxDQUFDLENBQzVCLENBQUM7NEJBQ0YsTUFBTTt3QkFDUixLQUFLLE1BQU07NEJBQ1QsV0FBVyxDQUFDLFdBQVcsQ0FBQyxHQUFHLElBQUEsdUJBQVUsRUFDbkMsV0FBVyxDQUFDLFFBQVEsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUM1QixDQUFDOzRCQUNGLE1BQU07cUJBQ1Q7aUJBQ0Y7Z0JBQ0QsTUFBTTtZQUNSLEtBQUssS0FBSztnQkFDUixXQUFXLENBQUMsSUFBSSxHQUFHLFdBQVcsQ0FBQyxRQUFRLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxLQUFLLEVBQUUsRUFBRSxDQUNyRCxJQUFBLG1CQUFXLEVBQUMsS0FBSyxDQUFDLENBQ25CLENBQUM7Z0JBQ0YsTUFBTTtZQUNSLEtBQUssSUFBSTtnQkFDUCxXQUFXLENBQUMsR0FBRyxHQUFHLFdBQVcsQ0FBQyxRQUFRLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxLQUFLLEVBQUUsRUFBRSxDQUNwRCxJQUFBLG1CQUFXLEVBQUMsS0FBSyxDQUFDLENBQ25CLENBQUM7Z0JBQ0YsTUFBTTtZQUNSLEtBQUssS0FBSztnQkFDUixXQUFXLENBQUMsSUFBSSxHQUFHLFdBQVcsQ0FBQyxRQUFRLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxLQUFLLEVBQUUsRUFBRSxDQUNyRCxJQUFBLG1CQUFXLEVBQUMsS0FBSyxDQUFDLENBQ25CLENBQUM7Z0JBQ0YsTUFBTTtTQUNUO0tBQ0Y7SUFFRCxPQUFPLFdBQVcsQ0FBQztBQUNyQixDQUFDLENBQUM7QUEzQ1csUUFBQSxXQUFXLGVBMkN0QjtBQUVLLE1BQU0sTUFBTSxHQUE2QixDQUM5QyxDQUFDLEVBQ0QsRUFBRSxLQUFLLEVBQUUsRUFDVCxFQUFFLFdBQVcsRUFBRSxFQUFFLFlBQVksRUFBRSxFQUFFLEVBQ2pDLEVBQUUsQ0FDRixZQUFZLENBQUMsSUFBSSxDQUFDO0lBQ2hCLFVBQVUsRUFBRSxRQUFRO0lBQ3BCLE1BQU0sRUFBRSxLQUFLLENBQUMsQ0FBQyxDQUFDLElBQUEsbUJBQVcsRUFBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRTtDQUN4QyxDQUFDLENBQUM7QUFSUSxRQUFBLE1BQU0sVUFRZCJ9