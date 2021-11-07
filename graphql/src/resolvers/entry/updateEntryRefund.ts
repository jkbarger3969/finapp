import { ObjectId } from "mongodb";
import { UpdateOne } from "../../dataSources/accountingDb/accountingDb";
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
      dateOfRecord,
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

    const dateOfRecordUpdateBuilder = new UpdateHistoricalDoc<
      NonNullable<EntryRefundDbRecord["dateOfRecord"]>,
      "refunds.$.dateOfRecord"
    >({
      docHistory,
      isRootDoc: false,
      fieldPrefix: "refunds.$.dateOfRecord",
    });

    if (dateOfRecord?.clear) {
      dateOfRecordUpdateBuilder
        .updateHistoricalField("date", null)
        .updateHistoricalField("overrideFiscalYear", null);
    } else if (dateOfRecord) {
      const { date, overrideFiscalYear } = dateOfRecord;

      if (dateOfRecord.date) {
        dateOfRecordUpdateBuilder.updateHistoricalField("date", date);
      }

      if ((overrideFiscalYear ?? NULLISH) !== NULLISH) {
        dateOfRecordUpdateBuilder.updateHistoricalField(
          "overrideFiscalYear",
          overrideFiscalYear
        );
      }
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
    const entryRefundUpdate = updateBuilder.valueOf();
    const dateOfRecordUpdate = dateOfRecordUpdateBuilder.valueOf();

    const update = {} as UpdateOne<"entries">;

    if (entryRefundUpdate?.$set || dateOfRecordUpdate?.$set) {
      update.$set = {
        ...entryRefundUpdate?.$set,
        ...dateOfRecordUpdate?.$set,
      };
    }

    if (entryRefundUpdate?.$push || dateOfRecordUpdate?.$push) {
      update.$push = {
        ...entryRefundUpdate?.$push,
        ...dateOfRecordUpdate?.$push,
      };
    }

    await accountingDb.updateOne({
      collection: "entries",
      filter: {
        "refunds.id": refundId,
      },
      update,
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
