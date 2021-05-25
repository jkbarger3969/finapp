import { ObjectId } from "mongodb";

import { QueryResolvers } from "../../graphTypes";

export const accountCard: QueryResolvers["accountCard"] = (
  _,
  { id },
  { db }
) => {
  return db.collection("paymentCards").findOne({ _id: new ObjectId(id) });
};
