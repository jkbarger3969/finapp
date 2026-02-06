import { ObjectId } from "mongodb";
import {
  Currency,
  PaymentCardType,
  PaymentCardInterfaceResolvers,
  PaymentCheckInterfaceResolvers,
  PaymentMethodInterfaceResolvers,
  PaymentMethodCardResolvers,
  PaymentCardResolvers,
} from "../../graphTypes";
import { Context } from "../../types";
import { serializeGQLEnum } from "../utils/gqlEnums";
import { addTypename } from "../utils/queryUtils";

export type PaymentCardTypeDbRecord =
  | "Visa"
  | "MasterCard"
  | "AmericanExpress"
  | "Discover";

export interface PaymentMethodCardDBRecord {
  currency: Currency;
  card:
  | ObjectId
  | {
    trailingDigits: string;
    type: PaymentCardTypeDbRecord;
  };
  type: "Card";
}

export interface PaymentMethodCheckDBRecord {
  currency: Currency;
  check: {
    account?: ObjectId;
    checkNumber: string;
  };
  type: "Check";
}

export type PaymentMethodDBRecord =
  | PaymentMethodCheckDBRecord
  | PaymentMethodCardDBRecord
  | {
    currency: Currency;
    type: "Unknown" | "Online" | "Cash" | "Combination";
  };

// Payment Card
export const PaymentCardInterface: any = {
  __resolveType: (card: any) => ("account" in card ? "AccountCard" : "PaymentCard"),
  type: ({ type }: any) => serializeGQLEnum<PaymentCardType>(type),
};

export const PaymentCard: PaymentCardResolvers = PaymentCardInterface;

//  Payment Check
const PaymentCheckInterfaceResolver: PaymentCheckInterfaceResolvers<
  Context,
  PaymentMethodCheckDBRecord["check"]
> = {
  __resolveType: (doc) => ("account" in doc ? "AccountCheck" : "PaymentCheck"),
};

export const PaymentCheckInterface =
  PaymentCheckInterfaceResolver as unknown as PaymentCheckInterfaceResolvers;

// Payment Method
const PaymentMethodInterfaceResolver: PaymentMethodInterfaceResolvers<
  Context,
  PaymentMethodDBRecord
> = {
  __resolveType: ({ type }) =>
    `PaymentMethod${type}` as
    | "PaymentMethodCard"
    | "PaymentMethodCash"
    | "PaymentMethodCheck"
    | "PaymentMethodCombination"
    | "PaymentMethodOnline"
    | "PaymentMethodUnknown",
};

export const PaymentMethodInterface =
  PaymentMethodInterfaceResolver as unknown as PaymentMethodInterfaceResolvers;

const PaymentMethodCardResolver: PaymentMethodCardResolvers<
  Context,
  PaymentMethodCardDBRecord
> = {
  card: ({ card }, _, { db }) =>
    card instanceof ObjectId
      ? addTypename(
        "AccountCard",
        db.collection("paymentCards").findOne({ _id: card })
      )
      : ({ __typename: "PaymentCard", ...card } as any),
};

export const PaymentMethodCard =
  PaymentMethodCardResolver as unknown as PaymentMethodCardResolvers;
