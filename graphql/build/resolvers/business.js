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
exports.addBusiness = void 0;
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
    var _a;
    const { db } = context;
    const session = (_a = context.ephemeral) === null || _a === void 0 ? void 0 : _a.session;
    const { fields: { name }, } = args;
    if (!name.trim()) {
        throw new Error(`Mutation "addBusiness" name.`);
    }
    const { insertedCount, insertedId } = yield db
        .collection("businesses")
        .insertOne({ name, verified: false }, { session });
    if (insertedCount === 0) {
        throw new Error(`Mutation "addBusiness" arguments "${JSON.stringify(args)}" failed.`);
    }
    const newBusiness = yield db
        .collection("businesses")
        .aggregate([
        { $match: { _id: new mongodb_1.ObjectId(insertedId) } },
        { $limit: 1 },
        { $addFields: { id: { $toString: "$_id" } } },
    ], { session })
        .toArray();
    return newBusiness[0];
});
/* export const Business: BusinessResolvers = {
  budget: nodeFieldResolver,
  departments,
}; */
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYnVzaW5lc3MuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvcmVzb2x2ZXJzL2J1c2luZXNzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7OztBQUFBLHFDQUFtQztBQVNuQyxNQUFNLEtBQUssR0FBRyxFQUFFLFVBQVUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLFNBQVMsRUFBRSxNQUFNLEVBQUUsRUFBRSxFQUFFLENBQUM7QUFFNUQ7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0tBd0RLO0FBRVEsUUFBQSxXQUFXLEdBQXFDLENBQzNELE1BQU0sRUFDTixJQUFJLEVBQ0osT0FBTyxFQUNQLElBQUksRUFDSixFQUFFOztJQUNGLE1BQU0sRUFBRSxFQUFFLEVBQUUsR0FBRyxPQUFPLENBQUM7SUFFdkIsTUFBTSxPQUFPLFNBQUcsT0FBTyxDQUFDLFNBQVMsMENBQUUsT0FBTyxDQUFDO0lBRTNDLE1BQU0sRUFDSixNQUFNLEVBQUUsRUFBRSxJQUFJLEVBQUUsR0FDakIsR0FBRyxJQUFJLENBQUM7SUFFVCxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksRUFBRSxFQUFFO1FBQ2hCLE1BQU0sSUFBSSxLQUFLLENBQUMsOEJBQThCLENBQUMsQ0FBQztLQUNqRDtJQUVELE1BQU0sRUFBRSxhQUFhLEVBQUUsVUFBVSxFQUFFLEdBQUcsTUFBTSxFQUFFO1NBQzNDLFVBQVUsQ0FBQyxZQUFZLENBQUM7U0FDeEIsU0FBUyxDQUFDLEVBQUUsSUFBSSxFQUFFLFFBQVEsRUFBRSxLQUFLLEVBQUUsRUFBRSxFQUFFLE9BQU8sRUFBRSxDQUFDLENBQUM7SUFFckQsSUFBSSxhQUFhLEtBQUssQ0FBQyxFQUFFO1FBQ3ZCLE1BQU0sSUFBSSxLQUFLLENBQ2IscUNBQXFDLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FDckUsQ0FBQztLQUNIO0lBRUQsTUFBTSxXQUFXLEdBQUcsTUFBTSxFQUFFO1NBQ3pCLFVBQVUsQ0FBQyxZQUFZLENBQUM7U0FDeEIsU0FBUyxDQUNSO1FBQ0UsRUFBRSxNQUFNLEVBQUUsRUFBRSxHQUFHLEVBQUUsSUFBSSxrQkFBUSxDQUFDLFVBQVUsQ0FBQyxFQUFFLEVBQUU7UUFDN0MsRUFBRSxNQUFNLEVBQUUsQ0FBQyxFQUFFO1FBQ2IsRUFBRSxVQUFVLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxTQUFTLEVBQUUsTUFBTSxFQUFFLEVBQUUsRUFBRTtLQUM5QyxFQUNELEVBQUUsT0FBTyxFQUFFLENBQ1o7U0FDQSxPQUFPLEVBQUUsQ0FBQztJQUViLE9BQU8sV0FBVyxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQ3hCLENBQUMsQ0FBQSxDQUFDO0FBRUY7OztLQUdLIn0=