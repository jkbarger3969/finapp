import { Db, FilterQuery } from "mongodb";
import { QueryResolvers, DepartmentsWhere } from "../../graphTypes";
export declare const whereDepartments: (deptWhere: DepartmentsWhere, db: Db) => Promise<FilterQuery<unknown>> | FilterQuery<unknown>;
export declare const departments: QueryResolvers["departments"];
export default departments;
