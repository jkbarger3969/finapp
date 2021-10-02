import { ObjectId } from "mongodb";
import { AccountingDb } from "../../dataSources/accountingDb/accountingDb";
export declare const validateCategory: {
    exists({ category, accountingDb, }: {
        category: ObjectId;
        accountingDb: AccountingDb;
    }): Promise<void>;
    isNotRoot({ category, accountingDb, }: {
        category: ObjectId;
        accountingDb: AccountingDb;
    }): Promise<void>;
};
