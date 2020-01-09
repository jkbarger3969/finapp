
import {BudgetResolvers, QueryResolvers} from "../graphTypes";
import {nodeFieldResolver} from "./utils/nodeResolver";

export const budgets:QueryResolvers['budgets'] = 
  async (parent, args, context, info) => 
{

  const {db} = context;

  const results = await db.collection("budgets").aggregate([
      {$match: {}},
      {$addFields: {
          id:{$toString: "$_id"}
      }}
  ]).toArray();

  return results;

}

export const Budget:BudgetResolvers = {
  owner:nodeFieldResolver,
};