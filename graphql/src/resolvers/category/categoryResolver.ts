import { ObjectId } from "mongodb";
import { snakeCase } from "change-case";

import { CategoryResolvers, EntryType } from "../../graphTypes";
import { Context } from "../../types";

export interface CategoryDbRecord {
  _id: ObjectId;
  name: string;
  code: string;
  externalId: string;
  type: "Debit" | "Credit";
  inactive: boolean;
  donation: boolean;
  parent: ObjectId;
}

const CategoryResolver: CategoryResolvers<Context, CategoryDbRecord> = {
  id: ({ _id }) => _id.toString(),
  parent: async ({ parent }, _, { db }) =>
    (await db.collection("categories").findOne({ _id: parent })) || null,
  type: ({ type }) => snakeCase(type).toUpperCase() as EntryType,
  children: ({ _id }, _, { db }) =>
    db.collection("categories").find({ parent: _id }).toArray(),
};

export const Category = (CategoryResolver as unknown) as CategoryResolvers;
