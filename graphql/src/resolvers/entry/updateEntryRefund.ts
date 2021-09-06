import { ObjectId } from "mongodb";
import { EntryRefundDbRecord } from "../../dataSources/accountingDb/types";
import { MutationResolvers } from "../../graphTypes";
import { fractionToRational } from "../../utils/mongoRational";
import { upsertPaymentMethodToDbRecord } from "../paymentMethod";
import { DocHistory, UpdateHistoricalDoc } from "../utils/DocHistory";
import { validateEntry } from "./entryValidators";

const NULLISH = Symbol();

export const updateEntryRefund: MutationResolvers["updateEntryRefund"] = (
  _,
  { input },
  { dataSources: { accountingDb }, reqDateTime, user }
) =>
  accountingDb.withTransaction(async () => {
    await validateEntry.updateEntryRefund({
      accountingDb,
      reqDateTime,
      updateEntryRefund: input,
    });

    const {
      id,
      date,
      paymentMethod: paymentMethodInput,
      description: descriptionInput,
      total,
      reconciled,
    } = input;

    const description = descriptionInput?.trim();

    const refundId = new ObjectId(id);

    const docHistory = new DocHistory({ by: user.id, date: reqDateTime });

    const updateBuilder = new UpdateHistoricalDoc<
      EntryRefundDbRecord,
      "refunds.$"
    >({
      docHistory,
      isRootDoc: true,
      fieldPrefix: "refunds.$",
    });

    if (date) {
      updateBuilder.updateHistoricalField("date", date);
    }

    if (paymentMethodInput) {
      updateBuilder.updateHistoricalField(
        "paymentMethod",
        upsertPaymentMethodToDbRecord({
          upsertPaymentMethod: paymentMethodInput,
        })
      );
    }

    if (description) {
      updateBuilder.updateHistoricalField("description", description);
    }

    if (description) {
      updateBuilder.updateHistoricalField("description", description);
    }

    if (total) {
      updateBuilder.updateHistoricalField("total", fractionToRational(total));
    }

    if ((reconciled ?? NULLISH) !== NULLISH) {
      updateBuilder.updateHistoricalField("reconciled", reconciled);
    }

    await accountingDb.updateOne({
      collection: "entries",
      filter: {
        "refunds.id": refundId,
      },
      update: updateBuilder.valueOf(),
    });

    return {
      updatedEntryRefund: await accountingDb
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
