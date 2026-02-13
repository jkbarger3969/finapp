import { ObjectId } from "mongodb";
import { FiscalYearResolvers } from "../../graphTypes";
import { Context } from "../../types";

export interface FiscalYearDbRecord {
  _id: ObjectId;
  name: string;
  begin: Date;
  end: Date;
  archived?: boolean;
  archivedAt?: Date;
  archivedById?: ObjectId;
}

const FiscalYearResolver: FiscalYearResolvers<Context, FiscalYearDbRecord> = {
  id: ({ _id }) => _id.toString(),
  archived: ({ archived }) => archived || false,
  archivedAt: ({ archivedAt }) => archivedAt || null,
  archivedBy: async ({ archivedById }, _, { dataSources: { accountingDb } }) => {
    if (!archivedById) return null;
    const user = await accountingDb.db.collection("users").findOne({ _id: archivedById });
    return user as any;
  },
};

export const FiscalYear = (FiscalYearResolver as unknown) as FiscalYearResolvers;
