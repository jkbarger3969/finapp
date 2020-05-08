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
exports.people = (parent, args, context, info) => __awaiter(void 0, void 0, void 0, function* () {
    const { searchByName } = args;
    const { db } = context;
    let match = {};
    if (searchByName) {
        const first = searchByName.first.trim().toLowerCase();
        const last = searchByName.last.trim().toLowerCase();
        const query = [];
        if (first.length > 0) {
            query.push({ "name.first": new RegExp(`^${first}`, "i") });
        }
        if (last.length > 0) {
            query.push({ "name.last": new RegExp(`^${last}`, "i") });
        }
        switch (query.length) {
            case 0:
                break;
            case 1:
                match = query[0];
                break;
            default:
                match = { $or: query };
        }
        const results = yield db
            .collection("people")
            .aggregate([
            { $match: match },
            { $addFields: { id: { $toString: "$_id" } } },
        ])
            .toArray();
        return results;
    }
});
exports.addPerson = (parent, args, context, info) => __awaiter(void 0, void 0, void 0, function* () {
    const { db } = context;
    const { fields: { name: { first, last }, }, } = args;
    // Ensure graphql required fields not defeated by blank string.
    if (first.length === 0) {
        throw new Error(`Mutation "addPerson" requires first name.`);
    }
    else if (last.length === 0) {
        throw new Error(`Mutation "addPerson" requires last name.`);
    }
    const { insertedId, insertedCount } = yield db
        .collection("people")
        .insertOne({
        name: {
            first,
            last,
        },
    });
    if (insertedCount === 0) {
        throw new Error(`Failed to add person: ${JSON.stringify(args, null, 2)}`);
    }
    const [newPerson] = yield db
        .collection("people")
        .aggregate([
        { $match: { _id: new mongodb_1.ObjectID(insertedId) } },
        { $limit: 1 },
        { $addFields: { id: { $toString: "$_id" } } },
    ])
        .toArray();
    return newPerson;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicGVyc29uLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL3Jlc29sdmVycy9wZXJzb24udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7QUFBQSxxQ0FBbUM7QUFJdEIsUUFBQSxNQUFNLEdBQTZCLENBQzlDLE1BQU0sRUFDTixJQUFJLEVBQ0osT0FBTyxFQUNQLElBQUksRUFDSixFQUFFO0lBQ0YsTUFBTSxFQUFFLFlBQVksRUFBRSxHQUFHLElBQUksQ0FBQztJQUU5QixNQUFNLEVBQUUsRUFBRSxFQUFFLEdBQUcsT0FBTyxDQUFDO0lBRXZCLElBQUksS0FBSyxHQUFHLEVBQUUsQ0FBQztJQUVmLElBQUksWUFBWSxFQUFFO1FBQ2hCLE1BQU0sS0FBSyxHQUFHLFlBQVksQ0FBQyxLQUFLLENBQUMsSUFBSSxFQUFFLENBQUMsV0FBVyxFQUFFLENBQUM7UUFDdEQsTUFBTSxJQUFJLEdBQUcsWUFBWSxDQUFDLElBQUksQ0FBQyxJQUFJLEVBQUUsQ0FBQyxXQUFXLEVBQUUsQ0FBQztRQUVwRCxNQUFNLEtBQUssR0FBRyxFQUFFLENBQUM7UUFFakIsSUFBSSxLQUFLLENBQUMsTUFBTSxHQUFHLENBQUMsRUFBRTtZQUNwQixLQUFLLENBQUMsSUFBSSxDQUFDLEVBQUUsWUFBWSxFQUFFLElBQUksTUFBTSxDQUFDLElBQUksS0FBSyxFQUFFLEVBQUUsR0FBRyxDQUFDLEVBQUUsQ0FBQyxDQUFDO1NBQzVEO1FBRUQsSUFBSSxJQUFJLENBQUMsTUFBTSxHQUFHLENBQUMsRUFBRTtZQUNuQixLQUFLLENBQUMsSUFBSSxDQUFDLEVBQUUsV0FBVyxFQUFFLElBQUksTUFBTSxDQUFDLElBQUksSUFBSSxFQUFFLEVBQUUsR0FBRyxDQUFDLEVBQUUsQ0FBQyxDQUFDO1NBQzFEO1FBRUQsUUFBUSxLQUFLLENBQUMsTUFBTSxFQUFFO1lBQ3BCLEtBQUssQ0FBQztnQkFDSixNQUFNO1lBQ1IsS0FBSyxDQUFDO2dCQUNKLEtBQUssR0FBRyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0JBQ2pCLE1BQU07WUFDUjtnQkFDRSxLQUFLLEdBQUcsRUFBRSxHQUFHLEVBQUUsS0FBSyxFQUFFLENBQUM7U0FDMUI7UUFFRCxNQUFNLE9BQU8sR0FBRyxNQUFNLEVBQUU7YUFDckIsVUFBVSxDQUFDLFFBQVEsQ0FBQzthQUNwQixTQUFTLENBQUM7WUFDVCxFQUFFLE1BQU0sRUFBRSxLQUFLLEVBQUU7WUFDakIsRUFBRSxVQUFVLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxTQUFTLEVBQUUsTUFBTSxFQUFFLEVBQUUsRUFBRTtTQUM5QyxDQUFDO2FBQ0QsT0FBTyxFQUFFLENBQUM7UUFFYixPQUFPLE9BQU8sQ0FBQztLQUNoQjtBQUNILENBQUMsQ0FBQSxDQUFDO0FBRVcsUUFBQSxTQUFTLEdBQW1DLENBQ3ZELE1BQU0sRUFDTixJQUFJLEVBQ0osT0FBTyxFQUNQLElBQUksRUFDSixFQUFFO0lBQ0YsTUFBTSxFQUFFLEVBQUUsRUFBRSxHQUFHLE9BQU8sQ0FBQztJQUV2QixNQUFNLEVBQ0osTUFBTSxFQUFFLEVBQ04sSUFBSSxFQUFFLEVBQUUsS0FBSyxFQUFFLElBQUksRUFBRSxHQUN0QixHQUNGLEdBQUcsSUFBSSxDQUFDO0lBRVQsK0RBQStEO0lBQy9ELElBQUksS0FBSyxDQUFDLE1BQU0sS0FBSyxDQUFDLEVBQUU7UUFDdEIsTUFBTSxJQUFJLEtBQUssQ0FBQywyQ0FBMkMsQ0FBQyxDQUFDO0tBQzlEO1NBQU0sSUFBSSxJQUFJLENBQUMsTUFBTSxLQUFLLENBQUMsRUFBRTtRQUM1QixNQUFNLElBQUksS0FBSyxDQUFDLDBDQUEwQyxDQUFDLENBQUM7S0FDN0Q7SUFFRCxNQUFNLEVBQUUsVUFBVSxFQUFFLGFBQWEsRUFBRSxHQUFHLE1BQU0sRUFBRTtTQUMzQyxVQUFVLENBQUMsUUFBUSxDQUFDO1NBQ3BCLFNBQVMsQ0FBQztRQUNULElBQUksRUFBRTtZQUNKLEtBQUs7WUFDTCxJQUFJO1NBQ0w7S0FDRixDQUFDLENBQUM7SUFFTCxJQUFJLGFBQWEsS0FBSyxDQUFDLEVBQUU7UUFDdkIsTUFBTSxJQUFJLEtBQUssQ0FBQyx5QkFBeUIsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLEVBQUUsSUFBSSxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQztLQUMzRTtJQUVELE1BQU0sQ0FBQyxTQUFTLENBQUMsR0FBRyxNQUFNLEVBQUU7U0FDekIsVUFBVSxDQUFDLFFBQVEsQ0FBQztTQUNwQixTQUFTLENBQUM7UUFDVCxFQUFFLE1BQU0sRUFBRSxFQUFFLEdBQUcsRUFBRSxJQUFJLGtCQUFRLENBQUMsVUFBVSxDQUFDLEVBQUUsRUFBRTtRQUM3QyxFQUFFLE1BQU0sRUFBRSxDQUFDLEVBQUU7UUFDYixFQUFFLFVBQVUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLFNBQVMsRUFBRSxNQUFNLEVBQUUsRUFBRSxFQUFFO0tBQzlDLENBQUM7U0FDRCxPQUFPLEVBQUUsQ0FBQztJQUViLE9BQU8sU0FBUyxDQUFDO0FBQ25CLENBQUMsQ0FBQSxDQUFDIn0=