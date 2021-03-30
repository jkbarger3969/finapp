import { ObjectId } from "mongodb";

import { QueryResolvers } from "../../graphTypes";
import { NodeValue } from "../../types";
import { Rational } from "../../utils/mongoRational";

export interface Returns {
  id: string;
  owner: NodeValue;
  amount: Rational;
  year: number;
}

export const budget: QueryResolvers["budget"] = async (_, { id }, { db }) =>
  db.collection("budgets").findOne({ _id: new ObjectId(id) });
