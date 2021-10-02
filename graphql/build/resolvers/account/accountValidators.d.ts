import { ObjectId } from "mongodb";
import { AccountingDb } from "../../dataSources/accountingDb/accountingDb";
export declare const validateAccount: {
    exists({ account, accountingDb, }: {
        account: ObjectId;
        accountingDb: AccountingDb;
    }): Promise<void>;
};
