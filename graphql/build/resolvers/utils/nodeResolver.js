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
const mongodb_1 = require("mongodb");
const mongoUtils_1 = require("../utils/mongoUtils");
exports.nodeDocResolver = (nodeValue, context) => __awaiter(void 0, void 0, void 0, function* () {
    const { node, id } = nodeValue;
    const { db, nodeMap } = context;
    const { collection, typename } = nodeMap.id.get(node.toString());
    const docLookUp = yield db
        .collection(collection)
        .aggregate([
        { $match: { _id: new mongodb_1.ObjectId(id.toString()) } },
        { $limit: 1 },
        mongoUtils_1.addId,
    ])
        .toArray();
    if (docLookUp[0] === undefined) {
        return null;
    }
    docLookUp[0]["__typename"] = typename;
    return docLookUp[0];
});
exports.nodeFieldResolver = (parentObj, args, context, info) => {
    const nodeValue = parentObj[info.fieldName];
    if (nodeValue && "node" in nodeValue && "id" in nodeValue) {
        return exports.nodeDocResolver({
            node: new mongodb_1.ObjectId(nodeValue.node),
            id: new mongodb_1.ObjectId(nodeValue.id),
        }, context);
    }
    return nodeValue;
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibm9kZVJlc29sdmVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL3Jlc29sdmVycy91dGlscy9ub2RlUmVzb2x2ZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7QUFDQSxxQ0FBbUM7QUFHbkMsb0RBQTRDO0FBRS9CLFFBQUEsZUFBZSxHQUFHLENBQzdCLFNBQW9CLEVBQ3BCLE9BQWdCLEVBQzJCLEVBQUU7SUFDN0MsTUFBTSxFQUFFLElBQUksRUFBRSxFQUFFLEVBQUUsR0FBRyxTQUFTLENBQUM7SUFDL0IsTUFBTSxFQUFFLEVBQUUsRUFBRSxPQUFPLEVBQUUsR0FBRyxPQUFPLENBQUM7SUFFaEMsTUFBTSxFQUFFLFVBQVUsRUFBRSxRQUFRLEVBQUUsR0FBRyxPQUFPLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsUUFBUSxFQUFFLENBQUMsQ0FBQztJQUVqRSxNQUFNLFNBQVMsR0FBRyxNQUFNLEVBQUU7U0FDdkIsVUFBVSxDQUFDLFVBQVUsQ0FBQztTQUN0QixTQUFTLENBQUM7UUFDVCxFQUFFLE1BQU0sRUFBRSxFQUFFLEdBQUcsRUFBRSxJQUFJLGtCQUFRLENBQUMsRUFBRSxDQUFDLFFBQVEsRUFBRSxDQUFDLEVBQUUsRUFBRTtRQUNoRCxFQUFFLE1BQU0sRUFBRSxDQUFDLEVBQUU7UUFDYixrQkFBSztLQUNOLENBQUM7U0FDRCxPQUFPLEVBQUUsQ0FBQztJQUViLElBQUksU0FBUyxDQUFDLENBQUMsQ0FBQyxLQUFLLFNBQVMsRUFBRTtRQUM5QixPQUFPLElBQUksQ0FBQztLQUNiO0lBRUQsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDLFlBQVksQ0FBQyxHQUFHLFFBQVEsQ0FBQztJQUV0QyxPQUFPLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUN0QixDQUFDLENBQUEsQ0FBQztBQUVXLFFBQUEsaUJBQWlCLEdBQUcsQ0FDL0IsU0FBUyxFQUNULElBQUksRUFDSixPQUFnQixFQUNoQixJQUF3QixFQUN4QixFQUFFO0lBQ0YsTUFBTSxTQUFTLEdBQUcsU0FBUyxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQztJQUU1QyxJQUFJLFNBQVMsSUFBSSxNQUFNLElBQUksU0FBUyxJQUFJLElBQUksSUFBSSxTQUFTLEVBQUU7UUFDekQsT0FBTyx1QkFBZSxDQUNwQjtZQUNFLElBQUksRUFBRSxJQUFJLGtCQUFRLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQztZQUNsQyxFQUFFLEVBQUUsSUFBSSxrQkFBUSxDQUFDLFNBQVMsQ0FBQyxFQUFFLENBQUM7U0FDL0IsRUFDRCxPQUFPLENBQ1IsQ0FBQztLQUNIO0lBQ0QsT0FBTyxTQUFTLENBQUM7QUFDbkIsQ0FBQyxDQUFDIn0=