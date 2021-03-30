import { ObjectId } from "mongodb";
import { QueryResolvers } from "../../graphTypes";

export const paymentMethod: QueryResolvers["paymentMethod"] = async (
  _,
  { id },
  { db }
) => db.collection("paymentMethods").findOne({ _id: new ObjectId(id) });
