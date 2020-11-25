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
exports.nodeFieldResolver = exports.nodeDocResolver = void 0;
const mongodb_1 = require("mongodb");
const mongoUtils_1 = require("../utils/mongoUtils");
const nodeDocResolver = (nodeValue, context) => __awaiter(void 0, void 0, void 0, function* () {
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
exports.nodeDocResolver = nodeDocResolver;
const nodeFieldResolver = (parentObj, args, context, info) => {
    const nodeValue = parentObj[info.fieldName];
    if (nodeValue && "node" in nodeValue && "id" in nodeValue) {
        return exports.nodeDocResolver({
            node: new mongodb_1.ObjectId(nodeValue.node),
            id: new mongodb_1.ObjectId(nodeValue.id),
        }, context);
    }
    return nodeValue;
};
exports.nodeFieldResolver = nodeFieldResolver;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibm9kZVJlc29sdmVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL3Jlc29sdmVycy91dGlscy9ub2RlUmVzb2x2ZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7O0FBQ0EscUNBQW1DO0FBR25DLG9EQUE0QztBQUVyQyxNQUFNLGVBQWUsR0FBRyxDQUM3QixTQUFvQixFQUNwQixPQUFnQixFQUMyQixFQUFFO0lBQzdDLE1BQU0sRUFBRSxJQUFJLEVBQUUsRUFBRSxFQUFFLEdBQUcsU0FBUyxDQUFDO0lBQy9CLE1BQU0sRUFBRSxFQUFFLEVBQUUsT0FBTyxFQUFFLEdBQUcsT0FBTyxDQUFDO0lBRWhDLE1BQU0sRUFBRSxVQUFVLEVBQUUsUUFBUSxFQUFFLEdBQUcsT0FBTyxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLFFBQVEsRUFBRSxDQUFDLENBQUM7SUFFakUsTUFBTSxTQUFTLEdBQUcsTUFBTSxFQUFFO1NBQ3ZCLFVBQVUsQ0FBQyxVQUFVLENBQUM7U0FDdEIsU0FBUyxDQUFDO1FBQ1QsRUFBRSxNQUFNLEVBQUUsRUFBRSxHQUFHLEVBQUUsSUFBSSxrQkFBUSxDQUFDLEVBQUUsQ0FBQyxRQUFRLEVBQUUsQ0FBQyxFQUFFLEVBQUU7UUFDaEQsRUFBRSxNQUFNLEVBQUUsQ0FBQyxFQUFFO1FBQ2Isa0JBQUs7S0FDTixDQUFDO1NBQ0QsT0FBTyxFQUFFLENBQUM7SUFFYixJQUFJLFNBQVMsQ0FBQyxDQUFDLENBQUMsS0FBSyxTQUFTLEVBQUU7UUFDOUIsT0FBTyxJQUFJLENBQUM7S0FDYjtJQUVELFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxZQUFZLENBQUMsR0FBRyxRQUFRLENBQUM7SUFFdEMsT0FBTyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDdEIsQ0FBQyxDQUFBLENBQUM7QUF6QlcsUUFBQSxlQUFlLG1CQXlCMUI7QUFFSyxNQUFNLGlCQUFpQixHQUFHLENBQy9CLFNBQVMsRUFDVCxJQUFJLEVBQ0osT0FBZ0IsRUFDaEIsSUFBd0IsRUFDeEIsRUFBRTtJQUNGLE1BQU0sU0FBUyxHQUFHLFNBQVMsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUM7SUFFNUMsSUFBSSxTQUFTLElBQUksTUFBTSxJQUFJLFNBQVMsSUFBSSxJQUFJLElBQUksU0FBUyxFQUFFO1FBQ3pELE9BQU8sdUJBQWUsQ0FDcEI7WUFDRSxJQUFJLEVBQUUsSUFBSSxrQkFBUSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUM7WUFDbEMsRUFBRSxFQUFFLElBQUksa0JBQVEsQ0FBQyxTQUFTLENBQUMsRUFBRSxDQUFDO1NBQy9CLEVBQ0QsT0FBTyxDQUNSLENBQUM7S0FDSDtJQUNELE9BQU8sU0FBUyxDQUFDO0FBQ25CLENBQUMsQ0FBQztBQWxCVyxRQUFBLGlCQUFpQixxQkFrQjVCIn0=