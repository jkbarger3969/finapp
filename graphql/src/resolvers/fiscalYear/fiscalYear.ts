import { ObjectId } from "mongodb";

import { QueryResolvers } from "../../graphTypes";

export const fiscalYear: QueryResolvers["fiscalYear"] = (
  _,
  { id },
  { dataSources: { accountingDb } }
) =>
  accountingDb.findOne({
    collection: "fiscalYears",
    filter: { _id: new ObjectId(id) },
  });
