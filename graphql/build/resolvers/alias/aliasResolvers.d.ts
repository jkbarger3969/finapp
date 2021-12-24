import { ObjectId } from "mongodb";
import { AliasResolvers, AliasTargetResolvers } from "../../graphTypes";
import { NodeDbRecord } from "../utils/queryUtils";
import { AliasTargetTypes } from "./utils";
export interface AliasDbRecord {
    _id: ObjectId;
    target: NodeDbRecord<AliasTargetTypes>;
    name: string;
    type: string;
}
export declare const AliasTarget: AliasTargetResolvers;
export declare const Alias: AliasResolvers<{
    dataSources: import("../../types").DataSources;
} & import("../../types").ContextBase, import("../../graphTypes").Omit<import("../../graphTypes").Alias, "target"> & {
    target: import("../../dataSources/accountingDb/types").DepartmentDbRecord | import("../../dataSources/accountingDb/types").CategoryDbRecord;
}>;
