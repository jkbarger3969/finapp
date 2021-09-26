import { FilterQuery } from "mongodb";
import { QueryResolvers, FiscalYearsWhere } from "../../graphTypes";
export declare const whereFiscalYear: (fiscalYearWhere: FiscalYearsWhere) => FilterQuery<unknown>;
export declare const fiscalYears: QueryResolvers["fiscalYears"];
