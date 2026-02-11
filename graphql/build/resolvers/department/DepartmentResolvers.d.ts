import { BusinessDbRecord, DepartmentDbRecord } from "../../dataSources/accountingDb/types";
import { DepartmentResolvers, DepartmentAncestorResolvers } from "../../graphTypes";
export declare const DepartmentAncestor: DepartmentAncestorResolvers<{
    dataSources: import("../../types").DataSources;
} & import("../../types").ContextBase, DepartmentDbRecord | BusinessDbRecord>;
export declare const Department: DepartmentResolvers<{
    dataSources: import("../../types").DataSources;
} & import("../../types").ContextBase, DepartmentDbRecord>;
