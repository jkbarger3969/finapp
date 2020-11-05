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
exports.addPerson = void 0;
const mongodb_1 = require("mongodb");
/* export const people: QueryResolvers["people"] = async (
  parent,
  args,
  context,
  info
) => {
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

    const results = await db
      .collection("people")
      .aggregate([
        { $match: match },
        { $addFields: { id: { $toString: "$_id" } } },
      ])
      .toArray();

    return results;
  }
}; */
exports.addPerson = (parent, args, context, info) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const { db } = context;
    const session = (_a = context.ephemeral) === null || _a === void 0 ? void 0 : _a.session;
    const { fields: { name: { first, last }, }, } = args;
    // Ensure graphql required fields not defeated by blank string.
    if (first.length === 0) {
        throw new Error(`Mutation "addPerson" requires first name.`);
    }
    else if (last.length === 0) {
        throw new Error(`Mutation "addPerson" requires last name.`);
    }
    const { insertedId, insertedCount } = yield db.collection("people").insertOne({
        name: {
            first,
            last,
        },
    }, { session });
    if (insertedCount === 0) {
        throw new Error(`Failed to add person: ${JSON.stringify(args, null, 2)}`);
    }
    const [newPerson] = yield db
        .collection("people")
        .aggregate([
        { $match: { _id: new mongodb_1.ObjectId(insertedId) } },
        { $limit: 1 },
        { $addFields: { id: { $toString: "$_id" } } },
    ], { session })
        .toArray();
    return newPerson;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicGVyc29uLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL3Jlc29sdmVycy9wZXJzb24udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7O0FBQUEscUNBQW1DO0FBSW5DOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0tBOENLO0FBRVEsUUFBQSxTQUFTLEdBQW1DLENBQ3ZELE1BQU0sRUFDTixJQUFJLEVBQ0osT0FBTyxFQUNQLElBQUksRUFDSixFQUFFOztJQUNGLE1BQU0sRUFBRSxFQUFFLEVBQUUsR0FBRyxPQUFPLENBQUM7SUFFdkIsTUFBTSxPQUFPLFNBQUcsT0FBTyxDQUFDLFNBQVMsMENBQUUsT0FBTyxDQUFDO0lBRTNDLE1BQU0sRUFDSixNQUFNLEVBQUUsRUFDTixJQUFJLEVBQUUsRUFBRSxLQUFLLEVBQUUsSUFBSSxFQUFFLEdBQ3RCLEdBQ0YsR0FBRyxJQUFJLENBQUM7SUFFVCwrREFBK0Q7SUFDL0QsSUFBSSxLQUFLLENBQUMsTUFBTSxLQUFLLENBQUMsRUFBRTtRQUN0QixNQUFNLElBQUksS0FBSyxDQUFDLDJDQUEyQyxDQUFDLENBQUM7S0FDOUQ7U0FBTSxJQUFJLElBQUksQ0FBQyxNQUFNLEtBQUssQ0FBQyxFQUFFO1FBQzVCLE1BQU0sSUFBSSxLQUFLLENBQUMsMENBQTBDLENBQUMsQ0FBQztLQUM3RDtJQUVELE1BQU0sRUFBRSxVQUFVLEVBQUUsYUFBYSxFQUFFLEdBQUcsTUFBTSxFQUFFLENBQUMsVUFBVSxDQUFDLFFBQVEsQ0FBQyxDQUFDLFNBQVMsQ0FDM0U7UUFDRSxJQUFJLEVBQUU7WUFDSixLQUFLO1lBQ0wsSUFBSTtTQUNMO0tBQ0YsRUFDRCxFQUFFLE9BQU8sRUFBRSxDQUNaLENBQUM7SUFFRixJQUFJLGFBQWEsS0FBSyxDQUFDLEVBQUU7UUFDdkIsTUFBTSxJQUFJLEtBQUssQ0FBQyx5QkFBeUIsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLEVBQUUsSUFBSSxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQztLQUMzRTtJQUVELE1BQU0sQ0FBQyxTQUFTLENBQUMsR0FBRyxNQUFNLEVBQUU7U0FDekIsVUFBVSxDQUFDLFFBQVEsQ0FBQztTQUNwQixTQUFTLENBQ1I7UUFDRSxFQUFFLE1BQU0sRUFBRSxFQUFFLEdBQUcsRUFBRSxJQUFJLGtCQUFRLENBQUMsVUFBVSxDQUFDLEVBQUUsRUFBRTtRQUM3QyxFQUFFLE1BQU0sRUFBRSxDQUFDLEVBQUU7UUFDYixFQUFFLFVBQVUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLFNBQVMsRUFBRSxNQUFNLEVBQUUsRUFBRSxFQUFFO0tBQzlDLEVBQ0QsRUFBRSxPQUFPLEVBQUUsQ0FDWjtTQUNBLE9BQU8sRUFBRSxDQUFDO0lBRWIsT0FBTyxTQUFTLENBQUM7QUFDbkIsQ0FBQyxDQUFBLENBQUMifQ==