import { ObjectId } from "mongodb";
import { QueryResolvers } from "../../graphTypes";

export const category: Extract<QueryResolvers["category"], Function> = async (
  _,
  args,
  context
) =>
  (await context.db
    .collection("categories")
    .findOne({ _id: new ObjectId(args.id) })) || null;
