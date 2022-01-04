import { ObjectId } from "mongodb";

import { QueryResolvers } from "../../graphTypes";

export const account: QueryResolvers["account"] = (
  _,
  { id },
  { dataSources: { accountingDb } }
) => {
  return accountingDb.findOne({
    collection: "accounts",
    filter: { _id: new ObjectId(id) },
  });
  // .collection("accounts").findOne({ _id: new ObjectId(id) });
};
