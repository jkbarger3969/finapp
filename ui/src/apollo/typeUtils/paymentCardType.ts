import { PaymentCardType } from "../graphTypes";

export const toString = function (cardType: PaymentCardType): string {
  switch (cardType) {
    case PaymentCardType.Visa:
      return "VISA";
    case PaymentCardType.MasterCard:
      return "MC";
    case PaymentCardType.AmericanExpress:
      return "AMEX";
    case PaymentCardType.Discover:
      return "DS";
  }
};
