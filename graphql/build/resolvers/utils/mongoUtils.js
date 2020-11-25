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
exports.addId = exports.getUniqueId = exports.mergeObjects = void 0;
const mongodb_1 = require("mongodb");
const mergeObjects = (fields) => {
    const $group = { _id: null, __ids: { $addToSet: "$_id" } };
    const $project = {
        _id: {
            $reduce: {
                input: "$__ids",
                initialValue: null,
                in: { $ifNull: ["$$this", "$$value"] },
            },
        },
    };
    for (const field of fields) {
        $group[field] = { $addToSet: `$${field}` };
        $project[field] = {
            $reduce: {
                input: `$${field}`,
                initialValue: null,
                in: { $ifNull: ["$$this", "$$value"] },
            },
        };
    }
    return [{ $group }, { $project }];
};
exports.mergeObjects = mergeObjects;
const getUniqueId = (idField, collection) => __awaiter(void 0, void 0, void 0, function* () {
    const id = new mongodb_1.ObjectId();
    const [{ count } = { count: 0 }] = yield collection
        .aggregate([{ $match: { [idField]: id } }, { $count: "count" }])
        .toArray();
    return count === 0 ? id : exports.getUniqueId(idField, collection);
});
exports.getUniqueId = getUniqueId;
exports.addId = { $addFields: { id: { $toString: "$_id" } } };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibW9uZ29VdGlscy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9yZXNvbHZlcnMvdXRpbHMvbW9uZ29VdGlscy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7QUFBQSxxQ0FBK0M7QUFFeEMsTUFBTSxZQUFZLEdBQUcsQ0FBbUIsTUFBbUIsRUFBRSxFQUFFO0lBQ3BFLE1BQU0sTUFBTSxHQUFXLEVBQUUsR0FBRyxFQUFFLElBQUksRUFBRSxLQUFLLEVBQUUsRUFBRSxTQUFTLEVBQUUsTUFBTSxFQUFFLEVBQUUsQ0FBQztJQUNuRSxNQUFNLFFBQVEsR0FBVztRQUN2QixHQUFHLEVBQUU7WUFDSCxPQUFPLEVBQUU7Z0JBQ1AsS0FBSyxFQUFFLFFBQVE7Z0JBQ2YsWUFBWSxFQUFFLElBQUk7Z0JBQ2xCLEVBQUUsRUFBRSxFQUFFLE9BQU8sRUFBRSxDQUFDLFFBQVEsRUFBRSxTQUFTLENBQUMsRUFBRTthQUN2QztTQUNGO0tBQ0YsQ0FBQztJQUVGLEtBQUssTUFBTSxLQUFLLElBQUksTUFBTSxFQUFFO1FBQzFCLE1BQU0sQ0FBQyxLQUFlLENBQUMsR0FBRyxFQUFFLFNBQVMsRUFBRSxJQUFJLEtBQUssRUFBRSxFQUFFLENBQUM7UUFDckQsUUFBUSxDQUFDLEtBQWUsQ0FBQyxHQUFHO1lBQzFCLE9BQU8sRUFBRTtnQkFDUCxLQUFLLEVBQUUsSUFBSSxLQUFLLEVBQUU7Z0JBQ2xCLFlBQVksRUFBRSxJQUFJO2dCQUNsQixFQUFFLEVBQUUsRUFBRSxPQUFPLEVBQUUsQ0FBQyxRQUFRLEVBQUUsU0FBUyxDQUFDLEVBQUU7YUFDdkM7U0FDRixDQUFDO0tBQ0g7SUFFRCxPQUFPLENBQUMsRUFBRSxNQUFNLEVBQUUsRUFBRSxFQUFFLFFBQVEsRUFBRSxDQUFVLENBQUM7QUFDN0MsQ0FBQyxDQUFDO0FBeEJXLFFBQUEsWUFBWSxnQkF3QnZCO0FBRUssTUFBTSxXQUFXLEdBQUcsQ0FBTyxPQUFlLEVBQUUsVUFBc0IsRUFBRSxFQUFFO0lBQzNFLE1BQU0sRUFBRSxHQUFHLElBQUksa0JBQVEsRUFBRSxDQUFDO0lBRTFCLE1BQU0sQ0FBQyxFQUFFLEtBQUssRUFBRSxHQUFHLEVBQUUsS0FBSyxFQUFFLENBQUMsRUFBRSxDQUFDLEdBQUcsTUFBTSxVQUFVO1NBQ2hELFNBQVMsQ0FBQyxDQUFDLEVBQUUsTUFBTSxFQUFFLEVBQUUsQ0FBQyxPQUFPLENBQUMsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsTUFBTSxFQUFFLE9BQU8sRUFBRSxDQUFDLENBQUM7U0FDL0QsT0FBTyxFQUFFLENBQUM7SUFFYixPQUFPLEtBQUssS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsbUJBQVcsQ0FBQyxPQUFPLEVBQUUsVUFBVSxDQUFDLENBQUM7QUFDN0QsQ0FBQyxDQUFBLENBQUM7QUFSVyxRQUFBLFdBQVcsZUFRdEI7QUFFVyxRQUFBLEtBQUssR0FBRyxFQUFFLFVBQVUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLFNBQVMsRUFBRSxNQUFNLEVBQUUsRUFBRSxFQUFXLENBQUMifQ==