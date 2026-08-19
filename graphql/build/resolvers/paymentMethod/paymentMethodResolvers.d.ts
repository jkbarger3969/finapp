import { ObjectId } from "mongodb";
import { Currency, PaymentCheckInterfaceResolvers, PaymentMethodInterfaceResolvers, PaymentMethodCardResolvers, PaymentCardResolvers } from "../../graphTypes";
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
export declare const PaymentCardInterface: any;
export declare const PaymentCard: PaymentCardResolvers;
export declare const PaymentCheckInterface: PaymentCheckInterfaceResolvers<{
    dataSources: import("../../types").DataSources;
} & import("../../types").ContextBase, import("../../graphTypes").PaymentCheck | (import("../../graphTypes").Omit<import("../../graphTypes").AccountCheck, "account"> & {
    account: import("../../dataSources/accountingDb/types").AccountDbRecord;
})>;
export declare const PaymentMethodInterface: PaymentMethodInterfaceResolvers<{
    dataSources: import("../../types").DataSources;
} & import("../../types").ContextBase, import("../../graphTypes").PaymentMethodCash | import("../../graphTypes").PaymentMethodCombination | import("../../graphTypes").PaymentMethodOnline | import("../../graphTypes").PaymentMethodUnknown | (import("../../graphTypes").Omit<import("../../graphTypes").PaymentMethodCard, "card"> & {
    card: import("../../dataSources/accountingDb/types").PaymentCardDbRecord | import("../../graphTypes").PaymentCard;
}) | (import("../../graphTypes").Omit<import("../../graphTypes").PaymentMethodCheck, "check"> & {
    check: import("../../graphTypes").PaymentCheck | (import("../../graphTypes").Omit<import("../../graphTypes").AccountCheck, "account"> & {
        account: import("../../dataSources/accountingDb/types").AccountDbRecord;
    });
})>;
export declare const PaymentMethodCard: PaymentMethodCardResolvers<{
    dataSources: import("../../types").DataSources;
} & import("../../types").ContextBase, import("../../graphTypes").Omit<import("../../graphTypes").PaymentMethodCard, "card"> & {
    card: import("../../dataSources/accountingDb/types").PaymentCardDbRecord | import("../../graphTypes").PaymentCard;
}>;
