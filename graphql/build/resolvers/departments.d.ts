import { ObjectID, Db } from "mongodb";
import { QueryResolvers, DepartmentResolvers } from "../graphTypes";
export declare const departments: QueryResolvers["departments"];
export declare const department: QueryResolvers["department"];
export declare const getDescendants: (db: Db, id: ObjectID, projection?: object) => Promise<any[]>;
export declare const Department: DepartmentResolvers;
