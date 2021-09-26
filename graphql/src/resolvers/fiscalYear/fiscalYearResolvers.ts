import { ObjectId } from "mongodb";
import { FiscalYearResolvers } from "../../graphTypes";
import { Context } from "../../types";

export interface FiscalYearDbRecord {
  _id: ObjectId;
  name: string;
  begin: Date;
  end: Date;
}

const FiscalYearResolver: FiscalYearResolvers<Context, FiscalYearDbRecord> = {
  id: ({ _id }) => _id.toString(),
};

export const FiscalYear = (FiscalYearResolver as unknown) as FiscalYearResolvers;
