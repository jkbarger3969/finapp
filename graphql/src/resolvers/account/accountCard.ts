import { ObjectId } from "mongodb";

import { QueryResolvers } from "../../graphTypes";

export const accountCard: QueryResolvers["accountCard"] = (
  _,
  { id },
  { dataSources: { accountingDb } }
) =>
  accountingDb.findOne({
    collection: "paymentCards",
    filter: { _id: new ObjectId(id) },
  });
