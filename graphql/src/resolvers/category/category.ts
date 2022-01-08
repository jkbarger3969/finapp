import { ObjectId } from "mongodb";
import { QueryResolvers } from "../../graphTypes";

export const category: Extract<QueryResolvers["category"], Function> = async (
  _,
  { id },
  { dataSources: { accountingDb } }
) =>
  accountingDb.findOne({
    collection: "categories",
    filter: { _id: new ObjectId(id) },
  });
