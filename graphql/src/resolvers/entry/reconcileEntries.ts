import { ObjectId } from "mongodb";
import { validateEntry } from ".";
import { UpdateOne } from "../../dataSources/accountingDb/accountingDb";
import {
  EntryDbRecord,
  EntryRefundDbRecord,
} from "../../dataSources/accountingDb/types";
import { MutationResolvers } from "../../graphTypes";
import { DocHistory, UpdateHistoricalDoc } from "../utils/DocHistory";
import { checkPermission } from "../utils/permissions";

export const reconcileEntries: MutationResolvers["reconcileEntries"] = async (
  _,
  { input },
  context
) => {
  const { reqDateTime, user, dataSources: { accountingDb }, authService, ipAddress, userAgent } = context;

  // Check permission - only SUPER_ADMIN can reconcile entries
  await checkPermission(context, "EDIT_TRANSACTION");

  await validateEntry.reconcileEntries({
    reconcileEntries: input,
    accountingDb,
  });

  const docHistory = new DocHistory({ by: user.id, date: reqDateTime });

  const entriesSet = new Set(input.entries || []);
  const refundsSet = new Set(input.refunds || []);

  await Promise.all([
    ...[...entriesSet].map((entry) => {
      const updateBuilder = new UpdateHistoricalDoc<EntryDbRecord>({
        docHistory,
        isRootDoc: true,
      }).updateHistoricalField("reconciled", true);

      const entryUpdate = updateBuilder.valueOf();

      const update = {} as UpdateOne<"entries">;

      if (entryUpdate?.$set) {
        update.$set = {
          ...entryUpdate?.$set,
        };
      }

      if (entryUpdate?.$push) {
        update.$push = {
          ...entryUpdate?.$push,
        };
      }

      return accountingDb.updateOne({
        collection: "entries",
        filter: { _id: new ObjectId(entry) },
        update,
      });
    }),
    ...[...refundsSet].map((refund) => {
      const updateBuilder = new UpdateHistoricalDoc<
        EntryRefundDbRecord,
        "refunds.$"
      >({
        docHistory,
        isRootDoc: true,
        fieldPrefix: "refunds.$",
      }).updateHistoricalField("reconciled", true);

      return accountingDb.updateOne({
        collection: "entries",
        filter: {
          "refunds.id": new ObjectId(refund),
        },
        update: updateBuilder.valueOf(),
      });
    }),
  ]);

  // Log audit entries for reconciliation
  if (authService) {
    if (entriesSet.size > 0) {
      await authService.logAudit({
        userId: user.id,
        action: "RECONCILE",
        resourceType: "Entry",
        details: {
          entryIds: [...entriesSet],
          count: entriesSet.size,
        },
        ipAddress,
        userAgent,
        timestamp: new Date(),
      });
    }
    if (refundsSet.size > 0) {
      await authService.logAudit({
        userId: user.id,
        action: "RECONCILE",
        resourceType: "Refund",
        details: {
          refundIds: [...refundsSet],
          count: refundsSet.size,
        },
        ipAddress,
        userAgent,
        timestamp: new Date(),
      });
    }
  }

  return {
    reconciledEntries: input.entries?.length
      ? await accountingDb.find({
          collection: "entries",
          filter: {
            _id: { $in: [...entriesSet].map((id) => new ObjectId(id)) },
          },
        })
      : [],
    reconciledRefunds: input.refunds?.length
      ? (
          await accountingDb.find({
            collection: "entries",
            filter: {
              "refunds.id": {
                $in: [...refundsSet].map((id) => new ObjectId(id)),
              },
            },
            options: {
              projection: {
                refunds: true,
              },
            },
          })
        ).reduce((reconciledRefunds, { refunds }) => {
          reconciledRefunds.push(
            ...refunds.filter(({ id }) => refundsSet.has(id.toHexString()))
          );

          return reconciledRefunds;
        }, [] as EntryRefundDbRecord[])
      : [],
  };
};
