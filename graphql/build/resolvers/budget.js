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
exports.Budget = exports.budgets = void 0;
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
    amount: (doc) => { var _a; return rational_1.fractionToRational(((_a = doc.amount) !== null && _a !== void 0 ? _a : doc)); },
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYnVkZ2V0LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL3Jlc29sdmVycy9idWRnZXQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7O0FBQ0EsdURBQXlEO0FBQ3pELGdEQUF1RDtBQUUxQyxRQUFBLE9BQU8sR0FBOEIsQ0FDaEQsTUFBTSxFQUNOLElBQUksRUFDSixPQUFPLEVBQ1AsSUFBSSxFQUNKLEVBQUU7SUFDRixNQUFNLEVBQUUsRUFBRSxFQUFFLEdBQUcsT0FBTyxDQUFDO0lBRXZCLE1BQU0sT0FBTyxHQUFHLE1BQU0sRUFBRTtTQUNyQixVQUFVLENBQUMsU0FBUyxDQUFDO1NBQ3JCLFNBQVMsQ0FBQztRQUNULEVBQUUsTUFBTSxFQUFFLEVBQUUsRUFBRTtRQUNkO1lBQ0UsVUFBVSxFQUFFO2dCQUNWLEVBQUUsRUFBRSxFQUFFLFNBQVMsRUFBRSxNQUFNLEVBQUU7YUFDMUI7U0FDRjtLQUNGLENBQUM7U0FDRCxPQUFPLEVBQUUsQ0FBQztJQUViLE9BQU8sT0FBTyxDQUFDO0FBQ2pCLENBQUMsQ0FBQSxDQUFDO0FBRVcsUUFBQSxNQUFNLEdBQW9CO0lBQ3JDLEtBQUssRUFBRSxnQ0FBaUI7SUFDeEIsTUFBTSxFQUFFLENBQUMsR0FBRyxFQUFFLEVBQUUsV0FBQyxPQUFBLDZCQUFrQixDQUFDLE9BQUMsR0FBRyxDQUFDLE1BQU0sbUNBQUksR0FBRyxDQUFRLENBQUMsQ0FBQSxFQUFBO0NBQ2hFLENBQUMifQ==