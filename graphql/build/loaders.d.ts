import DataLoader from "dataloader";
import { Db } from "mongodb";
import { DepartmentDbRecord, CategoryDbRecord, FiscalYearDbRecord, BusinessDbRecord, PersonDbRecord } from "./dataSources/accountingDb/types";
export interface Loaders {
    department: DataLoader<string, DepartmentDbRecord | null>;
    category: DataLoader<string, CategoryDbRecord | null>;
    fiscalYear: DataLoader<string, FiscalYearDbRecord | null>;
    business: DataLoader<string, BusinessDbRecord | null>;
    person: DataLoader<string, PersonDbRecord | null>;
    allFiscalYears: DataLoader<string, FiscalYearDbRecord[]>;
}
export declare const createLoaders: (db: Db) => Loaders;
