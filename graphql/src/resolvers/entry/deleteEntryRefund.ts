import { ObjectId } from "mongodb";
import { EntryRefundDbRecord } from "../../dataSources/accountingDb/types";

import { MutationResolvers } from "../../graphTypes";
import { DocHistory, UpdateHistoricalDoc } from "../utils/DocHistory";
import { validateEntry } from "./entryValidators";

export const deleteEntryRefund: MutationResolvers["deleteEntryRefund"] = (
  _,
  { id },
  { dataSources: { accountingDb }, reqDateTime, user }
) =>
  accountingDb.withTransaction(async () => {
    const refundId = new ObjectId(id);

    await validateEntry.refundExists({ refund: refundId, accountingDb });

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
