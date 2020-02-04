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
        const results = yield db.collection("people").aggregate([
            { $match: match },
            { $addFields: { id: { $toString: "$_id" } } }
        ]).toArray();
        return results;
    }
});
exports.addPerson = (parent, args, context, info) => __awaiter(void 0, void 0, void 0, function* () {
    const { db } = context;
    const { fields: { name: { first, last } } } = args;
    if (first.length === 0) {
        throw new Error(`Mutation "addPerson" requires first name.`);
    }
    else if (last.length === 0) {
        throw new Error(`Mutation "addPerson" requires last name.`);
    }
    const { insertedId, insertedCount } = yield db.collection("people").insertOne({
        name: {
            first,
            last
        }
    });
    if (insertedCount === 0) {
        throw new Error(`Mutation "addPerson" arguments "${JSON.stringify(args)}" failed.`);
    }
    const newPerson = yield db.collection("people").aggregate([
        { $match: { _id: new mongodb_1.ObjectID(insertedId) } },
        { $limit: 1 },
        { $addFields: { id: { $toString: "$_id" } } }
    ]).toArray();
    return newPerson[0];
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicGVyc29uLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL3Jlc29sdmVycy9wZXJzb24udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7QUFBQSxxQ0FBaUM7QUFJcEIsUUFBQSxNQUFNLEdBQ2pCLENBQU8sTUFBTSxFQUFFLElBQUksRUFBRSxPQUFPLEVBQUUsSUFBSSxFQUFFLEVBQUU7SUFHdEMsTUFBTSxFQUFDLFlBQVksRUFBQyxHQUFHLElBQUksQ0FBQztJQUU1QixNQUFNLEVBQUMsRUFBRSxFQUFDLEdBQUcsT0FBTyxDQUFDO0lBRXJCLElBQUksS0FBSyxHQUFHLEVBQUUsQ0FBQztJQUVmLElBQUcsWUFBWSxFQUFFO1FBRWYsTUFBTSxLQUFLLEdBQUcsWUFBWSxDQUFDLEtBQUssQ0FBQyxJQUFJLEVBQUUsQ0FBQyxXQUFXLEVBQUUsQ0FBQztRQUN0RCxNQUFNLElBQUksR0FBRyxZQUFZLENBQUMsSUFBSSxDQUFDLElBQUksRUFBRSxDQUFDLFdBQVcsRUFBRSxDQUFDO1FBRXBELE1BQU0sS0FBSyxHQUFHLEVBQUUsQ0FBQztRQUVqQixJQUFHLEtBQUssQ0FBQyxNQUFNLEdBQUcsQ0FBQyxFQUFFO1lBQ25CLEtBQUssQ0FBQyxJQUFJLENBQUMsRUFBQyxZQUFZLEVBQUMsSUFBSSxNQUFNLENBQUMsSUFBSSxLQUFLLEVBQUUsRUFBRSxHQUFHLENBQUMsRUFBQyxDQUFDLENBQUM7U0FDekQ7UUFFRCxJQUFHLElBQUksQ0FBQyxNQUFNLEdBQUcsQ0FBQyxFQUFFO1lBQ2xCLEtBQUssQ0FBQyxJQUFJLENBQUMsRUFBQyxXQUFXLEVBQUMsSUFBSSxNQUFNLENBQUMsSUFBSSxJQUFJLEVBQUUsRUFBRSxHQUFHLENBQUMsRUFBQyxDQUFDLENBQUM7U0FDdkQ7UUFFRCxRQUFPLEtBQUssQ0FBQyxNQUFNLEVBQUU7WUFDbkIsS0FBSyxDQUFDO2dCQUNKLE1BQU07WUFDUixLQUFLLENBQUM7Z0JBQ0osS0FBSyxHQUFHLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQztnQkFDakIsTUFBTTtZQUNSO2dCQUNFLEtBQUssR0FBRyxFQUFDLEdBQUcsRUFBQyxLQUFLLEVBQUMsQ0FBQztTQUN2QjtRQUVELE1BQU0sT0FBTyxHQUFHLE1BQU0sRUFBRSxDQUFDLFVBQVUsQ0FBQyxRQUFRLENBQUMsQ0FBQyxTQUFTLENBQUM7WUFDdEQsRUFBQyxNQUFNLEVBQUMsS0FBSyxFQUFDO1lBQ2QsRUFBQyxVQUFVLEVBQUMsRUFBQyxFQUFFLEVBQUMsRUFBQyxTQUFTLEVBQUMsTUFBTSxFQUFDLEVBQUMsRUFBQztTQUNyQyxDQUFDLENBQUMsT0FBTyxFQUFFLENBQUM7UUFFYixPQUFPLE9BQU8sQ0FBQztLQUVoQjtBQUVILENBQUMsQ0FBQSxDQUFBO0FBRVksUUFBQSxTQUFTLEdBQ3BCLENBQU0sTUFBTSxFQUFFLElBQUksRUFBRSxPQUFPLEVBQUUsSUFBSSxFQUFFLEVBQUU7SUFHckMsTUFBTSxFQUFDLEVBQUUsRUFBQyxHQUFHLE9BQU8sQ0FBQztJQUVyQixNQUFNLEVBQUMsTUFBTSxFQUFDLEVBQUMsSUFBSSxFQUFDLEVBQUMsS0FBSyxFQUFFLElBQUksRUFBQyxFQUFDLEVBQUMsR0FBRyxJQUFJLENBQUM7SUFFM0MsSUFBRyxLQUFLLENBQUMsTUFBTSxLQUFLLENBQUMsRUFBRTtRQUNyQixNQUFNLElBQUksS0FBSyxDQUFDLDJDQUEyQyxDQUFDLENBQUM7S0FDOUQ7U0FBTSxJQUFHLElBQUksQ0FBQyxNQUFNLEtBQUssQ0FBQyxFQUFFO1FBQzNCLE1BQU0sSUFBSSxLQUFLLENBQUMsMENBQTBDLENBQUMsQ0FBQztLQUM3RDtJQUVELE1BQU0sRUFBQyxVQUFVLEVBQUUsYUFBYSxFQUFDLEdBQUcsTUFBTSxFQUFFLENBQUMsVUFBVSxDQUFDLFFBQVEsQ0FBQyxDQUFDLFNBQVMsQ0FBQztRQUMxRSxJQUFJLEVBQUM7WUFDSCxLQUFLO1lBQ0wsSUFBSTtTQUNMO0tBQ0YsQ0FBQyxDQUFDO0lBRUgsSUFBRyxhQUFhLEtBQUssQ0FBQyxFQUFFO1FBQ3RCLE1BQU0sSUFBSSxLQUFLLENBQUMsbUNBQW1DLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxDQUFDO0tBQ3JGO0lBRUQsTUFBTSxTQUFTLEdBQUcsTUFBTSxFQUFFLENBQUMsVUFBVSxDQUFDLFFBQVEsQ0FBQyxDQUFDLFNBQVMsQ0FBQztRQUN4RCxFQUFDLE1BQU0sRUFBQyxFQUFDLEdBQUcsRUFBQyxJQUFJLGtCQUFRLENBQUMsVUFBVSxDQUFDLEVBQUMsRUFBQztRQUN2QyxFQUFDLE1BQU0sRUFBQyxDQUFDLEVBQUM7UUFDVixFQUFDLFVBQVUsRUFBQyxFQUFDLEVBQUUsRUFBQyxFQUFDLFNBQVMsRUFBQyxNQUFNLEVBQUMsRUFBQyxFQUFDO0tBQ3JDLENBQUMsQ0FBQyxPQUFPLEVBQUUsQ0FBQztJQUViLE9BQU8sU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBRXRCLENBQUMsQ0FBQSxDQUFBIn0=