"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.businesses = exports.whereBusiness = void 0;
const iterableFns_1 = require("../../utils/iterableFns");
const queryUtils_1 = require("../utils/queryUtils");
const whereBusiness = (businessWhere) => {
    const filterQuery = {};
    for (const whereKey of (0, iterableFns_1.iterateOwnKeys)(businessWhere)) {
        switch (whereKey) {
            case "id":
                filterQuery["_id"] = (0, queryUtils_1.whereId)(businessWhere[whereKey]);
                break;
            case "name":
                filterQuery["name"] = (0, queryUtils_1.whereRegex)(businessWhere[whereKey]);
                break;
            case "and":
                filterQuery.$and = businessWhere[whereKey].map((where) => (0, exports.whereBusiness)(where));
                break;
            case "or":
                filterQuery.$or = businessWhere[whereKey].map((where) => (0, exports.whereBusiness)(where));
                break;
            case "nor":
                filterQuery.$nor = businessWhere[whereKey].map((where) => (0, exports.whereBusiness)(where));
                break;
        }
    }
    return filterQuery;
};
exports.whereBusiness = whereBusiness;
const businesses = (_, { where }, { db }) => {
    const query = where ? (0, exports.whereBusiness)(where) : {};
    return db.collection("businesses").find(query).toArray();
};
exports.businesses = businesses;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYnVzaW5lc3Nlcy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9yZXNvbHZlcnMvYnVzaW5lc3MvYnVzaW5lc3Nlcy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFLQSx5REFBeUQ7QUFFekQsb0RBQTBEO0FBSW5ELE1BQU0sYUFBYSxHQUFHLENBQzNCLGFBQThCLEVBQ1IsRUFBRTtJQUN4QixNQUFNLFdBQVcsR0FBeUIsRUFBRSxDQUFDO0lBRTdDLEtBQUssTUFBTSxRQUFRLElBQUksSUFBQSw0QkFBYyxFQUFDLGFBQWEsQ0FBQyxFQUFFO1FBQ3BELFFBQVEsUUFBUSxFQUFFO1lBQ2hCLEtBQUssSUFBSTtnQkFDUCxXQUFXLENBQUMsS0FBSyxDQUFDLEdBQUcsSUFBQSxvQkFBTyxFQUFDLGFBQWEsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDO2dCQUN0RCxNQUFNO1lBQ1IsS0FBSyxNQUFNO2dCQUNULFdBQVcsQ0FBQyxNQUFNLENBQUMsR0FBRyxJQUFBLHVCQUFVLEVBQUMsYUFBYSxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUM7Z0JBQzFELE1BQU07WUFDUixLQUFLLEtBQUs7Z0JBQ1IsV0FBVyxDQUFDLElBQUksR0FBRyxhQUFhLENBQUMsUUFBUSxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsS0FBSyxFQUFFLEVBQUUsQ0FDdkQsSUFBQSxxQkFBYSxFQUFDLEtBQUssQ0FBQyxDQUNyQixDQUFDO2dCQUNGLE1BQU07WUFDUixLQUFLLElBQUk7Z0JBQ1AsV0FBVyxDQUFDLEdBQUcsR0FBRyxhQUFhLENBQUMsUUFBUSxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsS0FBSyxFQUFFLEVBQUUsQ0FDdEQsSUFBQSxxQkFBYSxFQUFDLEtBQUssQ0FBQyxDQUNyQixDQUFDO2dCQUNGLE1BQU07WUFDUixLQUFLLEtBQUs7Z0JBQ1IsV0FBVyxDQUFDLElBQUksR0FBRyxhQUFhLENBQUMsUUFBUSxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsS0FBSyxFQUFFLEVBQUUsQ0FDdkQsSUFBQSxxQkFBYSxFQUFDLEtBQUssQ0FBQyxDQUNyQixDQUFDO2dCQUNGLE1BQU07U0FDVDtLQUNGO0lBRUQsT0FBTyxXQUFXLENBQUM7QUFDckIsQ0FBQyxDQUFDO0FBaENXLFFBQUEsYUFBYSxpQkFnQ3hCO0FBRUssTUFBTSxVQUFVLEdBQWlDLENBQ3RELENBQUMsRUFDRCxFQUFFLEtBQUssRUFBRSxFQUNULEVBQUUsRUFBRSxFQUFFLEVBQ04sRUFBRTtJQUNGLE1BQU0sS0FBSyxHQUFHLEtBQUssQ0FBQyxDQUFDLENBQUMsSUFBQSxxQkFBYSxFQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUM7SUFFaEQsT0FBTyxFQUFFLENBQUMsVUFBVSxDQUFDLFlBQVksQ0FBQyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxPQUFPLEVBQUUsQ0FBQztBQUMzRCxDQUFDLENBQUM7QUFSVyxRQUFBLFVBQVUsY0FRckIifQ==