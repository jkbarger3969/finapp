import { UserInputError } from "apollo-server-core";
import { ObjectId } from "mongodb";
import { AccountingDb } from "../../dataSources/accountingDb/accountingDb";

export const validatePaymentCard = new (class {
  async exists({
    paymentCard,
    accountingDb,
  }: {
    paymentCard: ObjectId;
    accountingDb: AccountingDb;
  }) {
    if (
      !(await accountingDb.findOne({
        collection: "paymentCards",
        filter: {
          _id: paymentCard,
        },
        options: {
          projection: {
            _id: true,
          },
        },
      }))
    ) {
      throw new UserInputError(
        `"PaymentCard" id "${paymentCard.toHexString()} does not exist.`
      );
    }
  }
})();
