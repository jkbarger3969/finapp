"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Budget = exports.BudgetOwner = void 0;
const mongodb_1 = require("mongodb");
const queryUtils_1 = require("../utils/queryUtils");
const fraction_js_1 = require("fraction.js");
const owner = ({ owner }, _, { db }) => {
    if (owner.type === "Business") {
        return (0, queryUtils_1.addTypename)(owner.type, db.collection("businesses").findOne({
            _id: new mongodb_1.ObjectId(owner.id),
        }));
    }
    else {
        return (0, queryUtils_1.addTypename)(owner.type, db.collection("departments").findOne({
            _id: new mongodb_1.ObjectId(owner.id),
        }));
    }
};
const fiscalYear = ({ fiscalYear }, _, { db }) => db.collection("fiscalYears").findOne({ _id: new mongodb_1.ObjectId(fiscalYear) });
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQnVkZ2V0UmVzb2x2ZXJzLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL3Jlc29sdmVycy9idWRnZXQvQnVkZ2V0UmVzb2x2ZXJzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUFBLHFDQUFtQztBQUtuQyxvREFBa0Q7QUFDbEQsNkNBQW1DO0FBWW5DLE1BQU0sS0FBSyxHQUFzRCxDQUMvRCxFQUFFLEtBQUssRUFBRSxFQUNULENBQUMsRUFDRCxFQUFFLEVBQUUsRUFBRSxFQUNOLEVBQUU7SUFDRixJQUFJLEtBQUssQ0FBQyxJQUFJLEtBQUssVUFBVSxFQUFFO1FBQzdCLE9BQU8sSUFBQSx3QkFBVyxFQUNoQixLQUFLLENBQUMsSUFBSSxFQUNWLEVBQUUsQ0FBQyxVQUFVLENBQUMsWUFBWSxDQUFDLENBQUMsT0FBTyxDQUFDO1lBQ2xDLEdBQUcsRUFBRSxJQUFJLGtCQUFRLENBQUMsS0FBSyxDQUFDLEVBQUUsQ0FBQztTQUM1QixDQUFDLENBQ0gsQ0FBQztLQUNIO1NBQU07UUFDTCxPQUFPLElBQUEsd0JBQVcsRUFDaEIsS0FBSyxDQUFDLElBQUksRUFDVixFQUFFLENBQUMsVUFBVSxDQUFDLGFBQWEsQ0FBQyxDQUFDLE9BQU8sQ0FBQztZQUNuQyxHQUFHLEVBQUUsSUFBSSxrQkFBUSxDQUFDLEtBQUssQ0FBQyxFQUFFLENBQUM7U0FDNUIsQ0FBQyxDQUNILENBQUM7S0FDSDtBQUNILENBQUMsQ0FBQztBQUVGLE1BQU0sVUFBVSxHQUEyRCxDQUN6RSxFQUFFLFVBQVUsRUFBRSxFQUNkLENBQUMsRUFDRCxFQUFFLEVBQUUsRUFBRSxFQUNOLEVBQUUsQ0FBQyxFQUFFLENBQUMsVUFBVSxDQUFDLGFBQWEsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxFQUFFLEdBQUcsRUFBRSxJQUFJLGtCQUFRLENBQUMsVUFBVSxDQUFDLEVBQUUsQ0FBQyxDQUFDO0FBRWhFLFFBQUEsV0FBVyxHQUF5QjtJQUMvQyxvQ0FBb0M7SUFDcEMsYUFBYSxFQUFFLENBQUMsRUFBRSxVQUFVLEVBQUUsRUFBRSxFQUFFLENBQUMsVUFBVTtDQUN2QyxDQUFDO0FBRVQsTUFBTSxjQUFjLEdBQTZDO0lBQy9ELEVBQUUsRUFBRSxDQUFDLEVBQUUsR0FBRyxFQUFFLEVBQUUsRUFBRSxDQUFDLEdBQUcsQ0FBQyxRQUFRLEVBQUU7SUFDL0IsS0FBSztJQUNMLE1BQU0sRUFBRSxDQUFDLEVBQUUsTUFBTSxFQUFFLEVBQUUsRUFBRSxDQUFDLElBQUkscUJBQVEsQ0FBQyxNQUFNLENBQUM7SUFDNUMsVUFBVTtDQUNGLENBQUM7QUFFRSxRQUFBLE1BQU0sR0FBRyxjQUE0QyxDQUFDIn0=