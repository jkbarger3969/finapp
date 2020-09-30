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
        { $match: { _id: new mongodb_1.ObjectId(insertedId) } },
        { $limit: 1 },
        { $addFields: { id: { $toString: "$_id" } } },
    ])
        .toArray();
    return newPerson;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicGVyc29uLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL3Jlc29sdmVycy9wZXJzb24udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7QUFBQSxxQ0FBbUM7QUFJbkM7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7S0E4Q0s7QUFFUSxRQUFBLFNBQVMsR0FBbUMsQ0FDdkQsTUFBTSxFQUNOLElBQUksRUFDSixPQUFPLEVBQ1AsSUFBSSxFQUNKLEVBQUU7SUFDRixNQUFNLEVBQUUsRUFBRSxFQUFFLEdBQUcsT0FBTyxDQUFDO0lBRXZCLE1BQU0sRUFDSixNQUFNLEVBQUUsRUFDTixJQUFJLEVBQUUsRUFBRSxLQUFLLEVBQUUsSUFBSSxFQUFFLEdBQ3RCLEdBQ0YsR0FBRyxJQUFJLENBQUM7SUFFVCwrREFBK0Q7SUFDL0QsSUFBSSxLQUFLLENBQUMsTUFBTSxLQUFLLENBQUMsRUFBRTtRQUN0QixNQUFNLElBQUksS0FBSyxDQUFDLDJDQUEyQyxDQUFDLENBQUM7S0FDOUQ7U0FBTSxJQUFJLElBQUksQ0FBQyxNQUFNLEtBQUssQ0FBQyxFQUFFO1FBQzVCLE1BQU0sSUFBSSxLQUFLLENBQUMsMENBQTBDLENBQUMsQ0FBQztLQUM3RDtJQUVELE1BQU0sRUFBRSxVQUFVLEVBQUUsYUFBYSxFQUFFLEdBQUcsTUFBTSxFQUFFO1NBQzNDLFVBQVUsQ0FBQyxRQUFRLENBQUM7U0FDcEIsU0FBUyxDQUFDO1FBQ1QsSUFBSSxFQUFFO1lBQ0osS0FBSztZQUNMLElBQUk7U0FDTDtLQUNGLENBQUMsQ0FBQztJQUVMLElBQUksYUFBYSxLQUFLLENBQUMsRUFBRTtRQUN2QixNQUFNLElBQUksS0FBSyxDQUFDLHlCQUF5QixJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksRUFBRSxJQUFJLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDO0tBQzNFO0lBRUQsTUFBTSxDQUFDLFNBQVMsQ0FBQyxHQUFHLE1BQU0sRUFBRTtTQUN6QixVQUFVLENBQUMsUUFBUSxDQUFDO1NBQ3BCLFNBQVMsQ0FBQztRQUNULEVBQUUsTUFBTSxFQUFFLEVBQUUsR0FBRyxFQUFFLElBQUksa0JBQVEsQ0FBQyxVQUFVLENBQUMsRUFBRSxFQUFFO1FBQzdDLEVBQUUsTUFBTSxFQUFFLENBQUMsRUFBRTtRQUNiLEVBQUUsVUFBVSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsU0FBUyxFQUFFLE1BQU0sRUFBRSxFQUFFLEVBQUU7S0FDOUMsQ0FBQztTQUNELE9BQU8sRUFBRSxDQUFDO0lBRWIsT0FBTyxTQUFTLENBQUM7QUFDbkIsQ0FBQyxDQUFBLENBQUMifQ==