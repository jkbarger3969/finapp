export const addId = { $addFields: { id: { $toString: "$_id" } } } as const;
