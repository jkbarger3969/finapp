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
exports.budgets = (parent, args, context, info) => __awaiter(void 0, void 0, void 0, function* () {
    const { db } = context;
    const results = yield db.collection("budgets").aggregate([
        { $match: {} },
        { $addFields: {
                id: { $toString: "$_id" }
            } }
    ]).toArray();
    return results;
});
exports.Budget = {
    owner: nodeResolver_1.nodeFieldResolver,
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYnVkZ2V0LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL3Jlc29sdmVycy9idWRnZXQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7QUFFQSx1REFBdUQ7QUFFMUMsUUFBQSxPQUFPLEdBQ2xCLENBQU8sTUFBTSxFQUFFLElBQUksRUFBRSxPQUFPLEVBQUUsSUFBSSxFQUFFLEVBQUU7SUFHdEMsTUFBTSxFQUFDLEVBQUUsRUFBQyxHQUFHLE9BQU8sQ0FBQztJQUVyQixNQUFNLE9BQU8sR0FBRyxNQUFNLEVBQUUsQ0FBQyxVQUFVLENBQUMsU0FBUyxDQUFDLENBQUMsU0FBUyxDQUFDO1FBQ3JELEVBQUMsTUFBTSxFQUFFLEVBQUUsRUFBQztRQUNaLEVBQUMsVUFBVSxFQUFFO2dCQUNULEVBQUUsRUFBQyxFQUFDLFNBQVMsRUFBRSxNQUFNLEVBQUM7YUFDekIsRUFBQztLQUNMLENBQUMsQ0FBQyxPQUFPLEVBQUUsQ0FBQztJQUViLE9BQU8sT0FBTyxDQUFDO0FBRWpCLENBQUMsQ0FBQSxDQUFBO0FBRVksUUFBQSxNQUFNLEdBQW1CO0lBQ3BDLEtBQUssRUFBQyxnQ0FBaUI7Q0FDeEIsQ0FBQyJ9