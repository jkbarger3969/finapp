import { ObjectId } from "mongodb";
import { AccountingDb } from "../../dataSources/accountingDb/accountingDb";
import { NewBusiness } from "../../graphTypes";
export declare const validateBusiness: {
    readonly exists: ({ business, accountingDb, }: {
        business: ObjectId;
        accountingDb: AccountingDb;
    }) => Promise<void>;
    readonly newBusiness: ({ newBusiness }: {
        newBusiness: NewBusiness;
    }) => Promise<void>;
};
