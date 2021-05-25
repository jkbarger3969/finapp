import { ObjectId } from "mongodb";

import { QueryResolvers } from "../../graphTypes";

export const account: QueryResolvers["account"] = (_, { id }, { db }) => {
  return db.collection("accounts").findOne({ _id: new ObjectId(id) });
};
