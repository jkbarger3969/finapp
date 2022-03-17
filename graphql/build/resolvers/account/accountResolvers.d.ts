import { ObjectId } from "mongodb";
import { Currency, AccountInterfaceResolvers, AccountCardResolvers, AccountWithCardsInterfaceResolvers, AccountCheckResolvers, AccountCreditCardResolvers, AccountCheckingResolvers } from "../../graphTypes";
import { PaymentCardTypeDbRecord } from "../paymentMethod";
import { EntityDbRecord } from "../entity";
export interface AccountCreditCardDbRecord {
    _id: ObjectId;
    accountType: "CreditCard";
    active: boolean;
    currency: Currency;
    name: string;
    owner: EntityDbRecord;
}
export interface AccountCheckingDbRecord {
    _id: ObjectId;
    accountNumber: string;
    accountType: "Checking";
    active: boolean;
    currency: Currency;
    name: string;
    owner: EntityDbRecord;
}
export declare type AccountDbRecord = AccountCreditCardDbRecord | AccountCheckingDbRecord;
export interface AccountCardDbRecord {
    _id: ObjectId;
    account: ObjectId;
    active: boolean;
    authorizedUsers: EntityDbRecord[];
    trailingDigits: string;
    type: PaymentCardTypeDbRecord;
}
export declare const AccountCard: AccountCardResolvers<{
    dataSources: import("../../types").DataSources;
} & import("../../types").ContextBase, import("../../dataSources/accountingDb/types").PaymentCardDbRecord>;
export interface AccountCheckDbRecord {
    account: ObjectId;
    checkNumber: string;
}
export declare const AccountCheck: AccountCheckResolvers<{
    dataSources: import("../../types").DataSources;
} & import("../../types").ContextBase, import("../../graphTypes").Omit<import("../../graphTypes").AccountCheck, "account"> & {
    account: import("../../dataSources/accountingDb/types").AccountDbRecord;
}>;
export declare const AccountInterface: AccountInterfaceResolvers<{
    dataSources: import("../../types").DataSources;
} & import("../../types").ContextBase, import("../../dataSources/accountingDb/types").AccountDbRecord>;
export declare const AccountWithCardsInterface: AccountWithCardsInterfaceResolvers<{
    dataSources: import("../../types").DataSources;
} & import("../../types").ContextBase, import("../../dataSources/accountingDb/types").AccountDbRecord>;
export declare const AccountCreditCard: AccountCreditCardResolvers<{
    dataSources: import("../../types").DataSources;
} & import("../../types").ContextBase, import("../../graphTypes").Omit<import("../../graphTypes").AccountCreditCard, "owner" | "cards"> & {
    cards: import("../../dataSources/accountingDb/types").PaymentCardDbRecord[];
    owner: import("../../dataSources/accountingDb/types").BusinessDbRecord | import("../../dataSources/accountingDb/types").DepartmentDbRecord | import("../../dataSources/accountingDb/types").PersonDbRecord;
}>;
export declare const AccountChecking: AccountCheckingResolvers<{
    dataSources: import("../../types").DataSources;
} & import("../../types").ContextBase, import("../../dataSources/accountingDb/types").AccountDbRecord>;
