import { ObjectId } from "mongodb";
import { QueryResolvers } from "../../graphTypes";

export const projection = {
  category: { $slice: 1 },
  date: { $slice: 1 },
  dateOfRecord: {
    date: { $slice: 1 },
    overrideFiscalYear: { $slice: 1 },
  },
  deleted: { $slice: 1 },
  department: { $slice: 1 },
  description: { $slice: 1 },
  paymentMethod: { $slice: 1 },
  reconciled: { $slice: 1 },
  source: { $slice: 1 },
  total: { $slice: 1 },
  items: {
    category: { $slice: 1 },
    deleted: { $slice: 1 },
    department: { $slice: 1 },
    description: { $slice: 1 },
    total: { $slice: 1 },
    units: { $slice: 1 },
  },
  refunds: {
    date: { $slice: 1 },
    deleted: { $slice: 1 },
    description: { $slice: 1 },
    paymentMethod: { $slice: 1 },
    reconciled: { $slice: 1 },
    total: { $slice: 1 },
  },
} as const;

export const entry: QueryResolvers["entry"] = (_, { id }, { db }) =>
  db.collection("entries").findOne({ _id: new ObjectId(id) }, { projection });
