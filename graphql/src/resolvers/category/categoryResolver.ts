import { ObjectId } from "mongodb";
import { snakeCase } from "change-case";

import {
  Category as CategoryType,
  CategoryResolvers,
  EntryType,
} from "../../graphTypes";
import { Context } from "../../types";
import { getAliases } from "../alias/utils";

export interface CategoryDbRecord {
  _id: ObjectId;
  name: string;
  code: string;
  externalId: string;
  type: "Debit" | "Credit";
  inactive: boolean;
  donation: boolean;
  parent?: ObjectId | null;
}

const NULLISH = Symbol("NULLISH");

const CategoryResolver: CategoryResolvers<Context, CategoryDbRecord> = {
  id: ({ _id }) => _id.toString(),
  parent: async ({ parent }, _, { db }) =>
    (await db.collection("categories").findOne({ _id: parent })) || null,
  type: ({ type }) => snakeCase(type).toUpperCase() as EntryType,
  children: ({ _id }, _, { db }) =>
    db.collection("categories").find({ parent: _id }).toArray(),
  ancestors: async ({ parent }, _, { db }) => {
    const ancestors: CategoryType[] = [];

    while ((parent ?? NULLISH) !== NULLISH) {
      const ancestor = await db
        .collection("categories")
        .findOne({ _id: parent });
      ancestors.push(ancestor);

      parent = ancestor.parent;
    }

    return ancestors;
  },
  aliases: ({ _id }, _, { db }) =>
    getAliases("Category", _id, db) as unknown as ReturnType<
      CategoryResolvers["aliases"]
    >,
};

export const Category = CategoryResolver as unknown as CategoryResolvers;
