import { UserInputError } from "apollo-server-core";
import { ObjectId } from "mongodb";
import { UpdateOne } from "../../dataSources/accountingDb/accountingDb";
import { EntryDbRecord } from "../../dataSources/accountingDb/types";
import { MutationResolvers } from "../../graphTypes";
import { fractionToRational } from "../../utils/mongoRational";
import { upsertPaymentMethodToDbRecord } from "../paymentMethod";
import { DocHistory, UpdateHistoricalDoc } from "../utils/DocHistory";
import { validateEntry } from "./entryValidators";
import { upsertEntrySourceToEntityDbRecord } from "./upsertEntrySource";

const NULLISH = Symbol();

export const updateEntry: MutationResolvers["updateEntry"] = async (
  _,
  { input },
  { reqDateTime, user, dataSources: { accountingDb }, authService, ipAddress, userAgent }
) =>
  accountingDb.withTransaction(async () => {
    await validateEntry.updateEntry({
      updateEntry: input,
      reqDateTime,
      accountingDb,
    });

    const {
      id,
      date,
      dateOfRecord,
      department: departmentInput,
      category: categoryInput,
      paymentMethod: paymentMethodInput,
      description: descriptionInput,
      total,
      source: sourceInput,
      reconciled,
    } = input;

    const entryId = new ObjectId(id);

    // Get existing entry for audit comparison
    const existingEntry = await accountingDb.findOne({
      collection: "entries",
      filter: { _id: entryId },
    });

    const docHistory = new DocHistory({ by: user.id, date: reqDateTime });

    const updateBuilder = new UpdateHistoricalDoc<EntryDbRecord>({
      docHistory,
      isRootDoc: true,
    });

    const changedFields: string[] = [];

    if (date) {
      updateBuilder.updateHistoricalField("date", date);
      changedFields.push("date");
    }

    const dateOfRecordUpdateBuilder = new UpdateHistoricalDoc<
      NonNullable<EntryDbRecord["dateOfRecord"]>,
      "dateOfRecord"
    >({
      docHistory,
      isRootDoc: false,
      fieldPrefix: "dateOfRecord",
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

    if (departmentInput) {
      const department = new ObjectId(departmentInput);

      updateBuilder.updateHistoricalField("department", department);
      changedFields.push("department");
    }

    const category = categoryInput ? new ObjectId(categoryInput) : null;
    if (category) {
      updateBuilder.updateHistoricalField("category", category);
      changedFields.push("category");
    }

    const paymentMethod = paymentMethodInput
      ? upsertPaymentMethodToDbRecord({
          upsertPaymentMethod: paymentMethodInput,
        })
      : null;
    if (paymentMethod) {
      updateBuilder.updateHistoricalField("paymentMethod", paymentMethod);
      changedFields.push("paymentMethod");
    }

    const description = descriptionInput?.trim();
    if (description) {
      updateBuilder.updateHistoricalField("description", description);
      changedFields.push("description");
    }

    if (total) {
      updateBuilder.updateHistoricalField("total", fractionToRational(total));
      changedFields.push("total");
    }

    if (sourceInput) {
      const source = await upsertEntrySourceToEntityDbRecord({
        upsertEntrySourceInput: sourceInput,
        accountingDb,
      });

      updateBuilder.updateHistoricalField("source", source);
      changedFields.push("source");
    }

    if ((reconciled ?? NULLISH) !== NULLISH) {
      updateBuilder.updateHistoricalField("reconciled", reconciled);
      changedFields.push("reconciled");
    }

    const entryUpdate = updateBuilder.valueOf();
    const dateOfRecordUpdate = dateOfRecordUpdateBuilder.valueOf();

    const update = {} as UpdateOne<"entries">;

    if (entryUpdate?.$set || dateOfRecordUpdate?.$set) {
      update.$set = {
        ...entryUpdate?.$set,
        ...dateOfRecordUpdate?.$set,
      };
    }

    if (entryUpdate?.$push || dateOfRecordUpdate?.$push) {
      update.$push = {
        ...entryUpdate?.$push,
        ...dateOfRecordUpdate?.$push,
      };
    }

    await accountingDb.updateOne({
      collection: "entries",
      filter: { _id: entryId },
      update,
    });

    // Log audit entry
    if (authService && changedFields.length > 0) {
      await authService.logAudit({
        userId: user.id,
        action: "ENTRY_UPDATE",
        resourceType: "Entry",
        resourceId: entryId,
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
      updatedEntry: await accountingDb.findOne({
        collection: "entries",
        filter: {
          _id: entryId,
        },
        skipCache: true,
      }),
    };
  });
