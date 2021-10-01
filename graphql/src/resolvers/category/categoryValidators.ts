import { UserInputError } from "apollo-server-core";
import { ObjectId } from "mongodb";

import { AccountingDb } from "../../dataSources/accountingDb/accountingDb";

export const validateCategory = new (class {
  async exists({
    category,
    accountingDb,
  }: {
    category: ObjectId;
    accountingDb: AccountingDb;
  }) {
    if (
      !(await accountingDb.findOne({
        collection: "categories",
        filter: {
          _id: category,
        },
        options: {
          projection: { _id: true },
        },
      }))
    ) {
      throw new UserInputError(
        `"Category" id "${category.toHexString()}" does not exists.`
      );
    }
  }
  async isNotRoot({
    category,
    accountingDb,
  }: {
    category: ObjectId;
    accountingDb: AccountingDb;
  }) {
    const { parent } = await accountingDb.findOne({
      collection: "categories",
      filter: {
        _id: category,
      },
      options: {
        projection: { parent: true },
      },
    });

    if (!parent) {
      throw new UserInputError(
        `Root category is not permitted. "Category" id "${category.toHexString()}" is a root category.`
      );
    }
  }
})();
