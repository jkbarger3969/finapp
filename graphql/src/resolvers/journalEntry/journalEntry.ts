import { ObjectID } from "mongodb";

import { entryAddFieldsStage, entryTransmutationsStage } from "./utils";
import { QueryResolvers, JournalEntry } from "../../graphTypes";

const journalEntry: QueryResolvers["journalEntry"] = async (
  parent,
  args,
  context,
  info
) => {
  const { id } = args;
  const { db } = context;

  const [entry] = await db
    .collection<JournalEntry>("journalEntries")
    .aggregate([
      { $match: { _id: new ObjectID(id) } },
      entryAddFieldsStage,
      entryTransmutationsStage,
    ])
    .toArray();

  return entry;
};

export default journalEntry;
