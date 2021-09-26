import { UserInputError } from "apollo-server-core";
import { ObjectId } from "mongodb";

import { AccountingDb } from "../../dataSources/accountingDb/accountingDb";

export const validateDepartment = {
  exists: async ({
    department,
    accountingDb,
  }: {
    department: ObjectId;
    accountingDb: AccountingDb;
  }) => {
    if (
      !(await accountingDb.findOne({
        collection: "departments",
        filter: {
          _id: department,
        },
        options: {
          projection: { _id: true },
        },
      }))
    ) {
      throw new UserInputError(
        `"Department" id "${department.toHexString()}" does not exists.`
      );
    }
  },
} as const;
