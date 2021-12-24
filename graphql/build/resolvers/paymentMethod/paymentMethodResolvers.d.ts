import { ObjectId } from "mongodb";
import { Currency, PaymentCardInterfaceResolvers, PaymentCheckInterfaceResolvers, PaymentMethodInterfaceResolvers, PaymentMethodCardResolvers, PaymentCardResolvers } from "../../graphTypes";
export declare type PaymentCardTypeDbRecord = "Visa" | "MasterCard" | "AmericanExpress" | "Discover";
export interface PaymentMethodCardDBRecord {
    currency: Currency;
    card: ObjectId | {
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
export declare type PaymentMethodDBRecord = PaymentMethodCheckDBRecord | PaymentMethodCardDBRecord | {
    currency: Currency;
    type: "Unknown" | "Online" | "Cash" | "Combination";
};
export declare const PaymentCardInterface: PaymentCardInterfaceResolvers;
export declare const PaymentCard: PaymentCardResolvers;
export declare const PaymentCheckInterface: PaymentCheckInterfaceResolvers<{
    dataSources: import("../../types").DataSources;
} & import("../../types").ContextBase, import("../../graphTypes").AccountCheck | import("../../graphTypes").PaymentCheck>;
export declare const PaymentMethodInterface: PaymentMethodInterfaceResolvers<{
    dataSources: import("../../types").DataSources;
} & import("../../types").ContextBase, import("../../graphTypes").PaymentMethodCard | import("../../graphTypes").PaymentMethodCash | import("../../graphTypes").PaymentMethodCheck | import("../../graphTypes").PaymentMethodCombination | import("../../graphTypes").PaymentMethodOnline | import("../../graphTypes").PaymentMethodUnknown>;
export declare const PaymentMethodCard: PaymentMethodCardResolvers<{
    dataSources: import("../../types").DataSources;
} & import("../../types").ContextBase, import("../../graphTypes").PaymentMethodCard>;
