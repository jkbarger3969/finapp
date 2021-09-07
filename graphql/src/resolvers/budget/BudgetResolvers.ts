import { ObjectId } from "mongodb";

import { BudgetResolvers, BudgetOwnerResolvers } from "../../graphTypes";
import { Rational } from "../../utils/mongoRational";
import { Context } from "../../types";
import { addTypename } from "../utils/queryUtils";
import Fraction from "fraction.js";

export interface BudgetDbRecord {
  _id: ObjectId;
  amount: Rational;
  fiscalYear: ObjectId;
  owner: {
    type: "Department" | "Business";
    id: ObjectId;
  };
}

const owner: BudgetResolvers<Context, BudgetDbRecord>["owner"] = (
  { owner },
  _,
  { db }
) => {
  if (owner.type === "Business") {
    return addTypename(
      owner.type,
      db.collection("businesses").findOne({
        _id: new ObjectId(owner.id),
      })
    );
  } else {
    return addTypename(
      owner.type,
      db.collection("departments").findOne({
        _id: new ObjectId(owner.id),
      })
    );
  }
};

const fiscalYear: BudgetResolvers<Context, BudgetDbRecord>["fiscalYear"] = (
  { fiscalYear },
  _,
  { db }
) => db.collection("fiscalYears").findOne({ _id: new ObjectId(fiscalYear) });

export const BudgetOwner: BudgetOwnerResolvers = {
  // __typename added with addTypename
  __resolveType: ({ __typename }) => __typename,
} as any;

const BudgetResolver: BudgetResolvers<Context, BudgetDbRecord> = {
  id: ({ _id }) => _id.toString(),
  owner,
  amount: ({ amount }) => new Fraction(amount),
  fiscalYear,
} as const;

export const Budget = BudgetResolver as unknown as BudgetResolvers;
