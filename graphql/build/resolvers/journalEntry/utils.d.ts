import { O } from "ts-toolbelt";
import { Collection, Db, ObjectID } from "mongodb";
import { JournalEntrySourceType } from "../../graphTypes";
export declare const addFields: {
    $addFields: {
        id: {
            $toString: string;
        };
        type: {
            $arrayElemAt: (string | number)[];
        };
        department: {
            $arrayElemAt: (string | number)[];
        };
        category: {
            $arrayElemAt: (string | number)[];
        };
        paymentMethod: {
            $arrayElemAt: (string | number)[];
        };
        total: {
            $arrayElemAt: (string | number)[];
        };
        source: {
            $arrayElemAt: (string | number)[];
        };
        reconciled: {
            $arrayElemAt: (string | number)[];
        };
        description: {
            $ifNull: {
                $arrayElemAt: (string | number)[];
            }[];
        };
        date: {
            $arrayElemAt: (string | number)[];
        };
        deleted: {
            $arrayElemAt: (string | number)[];
        };
    };
};
export declare type addFields = O.Readonly<typeof addFields, keyof typeof addFields, "deep">;
export declare type project = O.Readonly<typeof project, keyof typeof project, "deep">;
export declare const project: {
    $project: {
        parent: boolean;
        createdBy: boolean;
    };
};
export declare const getSrcCollectionAndNode: (db: Db, sourceType: JournalEntrySourceType, nodeMap: {
    id: Map<string, import("../../types").NodeInfo>;
    typename: Map<string, import("../../types").NodeInfo>;
}) => {
    collection: Collection<any>;
    node: ObjectID;
};
export declare const $addFields: {
    readonly id: {
        readonly $toString: "$_id";
    };
};
