import { ObjectId } from "mongodb";
import { AccountingDb } from "../../dataSources/accountingDb/accountingDb";
export declare const validatePaymentCard: {
    exists({ paymentCard, accountingDb, }: {
        paymentCard: ObjectId;
        accountingDb: AccountingDb;
    }): Promise<void>;
};
