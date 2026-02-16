import { snakeCase } from "change-case";

import { CategoryResolvers, EntryType } from "../../graphTypes";
import {
  CategoryDbRecord,
  EntryTypeDbRecord,
  FindOneOptions,
} from "../../dataSources/accountingDb/types";
import { AccountingDb } from "../../dataSources/accountingDb/accountingDb";
import { Db } from "mongodb";

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

    if (!ancestor) {
      // Category not found, stop iteration
      break;
    }

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
  for await (const ancestor of categoryAncestorPath({
    accountingDb,
    fromCategory: category,
  })) {
    if (!ancestor) {
      continue;
    }
    const { type, parent } = ancestor;
    if (!parent) {
      return type;
    }
  }
  // Default fallback if no type found
  return "Debit" as EntryTypeDbRecord;
};

export const Category: CategoryResolvers = {
  id: ({ _id }) => _id.toString(),
  displayName: (cat) => {
    if (cat.groupName && cat.name) {
      return `${cat.groupName}: ${cat.name}`;
    }
    return cat.name;
  },
  parent: async ({ parent }, _, { dataSources: { accountingDb } }) =>
    parent ? accountingDb.findOne({
      collection: "categories",
      filter: { _id: parent },
    }) : null,

  type: async ({ _id }, _, { dataSources: { accountingDb } }) => {
    const type = await categoryType({
      accountingDb,
      category: _id,
    });

    return snakeCase(type).toUpperCase() as EntryType;
  },
  children: ({ _id }, _, { dataSources: { accountingDb } }) =>
    accountingDb.find({
      collection: "categories",
      filter: { parent: _id },
    }),
  ancestors: async ({ parent }, _, { dataSources: { accountingDb } }) => {
    const ancestors: CategoryDbRecord[] = [];

    for await (const ancestor of categoryAncestorPath({
      accountingDb,
      fromCategory: parent,
    })) {
      ancestors.push(ancestor);
    }

    return ancestors;
  },
  accountNumber: (cat) => cat.accountNumber || null,
  groupName: (cat) => cat.groupName || null,
  sortOrder: (cat) => cat.sortOrder ?? 0,
};
