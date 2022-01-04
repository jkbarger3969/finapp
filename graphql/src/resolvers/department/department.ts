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
  { dataSources: { accountingDb } }
) => {
  return accountingDb.findOne({
    collection: "departments",
    filter: { _id: new ObjectId(id) },
  });
};
