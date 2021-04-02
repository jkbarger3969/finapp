import { ObjectId } from "mongodb";
import { QueryResolvers } from "../../graphTypes";

export const projection = {
  name: { $slice: 1 },
  active: { $slice: 1 },
} as const;

export const paymentMethod: QueryResolvers["paymentMethod"] = async (
  _,
  { id },
  { db }
) =>
  db.collection("paymentMethods").findOne(
    { _id: new ObjectId(id) },
    {
      projection,
    }
  );
