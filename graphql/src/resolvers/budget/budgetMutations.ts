import { ObjectId } from "mongodb";
import { MutationResolvers } from "../../graphTypes";
import { fractionToRational } from "../../utils/mongoRational";

export const upsertBudget: MutationResolvers["upsertBudget"] = async (
  _,
  { input },
  { dataSources: { accountingDb } }
) => {
  const amount = fractionToRational(input.amount);
  const budgetDoc = {
    amount,
    owner: {
      type: input.owner.type as "Department" | "Business",
      id: new ObjectId(input.owner.id),
    },
    fiscalYear: new ObjectId(input.fiscalYear),
  };

  if (input.id) {
    await accountingDb.db
      .collection("budgets")
      .updateOne(
        { _id: new ObjectId(input.id) },
        { $set: budgetDoc }
      );
    
    const budget = await accountingDb.findOne({
      collection: "budgets",
      filter: { _id: new ObjectId(input.id) },
    });
    
    return {
      budget,
    };
  } else {
    const result = await accountingDb.db
      .collection("budgets")
      .insertOne(budgetDoc);
    
    const budget = await accountingDb.findOne({
      collection: "budgets",
      filter: { _id: result.insertedId },
    });
    
    return {
      budget,
    };
  }
};

export const deleteBudget: MutationResolvers["deleteBudget"] = async (
  _,
  { input },
  { dataSources: { accountingDb } }
) => {
  const id = new ObjectId(input.id);
  
  await accountingDb.db
    .collection("budgets")
    .deleteOne({ _id: id });
  
  return {
    deletedId: input.id,
  };
};
