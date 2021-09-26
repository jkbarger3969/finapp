import { UserInputError } from "apollo-server-core";
import { ObjectId } from "mongodb";

import { AccountingDb } from "../../dataSources/accountingDb/accountingDb";
import { NewBusiness } from "../../graphTypes";

export const validateBusiness = {
  async exists({
    business,
    accountingDb,
  }: {
    business: ObjectId;
    accountingDb: AccountingDb;
  }) {
    if (
      !(await accountingDb.findOne({
        collection: "businesses",
        filter: {
          _id: business,
        },
        options: {
          projection: {
            _id: true,
          },
        },
      }))
    ) {
      throw new UserInputError(
        `"Business" id "${business.toHexString()}" does not exists.`
      );
    }
  },
  async newBusiness({ newBusiness }: { newBusiness: NewBusiness }) {
    if (newBusiness.name.length < 3) {
      throw new UserInputError(`"NewBusiness.name" is too short.`);
    }
  },
} as const;
