import { Db, ObjectId } from "mongodb";
import { EntitiesWhere } from "../../graphTypes";
export interface WhereEntitiesResults {
    businesses?: ObjectId[];
    departments?: ObjectId[];
    people?: ObjectId[];
}
export declare const whereEntities: (entitiesWhere: EntitiesWhere, db: Db) => Promise<WhereEntitiesResults>;
