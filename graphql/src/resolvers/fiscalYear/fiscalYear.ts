import { ObjectId } from "mongodb";

import { QueryResolvers } from "../../graphTypes";

export const fiscalYear: QueryResolvers["fiscalYear"] = (_, { id }, { db }) =>
  db.collection("fiscalYears").findOne({ _id: new ObjectId(id) });
