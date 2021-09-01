import { ObjectId } from "mongodb";
import { UserInputError } from "apollo-server-errors";

import { AccountingDb } from "../../dataSources/accountingDb/accountingDb";
import { PaymentMethodDBRecord } from "../../dataSources/accountingDb/types";
import { categoryType } from "../category/categoryResolver";
import { EntryType } from "../../graphTypes";

export const validatePayMethodAndCategory = async ({
  category,
  paymentMethod,
  accountingDb,
  isRefund,
}: {
  category: ObjectId;
  paymentMethod: PaymentMethodDBRecord;
  accountingDb: AccountingDb;
  isRefund: boolean;
}) => {
  const entryType = await categoryType({
    category,
    accountingDb,
  });

  switch (paymentMethod.type) {
    // Valid for all entryTypes
    case "Cash":
    case "Combination":
    case "Online":
    case "Unknown":
      break;
    // Type dependent
    case "Check":
      if (paymentMethod.check.account) {
        if (entryType === "Credit") {
          throw new UserInputError(
            `"Category" of entry type "${EntryType.Credit}" and payment method "AccountCheck" are incompatible.`
          );
        }
      } else if (entryType === "Debit") {
        throw new UserInputError(
          `"Category" of entry type "${EntryType.Debit}" and payment method "PaymentCheck" are incompatible.`
        );
      }
      break;
    case "Card":
      if (paymentMethod.card instanceof ObjectId) {
        if (entryType === "Credit" && !isRefund) {
          throw new UserInputError(
            `"Category" of entry type "${EntryType.Credit}" and payment method "AccountCard" are incompatible.`
          );
        }
      } else if (entryType === "Debit" && !isRefund) {
        throw new UserInputError(
          `"Category" of entry type "${EntryType.Debit}" and payment method "PaymentCard" are incompatible.`
        );
      }
  }
};
