import { UserInputError } from "apollo-server-core";
import { ObjectId } from "mongodb";
import { AccountingDb } from "../../dataSources/accountingDb/accountingDb";

export const validateAccount = new (class {
  async exists({
    account,
    accountingDb,
  }: {
    account: ObjectId;
    accountingDb: AccountingDb;
  }) {
    if (
      !(await accountingDb.findOne({
        collection: "accounts",
        filter: {
          _id: account,
        },
        options: {
          projection: {
            _id: true,
          },
        },
      }))
    ) {
      throw new UserInputError(
        `"Account" id "${account.toHexString()} does not exist.`
      );
    }
  }
})();
