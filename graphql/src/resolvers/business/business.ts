import { QueryResolvers } from "../../graphTypes";
import { NodeValue } from "../../types";
import { ObjectId } from "mongodb";

export interface Returns {
  id: string;
  name: string;
  budget?: NodeValue;
  vendor?: {
    approved: boolean;
    vendorId: string;
  };
}

export const business: QueryResolvers["business"] = (
  _,
  { id },
  { dataSources: { accountingDb } }
) =>
  accountingDb.findOne({
    collection: "businesses",
    filter: { _id: new ObjectId(id) },
  });
