import { Db, ObjectId } from "mongodb";
import { AliasDbRecord } from "./aliasResolvers";
export declare type AliasTargetTypes = "Category" | "Department";
/**
 * @returns All aliases that apply to the target.  Both direct aliases and
 * inherited pre and post fixes.
 */
export declare const getAliases: (targetType: AliasTargetTypes, targetId: ObjectId, db: Db) => Promise<AliasDbRecord[]>;
