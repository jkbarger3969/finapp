import { ObjectId } from "mongodb";
import { AccountingDb } from "../../dataSources/accountingDb/accountingDb";
export declare const validateDepartment: {
    readonly exists: ({ department, accountingDb, }: {
        department: ObjectId;
        accountingDb: AccountingDb;
    }) => Promise<void>;
};
