import { Db, ObjectID, ObjectId } from "mongodb";
import { snakeCase } from "change-case";

import {
  Category as CategoryType,
  CategoryResolvers,
  EntryType,
} from "../../graphTypes";
import { Context } from "../../types";
import {
  CategoryDbRecord,
  EntryTypeDbRecord,
  FindOneOptions,
} from "../../dataSources/accountingDb/types";
import { AccountingDb } from "../../dataSources/accountingDb/accountingDb";

const NULLISH = Symbol("NULLISH");

/**
 * Lookup Category ancestors by passing parent.
 */
export const categoryAncestorPath = async function* ({
  accountingDb,
  fromCategory,
  options,
}: {
  accountingDb: AccountingDb;
  fromCategory?: CategoryDbRecord["parent"];
  options?: FindOneOptions<"categories">;
}) {
  while ((fromCategory ?? NULLISH) !== NULLISH) {
    const ancestor = await accountingDb.findOne({
      collection: "categories",
      filter: {
        _id: fromCategory,
      },
      options,
    });

    yield ancestor;

    fromCategory = ancestor.parent;
  }
};

/**
 * Look up category type
 */ export const categoryType = async ({
  accountingDb,
  category,
}: {
  accountingDb: AccountingDb;
  category: CategoryDbRecord["_id"];
}): Promise<EntryTypeDbRecord> => {
  for await (const { type, parent } of categoryAncestorPath({
    accountingDb,
    fromCategory: category,
  })) {
    if (!parent) {
      return type;
    }
  }
};

const CategoryResolver: CategoryResolvers<Context, CategoryDbRecord> = {
  id: ({ _id }) => _id.toString(),
  parent: async ({ parent }, _, { db }) =>
    (await db.collection("categories").findOne({ _id: parent })) || null,
  type: async ({ _id }, _, { dataSources: { accountingDb } }) => {
    const type = await categoryType({
      accountingDb,
      category: _id,
    });

    return snakeCase(type).toUpperCase() as EntryType;
  },
  children: ({ _id }, _, { db }) =>
    db.collection("categories").find({ parent: _id }).toArray(),
  ancestors: async ({ parent }, _, { dataSources: { accountingDb } }) => {
    const ancestors: CategoryType[] = [];

    for await (const ancestor of categoryAncestorPath({
      accountingDb,
      fromCategory: parent,
    })) {
      ancestors.push(ancestor as unknown as CategoryType);
    }

    return ancestors;
  },
};

export const Category = CategoryResolver as unknown as CategoryResolvers;
