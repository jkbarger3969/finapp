import { UserInputError } from "apollo-server-core";
import { ObjectId } from "mongodb";

import { AccountingDb } from "../../dataSources/accountingDb/accountingDb";
import { UpsertPaymentMethod } from "../../graphTypes";
import { validateAccount } from "../account";
import { validatePaymentCard } from "../paymentCards";

export const validatePaymentMethod = new (class {
  async upsertPaymentMethod({
    upsertPaymentMethod,
    accountingDb,
  }: {
    upsertPaymentMethod: UpsertPaymentMethod;
    accountingDb?: AccountingDb;
  }) {
    const [field, ...restFields] = Object.keys(
      upsertPaymentMethod
    ) as (keyof UpsertPaymentMethod)[];

    if (!field) {
      throw new UserInputError(`"UpsertPaymentMethod" requires one field."`);
    } else if (restFields.length) {
      throw new UserInputError(
        `"UpsertPaymentMethod.${field}" is mutually exclusive to  ${restFields
          .map((field) => `"UpsertPaymentMethod.${field}"`)
          .join(", ")}.`
      );
    }

    switch (field) {
      case "accountCard":
        await validatePaymentCard.exists({
          paymentCard: new ObjectId(upsertPaymentMethod[field].card),
          accountingDb,
        });
        break;
      case "accountCheck":
        await validateAccount.exists({
          account: new ObjectId(upsertPaymentMethod[field].check.account),
          accountingDb,
        });
        break;
      case "card":
      case "cash":
      case "check":
      case "combination":
      case "online":
      case "unknown":
        break;
    }
  }
})();
