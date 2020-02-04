import { O } from "ts-toolbelt";
declare const addFields: {
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
declare type addFields = O.Readonly<typeof addFields, keyof typeof addFields, "deep">;
declare const project: {
    $project: {
        parent: boolean;
        createdBy: boolean;
    };
};
declare type project = O.Readonly<typeof project, keyof typeof project, "deep">;
export { addFields, project };
