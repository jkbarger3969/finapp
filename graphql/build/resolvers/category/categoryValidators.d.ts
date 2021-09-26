import { ObjectId } from "mongodb";
import { AccountingDb } from "../../dataSources/accountingDb/accountingDb";
export declare const validateCategory: {
    readonly exists: ({ category, accountingDb, }: {
        category: ObjectId;
        accountingDb: AccountingDb;
    }) => Promise<void>;
};
