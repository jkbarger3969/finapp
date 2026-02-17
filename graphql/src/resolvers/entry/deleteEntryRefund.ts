import { ObjectId } from "mongodb";
import { EntryRefundDbRecord } from "../../dataSources/accountingDb/types";

import { MutationResolvers } from "../../graphTypes";
import { DocHistory, UpdateHistoricalDoc } from "../utils/DocHistory";
import { validateEntry } from "./entryValidators";

export const deleteEntryRefund: MutationResolvers["deleteEntryRefund"] = (
  _,
  { id },
  context
) =>
  context.dataSources.accountingDb.withTransaction(async () => {
    const { dataSources: { accountingDb }, reqDateTime, user, authService, ipAddress, userAgent } = context;

    if (!user?.id) {
      throw new Error("Unauthorized: Please log in");
    }

    const refundId = new ObjectId(id);

    await validateEntry.refundExists({ refund: refundId, accountingDb });

    // Get refund details before deletion for audit
    const existingEntry = await accountingDb.findOne({
      collection: "entries",
      filter: { "refunds.id": refundId },
      options: {
        projection: {
          refunds: true,
        },
      },
    });
    const existingRefund = existingEntry?.refunds?.find(r => r.id.equals(refundId));

    const docHistory = new DocHistory({ by: user.id, date: reqDateTime });

    await accountingDb.updateOne({
      collection: "entries",
      filter: {
        "refunds.id": refundId,
      },
      update: new UpdateHistoricalDoc<EntryRefundDbRecord, "refunds.$">({
        docHistory,
        isRootDoc: true,
        fieldPrefix: "refunds.$",
      })
        .updateHistoricalField("deleted", true)
        .valueOf(),
    });

    // Log audit entry
    if (authService) {
      await authService.logAudit({
        userId: user.id,
        action: "REFUND_DELETE",
        resourceType: "Refund",
        resourceId: refundId,
        details: {
          description: existingRefund?.description?.[0]?.value || null,
          total: existingRefund?.total?.[0]?.value || null,
        },
        ipAddress,
        userAgent,
        timestamp: new Date(),
      });
    }

    return {
      deletedEntryRefund: await accountingDb
        .findOne({
          collection: "entries",
          filter: { "refunds.id": refundId },
          options: {
            projection: {
              refunds: true,
            },
          },
          skipCache: true,
        })
        .then(({ refunds }) => refunds.find(({ id }) => id.equals(refundId))),
    };
  });
