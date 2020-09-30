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
const nodeResolver_1 = require("../utils/nodeResolver");
const rational_1 = require("../../utils/rational");
const fiscalYear_1 = require("../fiscalYear/fiscalYear");
const owner = (doc, args, context, info) => {
    return nodeResolver_1.nodeDocResolver(doc.owner, context);
};
const fiscalYear = (doc, args, context, info) => __awaiter(void 0, void 0, void 0, function* () {
    return fiscalYear_1.default({}, { id: doc.fiscalYear.toHexString() }, context, info);
});
const BudgetResolvers = {
    owner,
    amount: (doc) => rational_1.fractionToRational(doc.amount),
    fiscalYear,
};
exports.default = BudgetResolvers;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQnVkZ2V0UmVzb2x2ZXJzLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL3Jlc29sdmVycy9idWRnZXQvQnVkZ2V0UmVzb2x2ZXJzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7O0FBSUEsd0RBQXdEO0FBQ3hELG1EQUEwRDtBQUMxRCx5REFBc0U7QUFHdEUsTUFBTSxLQUFLLEdBQThCLENBQUMsR0FBRyxFQUFFLElBQUksRUFBRSxPQUFPLEVBQUUsSUFBSSxFQUFFLEVBQUU7SUFDcEUsT0FBTyw4QkFBZSxDQUFHLEdBQWlDLENBQUMsS0FBSyxFQUFFLE9BQU8sQ0FBQyxDQUFDO0FBQzdFLENBQUMsQ0FBQztBQUVGLE1BQU0sVUFBVSxHQUFtQyxDQUNqRCxHQUFHLEVBQ0gsSUFBSSxFQUNKLE9BQU8sRUFDUCxJQUFJLEVBQ0osRUFBRTtJQUNGLE9BQU8sb0JBQWUsQ0FDcEIsRUFBRSxFQUNGLEVBQUUsRUFBRSxFQUFJLEdBQUcsQ0FBQyxVQUFtQyxDQUFDLFdBQVcsRUFBRSxFQUFFLEVBQy9ELE9BQU8sRUFDUCxJQUFJLENBQ0wsQ0FBQztBQUNKLENBQUMsQ0FBQSxDQUFDO0FBRUYsTUFBTSxlQUFlLEdBQXFCO0lBQ3hDLEtBQUs7SUFDTCxNQUFNLEVBQUUsQ0FBQyxHQUFHLEVBQUUsRUFBRSxDQUFDLDZCQUFrQixDQUFFLEdBQUcsQ0FBQyxNQUE4QixDQUFDO0lBQ3hFLFVBQVU7Q0FDRixDQUFDO0FBRVgsa0JBQWUsZUFBZSxDQUFDIn0=