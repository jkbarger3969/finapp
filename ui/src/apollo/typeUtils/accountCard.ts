import { DeepPartial } from "ts-essentials";
import { AccountCard } from "../graphTypes";
import { toString as toStringCardType } from "./paymentCardType";

export const toString = function (
  accountCard: DeepPartial<AccountCard>
): string {
  let str = "";

  if (accountCard.aliases?.length && accountCard.aliases[0]?.name) {
    str = accountCard.aliases[0]?.name;
  }

  if (accountCard.type !== undefined) {
    str = str
      ? `${str} ${toStringCardType(accountCard.type)}`
      : toStringCardType(accountCard.type);
  }

  if (accountCard.trailingDigits) {
    str = str
      ? `${str}-${accountCard.trailingDigits}`
      : accountCard.trailingDigits;
  }

  return str || JSON.stringify(accountCard);
};
