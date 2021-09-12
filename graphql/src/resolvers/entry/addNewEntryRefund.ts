import { ObjectId } from "mongodb";
import { EntryRefundDbRecord } from "../../dataSources/accountingDb/types";
import { MutationResolvers } from "../../graphTypes";
import { fractionToRational } from "../../utils/mongoRational";
import { upsertPaymentMethodToDbRecord } from "../paymentMethod";
import { DocHistory, NewHistoricalDoc } from "../utils/DocHistory";
import { getUniqueId } from "../utils/mongoUtils";
import { validateEntry } from "./entryValidators";

export const addNewEntryRefund: MutationResolvers["addNewEntryRefund"] = (
  _,
  { input },
  { dataSources: { accountingDb }, reqDateTime, user }
) =>
  accountingDb.withTransaction(async () => {
    await validateEntry.newEntryRefund({
      newEntryRefund: input,
      reqDateTime,
      accountingDb,
    });

    const {
      entry,
      date,
      paymentMethod: paymentMethodInput,
      description: descriptionInput,
      total: totalInput,
      reconciled,
    } = input;

    const entryId = new ObjectId(entry);

    // convert
    const paymentMethod = upsertPaymentMethodToDbRecord({
      upsertPaymentMethod: paymentMethodInput,
    });
    const description = descriptionInput?.trim();
    const total = fractionToRational(totalInput);

    const docHistory = new DocHistory({ by: user.id, date: reqDateTime });

    const refundId = await getUniqueId(
      "refunds.id",
      accountingDb.db.collection("entries")
    );

    const newDocBuilder = new NewHistoricalDoc<EntryRefundDbRecord>({
      docHistory,
      isRootDoc: true,
    })
      .addFieldValued("id", refundId)
      .addHistoricalField("date", date)
      .addHistoricalField("deleted", false)
      .addHistoricalField("paymentMethod", paymentMethod)
      .addHistoricalField("total", total)
      .addHistoricalField("reconciled", reconciled ?? false);

    if (description) {
      newDocBuilder.addHistoricalField("description", description);
    }

    await accountingDb.updateOne({
      collection: "entries",
      filter: { _id: entryId },
      update: {
        $push: {
          refunds: newDocBuilder.valueOf(),
        },
      },
    });

    return {
      newEntryRefund: await accountingDb
        .findOne({
          collection: "entries",
          filter: { "refunds.id": refundId },
          options: {
            projection: {
              refunds: true,
            },
          },
        })
        .then(({ refunds }) => refunds.find(({ id }) => id.equals(refundId))),
    };
  });
