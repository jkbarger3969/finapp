import { Db } from "mongodb";
import { EntityResolvers } from "../../graphTypes";
import { NodeDbRecord } from "../utils/queryUtils";
export declare type EntityTypename = "Person" | "Business" | "Department";
export declare type EntityDbRecord = NodeDbRecord<EntityTypename>;
export declare const getEntity: (node: EntityDbRecord, db: Db) => Promise<any>;
export declare const getEntities: (nodes: EntityDbRecord[], db: Db) => Promise<any[]>;
export declare const Entity: EntityResolvers<{
    dataSources: import("../../types").DataSources;
} & import("../../types").ContextBase, import("../../graphTypes").Person | import("../../dataSources/accountingDb/types").BusinessDbRecord | import("../../dataSources/accountingDb/types").DepartmentDbRecord>;
