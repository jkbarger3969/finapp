/// <reference types="node" />
import { QueryResolvers, FiscalYearWhereInput as Where } from "../../graphTypes";
import { FieldAndConditionGenerator } from "../utils/filterQuery/filter";
import { Context } from "vm";
export declare const fieldAndCondGen: FieldAndConditionGenerator<Where, Context>;
declare const fiscalYears: QueryResolvers["fiscalYears"];
export default fiscalYears;
