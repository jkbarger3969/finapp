import { ObjectId } from "mongodb";

import { EntryDbRecord } from "../../dataSources/accountingDb/types";
import { MutationResolvers } from "../../graphTypes";
import { fractionToRational } from "../../utils/mongoRational";
import { upsertPaymentMethodToDbRecord } from "../paymentMethod";
import { DocHistory, NewHistoricalDoc } from "../utils/DocHistory";
import { validateEntry } from "./entryValidators";
import { upsertEntrySourceToEntityDbRecord } from "./upsertEntrySource";

export const addNewEntry: MutationResolvers["addNewEntry"] = (
  _,
  { input },
  { reqDateTime, user, dataSources: { accountingDb } }
) =>
  accountingDb.withTransaction(async () => {
    // validate NewEntry input
    await validateEntry.newEntry({
      newEntry: input,
      reqDateTime,
      accountingDb,
    });

    const {
      date,
      dateOfRecord,
      department: departmentInput,
      category: categoryInput,
      paymentMethod: paymentMethodInput,
      description: descriptionInput,
      total: totalInput,
      source: sourceInput,
      reconciled: reconciledInput,
    } = input;

    const category = new ObjectId(categoryInput);
    const department = new ObjectId(departmentInput);
    const description = descriptionInput?.trim();
    const total = fractionToRational(totalInput);
    const reconciled = reconciledInput ?? false;

    // convert
    const paymentMethod = upsertPaymentMethodToDbRecord({
      upsertPaymentMethod: paymentMethodInput,
    });

    const source = await upsertEntrySourceToEntityDbRecord({
      upsertEntrySourceInput: sourceInput,
      accountingDb,
    });

    const docHistory = new DocHistory({ by: user.id, date: reqDateTime });

    const newDocBuilder = new NewHistoricalDoc<EntryDbRecord>({
      docHistory,
      isRootDoc: true,
    })
      .addHistoricalField("category", category)
      .addHistoricalField("date", date)
      .addHistoricalField("deleted", false)
      .addHistoricalField("department", department)
      .addHistoricalField("paymentMethod", paymentMethod)
      .addHistoricalField("reconciled", reconciled)
      .addHistoricalField("source", source)
      .addHistoricalField("total", total);

    if (description) {
      newDocBuilder.addHistoricalField("description", description);
    }

    if (dateOfRecord) {
      const { date, overrideFiscalYear } = dateOfRecord;
      const dateOfRecordDoc = new NewHistoricalDoc<
        NonNullable<EntryDbRecord["dateOfRecord"]>
      >({
        docHistory,
        isRootDoc: false,
      })
        .addHistoricalField("date", date)
        .addHistoricalField("overrideFiscalYear", overrideFiscalYear)
        .valueOf();

      newDocBuilder.addFieldValued("dateOfRecord", dateOfRecordDoc);
    }

    const { insertedId } = await accountingDb.insertOne({
      collection: "entries",
      doc: newDocBuilder.valueOf(),
    });

    return {
      newEntry: await accountingDb.findOne({
        collection: "entries",
        filter: { _id: insertedId },
      }),
    };
  });
