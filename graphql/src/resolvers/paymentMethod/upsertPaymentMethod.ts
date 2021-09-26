import { UserInputError } from "apollo-server-core";
import { pascalCase } from "change-case";
import { ObjectId } from "mongodb";
import {
  PaymentMethodCardDBRecord,
  PaymentMethodCheckDBRecord,
  PaymentMethodDBRecord,
  PaymentCardTypeDbRecord,
  PaymentMethodTypeOnlyDBRecord,
} from "../../dataSources/accountingDb/types";
import { UpsertPaymentMethod } from "../../graphTypes";

export const upsertPaymentMethodToDbRecord = ({
  upsertPaymentMethod,
}: {
  upsertPaymentMethod: UpsertPaymentMethod;
}): PaymentMethodDBRecord => {
  const [field] = Object.keys(upsertPaymentMethod) as [
    keyof UpsertPaymentMethod
  ];

  switch (field) {
    case "accountCard": {
      const { currency, card: cardId } = upsertPaymentMethod[field];
      const card = new ObjectId(cardId);
      const payMethod: PaymentMethodCardDBRecord = {
        currency,
        type: "Card",
        card,
      };
      return payMethod;
    }
    case "accountCheck": {
      const {
        currency,
        check: { account: accountId, checkNumber },
      } = upsertPaymentMethod[field];
      const account = new ObjectId(accountId);

      const payMethod: PaymentMethodCheckDBRecord = {
        currency,
        type: "Check",
        check: {
          account,
          checkNumber,
        },
      };

      return payMethod;
    }
    case "card": {
      const {
        currency,
        card: { trailingDigits, type },
      } = upsertPaymentMethod[field];
      const payMethod: PaymentMethodCardDBRecord = {
        currency,
        type: "Card",
        card: {
          trailingDigits,
          type: pascalCase(type) as PaymentCardTypeDbRecord,
        },
      };

      return payMethod;
    }
    case "check": {
      const {
        currency,
        check: { checkNumber },
      } = upsertPaymentMethod[field];
      const payMethod: PaymentMethodCheckDBRecord = {
        currency,
        type: "Check",
        check: {
          checkNumber,
        },
      };

      return payMethod;
    }

    case "cash":
    case "combination":
    case "online":
    case "unknown": {
      const { currency } = upsertPaymentMethod[field];
      const payMethod: PaymentMethodTypeOnlyDBRecord = {
        currency,
        type: pascalCase(field) as PaymentMethodTypeOnlyDBRecord["type"],
      };
      return payMethod;
    }
  }
};
