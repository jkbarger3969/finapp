import { MutationResolvers } from "../../graphTypes";

export const createFiscalYear: MutationResolvers["createFiscalYear"] = async (
  _,
  { input },
  { dataSources: { accountingDb } }
) => {
  const fiscalYearDoc = {
    name: input.name,
    begin: new Date(input.begin),
    end: new Date(input.end),
  };

  const result = await accountingDb.db
    .collection("fiscalYears")
    .insertOne(fiscalYearDoc);

  const fiscalYear = await accountingDb.findOne({
    collection: "fiscalYears",
    filter: { _id: result.insertedId },
  });

  return { fiscalYear };
};
