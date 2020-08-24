import { ObjectId } from "mongodb";

import { QueryResolvers } from "../../graphTypes";
import { addId } from "../utils/mongoUtils";
import { NodeValue } from "../../types";
import { MongoRational } from "../../utils/mongoRational";

export interface Returns {
  id: string;
  owner: NodeValue;
  amount: MongoRational;
  year: number;
}

const budget: QueryResolvers["budget"] = async (
  parent,
  args,
  context,
  info
) => {
  return (
    (
      await context.db
        .collection("budget")
        .aggregate([{ $match: { _id: new ObjectId(args.id) } }, addId])
        .toArray()
    )[0] || null
  );
};

export default budget;
