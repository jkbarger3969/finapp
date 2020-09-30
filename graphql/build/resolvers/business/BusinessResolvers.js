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
const graphTypes_1 = require("../../graphTypes");
const budgets_1 = require("../budget/budgets");
const DepartmentResolvers_1 = require("../department/DepartmentResolvers");
const budgets = (doc, args, context, info) => __awaiter(void 0, void 0, void 0, function* () {
    return budgets_1.default({}, {
        where: {
            owner: {
                eq: {
                    id: doc.id,
                    type: graphTypes_1.BudgetOwnerType.Business,
                },
            },
        },
    }, context, info);
});
const departments = (doc, args, context, info) => {
    return DepartmentResolvers_1.getDeptDescendants({ id: doc.id, type: graphTypes_1.DepartmentAncestorType.Business }, context, info);
};
const BusinessResolvers = {
    budgets,
    departments,
};
exports.default = BusinessResolvers;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQnVzaW5lc3NSZXNvbHZlcnMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvcmVzb2x2ZXJzL2J1c2luZXNzL0J1c2luZXNzUmVzb2x2ZXJzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7O0FBQUEsaURBSTBCO0FBRTFCLCtDQUE2QztBQUM3QywyRUFBdUU7QUFFdkUsTUFBTSxPQUFPLEdBQWtDLENBQzdDLEdBQUcsRUFDSCxJQUFJLEVBQ0osT0FBTyxFQUNQLElBQUksRUFDSixFQUFFO0lBQ0YsT0FBTyxpQkFBWSxDQUNqQixFQUFFLEVBQ0Y7UUFDRSxLQUFLLEVBQUU7WUFDTCxLQUFLLEVBQUU7Z0JBQ0wsRUFBRSxFQUFFO29CQUNGLEVBQUUsRUFBRSxHQUFHLENBQUMsRUFBRTtvQkFDVixJQUFJLEVBQUUsNEJBQWUsQ0FBQyxRQUFRO2lCQUMvQjthQUNGO1NBQ0Y7S0FDRixFQUNELE9BQU8sRUFDUCxJQUFJLENBQ0wsQ0FBQztBQUNKLENBQUMsQ0FBQSxDQUFDO0FBRUYsTUFBTSxXQUFXLEdBQXNDLENBQ3JELEdBQUcsRUFDSCxJQUFJLEVBQ0osT0FBTyxFQUNQLElBQUksRUFDSixFQUFFO0lBQ0YsT0FBTyx3Q0FBa0IsQ0FDdkIsRUFBRSxFQUFFLEVBQUUsR0FBRyxDQUFDLEVBQUUsRUFBRSxJQUFJLEVBQUUsbUNBQXNCLENBQUMsUUFBUSxFQUFFLEVBQ3JELE9BQU8sRUFDUCxJQUFJLENBQ0wsQ0FBQztBQUNKLENBQUMsQ0FBQztBQUVGLE1BQU0saUJBQWlCLEdBQXVCO0lBQzVDLE9BQU87SUFDUCxXQUFXO0NBQ0gsQ0FBQztBQUVYLGtCQUFlLGlCQUFpQixDQUFDIn0=