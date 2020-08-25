import { BudgetResolvers as TBudgetResolvers } from "../../graphTypes";
import { Returns as BudgetReturns } from "./budget";
import { nodeDocResolver } from "../utils/nodeResolver";
import { fractionToRational } from "../../utils/rational";
import Fraction from "fraction.js";

const owner: TBudgetResolvers["owner"] = (doc, args, context, info) => {
  return nodeDocResolver(((doc as unknown) as BudgetReturns).owner, context);
};

const BudgetResolvers: TBudgetResolvers = {
  owner,
  amount: (doc) => fractionToRational((doc.amount as unknown) as Fraction),
} as const;

export default BudgetResolvers;
