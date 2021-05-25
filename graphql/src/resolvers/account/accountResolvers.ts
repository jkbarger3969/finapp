import { ObjectId } from "mongodb";
import {
  Currency,
  AccountInterfaceResolvers,
  AccountCardResolvers,
  PaymentCardType,
  AccountWithCardsInterfaceResolvers,
  AccountCheckResolvers,
  AccountCreditCardResolvers,
  AccountCheckingResolvers,
} from "../../graphTypes";
import { Context } from "../../types";
import { snakeCase } from "snake-case";
import { PaymentCardTypeDbRecord } from "../paymentMethod";
import { EntityDbRecord, getEntity, getEntities } from "../entity";

export interface AccountCreditCardDbRecord {
  _id: ObjectId;
  accountType: "CreditCard";
  active: boolean;
  cards?: ObjectId[];
  currency: Currency;
  name: string;
  owner: EntityDbRecord;
}

export interface AccountCheckingDbRecord {
  _id: ObjectId;
  accountNumber: string;
  accountType: "Checking";
  active: boolean;
  cards?: ObjectId[];
  currency: Currency;
  name: string;
  owner: EntityDbRecord;
}

export type AccountDbRecord =
  | AccountCreditCardDbRecord
  | AccountCheckingDbRecord;

export interface AccountCardDbRecord {
  _id: ObjectId;
  account: ObjectId;
  active: boolean;
  authorizedUsers: EntityDbRecord[];
  trailingDigits: string;
  type: PaymentCardTypeDbRecord;
}

const AccountCardResolver: AccountCardResolvers<Context, AccountCardDbRecord> =
  {
    id: ({ _id }) => _id.toString(),
    account: ({ account }, _, { db }) =>
      db.collection("accounts").findOne({ _id: account }),
    active: async ({ account, active }, _, { db }) => {
      if (
        !active ||
        // If the linked account is NOT active all CARDS are NOT active.
        !(
          await db
            .collection<AccountDbRecord>("accounts")
            .findOne({ _id: account })
        ).active
      ) {
        return false;
      } else {
        return active;
      }
    },
    authorizedUsers: ({ authorizedUsers }, _, { db }) =>
      getEntities(authorizedUsers, db),
    type: ({ type }) => snakeCase(type).toUpperCase() as PaymentCardType,
  };

export const AccountCard =
  AccountCardResolver as unknown as AccountCardResolvers;

export interface AccountCheckDbRecord {
  account: ObjectId;
  checkNumber: string;
}

const AccountCheckResolver: AccountCheckResolvers<
  Context,
  AccountCheckDbRecord
> = {
  account: ({ account }, _, { db }) =>
    db.collection("accounts").findOne({ _id: account }),
};

export const AccountCheck =
  AccountCheckResolver as unknown as AccountCheckResolvers;

const AccountInterfaceResolver: AccountInterfaceResolvers<
  Context,
  AccountCreditCardDbRecord
> = {
  __resolveType: ({ accountType }) =>
    `Account${accountType}` as "AccountChecking" | "AccountCreditCard",
};

export const AccountInterface =
  AccountInterfaceResolver as unknown as AccountInterfaceResolvers;

const AccountWithCardsInterfaceResolver: AccountWithCardsInterfaceResolvers<
  Context,
  AccountDbRecord
> = {
  __resolveType: ({ accountType }) =>
    `Account${accountType}` as "AccountChecking" | "AccountCreditCard",
};

export const AccountWithCardsInterface =
  AccountWithCardsInterfaceResolver as unknown as AccountWithCardsInterfaceResolvers;

const AccountCreditCardResolver: AccountCreditCardResolvers<
  Context,
  AccountCreditCardDbRecord
> = {
  id: ({ _id }) => _id.toString(),
  cards: ({ cards }, _, { db }) =>
    cards
      ? db
          .collection("paymentCards")
          .find({ _id: { $in: cards } })
          .toArray()
      : [],
  owner: ({ owner }, _, { db }) => getEntity(owner, db),
};

export const AccountCreditCard =
  AccountCreditCardResolver as unknown as AccountCreditCardResolvers;

const AccountCheckingResolver: AccountCheckingResolvers<
  Context,
  AccountCheckingDbRecord
> = {
  id: ({ _id }) => _id.toString(),
  cards: ({ cards }, _, { db }) =>
    cards
      ? db
          .collection("paymentCards")
          .find({ _id: { $in: cards } })
          .toArray()
      : [],
  owner: ({ owner }, _, { db }) => getEntity(owner, db),
};

export const AccountChecking =
  AccountCheckingResolver as unknown as AccountCheckingResolvers;
