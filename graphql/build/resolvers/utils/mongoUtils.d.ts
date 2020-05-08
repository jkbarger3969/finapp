import { Collection } from "mongodb";
export declare const mergeObjects: <T extends string>(fields: Iterable<T>) => readonly [{
    readonly $group: object;
}, {
    readonly $project: object;
}];
export declare const getUniqueId: (idField: string, collection: Collection<any>) => any;
