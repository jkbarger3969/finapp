import { ObjectId } from "mongodb";
import { QueryResolvers } from "../../graphTypes";

export const person: QueryResolvers["person"] = (_, { id }, { db }) =>
  db.collection("people").findOne({ _id: new ObjectId(id) });
