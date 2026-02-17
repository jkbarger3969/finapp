import { ObjectId } from "mongodb";
import { EntryDbRecord } from "../../dataSources/accountingDb/types";
import { MutationResolvers } from "../../graphTypes";
import { DocHistory, UpdateHistoricalDoc } from "../utils/DocHistory";
import { validateEntry } from "./entryValidators";

export const deleteEntry: MutationResolvers["deleteEntry"] = async (
  _,
  { id },
  context
) =>
  context.dataSources.accountingDb.withTransaction(async () => {
    const { reqDateTime, user, dataSources: { accountingDb }, authService, ipAddress, userAgent } = context;

    if (!user?.id) {
      throw new Error("Unauthorized: Please log in");
    }

    const entry = new ObjectId(id);

    const filter = { _id: entry } as const;

    // Get entry details before deletion for audit
    const existingEntry = await accountingDb.findOne({
      collection: "entries",
      filter,
    });

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

    // Log audit entry
    if (authService) {
      await authService.logAudit({
        userId: user.id,
        action: "ENTRY_DELETE",
        resourceType: "Entry",
        resourceId: entry,
        details: {
          description: existingEntry?.description?.[0]?.value || null,
          total: existingEntry?.total?.[0]?.value || null,
        },
        ipAddress,
        userAgent,
        timestamp: new Date(),
      });
    }

    const deletedEntry = await accountingDb.findOne({
      collection: "entries",
      filter,
      skipCache: true,
    });

    return {
      deletedEntry,
    };
  });
