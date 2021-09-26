import { UserInputError } from "apollo-server-core";
import { ObjectId } from "mongodb";

import { AccountingDb } from "../../dataSources/accountingDb/accountingDb";

export const validateCategory = {
  exists: async ({
    category,
    accountingDb,
  }: {
    category: ObjectId;
    accountingDb: AccountingDb;
  }) => {
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
  },
} as const;
