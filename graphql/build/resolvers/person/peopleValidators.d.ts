import { ObjectId } from "mongodb";
import { AccountingDb } from "../../dataSources/accountingDb/accountingDb";
import { NewPerson } from "../../graphTypes";
export declare const validatePerson: {
    readonly exists: ({ person, accountingDb, }: {
        person: ObjectId;
        accountingDb: AccountingDb;
    }) => Promise<void>;
    readonly newPerson: ({ newPerson }: {
        newPerson: NewPerson;
    }) => void;
};
