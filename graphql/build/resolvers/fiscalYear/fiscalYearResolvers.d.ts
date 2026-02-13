import { ObjectId } from "mongodb";
import { FiscalYearResolvers } from "../../graphTypes";
export interface FiscalYearDbRecord {
    _id: ObjectId;
    name: string;
    begin: Date;
    end: Date;
    archived?: boolean;
    archivedAt?: Date;
    archivedById?: ObjectId;
}
export declare const FiscalYear: FiscalYearResolvers<{
    dataSources: import("../../types").DataSources;
} & import("../../types").ContextBase, import("../../dataSources/accountingDb/types").FiscalYearDbRecord>;
