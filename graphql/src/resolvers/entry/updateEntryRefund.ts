import { ObjectId } from "mongodb";
import { UpdateOne } from "../../dataSources/accountingDb/accountingDb";
import { EntryRefundDbRecord } from "../../dataSources/accountingDb/types";
import { MutationResolvers } from "../../graphTypes";
import { fractionToRational } from "../../utils/mongoRational";
import { upsertPaymentMethodToDbRecord } from "../paymentMethod";
import { DocHistory, UpdateHistoricalDoc } from "../utils/DocHistory";
import { checkPermission } from "../utils/permissions";
import { validateEntry } from "./entryValidators";

const NULLISH = Symbol();

export const updateEntryRefund: MutationResolvers["updateEntryRefund"] = (
  _,
  { input },
  context
) =>
  context.dataSources.accountingDb.withTransaction(async () => {
    const { dataSources: { accountingDb }, reqDateTime, user, authService, ipAddress, userAgent } = context;

    // Check permission - only SUPER_ADMIN can edit refunds
    await checkPermission(context, "EDIT_TRANSACTION");

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

    const changedFields: string[] = [];

    if (date) {
      updateBuilder.updateHistoricalField("date", date);
      changedFields.push("date");
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
      changedFields.push("dateOfRecord");
    } else if (dateOfRecord) {
      const { date, overrideFiscalYear } = dateOfRecord;

      if (dateOfRecord.date) {
        dateOfRecordUpdateBuilder.updateHistoricalField("date", date);
        changedFields.push("dateOfRecord.date");
      }

      if ((overrideFiscalYear ?? NULLISH) !== NULLISH) {
        dateOfRecordUpdateBuilder.updateHistoricalField(
          "overrideFiscalYear",
          overrideFiscalYear
        );
        changedFields.push("dateOfRecord.overrideFiscalYear");
      }
    }

    if (paymentMethodInput) {
      updateBuilder.updateHistoricalField(
        "paymentMethod",
        upsertPaymentMethodToDbRecord({
          upsertPaymentMethod: paymentMethodInput,
        })
      );
      changedFields.push("paymentMethod");
    }

    if (description) {
      updateBuilder.updateHistoricalField("description", description);
      changedFields.push("description");
    }

    if (total) {
      updateBuilder.updateHistoricalField("total", fractionToRational(total));
      changedFields.push("total");
    }

    if ((reconciled ?? NULLISH) !== NULLISH) {
      updateBuilder.updateHistoricalField("reconciled", reconciled);
      changedFields.push("reconciled");
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

    // Log audit entry
    if (authService && changedFields.length > 0) {
      await authService.logAudit({
        userId: user.id,
        action: "REFUND_UPDATE",
        resourceType: "Refund",
        resourceId: refundId,
        details: {
          changedFields,
          changes: input,
        },
        ipAddress,
        userAgent,
        timestamp: new Date(),
      });
    }

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
