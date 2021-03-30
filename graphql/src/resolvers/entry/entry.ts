import { ObjectId } from "mongodb";

import { stages } from "./utils";
import { QueryResolvers, Entry } from "../../graphTypes";

const entry: QueryResolvers["entry"] = async (parent, args, context, info) => {
  const { id } = args;
  const { db } = context;

  const [entry] = await db
    .collection<Entry>("journalEntries")
    .aggregate([
      { $match: { _id: new ObjectId(id) } },
      stages.entryAddFields,
      stages.entryTransmutations,
    ])
    .toArray();

  return entry;
};

export default entry;
