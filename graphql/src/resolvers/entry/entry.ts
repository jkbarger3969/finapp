import { ObjectId } from "mongodb";
import { QueryResolvers } from "../../graphTypes";

export const entry: Extract<QueryResolvers["entry"], Function> = (
  _,
  { id },
  { db }
) => db.collection("entries").findOne({ _id: new ObjectId(id) });
