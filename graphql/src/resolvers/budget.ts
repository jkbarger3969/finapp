import { BudgetResolvers, QueryResolvers } from "../graphTypes";
import { nodeFieldResolver } from "./utils/nodeResolver";
import { fractionToRational } from "../utils/rational";

export const budgets: QueryResolvers["budgets"] = async (
  parent,
  args,
  context,
  info
) => {
  const { db } = context;

  const results = await db
    .collection("budgets")
    .aggregate([
      { $match: {} },
      {
        $addFields: {
          id: { $toString: "$_id" },
        },
      },
    ])
    .toArray();

  return results;
};

export const Budget: BudgetResolvers = {
  owner: nodeFieldResolver,
  amount: (doc) => fractionToRational((doc.amount ?? doc) as any),
};
