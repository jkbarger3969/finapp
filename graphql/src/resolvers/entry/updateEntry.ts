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
  { reqDateTime, user, dataSources: { accountingDb } }
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

    const docHistory = new DocHistory({ by: user.id, date: reqDateTime });

    const updateBuilder = new UpdateHistoricalDoc<EntryDbRecord>({
      docHistory,
      isRootDoc: true,
    });

    if (date) {
      updateBuilder.updateHistoricalField("date", date);
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

    if (departmentInput) {
      const department = new ObjectId(departmentInput);

      updateBuilder.updateHistoricalField("department", department);
    }

    const category = categoryInput ? new ObjectId(categoryInput) : null;
    if (category) {
      updateBuilder.updateHistoricalField("category", category);
    }

    const paymentMethod = paymentMethodInput
      ? upsertPaymentMethodToDbRecord({
          upsertPaymentMethod: paymentMethodInput,
        })
      : null;
    if (paymentMethod) {
      updateBuilder.updateHistoricalField("paymentMethod", paymentMethod);
    }

    const description = descriptionInput?.trim();
    if (description) {
      updateBuilder.updateHistoricalField("description", description);
    }

    if (total) {
      updateBuilder.updateHistoricalField("total", fractionToRational(total));
    }

    if (sourceInput) {
      const source = await upsertEntrySourceToEntityDbRecord({
        upsertEntrySourceInput: sourceInput,
        accountingDb,
      });

      updateBuilder.updateHistoricalField("source", source);
    }

    if ((reconciled ?? NULLISH) !== NULLISH) {
      updateBuilder.updateHistoricalField("reconciled", reconciled);
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
