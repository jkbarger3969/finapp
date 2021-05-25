import { ObjectId } from "mongodb";

import {
  EntryResolvers,
  Scalars,
  EntryItemResolvers,
  EntryRefundResolvers,
} from "../../graphTypes";
import { HistoryObject, HistoricalRoot } from "../utils/DocHistory";
import { Context } from "../../types";
import { Rational } from "../../utils/mongoRational";
import { NodeDbRecord, addTypename } from "../utils/queryUtils";
import { PaymentMethodDBRecord } from "../paymentMethod/paymentMethodResolvers";

export interface EntryItemDbRecord extends HistoricalRoot {
  id: ObjectId;
  category?: HistoryObject<ObjectId>[];
  deleted: HistoryObject<boolean>[];
  department?: HistoryObject<ObjectId>[];
  description?: HistoryObject<string>[];
  total: HistoryObject<Rational>[];
  units: HistoryObject<number>[];
}

export interface EntryRefundDbRecord extends HistoricalRoot {
  id: ObjectId;
  date: HistoryObject<Date>[];
  deleted: HistoryObject<boolean>[];
  description?: HistoryObject<string>[];
  paymentMethod: HistoryObject<PaymentMethodDBRecord>[];
  reconciled: HistoryObject<boolean>[];
  total: HistoryObject<Rational>[];
}

export interface EntryDbRecord extends HistoricalRoot {
  _id: ObjectId;
  category: HistoryObject<ObjectId>[];
  date: HistoryObject<Date>[];
  dateOfRecord?: {
    date: HistoryObject<Date>[];
    overrideFiscalYear: HistoryObject<boolean>[];
  };
  deleted: HistoryObject<boolean>[];
  department: HistoryObject<ObjectId>[];
  description?: HistoryObject<string>[];
  items?: EntryItemDbRecord[];
  paymentMethod: HistoryObject<PaymentMethodDBRecord>[];
  reconciled: HistoryObject<boolean>[];
  refunds?: EntryRefundDbRecord[];
  source: HistoryObject<NodeDbRecord<"Business" | "Department" | "Person">>[];
  total: HistoryObject<Rational>[];
  type: HistoryObject<"Credit" | "Debit">[];
}

// export const EntrySource: EntrySourceResolvers = {
//   // __typename added with addTypename
//   __resolveType: ({ __typename }) => __typename,
// };

const EntryItemResolver: EntryItemResolvers<Context, EntryItemDbRecord> = {
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

export const EntryItem = EntryItemResolver as unknown as EntryItemResolvers;

const EntryRefundResolver: EntryRefundResolvers<Context, EntryRefundDbRecord> =
  {
    id: ({ id }) => id.toString(),
    date: ({ date }) => date[0].value,
    deleted: ({ deleted }) => deleted[0].value,
    description: ({ description }) =>
      description ? description[0].value : null,
    // lastUpdate: Default works
    paymentMethod: ({ paymentMethod }) => paymentMethod[0].value,
    reconciled: ({ reconciled }) => reconciled[0].value,
    total: ({ total }) => total[0].value as Scalars["Rational"],
  };

export const EntryRefund =
  EntryRefundResolver as unknown as EntryRefundResolvers;

const EntryResolver: EntryResolvers<Context, EntryDbRecord> = {
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
  refunds: ({ refunds }) => refunds ?? ([] as any),
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

export const Entry = EntryResolver as unknown as EntryResolvers;
