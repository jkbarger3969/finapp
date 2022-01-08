import { AccountingDb } from "../../dataSources/accountingDb/accountingDb";
import { BusinessDbRecord } from "../../dataSources/accountingDb/types";
import { NewBusiness } from "../../graphTypes";
export declare const addNewBusinessRecord: ({ newBusiness, accountingDb, }: {
    newBusiness: NewBusiness;
    accountingDb: AccountingDb;
}) => Promise<import("mongodb").InsertOneResult<BusinessDbRecord>>;
