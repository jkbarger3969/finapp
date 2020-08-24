import { ObjectId } from "mongodb";

import { QueryResolvers } from "../../graphTypes";
import { addId } from "../utils/mongoUtils";
import { NodeValue } from "../../types";

export interface Returns {
  id: string;
  name: string;
  parent: NodeValue;
}

const department: QueryResolvers["department"] = async (
  parent,
  args,
  context,
  info
) => {
  return (
    (
      await context.db
        .collection("department")
        .aggregate([{ $match: { _id: new ObjectId(args.id) } }, addId])
        .toArray()
    )[0] || null
  );
};

export default department;
