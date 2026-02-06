import { Filter, ObjectId } from "mongodb";
import { AliasTypeDbRecord } from "../../dataSources/accountingDb/types";
import { AliasesWhere } from "../../graphTypes";
export declare const whereAliases: (instanceId: ObjectId, type: string, where: AliasesWhere) => Filter<AliasTypeDbRecord>;
export declare const getAliasableResolvers: (type: string) => any;
