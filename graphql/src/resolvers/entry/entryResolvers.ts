import {
  EntryResolvers,
  Scalars,
  EntryItemResolvers,
  EntryRefundResolvers,
} from "../../graphTypes";
import { addTypename } from "../utils/queryUtils";

export const EntryItem: EntryItemResolvers = {
  id: ({ id }) => id.toString(),
  category: ({ category }, _, { db }) =>
    category
      ? db.collection("categories").findOne({ _id: category[0].value })
      : null,
  deleted: ({ deleted }) => deleted[0].value,
  department: ({ department }, _, { db }) =>
    department
      ? db.collection("departments").findOne({ _id: department[0].value })
      : null,
  description: ({ description }) => (description ? description[0].value : null),
  // lastUpdate: Default works
  total: ({ total }) => total[0].value as Scalars["Rational"],
  units: ({ units }) => units[0].value,
};

export const EntryRefund: EntryRefundResolvers = {
  id: ({ id }) => id.toString(),
  date: ({ date }) => date[0].value,
  dateOfRecord: ({ dateOfRecord }) =>
    dateOfRecord
      ? {
          date: dateOfRecord.date[0].value,
          overrideFiscalYear: dateOfRecord.overrideFiscalYear[0].value,
        }
      : null,

  fiscalYear: ({ date, dateOfRecord }, _, { db }) => {
    const value = dateOfRecord?.overrideFiscalYear[0].value
      ? dateOfRecord.date[0].value
      : date[0].value;

    return db.collection("fiscalYears").findOne({
      begin: {
        $lte: value,
      },
      end: {
        $gt: value,
      },
    });
  },
  deleted: ({ deleted }) => deleted[0].value,
  description: ({ description }) => (description ? description[0].value : null),
  entry: ({ id }, _, { db }) =>
    db.collection("entries").findOne({ "refunds.id": id }),
  // lastUpdate: Default works
  paymentMethod: ({ paymentMethod }) => paymentMethod[0].value,
  reconciled: ({ reconciled }) => reconciled[0].value,
  total: ({ total }) => total[0].value as Scalars["Rational"],
};

export const Entry: EntryResolvers = {
  id: ({ _id }) => _id.toString(),
  category: ({ category }, _, { db }) =>
    db.collection("categories").findOne({ _id: category[0].value }),
  date: ({ date }) => date[0].value,
  dateOfRecord: ({ dateOfRecord }) =>
    dateOfRecord
      ? {
          date: dateOfRecord.date[0].value,
          overrideFiscalYear: dateOfRecord.overrideFiscalYear[0].value,
        }
      : null,
  deleted: ({ deleted }) => deleted[0].value,
  department: ({ department }, _, { db }) =>
    db.collection("departments").findOne({ _id: department[0].value }),
  description: ({ description }) =>
    description ? description[0]?.value || null : null,
  fiscalYear: ({ date, dateOfRecord }, _, { db }) => {
    const value = dateOfRecord?.overrideFiscalYear[0].value
      ? dateOfRecord.date[0].value
      : date[0].value;

    return db.collection("fiscalYears").findOne({
      begin: {
        $lte: value,
      },
      end: {
        $gt: value,
      },
    });
  },
  items: ({ items }) => items ?? ([] as any),
  // lastUpdate: Default works
  paymentMethod: ({ paymentMethod }) => paymentMethod[0].value,
  reconciled: ({ reconciled }) => reconciled[0].value,
  refunds: ({ refunds }) => refunds || [],
  source: ({ source }, _, { db }) => {
    const { type, id } = source[0].value;

    switch (type) {
      case "Business":
        return addTypename(
          type,
          db.collection("businesses").findOne({ _id: id })
        );
      case "Department":
        return addTypename(
          type,
          db.collection("departments").findOne({ _id: id })
        );
      case "Person":
        return addTypename(type, db.collection("people").findOne({ _id: id }));
    }
  },
  total: ({ total }) => total[0].value as Scalars["Rational"],
};
