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
    const categoryDoc = await accountingDb.findOne({
      collection: "categories",
      filter: {
        _id: category,
      },
      options: {
        projection: { _id: true, allowStandalone: true },
      },
    });

    if (categoryDoc?.allowStandalone) {
      return;
    }

    const children = await accountingDb.find({
      collection: "categories",
      filter: {
        parent: category,
      },
      options: {
        projection: { _id: true },
      },
    });

    if (children.length > 0) {
      throw new UserInputError(
        `Group category is not permitted. "Category" id "${category.toHexString()}" has ${children.length} child categories. Please select a specific subcategory.`
      );
    }
  }
})();
