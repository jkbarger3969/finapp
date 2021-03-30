import { ObjectId } from "mongodb";
import { QueryResolvers } from "../../graphTypes";

export const category: QueryResolvers["category"] = async (_, args, context) =>
  (await context.db
    .collection("categories")
    .findOne({ _id: new ObjectId(args.id) })) || null;
