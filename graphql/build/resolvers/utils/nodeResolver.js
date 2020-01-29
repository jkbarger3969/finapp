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
exports.nodeDocResolver = (nodeValue, context) => __awaiter(void 0, void 0, void 0, function* () {
    const { node, id } = nodeValue;
    const { db, nodeMap } = context;
    const { collection, typename } = nodeMap.id.get(node.toString());
    const docLookUp = yield db.collection(collection).aggregate([
        { $match: { _id: new mongodb_1.ObjectID(id.toString()) } },
        { $limit: 1 },
        { $addFields: {
                id: { $toString: "$_id" }
            } }
    ]).toArray();
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
            node: new mongodb_1.ObjectID(nodeValue.node),
            id: new mongodb_1.ObjectID(nodeValue.id)
        }, context);
    }
    return nodeValue;
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibm9kZVJlc29sdmVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL3Jlc29sdmVycy91dGlscy9ub2RlUmVzb2x2ZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7QUFDQSxxQ0FBaUM7QUFJcEIsUUFBQSxlQUFlLEdBQzFCLENBQU8sU0FBbUIsRUFBRSxPQUFlLEVBQUUsRUFBRTtJQUcvQyxNQUFNLEVBQUMsSUFBSSxFQUFFLEVBQUUsRUFBQyxHQUFHLFNBQVMsQ0FBQztJQUM3QixNQUFNLEVBQUMsRUFBRSxFQUFFLE9BQU8sRUFBQyxHQUFHLE9BQU8sQ0FBQztJQUU5QixNQUFNLEVBQUMsVUFBVSxFQUFFLFFBQVEsRUFBQyxHQUFHLE9BQU8sQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxRQUFRLEVBQUUsQ0FBQyxDQUFDO0lBRS9ELE1BQU0sU0FBUyxHQUFHLE1BQU0sRUFBRSxDQUFDLFVBQVUsQ0FBQyxVQUFVLENBQUMsQ0FBQyxTQUFTLENBQUM7UUFDMUQsRUFBQyxNQUFNLEVBQUMsRUFBQyxHQUFHLEVBQUMsSUFBSSxrQkFBUSxDQUFDLEVBQUUsQ0FBQyxRQUFRLEVBQUUsQ0FBQyxFQUFDLEVBQUM7UUFDMUMsRUFBQyxNQUFNLEVBQUMsQ0FBQyxFQUFDO1FBQ1YsRUFBQyxVQUFVLEVBQUU7Z0JBQ1gsRUFBRSxFQUFDLEVBQUMsU0FBUyxFQUFFLE1BQU0sRUFBQzthQUN2QixFQUFDO0tBQ0gsQ0FBQyxDQUFDLE9BQU8sRUFBRSxDQUFDO0lBRWIsSUFBRyxTQUFTLENBQUMsQ0FBQyxDQUFDLEtBQUssU0FBUyxFQUFFO1FBQzdCLE9BQU8sSUFBSSxDQUFDO0tBQ2I7SUFFRCxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsWUFBWSxDQUFDLEdBQUcsUUFBUSxDQUFDO0lBRXRDLE9BQU8sU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBRXRCLENBQUMsQ0FBQSxDQUFBO0FBRVksUUFBQSxpQkFBaUIsR0FDNUIsQ0FBQyxTQUFTLEVBQUUsSUFBSSxFQUFFLE9BQWUsRUFBRSxJQUF1QixFQUFFLEVBQUU7SUFHOUQsTUFBTSxTQUFTLEdBQUcsU0FBUyxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQztJQUU1QyxJQUFHLFNBQVMsSUFBSSxNQUFNLElBQUksU0FBUyxJQUFJLElBQUksSUFBSSxTQUFTLEVBQUU7UUFFeEQsT0FBTyx1QkFBZSxDQUFDO1lBQ3JCLElBQUksRUFBQyxJQUFJLGtCQUFRLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQztZQUNqQyxFQUFFLEVBQUMsSUFBSSxrQkFBUSxDQUFDLFNBQVMsQ0FBQyxFQUFFLENBQUM7U0FDOUIsRUFBRSxPQUFPLENBQUMsQ0FBQztLQUViO0lBQ0QsT0FBTyxTQUFTLENBQUM7QUFFbkIsQ0FBQyxDQUFBIn0=