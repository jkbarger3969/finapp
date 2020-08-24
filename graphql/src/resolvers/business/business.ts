import { QueryResolvers } from "../../graphTypes";
import { NodeValue } from "../../types";
import { ObjectId } from "mongodb";
import { addId } from "../utils/mongoUtils";

export interface Returns {
  id: string;
  name: string;
  budget?: NodeValue;
  vendor?: {
    approved: boolean;
    vendorId: string;
  };
}

const business: QueryResolvers["business"] = async (
  parent,
  args,
  context,
  info
) => {
  return (
    (
      await context.db
        .collection("businesses")
        .aggregate([{ $match: { _id: new ObjectId(args.id) } }, addId])
        .toArray()
    )[0] || null
  );
};

export default business;
