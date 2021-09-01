import { ObjectId } from "mongodb";
import { EntryDbRecord } from "../../dataSources/accountingDb/types";

import {
  AddNewEntryPayload,
  Entity,
  MutationResolvers,
} from "../../graphTypes";
import { NodeValue } from "../../types";
import { Rational } from "../../utils/mongoRational";
import { paymentMethodInputToDbRecord } from "../paymentMethod";
import { PaymentMethodDBRecord } from "../paymentMethod/paymentMethodResolvers";
import {
  DocHistory,
  ExtractHistoricalFields,
  NewHistoricalDoc,
} from "../utils/DocHistory";
import { validatePayMethodAndCategory } from "./entryValidators";
import { upsertEntrySourceToEntityDbRecord } from "./upsertEntrySource";

export const addNewEntry: MutationResolvers["addNewEntry"] = async (
  _,
  { input },
  { reqDateTime, user, dataSources: { accountingDb } }
) => {
  const {
    date,
    dateOfRecord,
    department: departmentInput,
    category: categoryInput,
    paymentMethod: paymentMethodInput,
    description,
    total: totalInput,
    source: sourceInput,
    reconciled = true,
  } = input;

  const category = new ObjectId(categoryInput);
  const department = new ObjectId(departmentInput);
  const total: Rational = {
    s: totalInput.s as 1 | -1,
    n: totalInput.n,
    d: totalInput.d,
  };

  const newEntry = await accountingDb.withTransaction(async () => {
    const docHistory = new DocHistory({ by: user.id, date: reqDateTime });

    // convert and validate
    const paymentMethod = await paymentMethodInputToDbRecord({
      paymentMethodInput,
      validate: accountingDb,
    });

    // Validate payment method and category compatibility
    await validatePayMethodAndCategory({
      category,
      paymentMethod,
      accountingDb,
      isRefund: false,
    });

    const source = await upsertEntrySourceToEntityDbRecord({
      upsertEntrySourceInput: sourceInput,
      accountingDb,
    });

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

    const doc = newDocBuilder.valueOf();

    const { insertedId } = await accountingDb.insertOne({
      collection: "entries",
      doc,
    });

    return {
      newEntry: {
        _id: insertedId,
        ...doc,
      },
    };
  });

  return newEntry as unknown as AddNewEntryPayload;
};
