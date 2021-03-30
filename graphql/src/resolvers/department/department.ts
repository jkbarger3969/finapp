import { ObjectId } from "mongodb";

import { QueryResolvers } from "../../graphTypes";
import { NodeValue } from "../../types";

export interface Returns {
  id: string;
  name: string;
  parent: NodeValue;
}

export const department: QueryResolvers["department"] = async (
  _,
  { id },
  { db }
) => {
  return db.collection("departments").findOne({ _id: new ObjectId(id) });
};
