import { UserInputError } from "apollo-server-core";
import { pascalCase } from "change-case";
import { ObjectId } from "mongodb";
import { AccountingDb } from "../../dataSources/accountingDb/accountingDb";
import {
  PaymentMethodCardDBRecord,
  PaymentMethodCheckDBRecord,
  PaymentMethodDBRecord,
  PaymentCardTypeDbRecord,
  PaymentMethodTypeOnlyDBRecord,
} from "../../dataSources/accountingDb/types";
import { PaymentMethodInput } from "../../graphTypes";

export const paymentMethodInputToDbRecord = async ({
  paymentMethodInput,
  validate,
}: {
  paymentMethodInput: PaymentMethodInput;
  validate?: AccountingDb;
}): Promise<PaymentMethodDBRecord> => {
  const [name] = Object.keys(paymentMethodInput) as [keyof PaymentMethodInput];

  switch (name) {
    case "accountCard": {
      const { currency, card: cardId } = paymentMethodInput[name];
      const card = new ObjectId(cardId);
      const payMethod: PaymentMethodCardDBRecord = {
        currency,
        type: "Card",
        card,
      };
      if (validate) {
        if (
          !(await validate.findOne({
            collection: "paymentCards",
            filter: { _id: card },
            options: {
              projection: {
                _id: true,
              },
            },
          }))
        ) {
          throw new UserInputError(
            `"AccountCard" id "${cardId}" does not exists.`
          );
        }
      }
      return payMethod;
    }
    case "accountCheck": {
      const {
        currency,
        check: { account: accountId, checkNumber },
      } = paymentMethodInput[name];
      const account = new ObjectId(accountId);

      const payMethod: PaymentMethodCheckDBRecord = {
        currency,
        type: "Check",
        check: {
          account,
          checkNumber,
        },
      };

      if (validate) {
        if (
          !(await validate.findOne({
            collection: "accounts",
            filter: { _id: account },
            options: {
              projection: {
                _id: true,
              },
            },
          }))
        ) {
          throw new UserInputError(
            `"Account" id "${accountId}" does not exists.`
          );
        }
      }

      return payMethod;
    }
    case "card": {
      const {
        currency,
        card: { trailingDigits, type },
      } = paymentMethodInput[name];
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
      } = paymentMethodInput[name];
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
      const { currency } = paymentMethodInput[name];
      const payMethod: PaymentMethodTypeOnlyDBRecord = {
        currency,
        type: pascalCase(name) as PaymentMethodTypeOnlyDBRecord["type"],
      };
      return payMethod;
    }
  }
};
