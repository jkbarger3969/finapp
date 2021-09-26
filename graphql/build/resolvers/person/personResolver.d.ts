import { ObjectId } from "mongodb";
import { PersonResolvers } from "../../graphTypes";
export interface PersonDbRecord {
    _id: ObjectId;
    name: {
        first: string;
        last: string;
    };
}
export declare const Person: PersonResolvers<{
    dataSources: import("../../types").DataSources;
} & import("../../types").ContextBase, import("../../graphTypes").Person>;
