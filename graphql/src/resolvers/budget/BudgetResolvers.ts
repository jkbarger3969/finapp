import Fraction from "fraction.js";

import { BudgetResolvers as TBudgetResolvers } from "../../graphTypes";
import { Returns as BudgetReturns } from "./budget";
import { nodeDocResolver } from "../utils/nodeResolver";
import { fractionToRational } from "../../utils/rational";
import { default as fiscalYearQuery } from "../fiscalYear/fiscalYear";
import { ObjectId } from "mongodb";

const owner: TBudgetResolvers["owner"] = (doc, args, context, info) => {
  return nodeDocResolver(((doc as unknown) as BudgetReturns).owner, context);
};

const fiscalYear: TBudgetResolvers["fiscalYear"] = async (
  doc,
  args,
  context,
  info
) => {
  return fiscalYearQuery(
    {},
    { id: ((doc.fiscalYear as unknown) as ObjectId).toHexString() },
    context,
    info
  );
};

const BudgetResolvers: TBudgetResolvers = {
  owner,
  amount: (doc) => fractionToRational((doc.amount as unknown) as Fraction),
  fiscalYear,
} as const;

export default BudgetResolvers;
