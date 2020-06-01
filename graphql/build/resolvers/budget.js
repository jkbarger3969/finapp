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
const nodeResolver_1 = require("./utils/nodeResolver");
const rational_1 = require("../utils/rational");
exports.budgets = (parent, args, context, info) => __awaiter(void 0, void 0, void 0, function* () {
    const { db } = context;
    const results = yield db
        .collection("budgets")
        .aggregate([
        { $match: {} },
        {
            $addFields: {
                id: { $toString: "$_id" },
            },
        },
    ])
        .toArray();
    return results;
});
exports.Budget = {
    owner: nodeResolver_1.nodeFieldResolver,
    amount: (doc) => { var _a; return rational_1.fractionToRational((_a = doc.amount, (_a !== null && _a !== void 0 ? _a : doc))); },
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYnVkZ2V0LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL3Jlc29sdmVycy9idWRnZXQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7QUFDQSx1REFBeUQ7QUFDekQsZ0RBQXVEO0FBRTFDLFFBQUEsT0FBTyxHQUE4QixDQUNoRCxNQUFNLEVBQ04sSUFBSSxFQUNKLE9BQU8sRUFDUCxJQUFJLEVBQ0osRUFBRTtJQUNGLE1BQU0sRUFBRSxFQUFFLEVBQUUsR0FBRyxPQUFPLENBQUM7SUFFdkIsTUFBTSxPQUFPLEdBQUcsTUFBTSxFQUFFO1NBQ3JCLFVBQVUsQ0FBQyxTQUFTLENBQUM7U0FDckIsU0FBUyxDQUFDO1FBQ1QsRUFBRSxNQUFNLEVBQUUsRUFBRSxFQUFFO1FBQ2Q7WUFDRSxVQUFVLEVBQUU7Z0JBQ1YsRUFBRSxFQUFFLEVBQUUsU0FBUyxFQUFFLE1BQU0sRUFBRTthQUMxQjtTQUNGO0tBQ0YsQ0FBQztTQUNELE9BQU8sRUFBRSxDQUFDO0lBRWIsT0FBTyxPQUFPLENBQUM7QUFDakIsQ0FBQyxDQUFBLENBQUM7QUFFVyxRQUFBLE1BQU0sR0FBb0I7SUFDckMsS0FBSyxFQUFFLGdDQUFpQjtJQUN4QixNQUFNLEVBQUUsQ0FBQyxHQUFHLEVBQUUsRUFBRSxXQUFDLE9BQUEsNkJBQWtCLENBQUMsTUFBQyxHQUFHLENBQUMsTUFBTSx1Q0FBSSxHQUFHLEVBQVEsQ0FBQyxDQUFBLEVBQUE7Q0FDaEUsQ0FBQyJ9