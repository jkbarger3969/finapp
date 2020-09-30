export declare const addId: {
    readonly $addFields: {
        readonly id: {
            readonly $toString: "$_id";
        };
    };
};
