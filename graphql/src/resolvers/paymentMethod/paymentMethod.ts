import { ObjectId } from "mongodb";
import { QueryResolvers } from "../../graphTypes";
import { $addFields } from "./utils";

const paymentMethod: QueryResolvers["paymentMethod"] = async (
  doc,
  args,
  context,
  info
) => {
  const { id } = args;

  const { db } = context;

  const [result] = await db
    .collection("paymentMethods")
    .aggregate([{ $match: { _id: new ObjectId(id) } }, { $addFields }])
    .toArray();

  return result || null;
};

export default paymentMethod;
