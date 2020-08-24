import { BudgetResolvers as TBudgetResolvers } from "../../graphTypes";
import { Returns as BudgetReturns } from "./budget";
import { nodeDocResolver } from "../utils/nodeResolver";

const owner: TBudgetResolvers["owner"] = (doc, args, context, info) => {
  return nodeDocResolver(((doc as unknown) as BudgetReturns).owner, context);
};

const BudgetResolvers: TBudgetResolvers = {
  owner,
} as const;

export default BudgetResolvers;
