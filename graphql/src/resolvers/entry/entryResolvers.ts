import {
  EntryResolvers,
  Scalars,
  EntryItemResolvers,
  EntryRefundResolvers,
} from "../../graphTypes";
import { addTypename } from "../utils/queryUtils";

export const EntryItem: EntryItemResolvers = {
  id: ({ id }) => id.toString(),
  category: ({ category }, _, { dataSources: { accountingDb } }) =>
    accountingDb.findOne({
      collection: "categories",
      filter: { _id: category[0].value },
    }),
  deleted: ({ deleted }) => deleted[0].value,
  department: ({ department }, _, { dataSources: { accountingDb } }) =>
    department
      ? accountingDb.findOne({
          collection: "departments",
          filter: { _id: department[0].value },
        })
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

  fiscalYear: (
    { date, dateOfRecord },
    _,
    { dataSources: { accountingDb } }
  ) => {
    const value = dateOfRecord?.overrideFiscalYear[0].value
      ? dateOfRecord.date[0].value
      : date[0].value;

    return accountingDb.findOne({
      collection: "fiscalYears",
      filter: {
        begin: {
          $lte: value,
        },
        end: {
          $gt: value,
        },
      },
    });
  },
  deleted: ({ deleted }) => deleted[0].value,
  description: ({ description }) => (description ? description[0].value : null),
  entry: ({ id }, _, { dataSources: { accountingDb } }) =>
    accountingDb.findOne({
      collection: "entries",
      filter: {
        "refunds.id": id,
      },
    }),
  // lastUpdate: Default works
  paymentMethod: ({ paymentMethod }) => paymentMethod[0].value,
  reconciled: ({ reconciled }) => reconciled[0].value,
  total: ({ total }) => total[0].value as Scalars["Rational"],
};

export const Entry: EntryResolvers = {
  id: ({ _id }) => _id.toString(),
  category: ({ category }, _, { dataSources: { accountingDb } }) =>
    accountingDb.findOne({
      collection: "categories",
      filter: {
        _id: category[0].value,
      },
    }),

  date: ({ date }) => date[0].value,
  dateOfRecord: ({ dateOfRecord }) =>
    dateOfRecord
      ? {
          date: dateOfRecord.date[0].value,
          overrideFiscalYear: dateOfRecord.overrideFiscalYear[0].value,
        }
      : null,
  deleted: ({ deleted }) => deleted[0].value,
  department: ({ department }, _, { dataSources: { accountingDb } }) =>
    accountingDb.findOne({
      collection: "departments",
      filter: { _id: department[0].value },
    }),
  description: ({ description }) =>
    description ? description[0]?.value || null : null,
  fiscalYear: (
    { date, dateOfRecord },
    _,
    { dataSources: { accountingDb } }
  ) => {
    const value = dateOfRecord?.overrideFiscalYear[0].value
      ? dateOfRecord.date[0].value
      : date[0].value;

    return accountingDb.findOne({
      collection: "fiscalYears",
      filter: {
        begin: {
          $lte: value,
        },
        end: {
          $gt: value,
        },
      },
    });
  },
  items: ({ items }) => items ?? ([] as any),
  // lastUpdate: Default works
  paymentMethod: ({ paymentMethod }) => paymentMethod[0].value,
  reconciled: ({ reconciled }) => reconciled[0].value,
  refunds: ({ refunds }) => refunds || [],
  source: ({ source }, _, { dataSources: { accountingDb } }) => {
    const { type, id } = source[0].value;

    switch (type) {
      case "Business":
        return addTypename(
          type,
          accountingDb.findOne({
            collection: "businesses",
            filter: {
              _id: id,
            },
          })
        );
      case "Department":
        return addTypename(
          type,
          accountingDb.findOne({
            collection: "departments",
            filter: {
              _id: id,
            },
          })
        );
      case "Person":
        return addTypename(
          type,
          accountingDb.findOne({
            collection: "people",
            filter: {
              _id: id,
            },
          })
        );
    }
  },
  total: ({ total }) => total[0].value as Scalars["Rational"],
};
