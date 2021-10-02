import { AccountingDb } from "../../dataSources/accountingDb/accountingDb";
import { PersonDbRecord } from "../../dataSources/accountingDb/types";
import { NewPerson } from "../../graphTypes";
export declare const addNewPersonRecord: ({ newPerson, accountingDb, }: {
    newPerson: NewPerson;
    accountingDb: AccountingDb;
}) => Promise<import("mongodb").InsertOneWriteOpResult<import("mongodb").WithId<PersonDbRecord>>>;
