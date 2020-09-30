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
exports.mergeObjects = (fields) => {
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
exports.getUniqueId = (idField, collection) => __awaiter(void 0, void 0, void 0, function* () {
    const id = new mongodb_1.ObjectId();
    const [{ count } = { count: 0 }] = yield collection
        .aggregate([{ $match: { [idField]: id } }, { $count: "count" }])
        .toArray();
    return count === 0 ? id : exports.getUniqueId(idField, collection);
});
exports.addId = { $addFields: { id: { $toString: "$_id" } } };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibW9uZ29VdGlscy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9yZXNvbHZlcnMvdXRpbHMvbW9uZ29VdGlscy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7OztBQUFBLHFDQUErQztBQUVsQyxRQUFBLFlBQVksR0FBRyxDQUFtQixNQUFtQixFQUFFLEVBQUU7SUFDcEUsTUFBTSxNQUFNLEdBQVcsRUFBRSxHQUFHLEVBQUUsSUFBSSxFQUFFLEtBQUssRUFBRSxFQUFFLFNBQVMsRUFBRSxNQUFNLEVBQUUsRUFBRSxDQUFDO0lBQ25FLE1BQU0sUUFBUSxHQUFXO1FBQ3ZCLEdBQUcsRUFBRTtZQUNILE9BQU8sRUFBRTtnQkFDUCxLQUFLLEVBQUUsUUFBUTtnQkFDZixZQUFZLEVBQUUsSUFBSTtnQkFDbEIsRUFBRSxFQUFFLEVBQUUsT0FBTyxFQUFFLENBQUMsUUFBUSxFQUFFLFNBQVMsQ0FBQyxFQUFFO2FBQ3ZDO1NBQ0Y7S0FDRixDQUFDO0lBRUYsS0FBSyxNQUFNLEtBQUssSUFBSSxNQUFNLEVBQUU7UUFDMUIsTUFBTSxDQUFDLEtBQWUsQ0FBQyxHQUFHLEVBQUUsU0FBUyxFQUFFLElBQUksS0FBSyxFQUFFLEVBQUUsQ0FBQztRQUNyRCxRQUFRLENBQUMsS0FBZSxDQUFDLEdBQUc7WUFDMUIsT0FBTyxFQUFFO2dCQUNQLEtBQUssRUFBRSxJQUFJLEtBQUssRUFBRTtnQkFDbEIsWUFBWSxFQUFFLElBQUk7Z0JBQ2xCLEVBQUUsRUFBRSxFQUFFLE9BQU8sRUFBRSxDQUFDLFFBQVEsRUFBRSxTQUFTLENBQUMsRUFBRTthQUN2QztTQUNGLENBQUM7S0FDSDtJQUVELE9BQU8sQ0FBQyxFQUFFLE1BQU0sRUFBRSxFQUFFLEVBQUUsUUFBUSxFQUFFLENBQVUsQ0FBQztBQUM3QyxDQUFDLENBQUM7QUFFVyxRQUFBLFdBQVcsR0FBRyxDQUFPLE9BQWUsRUFBRSxVQUFzQixFQUFFLEVBQUU7SUFDM0UsTUFBTSxFQUFFLEdBQUcsSUFBSSxrQkFBUSxFQUFFLENBQUM7SUFFMUIsTUFBTSxDQUFDLEVBQUUsS0FBSyxFQUFFLEdBQUcsRUFBRSxLQUFLLEVBQUUsQ0FBQyxFQUFFLENBQUMsR0FBRyxNQUFNLFVBQVU7U0FDaEQsU0FBUyxDQUFDLENBQUMsRUFBRSxNQUFNLEVBQUUsRUFBRSxDQUFDLE9BQU8sQ0FBQyxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxNQUFNLEVBQUUsT0FBTyxFQUFFLENBQUMsQ0FBQztTQUMvRCxPQUFPLEVBQUUsQ0FBQztJQUViLE9BQU8sS0FBSyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxtQkFBVyxDQUFDLE9BQU8sRUFBRSxVQUFVLENBQUMsQ0FBQztBQUM3RCxDQUFDLENBQUEsQ0FBQztBQUVXLFFBQUEsS0FBSyxHQUFHLEVBQUUsVUFBVSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsU0FBUyxFQUFFLE1BQU0sRUFBRSxFQUFFLEVBQVcsQ0FBQyJ9