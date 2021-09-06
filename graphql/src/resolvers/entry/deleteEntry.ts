import { ObjectId } from "mongodb";
import { EntryDbRecord } from "../../dataSources/accountingDb/types";
import { MutationResolvers } from "../../graphTypes";
import { DocHistory, UpdateHistoricalDoc } from "../utils/DocHistory";
import { validateEntry } from "./entryValidators";

export const deleteEntry: MutationResolvers["deleteEntry"] = async (
  _,
  { id },
  { reqDateTime, user, dataSources: { accountingDb } }
) =>
  accountingDb.withTransaction(async () => {
    const entry = new ObjectId(id);

    const filter = { _id: entry } as const;

    await Promise.all([
      validateEntry.exists({
        entry,
        accountingDb,
      }),
      accountingDb
        .findOne({
          collection: "entries",
          filter,
          options: {
            projection: {
              deleted: 1,
            },
          },
        })
        .then((entry) => {
          if (!entry) {
            return;
          }
          if (entry.deleted[0].value) {
            throw new Error(`Entry id "${id}" is already deleted.`);
          }
        }),
    ]);

    const docHistory = new DocHistory({
      by: user.id,
      date: reqDateTime,
    });

    const update = new UpdateHistoricalDoc<EntryDbRecord>({
      docHistory,
      isRootDoc: true,
    })
      .updateHistoricalField("deleted", true)
      .valueOf();

    await accountingDb.updateOne({
      collection: "entries",
      filter,
      update,
    });

    const deletedEntry = await accountingDb.findOne({
      collection: "entries",
      filter,
      skipCache: true,
    });

    return {
      deletedEntry,
    };
  });
