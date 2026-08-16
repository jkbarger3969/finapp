import { Db } from "mongodb";
import { BusinessDbRecord, DepartmentDbRecord } from "../../dataSources/accountingDb/types";
import { EntityResolvers } from "../../graphTypes";
import { PersonDbRecord } from "../person";
import { NodeDbRecord } from "../utils/queryUtils";
export declare type EntityTypename = "Person" | "Business" | "Department";
export declare type EntityDbRecord = NodeDbRecord<EntityTypename>;
export declare const getEntity: (node: EntityDbRecord, db: Db) => Promise<Pick<BusinessDbRecord, "name" | "budget" | "vendor"> & {
    _id: import("bson").ObjectID;
} & {
    __typename: "Business";
}> | Promise<Pick<DepartmentDbRecord, "name" | "code" | "parent" | "disable" | "virtualRoot"> & {
    _id: import("bson").ObjectID;
} & {
    __typename: "Department";
}> | Promise<Pick<PersonDbRecord, "name" | "email" | "phone"> & {
    _id: import("bson").ObjectID;
} & {
    __typename: "Person";
}>;
export declare const getEntities: (nodes: EntityDbRecord[], db: Db) => Promise<((Pick<BusinessDbRecord, "name" | "budget" | "vendor"> & {
    _id: import("bson").ObjectID;
} & {
    __typename: "Business";
}) | (Pick<DepartmentDbRecord, "name" | "code" | "parent" | "disable" | "virtualRoot"> & {
    _id: import("bson").ObjectID;
} & {
    __typename: "Department";
}) | (Pick<PersonDbRecord, "name" | "email" | "phone"> & {
    _id: import("bson").ObjectID;
} & {
    __typename: "Person";
}))[]>;
export declare const Entity: EntityResolvers<{
    dataSources: import("../../types").DataSources;
} & import("../../types").ContextBase, BusinessDbRecord | DepartmentDbRecord | import("../../dataSources/accountingDb/types").PersonDbRecord>;
