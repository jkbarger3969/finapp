import { ObjectId } from "mongodb";
import { QueryResolvers } from "../../graphTypes";

export const entry: Extract<QueryResolvers["entry"], Function> = (
  _,
  { id },
  { db, dataSources: { accountingDb } }
) =>
  accountingDb.findOne({
    collection: "entries",
    filter: { _id: new ObjectId(id) },
  });
