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
const addId = { $addFields: { id: { $toString: "$_id" } } };
/* export const businesses: QueryResolvers["businesses"] = async (
  parent,
  args,
  context,
  info
) => {
  const { db } = context;
  const searchByName = args.searchByName ? args.searchByName.trim() : "";

  if (searchByName.length > 0) {
    const nameResults = await db
      .collection("businesses")
      .aggregate([
        { $match: { name: new RegExp(`(^|\\s)${searchByName}`, "i") } },
        addId,
      ])
      .toArray();

    return nameResults;
  }

  const allBusinesses = await db
    .collection("businesses")
    .aggregate([addId])
    .toArray();

  return allBusinesses;
};

export const business: QueryResolvers["business"] = async (
  parent,
  args,
  context,
  info
) => {
  const { id } = args;

  const { db } = context;

  const result = await db
    .collection("businesses")
    .aggregate([{ $match: { _id: new ObjectId(id) } }, { $limit: 1 }, addId])
    .toArray();

  return result[0];
};

export const departments: BusinessResolvers["departments"] = async (
  parent,
  args,
  context,
  info
) => {
  const { id } = parent;

  return departmentsResolver({}, { fromParent: id }, context, info);
}; */
exports.addBusiness = (parent, args, context, info) => __awaiter(void 0, void 0, void 0, function* () {
    const { db } = context;
    const { fields: { name }, } = args;
    if (!name.trim()) {
        throw new Error(`Mutation "addBusiness" name.`);
    }
    const { insertedCount, insertedId } = yield db
        .collection("businesses")
        .insertOne({ name, verified: false });
    if (insertedCount === 0) {
        throw new Error(`Mutation "addBusiness" arguments "${JSON.stringify(args)}" failed.`);
    }
    const newBusiness = yield db
        .collection("businesses")
        .aggregate([
        { $match: { _id: new mongodb_1.ObjectId(insertedId) } },
        { $limit: 1 },
        { $addFields: { id: { $toString: "$_id" } } },
    ])
        .toArray();
    return newBusiness[0];
});
/* export const Business: BusinessResolvers = {
  budget: nodeFieldResolver,
  departments,
}; */
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYnVzaW5lc3MuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvcmVzb2x2ZXJzL2J1c2luZXNzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7O0FBQUEscUNBQW1DO0FBU25DLE1BQU0sS0FBSyxHQUFHLEVBQUUsVUFBVSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsU0FBUyxFQUFFLE1BQU0sRUFBRSxFQUFFLEVBQUUsQ0FBQztBQUU1RDs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7S0F3REs7QUFFUSxRQUFBLFdBQVcsR0FBcUMsQ0FDM0QsTUFBTSxFQUNOLElBQUksRUFDSixPQUFPLEVBQ1AsSUFBSSxFQUNKLEVBQUU7SUFDRixNQUFNLEVBQUUsRUFBRSxFQUFFLEdBQUcsT0FBTyxDQUFDO0lBRXZCLE1BQU0sRUFDSixNQUFNLEVBQUUsRUFBRSxJQUFJLEVBQUUsR0FDakIsR0FBRyxJQUFJLENBQUM7SUFFVCxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksRUFBRSxFQUFFO1FBQ2hCLE1BQU0sSUFBSSxLQUFLLENBQUMsOEJBQThCLENBQUMsQ0FBQztLQUNqRDtJQUVELE1BQU0sRUFBRSxhQUFhLEVBQUUsVUFBVSxFQUFFLEdBQUcsTUFBTSxFQUFFO1NBQzNDLFVBQVUsQ0FBQyxZQUFZLENBQUM7U0FDeEIsU0FBUyxDQUFDLEVBQUUsSUFBSSxFQUFFLFFBQVEsRUFBRSxLQUFLLEVBQUUsQ0FBQyxDQUFDO0lBRXhDLElBQUksYUFBYSxLQUFLLENBQUMsRUFBRTtRQUN2QixNQUFNLElBQUksS0FBSyxDQUNiLHFDQUFxQyxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxXQUFXLENBQ3JFLENBQUM7S0FDSDtJQUVELE1BQU0sV0FBVyxHQUFHLE1BQU0sRUFBRTtTQUN6QixVQUFVLENBQUMsWUFBWSxDQUFDO1NBQ3hCLFNBQVMsQ0FBQztRQUNULEVBQUUsTUFBTSxFQUFFLEVBQUUsR0FBRyxFQUFFLElBQUksa0JBQVEsQ0FBQyxVQUFVLENBQUMsRUFBRSxFQUFFO1FBQzdDLEVBQUUsTUFBTSxFQUFFLENBQUMsRUFBRTtRQUNiLEVBQUUsVUFBVSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsU0FBUyxFQUFFLE1BQU0sRUFBRSxFQUFFLEVBQUU7S0FDOUMsQ0FBQztTQUNELE9BQU8sRUFBRSxDQUFDO0lBRWIsT0FBTyxXQUFXLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDeEIsQ0FBQyxDQUFBLENBQUM7QUFFRjs7O0tBR0sifQ==