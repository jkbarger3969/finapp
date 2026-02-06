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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQnVkZ2V0UmVzb2x2ZXJzLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL3Jlc29sdmVycy9idWRnZXQvQnVkZ2V0UmVzb2x2ZXJzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7OztBQUFBLHFDQUFtQztBQUtuQyxvREFBa0Q7QUFDbEQsOERBQW1DO0FBWW5DLE1BQU0sS0FBSyxHQUFzRCxDQUMvRCxFQUFFLEtBQUssRUFBRSxFQUNULENBQUMsRUFDRCxFQUFFLFdBQVcsRUFBRSxFQUFFLFlBQVksRUFBRSxFQUFFLEVBQ2pDLEVBQUU7SUFDRixJQUFJLEtBQUssQ0FBQyxJQUFJLEtBQUssVUFBVSxFQUFFO1FBQzdCLE9BQU8sSUFBQSx3QkFBVyxFQUNoQixLQUFLLENBQUMsSUFBSSxFQUNWLFlBQVksQ0FBQyxPQUFPLENBQUM7WUFDbkIsVUFBVSxFQUFFLFlBQVk7WUFDeEIsTUFBTSxFQUFFO2dCQUNOLEdBQUcsRUFBRSxJQUFJLGtCQUFRLENBQUMsS0FBSyxDQUFDLEVBQUUsQ0FBQzthQUM1QjtTQUNGLENBQUMsQ0FDSCxDQUFDO0tBQ0g7U0FBTTtRQUNMLE9BQU8sSUFBQSx3QkFBVyxFQUNoQixLQUFLLENBQUMsSUFBSSxFQUNWLFlBQVksQ0FBQyxPQUFPLENBQUM7WUFDbkIsVUFBVSxFQUFFLGFBQWE7WUFDekIsTUFBTSxFQUFFO2dCQUNOLEdBQUcsRUFBRSxJQUFJLGtCQUFRLENBQUMsS0FBSyxDQUFDLEVBQUUsQ0FBQzthQUM1QjtTQUNGLENBQUMsQ0FDSCxDQUFDO0tBQ0g7QUFDSCxDQUFDLENBQUM7QUFFRixNQUFNLFVBQVUsR0FBMkQsQ0FDekUsRUFBRSxVQUFVLEVBQUUsRUFDZCxDQUFDLEVBQ0QsRUFBRSxXQUFXLEVBQUUsRUFBRSxZQUFZLEVBQUUsRUFBRSxFQUNqQyxFQUFFLENBQ0YsWUFBWSxDQUFDLE9BQU8sQ0FBQztJQUNuQixVQUFVLEVBQUUsYUFBYTtJQUN6QixNQUFNLEVBQUU7UUFDTixHQUFHLEVBQUUsSUFBSSxrQkFBUSxDQUFDLFVBQVUsQ0FBQztLQUM5QjtDQUNGLENBQUMsQ0FBQztBQUVRLFFBQUEsV0FBVyxHQUF5QjtJQUMvQyxvQ0FBb0M7SUFDcEMsYUFBYSxFQUFFLENBQUMsRUFBRSxVQUFVLEVBQUUsRUFBRSxFQUFFLENBQUMsVUFBVTtDQUN2QyxDQUFDO0FBRVQsTUFBTSxjQUFjLEdBQTZDO0lBQy9ELEVBQUUsRUFBRSxDQUFDLEVBQUUsR0FBRyxFQUFFLEVBQUUsRUFBRSxDQUFDLEdBQUcsQ0FBQyxRQUFRLEVBQUU7SUFDL0IsS0FBSztJQUNMLE1BQU0sRUFBRSxDQUFDLEVBQUUsTUFBTSxFQUFFLEVBQUUsRUFBRSxDQUFDLElBQUkscUJBQVEsQ0FBQyxNQUFNLENBQUM7SUFDNUMsVUFBVTtDQUNGLENBQUM7QUFFRSxRQUFBLE1BQU0sR0FBRyxjQUE0QyxDQUFDIn0=