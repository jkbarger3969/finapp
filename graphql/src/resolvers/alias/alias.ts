import { ObjectId } from "mongodb";

import { QueryResolvers } from "../../graphTypes";

export const alias: QueryResolvers["alias"] = (_, { id }, { db }) =>
  db.collection("aliases").findOne({ _id: new ObjectId(id) }) as any;
