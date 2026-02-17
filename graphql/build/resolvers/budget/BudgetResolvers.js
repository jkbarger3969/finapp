"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Budget = exports.BudgetOwner = void 0;
const mongodb_1 = require("mongodb");
const queryUtils_1 = require("../utils/queryUtils");
const fraction_js_1 = __importDefault(require("fraction.js"));
const owner = ({ owner }, _, { dataSources: { accountingDb } }) => {
    if (!owner || !owner.type || !owner.id) {
        console.warn("Budget has invalid owner:", owner);
        return { __typename: 'Business', id: 'unknown', name: 'Unknown Owner' };
    }
    if (owner.type === "Business") {
        return (0, queryUtils_1.addTypename)(owner.type, accountingDb.findOne({
            collection: "businesses",
            filter: {
                _id: new mongodb_1.ObjectId(owner.id),
            },
        }));
    }
    else {
        return (0, queryUtils_1.addTypename)(owner.type, accountingDb.findOne({
            collection: "departments",
            filter: {
                _id: new mongodb_1.ObjectId(owner.id),
            },
        }));
    }
};
const fiscalYear = ({ fiscalYear }, _, { dataSources: { accountingDb } }) => accountingDb.findOne({
    collection: "fiscalYears",
    filter: {
        _id: new mongodb_1.ObjectId(fiscalYear),
    },
});
exports.BudgetOwner = {
    // __typename added with addTypename
    __resolveType: ({ __typename }) => __typename,
};
const BudgetResolver = {
    id: ({ _id }) => _id.toString(),
    owner,
    amount: ({ amount }) => new fraction_js_1.default(amount),
    fiscalYear,
};
exports.Budget = BudgetResolver;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQnVkZ2V0UmVzb2x2ZXJzLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL3Jlc29sdmVycy9idWRnZXQvQnVkZ2V0UmVzb2x2ZXJzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7OztBQUFBLHFDQUFtQztBQUtuQyxvREFBa0Q7QUFDbEQsOERBQW1DO0FBWW5DLE1BQU0sS0FBSyxHQUFzRCxDQUMvRCxFQUFFLEtBQUssRUFBRSxFQUNULENBQUMsRUFDRCxFQUFFLFdBQVcsRUFBRSxFQUFFLFlBQVksRUFBRSxFQUFFLEVBQ2pDLEVBQUU7SUFDRixJQUFJLENBQUMsS0FBSyxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksSUFBSSxDQUFDLEtBQUssQ0FBQyxFQUFFLEVBQUU7UUFDdEMsT0FBTyxDQUFDLElBQUksQ0FBQywyQkFBMkIsRUFBRSxLQUFLLENBQUMsQ0FBQztRQUNqRCxPQUFPLEVBQUUsVUFBVSxFQUFFLFVBQVUsRUFBRSxFQUFFLEVBQUUsU0FBUyxFQUFFLElBQUksRUFBRSxlQUFlLEVBQVMsQ0FBQztLQUNoRjtJQUVELElBQUksS0FBSyxDQUFDLElBQUksS0FBSyxVQUFVLEVBQUU7UUFDN0IsT0FBTyxJQUFBLHdCQUFXLEVBQ2hCLEtBQUssQ0FBQyxJQUFJLEVBQ1YsWUFBWSxDQUFDLE9BQU8sQ0FBQztZQUNuQixVQUFVLEVBQUUsWUFBWTtZQUN4QixNQUFNLEVBQUU7Z0JBQ04sR0FBRyxFQUFFLElBQUksa0JBQVEsQ0FBQyxLQUFLLENBQUMsRUFBRSxDQUFDO2FBQzVCO1NBQ0YsQ0FBQyxDQUNILENBQUM7S0FDSDtTQUFNO1FBQ0wsT0FBTyxJQUFBLHdCQUFXLEVBQ2hCLEtBQUssQ0FBQyxJQUFJLEVBQ1YsWUFBWSxDQUFDLE9BQU8sQ0FBQztZQUNuQixVQUFVLEVBQUUsYUFBYTtZQUN6QixNQUFNLEVBQUU7Z0JBQ04sR0FBRyxFQUFFLElBQUksa0JBQVEsQ0FBQyxLQUFLLENBQUMsRUFBRSxDQUFDO2FBQzVCO1NBQ0YsQ0FBQyxDQUNILENBQUM7S0FDSDtBQUNILENBQUMsQ0FBQztBQUVGLE1BQU0sVUFBVSxHQUEyRCxDQUN6RSxFQUFFLFVBQVUsRUFBRSxFQUNkLENBQUMsRUFDRCxFQUFFLFdBQVcsRUFBRSxFQUFFLFlBQVksRUFBRSxFQUFFLEVBQ2pDLEVBQUUsQ0FDRixZQUFZLENBQUMsT0FBTyxDQUFDO0lBQ25CLFVBQVUsRUFBRSxhQUFhO0lBQ3pCLE1BQU0sRUFBRTtRQUNOLEdBQUcsRUFBRSxJQUFJLGtCQUFRLENBQUMsVUFBVSxDQUFDO0tBQzlCO0NBQ0YsQ0FBQyxDQUFDO0FBRVEsUUFBQSxXQUFXLEdBQXlCO0lBQy9DLG9DQUFvQztJQUNwQyxhQUFhLEVBQUUsQ0FBQyxFQUFFLFVBQVUsRUFBRSxFQUFFLEVBQUUsQ0FBQyxVQUFVO0NBQ3ZDLENBQUM7QUFFVCxNQUFNLGNBQWMsR0FBNkM7SUFDL0QsRUFBRSxFQUFFLENBQUMsRUFBRSxHQUFHLEVBQUUsRUFBRSxFQUFFLENBQUMsR0FBRyxDQUFDLFFBQVEsRUFBRTtJQUMvQixLQUFLO0lBQ0wsTUFBTSxFQUFFLENBQUMsRUFBRSxNQUFNLEVBQUUsRUFBRSxFQUFFLENBQUMsSUFBSSxxQkFBUSxDQUFDLE1BQU0sQ0FBQztJQUM1QyxVQUFVO0NBQ0YsQ0FBQztBQUVFLFFBQUEsTUFBTSxHQUFHLGNBQTRDLENBQUMifQ==