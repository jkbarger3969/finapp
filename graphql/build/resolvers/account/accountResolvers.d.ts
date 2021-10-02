import { ObjectId } from "mongodb";
import { Currency, AccountInterfaceResolvers, AccountCardResolvers, AccountWithCardsInterfaceResolvers, AccountCheckResolvers, AccountCreditCardResolvers, AccountCheckingResolvers } from "../../graphTypes";
import { PaymentCardTypeDbRecord } from "../paymentMethod";
import { EntityDbRecord } from "../entity";
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
} & import("../../types").ContextBase, import("../../graphTypes").Omit<import("../../graphTypes").AccountCard, "authorizedUsers"> & {
    authorizedUsers: (import("../../dataSources/accountingDb/types").BusinessDbRecord | import("../../dataSources/accountingDb/types").DepartmentDbRecord | import("../../graphTypes").Person)[];
}>;
export interface AccountCheckDbRecord {
    account: ObjectId;
    checkNumber: string;
}
export declare const AccountCheck: AccountCheckResolvers<{
    dataSources: import("../../types").DataSources;
} & import("../../types").ContextBase, import("../../graphTypes").AccountCheck>;
export declare const AccountInterface: AccountInterfaceResolvers<{
    dataSources: import("../../types").DataSources;
} & import("../../types").ContextBase, (import("../../graphTypes").Omit<import("../../graphTypes").AccountChecking, "owner"> & {
    owner: import("../../dataSources/accountingDb/types").BusinessDbRecord | import("../../dataSources/accountingDb/types").DepartmentDbRecord | import("../../graphTypes").Person;
}) | (import("../../graphTypes").Omit<import("../../graphTypes").AccountCreditCard, "owner"> & {
    owner: import("../../dataSources/accountingDb/types").BusinessDbRecord | import("../../dataSources/accountingDb/types").DepartmentDbRecord | import("../../graphTypes").Person;
})>;
export declare const AccountWithCardsInterface: AccountWithCardsInterfaceResolvers<{
    dataSources: import("../../types").DataSources;
} & import("../../types").ContextBase, (import("../../graphTypes").Omit<import("../../graphTypes").AccountChecking, "owner"> & {
    owner: import("../../dataSources/accountingDb/types").BusinessDbRecord | import("../../dataSources/accountingDb/types").DepartmentDbRecord | import("../../graphTypes").Person;
}) | (import("../../graphTypes").Omit<import("../../graphTypes").AccountCreditCard, "owner"> & {
    owner: import("../../dataSources/accountingDb/types").BusinessDbRecord | import("../../dataSources/accountingDb/types").DepartmentDbRecord | import("../../graphTypes").Person;
})>;
export declare const AccountCreditCard: AccountCreditCardResolvers<{
    dataSources: import("../../types").DataSources;
} & import("../../types").ContextBase, import("../../graphTypes").Omit<import("../../graphTypes").AccountCreditCard, "owner"> & {
    owner: import("../../dataSources/accountingDb/types").BusinessDbRecord | import("../../dataSources/accountingDb/types").DepartmentDbRecord | import("../../graphTypes").Person;
}>;
export declare const AccountChecking: AccountCheckingResolvers<{
    dataSources: import("../../types").DataSources;
} & import("../../types").ContextBase, import("../../graphTypes").Omit<import("../../graphTypes").AccountChecking, "owner"> & {
    owner: import("../../dataSources/accountingDb/types").BusinessDbRecord | import("../../dataSources/accountingDb/types").DepartmentDbRecord | import("../../graphTypes").Person;
}>;
