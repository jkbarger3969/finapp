import { ObjectId } from "mongodb";
import { QueryResolvers } from "../../graphTypes";

export const person: QueryResolvers["person"] = (
  _,
  { id },
  { dataSources: { accountingDb } }
) =>
  accountingDb.findOne({
    collection: "people",
    filter: { _id: new ObjectId(id) },
  });
